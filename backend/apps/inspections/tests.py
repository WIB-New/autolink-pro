from datetime import date, timedelta
from decimal import Decimal
from rest_framework.test import APITestCase
from apps.bookings.models import Booking
from apps.users.models import User
from apps.vehicles.tests import make_vehicle


class InspectionWorkflowTests(APITestCase):
    def setUp(self):
        self.controller = User.objects.create_user(
            username='inspection-controller', email='controller@test.cm',
            password='x', role='CONTROLLER')
        self.owner = User.objects.create_user(
            username='inspection-owner', email='owner@test.cm', password='x', role='OWNER')
        self.client_user = User.objects.create_user(
            username='inspection-client', email='client@test.cm', password='x', role='CLIENT')
        self.vehicle = make_vehicle(self.owner, plate='IN-001-AA')
        self.booking = Booking.objects.create(
            client=self.client_user, vehicle=self.vehicle,
            start_date=date.today(), end_date=date.today() + timedelta(days=2),
            daily_rate=Decimal('20000'), days=2, subtotal=Decimal('40000'),
            commission_amount=Decimal('20000'), owner_amount=Decimal('20000'),
        )
        self.client.force_authenticate(self.controller)

    def test_create_inspection_updates_vehicle_condition_and_last_inspection(self):
        response = self.client.post('/api/inspections/', {
            'booking': self.booking.pk,
            'vehicle': self.vehicle.pk,
            'inspection_type': 'entry',
            'mileage_at_inspection': 71234,
            'fuel_level': 65,
            'condition_score': 88,
            'checklist': {'carrosserie': 'ok'},
            'issues': [],
            'notes': 'RAS',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.condition_score, 88)
        self.assertEqual(self.vehicle.last_inspection_score, 88)
        self.assertIsNotNone(self.vehicle.last_inspection_at)
        self.assertEqual(self.vehicle.mileage, 71234)
        self.assertEqual(self.vehicle.fuel_level, 65)

    def _png(self):
        from io import BytesIO
        from PIL import Image
        buf = BytesIO()
        Image.new('RGB', (10, 10), (200, 30, 30)).save(buf, format='PNG')
        buf.seek(0)
        buf.name = 'avant.png'
        return buf

    def test_create_multipart_with_photos_and_notes(self):
        """Flux réel du formulaire : FormData + uploaded_photos + notes."""
        response = self.client.post('/api/inspections/', {
            'booking': str(self.booking.pk),
            'vehicle': str(self.vehicle.pk),
            'inspection_type': 'exit',
            'mileage_at_inspection': '71500',
            'fuel_level': '40',
            'condition_score': '72',
            'checklist': '{"carrosserie": "nok"}',
            'issues': '[{"text": "Rayure portière", "severity": "minor"}]',
            'notes': 'Dommage léger constaté au retour',
            'uploaded_photos': [self._png(), self._png()],
        }, format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        from apps.inspections.models import VehicleInspection
        ins = VehicleInspection.objects.get(pk=response.data['id'])
        self.assertEqual(ins.notes, 'Dommage léger constaté au retour')
        self.assertEqual(ins.checklist, {'carrosserie': 'nok'})
        self.assertEqual(ins.issues, [{'text': 'Rayure portière', 'severity': 'minor'}])
        self.assertEqual(ins.photos.count(), 2)
        self.assertEqual(ins.controller, self.controller)

    def test_update_inspection_resyncs_vehicle_and_appends_photos(self):
        """Réédition d'une fiche : nouveau score/km propagés au véhicule,
        nouvelles photos ajoutées sans supprimer les anciennes."""
        r = self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90,
            'checklist': {}, 'issues': [],
        }, format='json')
        ins_id = r.data['id']
        r = self.client.patch(f'/api/inspections/{ins_id}/', {
            'mileage_at_inspection': '72000',
            'condition_score': '55',
            'notes': 'Score revu après contre-expertise',
            'uploaded_photos': [self._png()],
        }, format='multipart')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['condition_score'], 55)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.condition_score, 55)
        self.assertEqual(self.vehicle.mileage, 72000)
        from apps.inspections.models import VehicleInspection
        ins = VehicleInspection.objects.get(pk=ins_id)
        self.assertEqual(ins.notes, 'Score revu après contre-expertise')
        self.assertEqual(ins.photos.count(), 1)

    def test_delete_photo(self):
        r = self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90, 'checklist': '{}', 'issues': '[]',
            'uploaded_photos': [self._png(), self._png()],
        }, format='multipart')
        ins_id = r.data['id']
        photo_id = r.data['photos'][0]['id']
        r = self.client.delete(f'/api/inspections/{ins_id}/photos/{photo_id}/')
        self.assertEqual(r.status_code, 204)
        from apps.inspections.models import VehicleInspection
        self.assertEqual(VehicleInspection.objects.get(pk=ins_id).photos.count(), 1)

    def test_photo_caption_uses_filename_slot(self):
        """La légende reprend le nom du fichier (emplacement : Avant, KM...)."""
        img = self._png()
        img.name = 'Avant.jpg'
        r = self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90, 'checklist': '{}', 'issues': '[]',
            'uploaded_photos': [img],
        }, format='multipart')
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['photos'][0]['caption'], 'Avant')

    def test_queue_lists_pending_and_excludes_inspected(self):
        self.booking.status = 'confirmed'
        self.booking.save(update_fields=['status'])
        r = self.client.get('/api/inspections/queue/?type=entry')
        self.assertEqual(r.status_code, 200)
        ids = [row['id'] for row in r.data['results']]
        self.assertIn(self.booking.pk, ids)
        # Après création de la fiche d'entrée, la résa sort de la file
        self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90, 'checklist': {}, 'issues': [],
        }, format='json')
        r = self.client.get('/api/inspections/queue/?type=entry')
        ids = [row['id'] for row in r.data['results']]
        self.assertNotIn(self.booking.pk, ids)

    def test_create_forbidden_for_client(self):
        self.client.force_authenticate(self.client_user)
        r = self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90, 'checklist': {}, 'issues': [],
        }, format='json')
        self.assertEqual(r.status_code, 403)

    def test_list_scoped_owner_and_client(self):
        self.client.post('/api/inspections/', {
            'booking': self.booking.pk, 'vehicle': self.vehicle.pk,
            'inspection_type': 'entry', 'mileage_at_inspection': 71000,
            'fuel_level': 60, 'condition_score': 90, 'checklist': {}, 'issues': [],
        }, format='json')
        self.client.force_authenticate(self.owner)
        self.assertEqual(len(self.client.get('/api/inspections/').data['results']), 1)
        self.client.force_authenticate(self.client_user)
        self.assertEqual(len(self.client.get('/api/inspections/').data['results']), 1)
        stranger = User.objects.create_user(
            username='inspection-stranger', email='stranger@test.cm', password='x', role='CLIENT')
        self.client.force_authenticate(stranger)
        self.assertEqual(len(self.client.get('/api/inspections/').data['results']), 0)
