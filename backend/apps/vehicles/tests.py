from datetime import date, timedelta
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from apps.users.models import User
from apps.bookings.models import Booking
from .models import Favorite, Vehicle, VehiclePhoto


def make_user(username, role='CLIENT'):
    return User.objects.create_user(
        username=username, email=f'{username}@test.cm', password='x', role=role)


def make_vehicle(owner, plate='LT-001-AA', brand='Toyota', model='Corolla',
                 year=2019, status='approved', daily_rate=25000,
                 market_value=15_000_000, mileage=60000, **extra):
    data = dict(
        owner=owner, brand=brand, model=model, year=year, plate=plate,
        category='Berline', fuel='essence', seats=5, color='Blanc',
        mode='home', status=status, daily_rate=daily_rate,
        insurance_type='standard', insurance_expiry=date.today() + timedelta(days=300),
        market_value=market_value, mileage=mileage, condition_score=80, city='Douala',
    )
    data.update(extra)
    return Vehicle.objects.create(**data)


class VehicleCatalogueTests(APITestCase):
    def setUp(self):
        self.owner = make_user('owner', 'OWNER')
        self.client_user = make_user('cli', 'CLIENT')
        self.approved = make_vehicle(self.owner, 'LT-100-AA')
        self.pending = make_vehicle(self.owner, 'LT-200-BB', status='pending')

    def test_owner_blocks_dates_without_vehicle_in_payload(self):
        self.client.force_authenticate(self.owner)
        start = date.today() + timedelta(days=10)
        response = self.client.post(f'/api/vehicles/{self.approved.pk}/availability/', {
            'start_date': str(start), 'end_date': str(start + timedelta(days=2)),
            'reason': 'Maintenance',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['vehicle'], self.approved.pk)

    def test_block_dates_rejects_other_owner_and_invalid_range(self):
        self.client.force_authenticate(self.client_user)
        start = date.today() + timedelta(days=10)
        payload = {'start_date': str(start), 'end_date': str(start + timedelta(days=2))}
        forbidden = self.client.post(f'/api/vehicles/{self.approved.pk}/availability/', payload, format='json')
        self.assertEqual(forbidden.status_code, 403, forbidden.data)
        self.client.force_authenticate(self.owner)
        invalid = self.client.post(f'/api/vehicles/{self.approved.pk}/availability/', {
            **payload, 'end_date': str(start - timedelta(days=1)),
        }, format='json')
        self.assertEqual(invalid.status_code, 400, invalid.data)
        self.assertFalse(self.approved.unavailable_periods.exists())

    def test_public_catalogue_only_approved(self):
        r = self.client.get('/api/vehicles/')
        self.assertEqual(r.status_code, 200)
        plates = {v['plate'] for v in (r.data.get('results') or r.data)}
        self.assertIn('LT-100-AA', plates)
        self.assertNotIn('LT-200-BB', plates)

    def test_owner_management_requires_mine_param(self):
        """Le propriétaire gère ses véhicules via ?mine=1 et peut aussi
        parcourir le catalogue public comme un client."""
        self.client.force_authenticate(self.owner)
        catalogue = self.client.get('/api/vehicles/')
        plates = {v['plate'] for v in (catalogue.data.get('results') or catalogue.data)}
        self.assertNotIn('LT-200-BB', plates)  # pending non visible publiquement
        mine = self.client.get('/api/vehicles/?mine=1')
        plates = {v['plate'] for v in (mine.data.get('results') or mine.data)}
        self.assertIn('LT-200-BB', plates)

    def test_create_vehicle_goes_pending(self):
        self.client.force_authenticate(self.owner)
        r = self.client.post('/api/vehicles/', {
            'brand': 'Toyota', 'model': 'RAV4', 'year': 2020,
            'plate': 'LT-300-CC', 'category': 'SUV', 'fuel': 'essence',
            'seats': 5, 'color': 'Noir', 'mode': 'home', 'daily_rate': 45000,
            'insurance_type': 'all_risk',
            'insurance_expiry': str(date.today() + timedelta(days=300)),
            'market_value': 28_000_000, 'mileage': 40000, 'condition_score': 85,
            'city': 'Douala',
        }, format='json')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['status'], 'pending')

    def test_create_vehicle_requires_auth(self):
        r = self.client.post('/api/vehicles/', {'brand': 'X'}, format='json')
        self.assertIn(r.status_code, (401, 403))

    def test_admin_vehicle_management_is_admin_only(self):
        admin = make_user('catalog-admin', 'ADMIN')
        self.client.force_authenticate(self.client_user)
        self.assertEqual(self.client.get('/api/vehicles/admin/').status_code, 403)
        self.assertEqual(self.client.patch(f'/api/vehicles/admin/{self.approved.pk}/', {'status': 'suspended'}, format='json').status_code, 403)
        self.assertEqual(self.client.delete(f'/api/vehicles/admin/{self.approved.pk}/').status_code, 403)

        self.client.force_authenticate(admin)
        self.assertEqual(self.client.get('/api/vehicles/admin/').status_code, 200)
        updated = self.client.patch(
            f'/api/vehicles/admin/{self.approved.pk}/',
            {'status': 'suspended'}, format='json')
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(updated.data['status'], 'suspended')
        self.assertEqual(self.client.delete(f'/api/vehicles/admin/{self.approved.pk}/').status_code, 204)


class TierClassificationTests(APITestCase):
    """Classification objective : la catégorie est recalculée au save()."""

    def setUp(self):
        self.owner = make_user('owner', 'OWNER')

    def test_prestige_brand_is_collection(self):
        v = make_vehicle(self.owner, 'LT-500-EE', brand='Porsche',
                         model='Cayenne', year=2023, market_value=120_000_000,
                         mileage=5000, condition_score=95)
        self.assertEqual(v.tier, 'collection')

    def test_old_economy_is_basic(self):
        v = make_vehicle(self.owner, 'LT-600-FF', brand='Toyota', model='Corolla',
                         year=2008, market_value=4_000_000, mileage=260000,
                         condition_score=40)
        self.assertEqual(v.tier, 'basic')

    def test_price_clamped_within_margin(self):
        """Le prix demandé ne peut pas dépasser ±20 % de l'indicatif calculé."""
        v = make_vehicle(self.owner, 'LT-700-GG', daily_rate=10_000_000)
        self.assertLessEqual(float(v.daily_rate), float(v.computed_rate) * 1.20 + 1)
        self.assertGreaterEqual(float(v.daily_rate), float(v.computed_rate) * 0.80 - 1)

    def test_computed_rate_minimum_floor(self):
        v = make_vehicle(self.owner, 'LT-800-HH', daily_rate=1,
                         market_value=1_000_000, year=2005, mileage=400000,
                         condition_score=10)
        self.assertGreaterEqual(float(v.computed_rate), 8000)


class VehicleMediaAndDiscoveryTests(APITestCase):
    def setUp(self):
        self.owner = make_user('media-owner', 'OWNER')
        self.client_user = make_user('media-client')
        self.other_owner = make_user('other-owner', 'OWNER')
        self.vehicle = make_vehicle(self.owner, 'LT-900-AB')
        self.client.force_authenticate(self.owner)

    def test_fuel_choices_include_super_and_gasoil(self):
        values = {value for value, _label in Vehicle.Fuel.choices}
        self.assertTrue({'super', 'gasoil', 'essence', 'diesel', 'hybrid', 'electric'} <= values)

    def test_media_upload_accepts_image_and_video_and_rejects_bad_type(self):
        response = self.client.post(
            f'/api/vehicles/{self.vehicle.pk}/media/',
            {'files': [
                SimpleUploadedFile('front.jpg', b'image', content_type='image/jpeg'),
                SimpleUploadedFile('walkaround.mp4', b'video', content_type='video/mp4'),
            ], 'positions': ['interior', 'other']},
            format='multipart',
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual({item['kind'] for item in response.data}, {'image', 'video'})
        self.assertEqual([item['position'] for item in response.data], ['interior', 'other'])
        bad = self.client.post(
            f'/api/vehicles/{self.vehicle.pk}/media/',
            {'files': [SimpleUploadedFile('document.pdf', b'pdf', content_type='application/pdf')]},
            format='multipart',
        )
        self.assertEqual(bad.status_code, 400)

    def test_media_upload_rejects_oversize_image(self):
        image = SimpleUploadedFile(
            'large.jpg', b'x' * (10 * 1024 * 1024 + 1), content_type='image/jpeg')
        response = self.client.post(
            f'/api/vehicles/{self.vehicle.pk}/media/', {'files': [image]}, format='multipart')
        self.assertEqual(response.status_code, 400)

    def test_media_delete_endpoint_removes_owner_media(self):
        photo = VehiclePhoto.objects.create(
            vehicle=self.vehicle,
            image=SimpleUploadedFile('remove.jpg', b'image', content_type='image/jpeg'),
        )
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/media/{photo.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(VehiclePhoto.objects.filter(pk=photo.pk).exists())

    def test_media_delete_endpoint_removes_owner_media(self):
        photo = VehiclePhoto.objects.create(
            vehicle=self.vehicle,
            image=SimpleUploadedFile('remove.jpg', b'image', content_type='image/jpeg'),
        )
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/media/{photo.pk}/')
        self.assertEqual(response.status_code, 204)
        self.assertFalse(VehiclePhoto.objects.filter(pk=photo.pk).exists())

    def test_owner_can_edit_and_delete_own_vehicle(self):
        response = self.client.patch(
            f'/api/vehicles/{self.vehicle.pk}/',
            {'color': 'Rouge'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['color'], 'Rouge')
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, 204)

    def test_key_vehicle_edit_returns_approved_vehicle_to_pending(self):
        response = self.client.patch(
            f'/api/vehicles/{self.vehicle.pk}/',
            {'brand': 'Honda'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['status'], 'pending')

    def test_key_vehicle_edit_returns_approved_vehicle_to_pending(self):
        response = self.client.patch(
            f'/api/vehicles/{self.vehicle.pk}/',
            {'brand': 'Honda'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['status'], 'pending')

    def test_owner_cannot_edit_or_delete_another_owners_vehicle(self):
        theirs = make_vehicle(self.other_owner, 'LT-901-AB')
        self.assertEqual(self.client.patch(
            f'/api/vehicles/{theirs.pk}/', {'color': 'Rouge'}, format='json').status_code, 404)
        self.assertEqual(self.client.delete(f'/api/vehicles/{theirs.pk}/').status_code, 404)

    def test_delete_vehicle_with_bookings_returns_400(self):
        Booking.objects.create(
            client=self.client_user, vehicle=self.vehicle,
            start_date=date.today() + timedelta(days=10),
            end_date=date.today() + timedelta(days=11),
            daily_rate=25000, days=1, subtotal=0, commission_amount=0, owner_amount=0,
        )
        response = self.client.delete(f'/api/vehicles/{self.vehicle.pk}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Retirez-le du catalogue', response.data['detail'])

    def test_facets_returns_catalogue_values(self):
        response = self.client.get('/api/vehicles/facets/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Toyota', response.data['brands'])
        self.assertIn('Corolla', response.data['models']['Toyota'])
        self.assertEqual(response.data['cities'], ['Douala'])
        self.assertEqual(response.data['max_rate'], self.vehicle.daily_rate)

    def test_available_filter_excludes_overlapping_booking(self):
        start = date.today() + timedelta(days=20)
        Booking.objects.create(
            client=self.client_user, vehicle=self.vehicle, status='confirmed',
            start_date=start, end_date=start + timedelta(days=2),
            daily_rate=25000, days=2, subtotal=0, commission_amount=0, owner_amount=0,
        )
        response = self.client.get(
            f'/api/vehicles/?available=1&start={start}&end={start + timedelta(days=1)}')
        self.assertEqual(response.status_code, 200)
        plates = {item['plate'] for item in response.data.get('results', response.data)}
        self.assertNotIn(self.vehicle.plate, plates)

    def test_favorites_are_unique_and_listed(self):
        self.client.force_authenticate(self.client_user)
        first = self.client.post('/api/vehicles/favorites/', {'vehicle': self.vehicle.pk}, format='json')
        second = self.client.post('/api/vehicles/favorites/', {'vehicle': self.vehicle.pk}, format='json')
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)
        self.assertEqual(Favorite.objects.filter(user=self.client_user, vehicle=self.vehicle).count(), 1)
        listing = self.client.get('/api/vehicles/favorites/')
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data[0]['id'], self.vehicle.pk)
