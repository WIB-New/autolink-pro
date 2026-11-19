from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import Count, Sum
from django.utils.text import slugify


class Agent(models.Model):
    code = models.CharField(max_length=30, unique=True, blank=True)
    name = models.CharField(max_length=150)
    agent_type = models.CharField(max_length=60, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=80)
    commission_rate = models.DecimalField(
        max_digits=5, decimal_places=4, default=Decimal('0.05'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1'))],
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.code:
            # 12 caractères max, aligné sur les codes parrainage (ALP-XXXXXXXX)
            # — ville tronquée à 4 lettres : AGT-DOUA-001.
            city_code = (slugify(self.city).replace('-', '').upper() or 'CITY')[:4]
            prefix = f'AGT-{city_code}-'
            number = Agent.objects.filter(code__startswith=prefix).count() + 1
            while Agent.objects.filter(code=f'{prefix}{number:03d}').exists():
                number += 1
            self.code = f'{prefix}{number:03d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} ({self.code})'

    @property
    def completed_bookings(self):
        return self.referrals.filter(
            referred_user__bookings__status='completed',
        ).values('referred_user__bookings').distinct().count()

    @property
    def generated_revenue(self):
        from apps.bookings.models import Booking
        return Booking.objects.filter(
            client__agent_referral__agent=self,
            status='completed',
        ).aggregate(total=Sum('subtotal'))['total'] or Decimal('0.00')

    @property
    def commission_earned(self):
        return (self.generated_revenue * self.commission_rate).quantize(Decimal('0.01'))

    @property
    def payouts_total(self):
        return self.payouts.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    @property
    def commission_due(self):
        return max(Decimal('0.00'), self.commission_earned - self.payouts_total)


class AgentReferral(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='referrals')
    referred_user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agent_referral')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class AgentPayout(models.Model):
    agent = models.ForeignKey(Agent, on_delete=models.PROTECT, related_name='payouts')
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    note = models.TextField(blank=True)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='agent_payouts')
    paid_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-paid_at']
