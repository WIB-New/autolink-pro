from decouple import config
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.drivers.models import DriverApplication, DriverProfile
from apps.vehicles.models import Vehicle


# Chauffeurs approuvés — comptes opérationnels avec candidature validée par
# l'admin (status approved + reviewer) et profil chauffeur certifié.
# Configurables via DRIVER*_USERNAME / *_EMAIL / *_PASSWORD dans
# l'environnement Dokploy ; mots de passe de démonstration sinon.
DRIVERS = [
    dict(
        username=config('DRIVER1_USERNAME', default='chauffeur1'),
        email=config('DRIVER1_EMAIL', default='chauffeur1@autolink.cm'),
        password=config('DRIVER1_PASSWORD', default='Chauffeur2026!'),
        first_name='Jean-Pierre', last_name='Mbida',
        phone='+237690000011', city='Douala',
        experience_years=8, license_type='B', license_number='CM-DLA-2017-00891',
        vehicle_plate='LT-0028-S',   # Toyota Hilux
        is_online=True, rating='4.85', rating_count=17, total_trips=34,
    ),
    dict(
        username=config('DRIVER2_USERNAME', default='chauffeur2'),
        email=config('DRIVER2_EMAIL', default='chauffeur2@autolink.cm'),
        password=config('DRIVER2_PASSWORD', default='Chauffeur2026!'),
        first_name='Alain', last_name='Fotso',
        phone='+237690000012', city='Yaoundé',
        experience_years=6, license_type='B', license_number='CM-YDE-2019-01437',
        vehicle_plate='CE-0054-P',   # Toyota Land Cruiser
        is_online=True, rating='4.70', rating_count=9, total_trips=21,
    ),
    dict(
        username=config('DRIVER3_USERNAME', default='chauffeur3'),
        email=config('DRIVER3_EMAIL', default='chauffeur3@autolink.cm'),
        password=config('DRIVER3_PASSWORD', default='Chauffeur2026!'),
        first_name='Rodrigue', last_name='Essomba',
        phone='+237690000013', city='Douala',
        experience_years=4, license_type='B', license_number='CM-DLA-2021-02266',
        vehicle_plate=None,
        is_online=False, rating='0', rating_count=0, total_trips=0,
    ),
    dict(
        username=config('DRIVER4_USERNAME', default='chauffeur4'),
        email=config('DRIVER4_EMAIL', default='chauffeur4@autolink.cm'),
        password=config('DRIVER4_PASSWORD', default='Chauffeur2026!'),
        first_name='Marlyse', last_name='Ngono',
        phone='+237690000014', city='Yaoundé',
        experience_years=5, license_type='B', license_number='CM-YDE-2020-01158',
        vehicle_plate='LT-0051-S',   # Mercedes Sprinter
        is_online=False, rating='4.90', rating_count=6, total_trips=12,
    ),
]


class Command(BaseCommand):
    help = 'Seed : chauffeurs approuvés (candidature + compte + profil) — idempotent'

    def handle(self, *args, **options):
        admin = User.objects.filter(role='ADMIN').order_by('id').first()
        now = timezone.now()

        for spec in DRIVERS:
            user, created = User.objects.get_or_create(
                username=spec['username'],
                defaults=dict(
                    email=spec['email'], first_name=spec['first_name'],
                    last_name=spec['last_name'], role='DRIVER',
                    phone=spec['phone'], city=spec['city'], is_verified=True,
                ),
            )
            fixed = False
            for attr, val in (('role', 'DRIVER'), ('email', spec['email']),
                              ('first_name', spec['first_name']),
                              ('last_name', spec['last_name']),
                              ('is_verified', True), ('is_active', True)):
                if getattr(user, attr) != val:
                    setattr(user, attr, val)
                    fixed = True
            if created or fixed:
                user.set_password(spec['password'])
                user.save()

            # Candidature validée par l'admin — visible dans Admin → Recrutement
            app, app_created = DriverApplication.objects.get_or_create(
                applicant=user,
                defaults=dict(
                    status=DriverApplication.Status.APPROVED,
                    full_name=user.get_full_name(), email=user.email,
                    phone=user.phone, city=spec['city'],
                    experience_years=spec['experience_years'],
                    license_type=spec['license_type'],
                    license_number=spec['license_number'],
                    license_obtained_at=(now - timedelta(days=365 * spec['experience_years'])).date(),
                    license_expiry=(now + timedelta(days=365 * 2)).date(),
                    has_valid_license=True, has_clean_criminal_record=True,
                    has_medical_certificate=True, has_insurance=True,
                    driving_test_passed=True, driving_test_score=90,
                    training_completed=True,
                    availability=DriverApplication.Availability.FULL,
                    professional_status='Chauffeur professionnel',
                    reviewer=admin, reviewed_at=now - timedelta(days=7),
                    reviewer_notes='Dossier complet — approuvé après test de conduite.',
                ),
            )
            if not app_created and app.status != DriverApplication.Status.APPROVED:
                app.status = DriverApplication.Status.APPROVED
                app.reviewer = admin
                app.reviewed_at = app.reviewed_at or now
                app.save(update_fields=['status', 'reviewer', 'reviewed_at'])

            # Profil chauffeur certifié (+ véhicule assigné si spécifié)
            profile, _ = DriverProfile.objects.get_or_create(driver=user)
            profile.rating = spec['rating']
            profile.rating_count = spec['rating_count']
            profile.total_trips = spec['total_trips']
            profile.is_online = spec['is_online']
            if spec['vehicle_plate']:
                profile.assigned_vehicle = Vehicle.objects.filter(
                    plate=spec['vehicle_plate']).first()
            profile.save()

            self.stdout.write(
                f"Driver: {user.username} ({user.get_full_name()}) "
                f"{'créé' if created else 'vérifié'} — approuvé")
