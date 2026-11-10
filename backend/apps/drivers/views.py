from django.db import transaction
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from io import BytesIO
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from config.pagination import StandardPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import DriverApplication, DriverEarning, DriverProfile
from .serializers import DriverApplicationSerializer, DriverEarningSerializer, DriverProfileSerializer


def _promote_to_driver(app):
    """Candidature approuvée → le compte devient chauffeur (rôle DRIVER + profil).
    Candidats anonymes (formulaire landing) : on rattache le compte existant
    portant le même email, s'il y en a un. Un email est envoyé au chauffeur :
    identifiants + mot de passe temporaire s'il n'en a pas, sinon simple
    notification d'activation (son mot de passe reste valable)."""
    import secrets
    import string
    from django.core.mail import send_mail
    from django.conf import settings as dj_settings
    from apps.users.models import User
    user = app.applicant
    if user is None and app.email:
        user = User.objects.filter(email__iexact=app.email).first()
        if user is not None and app.applicant_id is None:
            app.applicant = user
            app.save(update_fields=['applicant'])
    if user is None:
        # Candidature anonyme sans compte : on crée le compte chauffeur
        # (mot de passe inutilisable → un temporaire sera envoyé par email).
        if not app.email:
            return
        parts = (app.full_name or '').strip().split(None, 1)
        base = app.email.split('@')[0]
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f'{base}{i}'
        user = User.objects.create_user(
            username=username, email=app.email,
            first_name=parts[0] if parts else '',
            last_name=parts[1] if len(parts) > 1 else '',
            role='DRIVER',
        )
        user.phone = app.phone or ''
        user.set_unusable_password()
        user.save(update_fields=['phone', 'password'])
        app.applicant = user
        app.save(update_fields=['applicant'])
    if user.role != 'DRIVER':
        user.role = 'DRIVER'
        user.save(update_fields=['role'])
    DriverProfile.objects.get_or_create(driver=user)

    # Email d'activation chauffeur
    if not user.email:
        return
    temp_password = None
    if not user.has_usable_password():
        alphabet = string.ascii_letters + string.digits
        temp_password = ''.join(secrets.choice(alphabet) for _ in range(10))
        user.set_password(temp_password)
        user.save(update_fields=['password'])
    name = user.get_full_name() or user.username
    if temp_password:
        send_mail(
            subject='AutoLink Pro — Votre compte chauffeur est activé',
            message=(
                f'Bonjour {name},\n\n'
                'Votre candidature chauffeur AutoLink Pro a été approuvée.\n\n'
                f'Email : {user.email}\n'
                f'Mot de passe temporaire : {temp_password}\n\n'
                'Connectez-vous puis changez ce mot de passe dans Paramètres.\n'
                f'{dj_settings.FRONTEND_URL}/login\n\n'
                '— L\'équipe AutoLink Pro'
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )
    else:
        send_mail(
            subject='AutoLink Pro — Votre compte chauffeur est activé',
            message=(
                f'Bonjour {name},\n\n'
                'Bonne nouvelle : votre candidature chauffeur AutoLink Pro a été approuvée.\n'
                'Connectez-vous avec votre email et votre mot de passe habituel '
                f'pour accéder à votre espace chauffeur : {dj_settings.FRONTEND_URL}/login\n\n'
                '— L\'équipe AutoLink Pro'
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return getattr(obj, 'applicant', None) == request.user or getattr(obj, 'driver', None) == request.user


class IsDriverRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DRIVER'


class DriverApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = DriverApplicationSerializer

    def get_permissions(self):
        # La candidature publique (landing « Postuler ») est ouverte à tous ;
        # la consultation/modification reste réservée aux authentifiés.
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverApplication.objects.all()
        return DriverApplication.objects.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user if self.request.user.is_authenticated else None)

    def perform_update(self, serializer):
        if self.request.user.role == 'ADMIN':
            serializer.save(reviewer=self.request.user, reviewed_at=timezone.now())
        else:
            serializer.save()

    # Actions dédiées admin — 'status' est read-only dans le serializer,
    # donc le PATCH simple ne change rien (et un candidat ne doit pas
    # pouvoir s'auto-approuver via PATCH direct).
    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def approve(self, request, pk=None):
        app = self.get_object()
        app.status = DriverApplication.Status.APPROVED
        app.reviewer = request.user
        app.reviewed_at = timezone.now()
        app.save(update_fields=['status', 'reviewer', 'reviewed_at'])
        # Le candidat approuvé devient chauffeur : rôle + profil opérationnel
        if app.status == DriverApplication.Status.APPROVED:
            _promote_to_driver(app)
        return Response(self.get_serializer(app).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def reject(self, request, pk=None):
        app = self.get_object()
        app.status = DriverApplication.Status.REJECTED
        app.reviewer = request.user
        app.reviewed_at = timezone.now()
        app.save(update_fields=['status', 'reviewer', 'reviewed_at'])
        return Response(self.get_serializer(app).data)


class DriverProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverProfile.objects.select_related('driver', 'assigned_vehicle').order_by('-certified_at')
        return DriverProfile.objects.filter(driver=self.request.user).order_by('-certified_at')

    @action(detail=False, methods=['patch'])
    def availability(self, request):
        if request.user.role != 'DRIVER':
            raise PermissionDenied('Cette action est réservée aux chauffeurs.')
        if not isinstance(request.data.get('is_online'), bool):
            raise ValidationError({'is_online': 'Indiquez true ou false.'})
        profile, _ = DriverProfile.objects.get_or_create(driver=request.user)
        profile.is_online = request.data['is_online']
        profile.save(update_fields=['is_online'])
        return Response(self.get_serializer(profile).data)

    @action(detail=False, methods=['get'])
    def earnings(self, request):
        if request.user.role != 'DRIVER':
            raise PermissionDenied('Cette action est réservée aux chauffeurs.')
        profile, _ = DriverProfile.objects.get_or_create(driver=request.user)
        earning_months = {
            row['month'].strftime('%Y-%m'): row
            for row in DriverEarning.objects.filter(driver=request.user)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(earnings=Sum('amount'), trips=Count('id'))
        }
        today = timezone.localdate()
        months = []
        for offset in reversed(range(12)):
            month = today.month - offset
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            month_key = f'{year:04d}-{month:02d}'
            aggregate = earning_months.get(month_key, {})
            months.append({
                'month': month_key,
                'earnings': aggregate.get('earnings', 0),
                'trips': aggregate.get('trips', 0),
            })
        return Response({
            'total_earned': profile.total_earned,
            'monthly_earnings': months,
            'rating': profile.rating,
            'rating_count': profile.rating_count,
            'total_trips': profile.total_trips,
        })


class DriverEarningListView(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverEarningSerializer
    permission_classes = [IsDriverRole]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'booking__vehicle__brand', 'booking__vehicle__model', 'booking__vehicle__plate',
        'booking__client__username', 'booking__client__email',
        'booking__client__first_name', 'booking__client__last_name',
    ]
    ordering_fields = ['created_at', 'amount', 'booking__start_date']
    ordering = ['-created_at']

    @action(detail=True, methods=['get'], url_path='receipt')
    def receipt(self, request, pk=None):
        """Reçu PDF du gain crédité au chauffeur pour une course."""
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle, HRFlowable)
        e = self.get_object()
        teal = colors.HexColor('#0d7a6f')
        light = colors.HexColor('#e6f5f3')
        mute = colors.HexColor('#6b7280')
        base = ParagraphStyle('b', fontName='Helvetica', fontSize=9.5, leading=13)
        lbl = ParagraphStyle('l', parent=base, textColor=mute)
        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm)
        header = Table([[Paragraph('AutoLink Pro', ParagraphStyle('br', fontName='Helvetica-Bold', fontSize=20, textColor=colors.white)),
                         Paragraph(f'REÇU DE GAIN<br/><font size="9">BK-{e.booking_id:04d}</font>', ParagraphStyle('r', fontName='Helvetica-Bold', fontSize=11, textColor=colors.white, alignment=2))]],
                       colWidths=[115 * mm, 60 * mm])
        header.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), teal), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                                    ('LEFTPADDING', (0, 0), (-1, -1), 14), ('TOPPADDING', (0, 0), (-1, -1), 12), ('BOTTOMPADDING', (0, 0), (-1, -1), 12)]))
        def kv(k, v): return [Paragraph(k, lbl), Paragraph(str(v), base)]
        b = e.booking
        info = Table([
            kv('Référence gain', f'GE-{e.id:04d}'),
            kv('Course', f'BK-{b.id:04d} — {b.vehicle.brand} {b.vehicle.model} ({b.vehicle.plate})'),
            kv('Période', f'{b.start_date} → {b.end_date}'),
            kv('Chauffeur', e.driver.get_full_name() or e.driver.username),
            kv('Client', b.client.get_full_name() or b.client.username),
            kv('Crédité le', e.created_at.strftime('%d/%m/%Y à %H:%M')),
        ], colWidths=[45 * mm, 130 * mm])
        info.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, -2), 0.4, colors.HexColor('#e5e7eb')),
                                  ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
        amounts = Table([[kv('Montant crédité au chauffeur', f'+{e.amount} FCFA')]],
                        colWidths=[120 * mm, 55 * mm])
        amounts.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), light), ('BOX', (0, 0), (-1, -1), 0.8, teal),
                                     ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                                     ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                                     ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10)]))
        doc.build([header, Spacer(1, 16), info, Spacer(1, 14), amounts, Spacer(1, 16),
                   HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#e5e7eb')), Spacer(1, 8),
                   Paragraph(f'AutoLink Pro — Douala & Yaoundé · Émis le {timezone.localdate()}',
                             ParagraphStyle('f', fontName='Helvetica', fontSize=8, textColor=mute, alignment=1))])
        from django.http import HttpResponse
        resp = HttpResponse(buf.getvalue(), content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="recu-gain-GE-{e.id:04d}.pdf"'
        return resp

    def get_queryset(self):
        return DriverEarning.objects.filter(driver=self.request.user).select_related(
            'booking__vehicle', 'booking__client',
        )


class AdminDriverProfileViewSet(DriverProfileViewSet):
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return DriverProfile.objects.select_related('driver', 'assigned_vehicle').order_by('-certified_at')

    @action(detail=False, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request):
        """Active / désactive le compte d'un chauffeur approuvé (is_active)."""
        from django.shortcuts import get_object_or_404
        from apps.users.models import User
        driver = get_object_or_404(User, pk=request.data.get('driver'), role='DRIVER')
        driver.is_active = not driver.is_active
        driver.save(update_fields=['is_active'])
        return Response({'driver': driver.id, 'is_active': driver.is_active})


class AdminDriverApplicationViewSet(DriverApplicationViewSet):
    """Candidatures côté admin — lecture + décision, tout est réservé ADMIN."""
    permission_classes = [IsAdminRole]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_permissions(self):
        # Même pour 'create' : l'application publique reste sur /applications/
        return [IsAdminRole()]

    def get_queryset(self):
        return DriverApplication.objects.select_related('applicant', 'reviewer').order_by('-applied_at')

    def perform_update(self, serializer):
        """Le statut est read-only côté serializer : l'admin le change via PATCH
        et l'approbation promeut le candidat (rôle DRIVER + profil)."""
        new_status = self.request.data.get('status')
        if new_status in DriverApplication.Status.values:
            app = serializer.instance
            app.status = new_status
            app.reviewer = self.request.user
            app.reviewed_at = timezone.now()
            app.save(update_fields=['status', 'reviewer', 'reviewed_at'])
            serializer.instance.refresh_from_db()
            if new_status == DriverApplication.Status.APPROVED:
                _promote_to_driver(app)
        serializer.save()
