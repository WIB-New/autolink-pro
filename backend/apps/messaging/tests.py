from datetime import date, timedelta
from decimal import Decimal
from rest_framework.test import APITestCase
from apps.bookings.models import Booking
from apps.users.models import Notification, PlatformSettings, User
from apps.vehicles.tests import make_vehicle


def make_user(username, role, balance=0):
    return User.objects.create_user(
        username=username, email=f'{username}@test.cm', password='x', role=role,
        first_name=username.title(), last_name='Test', balance=balance)


def make_booking(client, vehicle, **extra):
    data = dict(client=client, vehicle=vehicle, start_date=date.today() + timedelta(days=2),
                end_date=date.today() + timedelta(days=4), daily_rate=Decimal('25000'),
                status='confirmed', days=2, subtotal=0, commission_amount=0, owner_amount=0)
    data.update(extra)
    return Booking.objects.create(**data)


class MessagingTests(APITestCase):
    def setUp(self):
        self.client_user = make_user('cliente', 'CLIENT')
        self.owner = make_user('proprio', 'OWNER')
        self.stranger = make_user('intrus', 'CLIENT')
        self.admin = make_user('admin1', 'ADMIN')
        self.booking = make_booking(self.client_user, make_vehicle(self.owner))

    def test_booking_conversation_flow(self):
        self.client.force_authenticate(self.client_user)
        r = self.client.post('/api/messaging/conversations/', {'booking': self.booking.pk}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        conv_id = r.data['id']
        again = self.client.post('/api/messaging/conversations/', {'booking': self.booking.pk}, format='json')
        self.assertEqual(again.data['id'], conv_id)
        sent = self.client.post(f'/api/messaging/conversations/{conv_id}/messages/',
                                {'content': 'Bonjour, à quelle heure ?'}, format='json')
        self.assertEqual(sent.status_code, 201, sent.data)
        self.assertTrue(Notification.objects.filter(user=self.owner, title='Nouveau message').exists())

        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get('/api/messaging/unread/').data['unread'], 1)
        listing = self.client.get('/api/messaging/conversations/')
        self.assertEqual(listing.data['results'][0]['unread_count'], 1)
        thread = self.client.get(f'/api/messaging/conversations/{conv_id}/messages/')
        self.assertEqual(len(thread.data), 1)
        self.assertFalse(thread.data[0]['is_mine'])
        self.assertEqual(self.client.get('/api/messaging/unread/').data['unread'], 0)

    def test_non_participant_cannot_open_booking_conversation(self):
        self.client.force_authenticate(self.stranger)
        r = self.client.post('/api/messaging/conversations/', {'booking': self.booking.pk}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_support_conversation_includes_admins(self):
        self.client.force_authenticate(self.client_user)
        r = self.client.post('/api/messaging/conversations/', {'support': True}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn(self.admin.pk, [p['id'] for p in r.data['participants']])

    def test_direct_conversation_open_to_all_roles(self):
        """La composition « Nouvel échange » est disponible pour tous les rôles —
        un client peut ouvrir une conversation directe avec un propriétaire."""
        self.client.force_authenticate(self.client_user)
        r = self.client.post('/api/messaging/conversations/', {'user': self.owner.pk}, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertIn(self.owner.pk, [p['id'] for p in r.data['participants']])
        # Réutilisation : un second POST renvoie la même conversation.
        again = self.client.post('/api/messaging/conversations/', {'user': self.owner.pk}, format='json')
        self.assertEqual(again.data['id'], r.data['id'])


class OwnerRequestTests(APITestCase):
    def setUp(self):
        self.client_user = make_user('loc', 'CLIENT', balance=Decimal('500000'))
        self.owner = make_user('owner2', 'OWNER')
        self.vehicle = make_vehicle(self.owner, deposit_amount=Decimal('0'))
        self.client.force_authenticate(self.client_user)
        r = self.client.post('/api/bookings/', {
            'vehicle': self.vehicle.pk, 'start_date': str(date.today() + timedelta(days=3)),
            'end_date': str(date.today() + timedelta(days=5)), 'payment_method': 'wallet',
        }, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.booking = Booking.objects.get(pk=r.data['id'])

    def test_owner_sees_and_accepts_request(self):
        self.client.force_authenticate(self.owner)
        requests = self.client.get('/api/bookings/owner-requests/')
        self.assertEqual([b['id'] for b in requests.data], [self.booking.pk])
        r = self.client.post(f'/api/bookings/{self.booking.pk}/owner-accept/')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['owner_response'], 'accepted')
        self.assertEqual(self.client.get('/api/bookings/owner-requests/').data, [])

    def test_owner_refusal_cancels_and_refunds(self):
        self.client_user.refresh_from_db()
        balance_after_payment = self.client_user.balance
        self.client.force_authenticate(self.owner)
        r = self.client.post(f'/api/bookings/{self.booking.pk}/owner-refuse/', {'reason': 'Indisponible'})
        self.assertEqual(r.status_code, 200, r.data)
        self.booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.assertEqual(self.booking.status, 'cancelled')
        self.assertEqual(self.client_user.balance, balance_after_payment + self.booking.subtotal)

    def test_other_owner_cannot_answer(self):
        self.client.force_authenticate(make_user('autre', 'OWNER'))
        r = self.client.post(f'/api/bookings/{self.booking.pk}/owner-accept/')
        self.assertEqual(r.status_code, 404)

    def test_client_rates_completed_booking_once(self):
        self.client.post(f'/api/bookings/{self.booking.pk}/rate/', {'rating': 5})
        self.booking.refresh_from_db()
        self.assertIsNone(self.booking.client_rating)
        Booking.objects.filter(pk=self.booking.pk).update(status='completed')
        r = self.client.post(f'/api/bookings/{self.booking.pk}/rate/', {'rating': 4, 'review': 'Très bien'})
        self.assertEqual(r.status_code, 200, r.data)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.rating, Decimal('4.00'))
        self.assertEqual(self.vehicle.rating_count, 1)
        self.assertEqual(self.client.post(f'/api/bookings/{self.booking.pk}/rate/', {'rating': 5}).status_code, 400)

    def test_owner_stats(self):
        self.client.force_authenticate(self.owner)
        r = self.client.get('/api/bookings/owner-stats/')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['pending_requests'], 1)
        self.assertEqual(len(r.data['monthly_series']), 6)


# Les tests des retraits (réserve de solde, approbation, rejet + recrédit,
# auto-approbation, plafonds min/max, remboursement admin) sont maintenus
# dans apps/payments/tests.py::WithdrawalTests.


class PlatformAndKycTests(APITestCase):
    def setUp(self):
        self.admin = make_user('admin5', 'ADMIN')
        self.user = make_user('client5', 'CLIENT')

    def test_admin_updates_commission_used_by_bookings(self):
        self.client.force_authenticate(self.admin)
        r = self.client.patch('/api/users/platform-settings/', {'commission_rate': '0.30'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        booking = make_booking(self.user, make_vehicle(make_user('own5', 'OWNER')))
        self.assertEqual(booking.commission_amount, (booking.subtotal * Decimal('0.30')).quantize(Decimal('0.01')))
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get('/api/users/platform-settings/').status_code, 403)
        self.assertEqual(PlatformSettings.objects.count(), 1)

    def test_bookings_can_be_suspended(self):
        settings = PlatformSettings.current()
        settings.bookings_enabled = False
        settings.save()
        vehicle = make_vehicle(make_user('own6', 'OWNER'))
        self.client.force_authenticate(self.user)
        r = self.client.post('/api/bookings/', {
            'vehicle': vehicle.pk, 'start_date': str(date.today() + timedelta(days=3)),
            'end_date': str(date.today() + timedelta(days=5)),
        }, format='json')
        self.assertEqual(r.status_code, 400)
        self.assertFalse(Booking.objects.exists())

    def test_notification_delete_is_scoped_to_owner(self):
        mine = Notification.objects.create(user=self.user, title='A', message='B')
        other = Notification.objects.create(user=self.admin, title='C', message='D')
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.delete(f'/api/users/notifications/{other.pk}/').status_code, 404)
        self.assertEqual(self.client.delete(f'/api/users/notifications/{mine.pk}/').status_code, 204)
        self.assertTrue(Notification.objects.filter(pk=other.pk).exists())

    def test_kyc_submission_and_admin_validation(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.client.force_authenticate(self.user)
        r = self.client.post('/api/users/me/kyc/', {
            'id_document': SimpleUploadedFile('cni.pdf', b'%PDF-1.4 test', content_type='application/pdf'),
        }, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['kyc_status'], 'pending')
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get('/api/users/admin/activity/').data['queue']['kyc_pending'], 1)
        r = self.client.patch(f'/api/users/{self.user.pk}/', {'kyc_status': 'approved'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.id_document_verified)
        self.assertTrue(Notification.objects.filter(user=self.user, title='Documents validés').exists())
