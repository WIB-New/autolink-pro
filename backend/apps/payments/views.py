import csv
import json
import uuid
import hmac
from datetime import date
from decimal import Decimal
from django.conf import settings
from django.db import transaction as db_transaction
from django.db.models import Count, Sum, Q
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from django.http import HttpResponseRedirect
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from config.pagination import StandardPagination
from .models import Payment, Payout, WalletTransaction, WithdrawalRequest
from apps.bookings.models import Booking
from apps.drivers.models import DriverEarning
from .serializers import (
    FinanceTransactionSerializer, PaymentSerializer, PayoutSerializer, WalletTransactionSerializer,
    TopUpSerializer, WithdrawalRequestSerializer,
)
from . import providers


class FinanceAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


def _month_start(value):
    return date(value.year, value.month, 1)


def _next_month(value):
    return date(value.year + (value.month == 12), value.month % 12 + 1, 1)


def _completed_payments():
    return Payment.objects.filter(status=Payment.Status.COMPLETED)


class FinanceStatsView(APIView):
    permission_classes = [FinanceAdminPermission]

    def get(self, request):
        today = timezone.localdate()
        month_start = _month_start(today)
        month_payments = _completed_payments().filter(
            paid_at__date__gte=month_start, paid_at__date__lte=today)
        month_payouts = Payout.objects.filter(
            status=Payment.Status.COMPLETED,
            processed_at__date__gte=month_start,
            processed_at__date__lte=today,
        )
        payment_totals = month_payments.aggregate(
            revenue=Coalesce(Sum('amount'), Decimal('0.00')),
            commission=Coalesce(Sum('commission'), Decimal('0.00')),
            transaction_count=Count('id'),
        )
        driver_earnings = DriverEarning.objects.filter(
            created_at__date__gte=month_start, created_at__date__lte=today,
        ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.00')))['total']
        monthly_series = []
        month = month_start
        for _ in range(12):
            monthly_series.append(month)
            previous_year = month.year - (month.month == 1)
            previous_month = month.month - 1 if month.month > 1 else 12
            month = date(previous_year, previous_month, 1)
        monthly_series.reverse()
        series = []
        for start in monthly_series:
            end = _next_month(start)
            payments = _completed_payments().filter(
                paid_at__date__gte=start, paid_at__date__lt=end)
            payouts = Payout.objects.filter(
                status=Payment.Status.COMPLETED,
                processed_at__date__gte=start, processed_at__date__lt=end,
            )
            payment_sums = payments.aggregate(
                revenue=Coalesce(Sum('amount'), Decimal('0.00')),
                commission=Coalesce(Sum('commission'), Decimal('0.00')),
            )
            earning_total = DriverEarning.objects.filter(
                created_at__date__gte=start, created_at__date__lt=end,
            ).aggregate(total=Coalesce(Sum('amount'), Decimal('0.00')))['total']
            series.append({
                'month': start.strftime('%Y-%m'),
                'revenue': payment_sums['revenue'],
                'commission': payment_sums['commission'],
                'driver_earnings': earning_total,
                'platform_net': payment_sums['commission'] - earning_total,
                'owner_payouts': payouts.aggregate(
                    total=Coalesce(Sum('amount'), Decimal('0.00')))['total'],
            })
        methods = list(month_payments.values('method').annotate(
            amount=Coalesce(Sum('amount'), Decimal('0.00')),
            transactions=Count('id'),
        ).order_by('method'))
        return Response({
            'month': month_start.strftime('%Y-%m'),
            'revenue': payment_totals['revenue'],
            'commission': payment_totals['commission'],
            'driver_earnings': driver_earnings,
            'platform_net': payment_totals['commission'] - driver_earnings,
            'owner_payouts': month_payouts.aggregate(
                total=Coalesce(Sum('amount'), Decimal('0.00')))['total'],
            'transaction_count': payment_totals['transaction_count'],
            'monthly_series': series,
            'payment_methods': methods,
        })


class FinanceTransactionListView(generics.ListAPIView):
    serializer_class = FinanceTransactionSerializer
    permission_classes = [FinanceAdminPermission]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'method']
    search_fields = [
        'transaction_ref', 'payer__username', 'payer__email', 'payer__first_name',
        'payer__last_name', 'booking__vehicle__brand', 'booking__vehicle__model',
        'booking__vehicle__plate',
    ]
    ordering_fields = ['created_at', 'paid_at', 'amount', 'commission', 'status', 'method']
    ordering = ['-created_at']

    def get_queryset(self):
        return Payment.objects.select_related('payer', 'booking__vehicle').all()


class FinanceTransactionExportView(FinanceTransactionListView):
    pagination_class = None

    def get(self, request, *args, **kwargs):
        rows = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Référence', 'Client', 'Email', 'Véhicule', 'Méthode', 'Statut',
            'Montant', 'Commission', 'Part propriétaire', 'Créée le', 'Payée le',
        ])
        for payment in rows.iterator():
            data = FinanceTransactionSerializer(payment).data
            writer.writerow([
                data['reference'], data['client_name'], data['client_email'],
                data['vehicle'], data['method'], data['status'], data['amount'],
                data['commission'], data['owner_payout'], data['created_at'], data['paid_at'] or '',
            ])
        return response


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    pagination_class = StandardPagination
    filterset_fields = ['status', 'method', 'escrow_status']
    search_fields = [
        'transaction_ref', 'payer__username', 'payer__email',
        'booking__vehicle__plate', 'booking__vehicle__brand', 'booking__vehicle__model',
    ]
    ordering_fields = ['created_at', 'amount', 'status', 'paid_at', 'escrow_status']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Payment.objects.all()
        return Payment.objects.filter(payer=user)

    def perform_create(self, serializer):
        serializer.save(payer=self.request.user)


class PayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    pagination_class = StandardPagination
    filterset_fields = ['status', 'method']
    search_fields = [
        'transaction_ref', 'recipient__username', 'recipient__email',
        'payment__booking__vehicle__plate', 'payment__booking__vehicle__brand',
    ]
    ordering_fields = ['created_at', 'processed_at', 'amount', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('ADMIN', 'CONTROLLER'):
            return Payout.objects.all()
        return Payout.objects.filter(recipient=user)


def _notify(user, title, message):
    from apps.users.models import Notification
    Notification.objects.create(user=user, title=title, message=message)


class WithdrawalRequestViewSet(viewsets.ModelViewSet):
    """Retraits vers Mobile Money : demande (propriétaire/chauffeur), traitement (admin)."""
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    http_method_names = ['get', 'post', 'head', 'options']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'method', 'user']
    search_fields = ['reference', 'phone', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'amount', 'status']

    def get_queryset(self):
        qs = WithdrawalRequest.objects.select_related('user')
        if self.request.user.role == 'ADMIN':
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        from apps.users.models import User
        if self.request.user.role not in ('OWNER', 'DRIVER', 'CLIENT'):
            raise PermissionDenied('Les retraits sont réservés aux propriétaires, chauffeurs et clients.')
        amount = serializer.validated_data['amount']
        with db_transaction.atomic():
            user = User.objects.select_for_update().get(pk=self.request.user.pk)
            if (user.balance or 0) < amount:
                raise ValidationError({'amount': 'Solde insuffisant pour ce retrait.'})
            user.balance -= amount
            user.save(update_fields=['balance', 'updated_at'])
            reference = f'WD-{uuid.uuid4().hex[:10].upper()}'
            serializer.save(user=user, reference=reference)
            WalletTransaction.objects.create(
                user=user, kind='debit', method=serializer.validated_data['method'], amount=amount,
                balance_after=user.balance, reference=reference,
                note=f'Retrait vers {serializer.validated_data["phone"]} (en attente)')
        for admin in User.objects.filter(role='ADMIN', is_active=True):
            _notify(admin, 'Demande de retrait',
                    f'{user.get_full_name()} demande un retrait de {amount:.0f} FCFA ({reference}).')

    def _process(self, request, pk, approve):
        from apps.users.models import User
        if request.user.role != 'ADMIN':
            raise PermissionDenied('Traitement réservé à l’administration.')
        with db_transaction.atomic():
            withdrawal = WithdrawalRequest.objects.select_for_update().get(pk=pk)
            if withdrawal.status != 'pending':
                raise ValidationError({'detail': 'Cette demande a déjà été traitée.'})
            withdrawal.status = 'paid' if approve else 'rejected'
            withdrawal.admin_note = (request.data.get('note') or '')[:255]
            withdrawal.processed_by = request.user
            withdrawal.processed_at = timezone.now()
            withdrawal.save()
            if not approve:
                user = User.objects.select_for_update().get(pk=withdrawal.user_id)
                user.balance = (user.balance or 0) + withdrawal.amount
                user.save(update_fields=['balance', 'updated_at'])
                WalletTransaction.objects.create(
                    user=user, kind='refund', amount=withdrawal.amount, balance_after=user.balance,
                    reference=withdrawal.reference, note='Retrait refusé — montant recrédité')
        _notify(withdrawal.user, 'Retrait effectué' if approve else 'Retrait refusé',
                f'Votre retrait {withdrawal.reference} de {withdrawal.amount:.0f} FCFA '
                + ('a été viré sur votre compte Mobile Money.' if approve
                   else f'a été refusé et recrédité sur votre solde. {withdrawal.admin_note}'))
        return Response(self.get_serializer(withdrawal).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        return self._process(request, pk, True)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        return self._process(request, pk, False)


class WalletViewSet(viewsets.ViewSet):
    """Solde AutoLink — rechargement et historique."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reference', 'note', 'method', 'kind', 'status']
    ordering_fields = ['created_at', 'amount', 'kind', 'status']

    def list(self, request):
        transactions = request.user.wallet_transactions.all()
        for backend in self.filter_backends:
            transactions = backend().filter_queryset(request, transactions, self)
        held = Payment.objects.filter(
            payer=request.user, status='completed', deposit_status='held',
        ).exclude(booking__status__in=('completed', 'cancelled'))
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return Response({
            'balance': request.user.balance,
            'held_deposit': held.aggregate(v=Coalesce(Sum('deposit_amount'), Decimal('0.00')))['v'],
            'recharged_month': transactions.filter(
                kind='topup', status='completed', created_at__gte=month_start,
            ).aggregate(v=Coalesce(Sum('amount'), Decimal('0.00')))['v'],
            'released_deposits': transactions.filter(
                kind='refund', status='completed',
            ).filter(Q(reference__startswith='DEPOSIT') | Q(note__icontains='caution'))
            .aggregate(v=Coalesce(Sum('amount'), Decimal('0.00')))['v'],
            'held_deposits': [{
                'booking': p.booking_id,
                'vehicle': str(p.booking.vehicle),
                'amount': p.deposit_amount,
                'start_date': p.booking.start_date,
                'end_date': p.booking.end_date,
                'status': p.booking.status,
            } for p in held.select_related('booking__vehicle')],
            'pending_withdrawals': WithdrawalRequest.objects.filter(
                user=request.user, status='pending',
            ).aggregate(v=Coalesce(Sum('amount'), Decimal('0.00')))['v'],
            'transactions': WalletTransactionSerializer(
                transactions[:50], many=True
            ).data,
        })

    @action(detail=False, methods=['post'])
    def topup(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data['amount']
        method = serializer.validated_data['method']
        ref = f'TOP-{uuid.uuid4().hex[:10].upper()}'
        if method in ('mtn', 'orange'):
            configured = providers.mtn_configured() if method == 'mtn' else providers.orange_configured()
            if not configured:
                # Mode démo : sans credentials provider réels, on crédite directement
                # (comportement sandbox — à retirer/flaguer en production).
                if settings.DEBUG:
                    phone = serializer.validated_data.get('phone') or request.user.phone or ''
                    tx = WalletTransaction.objects.create(
                        user=request.user, kind='topup', method=method, amount=amount,
                        balance_after=(request.user.balance or 0) + amount,
                        reference=ref, status='completed',
                        note=f'Recharge {method.upper()} (sandbox) — {phone}',
                    )
                    request.user.balance = (request.user.balance or 0) + amount
                    request.user.save(update_fields=['balance'])
                    return Response({
                        'reference': ref, 'status': 'completed', 'sandbox': True,
                        'transaction': WalletTransactionSerializer(tx).data,
                    }, status=200)
                return Response({'detail': 'Moyen de paiement non configuré.'}, status=503)
            phone = serializer.validated_data.get('phone')
            if not phone:
                return Response({'detail': 'Le numéro de téléphone est requis.'}, status=400)
            tx = WalletTransaction.objects.create(
                user=request.user, kind='topup', method=method, amount=amount,
                balance_after=request.user.balance or 0, reference=ref, status='pending')
            try:
                if method == 'mtn':
                    result = providers.mtn_request_to_pay(amount, phone, ref)
                    tx.provider_ref = result['provider_ref']
                    tx.provider_status = result['status']
                else:
                    result = providers.orange_create_payment(
                        amount, ref, ref,
                        f'{settings.FRONTEND_URL}/client/dashboard?topup=orange&ref={ref}',
                        f'{settings.FRONTEND_URL}/client/dashboard?topup=canceled',
                        self._abs(request, '/api/payments/orange-notification/'))
                    tx.provider_ref = ref
                    tx.provider_token = result['notif_token']
                    tx.provider_pay_token = result['pay_token']
                    tx.provider_status = 'PENDING'
                tx.save()
            except providers.ProviderError as error:
                tx.status = 'failed'
                tx.provider_status = 'ERROR'
                tx.note = str(error)[:200]
                tx.save(update_fields=['status', 'provider_status', 'note'])
                return Response({'detail': str(error)}, status=502)
            return Response({
                'reference': ref, 'status': tx.status,
                'payment_url': result.get('payment_url'),
                'transaction': WalletTransactionSerializer(tx).data,
            }, status=202)

        # ── Paiement externe LIVE : Stripe Checkout / PayPal ────────────────
        # La recharge reste "pending" ; le solde n'est crédité qu'au retour
        # du client après paiement vérifié côté serveur (ou webhook Stripe).
        if method in ('stripe', 'paypal'):
            tx = WalletTransaction.objects.create(
                user=request.user, kind='topup', method=method, amount=amount,
                balance_after=request.user.balance or 0,
                reference=ref, status='pending',
                note=f'Rechargement {method} — en attente de paiement',
            )
            try:
                if method == 'stripe':
                    r = providers.stripe_create_checkout(
                        amount, ref, f'Recharge AutoLink {ref}',
                        success_url=self._abs(request, '/api/payments/stripe-return/'),
                        cancel_url=self._abs(request, '/api/payments/stripe-return/?canceled=1'),
                        email=request.user.email)
                    tx.provider_ref = r['id']
                    tx.save(update_fields=['provider_ref'])
                    url = r['url']
                else:
                    r = providers.paypal_create_order(
                        amount, ref, f'Recharge AutoLink {ref}',
                        return_url=self._abs(request, '/api/payments/paypal-return/'),
                        cancel_url=self._abs(request, '/api/payments/paypal-return/?canceled=1'))
                    tx.provider_ref = r['id']
                    tx.save(update_fields=['provider_ref'])
                    url = r['approval_url']
            except providers.ProviderError as e:
                tx.status = 'failed'
                tx.save(update_fields=['status'])
                return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)
            return Response({
                'payment_url': url,
                'transaction': WalletTransactionSerializer(tx).data,
            }, status=status.HTTP_202_ACCEPTED)

        return Response({'detail': 'Moyen de paiement non configuré.'}, status=503)

    @action(detail=False, methods=['get'], url_path=r'transactions/(?P<reference>[^/.]+)/status')
    def transaction_status(self, request, reference=None):
        try:
            tx = WalletTransaction.objects.get(reference=reference, user=request.user, kind='topup')
        except WalletTransaction.DoesNotExist:
            return Response({'detail': 'Transaction introuvable.'}, status=404)
        if tx.status != 'pending':
            return Response(WalletTransactionSerializer(tx).data)
        if tx.method not in ('mtn', 'orange'):
            return Response(WalletTransactionSerializer(tx).data)
        try:
            raw = providers.mtn_status(tx.provider_ref) if tx.method == 'mtn' else providers.orange_status(
                tx.provider_ref, tx.amount, tx.provider_pay_token)
        except providers.ProviderError as error:
            return Response({'detail': str(error)}, status=502)
        _settle_wallet(tx, raw)
        tx.refresh_from_db()
        return Response(WalletTransactionSerializer(tx).data)

    @staticmethod
    def _abs(request, path):
        """URL absolue de l'API pour les redirections des providers."""
        return request.build_absolute_uri(path)


def _credit_wallet_tx(tx, note_suffix=''):
    """Crédite une recharge confirmée exactement une fois."""
    with db_transaction.atomic():
        tx = WalletTransaction.objects.select_for_update().get(pk=tx.pk)
        if tx.status != 'pending':
            return False
        user = tx.user.__class__.objects.select_for_update().get(pk=tx.user_id)
        user.balance = (user.balance or Decimal('0')) + tx.amount
        user.save(update_fields=['balance', 'updated_at'])
        tx.status = 'completed'
        tx.balance_after = user.balance
        if note_suffix:
            tx.note = f'{tx.note} {note_suffix}'
        tx.save(update_fields=['status', 'balance_after', 'note', 'provider_status'])
    return True


def _provider_success(raw):
    return str(raw.get('status', '')).upper() in ('SUCCESSFUL', 'SUCCESS', 'COMPLETED')


def _settle_wallet(tx, raw):
    status_value = str(raw.get('status', 'PENDING')).upper()
    with db_transaction.atomic():
        locked = WalletTransaction.objects.select_for_update().get(pk=tx.pk)
        locked.provider_status = status_value
        locked.save(update_fields=['provider_status'])
        if locked.status == 'pending' and _provider_success(raw):
            _credit_wallet_tx(locked, '(paiement confirmé)')
        elif locked.status == 'pending' and status_value in ('FAILED', 'ERROR', 'EXPIRED'):
            locked.status = 'failed'
            locked.save(update_fields=['status', 'provider_status'])
        else:
            locked.save(update_fields=['provider_status'])


def _settle_booking(payment, raw):
    with db_transaction.atomic():
        locked = Payment.objects.select_for_update().get(pk=payment.pk)
        locked.provider_status = str(raw.get('status', 'PENDING')).upper()
        if locked.status != 'pending':
            locked.save(update_fields=['provider_status'])
            return
        if _provider_success(raw):
            locked.status = 'completed'
            locked.paid_at = timezone.now()
            locked.save(update_fields=['status', 'paid_at', 'provider_status'])
            _confirm_booking_payment(locked)
        elif locked.provider_status in ('FAILED', 'ERROR', 'EXPIRED'):
            locked.status = 'failed'
            locked.save(update_fields=['status', 'provider_status'])


def _confirm_booking_payment(payment):
    """Confirme la réservation associée à un paiement externe vérifié :
    paiement → confirmed, chauffeur assigné, notifications."""
    from apps.bookings.views import _assign_internal_driver, _notify
    booking = payment.booking
    if payment.status != 'completed':
        payment.status = 'completed'
        payment.paid_at = timezone.now()
        payment.save(update_fields=['status', 'paid_at'])
    if booking.status == 'pending':
        booking.status = 'confirmed'
        booking.save(update_fields=['status', 'updated_at'])
        if booking.driver_type == 'internal':
            _assign_internal_driver(booking)
        vehicle = booking.vehicle
        _notify(vehicle.owner, 'Nouvelle réservation',
                f'Votre véhicule {vehicle} a été réservé par {booking.client.get_full_name()} '
                f'du {booking.start_date} au {booking.end_date} (paiement {payment.method} reçu).')
        booking.sync_vehicle_status()


class PaymentMethodsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Return all payment methods, with configuration status
        all_methods = ['mtn', 'orange', 'stripe', 'paypal']
        configured_methods = []
        for method in all_methods:
            if method == 'mtn' and providers.mtn_configured():
                configured_methods.append(method)
            elif method == 'orange' and providers.orange_configured():
                configured_methods.append(method)
            elif method == 'stripe' and providers.stripe_configured():
                configured_methods.append(method)
            elif method == 'paypal' and providers.paypal_configured():
                configured_methods.append(method)
        return Response({
            'methods': configured_methods,
            'configured_methods': configured_methods,
            'all_methods': all_methods,
            'booking_methods': ['wallet', *configured_methods]
        })


class OrangeNotificationView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        token = str(request.data.get('notif_token', ''))
        order_id = str(request.data.get('order_id', ''))
        tx = WalletTransaction.objects.filter(provider_ref=order_id, method='orange').first()
        payment = Payment.objects.filter(provider_ref=order_id, method='orange').first()
        expected = tx.provider_token if tx else payment.provider_token if payment else ''
        if not expected or not hmac.compare_digest(token, expected):
            return Response({'detail': 'Notification non autorisée.'}, status=403)
        try:
            amount = tx.amount if tx else payment.amount
            pay_token = tx.provider_pay_token if tx else payment.provider_pay_token
            raw = providers.orange_status(order_id, amount, pay_token)
        except providers.ProviderError as error:
            return Response({'detail': str(error)}, status=502)
        _settle_wallet(tx, raw) if tx else _settle_booking(payment, raw)
        return Response({'status': 'ok'})


class BookingPaymentStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, reference):
        try:
            booking = Booking.objects.select_related('payment').get(pk=reference, client=request.user)
            payment = booking.payment
        except (Booking.DoesNotExist, Payment.DoesNotExist):
            return Response({'detail': 'Paiement introuvable.'}, status=404)
        if payment.status == 'pending' and payment.method in ('mtn', 'orange'):
            try:
                raw = providers.mtn_status(payment.provider_ref) if payment.method == 'mtn' else providers.orange_status(
                    payment.provider_ref, payment.amount, payment.provider_pay_token)
            except providers.ProviderError as error:
                return Response({'detail': str(error)}, status=502)
            _settle_booking(payment, raw)
            payment.refresh_from_db()
        return Response({'status': payment.status, 'provider_status': payment.provider_status})


class StripeReturnView(APIView):
    """Retour client après Stripe Checkout — vérifie serveur + crédit/confirm."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        front = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        is_booking = request.query_params.get('ctx') == 'booking'
        target = f'{front}/client/bookings?payment=' if is_booking else f'{front}/client/dashboard?topup='
        session_id = request.query_params.get('session_id', '')
        canceled = request.query_params.get('canceled')
        if canceled or not session_id:
            return HttpResponseRedirect(target + 'canceled')
        try:
            session = providers.stripe_get_session(session_id)
        except providers.ProviderError:
            return HttpResponseRedirect(target + 'error')

        if session.get('payment_status') != 'paid':
            return HttpResponseRedirect(target + 'pending')

        ref = (session.get('metadata') or {}).get('autolink_ref', '')
        tx = WalletTransaction.objects.filter(reference=ref, status='pending').first()
        if tx:
            _credit_wallet_tx(tx, '(Stripe vérifié)')
            return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')
        payment = Payment.objects.filter(transaction_ref=session_id, status='pending').first()
        if payment:
            _confirm_booking_payment(payment)
            return HttpResponseRedirect(f'{front}/client/bookings?payment=success')
        return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')


class PayPalReturnView(APIView):
    """Retour client après approbation PayPal — capture + crédit/confirm."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        front = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        is_booking = request.query_params.get('ctx') == 'booking'
        target = f'{front}/client/bookings?payment=' if is_booking else f'{front}/client/dashboard?topup='
        order_id = request.query_params.get('token', '')
        canceled = request.query_params.get('canceled')
        if canceled or not order_id:
            return HttpResponseRedirect(target + 'canceled')
        try:
            r = providers.paypal_capture_order(order_id)
        except providers.ProviderError:
            return HttpResponseRedirect(target + 'error')
        if r.get('status') != 'COMPLETED':
            return HttpResponseRedirect(target + 'pending')

        tx = WalletTransaction.objects.filter(provider_ref=order_id, status='pending').first()
        if tx:
            _credit_wallet_tx(tx, '(PayPal capturé)')
            return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')
        payment = Payment.objects.filter(transaction_ref=order_id, status='pending').first()
        if payment:
            _confirm_booking_payment(payment)
            return HttpResponseRedirect(f'{front}/client/bookings?payment=success')
        return HttpResponseRedirect(f'{front}/client/dashboard?topup=success')


class StripeWebhookView(APIView):
    """Webhook Stripe — sécurise la confirmation même si le client ferme
    son navigateur avant le retour. Actif si STRIPE_WEBHOOK_SECRET est défini."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
        sig = request.headers.get('Stripe-Signature', '')
        try:
            if secret:
                event = providers.stripe_verify_webhook(request.body, sig, secret)
            else:
                event = json.loads(request.body.decode())
        except Exception:
            return Response({'detail': 'Signature invalide'}, status=status.HTTP_400_BAD_REQUEST)

        if event.get('type') == 'checkout.session.completed':
            session = event.get('data', {}).get('object', {})
            ref = (session.get('metadata') or {}).get('autolink_ref', '')
            tx = WalletTransaction.objects.filter(reference=ref, status='pending').first()
            if tx:
                _credit_wallet_tx(tx, '(webhook Stripe)')
            else:
                payment = Payment.objects.filter(
                    transaction_ref=session.get('id'), status='pending').first()
                if payment:
                    _confirm_booking_payment(payment)
        return Response({'received': True})
