from datetime import date, datetime, timedelta
from decimal import Decimal

from django.utils import timezone

from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.vehicles.tests import make_user, make_vehicle
from .models import DriverApplication, DriverEarning, DriverProfile


class DriverRecruitmentTests(APITestCase):
    def setUp(self):
        self.admin = make_user('driver-admin', 'ADMIN')
        self.applicant = make_user('driver-applicant', 'CLIENT')
        self.client.force_authenticate(self.applicant)

    def test_application_owner_can_submit_and_update_application(self):
        response = self.client.post('/api/drivers/applications/', {
            'experience_years': 4,
            'has_valid_license': True,
            'license_number': 'LIC-101',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        application_id = response.data['id']
        updated = self.client.patch(
            f'/api/drivers/applications/{application_id}/',
            {'experience_years': 5, 'status': 'approved', 'reviewer_notes': 'forged'},
            format='json',
        )
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(updated.data['experience_years'], 5)
        self.assertEqual(updated.data['status'], 'pending')
        self.assertEqual(updated.data['reviewer_notes'], '')

    def test_admin_approval_promotes_applicant_and_creates_profile(self):
        application = DriverApplication.objects.create(
            applicant=self.applicant,
            experience_years=5,
            has_valid_license=True,
            has_clean_criminal_record=True,
            has_medical_certificate=True,
            driving_test_passed=True,
            training_completed=True,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f'/api/drivers/admin/applications/{application.pk}/',
            {'status': 'approved', 'reviewer_notes': 'Dossier vérifié'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.applicant.refresh_from_db()
        self.assertEqual(self.applicant.role, 'DRIVER')
        self.assertTrue(DriverProfile.objects.filter(driver=self.applicant).exists())
        self.assertEqual(response.data['status'], 'approved')
        self.assertEqual(response.data['reviewer_notes'], 'Dossier vérifié')

    def test_admin_application_and_driver_lists_reject_non_admin(self):
        DriverApplication.objects.create(applicant=self.applicant)
        self.assertEqual(self.client.get('/api/drivers/admin/applications/').status_code, 403)
        self.assertEqual(self.client.get('/api/drivers/admin/profiles/').status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get('/api/drivers/admin/applications/').status_code, 200)
        self.assertEqual(self.client.get('/api/drivers/admin/profiles/').status_code, 200)


class DriverRideWorkflowTests(APITestCase):
    def setUp(self):
        self.owner = make_user('ride-owner', 'OWNER')
        self.driver = make_user('ride-driver', 'DRIVER')
        self.other_driver = make_user('other-ride-driver', 'DRIVER')
        self.client_user = make_user('ride-client', 'CLIENT')
        vehicle = make_vehicle(self.owner, 'DR-001-AA')
        start = date.today() + timedelta(days=5)
        self.booking = Booking.objects.create(
            client=self.client_user,
            vehicle=vehicle,
            driver=self.driver,
            driver_type='internal',
            driver_response='offered',
            status='confirmed',
            start_date=start,
            end_date=start + timedelta(days=1),
            daily_rate=25000,
            days=1,
            subtotal=25000,
            commission_amount=12500,
            owner_amount=12500,
            pickup_address='Akwa, Douala',
            dropoff_address='Bonanjo, Douala',
        )
        from apps.payments.models import Payment
        Payment.objects.create(
            booking=self.booking, payer=self.client_user, method='wallet', status='completed',
            amount=self.booking.subtotal, commission=self.booking.commission_amount,
            owner_payout=self.booking.owner_amount,
        )
        self.client.force_authenticate(self.driver)

    def test_driver_accept_start_and_finish_transitions(self):
        accepted = self.client.post(f'/api/bookings/{self.booking.pk}/driver-accept/')
        self.assertEqual(accepted.status_code, 200, accepted.data)
        self.assertEqual(accepted.data['driver_response'], 'accepted')
        started = self.client.patch(
            f'/api/bookings/{self.booking.pk}/', {'status': 'active'}, format='json')
        self.assertEqual(started.status_code, 200, started.data)
        self.assertEqual(started.data['status'], 'active')
        finished = self.client.patch(
            f'/api/bookings/{self.booking.pk}/', {'status': 'completed'}, format='json')
        self.assertEqual(finished.status_code, 200, finished.data)
        self.assertEqual(finished.data['status'], 'completed')
        self.booking.refresh_from_db()
        self.booking.finish()
        self.assertEqual(DriverEarning.objects.filter(booking=self.booking).count(), 1)
        profile = DriverProfile.objects.get(driver=self.driver)
        self.assertEqual(profile.total_earned, self.booking.driver_fee)
        self.assertEqual(profile.total_trips, 1)

    def test_completion_without_assigned_driver_creates_no_earning(self):
        self.booking.driver = None
        self.booking.save(update_fields=['driver'])
        self.booking.finish()
        self.assertFalse(DriverEarning.objects.filter(booking=self.booking).exists())

    def test_monthly_earnings_aggregate_ledger_for_last_twelve_months(self):
        earlier_start = self.booking.start_date + timedelta(days=20)
        earlier_booking = Booking.objects.create(
            client=self.client_user,
            vehicle=self.booking.vehicle,
            driver=self.driver,
            status='completed',
            start_date=earlier_start,
            end_date=earlier_start + timedelta(days=1),
            daily_rate=25000,
            days=1,
            subtotal=25000,
            commission_amount=12500,
            owner_amount=12500,
            pickup_address='Centre, Douala',
            dropoff_address='Bonapriso, Douala',
        )
        first = DriverEarning.objects.create(
            driver=self.driver, booking=self.booking, amount=Decimal('2500.00'))
        second = DriverEarning.objects.create(
            driver=self.driver, booking=earlier_booking, amount=Decimal('1250.00'))
        previous_month = timezone.localdate().replace(day=1) - timedelta(days=1)
        previous_month_at = timezone.make_aware(datetime.combine(previous_month, datetime.min.time()))
        DriverEarning.objects.filter(pk=second.pk).update(created_at=previous_month_at)

        response = self.client.get('/api/drivers/profiles/earnings/')
        self.assertEqual(response.status_code, 200, response.data)
        monthly = response.data['monthly_earnings']
        self.assertEqual(len(monthly), 12)
        current_month = timezone.localdate().strftime('%Y-%m')
        previous_month_key = previous_month.strftime('%Y-%m')
        current = next(item for item in monthly if item['month'] == current_month)
        previous = next(item for item in monthly if item['month'] == previous_month_key)
        self.assertEqual(Decimal(str(current['earnings'])), first.amount)
        self.assertEqual(current['trips'], 1)
        self.assertEqual(Decimal(str(previous['earnings'])), second.amount)
        self.assertEqual(previous['trips'], 1)

    def test_driver_cannot_accept_or_change_another_drivers_ride(self):
        self.booking.driver = self.other_driver
        self.booking.save(update_fields=['driver'])
        response = self.client.post(f'/api/bookings/{self.booking.pk}/driver-accept/')
        self.assertEqual(response.status_code, 404)
        response = self.client.patch(
            f'/api/bookings/{self.booking.pk}/', {'status': 'active'}, format='json')
        self.assertEqual(response.status_code, 404)
