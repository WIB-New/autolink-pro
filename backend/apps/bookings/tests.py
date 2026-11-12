from datetime import date, timedelta
from decimal import Decimal
import tempfile
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase
from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.payments.models import Payment, WalletTransaction
from apps.inspections.models import InspectionPhoto, VehicleInspection
from apps.drivers.models import DriverProfile
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
    def test_timed_quote_and_wallet_payment_match(self):
        self.client_user.balance = 5_000_000
        self.client_user.save()
        payload = {
            **self.payload, 'end_date': str(self.start + timedelta(days=3)),
            'start_time': '08:30', 'end_time': '12:30', 'driver_type': 'internal',
            'terms_accepted': True, 'debit_authorized': True,
            'notes': 'Merci de me contacter avant la prise en charge.',
        }
        quote = self.client.post('/api/bookings/quote/', payload, format='json')
        self.assertEqual(quote.status_code, 200, quote.data)
        self.assertEqual(quote.data['days'], 4)
        self.assertEqual(Decimal(quote.data['subtotal']), Decimal('140000'))
        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        booking = Booking.objects.get(pk=response.data['id'])
        self.assertEqual(booking.subtotal, Decimal('140000'))
        self.assertEqual(booking.notes, payload['notes'])
        self.assertIsNotNone(booking.terms_accepted_at)
        self.assertEqual(booking.payment.amount, booking.subtotal)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.balance, Decimal('5000000') - booking.subtotal - booking.deposit_amount)

    def test_timed_booking_requires_both_consents(self):
        response = self._book(start_time='08:30', end_time='12:30')
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn('terms_accepted', response.data)
        self.assertFalse(Booking.objects.exists())

    def test_timed_quote_rounds_up_and_rejects_negative_duration(self):
        for end_time, expected in [('08:30', 1), ('08:31', 2)]:
            response = self.client.post('/api/bookings/quote/', {
                **self.payload, 'end_date': str(self.start + timedelta(days=1)),
                'start_time': '08:30', 'end_time': end_time,
            }, format='json')
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(response.data['days'], expected)
        response = self.client.post('/api/bookings/quote/', {
            **self.payload, 'end_date': str(self.start),
            'start_time': '12:30', 'end_time': '08:30',
        }, format='json')
        self.assertEqual(response.status_code, 400)

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
        # commission AutoLink sur la location seule — le reste (frais
        # chauffeur/livraison) n'est pas commissionné
        self.assertEqual(pay.commission + pay.owner_payout, pay.amount)
        from apps.users.models import PlatformSettings
        rental = booking.subtotal - booking.driver_fee - booking.delivery_fee
        rate = Decimal(str(PlatformSettings.current().commission_rate))
        self.assertEqual(booking.commission_amount, (rental * rate).quantize(Decimal('0.01')))
        self.assertEqual(booking.owner_amount, rental - booking.commission_amount)

    def test_client_stats_sum_non_cancelled_subtotals(self):
        first = self._confirmed_booking()
        later_start = self.start + timedelta(days=20)
        response = self._book(
            start_date=str(later_start),
            end_date=str(later_start + timedelta(days=2)),
        )
        self.assertEqual(response.status_code, 201, response.data)
        cancelled = self.client.patch(
            f"/api/bookings/{response.data['id']}/",
            {'status': 'cancelled'},
            format='json',
        )
        self.assertEqual(cancelled.status_code, 200, cancelled.data)

        stats = self.client.get('/api/bookings/client-stats/')
        self.assertEqual(stats.status_code, 200, stats.data)
        self.assertEqual(stats.data['bookings_total'], 2)
        self.assertEqual(Decimal(str(stats.data['total_spent'])), first.subtotal)

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
        DriverProfile.objects.create(driver=self.driver, is_online=True)
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
        # Politique : location 100 % remboursée, caution remboursée à 90 % (10 % conservés)
        expected = Decimal('5000000') - booking.deposit_amount * Decimal('0.10')
        self.assertEqual(self.client_user.balance, expected)
        self.assertEqual(booking.payment.escrow_status, 'refunded')
        # La part conservée est créditée au portefeuille admin
        self.admin.refresh_from_db()
        self.assertEqual(self.admin.balance, booking.deposit_amount * Decimal('0.10'))

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

    def test_dispute_list_is_admin_only_and_includes_resolved(self):
        booking = self._confirmed_booking()
        self.client.post(f'/api/bookings/{booking.id}/dispute/', {'reason': 'Panne moteur'}, format='json')
        self.client.force_authenticate(self.admin)
        opened = self.client.get('/api/bookings/disputes/?state=open')
        self.assertEqual(opened.status_code, 200, opened.data)
        self.assertEqual([item['id'] for item in opened.data['results']], [booking.id])
        resolved = self.client.post(
            f'/api/bookings/{booking.id}/resolve-dispute/',
            {'decision': 'refund'}, format='json')
        self.assertEqual(resolved.status_code, 200, resolved.data)
        response = self.client.get('/api/bookings/disputes/?state=resolved')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual([item['id'] for item in response.data['results']], [booking.id])
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.get('/api/bookings/disputes/?state=open').status_code, 403)

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


class BookingEditAndReceiptTests(APITestCase):
    def setUp(self):
        self.owner = make_user('receipt-owner', 'OWNER')
        self.client_user = make_user('receipt-client', 'CLIENT')
        self.stranger = make_user('receipt-stranger', 'CLIENT')
        self.vehicle = make_vehicle(self.owner, 'LT-911-AA', daily_rate=25000)

    def make_paid_booking(self, days=2):
        start = date.today() + timedelta(days=40)
        booking = Booking.objects.create(
            client=self.client_user, vehicle=self.vehicle, status='confirmed',
            start_date=start, end_date=start + timedelta(days=days),
            daily_rate=Decimal('25000'), days=days, subtotal=0,
            commission_amount=0, owner_amount=0, deposit_amount=0,
        )
        Payment.objects.create(
            booking=booking, payer=self.client_user, method='wallet', status='completed',
            amount=booking.subtotal, commission=booking.commission_amount,
            owner_payout=booking.owner_amount,
        )
        return booking

    def test_booking_detail_includes_inspection_records_and_photos(self):
        booking = self.make_paid_booking()
        inspector = make_user('inspection-controller', 'CONTROLLER')
        with tempfile.TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root):
            inspection = VehicleInspection.objects.create(
                booking=booking, vehicle=self.vehicle, controller=inspector,
                inspection_type='entry', mileage_at_inspection=45000,
                fuel_level=75, condition_score=92, notes='Carrosserie en bon état.',
            )
            InspectionPhoto.objects.create(
                inspection=inspection,
                image=SimpleUploadedFile('inspection.jpg', b'image', content_type='image/jpeg'),
                caption='Vue avant',
            )
            self.client.force_authenticate(self.client_user)
            response = self.client.get(f'/api/bookings/{booking.pk}/')

        self.assertEqual(response.status_code, 200, response.data)
        record = response.data['inspections'][0]
        self.assertEqual(record['inspection_type'], 'entry')
        self.assertEqual(record['controller_name'], inspector.get_full_name())
        self.assertEqual(record['condition_score'], 92)
        self.assertEqual(record['notes'], 'Carrosserie en bon état.')
        self.assertEqual(record['photos'][0]['caption'], 'Vue avant')

    def test_wallet_booking_edit_charges_difference(self):
        booking = self.make_paid_booking()
        self.client_user.balance = Decimal('100000')
        self.client_user.save()
        self.client.force_authenticate(self.client_user)
        response = self.client.patch(
            f'/api/bookings/{booking.pk}/',
            {'end_date': str(booking.end_date + timedelta(days=1))},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.balance, Decimal('75000'))
        transaction = WalletTransaction.objects.get(reference=f'BK-{booking.pk:04d}-EXTRA')
        self.assertEqual(transaction.kind, 'debit')
        self.assertEqual(transaction.amount, Decimal('25000'))

    def test_wallet_booking_edit_refunds_difference(self):
        booking = self.make_paid_booking(days=4)
        self.client_user.balance = Decimal('100000')
        self.client_user.save()
        self.client.force_authenticate(self.client_user)
        response = self.client.patch(
            f'/api/bookings/{booking.pk}/',
            {'end_date': str(booking.start_date + timedelta(days=2))},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.client_user.refresh_from_db()
        # Le trop-perçu n'est remboursé qu'à la validation du propriétaire
        self.assertEqual(self.client_user.balance, Decimal('100000'))
        booking.refresh_from_db()
        self.assertEqual(Decimal(booking.modification['delta']), Decimal('-45000.00'))
        self.client.force_authenticate(self.owner)
        response = self.client.post(f'/api/bookings/{booking.pk}/owner-accept/')
        self.assertEqual(response.status_code, 200, response.data)
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.balance, Decimal('145000'))
        transaction = WalletTransaction.objects.get(reference=f'BK-{booking.pk:04d}-MODREF')
        self.assertEqual(transaction.kind, 'refund')
        self.assertEqual(transaction.amount, Decimal('45000'))

    def test_wallet_booking_edit_rejects_insufficient_balance(self):
        booking = self.make_paid_booking()
        original_end = booking.end_date
        self.client_user.balance = Decimal('500')
        self.client_user.save()
        self.client.force_authenticate(self.client_user)
        response = self.client.patch(
            f'/api/bookings/{booking.pk}/',
            {'end_date': str(original_end + timedelta(days=1))},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.assertEqual(booking.end_date, original_end)
        self.assertEqual(self.client_user.balance, Decimal('500'))

    def test_receipt_pdf_access_and_stranger_forbidden(self):
        booking = self.make_paid_booking()
        self.client.force_authenticate(self.client_user)
        response = self.client.get(f'/api/bookings/{booking.pk}/receipt/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.client.force_authenticate(self.stranger)
        response = self.client.get(f'/api/bookings/{booking.pk}/receipt/')
        self.assertEqual(response.status_code, 403)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_receipt_email_has_pdf_attachment(self):
        booking = self.make_paid_booking()
        self.client_user.language = 'en'
        self.client_user.save(update_fields=['language'])
        self.client.force_authenticate(self.client_user)
        response = self.client.post(f'/api/bookings/{booking.pk}/receipt/email/')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Your AutoLink Pro receipt', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].body, 'Please find your booking receipt attached.')
        self.assertEqual(mail.outbox[0].attachments[0][2], 'application/pdf')
