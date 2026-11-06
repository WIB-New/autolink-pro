from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENT = 'CLIENT', 'Client'
        OWNER = 'OWNER', 'Propriétaire'
        DRIVER = 'DRIVER', 'Chauffeur'
        ADMIN = 'ADMIN', 'Administrateur'
        CONTROLLER = 'CONTROLLER', 'Contrôleur'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    payment_method = models.CharField(
        max_length=10, blank=True,
        choices=(('mtn', 'MTN MoMo'), ('orange', 'Orange Money'), ('card', 'Carte bancaire')),
    )
    payment_phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    newsletter_opt_in = models.BooleanField(default=True)
    language = models.CharField(
        max_length=2,
        choices=(('fr', 'Français'), ('en', 'English')),
        default='fr',
    )
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    id_document = models.FileField(upload_to='kyc/', null=True, blank=True)
    id_document_verified = models.BooleanField(default=False)
    address_proof = models.FileField(upload_to='kyc/', null=True, blank=True)
    insurance = models.FileField(upload_to='kyc/', null=True, blank=True)
    driving_license = models.FileField(upload_to='kyc/', null=True, blank=True)
    driving_license_expires_at = models.DateField(null=True, blank=True)
    kyc_status = models.CharField(
        max_length=20, default='none',
        choices=[('none', 'Aucun document'), ('pending', 'En vérification'),
                 ('approved', 'Validé'), ('rejected', 'Refusé')])
    kyc_note = models.CharField(max_length=255, blank=True)
    kyc_submitted_at = models.DateTimeField(null=True, blank=True)
    city = models.CharField(max_length=80, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    referral_code = models.CharField(max_length=20, blank=True, default='')
    referred_by = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals')
    referral_credits = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notif_prefs = models.JSONField(default=dict, blank=True)  # sms, whatsapp, email, push, twofa
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'


class PlatformSettings(models.Model):
    """Paramètres de la plateforme modifiables par l'admin (singleton)."""
    commission_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.50)
    min_withdrawal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=5000)
    contact_email = models.EmailField(blank=True)
    phones = models.CharField(max_length=255, default='+237 656 789 000, +237 699 456 000')
    addresses = models.CharField(max_length=255, default='Akwa, Rue Joss, Douala | Centre-ville, Yaoundé')
    maintenance_mode = models.BooleanField(default=False)
    bookings_enabled = models.BooleanField(default=True)
    owner_response_hours = models.PositiveIntegerField(default=24)
    cancel_deposit_keep_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=10,
        help_text="% de la caution conservé par AutoLink en cas d'annulation client avant le début de la location.")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Paramètres plateforme'
        verbose_name_plural = 'Paramètres plateforme'

    def __str__(self):
        return 'Paramètres plateforme'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def current(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ContactMessage(models.Model):
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    rental_type = models.CharField(max_length=120, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_handled = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'

    def __str__(self):
        return f'{self.first_name} {self.last_name} — {self.created_at:%Y-%m-%d}'


class NewsletterCampaign(models.Model):
    subject = models.CharField(max_length=200)
    body = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)
    recipients_count = models.PositiveIntegerField(default=0)
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='newsletter_campaigns',
    )

    class Meta:
        ordering = ['-sent_at']
        verbose_name = 'Campagne newsletter'
        verbose_name_plural = 'Campagnes newsletter'

    def __str__(self):
        return self.subject


class Notification(models.Model):
    """Notification interne — propriétaire notifié d'une réservation, fin de location, litige…"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    kind = models.CharField(max_length=30, default='general')
    link = models.CharField(max_length=255, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} → {self.user}'


class LoginCode(models.Model):
    """Code OTP de connexion envoyé par email (connexion sans mot de passe)."""
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    first_name = models.CharField(max_length=80, blank=True)
    last_name = models.CharField(max_length=80, blank=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Code de connexion'
        ordering = ['-created_at']

    def __str__(self):
        return f'OTP {self.email} ({self.code})'


class Agent(models.Model):
    """Agent de parrainage — code promo + commission sur les locations générées."""
    class AgentType(models.TextChoices):
        INFLUENCER = 'Influenceur', 'Influenceur'
        COMMERCIAL = 'Commercial', 'Commercial'
        HOTEL = 'Hôtel partenaire', 'Hôtel partenaire'
        DRIVER = 'Chauffeur partenaire', 'Chauffeur partenaire'

    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=120)
    type = models.CharField(max_length=30, choices=AgentType.choices, default=AgentType.INFLUENCER)
    phone = models.CharField(max_length=20)
    rate = models.PositiveSmallIntegerField(default=5, help_text='Commission en %')
    active = models.BooleanField(default=True)
    conversions = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    commission = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.code} — {self.name}'


class Offer(models.Model):
    """Offres promotionnelles actives affichées dans l'espace parrainage."""
    title = models.CharField(max_length=120)
    description = models.CharField(max_length=300, blank=True)
    code = models.CharField(max_length=30)
    terms = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Offre'
        ordering = ['title']

    def __str__(self):
        return f'{self.title} ({self.code})'


class UserDocument(models.Model):
    """Documents supplémentaires déposés par l'utilisateur depuis son profil."""
    class DocType(models.TextChoices):
        ID = 'id', "Pièce d'identité"
        LICENSE = 'license', 'Permis de conduire'
        ADDRESS = 'address', 'Justificatif de domicile'
        INSURANCE = 'insurance', 'Assurance'
        OTHER = 'other', 'Autre'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='extra_documents')
    name = models.CharField(max_length=200)
    doc_type = models.CharField(max_length=20, choices=DocType.choices, default=DocType.OTHER)
    issued_place = models.CharField(max_length=200, blank=True)
    validity = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to='docs/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Document utilisateur'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.user.username})'


class UserSession(models.Model):
    """Session JWT (refresh token jti) — appareil, IP et date de connexion."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    jti = models.CharField(max_length=64, unique=True)
    user_agent = models.CharField(max_length=300, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Session'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} · {self.user_agent[:40]}'
