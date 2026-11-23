import random
from io import BytesIO
from django.conf import settings
from django.core.mail import send_mail
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from urllib.parse import urlencode
from django.core import signing
from django.core.mail import get_connection, EmailMultiAlternatives
from django.db import IntegrityError
from django.db.models import Count, Avg
from django.db.models.deletion import ProtectedError
from django.urls import reverse
from django.utils.html import escape, strip_tags
from rest_framework.exceptions import ValidationError
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.viewsets import ModelViewSet
from .email_utils import (
    contact_acknowledgement,
    get_request_language,
    get_user_language,
    send_login_notification,
    send_welcome_email,
)
from rest_framework.parsers import FormParser, MultiPartParser
from .models import Agent, ContactMessage, NewsletterCampaign, Offer, PlatformSettings, User, Notification, LoginCode, UserDocument, UserSession
from .serializers import AgentSerializer, ContactMessageAdminSerializer, ContactMessageSerializer, NewsletterCampaignSerializer, NewsletterSendSerializer, UserSerializer, RegisterSerializer, LoginSerializer, AdminUserSerializer, AdminUserCreateSerializer, GoogleAuthSerializer, NotificationSerializer, KYCUploadSerializer, PlatformSettingsSerializer, UserDocumentSerializer, AdminDocumentSerializer, OfferSerializer, UserSessionSerializer


logger = logging.getLogger(__name__)


class ContactAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact'

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        try:
            self._relay_to_messaging(request, message)
        except Exception:
            logger.exception('Contact message %s not relayed to admin messaging', message.pk)
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

    def _relay_to_messaging(self, request, message):
        """Fait remonter la demande dans la Messagerie admin (conversation
        Support) — en plus de l'email vers CONTACT_EMAIL.

        Utilisateur connecté : sa conversation Support est réutilisée et
        l'admin peut lui répondre directement. Anonyme : conversation
        réservée aux admins, portant les coordonnées du visiteur."""
        from apps.messaging.models import Conversation, Message
        admins = list(User.objects.filter(role='ADMIN', is_active=True))
        if not admins:
            return
        user = request.user if request.user.is_authenticated else None
        conversation = (Conversation.objects.filter(kind='support', participants=user).first()
                        if user is not None else None)
        if not conversation:
            who = (user.get_full_name() or user.username) if user else \
                f'{message.first_name} {message.last_name}'.strip() or 'Visiteur'
            conversation = Conversation.objects.create(
                kind='support', subject=f'Contact site — {who}')
            conversation.participants.add(*admins, *([user] if user else []))
        content = message.message
        if user is None:
            content = (f'Formulaire de contact — {message.first_name} {message.last_name}\n'
                       f'Tél : {message.phone} · Email : {message.email or "—"}\n\n'
                       f'{message.message}')
        msg = Message.objects.create(
            conversation=conversation, sender=user or admins[0], content=content)
        conversation.save(update_fields=['updated_at'])
        Notification.objects.bulk_create([
            Notification(user=a, title='Demande de contact',
                         message=f'{message.first_name} {message.last_name} : '
                                 f'{(message.message or "")[:110]}')
            for a in admins if a.pk != msg.sender_id
        ])


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
            'driver_daily_fee': platform.driver_daily_fee,
            'delivery_fee': platform.delivery_fee,
            'discount_rules': [
                {'min_days': platform.discount_mid_days, 'percent': platform.discount_mid_percent},
                {'min_days': platform.discount_long_days, 'percent': platform.discount_long_percent},
            ],
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


class AdminDbHealthView(APIView):
    """Diagnostic base de données (admin) — détecte les écritures qui échouent
    en production : test INSERT/UPDATE annulé sur users_user, dérive des
    séquences Postgres, colonnes réelles vs modèle."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        from django.db import connection, transaction
        report = {'vendor': connection.vendor}
        with connection.cursor() as cursor:
            # 1) Écriture test sur users_user (annulée — aucun effet de bord)
            try:
                with transaction.atomic():
                    cursor.execute('SAVEPOINT _probe')
                    cursor.execute(
                        'INSERT INTO users_user (username, email, password, is_superuser, is_staff, is_active,'
                        ' first_name, last_name, is_verified, newsletter_opt_in, balance, referral_credits,'
                        ' date_joined, created_at, updated_at, role, phone, whatsapp, payment_method,'
                        ' payment_phone, language, city, address, kyc_status, kyc_note, referral_code, notif_prefs)'
                        " VALUES ('_db_probe', '_probe@test', 'x', false, false, true, '', '', false, true,"
                        " 0, 0, now(), now(), now(), 'CLIENT', '', '', '', '', 'fr', '', '', 'none', '', '', '{}')"
                        if connection.vendor == 'postgresql' else
                        "SELECT 1")
                    cursor.execute('ROLLBACK TO SAVEPOINT _probe')
                report['users_user_write'] = 'ok'
            except Exception as e:
                report['users_user_write'] = f'ERREUR: {e}'
            # 2) Dérive des séquences (Postgres)
            if connection.vendor == 'postgresql':
                seqs = {}
                cursor.execute(
                    "SELECT c.relname AS table_name, pg_get_serial_sequence(c.relname, 'id')"
                    " FROM pg_class c WHERE c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace")
                for table, seq in cursor.fetchall():
                    if not seq or not table.startswith(('users_', 'vehicles_', 'bookings_', 'payments_')):
                        continue
                    cursor.execute(f'SELECT last_value FROM {seq}')
                    last = cursor.fetchone()[0]
                    cursor.execute(f'SELECT COALESCE(MAX(id),0) FROM "{table}"')
                    mx = cursor.fetchone()[0]
                    if mx and last < mx:
                        seqs[table] = {'sequence_last': last, 'max_id': mx, 'drift': mx - last}
                report['sequence_drift'] = seqs or 'aucune'
        # 3) Dérive des colonnes : chaque champ modèle doit avoir sa colonne
        #    en base — liste les manquantes (tables créées hors migrations).
        from django.apps import apps as django_apps
        missing = {}
        extra_not_null = {}
        existing_tables = set(connection.introspection.table_names())
        with connection.cursor() as cursor:
            for model in django_apps.get_models():
                table = model._meta.db_table
                if table not in existing_tables:
                    missing[table] = ['<table entière absente>']
                    continue
                desc = connection.introspection.get_table_description(cursor, table)
                cols = {c.name for c in desc}
                absent = [f.column for f in model._meta.fields
                          if not f.auto_created and f.column not in cols]
                if absent:
                    missing[table] = absent
                # Colonnes en base inconnues du modèle et NOT NULL : elles
                # casseraient les INSERT même si le schéma semble complet.
                model_cols = {f.column for f in model._meta.fields}
                extra = [c.name for c in desc
                         if c.name not in model_cols and not c.null_ok]
                if extra:
                    extra_not_null[table] = extra
        report['missing_columns'] = missing or 'aucune'
        report['extra_not_null_columns'] = extra_not_null or 'aucune'
        report['ok'] = (report.get('users_user_write') == 'ok'
                        and report.get('sequence_drift') in (None, 'aucune')
                        and not missing and not extra_not_null)
        return Response(report)


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
    http_method_names = ['post', 'patch', 'delete', 'options']

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        """Supprime un justificatif précis (?field=id_document|driving_license|address_proof|insurance)."""
        field = request.query_params.get('field')
        if field in ('id_document', 'driving_license', 'address_proof', 'insurance'):
            setattr(request.user, field, None)
            request.user.save(update_fields=[field])
        return Response(UserSerializer(request.user, context={'request': request}).data)

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


class UserDocumentListCreateView(generics.ListCreateAPIView):
    """Documents personnels du client — liste + ajout (nom, type, lieu, validité, fichier)."""
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return self.request.user.extra_documents.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Voir / modifier / supprimer un document personnel (propriétaire uniquement)."""
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return self.request.user.extra_documents.all()


class AdminUserDocumentListView(generics.ListAPIView):
    """Documents KYC d'un utilisateur — lecture réservée ADMIN/CONTROLLER."""
    serializer_class = UserDocumentSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return UserDocument.objects.filter(user_id=self.kwargs['pk']).select_related('user')


class AdminDocumentListView(generics.ListAPIView):
    """Tous les documents déposés par les utilisateurs (tous rôles) — console KYC admin."""
    serializer_class = AdminDocumentSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'user__first_name', 'user__last_name', 'user__email', 'user__username']
    ordering_fields = ['created_at', 'validity', 'status']

    def get_queryset(self):
        qs = UserDocument.objects.select_related('user').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        role = self.request.query_params.get('role')
        if status_param in ('pending', 'verified', 'rejected'):
            qs = qs.filter(status=status_param)
        if role:
            qs = qs.filter(user__role=role)
        return qs


class AdminDocumentVerifyView(generics.UpdateAPIView):
    """Marque un document conforme ou refusé + notification du déposant."""
    serializer_class = AdminDocumentSerializer
    permission_classes = [IsAdminRole]
    http_method_names = ['patch']

    def get_queryset(self):
        return UserDocument.objects.select_related('user')

    def perform_update(self, serializer):
        new_status = serializer.validated_data.get('status')
        if new_status not in ('pending', 'verified', 'rejected'):
            raise ValidationError({'status': 'Statut invalide.'})
        doc = serializer.instance
        note = self.request.data.get('verification_note', doc.verification_note)
        doc.status = new_status
        doc.verification_note = (note or '')[:255]
        doc.verified_by = self.request.user
        doc.verified_at = timezone.now() if new_status != 'pending' else None
        doc.save(update_fields=['status', 'verification_note', 'verified_by', 'verified_at'])
        if new_status == 'verified':
            title, msg = 'Document validé', f'Votre document « {doc.name} » a été vérifié et est conforme.'
        elif new_status == 'rejected':
            title = 'Document refusé'
            msg = f'Votre document « {doc.name} » a été refusé.' + (f' Motif : {doc.verification_note}' if doc.verification_note else '')
        else:
            title, msg = 'Document repassé en attente', f'Votre document « {doc.name} » est de nouveau en cours de vérification.'
        Notification.objects.create(user=doc.user, title=title, message=msg)


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


def _record_session(request, user, refresh):
    """Enregistre la session (jti du refresh token, appareil, IP) à chaque connexion."""
    try:
        token = refresh if isinstance(refresh, RefreshToken) else RefreshToken(refresh)
        jti = token.get('jti') or token['jti']
        ip = (request.META.get('HTTP_X_FORWARDED_FOR') or '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
        UserSession.objects.get_or_create(
            jti=jti, defaults={'user': user, 'user_agent': request.META.get('HTTP_USER_AGENT', '')[:300], 'ip_address': ip or None})
    except Exception:
        pass


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = User.objects.filter(email__iexact=data.get('user', {}).get('email') or request.data.get('email') or '').first()
        if user and data.get('refresh'):
            _record_session(request, user, data['refresh'])
        return Response(data)


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
                'role': request.data.get('role') or '',
            })
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            user = getattr(serializer, '_user', None)
            if user and data.get('refresh'):
                _record_session(request, user, data['refresh'])
            return Response(data)

        # Compatibilité : ancien flux email (sans vérification)
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = getattr(serializer, '_user', None)
        if user and data.get('refresh'):
            _record_session(request, user, data['refresh'])
        return Response(data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save(language=get_request_language(request))
        except IntegrityError:
            logger.exception('Registration integrity error for %s', request.data.get('email'))
            return Response(
                {'detail': 'Un compte existe déjà avec ces informations.'},
                status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            logger.exception('Registration failed for %s', request.data.get('email'))
            return Response(
                {'detail': "Inscription impossible pour le moment — réessayez dans quelques instants."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            send_welcome_email(user)
        except Exception:
            pass
        refresh = _safe_refresh(user)
        _record_session(request, user, refresh)
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


def _safe_refresh(user):
    """RefreshToken.for_user écrit dans token_blacklist_outstandingtoken — si la table
    manque (migrations prod non appliquées), retombe sur un token nu plutôt qu'un 500."""
    try:
        return RefreshToken.for_user(user)
    except Exception:
        token = RefreshToken()
        token['user_id'] = user.pk
        return token


def _blacklist_jti(user, jti):
    """Blacklist le refresh token et supprime la session enregistrée."""
    try:
        from rest_framework_simplejwt.token_blacklist.models import (
            BlacklistedToken, OutstandingToken)
        t = OutstandingToken.objects.filter(user=user, jti=jti).first()
        if t:
            # OutstandingToken n'a pas de méthode blacklist() — on crée la
            # ligne BlacklistedToken directement.
            BlacklistedToken.objects.get_or_create(token=t)
    except Exception:
        pass
    UserSession.objects.filter(user=user, jti=jti).delete()


class MeSessionListView(generics.ListAPIView):
    """Sessions actives du compte — appareil, IP, date de connexion."""
    serializer_class = UserSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lifetime = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME', timedelta(days=30))
        return self.request.user.sessions.filter(created_at__gte=timezone.now() - lifetime)


class MeSessionDeleteView(APIView):
    """Déconnecte un appareil précis (jti) — révoque son refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, jti):
        _blacklist_jti(request.user, jti)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeSessionLogoutAllView(APIView):
    """Tout déconnecter — révoque toutes les sessions du compte."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        for s in UserSession.objects.filter(user=request.user):
            _blacklist_jti(request.user, s.jti)
        return Response(status=status.HTTP_204_NO_CONTENT)


class OfferListView(generics.ListAPIView):
    """Offres promotionnelles actives — affichées dans l'espace parrainage."""
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Offer.objects.filter(is_active=True)


class MePasswordView(APIView):
    """Changement de mot de passe — mot de passe actuel requis."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current = request.data.get('current_password') or ''
        new = request.data.get('new_password') or ''
        confirm = request.data.get('new_password2') or request.data.get('confirm') or ''
        # Comptes créés via Google/OTP : aucun mot de passe utilisable → première
        # définition libre (le mot de passe actuel ne peut pas être vérifié).
        if user.has_usable_password() and not user.check_password(current):
            return Response({'detail': 'Mot de passe actuel incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new) < 6:
            return Response({'detail': 'Le nouveau mot de passe doit contenir au moins 6 caractères.'}, status=status.HTTP_400_BAD_REQUEST)
        if new != confirm:
            return Response({'detail': 'Les deux nouveaux mots de passe ne correspondent pas.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new)
        user.save(update_fields=['password'])
        return Response({'status': 'ok'})


class MeReferralView(APIView):
    """Parrainage client : code unique, filleuls et crédits cumulés."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.referral_code:
            import secrets
            user.referral_code = f'ALP-{secrets.token_hex(4).upper()}'
            try:
                user.save(update_fields=['referral_code'])
            except Exception:
                # Persiste impossible (incident DB) — on sert quand même le
                # code généré pour ne pas casser la page parrainage.
                logger.exception('referral_code save failed for user %s', user.pk)
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


class MeDataExportView(APIView):
    """Export PDF des données personnelles (portabilité CEMAC) : profil,
    réservations, transactions wallet, documents et parrainage."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle)
        from apps.payments.models import WalletTransaction

        user = request.user
        teal = colors.HexColor('#0d7a6f')
        ink = colors.HexColor('#1f2937')
        mute = colors.HexColor('#6b7280')
        h1 = ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=18, textColor=teal, leading=22)
        h2 = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=11, textColor=teal, spaceBefore=18, spaceAfter=6)
        body = ParagraphStyle('body', fontName='Helvetica', fontSize=9, textColor=ink, leading=14, spaceAfter=4)
        small = ParagraphStyle('small', fontName='Helvetica', fontSize=8, textColor=mute, leading=11)
        cell = ParagraphStyle('cell', fontName='Helvetica', fontSize=8.5, textColor=ink, leading=12)
        cellh = ParagraphStyle('cellh', fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.white, leading=12)

        def table(headers, rows, widths=None):
            # Cellules en Paragraph : le texte long se replie sur plusieurs
            # lignes au lieu de déborder et de chevaucher la ligne suivante.
            t = Table(
                [[Paragraph(str(h), cellh) for h in headers]]
                + [[Paragraph(str(c), cell) for c in row] for row in rows],
                colWidths=widths, repeatRows=1)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), teal),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f7f6')]),
                ('GRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#cbd5e1')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            return t

        story = [
            Paragraph('AutoLink Pro — Export de mes données', h1),
            Paragraph(f'Généré le {timezone.localtime():%d/%m/%Y à %H:%M} — conformité portabilité des données CEMAC.', small),
            Spacer(1, 8),
            Paragraph('1. Profil', h2),
            table(['Champ', 'Valeur'], [
                ['Nom complet', user.get_full_name() or '—'],
                ['Nom d\u2019utilisateur', user.username],
                ['Email', user.email or '—'],
                ['Téléphone', user.phone or '—'],
                ['Rôle', user.get_role_display()],
                ['Ville', user.city or '—'],
                ['Statut KYC', user.get_kyc_status_display()],
                *([] if user.role in ('ADMIN', 'CONTROLLER') else [['Solde portefeuille', f'{user.balance or 0} FCFA']]),
                ['Inscrit le', f'{user.created_at:%d/%m/%Y}' if user.created_at else '—'],
            ], widths=[160, 340]),
        ]

        # Sections adaptées au rôle : un staff (contrôleur/admin) n'a ni
        # réservations, ni portefeuille, ni parrainage — l'export reflète
        # son activité réelle sur la plateforme.
        section_no = 2
        if user.role == 'CONTROLLER':
            from apps.inspections.models import VehicleInspection
            insps = list(VehicleInspection.objects.filter(controller=user)
                         .select_related('vehicle', 'booking').order_by('-inspection_date'))
            story += [Paragraph(f'{section_no}. Inspections réalisées ({len(insps)})', h2)]
            section_no += 1
            if insps:
                story.append(table(
                    ['Date', 'Type', 'Véhicule', 'Réservation', 'Score état', 'Problèmes'],
                    [[f'{i.inspection_date:%d/%m/%y %H:%M}', i.get_inspection_type_display(),
                      str(i.vehicle), f'BK-{i.booking_id:04d}' if i.booking_id else '—',
                      f'{i.condition_score}/100', str(len(i.issues or []))] for i in insps],
                    widths=[80, 70, 170, 80, 60, 60]))
            else:
                story.append(Paragraph('Aucune inspection réalisée.', body))
        elif user.role == 'DRIVER':
            bookings = list(user.driven_bookings.select_related('vehicle', 'client').order_by('-created_at'))
            story += [Paragraph(f'{section_no}. Courses effectuées ({len(bookings)})', h2)]
            section_no += 1
            if bookings:
                story.append(table(
                    ['Réf.', 'Véhicule', 'Client', 'Période', 'Statut', 'Prestation'],
                    [[f'BK-{b.pk:04d}', str(b.vehicle), b.client.get_full_name() or b.client.username,
                      f'{b.start_date:%d/%m/%y} → {b.end_date:%d/%m/%y}',
                      b.get_status_display(), f'{b.driver_fee} F'] for b in bookings],
                    widths=[60, 160, 120, 110, 70, 70]))
            else:
                story.append(Paragraph('Aucune course.', body))
        elif user.role == 'OWNER':
            from apps.bookings.models import Booking
            vehicles = list(user.vehicles.all())
            story += [Paragraph(f'{section_no}. Mes véhicules ({len(vehicles)})', h2)]
            section_no += 1
            if vehicles:
                story.append(table(
                    ['Véhicule', 'Plaque', 'Statut'],
                    [[str(v), v.plate or '—', v.get_status_display() if hasattr(v, 'get_status_display') else '—']
                     for v in vehicles],
                    widths=[230, 120, 130]))
            else:
                story.append(Paragraph('Aucun véhicule enregistré.', body))
            bookings = list(Booking.objects.filter(vehicle__owner=user)
                            .select_related('vehicle', 'client').order_by('-created_at'))
            story += [Paragraph(f'{section_no}. Locations de mes véhicules ({len(bookings)})', h2)]
            section_no += 1
            if bookings:
                story.append(table(
                    ['Réf.', 'Véhicule', 'Client', 'Période', 'Statut', 'Part propriétaire'],
                    [[f'BK-{b.pk:04d}', str(b.vehicle), b.client.get_full_name() or b.client.username,
                      f'{b.start_date:%d/%m/%y} → {b.end_date:%d/%m/%y}',
                      b.get_status_display(), f'{b.owner_amount} F'] for b in bookings],
                    widths=[60, 150, 110, 110, 70, 80]))
            else:
                story.append(Paragraph('Aucune location.', body))
        elif user.role != 'ADMIN':
            bookings = list(user.bookings.select_related('vehicle').order_by('-created_at'))
            story += [Paragraph(f'{section_no}. Réservations ({len(bookings)})', h2)]
            section_no += 1
            if bookings:
                story.append(table(
                    ['Réf.', 'Véhicule', 'Période', 'Statut', 'Montant'],
                    [[f'BK-{b.pk:04d}', str(b.vehicle), f'{b.start_date:%d/%m/%y} → {b.end_date:%d/%m/%y}',
                      b.get_status_display(), f'{b.subtotal} F'] for b in bookings],
                    widths=[60, 180, 120, 80, 70]))
            else:
                story.append(Paragraph('Aucune réservation.', body))

        if user.role in ('CLIENT', 'OWNER', 'DRIVER'):
            txs = list(WalletTransaction.objects.filter(user=user).order_by('-created_at'))
            story += [Paragraph(f'{section_no}. Transactions portefeuille ({len(txs)})', h2)]
            section_no += 1
            if txs:
                story.append(table(
                    ['Date', 'Type', 'Référence', 'Montant', 'Solde après'],
                    [[f'{t.created_at:%d/%m/%y %H:%M}', t.get_kind_display(), t.reference,
                      f'{t.amount} F', f'{t.balance_after} F'] for t in txs],
                    widths=[80, 90, 150, 80, 80]))
            else:
                story.append(Paragraph('Aucune transaction.', body))

        docs = list(UserDocument.objects.filter(user=user).order_by('-created_at'))
        kyc_files = [label for label, f in (
            ('CNI', user.id_document), ('Permis', user.driving_license),
            ('Justificatif de domicile', user.address_proof), ('Assurance', user.insurance)) if f]
        story += [Paragraph(f'{section_no}. Documents', h2),
                  Paragraph(f'Fichiers KYC du compte : {", ".join(kyc_files) if kyc_files else "aucun"}.', body)]
        section_no += 1
        if docs:
            story.append(table(
                ['Document', 'Type', 'Statut', 'Déposé le'],
                [[d.name, d.doc_type or '—', d.get_status_display(),
                  f'{d.created_at:%d/%m/%y}'] for d in docs],
                widths=[170, 110, 90, 90]))

        if user.role == 'CLIENT':
            story += [Paragraph(f'{section_no}. Parrainage', h2),
                      Paragraph(f'Code : {user.referral_code or "—"} · Filleuls : {user.referrals.count()} · Crédits : {user.referral_credits or 0} FCFA', body)]

        buffer = BytesIO()
        SimpleDocTemplate(buffer, pagesize=A4, leftMargin=40, rightMargin=40,
                          topMargin=40, bottomMargin=40,
                          title='Export données AutoLink Pro').build(story)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="autolink-mes-donnees-{user.username}.pdf"'
        return response


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

        role = request.data.get('role') or ''
        if role not in RegisterSerializer.PUBLIC_ROLES:
            role = ''
        code = f'{random.SystemRandom().randint(0, 999999):06d}'
        LoginCode.objects.filter(email=email).delete()
        login_code = LoginCode.objects.create(
            email=email, code=code, first_name=first_name, last_name=last_name,
            role=role, expires_at=timezone.now() + timedelta(minutes=10))
        try:
            send_mail(
                subject=f'AutoLink Pro — Votre code de connexion : {code}',
                message=f'Votre code de connexion AutoLink Pro : {code} (valable 10 minutes).',
                from_email=None,  # DEFAULT_FROM_EMAIL
                recipient_list=[email],
                html_message=_otp_email_html(code, first_name),
                fail_silently=False,
            )
        except Exception:
            # Échec SMTP : on libère le code pour ne pas bloquer une nouvelle
            # tentative (anti-spam 1/min) et on renvoie une erreur propre.
            login_code.delete()
            return Response({'detail': 'Envoi de l\'email impossible — réessayez plus tard.'}, status=502)
        return Response({'detail': 'Code envoyé.', 'email': email})


class PasswordResetView(APIView):
    """Réinitialise le mot de passe via le code OTP envoyé par email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        code = (request.data.get('code') or '').strip()
        new = request.data.get('new_password') or ''
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
        if len(new) < 8:
            return Response({'detail': 'Le nouveau mot de passe doit contenir au moins 8 caractères.'}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'detail': 'Aucun compte avec cet email.'}, status=404)
        user.set_password(new)
        user.save(update_fields=['password'])
        otp.delete()
        return Response({'status': 'ok'})


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
            role = otp.role or request.data.get('role')
            if role not in RegisterSerializer.PUBLIC_ROLES:
                role = 'CLIENT'
            user = User.objects.create_user(
                username=username, email=email,
                first_name=otp.first_name, last_name=otp.last_name,
                role=role, is_verified=True)
            user.set_unusable_password()
            user.save()
        if not user.is_active:
            return Response({'detail': 'Ce compte a été suspendu.'}, status=403)
        otp.delete()

        refresh = _safe_refresh(user)
        _record_session(request, user, refresh)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


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
            inspections_count=Count('vehicleinspection', distinct=True),
            client_rating=Avg('bookings__owner_rating'),
            client_rating_count=Count('bookings__owner_rating', distinct=True),
        ).order_by('-created_at')

    def get_serializer_class(self):
        return AdminUserCreateSerializer if self.request.method == 'POST' else AdminUserSerializer

    def perform_create(self, serializer):
        import secrets
        password = serializer.validated_data.get('password') or secrets.token_urlsafe(9)
        user = serializer.save(password=password)
        # Compte staff créé par l'admin : pas de parcours KYC — vérifié d'office.
        if user.role in ('CONTROLLER', 'ADMIN') and not user.is_verified:
            user.is_verified = True
            user.save(update_fields=['is_verified'])
        # Les identifiants partent par email — seul moyen pour le nouveau
        # compte de connaître son mot de passe (généré ou choisi par l'admin).
        if user.email:
            from .email_utils import send_staff_credentials_email
            send_staff_credentials_email(user, password)
        Notification.objects.create(
            user=user, title='Compte créé',
            message='Votre compte AutoLink Pro a été créé par l\'administration. Changez votre mot de passe dès la première connexion.')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin peut modifier et supprimer un compte."""
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.annotate(
            bookings_count=Count('bookings', distinct=True),
            vehicles_count=Count('vehicles', distinct=True),
            trips_count=Count('driven_bookings', distinct=True),
            inspections_count=Count('vehicleinspection', distinct=True),
            client_rating=Avg('bookings__owner_rating'),
            client_rating_count=Count('bookings__owner_rating', distinct=True),
        )

    def perform_update(self, serializer):
        if serializer.instance == self.request.user and serializer.validated_data.get('is_active') is False:
            raise ValidationError({'is_active': 'Vous ne pouvez pas suspendre votre propre compte.'})
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
            return Response({'detail': 'Impossible de supprimer un compte lié à des réservations ou véhicules.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserResetCredentialsView(APIView):
    """Régénère le mot de passe d'un compte et envoie les nouveaux
    identifiants par email. Toutes les sessions actives sont révoquées."""
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        import secrets
        from django.shortcuts import get_object_or_404
        user = get_object_or_404(User, pk=pk)
        if not user.email:
            return Response({'detail': 'Ce compte n\'a pas d\'email — impossible d\'envoyer les identifiants.'},
                            status=status.HTTP_400_BAD_REQUEST)
        password = secrets.token_urlsafe(9)
        user.set_password(password)
        user.save(update_fields=['password'])
        # Révoque toutes les sessions actives — le nouveau mot de passe
        # devient le seul moyen de connexion.
        for s in UserSession.objects.filter(user=user):
            _blacklist_jti(user, s.jti)
        from .email_utils import send_staff_credentials_email
        if not send_staff_credentials_email(user, password):
            return Response({'detail': 'Mot de passe réinitialisé mais l\'envoi de l\'email a échoué.'},
                            status=status.HTTP_502_BAD_GATEWAY)
        return Response({'status': 'ok'})


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
    """Marque toutes les notifications (ou une seule) comme lues — ou non lues."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        mark_unread = bool(request.data.get('unread'))
        qs = request.user.notifications.filter(is_read=mark_unread)
        if pk:
            qs = qs.filter(pk=pk)
        qs.update(is_read=not mark_unread)
        return Response({'unread': request.user.notifications.filter(is_read=False).count()})


class NotificationDetailView(APIView):
    """Suppression d'une notification de l'utilisateur connecté."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        deleted, _ = request.user.notifications.filter(pk=pk).delete()
        if not deleted:
            return Response({'detail': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


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
