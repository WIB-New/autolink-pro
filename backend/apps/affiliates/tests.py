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
        self.assertEqual(first.code, 'AGT-DOUALA-001')
        self.assertEqual(second.code, 'AGT-DOUALA-002')

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
