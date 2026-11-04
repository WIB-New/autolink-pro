from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal


COMMISSION_RATE = Decimal(str(getattr(settings, 'COMMISSION_RATE', 0.15)))


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente de paiement'
        CONFIRMED = 'confirmed', 'Confirmé'
        ACTIVE = 'active', 'En cours'
        COMPLETED = 'completed', 'Terminé'
        CANCELLED = 'cancelled', 'Annulé'
        DISPUTED = 'disputed', 'Litige'

    class DriverType(models.TextChoices):
        NONE = 'none', 'Sans chauffeur'
        INTERNAL = 'internal', 'Chauffeur AutoLink'
        OWNER = 'owner', 'Chauffeur du propriétaire'

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='bookings')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.PROTECT, related_name='bookings')
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='driven_bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    driver_type = models.CharField(max_length=20, choices=DriverType.choices, default=DriverType.NONE)

    start_date = models.DateField()
    end_date = models.DateField()
    pickup_address = models.TextField(blank=True)
    dropoff_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    days = models.IntegerField(validators=[MinValueValidator(1)])
    discount_percent = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(50)],
        help_text='Dégressivité longue durée : -5 % dès 7 jours, -10 % dès 30 jours.')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2)
    owner_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deposit_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text='Caution de garantie bloquée chez le client pendant la location.')

    dispute_reason = models.TextField(blank=True)
    dispute_opened_at = models.DateTimeField(null=True, blank=True)

    client_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    client_review = models.TextField(blank=True)
    driver_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-created_at']

    def __str__(self):
        return f'BK-{self.pk:04d} — {self.client} / {self.vehicle}'

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            self.days = (self.end_date - self.start_date).days or 1
        # Tarification dynamique : dégressivité longue durée
        self.discount_percent = 10 if self.days >= 30 else 5 if self.days >= 7 else 0
        gross = self.daily_rate * self.days
        self.subtotal = (gross * Decimal(100 - self.discount_percent) / 100).quantize(Decimal('0.01'))
        self.commission_amount = (self.subtotal * COMMISSION_RATE).quantize(Decimal('0.01'))
        self.owner_amount = self.subtotal - self.commission_amount
        super().save(*args, **kwargs)

    def sync_vehicle_status(self):
        """Met à jour le statut du véhicule selon le statut de la réservation."""
        vehicle = self.vehicle
        if self.status in ('confirmed', 'active'):
            if vehicle.status == 'approved' and self.start_date <= timezone.now().date():
                vehicle.status = 'rented'
                vehicle.save(update_fields=['status', 'updated_at'])
        elif self.status in ('completed', 'cancelled'):
            if vehicle.status in ('rented', 'maintenance'):
                vehicle.status = 'approved'
                vehicle.save(update_fields=['status', 'updated_at'])

    def finish(self):
        """Termine la location : véhicule libéré + caution versée au propriétaire."""
        if self.status in ('completed', 'cancelled'):
            return
        self.status = self.Status.COMPLETED
        self.save(update_fields=['status', 'updated_at'])
        self.sync_vehicle_status()
        self._release_escrow()
        self._release_deposit()
        self._notify_end()

    def _release_escrow(self):
        """Libère le séquestre : le propriétaire reçoit sa part (85 %)."""
        try:
            payment = self.payment
        except Exception:
            return
        if payment.escrow_status != 'held':
            return
        payment.release_escrow()

    def _release_deposit(self):
        """Fin normale de location : la caution client est débloquée."""
        try:
            self.payment.release_deposit()
        except Exception:
            pass

    def _notify_end(self):
        from apps.users.models import Notification
        Notification.objects.create(
            user=self.vehicle.owner,
            title='Location terminée',
            message=f'La location de votre véhicule {self.vehicle} par {self.client.get_full_name()} est terminée. Votre part de {self.owner_amount} FCFA a été versée sur votre solde.',
        )
        Notification.objects.create(
            user=self.client,
            title='Location terminée',
            message=f'Votre location du véhicule {self.vehicle} est terminée. Merci d\'avoir utilisé AutoLink.',
        )

    @classmethod
    def auto_complete_expired(cls):
        """Termine automatiquement les locations dont la date de fin est passée."""
        today = timezone.now().date()
        expired = cls.objects.filter(
            status__in=('confirmed', 'active'),
            end_date__lt=today,
        ).select_related('vehicle', 'client', 'vehicle__owner')
        for booking in expired:
            booking.finish()
