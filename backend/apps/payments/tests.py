import hmac, hashlib, json, time
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APITestCase
from apps.users.models import User, PlatformSettings
from apps.vehicles.tests import make_user, make_vehicle
from apps.bookings.models import Booking
from .models import Payment, WalletTransaction


class WalletTopupTests(APITestCase):
    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.client.force_authenticate(self.user)

    def test_mtn_topup_credits_instantly(self):
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 50000, 'method': 'mtn', 'phone': '237690000000'},
                             format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('50000'))

    def test_orange_sandbox_credit(self):
        r = self.client.post('/api/payments/wallet/topup/', {'amount': 10000, 'method': 'orange'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('10000'))

    @patch('apps.payments.views.providers.paypal_create_order')
    def test_paypal_topup_stays_pending(self, mock_create):
        mock_create.return_value = {'id': 'ORDER123', 'approval_url': 'https://paypal.com/x'}
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 20000, 'method': 'paypal'}, format='json')
        self.assertEqual(r.status_code, 202, r.data)
        self.assertIn('payment_url', r.data)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)  # pas crédité avant vérification
        tx = WalletTransaction.objects.get(provider_ref='ORDER123')
        self.assertEqual(tx.status, 'pending')

    @override_settings(STRIPE_API_KEY='')
    def test_stripe_without_key_fails_cleanly(self):
        r = self.client.post('/api/payments/wallet/topup/',
                             {'amount': 10000, 'method': 'stripe'}, format='json')
        self.assertEqual(r.status_code, 502)
        tx = WalletTransaction.objects.latest('id')
        self.assertEqual(tx.status, 'failed')

    def test_topup_requires_auth(self):
        self.client.force_authenticate(user=None)
        r = self.client.post('/api/payments/wallet/topup/', {'amount': 1, 'method': 'mtn'}, format='json')
        self.assertIn(r.status_code, (401, 403))


class ExternalReturnTests(APITestCase):
    """Retours Stripe/PayPal : crédit uniquement après vérification provider."""

    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.tx = WalletTransaction.objects.create(
            user=self.user, kind='topup', method='stripe', amount=15000,
            balance_after=0, reference='TOP-TEST', status='pending',
            provider_ref='cs_test_123')

    @patch('apps.payments.views.providers.stripe_get_session')
    def test_stripe_return_credits_after_paid(self, mock_session):
        mock_session.return_value = {
            'payment_status': 'paid',
            'metadata': {'autolink_ref': 'TOP-TEST'},
        }
        r = self.client.get('/api/payments/stripe-return/?session_id=cs_test_123')
        self.assertEqual(r.status_code, 302)
        self.assertIn('topup=success', r['Location'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('15000'))

    @patch('apps.payments.views.providers.stripe_get_session')
    def test_stripe_return_unpaid_does_not_credit(self, mock_session):
        mock_session.return_value = {'payment_status': 'unpaid', 'metadata': {}}
        r = self.client.get('/api/payments/stripe-return/?session_id=cs_test_123')
        self.assertIn('pending', r['Location'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)

    def test_stripe_return_canceled(self):
        r = self.client.get('/api/payments/stripe-return/?canceled=1')
        self.assertIn('canceled', r['Location'])

    def test_credit_wallet_tx_idempotent(self):
        from apps.payments.views import _credit_wallet_tx
        self.assertTrue(_credit_wallet_tx(self.tx))
        self.assertFalse(_credit_wallet_tx(self.tx))  # 2e appel = pas de double crédit
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('15000'))


class StripeWebhookTests(APITestCase):
    def setUp(self):
        self.user = make_user('u1', 'CLIENT')
        self.tx = WalletTransaction.objects.create(
            user=self.user, kind='topup', method='stripe', amount=30000,
            balance_after=0, reference='TOP-WH', status='pending',
            provider_ref='cs_wh_1')
        self.event = {
            'type': 'checkout.session.completed',
            'data': {'object': {'id': 'cs_wh_1', 'metadata': {'autolink_ref': 'TOP-WH'}}},
        }

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_valid_signature_credits(self):
        payload = json.dumps(self.event).encode()
        ts = int(time.time())
        sig = hmac.new(b'whsec_test', f'{ts}.'.encode() + payload, hashlib.sha256).hexdigest()
        r = self.client.post('/api/payments/stripe-webhook/', data=payload,
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE=f't={ts},v1={sig}')
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, Decimal('30000'))

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_bad_signature_rejected(self):
        r = self.client.post('/api/payments/stripe-webhook/',
                             data=json.dumps(self.event).encode(),
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE='t=1,v1=faux')
        self.assertEqual(r.status_code, 400)
        self.user.refresh_from_db()
        self.assertEqual(self.user.balance, 0)

    @override_settings(STRIPE_WEBHOOK_SECRET='whsec_test')
    def test_webhook_replay_rejected(self):
        payload = json.dumps(self.event).encode()
        old_ts = int(time.time()) - 400  # > 5 min
        sig = hmac.new(b'whsec_test', f'{old_ts}.'.encode() + payload, hashlib.sha256).hexdigest()
        r = self.client.post('/api/payments/stripe-webhook/', data=payload,
                             content_type='application/json',
                             HTTP_STRIPE_SIGNATURE=f't={old_ts},v1={sig}')
        self.assertEqual(r.status_code, 400)


class BookingExternalPaymentTests(APITestCase):
    def setUp(self):
        self.owner = make_user('owner', 'OWNER')
        self.client_user = make_user('cli', 'CLIENT')
        self.vehicle = make_vehicle(self.owner, 'LT-950-JJ', daily_rate=25000)
        self.start = date.today() + timedelta(days=40)
        self.client.force_authenticate(self.client_user)

    @patch('apps.payments.providers.paypal_create_order')
    def test_paypal_booking_pending_until_capture(self, mock_create):
        mock_create.return_value = {'id': 'PAYORDER9', 'approval_url': 'https://paypal.com/pay'}
        r = self.client.post('/api/bookings/', {
            'vehicle': self.vehicle.id, 'start_date': str(self.start),
            'end_date': str(self.start + timedelta(days=2)),
            'driver_type': 'none', 'payment_method': 'paypal'}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn('payment_url', r.data)
        booking = Booking.objects.get(pk=r.data['id'])
        self.assertEqual(booking.status, 'pending')  # pas de fausse confirmation
        self.assertEqual(booking.payment.status, 'pending')

        # Simulation du retour PayPal vérifié
        with patch('apps.payments.views.providers.paypal_capture_order') as mock_cap:
            mock_cap.return_value = {'status': 'COMPLETED'}
            resp = self.client.get(f'/api/payments/paypal-return/?token=PAYORDER9&ctx=booking')
            self.assertIn('payment=success', resp['Location'])
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
        self.assertEqual(booking.payment.status, 'completed')


class WithdrawalTests(APITestCase):
    def setUp(self):
        self.owner = make_user('own', 'OWNER')
        self.owner.balance = Decimal('100000')
        self.owner.save()
        self.admin = make_user('adm', 'ADMIN')
        self.client.force_authenticate(self.owner)

    def _request(self, amount=40000, method='mtn', phone='237670000000'):
        return self.client.post('/api/payments/withdrawals/',
                                {'amount': amount, 'method': method, 'phone': phone}, format='json')

    def _cfg(self, **kw):
        cfg = PlatformSettings.current()
        for k, v in kw.items():
            setattr(cfg, k, v)
        cfg.save()
        return cfg

    def test_withdraw_auto_approved_by_default(self):
        r = self._request()
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['status'], 'paid')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('60000'))
        tx = WalletTransaction.objects.get(reference=r.data['reference'])
        self.assertEqual(tx.kind, 'debit')
        self.assertNotIn('(en attente)', tx.note or '')

    def test_withdraw_pending_when_auto_off(self):
        self._cfg(withdrawal_auto_approve=False)
        r = self._request()
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['status'], 'pending')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('60000'))
        tx = WalletTransaction.objects.get(reference=r.data['reference'])
        self.assertIn('(en attente)', tx.note)

    def test_admin_approve_marks_paid(self):
        self._cfg(withdrawal_auto_approve=False)
        wd_id = self._request().data['id']
        self.client.force_authenticate(self.admin)
        r = self.client.post(f'/api/payments/withdrawals/{wd_id}/approve/', {}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['status'], 'paid')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('60000'))

    def test_admin_reject_refunds_owner(self):
        self._cfg(withdrawal_auto_approve=False)
        wd_id = self._request().data['id']
        self.client.force_authenticate(self.admin)
        r = self.client.post(f'/api/payments/withdrawals/{wd_id}/reject/', {}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['status'], 'rejected')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('100000'))
        # déjà traité : seconde décision refusée
        r = self.client.post(f'/api/payments/withdrawals/{wd_id}/approve/', {}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_admin_refund_reverts_paid(self):
        r = self._request()
        self.assertEqual(r.data['status'], 'paid')
        self.client.force_authenticate(self.admin)
        r = self.client.post(f'/api/payments/withdrawals/{r.data["id"]}/refund/', {}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['status'], 'rejected')
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('100000'))
        self.assertTrue(WalletTransaction.objects.filter(kind='refund', reference=r.data['reference']).exists())

    def test_withdraw_over_balance_rejected(self):
        r = self._request(amount=150000)
        self.assertEqual(r.status_code, 400)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('100000'))

    def test_withdraw_requires_phone(self):
        self.assertEqual(self._request(phone='').status_code, 400)

    def test_withdraw_min_and_max_enforced(self):
        self._cfg(min_withdrawal_amount=5000, max_withdrawal_amount=45000)
        self.assertEqual(self._request(amount=1000).status_code, 400)
        self.assertEqual(self._request(amount=50000).status_code, 400)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.balance, Decimal('100000'))

    def test_withdraw_daily_cap_enforced(self):
        self._cfg(withdrawal_daily_cap=50000)
        self.assertEqual(self._request(amount=40000).status_code, 201)
        r = self._request(amount=20000)
        self.assertEqual(r.status_code, 400)
        self.assertIn('journalier', str(r.data))

    def test_withdrawals_scoped_per_user(self):
        self._request()
        other = make_user('cli2', 'CLIENT')
        self.client.force_authenticate(other)
        data = self.client.get('/api/payments/withdrawals/').data
        self.assertEqual(len(data.get('results', data)), 0)
        self.client.force_authenticate(self.admin)
        data = self.client.get('/api/payments/withdrawals/').data
        self.assertEqual(len(data.get('results', data)), 1)
