from django.core import mail, signing
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch
from django.test import override_settings
from rest_framework.test import APITestCase
from apps.users.models import ContactMessage, LoginCode, NewsletterCampaign, User
from apps.users.views import NEWSLETTER_UNSUBSCRIBE_SALT


class AuthTests(APITestCase):
    """Inscription / connexion / permissions."""

    def _register(self, email='nouveau@test.cm', password='SecurePass2026!', **extra):
        data = {
            'username': email.split('@')[0], 'email': email,
            'password': password, 'password2': password,
            'first_name': 'Test', 'last_name': 'User',
            'phone': '+237690000001', 'role': 'CLIENT',
        }
        data.update(extra)
        return self.client.post('/api/users/register/', data, format='json')

    def test_register_returns_tokens(self):
        r = self._register()
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn('access', r.data)
        self.assertEqual(r.data['user']['email'], 'nouveau@test.cm')
        self.assertEqual(r.data['user']['role'], 'CLIENT')

    def test_register_rejects_password_mismatch(self):
        r = self._register(password='AAAaaa111!', password2='BBBbbb222!')
        self.assertEqual(r.status_code, 400)

    def test_register_rejects_duplicate_email(self):
        self._register()
        r = self._register(username='autre')
        self.assertEqual(r.status_code, 400)

    def test_login_ok_and_bad_password(self):
        self._register()
        ok = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'SecurePass2026!'}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertIn('access', ok.data)
        bad = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'mauvais'}, format='json')
        self.assertIn(bad.status_code, (400, 401))

    def test_me_requires_auth(self):
        anon = self.client.get('/api/users/me/')
        self.assertIn(anon.status_code, (401, 403))
        self._register()
        tok = self.client.post('/api/users/login/', {
            'email': 'nouveau@test.cm', 'password': 'SecurePass2026!'},
            format='json').data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tok}')
        r = self.client.get('/api/users/me/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['email'], 'nouveau@test.cm')

    def test_me_can_update_language_preference(self):
        user = User.objects.create_user(
            username='language-user', email='language@example.com',
            password='SecurePass2026!')
        self.client.force_authenticate(user)

        response = self.client.patch(
            '/api/users/me/', {'language': 'en'}, format='json')

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['language'], 'en')
        user.refresh_from_db()
        self.assertEqual(user.language, 'en')

    def test_user_list_admin_only(self):
        client = User.objects.create_user(username='c', email='c@c.cm', password='x', role='CLIENT')
        admin = User.objects.create_user(username='a', email='a@a.cm', password='x', role='ADMIN')
        self.client.force_authenticate(client)
        self.assertIn(self.client.get('/api/users/').status_code, (401, 403))
        self.client.force_authenticate(admin)
        self.assertEqual(self.client.get('/api/users/').status_code, 200)

    def test_admin_user_create_update_delete_permissions_and_activity(self):
        client = User.objects.create_user(username='ordinary', email='ordinary@test.cm', password='x', role='CLIENT')
        admin = User.objects.create_user(username='admin-user', email='admin-user@test.cm', password='x', role='ADMIN')
        payload = {
            'username': 'created-user', 'email': 'created@test.cm',
            'first_name': 'Created', 'last_name': 'User', 'role': 'CLIENT',
            'phone': '+237690000001', 'password': 'ValidPassword2026!',
        }

        self.client.force_authenticate(client)
        self.assertEqual(self.client.post('/api/users/', payload, format='json').status_code, 403)
        self.assertEqual(self.client.patch(f'/api/users/{admin.pk}/', {'is_active': False}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/users/{admin.pk}/').status_code, 403)

        self.client.force_authenticate(admin)
        created = self.client.post('/api/users/', payload, format='json')
        self.assertEqual(created.status_code, 201, created.data)
        user = User.objects.get(username='created-user')
        listed = self.client.get('/api/users/', {'search': 'created@test.cm'})
        self.assertEqual(listed.data['results'][0]['bookings_count'], 0)
        self.assertEqual(listed.data['results'][0]['vehicles_count'], 0)
        updated = self.client.patch(f'/api/users/{user.pk}/', {'is_active': False}, format='json')
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertFalse(updated.data['is_active'])
        self.assertEqual(self.client.delete(f'/api/users/{user.pk}/').status_code, 204)


class OTPLoginTests(APITestCase):
    """Connexion par code email — type agence : nom + email → code → JWT."""

    def _request(self, email='voyageur@gmail.com', **extra):
        return self.client.post('/api/users/otp/request/', {
            'email': email, 'first_name': 'Jean', 'last_name': 'Dupont', **extra},
            format='json')

    def test_request_sends_email(self):
        r = self._request()
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('AutoLink', mail.outbox[0].subject)
        otp = LoginCode.objects.get(email='voyageur@gmail.com')
        self.assertEqual(len(otp.code), 6)
        self.assertIn(otp.code, mail.outbox[0].subject)

    def test_request_rate_limited(self):
        self._request()
        r = self._request()
        self.assertEqual(r.status_code, 429)

    def test_request_rejects_bad_email(self):
        r = self._request(email='pas-un-email')
        self.assertEqual(r.status_code, 400)

    def test_verify_creates_account_and_returns_jwt(self):
        self._request()
        otp = LoginCode.objects.get(email='voyageur@gmail.com')
        r = self.client.post('/api/users/otp/verify/', {
            'email': 'voyageur@gmail.com', 'code': otp.code}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertIn('access', r.data)
        user = User.objects.get(email='voyageur@gmail.com')
        self.assertEqual(user.role, 'CLIENT')
        self.assertEqual(user.first_name, 'Jean')
        self.assertTrue(user.is_verified)  # email prouvé par le code
        # le code est consommé
        self.assertFalse(LoginCode.objects.filter(email='voyageur@gmail.com').exists())

    def test_verify_existing_user_logs_in(self):
        User.objects.create_user(username='ex', email='voyageur@gmail.com',
                                 password='x', role='CLIENT')
        self._request()
        otp = LoginCode.objects.get(email='voyageur@gmail.com')
        r = self.client.post('/api/users/otp/verify/', {
            'email': 'voyageur@gmail.com', 'code': otp.code}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(User.objects.filter(email='voyageur@gmail.com').count(), 1)

    def test_wrong_code_then_lockout(self):
        self._request()
        for _ in range(5):
            r = self.client.post('/api/users/otp/verify/', {
                'email': 'voyageur@gmail.com', 'code': '000000'}, format='json')
        self.assertEqual(r.status_code, 400)
        # 6e tentative → code supprimé / trop de tentatives
        r = self.client.post('/api/users/otp/verify/', {
            'email': 'voyageur@gmail.com', 'code': '000000'}, format='json')
        self.assertIn(r.status_code, (400, 429))

    def test_expired_code_rejected(self):
        self._request()
        otp = LoginCode.objects.get(email='voyageur@gmail.com')
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()
        r = self.client.post('/api/users/otp/verify/', {
            'email': 'voyageur@gmail.com', 'code': otp.code}, format='json')
        self.assertEqual(r.status_code, 400)


class NotificationTests(APITestCase):
    def test_notifications_scoped_to_user(self):
        u1 = User.objects.create_user(username='u1', email='u1@x.cm', password='x')
        u2 = User.objects.create_user(username='u2', email='u2@x.cm', password='x')
        u1.notifications.create(title='t', message='m')
        self.client.force_authenticate(u2)
        r = self.client.get('/api/users/notifications/')
        data = r.data.get('results', r.data) if isinstance(r.data, dict) else r.data
        self.assertEqual(len(data), 0)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ContactEndpointTests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()

    def test_contact_saves_and_sends_notification_and_acknowledgement(self):
        response = self.client.post('/api/contact/', {
            'last_name': 'Nana',
            'first_name': 'Jean',
            'phone': '+237 699 000 000',
            'email': 'jean@example.com',
            'rental_type': 'Location urbaine',
            'message': 'Besoin d’un véhicule demain.',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        message = ContactMessage.objects.get()
        self.assertEqual(message.email, 'jean@example.com')
        self.assertEqual(len(mail.outbox), 2)
        self.assertEqual(mail.outbox[0].to, ['wibchallenge@gmail.com'])
        self.assertEqual(mail.outbox[1].to, ['jean@example.com'])

    def test_english_accept_language_localizes_contact_acknowledgement(self):
        response = self.client.post('/api/contact/', {
            'last_name': 'Nana',
            'first_name': 'Jean',
            'phone': '+237 699 000 000',
            'email': 'jean@example.com',
            'message': 'I need a vehicle tomorrow.',
        }, format='json', HTTP_ACCEPT_LANGUAGE='en-GB,en;q=0.9')

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn('We received your message', mail.outbox[1].subject)
        self.assertIn('Hello Jean', mail.outbox[1].body)
        self.assertIn('get back to you', mail.outbox[1].body)

    @patch('apps.users.views.send_mail', side_effect=OSError('Mail unavailable'))
    def test_contact_saves_message_when_email_fails(self, send_mail_mock):
        response = self.client.post('/api/contact/', {
            'last_name': 'Nana',
            'first_name': 'Jean',
            'phone': '+237 699 000 000',
            'message': 'Besoin d’un véhicule demain.',
        }, format='json')

        self.assertEqual(response.status_code, 502)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertIn('enregistré', response.data['detail'])

    def test_site_config_is_public_and_has_company_contacts(self):
        response = self.client.get('/api/site-config/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['contact_email'], 'wibchallenge@gmail.com')
        self.assertEqual(len(response.data['phones']), 2)
        self.assertEqual(response.data['hours'], {
            'weekdays': {'open': '06:00', 'close': '22:00'},
            'saturday': {'open': '07:00', 'close': '21:00'},
            'sunday': None,
        })


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AuthenticationEmailTests(APITestCase):
    def setUp(self):
        mail.outbox = []

    def test_registration_sends_welcome_email(self):
        response = self.client.post('/api/users/register/', {
            'username': 'welcome-user',
            'email': 'welcome@example.com',
            'first_name': 'Awa',
            'last_name': 'Nana',
            'password': 'SecurePass2026!',
            'password2': 'SecurePass2026!',
            'role': 'CLIENT',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Bienvenue', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ['welcome@example.com'])

    def test_english_registration_sets_language_and_sends_english_welcome(self):
        response = self.client.post('/api/users/register/', {
            'username': 'welcome-english',
            'email': 'welcome-english@example.com',
            'first_name': 'Awa',
            'last_name': 'Nana',
            'password': 'SecurePass2026!',
            'password2': 'SecurePass2026!',
            'role': 'CLIENT',
        }, format='json', HTTP_ACCEPT_LANGUAGE='en')

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['user']['language'], 'en')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Welcome to AutoLink Pro')
        self.assertIn('Your account is ready', mail.outbox[0].body)

    def test_password_login_sends_notification_email(self):
        User.objects.create_user(
            username='member',
            email='member@example.com',
            password='SecurePass2026!',
            first_name='Awa',
        )

        response = self.client.post('/api/users/login/', {
            'email': 'member@example.com',
            'password': 'SecurePass2026!',
        }, format='json')

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('connexion', mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ['member@example.com'])


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class NewsletterTests(APITestCase):
    def setUp(self):
        mail.outbox = []
        self.admin = User.objects.create_user(
            username='newsletter-admin',
            email='admin@example.com',
            password='SecurePass2026!',
            role='ADMIN',
            newsletter_opt_in=False,
        )
        self.client.force_authenticate(self.admin)

    def test_signed_unsubscribe_turns_off_opt_in(self):
        user = User.objects.create_user(
            username='subscriber',
            email='subscriber@example.com',
            password='SecurePass2026!',
        )
        token = signing.dumps(
            {'user_id': user.pk, 'email': user.email},
            salt=NEWSLETTER_UNSUBSCRIBE_SALT,
        )

        response = self.client.get('/api/users/newsletter/unsubscribe/', {'token': token})

        self.assertEqual(response.status_code, 200, response.data)
        user.refresh_from_db()
        self.assertFalse(user.newsletter_opt_in)

    def test_campaign_sends_only_to_opted_in_active_users(self):
        subscriber = User.objects.create_user(
            username='subscriber',
            email='subscriber@example.com',
            password='SecurePass2026!',
        )
        opted_out = User.objects.create_user(
            username='opted-out',
            email='opted-out@example.com',
            password='SecurePass2026!',
            newsletter_opt_in=False,
        )
        inactive = User.objects.create_user(
            username='inactive',
            email='inactive@example.com',
            password='SecurePass2026!',
            is_active=False,
        )

        response = self.client.post('/api/users/newsletter/send/', {
            'subject': 'Actualités AutoLink',
            'html_body': '<p>Bonjour !</p>',
            'text_body': 'Bonjour !',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['recipients_count'], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [subscriber.email])
        self.assertIn('Se désinscrire', mail.outbox[0].body)
        campaign = NewsletterCampaign.objects.get()
        self.assertEqual(campaign.recipients_count, 1)
        self.assertEqual(campaign.sent_by, self.admin)
        self.assertTrue(opted_out.is_active)
        self.assertFalse(inactive.is_active)

    def test_campaign_uses_english_unsubscribe_footer_for_english_recipient(self):
        subscriber = User.objects.create_user(
            username='english-subscriber',
            email='english-subscriber@example.com',
            password='SecurePass2026!',
            language='en',
        )

        response = self.client.post('/api/users/newsletter/send/', {
            'subject': 'AutoLink news',
            'text_body': 'New vehicles are available.',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['recipients_count'], 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [subscriber.email])
        self.assertIn('Unsubscribe:', mail.outbox[0].body)


class MeDataExportTests(APITestCase):
    def test_export_returns_pdf_for_authenticated_user(self):
        from apps.bookings.models import Booking
        from apps.payments.models import WalletTransaction
        from apps.vehicles.models import Vehicle

        from datetime import date
        from decimal import Decimal

        user = User.objects.create_user(username='export-user', email='export@example.com', password='SecurePass2026!')
        owner = User.objects.create_user(username='export-owner', email='owner@example.com', password='SecurePass2026!', role='OWNER')
        start = date.today()
        vehicle = Vehicle.objects.create(
            owner=owner, brand='Toyota', model='Corolla', year=2020, plate='TST-EXP-01',
            category='Berline', fuel='essence', seats=5, color='Blanc', mode='home',
            status='approved', daily_rate=25000, insurance_type='standard',
            insurance_expiry=start + timedelta(days=300), market_value=15_000_000,
            mileage=60000, condition_score=80, city='Douala')
        booking = Booking.objects.create(
            client=user, vehicle=vehicle, status='confirmed',
            start_date=start, end_date=start + timedelta(days=2),
            daily_rate=Decimal('25000'), days=2, subtotal=50000,
            commission_amount=0, owner_amount=0, deposit_amount=0,
        )
        WalletTransaction.objects.create(user=user, kind='topup', amount=10000, balance_after=10000, reference='TX-EXP-1')

        self.client.force_authenticate(user)
        response = self.client.get('/api/users/me/export/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment;', response['Content-Disposition'])
        self.assertTrue(response.content.startswith(b'%PDF'))
        self.assertGreater(len(response.content), 500)
        self.assertEqual(booking.client, user)

    def test_export_requires_authentication(self):
        response = self.client.get('/api/users/me/export/')
        self.assertEqual(response.status_code, 401)
