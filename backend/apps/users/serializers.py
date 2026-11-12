import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .email_utils import (
    get_request_language,
    send_login_notification,
    send_welcome_email,
)
from .models import Agent, ContactMessage, NewsletterCampaign, Offer, PlatformSettings, User, Notification, UserDocument, UserSession


def _phone_digits(value):
    return re.sub(r'\D', '', value or '')


def phone_taken(value, exclude=None):
    """True si un autre utilisateur possède déjà ce numéro (chiffres identiques)."""
    digits = _phone_digits(value)
    if not digits:
        return False
    qs = User.objects.exclude(phone='').exclude(phone__isnull=True)
    if exclude is not None and getattr(exclude, 'pk', None):
        qs = qs.exclude(pk=exclude.pk)
    return any(_phone_digits(u.phone) == digits for u in qs.only('phone'))


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'whatsapp', 'payment_method', 'payment_phone', 'avatar', 'is_verified', 'newsletter_opt_in', 'language', 'balance',
                  'city', 'address', 'date_of_birth', 'id_document', 'id_document_verified', 'driving_license',
                  'driving_license_expires_at', 'address_proof', 'insurance', 'kyc_status', 'kyc_note', 'kyc_submitted_at', 'notif_prefs', 'created_at']
        read_only_fields = ['id', 'is_verified', 'balance', 'id_document', 'id_document_verified', 'driving_license',
                            'kyc_status', 'kyc_note', 'kyc_submitted_at', 'created_at']

    def validate_email(self, value):
        """Empêche de prendre un email déjà utilisé par un autre compte."""
        if self.instance and User.objects.filter(
            email__iexact=value.strip(),
        ).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé par un autre compte.')
        return value

    def validate_phone(self, value):
        """Un numéro de téléphone ne peut appartenir qu'à un seul compte
        (comparaison sur les chiffres : +237 6… et 6… sont le même numéro)."""
        if phone_taken(value, exclude=self.instance):
            raise serializers.ValidationError('Ce numéro de téléphone est déjà associé à un compte.')
        return value


class KYCUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id_document', 'driving_license', 'driving_license_expires_at', 'address_proof', 'insurance']


    def validate(self, attrs):
        if not any(attrs.get(f) for f in ('id_document', 'driving_license', 'address_proof', 'insurance')):
            raise serializers.ValidationError('Ajoutez au moins une pièce justificative.')
        for field in ('id_document', 'driving_license'):
            document = attrs.get(field)
            if not document:
                continue
            if document.size > 8 * 1024 * 1024:
                raise serializers.ValidationError({field: 'Fichier trop volumineux (8 Mo max).'})
            if not document.name.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.pdf')):
                raise serializers.ValidationError({field: 'Formats acceptés : JPG, PNG, WEBP ou PDF.'})
        return attrs


class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = ['id', 'name', 'doc_type', 'issued_place', 'validity', 'file',
                  'status', 'verification_note', 'verified_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'status', 'verification_note', 'verified_at']


class AdminDocumentSerializer(UserDocumentSerializer):
    """Document enrichi des infos du déposant — console KYC admin."""
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta(UserDocumentSerializer.Meta):
        fields = UserDocumentSerializer.Meta.fields + ['user_id', 'user_name', 'user_role', 'user_email', 'user_avatar']
        read_only_fields = ['id', 'created_at', 'verified_at', 'verification_note']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_user_avatar(self, obj):
        if not obj.user.avatar:
            return None
        request = self.context.get('request')
        url = obj.user.avatar.url
        return request.build_absolute_uri(url) if request else url


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = ['jti', 'user_agent', 'ip_address', 'created_at']


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['id', 'title', 'description', 'code', 'terms', 'is_active']


class PlatformSettingsSerializer(serializers.ModelSerializer):
    tiers = serializers.SerializerMethodField()

    class Meta:
        model = PlatformSettings
        exclude = ['id']
        read_only_fields = ['updated_at']

    def get_tiers(self, obj):
        """Barème de classification véhicules (lecture seule, défini dans apps.vehicles)."""
        from apps.vehicles.models import PRICE_MARGIN, TIER_BASE, TIER_DEPOSIT, TIER_KM, Vehicle
        labels = dict(Vehicle.Tier.choices)
        return [{
            'tier': tier,
            'label': labels.get(tier, tier),
            'base_rate': base,
            'min_rate': int(base * (1 - PRICE_MARGIN)),
            'max_rate': int(base * (1 + PRICE_MARGIN)),
            'deposit': TIER_DEPOSIT[tier],
            'km_included': TIER_KM[tier][0],
            'extra_km_rate': TIER_KM[tier][1],
            'vehicles': Vehicle.objects.filter(tier=tier).count(),
        } for tier, base in TIER_BASE.items()]

    def validate_commission_rate(self, value):
        if not 0 <= value <= 1:
            raise serializers.ValidationError('Le taux doit être compris entre 0 et 1.')
        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'kind', 'link', 'is_read', 'created_at']
        read_only_fields = ['title', 'message', 'created_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'last_name', 'first_name', 'phone', 'email', 'rental_type',
                  'message', 'created_at', 'is_handled']
        read_only_fields = ['id', 'created_at', 'is_handled']


class ContactMessageAdminSerializer(ContactMessageSerializer):
    class Meta(ContactMessageSerializer.Meta):
        read_only_fields = ['id', 'created_at']


class NewsletterCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterCampaign
        fields = ['id', 'subject', 'body', 'sent_at', 'recipients_count', 'sent_by']
        read_only_fields = fields


class NewsletterSendSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    html_body = serializers.CharField(required=False, allow_blank=True, default='')
    text_body = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if not attrs['html_body'].strip() and not attrs['text_body'].strip():
            raise serializers.ValidationError('Le contenu HTML ou texte est obligatoire.')
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Réservé à l'admin — permet d'activer/suspendre/vérifier/changer le rôle."""
    bookings_count = serializers.IntegerField(read_only=True)
    vehicles_count = serializers.IntegerField(read_only=True)
    trips_count = serializers.IntegerField(read_only=True)
    client_rating = serializers.FloatField(read_only=True)
    client_rating_count = serializers.IntegerField(read_only=True)
    driver_rating = serializers.SerializerMethodField()
    driver_rating_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'balance',
                  'whatsapp', 'payment_method', 'payment_phone',
                  'is_active', 'is_verified', 'id_document_verified', 'is_staff', 'created_at',
                  'city', 'avatar', 'id_document', 'driving_license', 'driving_license_expires_at',
                  'address_proof', 'insurance',
                  'kyc_status', 'kyc_note', 'kyc_submitted_at',
                  'bookings_count', 'vehicles_count', 'trips_count',
                  'client_rating', 'client_rating_count', 'driver_rating', 'driver_rating_count']
        read_only_fields = ['id', 'created_at', 'id_document', 'driving_license', 'kyc_submitted_at']

    def get_driver_rating(self, obj):
        p = getattr(obj, 'driver_profile', None)
        return float(p.rating) if p and p.rating_count else None

    def get_driver_rating_count(self, obj):
        p = getattr(obj, 'driver_profile', None)
        return p.rating_count if p else 0

    def validate_phone(self, value):
        if phone_taken(value, exclude=self.instance):
            raise serializers.ValidationError('Ce numéro de téléphone est déjà associé à un compte.')
        return value


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone', 'password']

    def validate_phone(self, value):
        if phone_taken(value):
            raise serializers.ValidationError('Ce numéro de téléphone est déjà associé à un compte.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    agent_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ref_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone', 'agent_code', 'ref_code']

    # Rôles ouverts à l'inscription publique — ADMIN/CONTROLLER sont créés
    # uniquement par un admin existant, jamais via le formulaire public.
    PUBLIC_ROLES = ('CLIENT', 'OWNER', 'DRIVER')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        email = attrs.get('email', '').strip().lower()
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Un compte existe déjà avec cet email.'})
        attrs['email'] = email
        if attrs.get('role') not in self.PUBLIC_ROLES:
            attrs['role'] = 'CLIENT'
        if phone_taken(attrs.get('phone')):
            raise serializers.ValidationError({'phone': 'Ce numéro de téléphone est déjà associé à un compte.'})
        code = attrs.get('agent_code', '').strip()
        if code:
            from apps.affiliates.models import Agent
            agent = Agent.objects.filter(code=code, is_active=True).first()
            if not agent:
                raise serializers.ValidationError({'agent_code': 'Code agent invalide.'})
            attrs['referring_agent'] = agent
        ref = attrs.get('ref_code', '').strip()
        if ref:
            parrain = User.objects.filter(referral_code__iexact=ref).first()
            if not parrain:
                raise serializers.ValidationError({'ref_code': 'Code parrain invalide.'})
            attrs['referred_by'] = parrain
        return attrs

    def create(self, validated_data):
        agent = validated_data.pop('referring_agent', None)
        validated_data.pop('agent_code', None)
        validated_data.pop('ref_code', None)
        parrain = validated_data.pop('referred_by', None)
        user = User.objects.create_user(**validated_data)
        if parrain:
            user.referred_by = parrain
            user.save(update_fields=['referred_by'])
        if agent:
            from apps.affiliates.models import AgentReferral
            AgentReferral.objects.create(agent=agent, referred_user=user)
        return user


class LoginSerializer(serializers.Serializer):
    """Login par email — retourne tokens JWT + profil utilisateur."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs['email'].strip()).first()
        if user is None:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        if not user.check_password(attrs['password']) or not user.is_active:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        send_login_notification(user)
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }


class GoogleAuthSerializer(serializers.Serializer):
    """Connexion / inscription via compte Google (Gmail)."""

    email = serializers.EmailField()
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    google_id = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        created = user is None
        if user is None:
            base = email.split('@')[0]
            username = base
            i = 1
            while User.objects.filter(username=username).exists():
                i += 1
                username = f'{base}{i}'
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=attrs.get('first_name', ''),
                last_name=attrs.get('last_name', ''),
                role='CLIENT',
                is_verified=True,
                language=get_request_language(self.context.get('request')),
            )
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            raise serializers.ValidationError('Ce compte a été suspendu.')
        if created:
            send_welcome_email(user)
        send_login_notification(user)
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'
        read_only_fields = ['code', 'conversions', 'total_amount', 'commission', 'created_at']
