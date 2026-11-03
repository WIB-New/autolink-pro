import random
import logging
from urllib.parse import urlencode
from django.core import signing
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection, send_mail
from django.db.models import Count
from django.db.models.deletion import ProtectedError
from django.urls import reverse
from django.utils import timezone
from django.utils.html import escape, strip_tags
from datetime import timedelta
from rest_framework import filters, generics, permissions, serializers, status
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from .email_utils import (
    contact_acknowledgement,
    get_request_language,
    get_user_language,
    send_login_notification,
    send_welcome_email,
)
from rest_framework.parsers import FormParser, MultiPartParser
from .models import ContactMessage, NewsletterCampaign, PlatformSettings, User, Notification, LoginCode
from .serializers import ContactMessageAdminSerializer, ContactMessageSerializer, NewsletterCampaignSerializer, NewsletterSendSerializer, UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer, AdminUserCreateSerializer, GoogleAuthSerializer, NotificationSerializer, KYCUploadSerializer, PlatformSettingsSerializer


logger = logging.getLogger(__name__)


class ContactAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        body = (
            f"Nom : {message.last_name}\n"
            f"Prénom : {message.first_name}\n"
            f"Téléphone : {message.phone}\n"
            f"Email : {message.email or 'Non renseigné'}\n"
            f"Type de location : {message.rental_type or 'Non précisé'}\n\n"
            f"Message :\n{message.message}"
        )
        try:
            send_mail(
                subject=f'Nouvelle demande de contact — {message.first_name} {message.last_name}',
                message=body,
                from_email=None,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            if message.email:
                language = (
                    request.user.language
                    if request.user.is_authenticated
                    else get_request_language(request)
                )
                subject, acknowledgement = contact_acknowledgement(
                    message.first_name, language)
                send_mail(
                    subject=subject,
                    message=acknowledgement,
                    from_email=None,
                    recipient_list=[message.email],
                    fail_silently=False,
                )
        except Exception:
            logger.exception('Unable to send a contact message notification')
            return Response(
                {'detail': "Votre message a été enregistré, mais son envoi a échoué. "
                           "Veuillez réessayer ou nous contacter par téléphone."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({'detail': 'Votre message a bien été envoyé.'},
                        status=status.HTTP_201_CREATED)


class SiteConfigAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Avg
        from apps.bookings.models import Booking
        from apps.vehicles.models import Vehicle
        platform = PlatformSettings.current()
        approved = Vehicle.objects.filter(status__in=('approved', 'rented'))
        rated = Booking.objects.exclude(client_rating__isnull=True)
        return Response({
            'tiers': PlatformSettingsSerializer().get_tiers(platform),
            'stats': {
                'vehicles': approved.count(),
                'completed_bookings': Booking.objects.filter(status='completed').count(),
                'average_rating': round(rated.aggregate(v=Avg('client_rating'))['v'] or 0, 1),
                'reviews': rated.count(),
                'cities': approved.exclude(city='').values('city').distinct().count(),
            },
            'reviews': [{
                'rating': b.client_rating,
                'text': b.client_review,
                'author': f'{b.client.first_name} {b.client.last_name[:1]}.'.strip(),
                'city': b.vehicle.city,
                'vehicle': f'{b.vehicle.brand} {b.vehicle.model}',
                'days': b.days,
            } for b in rated.exclude(client_review='').filter(client_rating__gte=4)
                .select_related('client', 'vehicle').order_by('-updated_at')[:3]],
            'contact_email': platform.contact_email or settings.CONTACT_EMAIL,
            'phones': [p.strip() for p in platform.phones.split(',') if p.strip()],
            'addresses': [a.strip() for a in platform.addresses.split('|') if a.strip()],
            'commission_rate': platform.commission_rate,
            'min_withdrawal_amount': platform.min_withdrawal_amount,
            'maintenance_mode': platform.maintenance_mode,
            'bookings_enabled': platform.bookings_enabled,
            'owner_response_hours': platform.owner_response_hours,
            'hours': {
                'weekdays': {'open': '06:00', 'close': '22:00'},
                'saturday': {'open': '07:00', 'close': '21:00'},
                'sunday': None,
            },
        })


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class PlatformSettingsView(generics.RetrieveUpdateAPIView):
    """Paramètres plateforme (écran admin « Paramètres plateforme »)."""
    serializer_class = PlatformSettingsSerializer
    permission_classes = [IsAdminRole]

    def get_object(self):
        return PlatformSettings.current()


class AdminActivityView(APIView):
    """Journal d'activité opérationnelle (tableau de bord admin) + compteurs de file."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        from apps.bookings.models import Booking
        from apps.payments.models import Payment, WithdrawalRequest
        from apps.vehicles.models import Vehicle
        events = []
        for booking in Booking.objects.select_related('client', 'vehicle').order_by('-created_at')[:10]:
            events.append({
                'at': booking.created_at, 'kind': 'booking', 'status': booking.status,
                'title': f'Réservation BK-{booking.pk:04d} · {booking.vehicle}',
                'detail': f'{booking.client.get_full_name()} — {booking.start_date} → {booking.end_date}',
                'link': f'/admin/bookings/{booking.pk}',
            })
        for payment in Payment.objects.select_related('payer').exclude(paid_at=None).order_by('-paid_at')[:10]:
            events.append({
                'at': payment.paid_at, 'kind': 'payment', 'status': payment.status,
                'title': f'Paiement {payment.amount:.0f} FCFA ({payment.get_method_display()})',
                'detail': f'{payment.payer.get_full_name()} — caution {payment.get_escrow_status_display().lower()}',
                'link': '/admin/finance',
            })
        for vehicle in Vehicle.objects.select_related('owner').order_by('-created_at')[:10]:
            events.append({
                'at': vehicle.created_at, 'kind': 'vehicle', 'status': vehicle.status,
                'title': f'Véhicule soumis : {vehicle}',
                'detail': f'Propriétaire {vehicle.owner.get_full_name()} — {vehicle.plate}',
                'link': '/admin/catalog',
            })
        for withdrawal in WithdrawalRequest.objects.select_related('user').order_by('-created_at')[:10]:
            events.append({
                'at': withdrawal.created_at, 'kind': 'withdrawal', 'status': withdrawal.status,
                'title': f'Retrait {withdrawal.amount:.0f} FCFA ({withdrawal.get_method_display()})',
                'detail': f'{withdrawal.user.get_full_name()} — {withdrawal.reference}',
                'link': '/admin/owners',
            })
        for user in User.objects.exclude(kyc_submitted_at=None).order_by('-kyc_submitted_at')[:10]:
            events.append({
                'at': user.kyc_submitted_at, 'kind': 'kyc', 'status': user.kyc_status,
                'title': f'Dossier KYC : {user.get_full_name() or user.username}',
                'detail': user.email, 'link': '/admin/users',
            })
        events.sort(key=lambda e: e['at'], reverse=True)
        return Response({
            'queue': {
                'vehicles_pending': Vehicle.objects.filter(status='pending').count(),
                'kyc_pending': User.objects.filter(kyc_status='pending').count(),
                'disputes_open': Booking.objects.filter(status='disputed').count(),
                'withdrawals_pending': WithdrawalRequest.objects.filter(status='pending').count(),
                'withdrawals_pending_amount': sum(
                    w.amount for w in WithdrawalRequest.objects.filter(status='pending')),
                'owner_requests_pending': Booking.objects.filter(
                    owner_response='pending', status__in=('pending', 'confirmed')).count(),
                'contact_unhandled': ContactMessage.objects.filter(is_handled=False).count(),
            },
            'events': events[:25],
        })


class KYCUploadView(generics.UpdateAPIView):
    """Dépôt de la CNI / du permis par l'utilisateur → dossier KYC en vérification."""
    serializer_class = KYCUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['post', 'patch', 'options']

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        user = serializer.save(kyc_status='pending', kyc_note='', kyc_submitted_at=timezone.now(),
                               id_document_verified=False)
        for admin in User.objects.filter(role='ADMIN', is_active=True):
            Notification.objects.create(
                user=admin, title='Dossier KYC à vérifier',
                message=f'{user.get_full_name() or user.username} a déposé ses pièces justificatives.')

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(UserSerializer(request.user, context={'request': request}).data)


class ContactMessageViewSet(ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['last_name', 'first_name', 'phone', 'email', 'rental_type', 'message']
    ordering_fields = ['created_at', 'last_name', 'first_name', 'is_handled']


NEWSLETTER_UNSUBSCRIBE_SALT = 'autolink-newsletter-unsubscribe'


class NewsletterUnsubscribeView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        token = request.query_params.get('token', '')
        try:
            payload = signing.loads(token, salt=NEWSLETTER_UNSUBSCRIBE_SALT)
            user = User.objects.get(pk=payload['user_id'], email=payload['email'])
        except (signing.BadSignature, KeyError, TypeError, ValueError, User.DoesNotExist):
            return Response(
                {'detail': 'Lien de désinscription invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.newsletter_opt_in:
            user.newsletter_opt_in = False
            user.save(update_fields=['newsletter_opt_in'])
        return Response({'detail': 'Votre désinscription est prise en compte.'})


class NewsletterCampaignListView(generics.ListCreateAPIView):
    queryset = NewsletterCampaign.objects.select_related('sent_by')
    serializer_class = NewsletterCampaignSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['subject', 'body']
    ordering_fields = ['subject', 'sent_at', 'recipients_count']

    def get_serializer_class(self):
        return NewsletterCampaignSerializer if self.request.method == 'GET' else NewsletterSendSerializer


class NewsletterCampaignDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = NewsletterCampaign.objects.select_related('sent_by')
    serializer_class = NewsletterCampaignSerializer
    permission_classes = [IsAdminRole]


class NewsletterResendView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            campaign = NewsletterCampaign.objects.get(pk=pk)
        except NewsletterCampaign.DoesNotExist:
            return Response({'detail': 'Campagne introuvable.'}, status=404)

        # Extract subject and body from the campaign
        subject = campaign.subject
        html_body = campaign.body if '<' in campaign.body else ''
        text_body = campaign.body if '<' not in campaign.body else ''

        # Send the newsletter
        from .email_utils import get_request_language
        from django.core.mail import EmailMultiAlternatives

        subscribers = User.objects.filter(
            is_active=True,
            newsletter_opt_in=True,
            role__in=['CLIENT', 'OWNER', 'DRIVER']
        )

        sent_count = 0
        for subscriber in subscribers:
            if not subscriber.email:
                continue

            language = get_user_language(subscriber)
            unsubscribe_token = signing.sign(str(subscriber.pk))
            unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe?token={unsubscribe_token}"

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[subscriber.email],
            )

            if html_body:
                # Add unsubscribe link to HTML
                html_with_unsubscribe = f"{html_body}<br><br><small><a href='{unsubscribe_url}'>Se désinscrire</a></small>"
                email.attach_alternative(html_with_unsubscribe, 'text/html')

            try:
                email.send()
                sent_count += 1
            except Exception:
                continue

        # Update the campaign
        campaign.sent_at = timezone.now()
        campaign.recipients_count = sent_count
        campaign.save(update_fields=['sent_at', 'recipients_count'])

        return Response({
            'detail': 'Campagne renvoyée avec succès.',
            'recipients_count': sent_count,
        })


class NewsletterSendView(APIView):
    permission_classes = [IsAdminRole]
    batch_size = 100

    def post(self, request):
        serializer = NewsletterSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subject = serializer.validated_data['subject']
        html_body = serializer.validated_data['html_body'].strip()
        text_body = serializer.validated_data['text_body'].strip()
        recorded_body = html_body or text_body
        unsubscribe_base = request.build_absolute_uri(reverse('newsletter-unsubscribe'))
        connection = get_connection(fail_silently=True)
        messages = []
        sent_count = 0

        for user in (User.objects
                     .filter(is_active=True, newsletter_opt_in=True)
                     .exclude(email='')
                     .order_by('pk')
                     .iterator(chunk_size=self.batch_size)):
            token = signing.dumps(
                {'user_id': user.pk, 'email': user.email},
                salt=NEWSLETTER_UNSUBSCRIBE_SALT,
            )
            unsubscribe_url = f'{unsubscribe_base}?{urlencode({"token": token})}'
            plain_content = text_body or strip_tags(html_body)
            if get_user_language(user) == 'en':
                plain_content = f'{plain_content}\n\nUnsubscribe: {unsubscribe_url}'
                unsubscribe_label = 'Unsubscribe'
            else:
                plain_content = f'{plain_content}\n\nSe désinscrire : {unsubscribe_url}'
                unsubscribe_label = 'Se désinscrire'
            email = EmailMultiAlternatives(
                subject=subject,
                body=plain_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                connection=connection,
            )
            if html_body:
                html_content = (
                    f'{html_body}\n<p><a href="{escape(unsubscribe_url)}">'
                    f'{unsubscribe_label}</a></p>'
                )
                email.attach_alternative(html_content, 'text/html')
            messages.append(email)

            if len(messages) >= self.batch_size:
                sent_count += connection.send_messages(messages)
                messages = []

        if messages:
            sent_count += connection.send_messages(messages)

        campaign = NewsletterCampaign.objects.create(
            subject=subject,
            body=recorded_body,
            sent_at=timezone.now(),
            recipients_count=sent_count,
            sent_by=request.user,
        )
        return Response({
            'campaign': NewsletterCampaignSerializer(campaign).data,
            'recipients_count': sent_count,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class GoogleAuthView(APIView):
    """Connexion / inscription via Google — vérifie le jeton ID Google, crée le compte si nécessaire."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential') or request.data.get('id_token')

        # Flux réel : jeton ID émis par Google Identity Services (frontend)
        if credential:
            try:
                from google.oauth2 import id_token as google_id_token
                from google.auth.transport import requests as google_requests
                info = google_id_token.verify_oauth2_token(
                    credential, google_requests.Request(),
                    getattr(settings, 'GOOGLE_CLIENT_ID', '') or None)
            except Exception:
                return Response({'detail': 'Jeton Google invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)
            serializer = GoogleAuthSerializer(data={
                'email': info.get('email', ''),
                'first_name': info.get('given_name', ''),
                'last_name': info.get('family_name', ''),
                'google_id': info.get('sub', ''),
            })
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data)

        # Compatibilité : ancien flux email (sans vérification)
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(language=get_request_language(request))
        send_welcome_email(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Connexion par code email (OTP) ───────────────────────────────────────────

def _otp_email_html(code, first_name, language='fr'):
    """Email HTML stylé avec le code de connexion à 6 chiffres."""
    if language == 'en':
        greeting = f'Hello {first_name or ""},'
        introduction = (
            'Here is your AutoLink Pro sign-in code. It is valid for '
            '<strong>10 minutes</strong>.'
        )
        ignore = 'If you did not request this code, you can ignore this email.'
        footer = 'Vehicle rental in Cameroon'
    else:
        greeting = f'Bonjour {first_name or ""},'
        introduction = (
            'Voici votre code de connexion AutoLink Pro. Il est valable '
            '<strong>10 minutes</strong>.'
        )
        ignore = "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
        footer = 'Location de véhicules au Cameroun'
    digits = ''.join(
        f'<td style="width:44px;height:52px;background:#0B2447;color:#fff;'
        f'font-size:26px;font-weight:800;text-align:center;border-radius:10px;'
        f'font-family:Arial,sans-serif">{d}</td>'
        + ('<td style="width:8px"></td>' if i < 5 else '')
        for i, d in enumerate(code))
    return f"""
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;
  background:#F8FAFC;padding:32px 20px;border-radius:16px">
  <div style="text-align:center;margin-bottom:24px">
    <span style="font-size:24px;font-weight:900;color:#0B2447">Auto<span style="color:#2563EB">Link</span>
      <span style="color:#D97706;font-size:13px">PRO</span></span>
  </div>
  <div style="background:#fff;border-radius:14px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:18px">{greeting}</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px">
      {introduction}
    </p>
    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>{digits}</tr></table>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      {ignore}
    </p>
  </div>
  <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px">
    AutoLink Pro — {footer}
  </p>
</div>"""


class OTPRequestView(APIView):
    """Envoie un code à 6 chiffres par email (connexion sans mot de passe)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        first_name = (request.data.get('first_name') or '').strip()
        last_name = (request.data.get('last_name') or '').strip()
        if not email or '@' not in email:
            return Response({'email': 'Adresse email invalide.'}, status=400)

        # Anti-spam : un code par minute et par email
        recent = LoginCode.objects.filter(
            email=email, created_at__gte=timezone.now() - timedelta(minutes=1)).first()
        if recent:
            return Response({'detail': 'Un code vient déjà d\'être envoyé. Patientez une minute.'}, status=429)

        existing_user = User.objects.filter(email__iexact=email).only('language').first()
        language = (
            get_user_language(existing_user)
            if existing_user
            else get_request_language(request)
        )
        code = f'{random.SystemRandom().randint(0, 999999):06d}'
        LoginCode.objects.filter(email=email).delete()
        LoginCode.objects.create(
            email=email, code=code, first_name=first_name, last_name=last_name,
            expires_at=timezone.now() + timedelta(minutes=10))
        subject = (
            f'AutoLink Pro — Your sign-in code: {code}'
            if language == 'en'
            else f'AutoLink Pro — Votre code de connexion : {code}'
        )
        message = (
            f'Your AutoLink Pro sign-in code is {code} (valid for 10 minutes).'
            if language == 'en'
            else f'Votre code de connexion AutoLink Pro : {code} (valable 10 minutes).'
        )
        send_mail(
            subject=subject,
            message=message,
            from_email=None,  # DEFAULT_FROM_EMAIL
            recipient_list=[email],
            html_message=_otp_email_html(code, first_name, language),
            fail_silently=False,
        )
        return Response({'detail': 'Code envoyé.', 'email': email})


class OTPVerifyView(APIView):
    """Vérifie le code email et retourne les tokens JWT (compte créé si besoin)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        otp = LoginCode.objects.filter(email=email).first()
        if not otp or otp.expires_at < timezone.now():
            return Response({'detail': 'Code expiré — demandez-en un nouveau.'}, status=400)
        if otp.attempts >= 5:
            otp.delete()
            return Response({'detail': 'Trop de tentatives — demandez un nouveau code.'}, status=429)
        if otp.code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            return Response({'detail': 'Code incorrect.'}, status=400)

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
                username=username, email=email,
                first_name=otp.first_name, last_name=otp.last_name,
                role='CLIENT', is_verified=True,
                language=get_request_language(request))
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            return Response({'detail': 'Ce compte a été suspendu.'}, status=403)
        if created:
            send_welcome_email(user)
        send_login_notification(user)
        otp.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class UserListView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]
    filterset_fields = ['role', 'is_verified', 'is_active', 'kyc_status', 'id_document_verified']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_verified']

    def get_queryset(self):
        return User.objects.annotate(
            bookings_count=Count('bookings', distinct=True),
            vehicles_count=Count('vehicles', distinct=True),
            trips_count=Count('driven_bookings', distinct=True),
        ).order_by('-created_at')

    def get_serializer_class(self):
        return AdminUserCreateSerializer if self.request.method == 'POST' else AdminUserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin peut modifier et supprimer un compte."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.annotate(
            bookings_count=Count('bookings', distinct=True),
            vehicles_count=Count('vehicles', distinct=True),
            trips_count=Count('driven_bookings', distinct=True),
        )

    def perform_update(self, serializer):
        if serializer.instance == self.request.user and serializer.validated_data.get('is_active') is False:
            raise serializers.ValidationError({'is_active': 'Vous ne pouvez pas suspendre votre propre compte.'})
        previous_kyc = serializer.instance.kyc_status
        kyc_status = serializer.validated_data.get('kyc_status')
        extra = {'id_document_verified': kyc_status == 'approved'} if kyc_status else {}
        user = serializer.save(**extra)
        if kyc_status and kyc_status != previous_kyc and kyc_status in ('approved', 'rejected'):
            Notification.objects.create(
                user=user,
                title='Documents validés' if kyc_status == 'approved' else 'Documents refusés',
                message=('Vos pièces justificatives ont été validées.' if kyc_status == 'approved'
                         else f'Vos pièces justificatives ont été refusées. {user.kyc_note}'.strip()))

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'detail': 'Vous ne pouvez pas supprimer votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Ce compte est lié à des réservations et ne peut pas être supprimé. Suspendez-le plutôt.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationListView(generics.ListAPIView):
    """Notifications de l'utilisateur connecté — les plus récentes d'abord."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'title', 'is_read']

    def get_queryset(self):
        return self.request.user.notifications.all()

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        unread = request.user.notifications.filter(is_read=False).count()
        return Response({
            'unread': unread,
            'results': self.get_serializer(qs[:100], many=True).data,
        })


class NotificationReadView(APIView):
    """Marque toutes les notifications (ou une seule) comme lues."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        qs = request.user.notifications.filter(is_read=False)
        if pk:
            qs = qs.filter(pk=pk)
        qs.update(is_read=True)
        return Response({'unread': request.user.notifications.filter(is_read=False).count()})


class NotificationDetailView(APIView):
    """Suppression d'une notification de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = request.user.notifications.filter(pk=pk).delete()
        if not deleted:
            return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
