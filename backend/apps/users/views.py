import random
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Notification, LoginCode, Agent
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer, GoogleAuthSerializer, NotificationSerializer, AgentSerializer


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
                    getattr(settings, 'GOOGLE_CLIENT_ID', '') or None,
                    clock_skew_in_seconds=300)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning('Google token verify failed: %s', e)
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
        user = serializer.save()
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


class MeReferralView(APIView):
    """Parrainage client : code unique, filleuls et crédits cumulés."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.referral_code:
            import secrets
            user.referral_code = f'ALP-{(user.username or "U").upper()[:8]}-{secrets.token_hex(3).upper()}'
            user.save(update_fields=['referral_code'])
        referred = list(user.referrals.all())
        completed = sum(
            1 for u in referred
            if u.bookings.filter(status='completed').exists()
        ) if referred else 0
        return Response({
            'code': user.referral_code,
            'referred_count': len(referred),
            'referred_active': completed,
            'credits': str(user.referral_credits),
            'referred': [
                {'name': u.get_full_name() or u.username, 'date': u.created_at,
                 'status': 'active' if u.bookings.filter(status='completed').exists() else 'pending'}
                for u in referred
            ],
        })


# ─── Connexion par code email (OTP) ───────────────────────────────────────────

def _otp_email_html(code, first_name):
    """Email HTML stylé avec le code de connexion à 6 chiffres."""
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
    <h2 style="margin:0 0 8px;color:#0F172A;font-size:18px">Bonjour {first_name or ''},</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 20px">
      Voici votre code de connexion AutoLink Pro. Il est valable <strong>10 minutes</strong>.
    </p>
    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px"><tr>{digits}</tr></table>
    <p style="color:#94A3B8;font-size:12px;margin:0;text-align:center">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>
  </div>
  <p style="text-align:center;color:#94A3B8;font-size:11px;margin-top:20px">
    AutoLink Pro — Location de véhicules au Cameroun
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

        code = f'{random.SystemRandom().randint(0, 999999):06d}'
        LoginCode.objects.filter(email=email).delete()
        LoginCode.objects.create(
            email=email, code=code, first_name=first_name, last_name=last_name,
            expires_at=timezone.now() + timedelta(minutes=10))
        send_mail(
            subject=f'AutoLink Pro — Votre code de connexion : {code}',
            message=f'Votre code de connexion AutoLink Pro : {code} (valable 10 minutes).',
            from_email=None,  # DEFAULT_FROM_EMAIL
            recipient_list=[email],
            html_message=_otp_email_html(code, first_name),
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
                role='CLIENT', is_verified=True)
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            return Response({'detail': 'Ce compte a été suspendu.'}, status=403)
        otp.delete()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Admin peut activer/désactiver/vérifier/modifier n'importe quel compte."""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]


class NotificationListView(generics.ListAPIView):
    """Notifications de l'utilisateur connecté — les plus récentes d'abord."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()[:100]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        unread = request.user.notifications.filter(is_read=False).count()
        return Response({'unread': unread, 'results': self.get_serializer(qs, many=True).data})


class NotificationReadView(APIView):
    """Marque toutes les notifications (ou une seule) comme lues."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        qs = request.user.notifications.filter(is_read=False)
        if pk:
            qs = qs.filter(pk=pk)
        qs.update(is_read=True)
        return Response({'unread': request.user.notifications.filter(is_read=False).count()})


class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class AgentListView(generics.ListCreateAPIView):
    """Codes agents / parrainage — liste + création (admin)."""
    serializer_class = AgentSerializer
    permission_classes = [IsAdminOnly]
    queryset = Agent.objects.all()

    def perform_create(self, serializer):
        # Code auto : AGT-<ville prefixe>-<n° séquentiel>
        n = Agent.objects.count() + 1
        serializer.save(code=f'AGT-DBL-{n:03d}')


class AgentDetailView(generics.RetrieveUpdateAPIView):
    """Activer/désactiver un agent, ajuster le taux (admin)."""
    serializer_class = AgentSerializer
    permission_classes = [IsAdminOnly]
    queryset = Agent.objects.all()
