from django.db import models
from django.conf import settings
from decimal import Decimal


class Payment(models.Model):
    class Method(models.TextChoices):
        MTN = 'mtn', 'MTN Mobile Money'
        ORANGE = 'orange', 'Orange Money'
        SENBID = 'senbid', 'SenBid'
        PAYBID = 'paybid', 'PayBid'
        PAYPAL = 'paypal', 'PayPal'
        STRIPE = 'stripe', 'Stripe (Carte)'
        WALLET = 'wallet', 'Solde AutoLink'

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        COMPLETED = 'completed', 'Confirmé'
        FAILED = 'failed', 'Échoué'
        REFUNDED = 'refunded', 'Remboursé'

    class Escrow(models.TextChoices):
        HELD = 'held', 'Caution bloquée'
        RELEASED = 'released', 'Caution libérée (propriétaire payé)'
        REFUNDED = 'refunded', 'Caution remboursée au client'
        DISPUTED = 'disputed', 'Caution gelée (litige)'

    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='payment')
    payer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission = models.DecimalField(max_digits=12, decimal_places=2)
    owner_payout = models.DecimalField(max_digits=12, decimal_places=2)
    escrow_status = models.CharField(max_length=20, choices=Escrow.choices, default=Escrow.HELD)
    transaction_ref = models.CharField(max_length=200, blank=True)
    provider_ref = models.CharField(max_length=200, blank=True)
    provider_status = models.CharField(max_length=100, blank=True)
    provider_token = models.CharField(max_length=500, blank=True)
    provider_pay_token = models.CharField(max_length=500, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    payout_done = models.BooleanField(default=False)
    payout_at = models.DateTimeField(null=True, blank=True)

    # Caution de garantie CLIENT (dommages/pannes) — distincte du séquestre
    # propriétaire ci-dessus : bloquée à la réservation, rendue à la fin,
    # versée au propriétaire si le litige est tranché en sa faveur.
    deposit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deposit_status = models.CharField(
        max_length=20, default='held',
        choices=[('held', 'Caution bloquée'), ('released', 'Caution rendue au client'),
                 ('forfeited', 'Caution versée au propriétaire')])

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-created_at']

    def __str__(self):
        return f'PAY-{self.pk:04d} — {self.amount} FCFA ({self.status})'

    def release_escrow(self):
        """Fin de location sans litige : verse sa part (85 %) au propriétaire."""
        from django.utils import timezone
        from django.db import transaction as db_transaction
        if self.escrow_status != self.Escrow.HELD:
            return
        with db_transaction.atomic():
            owner = self.booking.vehicle.owner
            owner.balance = (owner.balance or 0) + self.owner_payout
            owner.save(update_fields=['balance', 'updated_at'])
            WalletTransaction.objects.create(
                user=owner, kind='topup', amount=self.owner_payout,
                balance_after=owner.balance,
                reference=f'PAYOUT-{self.pk:04d}',
                note=f'Part location {self.booking} (caution libérée)',
            )
            Payout.objects.create(
                payment=self, recipient=owner, amount=self.owner_payout,
                method='wallet', status='completed', processed_at=timezone.now(),
            )
            self.escrow_status = self.Escrow.RELEASED
            self.payout_done = True
            self.payout_at = timezone.now()
            self.save(update_fields=['escrow_status', 'payout_done', 'payout_at'])
            self.booking.vehicle.total_earned = (self.booking.vehicle.total_earned or 0) + self.owner_payout
            self.booking.vehicle.save(update_fields=['total_earned', 'updated_at'])

    def refund_client(self):
        """Litige/annulation en faveur du client : location + caution remboursées."""
        if self.escrow_status not in (self.Escrow.HELD, self.Escrow.DISPUTED):
            return
        client = self.booking.client
        total = self.amount + (self.deposit_amount or 0)
        client.balance = (client.balance or 0) + total
        client.save(update_fields=['balance', 'updated_at'])
        WalletTransaction.objects.create(
            user=client, kind='refund', amount=total,
            balance_after=client.balance,
            reference=f'REFUND-{self.pk:04d}',
            note=f'Remboursement {self.booking} (location + caution)',
        )
        self.escrow_status = self.Escrow.REFUNDED
        self.deposit_status = 'released'
        self.status = self.Status.REFUNDED
        self.save(update_fields=['escrow_status', 'deposit_status', 'status'])

    def release_deposit(self):
        """Fin normale de location : la caution client est débloquée."""
        from django.utils import timezone
        if self.deposit_status != 'held' or not self.deposit_amount:
            return
        client = self.booking.client
        client.balance = (client.balance or 0) + self.deposit_amount
        client.save(update_fields=['balance', 'updated_at'])
        WalletTransaction.objects.create(
            user=client, kind='refund', amount=self.deposit_amount,
            balance_after=client.balance,
            reference=f'DEPOSIT-{self.pk:04d}',
            note=f'Caution rendue — {self.booking}',
        )
        self.deposit_status = 'released'
        self.save(update_fields=['deposit_status'])

    def forfeit_deposit(self):
        """Litige tranché en faveur du propriétaire : la caution lui est versée."""
        from django.utils import timezone
        if self.deposit_status != 'held' or not self.deposit_amount:
            return
        owner = self.booking.vehicle.owner
        owner.balance = (owner.balance or 0) + self.deposit_amount
        owner.save(update_fields=['balance', 'updated_at'])
        WalletTransaction.objects.create(
            user=owner, kind='topup', amount=self.deposit_amount,
            balance_after=owner.balance,
            reference=f'DEPOSIT-{self.pk:04d}',
            note=f'Caution retenue (litige) — {self.booking}',
        )
        self.deposit_status = 'forfeited'
        self.save(update_fields=['deposit_status'])


class Payout(models.Model):
    """Reversement de la part propriétaire/chauffeur."""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='payouts')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=Payment.Method.choices)
    status = models.CharField(max_length=20, choices=Payment.Status.choices, default=Payment.Status.PENDING)
    transaction_ref = models.CharField(max_length=200, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Versement'
        verbose_name_plural = 'Versements'

    def __str__(self):
        return f'PAYOUT-{self.pk:04d} — {self.amount} FCFA → {self.recipient}'


class WalletTransaction(models.Model):
    """Recharge / débit du solde AutoLink d'un utilisateur."""

    class Kind(models.TextChoices):
        TOPUP = 'topup', 'Rechargement'
        DEBIT = 'debit', 'Débit (paiement)'
        REFUND = 'refund', 'Remboursement'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet_transactions')
    kind = models.CharField(max_length=10, choices=Kind.choices)
    method = models.CharField(max_length=20, choices=Payment.Method.choices, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=100, blank=True)
    # Suivi des recharges externes (Stripe/PayPal) : pending jusqu'à capture
    status = models.CharField(
        max_length=20, default='completed',
        choices=[('pending', 'En attente'), ('completed', 'Confirmée'), ('failed', 'Échouée')])
    provider_ref = models.CharField(max_length=200, blank=True,
                                    help_text='ID session Stripe / commande PayPal')
    provider_status = models.CharField(max_length=100, blank=True)
    provider_token = models.CharField(max_length=500, blank=True)
    provider_pay_token = models.CharField(max_length=500, blank=True)
    note = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Transaction portefeuille'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.kind.upper()} {self.amount} F — {self.user}'


class WithdrawalRequest(models.Model):
    """Demande de retrait du solde (propriétaire / chauffeur) vers Mobile Money.

    Le montant est réservé (débité du solde) dès la demande ; un refus admin le
    recrédite, une validation marque le virement comme effectué.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        PAID = 'paid', 'Virement effectué'
        REJECTED = 'rejected', 'Refusée'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='withdrawals')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=[
        ('mtn', 'MTN Mobile Money'), ('orange', 'Orange Money'), ('card', 'Carte bancaire')])
    phone = models.CharField(max_length=30)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reference = models.CharField(max_length=40, unique=True)
    admin_note = models.CharField(max_length=255, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='processed_withdrawals')
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Demande de retrait'
        verbose_name_plural = 'Demandes de retrait'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reference} — {self.amount} F ({self.status})'
