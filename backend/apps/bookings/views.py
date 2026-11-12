import uuid
from datetime import timedelta
from decimal import Decimal
from io import BytesIO
from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction as db_transaction
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django.http import HttpResponse
from xml.sax.saxutils import escape
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Booking
from .serializers import BookingSerializer

# Transitions autorisées par rôle hors admin
CLIENT_ALLOWED_STATUS = {'cancelled'}
CLIENT_CANCELLABLE = {'pending', 'confirmed'}
DRIVER_ALLOWED_STATUS = {'active', 'completed'}


def _notify(user, title, message):
    """Notification in-app — ignorée si le client a désactivé le push dans ses préférences."""
    from apps.users.notif_utils import notify_user
    notify_user(user, title, message)


def _notify_legacy(user, title, message):
    from apps.users.notif_utils import notify_user
    notify_user(user, title, message)


def _assign_internal_driver(booking):
    """Assigne automatiquement un chauffeur interne AutoLink disponible."""
    from apps.users.models import User
    busy = Booking.objects.filter(
        status__in=('confirmed', 'active'),
        start_date__lte=booking.end_date,
        end_date__gte=booking.start_date,
        driver__isnull=False,
    ).values_list('driver_id', flat=True)
    driver = (User.objects
              .filter(role='DRIVER', is_active=True, driver_profile__is_online=True)
              .exclude(id__in=busy)
              .order_by('id')
              .first())
    if driver:
        booking.driver = driver
        booking.driver_response = 'offered'
        booking.save(update_fields=['driver', 'driver_response', 'updated_at'])
        _notify(driver, 'Nouvelle course',
                f'Vous êtes assigné à la location du véhicule {booking.vehicle} '
                f'du {booking.start_date} au {booking.end_date}. '
                f'Client : {booking.client.get_full_name()} — {booking.client.phone}')
    return driver


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'vehicle', 'owner_response', 'driver_type']
    search_fields = [
        'client__username', 'client__first_name', 'client__last_name',
        'client__email', 'vehicle__brand', 'vehicle__model', 'vehicle__plate',
        'status', 'dispute_reason',
    ]
    ordering_fields = ['created_at', 'start_date', 'end_date', 'subtotal', 'status', 'dispute_opened_at']

    def get_queryset(self):
        Booking.auto_complete_expired()
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Booking.objects.all()
        if user.role == 'CLIENT':
            qs = Booking.objects.filter(client=user)
            bucket = self.request.query_params.get('bucket')
            now = timezone.now()
            if bucket == 'upcoming':
                qs = qs.filter(status__in=['pending', 'confirmed'], start_date__gte=now)
            elif bucket == 'ongoing':
                qs = qs.filter(status='active')
            elif bucket == 'completed':
                qs = qs.filter(status='completed')
            elif bucket == 'cancelled':
                qs = qs.filter(status='cancelled')
            return qs
        if user.role == 'DRIVER':
            return Booking.objects.filter(driver=user)
        if user.role == 'OWNER':
            return Booking.objects.filter(vehicle__owner=user)
        return Booking.objects.none()

    def _driver_booking(self, user, booking):
        if user.role != 'DRIVER' or booking.driver_id != user.id:
            raise PermissionDenied('Cette course ne vous est pas assignée.')

    @action(detail=True, methods=['post'], url_path='driver-accept')
    def driver_accept(self, request, pk=None):
        booking = self.get_object()
        self._driver_booking(request.user, booking)
        if booking.status != 'confirmed' or booking.driver_response != 'offered':
            raise ValidationError({'detail': 'Cette course ne peut plus être acceptée.'})
        booking.driver_response = 'accepted'
        booking.save(update_fields=['driver_response', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], url_path='driver-refuse')
    def driver_refuse(self, request, pk=None):
        booking = self.get_object()
        self._driver_booking(request.user, booking)
        if booking.status != 'confirmed' or booking.driver_response not in ('offered', 'accepted'):
            raise ValidationError({'detail': 'Cette course ne peut plus être refusée.'})
        booking.driver_response = 'refused'
        booking.save(update_fields=['driver_response', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], url_path='driver-reset')
    def driver_reset(self, request, pk=None):
        """Annule un refus : la course repasse en 'offered' (en attente)."""
        booking = self.get_object()
        self._driver_booking(request.user, booking)
        if booking.driver_response != 'refused':
            raise ValidationError({'detail': 'Cette course n\'a pas été refusée.'})
        booking.driver_response = 'offered'
        booking.save(update_fields=['driver_response', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['get'], url_path='available-drivers')
    def available_drivers(self, request, pk=None):
        """Admin : liste des chauffeurs internes libres sur les dates de la réservation."""
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Réservé à l\'administration.')
        from apps.users.models import User
        booking = self.get_object()
        busy = Booking.objects.filter(
            status__in=('confirmed', 'active'),
            start_date__lte=booking.end_date,
            end_date__gte=booking.start_date,
            driver__isnull=False,
        ).exclude(id=booking.id).values_list('driver_id', flat=True)
        drivers = (User.objects
                   .filter(role='DRIVER', is_active=True)
                   .exclude(id__in=busy)
                   .select_related('driver_profile')
                   .order_by('first_name', 'last_name'))
        return Response([{
            'id': d.id,
            'name': d.get_full_name() or d.username,
            'phone': d.phone or '',
            'email': d.email,
            'is_online': getattr(getattr(d, 'driver_profile', None), 'is_online', False),
        } for d in drivers])

    @action(detail=True, methods=['post'], url_path='assign-driver')
    def assign_driver(self, request, pk=None):
        """Admin : assigne (ou réassigne) un chauffeur interne à la réservation."""
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Réservé à l\'administration.')
        booking = self.get_object()
        if booking.status not in ('pending', 'confirmed'):
            raise ValidationError({'status': 'Cette réservation ne peut plus recevoir de chauffeur.'})
        from apps.users.models import User
        driver_id = request.data.get('driver_id')
        if not driver_id:
            raise ValidationError({'driver_id': 'Ce champ est requis.'})
        driver = User.objects.filter(role='DRIVER', is_active=True, id=driver_id).first()
        if not driver:
            raise ValidationError({'driver_id': 'Chauffeur introuvable ou inactif.'})
        conflict = Booking.objects.filter(
            status__in=('confirmed', 'active'),
            start_date__lte=booking.end_date,
            end_date__gte=booking.start_date,
            driver_id=driver.id,
        ).exclude(id=booking.id).exists()
        if conflict:
            raise ValidationError({'driver_id': 'Ce chauffeur est déjà engagé sur ces dates.'})
        previous = booking.driver
        booking.driver = driver
        booking.driver_type = 'internal'
        booking.driver_response = 'offered'
        booking.save(update_fields=['driver', 'driver_type', 'driver_response', 'updated_at'])
        label = 'Course réassignée' if previous and previous.id != driver.id else 'Nouvelle course'
        _notify(driver, label,
                f'Vous êtes assigné à la location du véhicule {booking.vehicle} '
                f'du {booking.start_date} au {booking.end_date}. '
                f'Client : {booking.client.get_full_name()} — {booking.client.phone}')
        _notify(booking.client, 'Chauffeur assigné',
                f'{driver.get_full_name() or driver.username} a été assigné comme chauffeur '
                f'à votre réservation BK-{booking.pk:04d} ({booking.vehicle}).')
        return Response(self.get_serializer(booking).data)

    def _owner_booking(self, user, booking):
        if user.role != 'OWNER' or booking.vehicle.owner_id != user.id:
            raise PermissionDenied('Ce véhicule ne vous appartient pas.')
        if booking.owner_response != 'pending' or booking.status not in ('pending', 'confirmed'):
            raise ValidationError({'detail': 'Cette demande a déjà été traitée.'})

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Avis client : note du véhicule (rating/review) et/ou du chauffeur
        (driver_rating). Chaque note n'est attribuable qu'une seule fois."""
        booking = self.get_object()
        if booking.client_id != request.user.id:
            raise PermissionDenied('Cette réservation ne vous appartient pas.')

        def _note(key):
            try:
                v = int(request.data.get(key))
            except (TypeError, ValueError):
                return None
            if not 1 <= v <= 5:
                raise ValidationError({key: 'La note doit être comprise entre 1 et 5.'})
            return v

        rating = _note('rating')
        driver_rating = _note('driver_rating')
        saved = []

        if rating is not None:
            if booking.client_rating:
                raise ValidationError({'detail': 'Vous avez déjà évalué cette location.'})
            booking.client_rating = rating
            booking.client_review = (request.data.get('review') or '').strip()[:2000]
            saved += ['client_rating', 'client_review']

        if driver_rating is not None:
            if not booking.driver_id:
                raise ValidationError({'driver_rating': 'Aucun chauffeur sur cette réservation.'})
            if booking.driver_rating:
                raise ValidationError({'detail': 'Vous avez déjà noté ce chauffeur.'})
            booking.driver_rating = driver_rating
            saved.append('driver_rating')

        if not saved:
            raise ValidationError({'rating': 'La note doit être comprise entre 1 et 5.'})

        booking.save(update_fields=saved + ['updated_at'])

        if rating is not None:
            vehicle = booking.vehicle
            ratings = Booking.objects.filter(vehicle=vehicle, client_rating__isnull=False)
            vehicle.rating = Decimal(str(round(ratings.aggregate(v=Avg('client_rating'))['v'] or 0, 2)))
            vehicle.rating_count = ratings.count()
            vehicle.save(update_fields=['rating', 'rating_count', 'updated_at'])
            _notify(vehicle.owner, 'Nouvel avis client',
                    f'{booking.client.get_full_name()} a noté votre {vehicle} {rating}/5.')

        if driver_rating is not None:
            from apps.drivers.models import DriverProfile
            profile, _ = DriverProfile.objects.get_or_create(driver_id=booking.driver_id)
            dqs = Booking.objects.filter(driver_id=booking.driver_id, driver_rating__isnull=False)
            profile.rating = Decimal(str(round(dqs.aggregate(v=Avg('driver_rating'))['v'] or 0, 2)))
            profile.rating_count = dqs.count()
            profile.save(update_fields=['rating', 'rating_count'])
            comment = booking.client_review or (request.data.get('driver_review') or '').strip()[:2000]
            _notify(
                booking.driver, 'Nouvel avis client',
                f'{booking.client.get_full_name()} vous a noté {driver_rating}/5 '
                f'pour la course {booking}.'
                + (f'\n« {comment} »' if comment else ''),
            )

        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], url_path='rate-client')
    def rate_client(self, request, pk=None):
        """Le propriétaire note le locataire après une location terminée."""
        booking = self.get_object()
        if request.user.role != 'OWNER' or booking.vehicle.owner_id != request.user.id:
            raise PermissionDenied('Ce véhicule ne vous appartient pas.')
        if booking.status != 'completed':
            raise ValidationError({'detail': 'Le client ne peut être noté qu\'après la fin de la location.'})
        if booking.owner_rating:
            raise ValidationError({'detail': 'Vous avez déjà évalué ce locataire.'})
        try:
            rating = int(request.data.get('rating'))
        except (TypeError, ValueError):
            rating = 0
        if not 1 <= rating <= 5:
            raise ValidationError({'rating': 'La note doit être comprise entre 1 et 5.'})
        booking.owner_rating = rating
        booking.owner_review = (request.data.get('review') or '').strip()[:2000]
        booking.save(update_fields=['owner_rating', 'owner_review', 'updated_at'])
        comment = booking.owner_review
        _notify(
            booking.client, 'Avis du propriétaire',
            f'{booking.vehicle.owner.get_full_name()} vous a noté {rating}/5 '
            f'pour la location {booking}.'
            + (f'\n« {comment} »' if comment else ''),
        )
        return Response(self.get_serializer(booking).data)

    @action(detail=False, methods=['get'], url_path='owner-requests')
    def owner_requests(self, request):
        """Demandes de location en attente de réponse du propriétaire."""
        if request.user.role != 'OWNER':
            raise PermissionDenied('Réservé aux propriétaires.')
        queryset = self.filter_queryset(self.get_queryset().filter(
            owner_response='pending', status__in=('pending', 'confirmed'),
        ).order_by('start_date'))
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=True, methods=['post'], url_path='owner-accept')
    def owner_accept(self, request, pk=None):
        booking = self.get_object()
        self._owner_booking(request.user, booking)
        with db_transaction.atomic():
            if booking.modification:
                self._apply_modification(booking)
            booking.owner_response = 'accepted'
            booking.owner_responded_at = timezone.now()
            booking.save(update_fields=['owner_response', 'owner_responded_at', 'updated_at'])
        _notify(booking.client, 'Réservation acceptée',
                f'Le propriétaire a accepté votre réservation {booking}. '
                f'Le véhicule sera prêt le {booking.start_date}.')
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=['post'], url_path='owner-refuse')
    def owner_refuse(self, request, pk=None):
        booking = self.get_object()
        self._owner_booking(request.user, booking)
        reason = (request.data.get('reason') or '').strip()
        if booking.modification:
            # Refus de la modification : l'ancienne réservation reste d'actualité,
            # le supplément déjà réglé est recrédité.
            with db_transaction.atomic():
                delta = Decimal(str(booking.modification.get('delta', '0')))
                if booking.modification.get('delta_paid') and delta > 0:
                    from apps.payments.models import WalletTransaction
                    cl = booking.client
                    cl.balance = (cl.balance or 0) + delta
                    cl.save(update_fields=['balance', 'updated_at'])
                    WalletTransaction.objects.create(
                        user=cl, kind='refund', method='wallet', amount=delta,
                        balance_after=cl.balance, reference=f'BK-{booking.pk:04d}-MODREF',
                        note=f'Remboursement supplément — modification refusée {booking.vehicle}')
                booking.modification = None
                booking.save(update_fields=['modification', 'updated_at'])
            _notify(booking.client, 'Modification refusée',
                    f'Le propriétaire a refusé votre modification sur {booking}. '
                    f'Votre réservation initiale reste inchangée.')
            return Response(self.get_serializer(booking).data)
        with db_transaction.atomic():
            booking.owner_response = 'refused'
            booking.owner_responded_at = timezone.now()
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=['owner_response', 'owner_responded_at', 'status', 'updated_at'])
            booking.sync_vehicle_status()
            self._refund_full(booking)
        _notify(booking.client, 'Réservation refusée',
                f'Le propriétaire n’a pas pu accepter votre réservation {booking}. '
                f'{reason + " " if reason else ""}Tout paiement effectué vous a été remboursé.')
        return Response(self.get_serializer(booking).data)

    @staticmethod
    def _apply_modification(booking):
        """Le propriétaire valide la modification : application + remboursement
        d'un éventuel surcroît payé en trop par le client."""
        mod = booking.modification or {}
        patch = mod.get('patch') or {}
        from datetime import date as d_, time as t_
        for f, v in patch.items():
            if f in ('start_date', 'end_date'):
                setattr(booking, f, d_.fromisoformat(v))
            elif f in ('start_time', 'end_time'):
                setattr(booking, f, t_.fromisoformat(v) if v else None)
            else:
                setattr(booking, f, v)
        delta = Decimal(str(mod.get('delta', '0')))
        # Recalcule jours/prix depuis les nouvelles dates-heures
        from datetime import datetime as dtc, time as tz
        start = dtc.combine(booking.start_date, booking.start_time or tz(0, 0))
        end = dtc.combine(booking.end_date, booking.end_time or tz(0, 0))
        hours = max(1, (end - start).total_seconds() / 3600)
        booking.days = max(1, -(-int(hours * 60) // (24 * 60)))
        from apps.users.models import PlatformSettings
        booking.driver_fee = (Decimal(str(PlatformSettings.current().driver_daily_fee or 10000)) * booking.days) if booking.driver_type != Booking.DriverType.NONE else Decimal('0')
        if delta < 0:
            from apps.payments.models import WalletTransaction
            cl = booking.client
            refund = -delta
            cl.balance = (cl.balance or 0) + refund
            cl.save(update_fields=['balance', 'updated_at'])
            WalletTransaction.objects.create(
                user=cl, kind='refund', method='wallet', amount=refund,
                balance_after=cl.balance, reference=f'BK-{booking.pk:04d}-MODREF',
                note=f'Remboursement modification {booking.vehicle}')
        booking.modification = None
        booking.save()

    @action(detail=False, methods=['get'], url_path='owner-stats')
    def owner_stats(self, request):
        """Indicateurs du tableau de bord propriétaire (P1 / P6)."""
        if request.user.role != 'OWNER':
            raise PermissionDenied('Réservé aux propriétaires.')
        from apps.payments.models import Payment, Payout
        from apps.vehicles.models import Vehicle
        today = timezone.localdate()
        bookings = Booking.objects.filter(vehicle__owner=request.user)
        vehicles = Vehicle.objects.filter(owner=request.user)
        window_start = today - timedelta(days=30)
        booked_days = 0
        for start, end in bookings.filter(
            status__in=('confirmed', 'active', 'completed'),
            start_date__lte=today, end_date__gte=window_start,
        ).values_list('start_date', 'end_date'):
            booked_days += (min(end, today) - max(start, window_start)).days or 1
        fleet = vehicles.exclude(status__in=('pending', 'suspended')).count()
        occupancy = round(min(100, booked_days * 100 / (fleet * 30)), 1) if fleet else 0
        months = []
        cursor = today.replace(day=1)
        for _ in range(6):
            months.append(cursor)
            cursor = (cursor - timedelta(days=1)).replace(day=1)
        months.reverse()
        series = []
        for start in months:
            end = (start + timedelta(days=32)).replace(day=1)
            total = Payout.objects.filter(
                recipient=request.user, status='completed',
                processed_at__date__gte=start, processed_at__date__lt=end,
            ).aggregate(v=Sum('amount'))['v'] or Decimal('0')
            series.append({'month': start.strftime('%Y-%m'), 'revenue': total})
        pending_escrow = Payment.objects.filter(
            booking__vehicle__owner=request.user, status='completed', escrow_status='held',
        ).aggregate(v=Sum('owner_payout'))['v'] or Decimal('0')
        completed = bookings.filter(status='completed')
        revenue_days = completed.aggregate(v=Sum('days'))['v'] or 0
        revenue_total = completed.aggregate(v=Sum('owner_amount'))['v'] or Decimal('0')
        return Response({
            'occupancy_rate': occupancy,
            'average_rating': vehicles.aggregate(v=Avg('rating'))['v'] or 0,
            'reviews_count': bookings.exclude(client_rating__isnull=True).count(),
            'vehicles_total': vehicles.count(),
            'vehicles_online': vehicles.filter(status__in=('approved', 'rented')).count(),
            'vehicles_maintenance': vehicles.filter(status='maintenance').count(),
            'vehicles_pending': vehicles.filter(status='pending').count(),
            'pending_requests': bookings.filter(
                owner_response='pending', status__in=('pending', 'confirmed')).count(),
            'pending_escrow': pending_escrow,
            'revenue_total': revenue_total,
            'revenue_year': Payout.objects.filter(
                recipient=request.user, status='completed', processed_at__year=today.year,
            ).aggregate(v=Sum('amount'))['v'] or Decimal('0'),
            'revenue_per_day': (revenue_total / revenue_days).quantize(Decimal('1')) if revenue_days else 0,
            'monthly_series': series,
        })

    def create(self, request, *args, **kwargs):
        # Ajoute payment_url à la réponse quand un checkout externe est créé
        resp = super().create(request, *args, **kwargs)
        if getattr(self, '_last_payment_url', None):
            resp.data['payment_url'] = self._last_payment_url
            self._last_payment_url = None
        if getattr(self, '_last_payment_reference', None):
            resp.data['payment_reference'] = self._last_payment_reference
            self._last_payment_reference = None
        return resp

    @action(detail=False, methods=['post'])
    def quote(self, request):
        serializer = self.get_serializer(data=request.data, context={**self.get_serializer_context(), 'quote': True})
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data.pop('terms_accepted', None)
        data.pop('debit_authorized', None)
        vehicle = data['vehicle']
        booking = Booking(**data, daily_rate=vehicle.daily_rate or vehicle.computed_rate, deposit_amount=vehicle.deposit_amount or 0)
        booking.calculate_price()
        balance = request.user.balance or Decimal('0')
        required = booking.subtotal + booking.deposit_amount
        return Response({
            'days': booking.days, 'daily_rate': str(booking.daily_rate),
            'rental_amount': str(booking.subtotal - booking.driver_fee - booking.delivery_fee),
            'driver_fee': str(booking.driver_fee), 'delivery_fee': str(booking.delivery_fee),
            'subtotal': str(booking.subtotal), 'deposit_amount': str(booking.deposit_amount),
            'required_balance': str(required), 'balance': str(balance),
            'remaining_balance': str(balance - required),
            'shortfall': str(max(Decimal('0'), required - balance)),
        })

    def perform_create(self, serializer):
        request = self.request
        vehicle = serializer.validated_data['vehicle']
        start = serializer.validated_data['start_date']
        end = serializer.validated_data['end_date']
        driver_type = serializer.validated_data.get('driver_type', 'none')
        payment_method = request.data.get('payment_method')

        from apps.users.models import PlatformSettings
        if not PlatformSettings.current().bookings_enabled:
            raise ValidationError({'detail': 'Les réservations sont temporairement suspendues. Réessayez plus tard.'})

        # Conflit de dates : une réservation confirmée/active bloque la période
        conflict = Booking.objects.filter(
            vehicle=vehicle,
            status__in=('confirmed', 'active'),
            start_date__lte=end,
            end_date__gte=start,
        ).exists()
        if conflict:
            raise ValidationError({'vehicle': 'Ce véhicule est déjà réservé sur cette période.'})
        if vehicle.status not in ('approved',):
            raise ValidationError({'vehicle': 'Ce véhicule n\'est pas disponible à la location.'})
        if driver_type == 'owner' and not getattr(vehicle, 'driver_available', True):
            raise ValidationError({'driver_type': 'Ce propriétaire ne propose pas de chauffeur.'})

        with db_transaction.atomic():
            booking = serializer.save(client=request.user)

            # Paiement → confirmation automatique (aucune validation admin)
            if payment_method:
                if payment_method in ('stripe', 'paypal'):
                    # Paiement externe : la réservation reste 'pending' jusqu'au
                    # retour vérifié du provider (ou webhook Stripe).
                    url = self._pay_external(booking, payment_method, request)
                    self._last_payment_url = url
                    return
                if payment_method in ('mtn', 'orange'):
                    url, reference = self._pay_mobile(booking, payment_method, request)
                    if url:
                        self._last_payment_url = url
                    self._last_payment_reference = str(booking.pk)
                    return
                if payment_method != 'wallet':
                    raise ValidationError({'payment_method': 'Ce moyen de paiement n’est pas disponible.'})
                self._pay(booking, payment_method)
                booking.status = Booking.Status.CONFIRMED
                booking.save(update_fields=['status', 'updated_at'])

            # Chauffeur
            if driver_type == 'internal':
                _assign_internal_driver(booking)

            # Notification propriétaire
            suffix = (' Présentez-vous avec votre chauffeur au lieu de prise en charge.'
                      if driver_type == 'owner' else
                      ' Un chauffeur AutoLink a été assigné.' if driver_type == 'internal' else '')
            _notify(vehicle.owner, 'Nouvelle réservation',
                    f'Votre véhicule {vehicle} a été réservé par {booking.client.get_full_name()} '
                    f'du {start} au {end}.{suffix} '
                    f'Merci de le mettre à disposition à la date prévue.')
            # Admin + proprio : infos client + documents KYC du dossier
            cl = booking.client
            docs = ' | '.join(filter(None, [
                'CNI' if cl.id_document else '', 'Permis' if cl.driving_license else ''])) or 'aucun'
            detail = (f'{cl.get_full_name()} ({cl.email}, {cl.phone}) a réservé '
                      f'{vehicle} du {start} au {end} ({booking.days} j) — '
                      f'{booking.subtotal} FCFA + caution {booking.deposit_amount} FCFA. '
                      f'Documents : {docs}.')
            from apps.users.models import User as U
            for admin in U.objects.filter(role='ADMIN', is_active=True):
                _notify(admin, f'Réservation BK-{booking.pk:04d}', detail)
            _notify(vehicle.owner, 'Dossier client', detail)

            booking.sync_vehicle_status()

    def _pay(self, booking, method):
        """Encaisse le client : location + caution de garantie.
        Séquestre part proprio (85 %) + caution client bloqués jusqu'à la fin."""
        from apps.payments.models import Payment, WalletTransaction
        import uuid
        deposit = booking.deposit_amount or 0
        total = booking.subtotal + deposit
        payer = booking.client.__class__.objects.select_for_update().get(pk=booking.client_id)
        if method == 'wallet':
            if (payer.balance or 0) < total:
                raise ValidationError({
                    'payment': f'Solde insuffisant : {total} F requis '
                               f'({booking.subtotal} F location + {deposit} F caution).'
                })
            payer.balance -= total
            payer.save(update_fields=['balance', 'updated_at'])
            WalletTransaction.objects.create(
                user=payer, kind='debit', method='wallet', amount=booking.subtotal,
                balance_after=payer.balance + deposit, reference=f'BK-{booking.pk:04d}',
                note=f'Paiement location {booking.vehicle}',
            )
            if deposit:
                WalletTransaction.objects.create(
                    user=payer, kind='debit', method='wallet', amount=deposit,
                    balance_after=payer.balance, reference=f'BK-{booking.pk:04d}-DEP',
                    note=f'Caution bloquée {booking.vehicle}',
                )
        Payment.objects.create(
            booking=booking, payer=payer, method=method,
            status='completed', amount=booking.subtotal,
            commission=booking.commission_amount, owner_payout=booking.owner_amount,
            escrow_status='held', deposit_amount=deposit, deposit_status='held',
            transaction_ref=f'AL-{uuid.uuid4().hex[:12].upper()}',
            paid_at=timezone.now(),
        )

    def _pay_external(self, booking, method, request):
        """Crée une session Stripe/PayPal pour une réservation.
        Retourne l'URL de paiement hébergée ; confirmation au retour vérifié."""
        from apps.payments.models import Payment
        from apps.payments import providers
        base = request.build_absolute_uri('/api/payments/')
        label = f'Location {booking.vehicle} — AutoLink BK-{booking.pk:04d}'
        if method == 'stripe':
            r = providers.stripe_create_checkout(
                booking.subtotal + (booking.deposit_amount or 0), f'BK-{booking.pk:04d}', label,
                success_url=f'{base}stripe-return/?ctx=booking',
                cancel_url=f'{base}stripe-return/?canceled=1&ctx=booking',
                email=booking.client.email)
            ref, url = r['id'], r['url']
        else:
            r = providers.paypal_create_order(
                booking.subtotal + (booking.deposit_amount or 0), f'BK-{booking.pk:04d}', label,
                return_url=f'{base}paypal-return/?ctx=booking',
                cancel_url=f'{base}paypal-return/?canceled=1&ctx=booking')
            ref, url = r['id'], r['approval_url']
        Payment.objects.create(
            booking=booking, payer=booking.client, method=method,
            status='pending', amount=booking.subtotal,
            commission=booking.commission_amount, owner_payout=booking.owner_amount,
            escrow_status='held', deposit_amount=booking.deposit_amount or 0,
            deposit_status='held', transaction_ref=ref,
        )
        return url

    def _pay_mobile(self, booking, method, request):
        from apps.payments.models import Payment
        from apps.payments import providers
        if not (providers.mtn_configured() if method == 'mtn' else providers.orange_configured()):
            raise ValidationError({'payment_method': 'Moyen de paiement non configuré.'})
        phone = request.data.get('phone')
        if not phone:
            raise ValidationError({'phone': 'Le numéro de téléphone est requis.'})
        ref = f'BK-{booking.pk}-{uuid.uuid4().hex[:8]}'
        payment = Payment.objects.create(
            booking=booking, payer=booking.client, method=method, status='pending',
            amount=booking.subtotal + (booking.deposit_amount or 0),
            commission=booking.commission_amount, owner_payout=booking.owner_amount,
            escrow_status='held', deposit_amount=booking.deposit_amount or 0,
            deposit_status='held', transaction_ref=ref,
        )
        if method == 'mtn':
            result = providers.mtn_request_to_pay(payment.amount, phone, ref)
            payment.provider_ref = result['provider_ref']
            payment.provider_status = result['status']
            payment.save(update_fields=['provider_ref', 'provider_status'])
            return None, ref
        result = providers.orange_create_payment(
            payment.amount, ref, ref,
            f'{settings.FRONTEND_URL}/client/bookings?orange=return&ref={booking.pk}',
            f'{settings.FRONTEND_URL}/client/bookings?payment=canceled',
            request.build_absolute_uri('/api/payments/orange-notification/'))
        payment.provider_ref = ref
        payment.provider_token = result['notif_token']
        payment.provider_pay_token = result['pay_token']
        payment.provider_status = 'PENDING'
        payment.save(update_fields=['provider_ref', 'provider_token', 'provider_pay_token', 'provider_status'])
        return result['payment_url'], ref

    def perform_update(self, serializer):
        """Transitions de statut selon le rôle — l'admin n'intervient plus en routine."""
        booking = serializer.instance
        user = self.request.user
        new_status = self.request.data.get('status')

        if user.role in ('ADMIN', 'CONTROLLER'):
            # Les litiges passent obligatoirement par /resolve-dispute/
            if new_status == 'completed' and booking.status in ('confirmed', 'active'):
                booking.finish()
                serializer.instance = booking
            else:
                serializer.save()
                serializer.instance.sync_vehicle_status()
            return

        if user.role == 'CLIENT':
            if booking.client_id != user.id:
                raise PermissionDenied('Cette réservation ne vous appartient pas.')
            if new_status is None:
                self._edit_client_booking(serializer, booking, user)
                return
            if new_status not in CLIENT_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
            if booking.status not in CLIENT_CANCELLABLE:
                raise ValidationError({'status': 'Cette réservation ne peut plus être annulée.'})
            serializer.save(status='cancelled')
            serializer.instance.sync_vehicle_status()
            self._refund_client_cancel(serializer.instance)
            return

        if user.role == 'DRIVER':
            self._driver_booking(user, booking)
            if new_status not in DRIVER_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
            if new_status == 'active' and (
                booking.status != 'confirmed' or booking.driver_response != 'accepted'
            ):
                raise ValidationError({'status': 'Acceptez la course avant de la démarrer.'})
            if new_status == 'completed' and booking.status != 'active':
                raise ValidationError({'status': 'Seule une course en cours peut être terminée.'})
            if new_status == 'completed':
                booking.finish()  # statut + véhicule libéré + caution versée + notifs
                serializer.instance = booking
            else:
                serializer.save(status=new_status)
                serializer.instance.sync_vehicle_status()
            return

        if user.role == 'OWNER':
            # Le propriétaire peut marquer sa voiture récupérée → fin de location
            if booking.vehicle.owner_id != user.id:
                raise PermissionDenied('Ce véhicule ne vous appartient pas.')
            if new_status == 'completed' and booking.status in ('confirmed', 'active'):
                booking.finish()
                serializer.instance = booking
                return
            raise PermissionDenied('Action non autorisée.')

        raise PermissionDenied('Modification non autorisée.')

    def _edit_client_booking(self, serializer, booking, user):
        if booking.status not in ('pending', 'confirmed') or booking.start_date <= timezone.localdate():
            raise ValidationError({'detail': 'Cette réservation ne peut plus être modifiée.'})
        changes = {f for f, v in serializer.validated_data.items() if getattr(booking, f) != v}
        allowed = {'start_date', 'end_date', 'start_time', 'end_time', 'pickup_address', 'dropoff_address', 'notes', 'driver_type'}
        if not changes <= allowed:
            raise PermissionDenied('Seules les dates, les lieux, les notes et le chauffeur sont modifiables.')
        try:
            payment = booking.payment
        except Exception:
            payment = None
        paid_wallet = bool(payment and payment.method == 'wallet' and payment.status == 'completed')
        price_fields = {'start_date', 'end_date', 'driver_type'}

        start = serializer.validated_data.get('start_date', booking.start_date)
        end = serializer.validated_data.get('end_date', booking.end_date)
        if end <= start:
            raise ValidationError({'end_date': 'La date de fin doit suivre la date de début.'})
        if paid_wallet and changes & {'start_date', 'end_date'}:
            if start <= timezone.localdate():
                raise ValidationError({'start_date': 'La nouvelle date de début doit être future.'})
            conflict = Booking.objects.filter(
                vehicle=booking.vehicle, status__in=('confirmed', 'active'),
                start_date__lte=end, end_date__gte=start,
            ).exclude(pk=booking.pk).exists()
            if conflict:
                raise ValidationError({'start_date': 'Le véhicule est déjà réservé sur cette période.'})

        # Proposition en attente de validation proprietaire : la reservation
        # actuelle reste d'actualite tant que le proprio ne valide pas.
        vd = serializer.validated_data
        merged = {
            f: vd.get(f, getattr(booking, f))
            for f in ('start_date', 'end_date', 'start_time', 'end_time',
                      'driver_type', 'pickup_address', 'dropoff_address', 'notes')
        }
        probe = Booking(
            vehicle=booking.vehicle, client=booking.client,
            start_date=merged['start_date'], end_date=merged['end_date'],
            start_time=merged['start_time'], end_time=merged['end_time'],
            driver_type=merged['driver_type'],
            delivery_requested=booking.delivery_requested,
            daily_rate=booking.daily_rate, deposit_amount=booking.deposit_amount,
        )
        from datetime import datetime as dtc, time as tz
        _s = dtc.combine(merged['start_date'], merged['start_time'] or tz(0, 0))
        _e = dtc.combine(merged['end_date'], merged['end_time'] or tz(0, 0))
        probe.days = max(1, -(-int((_e - _s).total_seconds() / 60) // 1440))
        from apps.users.models import PlatformSettings
        _ps = PlatformSettings.current()
        probe.driver_fee = (Decimal(str(_ps.driver_daily_fee or 10000)) * probe.days) if merged['driver_type'] != Booking.DriverType.NONE else Decimal('0')
        probe.delivery_fee = Decimal(str(_ps.delivery_fee or 5000)) if booking.delivery_requested else Decimal('0')
        probe.discount_percent = 10 if probe.days >= 30 else 5 if probe.days > 3 else 0
        gross = probe.daily_rate * probe.days * Decimal(100 - probe.discount_percent) / 100
        new_subtotal = (gross + probe.driver_fee + probe.delivery_fee).quantize(Decimal('0.01'))
        delta = new_subtotal - booking.subtotal
        from apps.payments.models import WalletTransaction
        from apps.users.models import User
        with db_transaction.atomic():
            # Net : on ne retient que l'extra total voulu, en compensant
            # l'extra déjà prélevé sur une précédente proposition.
            prev = booking.modification or {}
            prev_extra = Decimal(str(prev.get('delta', '0'))) if prev.get('delta_paid') else Decimal('0')
            want_extra = delta if delta > 0 else Decimal('0')
            net = want_extra - prev_extra
            wuser = User.objects.select_for_update().get(pk=user.pk)
            if net > 0:
                if (wuser.balance or 0) < net:
                    raise ValidationError(
                        {'detail': f'Solde insuffisant — supplément de {net:.0f} FCFA requis. '
                                   f'Rechargez votre portefeuille AutoLink.'})
                wuser.balance -= net
                wuser.save(update_fields=['balance', 'updated_at'])
                WalletTransaction.objects.create(
                    user=wuser, kind='debit', method='wallet', amount=net,
                    balance_after=wuser.balance, reference=f'BK-{booking.pk:04d}-EXTRA',
                    note=f'Supplément modification {booking.vehicle}')
            elif net < 0:
                wuser.balance += -net
                wuser.save(update_fields=['balance', 'updated_at'])
                WalletTransaction.objects.create(
                    user=wuser, kind='refund', method='wallet', amount=-net,
                    balance_after=wuser.balance, reference=f'BK-{booking.pk:04d}-MODREF',
                    note=f'Réajustement modification {booking.vehicle}')
            booking.modification = {
                'patch': {k: str(v) for k, v in merged.items() if k in changes},
                'delta': str(delta), 'subtotal': str(new_subtotal),
                'delta_paid': want_extra > 0,
            }
            booking.save(update_fields=['modification', 'updated_at'])
        _notify(booking.vehicle.owner, 'Modification à valider',
                f'{user.get_full_name()} propose : {merged["start_date"]} {merged["start_time"] or ""} '
                f'→ {merged["end_date"]} {merged["end_time"] or ""}, '
                f'prise en charge {merged["pickup_address"]}, restitution {merged["dropoff_address"]}. '
                f'Delta : {delta:+.0f} FCFA{", supplément réglé" if want_extra > 0 else ""}. '
                f'Validez ou refusez pour conserver l\u2019ancienne réservation.')
        _notify(user, 'Modification envoyée',
                f'Votre demande de modification ({delta:+.0f} FCFA) attend la validation '
                f'du propriétaire. L\u2019ancienne réservation reste d\u2019actualité.')

    def _receipt_pdf(self, booking):
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle, HRFlowable)
        from apps.users.email_utils import get_user_language

        language = get_user_language(booking.client)
        teal = colors.HexColor('#0d7a6f')
        light = colors.HexColor('#e6f5f3')
        ink = colors.HexColor('#1f2937')
        mute = colors.HexColor('#6b7280')
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4,
                                     leftMargin=18 * mm, rightMargin=18 * mm,
                                     topMargin=14 * mm, bottomMargin=14 * mm)
        brand = ParagraphStyle('brand', fontName='Helvetica-Bold', fontSize=20, textColor=colors.white)
        tagline = ParagraphStyle('tagline', fontName='Helvetica', fontSize=8.5, textColor=colors.HexColor('#b8e6e0'))
        ref_style = ParagraphStyle('ref', fontName='Helvetica-Bold', fontSize=11, textColor=colors.white, alignment=2)
        h2 = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=10.5, textColor=teal, spaceBefore=8, spaceAfter=4)
        base = ParagraphStyle('base', fontName='Helvetica', fontSize=9.5, textColor=ink, leading=13)
        foot = ParagraphStyle('foot', fontName='Helvetica', fontSize=8, textColor=mute, alignment=1)

        try:
            payment = booking.payment
            method = payment.get_method_display()
            payment_status = payment.get_status_display()
            if language == 'en':
                method = {'wallet': 'Wallet', 'mtn': 'MTN Mobile Money', 'orange': 'Orange Money',
                          'senbid': 'SenBid', 'paybid': 'PayBid', 'stripe': 'Card (Stripe)', 'paypal': 'PayPal'}.get(payment.method, method)
                payment_status = {'pending': 'Pending', 'completed': 'Confirmed',
                                  'failed': 'Failed', 'refunded': 'Refunded'}.get(payment.status, payment_status)
        except Exception:
            method, payment_status = '—', 'Pending' if language == 'en' else 'En attente'

        tr = {
            'receipt': 'REÇU DE RÉSERVATION' if language != 'en' else 'BOOKING RECEIPT',
            'client': 'Client' if language != 'en' else 'Customer',
            'vehicle': 'Véhicule' if language != 'en' else 'Vehicle',
            'dates': 'Période' if language != 'en' else 'Dates',
            'days': 'jour(s)' if language != 'en' else 'day(s)',
            'rate': 'Tarif journalier' if language != 'en' else 'Daily rate',
            'discount': 'Remise' if language != 'en' else 'Discount',
            'subtotal': 'Sous-total' if language != 'en' else 'Subtotal',
            'deposit': 'Caution (séquestre)' if language != 'en' else 'Deposit (escrow)',
            'payment': 'Paiement' if language != 'en' else 'Payment',
            'issued': 'Date d’émission' if language != 'en' else 'Issue date',
            'footer': ('AutoLink Pro — location de véhicules vérifiés · Douala & Yaoundé · '
                       + str(settings.CONTACT_EMAIL)) if language != 'en'
                      else 'AutoLink Pro — verified car rentals · Douala & Yaoundé · ' + str(settings.CONTACT_EMAIL),
        }

        header = Table(
            [[Paragraph('AutoLink Pro', brand), Paragraph(tr['receipt'] + '<br/><font size="9">BK-' + format(booking.pk, '04d') + '</font>', ref_style)],
             [Paragraph('Location de véhicules vérifiés — Cameroun', tagline), '']],
            colWidths=[115 * mm, 60 * mm])
        header.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), teal),
            ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
            ('TOPPADDING', (0, 0), (-1, 0), 12), ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('SPAN', (0, 1), (1, 1)),
        ]))

        def kv(label, value):
            return [Paragraph(label, base), Paragraph(str(value), base)]

        info = Table([
            kv(tr['client'], escape(booking.client.get_full_name()) + ' — ' + escape(booking.client.email or '')),
            kv(tr['vehicle'], escape(booking.vehicle.brand) + ' ' + escape(booking.vehicle.model) + ' · ' + escape(booking.vehicle.plate)),
            kv(tr['dates'], str(booking.start_date) + ' → ' + str(booking.end_date) + ' (' + str(booking.days) + ' ' + tr['days'] + ')'),
            kv(tr['payment'], str(method) + ' — ' + str(payment_status)),
            kv(tr['issued'], timezone.localdate().isoformat()),
        ], colWidths=[40 * mm, 135 * mm])
        info.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -2), 0.4, colors.HexColor('#e5e7eb')),
            ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TEXTCOLOR', (0, 0), (0, -1), mute),
        ]))

        def amount_row(label, value, strong=False):
            s = ParagraphStyle('ar', parent=base, fontName='Helvetica-Bold' if strong else 'Helvetica',
                               textColor=teal if strong else ink, fontSize=10 if strong else 9.5)
            lbl = ParagraphStyle('arl', parent=base, textColor=mute)
            return [Paragraph(label, lbl), Paragraph(value, s)]

        amounts = Table([
            amount_row(tr['rate'], str(booking.daily_rate) + ' FCFA'),
            amount_row(tr['discount'], str(booking.discount_percent) + ' %'),
            amount_row(tr['subtotal'], str(booking.subtotal) + ' FCFA', strong=True),
            amount_row(tr['deposit'], str(booking.deposit_amount) + ' FCFA', strong=True),
        ], colWidths=[120 * mm, 55 * mm])
        amounts.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), light),
            ('BOX', (0, 0), (-1, -1), 0.8, teal),
            ('LINEABOVE', (0, 2), (-1, 2), 0.6, teal),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))

        story = [
            header, Spacer(1, 16),
            info, Spacer(1, 14),
            amounts, Spacer(1, 20),
            HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#e5e7eb')), Spacer(1, 8),
            Paragraph(tr['footer'], foot),
            Paragraph('Merci de votre confiance — document généré automatiquement, valable sans signature.', foot),
        ]
        document.build(story)
        return buffer.getvalue()

    def _can_access_receipt(self, booking, user):
        if booking.client_id == user.id or booking.vehicle.owner_id == user.id or booking.driver_id == user.id or user.role == 'ADMIN':
            return
        raise PermissionDenied('Vous ne pouvez pas accéder à ce reçu.')

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        booking = self._receipt_booking(pk)
        self._can_access_receipt(booking, request.user)
        response = HttpResponse(self._receipt_pdf(booking), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="recu-BK-{booking.pk:04d}.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='contract')
    def contract(self, request, pk=None):
        booking = self._receipt_booking(pk)
        self._can_access_receipt(booking, request.user)
        response = HttpResponse(self._contract_pdf(booking), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="contrat-BK-{booking.pk:04d}.pdf"'
        return response

    def _contract_pdf(self, booking):
        """Contrat de location préliminaire — PDF professionnel avec clauses CEMAC."""
        from html import escape
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        teal = colors.HexColor('#0d6e64')
        gray = colors.HexColor('#64748b')
        buf = BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                                topMargin=16 * mm, bottomMargin=16 * mm)
        styles = getSampleStyleSheet()
        title = ParagraphStyle('t', parent=styles['Title'], textColor=colors.white, fontSize=18)
        sub = ParagraphStyle('s', parent=styles['Normal'], textColor=colors.white, fontSize=10)
        h = ParagraphStyle('h', parent=styles['Heading2'], textColor=teal, spaceBefore=10)
        body = ParagraphStyle('b', parent=styles['Normal'], fontSize=9.5, leading=13)

        header = Table([[Paragraph('AutoLink Pro', title)],
                        [Paragraph(f'CONTRAT DE LOCATION PRÉLIMINAIRE — BK-{booking.pk:04d}', sub)]],
                       colWidths=[175 * mm])
        header.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), teal),
            ('LEFTPADDING', (0, 0), (-1, -1), 14), ('RIGHTPADDING', (0, 0), (-1, -1), 14),
            ('TOPPADDING', (0, 0), (-1, 0), 12), ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
        ]))

        def kv(l, v):
            return [Paragraph(l, body), Paragraph(str(v), body)]
        parties = Table([
            [Paragraph('Loueur', h), Paragraph('Locataire', h)],
            [Paragraph('AutoLink Pro SAS — Hub Douala Akwa<br/>Douala, Cameroun — RC/DLA.2024.B.4187', body),
             Paragraph(escape(booking.client.get_full_name()) + '<br/>' + escape(booking.client.email or '') + '<br/>' + escape(booking.client.phone or ''), body)],
        ], colWidths=[88 * mm, 87 * mm])
        parties.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, gray), ('INNERGRID', (0, 0), (-1, -1), 0.25, gray),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        veh = booking.vehicle
        details = Table([
            kv('Véhicule', f'{veh.brand} {veh.model} ({veh.year or ""}) — Immat. {veh.plate}'),
            kv('Période', f'{booking.start_date} → {booking.end_date} ({booking.days} jour(s))'),
            kv('Prise en charge', escape(booking.pickup_address or 'À convenir')),
            kv('Restitution', escape(booking.dropoff_address or 'À convenir')),
            kv('Chauffeur', escape(booking.driver.get_full_name() if booking.driver_id else 'Sans chauffeur')),
            kv('Total location', f'{booking.subtotal or booking.total_price:,.0f} FCFA'.replace(',', ' ')),
            kv('Caution (séquestre)', f'{booking.deposit_amount:,.0f} FCFA — restituée 100% après inspection'.replace(',', ' ')),
        ], colWidths=[45 * mm, 130 * mm])
        details.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#cbd5e1')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))

        clauses = [
            'Le locataire déclare détenir les pièces requises (CNI, permis valide le cas échéant) conformément à la réglementation CEMAC.',
            'La caution sous séquestre est restituée intégralement sous 15 jours après restitution conforme du véhicule.',
            'Toute annulation pendant la location : caution remboursée à 100%, seuls les jours restants sont remboursés.',
            'Le kilométrage forfaitaire de 250 km/jour s\'applique — 150 FCFA/km supplémentaire.',
            'Assurance Tous Risques Activa Assurances incluse dans le tarif (collision, vol, assistance 24/7).',
            'Ce contrat préliminaire sera confirmé par la signature du contrat définitif à la prise en charge.',
        ]
        sig = Table([
            [Paragraph('Le Loueur', body), Paragraph('Le Locataire', body)],
            [Paragraph('<br/><br/>_____________________', body), Paragraph('<br/><br/>_____________________', body)],
            [Paragraph('AutoLink Pro — ' + timezone.localdate().isoformat(), body), Paragraph(escape(booking.client.get_full_name()), body)],
        ], colWidths=[88 * mm, 87 * mm])
        sig.setStyle(TableStyle([('TOPPADDING', (0, 0), (-1, -1), 8)]))

        doc.build([header, Spacer(1, 10 * mm), Paragraph('Parties au contrat', h), parties,
                   Paragraph('Objet de la location', h), details,
                   Paragraph('Clauses générales', h)] +
                  [Paragraph(f'{i}. {c}', body) for i, c in enumerate(clauses, 1)] +
                  [Spacer(1, 8 * mm), sig])
        buf.seek(0)
        return buf.getvalue()

    @action(detail=True, methods=['post'], url_path='receipt/email')
    def email_receipt(self, request, pk=None):
        booking = self._receipt_booking(pk)
        self._can_access_receipt(booking, request.user)
        from apps.users.email_utils import get_user_language

        language = get_user_language(booking.client)
        reference = f'BK-{booking.pk:04d}'
        if language == 'en':
            subject = f'Your AutoLink Pro receipt — {reference}'
            body = 'Please find your booking receipt attached.'
            filename = f'receipt-{reference}.pdf'
            detail = 'Receipt sent by email.'
        else:
            subject = f'Votre reçu AutoLink Pro — {reference}'
            body = 'Veuillez trouver votre reçu de réservation en pièce jointe.'
            filename = f'recu-{reference}.pdf'
            detail = 'Reçu envoyé par email.'
        email = EmailMessage(
            subject=subject,
            body=body,
            to=[booking.client.email],
        )
        email.attach(filename, self._receipt_pdf(booking), 'application/pdf')
        email.send(fail_silently=False)
        return Response({'detail': detail}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='confirmation-email')
    def confirmation_email(self, request, pk=None):
        """Envoie le mail de confirmation détaillé + reçu et contrat en pièces jointes."""
        booking = self._receipt_booking(pk)
        self._can_access_receipt(booking, request.user)
        from apps.users.email_utils import get_user_language

        language = get_user_language(booking.client)
        reference = f'BK-{booking.pk:04d}'
        details = (f'Vehicule : {booking.vehicle}\nPeriode : {booking.start_date} → {booking.end_date}\n'
                   f'Total : {booking.subtotal or booking.total_price} FCFA\nCaution : {booking.deposit_amount} FCFA\n')
        if language == 'en':
            subject = f'Booking confirmed — {reference} | AutoLink Pro'
            body = f'Hello {booking.client.first_name or booking.client.username},\n\nYour booking is confirmed.\n{details}\nReceipt and preliminary contract attached.\n— AutoLink Pro'
        else:
            subject = f'Reservation confirmee — {reference} | AutoLink Pro'
            body = (f'Bonjour {booking.client.first_name or booking.client.username},\n\nVotre reservation est confirmee.\n{details}\n'
                    'Recu et contrat preliminaire en pieces jointes.\n— AutoLink Pro')
        email = EmailMessage(subject=subject, body=body, to=[booking.client.email])
        email.attach(f'recu-{reference}.pdf', self._receipt_pdf(booking), 'application/pdf')
        email.attach(f'contrat-{reference}.pdf', self._contract_pdf(booking), 'application/pdf')
        email.send(fail_silently=False)
        return Response({'detail': 'Confirmation envoyée.'}, status=status.HTTP_200_OK)

    @staticmethod
    def _receipt_booking(pk):
        try:
            return Booking.objects.select_related('client', 'vehicle', 'vehicle__owner').get(pk=pk)
        except Booking.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Réservation introuvable.')

    @action(detail=False, methods=['get'], url_path='client-dashboard')
    def client_dashboard(self, request):
        if request.user.role != 'CLIENT':
            raise PermissionDenied('Réservé aux clients.')
        from apps.payments.models import Payment
        now = timezone.now()
        qs = Booking.objects.filter(client=request.user)
        paid = qs.exclude(status='cancelled')
        # Séries mensuelles (6 derniers mois) : dépenses + locations
        monthly = (
            paid.filter(start_date__gte=now - timezone.timedelta(days=185))
            .annotate(month=TruncMonth('start_date'))
            .values('month')
            .annotate(total=Sum('subtotal'), count=Count('id'))
            .order_by('month')
        )
        driver_split = paid.values('driver_type').annotate(count=Count('id'))
        disputes = qs.filter(status='disputed').count()
        cancelled = qs.filter(status='cancelled').count()
        completed = paid.filter(status='completed').count()
        trust = max(0, min(100, 100 - 5 * cancelled - 15 * disputes + 2 * completed))
        return Response({
            'balance': request.user.balance,
            'held_deposit': Payment.objects.filter(
                payer=request.user, status__in=('completed', 'succeeded'), deposit_status='held',
            ).exclude(booking__status__in=('completed', 'cancelled'))
                .aggregate(v=Sum('deposit_amount'))['v'] or Decimal('0'),
            'bookings_total': qs.count(),
            'upcoming': qs.filter(status__in=['pending', 'confirmed'], start_date__gte=now).count(),
            'ongoing': qs.filter(status='active').count(),
            'completed': completed,
            'cancelled': cancelled,
            'average_rating': qs.aggregate(v=Avg('owner_rating'))['v'] or 0,
            'trust_score': round(trust, 1),
            'monthly': list(monthly),
            'driver_split': list(driver_split),
        })

    @action(detail=False, methods=['get'], url_path='client-stats')
    def client_stats(self, request):
        if request.user.role != 'CLIENT':
            raise PermissionDenied('Réservé aux clients.')
        bookings = Booking.objects.filter(client=request.user)
        return Response({
            'average_rating': bookings.aggregate(value=Avg('owner_rating'))['value'] or 0,
            'rated_count': bookings.exclude(owner_rating__isnull=True).count(),
            'distinct_vehicles': bookings.values('vehicle_id').distinct().count(),
            'bookings_total': bookings.count(),
            'total_spent': bookings.exclude(status='cancelled').aggregate(
                value=Sum('subtotal'))['value'] or Decimal('0'),
        })

    @staticmethod
    def _refund_full(booking):
        """Annulation PROPRIETAIRE : remboursement integral location + caution."""
        try:
            payment = booking.payment
        except Exception:
            return
        if payment.escrow_status == 'held':
            payment.refund_client()

    @staticmethod
    def _refund_client_cancel(booking):
        """Annulation client : remboursement selon la politique avant/après le début.
        - Avant le début : réservation 100 % remboursée + caution remboursée
          partiellement (AutoLink conserve cancel_deposit_keep_percent %).
        - À/after le début : caution 100 % remboursée + seuls les jours restants
          de location sont remboursés (le jour d'annulation inclus est dû)."""
        from apps.payments.models import WalletTransaction
        from apps.users.models import PlatformSettings, User
        try:
            payment = booking.payment
        except Exception:
            return
        if payment.escrow_status != 'held':
            return
        now = timezone.now()
        from datetime import datetime as dt_cls, time as dtime
        start_dt = timezone.make_aware(dt_cls.combine(
            booking.start_date, booking.start_time or dtime(0, 0)))
        deposit = Decimal(str(payment.deposit_amount or 0))
        client = User.objects.select_for_update().get(pk=booking.client_id)
        if now < start_dt:
            keep_pct = Decimal(str(PlatformSettings.current().cancel_deposit_keep_percent or 0))
            refund_res = booking.subtotal
            refund_dep = (deposit * (100 - keep_pct) / 100).quantize(Decimal('0.01'))
            kept = deposit - refund_dep
            detail = (f'{refund_res:.0f} FCFA de location (100 %) et {refund_dep:.0f} FCFA '
                      f'de caution ({100 - keep_pct:.0f} %) ont été recrédités.')
            if kept > 0:
                admin = User.objects.filter(role='ADMIN', is_active=True).order_by('id').first()
                if admin:
                    admin.balance = (admin.balance or 0) + kept
                    admin.save(update_fields=['balance'])
                    WalletTransaction.objects.create(
                        user=admin, kind='topup', method='wallet', amount=kept,
                        balance_after=admin.balance, reference=f'BK-{booking.pk:04d}-KEEP',
                        note=f'Part de caution conservée — annulation {booking}')
        else:
            remaining = max(0, (booking.end_date - now.date()).days)
            daily_part = (booking.subtotal - (booking.delivery_fee or 0)) / max(1, booking.days)
            refund_res = (daily_part * remaining).quantize(Decimal('0.01'))
            refund_dep = deposit
            detail = (f'la caution de {refund_dep:.0f} FCFA (100 %) et {refund_res:.0f} FCFA '
                      f'pour les {remaining} jour(s) restants ont été recrédités.')
        total = refund_res + refund_dep
        with db_transaction.atomic():
            client.balance = (client.balance or 0) + total
            client.save(update_fields=['balance', 'updated_at'])
            if total > 0:
                WalletTransaction.objects.create(
                    user=client, kind='refund', method='wallet', amount=total,
                    balance_after=client.balance, reference=f'BK-{booking.pk:04d}-REF',
                    note=f'Remboursement annulation {booking.vehicle}')
            payment.escrow_status = 'refunded'
            payment.deposit_status = 'released'
            payment.status = 'refunded'
            payment.save(update_fields=['escrow_status', 'deposit_status', 'status'])
        _notify(client, 'Réservation annulée',
                f'Votre réservation {booking} a été annulée : {detail}')

    @action(detail=True, methods=['post'])
    def dispute(self, request, pk=None):
        """Le client signale une panne / un problème → caution gelée, litige ouvert."""
        booking = self.get_object()
        if booking.client_id != request.user.id:
            raise PermissionDenied('Cette réservation ne vous appartient pas.')
        if booking.status not in ('confirmed', 'active'):
            raise ValidationError({'status': 'Aucun litige possible sur cette réservation.'})
        reason = request.data.get('reason', '').strip()
        booking.status = Booking.Status.DISPUTED
        booking.dispute_reason = reason
        booking.dispute_opened_at = timezone.now()
        booking.save(update_fields=['status', 'dispute_reason', 'dispute_opened_at', 'updated_at'])
        try:
            payment = booking.payment
            if payment.escrow_status == 'held':
                payment.escrow_status = 'disputed'
                payment.save(update_fields=['escrow_status'])
        except Exception:
            pass
        # Notifier les admins pour arbitrage
        from apps.users.models import User
        for admin in User.objects.filter(role='ADMIN', is_active=True):
            _notify(admin, 'Litige à arbitrer',
                    f'{booking.client.get_full_name()} signale un problème sur {booking} : '
                    f'{reason or "non précisé"}. La caution est gelée.')
        _notify(booking.vehicle.owner, 'Litige ouvert',
                f'Un litige a été ouvert sur la location de votre véhicule {booking.vehicle}. '
                f'La caution reste bloquée en attendant l\'arbitrage AutoLink.')
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], url_path='resolve-dispute')
    def resolve_dispute(self, request, pk=None):
        """Arbitrage admin : decision = 'release' (proprio payé) ou 'refund' (client remboursé)."""
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Arbitrage réservé à l\'administration.')
        booking = self.get_object()
        if booking.status != 'disputed':
            raise ValidationError({'status': 'Cette réservation n\'est pas en litige.'})
        decision = request.data.get('decision')
        try:
            payment = booking.payment
        except Exception:
            payment = None
        if decision == 'refund':
            if payment:
                payment.escrow_status = 'held'
                payment.save(update_fields=['escrow_status'])
                payment.refund_client()
            elif booking.deposit_amount:
                # Pas d'objet Payment (résa sans règlement enregistré) :
                # la caution affichée au séquestre est quand même recréditée.
                from apps.payments.models import WalletTransaction
                client = booking.client
                client.balance = (client.balance or 0) + booking.deposit_amount
                client.save(update_fields=['balance', 'updated_at'])
                WalletTransaction.objects.create(
                    user=client, kind='refund', amount=booking.deposit_amount,
                    balance_after=client.balance,
                    reference=f'REFUND-BK-{booking.pk:04d}',
                    note=f'Caution remboursée — arbitrage litige {booking}',
                )
            booking.status = Booking.Status.CANCELLED
            _notify(booking.client, 'Litige résolu',
                    f'Votre litige sur {booking} a été tranché en votre faveur. '
                    f'Vous avez été remboursé sur votre solde.')
            _notify(booking.vehicle.owner, 'Litige résolu',
                    f'Le litige sur votre véhicule {booking.vehicle} a été tranché '
                    f'en faveur du client. La caution a été remboursée.')
        elif decision == 'release':
            if payment:
                payment.escrow_status = 'held'
                payment.save(update_fields=['escrow_status'])
            elif booking.deposit_amount:
                # Caution sans Payment : versée au propriétaire comme dédommagement.
                from apps.payments.models import WalletTransaction
                owner = booking.vehicle.owner
                owner.balance = (owner.balance or 0) + booking.deposit_amount
                owner.save(update_fields=['balance', 'updated_at'])
                WalletTransaction.objects.create(
                    user=owner, kind='topup', amount=booking.deposit_amount,
                    balance_after=owner.balance,
                    reference=f'DISPUTE-BK-{booking.pk:04d}',
                    note=f'Caution retenue — arbitrage litige {booking} en votre faveur',
                )
            booking.status = Booking.Status.COMPLETED
            _notify(booking.vehicle.owner, 'Litige résolu',
                    f'Le litige sur votre véhicule {booking.vehicle} a été tranché '
                    f'en votre faveur. Votre part et la caution client ont été versées.')
            _notify(booking.client, 'Litige résolu',
                    f'Votre litige sur {booking} a été tranché en faveur du propriétaire. '
                    f'La caution a été conservée à titre de dédommagement.')
        else:
            raise ValidationError({'decision': 'Valeur attendue : "release" ou "refund".'})
        booking.save(update_fields=['status', 'updated_at'])
        booking.sync_vehicle_status()
        if booking.status == 'completed' and payment:
            payment.release_escrow()   # part propriétaire
            payment.forfeit_deposit()  # caution client versée au propriétaire
        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'])
    def disputes(self, request):
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Liste réservée à l’administration.')
        queryset = self.get_queryset().filter(dispute_reason__gt='')
        state = request.query_params.get('state', 'open')
        if state == 'open':
            queryset = queryset.filter(status='disputed')
        elif state == 'resolved':
            queryset = queryset.exclude(status='disputed')
        else:
            raise ValidationError({'state': 'Valeurs possibles : open, resolved.'})
        queryset = self.filter_queryset(queryset)
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques globales — réservé ADMIN/CONTROLLER."""
        if request.user.role not in ('ADMIN', 'CONTROLLER'):
            return Response({'detail': 'Non autorisé.'}, status=403)

        from apps.users.models import User
        from apps.vehicles.models import Vehicle

        Booking.auto_complete_expired()
        agg = Booking.objects.aggregate(
            total=Count('id'),
            revenue=Sum('subtotal'),
            commission=Sum('commission_amount'),
        )
        by_status = dict(
            Booking.objects.values_list('status').annotate(n=Count('id'))
        )
        return Response({
            'users': User.objects.count(),
            'vehicles': Vehicle.objects.count(),
            'vehicles_pending': Vehicle.objects.filter(status='pending').count(),
            'bookings_total': agg['total'] or 0,
            'bookings_pending': by_status.get('pending', 0),
            'bookings_active': by_status.get('active', 0) + by_status.get('confirmed', 0),
            'bookings_disputed': by_status.get('disputed', 0),
            'revenue_total': agg['revenue'] or 0,
            'commission_total': agg['commission'] or 0,
        })
