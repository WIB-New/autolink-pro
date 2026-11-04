from decimal import Decimal
from django.db import transaction as db_transaction
from django.db.models import Sum, Count
from django.utils import timezone
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
              .filter(role='DRIVER', is_active=True)
              .exclude(id__in=busy)
              .order_by('id')
              .first())
    if driver:
        booking.driver = driver
        booking.save(update_fields=['driver', 'updated_at'])
        _notify(driver, 'Nouvelle course',
                f'Vous êtes assigné à la location du véhicule {booking.vehicle} '
                f'du {booking.start_date} au {booking.end_date}. '
                f'Client : {booking.client.get_full_name()} — {booking.client.phone}')
    return driver


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'vehicle']
    ordering_fields = ['created_at', 'start_date', 'subtotal']

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

    def create(self, request, *args, **kwargs):
        # Ajoute payment_url à la réponse quand un checkout externe est créé
        resp = super().create(request, *args, **kwargs)
        if getattr(self, '_last_payment_url', None):
            resp.data['payment_url'] = self._last_payment_url
            self._last_payment_url = None
        return resp

    def perform_create(self, serializer):
        request = self.request
        vehicle = serializer.validated_data['vehicle']
        start = serializer.validated_data['start_date']
        end = serializer.validated_data['end_date']
        driver_type = serializer.validated_data.get('driver_type', 'none')
        payment_method = request.data.get('payment_method')

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

    def perform_update(self, serializer):
        """Transitions de statut selon le rôle — l'admin n'intervient plus en routine."""
        booking = self.get_object()
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

        if new_status is None:
            raise PermissionDenied('Modification non autorisée.')

        if user.role == 'CLIENT':
            if booking.client_id != user.id:
                raise PermissionDenied('Cette réservation ne vous appartient pas.')
            if new_status not in CLIENT_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
            if booking.status not in CLIENT_CANCELLABLE:
                raise ValidationError({'status': 'Cette réservation ne peut plus être annulée.'})
            serializer.save(status='cancelled')
            serializer.instance.sync_vehicle_status()
            self._refund_if_paid(serializer.instance)
            return

        if user.role == 'DRIVER':
            if booking.driver_id != user.id:
                raise PermissionDenied('Cette course ne vous est pas assignée.')
            if new_status not in DRIVER_ALLOWED_STATUS:
                raise PermissionDenied('Action non autorisée.')
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
