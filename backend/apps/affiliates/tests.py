from datetime import date, timedelta
from decimal import Decimal
from rest_framework.test import APITestCase
from apps.bookings.models import Booking
from apps.users.models import User
from apps.vehicles.tests import make_vehicle
from .models import Agent, AgentReferral


class AffiliateWorkflowTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='affiliate-admin', email='admin@affiliate.test',
            password='x', role='ADMIN')

    def test_generated_codes_are_unique(self):
        first = Agent.objects.create(name='Premier agent', city='Douala')
        second = Agent.objects.create(name='Deuxième agent', city='Douala')
        self.assertEqual(first.code, 'AGT-DOUA-001')
        self.assertEqual(second.code, 'AGT-DOUA-002')
        self.assertLessEqual(len(first.code), 12)

    def test_register_code_links_referred_user(self):
        agent = Agent.objects.create(name='Référent', city='Douala')
        response = self.client.post('/api/users/register/', {
            'username': 'referred-user',
            'email': 'referred@example.com',
            'first_name': 'Client',
            'last_name': 'Référé',
            'password': 'SecurePass2026!',
            'password2': 'SecurePass2026!',
            'role': 'CLIENT',
            'agent_code': agent.code,
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(email='referred@example.com')
        self.assertEqual(user.agent_referral.agent, agent)

    def test_agent_code_accepted_in_ref_code_field(self):
        """Le champ parrainage du formulaire n'envoie que ref_code — un code
        agent saisi doit être accepté et créer le lien AgentReferral."""
        agent = Agent.objects.create(name='Agent via ref_code', city='Douala')
        response = self.client.post('/api/users/register/', {
            'username': 'agent-ref-user',
            'email': 'agent-ref@example.com',
            'first_name': 'Client', 'last_name': 'Agenté',
            'password': 'SecurePass2026!', 'password2': 'SecurePass2026!',
            'role': 'CLIENT',
            'ref_code': agent.code,
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(email='agent-ref@example.com')
        self.assertEqual(user.agent_referral.agent, agent)

    def test_commission_due_decreases_after_payout(self):
        agent = Agent.objects.create(
            name='Agent test', city='Yaoundé', commission_rate=Decimal('0.10'))
        client = User.objects.create_user(
            username='referred', email='referred@affiliate.test', password='x')
        AgentReferral.objects.create(agent=agent, referred_user=client)
        owner = User.objects.create_user(
            username='affiliate-owner', email='owner@affiliate.test', password='x', role='OWNER')
        vehicle = make_vehicle(owner, plate='AF-001-AA')
        booking = Booking.objects.create(
            client=client, vehicle=vehicle, status='completed',
            start_date=date.today(), end_date=date.today() + timedelta(days=1),
            daily_rate=Decimal('10000'), days=1, subtotal=Decimal('10000'),
            commission_amount=Decimal('5000'), owner_amount=Decimal('5000'))

        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/affiliates/agents/')
        self.assertEqual(response.status_code, 200)
        agent_data = response.data['results'][0]
        self.assertEqual(Decimal(agent_data['commission_due']), Decimal('1000.00'))
        payout = self.client.post('/api/affiliates/payouts/', {
            'agent': agent.pk, 'amount': '400.00', 'note': 'Virement enregistré',
        }, format='json')
        self.assertEqual(payout.status_code, 201, payout.data)
        agent.refresh_from_db()
        self.assertEqual(agent.commission_due, Decimal('600.00'))
        self.assertEqual(Booking.objects.get(pk=booking.pk).subtotal, Decimal('10000.00'))

    def test_affiliate_management_is_admin_only(self):
        member = User.objects.create_user(
            username='affiliate-member', email='member@affiliate.test', password='x')
        self.client.force_authenticate(member)
        self.assertEqual(self.client.get('/api/affiliates/agents/').status_code, 403)
        self.assertEqual(self.client.post('/api/affiliates/agents/', {
            'name': 'Agent interdit', 'city': 'Douala',
        }, format='json').status_code, 403)
        self.assertEqual(self.client.get('/api/affiliates/payouts/').status_code, 403)
        self.assertEqual(self.client.post('/api/affiliates/payouts/', {
            'agent': 999, 'amount': '1.00',
        }, format='json').status_code, 403)

    def _agent_with_referral(self):
        agent = Agent.objects.create(
            name='Agent filleuls', city='Douala', commission_rate=Decimal('0.10'))
        client = User.objects.create_user(
            username='filleul', email='filleul@test.cm', password='x',
            first_name='Brice', last_name='Mballa', phone='+237600001')
        AgentReferral.objects.create(agent=agent, referred_user=client)
        owner = User.objects.create_user(
            username='ref-owner', email='ref-owner@test.cm', password='x', role='OWNER')
        vehicle = make_vehicle(owner, plate='RF-001-AA')
        Booking.objects.create(
            client=client, vehicle=vehicle, status='completed',
            start_date=date.today(), end_date=date.today() + timedelta(days=2),
            daily_rate=Decimal('15000'), days=2, subtotal=Decimal('30000'),
            commission_amount=Decimal('4500'), owner_amount=Decimal('25500'))
        return agent, client

    def test_agent_referrals_endpoint_lists_stats(self):
        agent, client = self._agent_with_referral()
        # Un second filleul sans location
        other = User.objects.create_user(
            username='filleul2', email='filleul2@test.cm', password='x')
        AgentReferral.objects.create(agent=agent, referred_user=other)

        self.client.force_authenticate(self.admin)
        res = self.client.get(f'/api/affiliates/agents/{agent.pk}/referrals/')
        self.assertEqual(res.status_code, 200, res.data)
        rows = res.data['results'] if 'results' in res.data else res.data
        self.assertEqual(len(rows), 2)
        first = next(r for r in rows if r['email'] == 'filleul@test.cm')
        self.assertEqual(first['completed_bookings'], 1)
        self.assertEqual(Decimal(str(first['generated_revenue'])), Decimal('30000.00'))
        second = next(r for r in rows if r['email'] == 'filleul2@test.cm')
        self.assertEqual(second['completed_bookings'], 0)
        # Recherche
        res = self.client.get(f'/api/affiliates/agents/{agent.pk}/referrals/', {'q': 'Brice'})
        rows = res.data['results'] if 'results' in res.data else res.data
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['user_id'], client.pk)

    def test_payout_can_be_deleted_to_recredit_commission(self):
        agent, _ = self._agent_with_referral()
        self.client.force_authenticate(self.admin)
        payout = self.client.post('/api/affiliates/payouts/', {
            'agent': agent.pk, 'amount': '2000.00', 'note': 'Erreur',
        }, format='json')
        self.assertEqual(payout.status_code, 201, payout.data)
        agent.refresh_from_db()
        self.assertEqual(agent.commission_due, Decimal('1000.00'))
        res = self.client.delete(f"/api/affiliates/payouts/{payout.data['id']}/")
        self.assertEqual(res.status_code, 204)
        agent.refresh_from_db()
        self.assertEqual(agent.commission_due, Decimal('3000.00'))
