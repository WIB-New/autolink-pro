import uuid
from datetime import timedelta
from decimal import Decimal
from io import BytesIO
from django.conf import settings
from django.core.mail import EmailMessage
from django.db import transaction as db_transaction
from django.db.models import Sum, Count, Avg
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
    from apps.users.models import Notification
    if user:
        Notification.objects.create(user=user, title=title, message=message)


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
            return Booking.objects.filter(client=user)
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
        if booking.status != 'confirmed' or booking.driver_response != 'offered':
            raise ValidationError({'detail': 'Cette course ne peut plus être refusée.'})
        booking.driver_response = 'refused'
        booking.save(update_fields=['driver_response', 'updated_at'])
        return Response(self.get_serializer(booking).data)

    def _owner_booking(self, user, booking):
        if user.role != 'OWNER' or booking.vehicle.owner_id != user.id:
            raise PermissionDenied('Ce véhicule ne vous appartient pas.')
        if booking.owner_response != 'pending' or booking.status not in ('pending', 'confirmed'):
            raise ValidationError({'detail': 'Cette demande a déjà été traitée.'})

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Avis client sur une location terminée : met à jour la note moyenne du véhicule."""
        booking = self.get_object()
        if booking.client_id != request.user.id:
            raise PermissionDenied('Cette réservation ne vous appartient pas.')
        if booking.status != 'completed':
            raise ValidationError({'detail': 'Seule une location terminée peut être évaluée.'})
        if booking.client_rating:
            raise ValidationError({'detail': 'Vous avez déjà évalué cette location.'})
        try:
            rating = int(request.data.get('rating'))
        except (TypeError, ValueError):
            rating = 0
        if not 1 <= rating <= 5:
            raise ValidationError({'rating': 'La note doit être comprise entre 1 et 5.'})
        booking.client_rating = rating
        booking.client_review = (request.data.get('review') or '').strip()[:2000]
        booking.save(update_fields=['client_rating', 'client_review', 'updated_at'])
        vehicle = booking.vehicle
        ratings = Booking.objects.filter(vehicle=vehicle, client_rating__isnull=False)
        vehicle.rating = Decimal(str(round(ratings.aggregate(v=Avg('client_rating'))['v'] or 0, 2)))
        vehicle.rating_count = ratings.count()
        vehicle.save(update_fields=['rating', 'rating_count', 'updated_at'])
        _notify(vehicle.owner, 'Nouvel avis client',
                f'{booking.client.get_full_name()} a noté votre {vehicle} {rating}/5.')
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
        with db_transaction.atomic():
            booking.owner_response = 'refused'
            booking.owner_responded_at = timezone.now()
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=['owner_response', 'owner_responded_at', 'status', 'updated_at'])
            booking.sync_vehicle_status()
            self._refund_if_paid(booking)
        _notify(booking.client, 'Réservation refusée',
                f'Le propriétaire n’a pas pu accepter votre réservation {booking}. '
                f'{reason + " " if reason else ""}Tout paiement effectué vous a été remboursé.')
        return Response(self.get_serializer(booking).data)

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
            self._refund_if_paid(serializer.instance)
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
        changes = set(serializer.validated_data)
        allowed = {'start_date', 'end_date', 'pickup_address', 'dropoff_address', 'notes', 'driver_type'}
        if not changes <= allowed:
            raise PermissionDenied('Seules les dates, les lieux, les notes et le chauffeur sont modifiables.')
        try:
            payment = booking.payment
        except Exception:
            payment = None
        paid_wallet = bool(payment and payment.method == 'wallet' and payment.status == 'completed')
        price_fields = {'start_date', 'end_date', 'driver_type'}
        if not paid_wallet and changes & price_fields:
            raise ValidationError({'detail': 'Pour modifier les dates ou le chauffeur, annulez puis effectuez une nouvelle réservation.'})

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

        old_subtotal = booking.subtotal
        with db_transaction.atomic():
            if paid_wallet:
                from apps.users.models import User
                wallet_user = User.objects.select_for_update().get(pk=user.pk)
            serializer.save()
            difference = booking.subtotal - old_subtotal if paid_wallet else Decimal('0')
            if difference:
                if difference > 0 and wallet_user.balance < difference:
                    raise ValidationError({'balance': 'Solde insuffisant pour cette modification.'})
                wallet_user.balance = wallet_user.balance - difference
                wallet_user.save(update_fields=['balance', 'updated_at'])
                from apps.payments.models import WalletTransaction
                WalletTransaction.objects.create(
                    user=wallet_user,
                    kind='debit' if difference > 0 else 'refund',
                    method='wallet',
                    amount=abs(difference),
                    balance_after=wallet_user.balance,
                    reference=f'BK-EDIT-{booking.pk}',
                    note=f'Ajustement de prix {booking}',
                )
                payment.amount = booking.subtotal
                payment.commission = booking.commission_amount
                payment.owner_payout = booking.owner_amount
                payment.save(update_fields=['amount', 'commission', 'owner_payout'])

    def _receipt_pdf(self, booking):
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from apps.users.email_utils import get_user_language

        language = get_user_language(booking.client)
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        try:
            payment = booking.payment
            method = payment.get_method_display()
            payment_status = payment.get_status_display()
            if language == 'en':
                method = {
                    'wallet': 'Wallet',
                    'mtn': 'MTN Mobile Money',
                    'orange': 'Orange Money',
                    'senbid': 'SenBid',
                    'paybid': 'PayBid',
                    'stripe': 'Card (Stripe)',
                    'paypal': 'PayPal',
                }.get(payment.method, method)
                payment_status = {
                    'pending': 'Pending',
                    'completed': 'Confirmed',
                    'failed': 'Failed',
                    'refunded': 'Refunded',
                }.get(payment.status, payment_status)
        except Exception:
            method, payment_status = '—', 'Pending' if language == 'en' else 'En attente'
        if language == 'en':
            lines = [
                '<b>AutoLink Pro</b>',
                f'Contact: {settings.CONTACT_EMAIL}',
                f'Booking receipt BK-{booking.pk:04d}',
                f'Client: {escape(booking.client.get_full_name())} ({escape(booking.client.email)})',
                f'Vehicle: {escape(booking.vehicle.brand)} {escape(booking.vehicle.model)} — {escape(booking.vehicle.plate)}',
                f'Dates: {booking.start_date.isoformat()} to {booking.end_date.isoformat()} ({booking.days} days)',
                f'Daily rate: {booking.daily_rate} FCFA',
                f'Discount: {booking.discount_percent}%',
                f'Subtotal: {booking.subtotal} FCFA',
                f'Deposit: {booking.deposit_amount} FCFA',
                f'Payment method: {method} — {payment_status}',
                f'Issue date: {timezone.localdate().isoformat()}',
            ]
        else:
            lines = [
                '<b>AutoLink Pro</b>',
                f'Contact : {settings.CONTACT_EMAIL}',
                f'Reçu de réservation BK-{booking.pk:04d}',
                f'Client : {escape(booking.client.get_full_name())} ({escape(booking.client.email)})',
                f'Véhicule : {escape(booking.vehicle.brand)} {escape(booking.vehicle.model)} — {escape(booking.vehicle.plate)}',
                f'Dates : {booking.start_date} au {booking.end_date} ({booking.days} jour(s))',
                f'Tarif journalier : {booking.daily_rate} FCFA',
                f'Remise : {booking.discount_percent} %',
                f'Sous-total : {booking.subtotal} FCFA',
                f'Caution : {booking.deposit_amount} FCFA',
                f'Moyen de paiement : {method} — {payment_status}',
                f'Date d’émission : {timezone.localdate()}',
            ]
        story = []
        for line in lines:
            story.extend((Paragraph(line, styles['Normal']), Spacer(1, 10)))
        document.build(story)
        return buffer.getvalue()

    def _can_access_receipt(self, booking, user):
        if booking.client_id == user.id or booking.vehicle.owner_id == user.id or user.role == 'ADMIN':
            return
        raise PermissionDenied('Vous ne pouvez pas accéder à ce reçu.')

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        booking = self._receipt_booking(pk)
        self._can_access_receipt(booking, request.user)
        response = HttpResponse(self._receipt_pdf(booking), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="recu-BK-{booking.pk:04d}.pdf"'
        return response

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

    @staticmethod
    def _receipt_booking(pk):
        try:
            return Booking.objects.select_related('client', 'vehicle', 'vehicle__owner').get(pk=pk)
        except Booking.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Réservation introuvable.')

    @action(detail=False, methods=['get'], url_path='client-stats')
    def client_stats(self, request):
        if request.user.role != 'CLIENT':
            raise PermissionDenied('Réservé aux clients.')
        bookings = Booking.objects.filter(client=request.user)
        return Response({
            'average_rating': bookings.aggregate(value=Avg('client_rating'))['value'] or 0,
            'rated_count': bookings.exclude(client_rating__isnull=True).count(),
            'distinct_vehicles': bookings.values('vehicle_id').distinct().count(),
            'bookings_total': bookings.count(),
            'total_spent': bookings.exclude(status='cancelled').aggregate(
                value=Sum('subtotal'))['value'] or Decimal('0'),
        })

    @staticmethod
    def _refund_if_paid(booking):
        """Annulation client avant le début : remboursement intégral sur le solde."""
        try:
            payment = booking.payment
        except Exception:
            return
        if payment.escrow_status == 'held':
            payment.refund_client()
            _notify(booking.client, 'Réservation annulée',
                    f'Votre réservation {booking} a été annulée. '
                    f'{payment.amount} FCFA ont été recrédités sur votre solde.')

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
