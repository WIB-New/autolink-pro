from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch
from rest_framework.test import APITestCase
from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.payments.models import Payment, WalletTransaction
from apps.vehicles.tests import make_user, make_vehicle
from .models import Booking


def next_month(days=2):
    start = date.today() + timedelta(days=30)
    return start, start + timedelta(days=days)


class BookingFlowTests(APITestCase):
    def setUp(self):
        self.owner = make_user('owner', 'OWNER')
        self.client_user = make_user('cli', 'CLIENT')
        self.driver = make_user('drv', 'DRIVER')
        self.admin = make_user('adm', 'ADMIN')
        self.vehicle = make_vehicle(self.owner, 'LT-900-II', daily_rate=25000)
        self.start, self.end = next_month()
        self.payload = {
            'vehicle': self.vehicle.id, 'start_date': str(self.start),
            'end_date': str(self.end), 'driver_type': 'none',
            'payment_method': 'wallet',
        }
        self.client.force_authenticate(self.client_user)

    def _book(self, **extra):
        return self.client.post('/api/bookings/', {**self.payload, **extra}, format='json')

    # ── Création + paiement wallet ──────────────────────────────────────────
    def test_wallet_booking_insufficient_balance(self):
        r = self._book()
        self.assertEqual(r.status_code, 400, r.data)
        self.assertIn('Solde insuffisant', str(r.data))

    def test_wallet_booking_confirms_and_holds_escrow(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        r = self._book()
        self.assertEqual(r.status_code, 201, r.data)
        booking = Booking.objects.get(pk=r.data['id'])
        self.assertEqual(booking.status, 'confirmed')
        pay = booking.payment
        self.assertEqual(pay.status, 'completed')
        self.assertEqual(pay.escrow_status, 'held')
        self.assertEqual(pay.deposit_status, 'held')
        # client débité location + caution
        self.client_user.refresh_from_db()
        total = booking.subtotal + booking.deposit_amount
        self.assertEqual(self.client_user.balance, Decimal('5000000') - total)
        # commission 15 % — le propriétaire touche 85 %
        self.assertEqual(pay.commission + pay.owner_payout, pay.amount)
        self.assertEqual(booking.commission_amount, (booking.subtotal * Decimal('0.15')).quantize(Decimal('0.01')))

    def test_date_conflict_rejected(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        self.assertEqual(self._book().status_code, 201)
        r = self._book()  # mêmes dates
        self.assertEqual(r.status_code, 400)

    def test_unavailable_vehicle_rejected(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        self.vehicle.status = 'maintenance'
        self.vehicle.save()
        r = self._book()
        self.assertEqual(r.status_code, 400)

    def test_internal_driver_auto_assigned(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        r = self._book(driver_type='internal')
        self.assertEqual(r.status_code, 201)
        booking = Booking.objects.get(pk=r.data['id'])
        self.assertEqual(booking.driver, self.driver)

    # ── Annulation ──────────────────────────────────────────────────────────
    def test_client_cancel_refunds(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        r = self._book()
        booking = Booking.objects.get(pk=r.data['id'])
        spent = booking.subtotal + booking.deposit_amount
        r = self.client.patch(f'/api/bookings/{booking.id}/', {'status': 'cancelled'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.balance, Decimal('5000000'))  # remboursé intégralement
        self.assertEqual(booking.payment.escrow_status, 'refunded')

    def test_client_cannot_cancel_other_booking(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        r = self._book()
        other = make_user('other', 'CLIENT')
        self.client.force_authenticate(other)
        r = self.client.patch(f"/api/bookings/{r.data['id']}/", {'status': 'cancelled'}, format='json')
        self.assertEqual(r.status_code, 404)  # invisible pour un autre client

    # ── Litige ──────────────────────────────────────────────────────────────
    def _confirmed_booking(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        r = self._book()
        return Booking.objects.get(pk=r.data['id'])

    def test_dispute_freezes_escrow(self):
        booking = self._confirmed_booking()
        r = self.client.post(f'/api/bookings/{booking.id}/dispute/', {'reason': 'Panne moteur'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'disputed')
        self.assertEqual(booking.payment.escrow_status, 'disputed')

    def test_resolve_dispute_refund_client(self):
        booking = self._confirmed_booking()
        self.client.post(f'/api/bookings/{booking.id}/dispute/', {'reason': 'x'}, format='json')
        self.client.force_authenticate(self.admin)
        r = self.client.post(f'/api/bookings/{booking.id}/resolve-dispute/',
                             {'decision': 'refund'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'cancelled')
        self.assertEqual(booking.payment.status, 'refunded')
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.balance, Decimal('5000000'))

    def test_resolve_dispute_release_pays_owner_and_deposit(self):
        booking = self._confirmed_booking()
        self.client.post(f'/api/bookings/{booking.id}/dispute/', {'reason': 'x'}, format='json')
        self.client.force_authenticate(self.admin)
        r = self.client.post(f'/api/bookings/{booking.id}/resolve-dispute/',
                             {'decision': 'release'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.owner.refresh_from_db()
        expected = booking.owner_amount + booking.deposit_amount
        self.assertEqual(self.owner.balance, expected)
        self.assertEqual(booking.payment.deposit_status, 'forfeited')
        self.assertEqual(booking.payment.escrow_status, 'released')

    def test_dispute_resolution_admin_only(self):
        booking = self._confirmed_booking()
        self.client.post(f'/api/bookings/{booking.id}/dispute/', {'reason': 'x'}, format='json')
        r = self.client.post(f'/api/bookings/{booking.id}/resolve-dispute/',
                             {'decision': 'refund'}, format='json')
        self.assertIn(r.status_code, (403,))

    # ── Fin de location ─────────────────────────────────────────────────────
    def test_finish_releases_vehicle_and_pays_owner(self):
        booking = self._confirmed_booking()
        self.vehicle.status = 'rented'
        self.vehicle.save()
        booking.finish()
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, 'approved')  # dispo immédiatement
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, booking.owner_amount)
        self.client_user.refresh_from_db()
        # caution rendue au client
        self.assertEqual(self.client_user.balance,
                         Decimal('5000000') - booking.subtotal)

    def test_auto_complete_expired(self):
        booking = self._confirmed_booking()
        booking.start_date = date.today() - timedelta(days=5)
        booking.end_date = date.today() - timedelta(days=2)
        booking.save()
        Booking.auto_complete_expired()
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'completed')

    # ── Visibilité par rôle ─────────────────────────────────────────────────
    def test_queryset_scoped_by_role(self):
        booking = self._confirmed_booking()
        for user, visible in ((self.client_user, True), (self.owner, True),
                              (self.admin, True), (self.driver, False),
                              (make_user('stranger', 'CLIENT'), False)):
            self.client.force_authenticate(user)
            data = self.client.get('/api/bookings/').data
            rows = data.get('results', []) if isinstance(data, dict) else data
            ids = {b['id'] for b in rows}
            self.assertEqual(booking.id in ids, visible, f'{user.username}')

    def test_stats_admin_only(self):
        r = self.client.get('/api/bookings/stats/')
        self.assertEqual(r.status_code, 403)
        self.client.force_authenticate(self.admin)
        r = self.client.get('/api/bookings/stats/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('commission_total', r.data)
