from django.db import models
from django.db import transaction
from django.db.models import F
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
from datetime import datetime
from math import ceil


COMMISSION_RATE = Decimal(str(getattr(settings, 'COMMISSION_RATE', 0.15)))


def commission_rate():
    """Taux de commission AutoLink (paramétrable par l'admin, 50 % par défaut)."""
    from apps.users.models import PlatformSettings
    return Decimal(str(PlatformSettings.current().commission_rate or COMMISSION_RATE))


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
    driver_response = models.CharField(
        max_length=20,
        choices=[('not_applicable', 'Sans objet'), ('offered', 'Proposée'),
                 ('accepted', 'Acceptée'), ('refused', 'Refusée')],
        default='not_applicable',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    driver_type = models.CharField(max_length=20, choices=DriverType.choices, default=DriverType.NONE)
    # Réponse du propriétaire à une nouvelle demande (écran « Demandes de location »).
    # Un refus annule la réservation et rembourse intégralement le client.
    owner_response = models.CharField(
        max_length=20, default='pending',
        choices=[('pending', 'En attente'), ('accepted', 'Acceptée'), ('refused', 'Refusée')])
    owner_responded_at = models.DateTimeField(null=True, blank=True)

    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    delivery_requested = models.BooleanField(default=False)
    driver_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    debit_authorized_at = models.DateTimeField(null=True, blank=True)
    terms_version = models.CharField(max_length=30, blank=True)
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

    def calculate_price(self):
        timed = self.start_time is not None and self.end_time is not None
        if self.start_date and self.end_date:
            duration = (datetime.combine(self.end_date, self.end_time) - datetime.combine(self.start_date, self.start_time)).total_seconds() if timed else (self.end_date - self.start_date).days * 86400
            self.days = max(1, ceil(duration / 86400))
        # Tarification dynamique : dégressivité longue durée
        self.discount_percent = 0 if timed else 10 if self.days >= 30 else 5 if self.days > 3 else 0
        gross = self.daily_rate * self.days
        self.driver_fee = Decimal('10000') * self.days if timed and self.driver_type != self.DriverType.NONE else Decimal('0')
        self.delivery_fee = Decimal('5000') if timed and self.delivery_requested else Decimal('0')
        self.subtotal = (gross * Decimal(100 - self.discount_percent) / 100 + self.driver_fee + self.delivery_fee).quantize(Decimal('0.01'))
        self.commission_amount = (self.subtotal * commission_rate()).quantize(Decimal('0.01'))
        self.owner_amount = self.subtotal - self.commission_amount

    def save(self, *args, **kwargs):
        self.calculate_price()
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
        with transaction.atomic():
            booking = Booking.objects.select_for_update().select_related(
                'vehicle', 'client', 'vehicle__owner',
            ).get(pk=self.pk)
            if booking.status == 'cancelled':
                return
            if booking.status != 'completed':
                booking.status = self.Status.COMPLETED
                booking.save(update_fields=['status', 'updated_at'])
                booking.sync_vehicle_status()
                booking._release_escrow()
                booking._release_deposit()
                booking._notify_end()
            booking._record_driver_earning()
            self.status = booking.status
            self.updated_at = booking.updated_at

    def _record_driver_earning(self):
        if not self.driver_id:
            return
        from apps.drivers.models import DriverEarning, DriverProfile

        amount = (self.subtotal * Decimal(str(settings.DRIVER_SHARE_RATE))).quantize(Decimal('0.01'))
        DriverProfile.objects.get_or_create(driver_id=self.driver_id)
        profile = DriverProfile.objects.select_for_update().get(driver_id=self.driver_id)
        _, created = DriverEarning.objects.get_or_create(
            booking_id=self.pk,
            defaults={'driver_id': self.driver_id, 'amount': amount},
        )
        if created:
            DriverProfile.objects.filter(pk=profile.pk).update(
                total_earned=F('total_earned') + amount,
                total_trips=F('total_trips') + 1,
            )

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
