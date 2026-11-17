import json
import os
import secrets

from decouple import config
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.vehicles.models import Vehicle


# Identifiants du super admin — configurables via les variables
# d'environnement Dokploy (ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD).
ADMIN_USERNAME = config('ADMIN_USERNAME', default='admin')
ADMIN_EMAIL = config('ADMIN_EMAIL', default='admin@autolink.com')
ADMIN_PASSWORD = config('ADMIN_PASSWORD', default='')

# Propriétaire de la flotte plateforme — les véhicules seedés et tous ceux
# encore rattachés à un compte ADMIN lui sont réassignés pour que la flotte
# soit gérable depuis l'espace propriétaire. Identifiants configurables via
# OWNER_USERNAME / OWNER_EMAIL / OWNER_PASSWORD dans Dokploy.
OWNER_USERNAME = config('OWNER_USERNAME', default='proprietaire')
OWNER_EMAIL = config('OWNER_EMAIL', default='proprietaire@autolink.cm')
OWNER_PASSWORD = config('OWNER_PASSWORD', default='')

# Anciens comptes démo — supprimés au démarrage : en production, chaque
# utilisateur doit être une personne réelle enregistrée via le site/l'app.
DEMO_IDENTITIES = [
    'client', 'driver', 'driver2', 'driver3', 'owner', 'controller',
    'client@autolink.com', 'driver@autolink.com', 'driver2@autolink.com',
    'driver3@autolink.com', 'owner@autolink.com', 'controller@autolink.com',
]

# 60+ véhicules réels parmi les plus utilisés au Cameroun
# La catégorie (tier) est ATTRIBUÉE AUTOMATIQUEMENT par le barème objectif :
# marque/modèle + année + kilométrage + état + valeur marchande.
# `tier` passé ici = catégorie attendue (vérification) ; le modèle recalcule.
_PLATE_CITY = {'LT': 'Douala', 'CE': 'Yaoundé', 'SW': 'Buea', 'NW': 'Bamenda',
               'OU': 'Bafoussam', 'AD': 'Garoua', 'EN': 'Maroua', 'SU': 'Kribi'}

def _v(brand, model, year, plate, category, fuel, seats, color, rate, tier,
       insurance='standard', score=90, status='approved', mv=None, km=None):
    # Valeur marchande estimée ≈ 500 jours de location ; km ≈ 15 000/an
    mv = mv if mv is not None else rate * 500
    km = km if km is not None else max(0, 2025 - year) * 15000
    city = _PLATE_CITY.get(plate.split('-')[0], 'Douala')
    return dict(brand=brand, model=model, year=year, plate=plate, category=category, fuel=fuel,
                seats=seats, color=color, daily_rate=rate, tier=tier, insurance_type=insurance,
                status=status, condition_score=score, mode='platform',
                market_value=mv, city=city, mileage=km)

DEMO_VEHICLES = [
    # ── BASIC — citadines & berlines économiques (< 25 000 F/jour) ──
    _v('Toyota', 'Yaris', 2019, 'LT-0001-B', 'Citadine', 'essence', 5, 'Blanc', 18000, 'basic', score=88),
    _v('Toyota', 'Corolla', 2016, 'LT-0002-B', 'Berline', 'essence', 5, 'Gris', 20000, 'basic', score=85),
    _v('Toyota', 'Camry', 2015, 'CE-0003-B', 'Berline', 'essence', 5, 'Noir', 22000, 'basic', score=82),
    _v('Toyota', 'Avensis', 2014, 'LT-0004-B', 'Berline', 'diesel', 5, 'Argent', 20000, 'basic', score=80),
    _v('Toyota', 'Starlet', 2021, 'LT-0005-B', 'Citadine', 'essence', 5, 'Rouge', 19000, 'basic', score=92),
    _v('Honda', 'Civic', 2017, 'LT-0006-B', 'Berline', 'essence', 5, 'Bleu', 21000, 'basic', score=84),
    _v('Honda', 'Accord', 2015, 'CE-0007-B', 'Berline', 'essence', 5, 'Noir', 23000, 'basic', score=81),
    _v('Hyundai', 'Accent', 2019, 'LT-0008-B', 'Citadine', 'essence', 5, 'Blanc', 17000, 'basic', score=87),
    _v('Hyundai', 'Elantra', 2018, 'LT-0009-B', 'Berline', 'essence', 5, 'Gris', 20000, 'basic', score=85),
    _v('Kia', 'Rio', 2019, 'LT-0010-B', 'Citadine', 'essence', 5, 'Blanc', 17000, 'basic', score=88),
    _v('Kia', 'Picanto', 2021, 'LT-0011-B', 'Citadine', 'essence', 5, 'Jaune', 15000, 'basic', score=93),
    _v('Kia', 'Cerato', 2017, 'CE-0012-B', 'Berline', 'essence', 5, 'Gris', 19000, 'basic', score=83),
    _v('Nissan', 'Almera', 2018, 'LT-0013-B', 'Berline', 'essence', 5, 'Argent', 18000, 'basic', score=84),
    _v('Nissan', 'Micra', 2019, 'LT-0014-B', 'Citadine', 'essence', 5, 'Rouge', 15000, 'basic', score=86),
    _v('Suzuki', 'Swift', 2020, 'LT-0015-B', 'Citadine', 'essence', 5, 'Bleu', 17000, 'basic', score=90),
    _v('Peugeot', '301', 2018, 'LT-0016-B', 'Berline', 'diesel', 5, 'Blanc', 19000, 'basic', score=85),
    _v('Peugeot', '208', 2020, 'LT-0017-B', 'Citadine', 'essence', 5, 'Gris', 20000, 'basic', score=89),
    _v('Renault', 'Logan', 2017, 'LT-0018-B', 'Berline', 'diesel', 5, 'Blanc', 16000, 'basic', score=82),
    _v('Renault', 'Clio', 2019, 'LT-0019-B', 'Citadine', 'essence', 5, 'Rouge', 17000, 'basic', score=86),
    _v('Volkswagen', 'Golf 7', 2017, 'LT-0020-B', 'Citadine', 'essence', 5, 'Noir', 22000, 'basic', score=84),
    _v('Volkswagen', 'Polo', 2019, 'LT-0021-B', 'Citadine', 'essence', 5, 'Blanc', 19000, 'basic', score=88),
    _v('Mazda', '3', 2018, 'LT-0022-B', 'Berline', 'essence', 5, 'Rouge', 21000, 'basic', score=85),
    _v('Ford', 'Fiesta', 2018, 'LT-0023-B', 'Citadine', 'essence', 5, 'Bleu', 17000, 'basic', score=83),
    _v('Dacia', 'Logan', 2019, 'LT-0024-B', 'Berline', 'diesel', 5, 'Blanc', 16000, 'basic', score=87),

    # ── STANDARD — SUV compacts & pickups (25 000 – 55 000 F/jour) ──
    _v('Toyota', 'Corolla', 2022, 'LT-0025-S', 'Berline', 'essence', 5, 'Blanc', 25000, 'standard', score=94),
    _v('Toyota', 'RAV4', 2021, 'LT-0026-S', 'SUV', 'hybrid', 5, 'Gris', 42000, 'standard', 'premium', score=93),
    _v('Toyota', 'Camry', 2021, 'CE-0027-S', 'Berline', 'hybrid', 5, 'Noir', 35000, 'standard', 'premium', score=92),
    _v('Toyota', 'Hilux', 2020, 'LT-0028-S', 'Pickup', 'diesel', 5, 'Blanc', 50000, 'standard', 'premium', score=90),
    _v('Toyota', 'Fortuner', 2019, 'LT-0029-S', 'SUV', 'diesel', 7, 'Argent', 52000, 'standard', 'premium', score=88),
    _v('Toyota', 'Hiace', 2020, 'LT-0030-S', 'Minibus', 'diesel', 14, 'Blanc', 55000, 'standard', score=85),
    _v('Hyundai', 'Tucson', 2023, 'LT-0031-S', 'SUV', 'diesel', 5, 'Gris', 45000, 'standard', 'premium', score=97),
    _v('Hyundai', 'Santa Fe', 2021, 'LT-0032-S', 'SUV', 'diesel', 7, 'Noir', 50000, 'standard', 'premium', score=91),
    _v('Hyundai', 'H-1', 2019, 'LT-0033-S', 'Van', 'diesel', 9, 'Blanc', 45000, 'standard', score=84),
    _v('Kia', 'Sportage', 2023, 'LT-0034-S', 'SUV', 'hybrid', 5, 'Bleu', 38000, 'standard', 'premium', score=95),
    _v('Kia', 'Sorento', 2021, 'LT-0035-S', 'SUV', 'diesel', 7, 'Gris', 48000, 'standard', 'premium', score=90),
    _v('Nissan', 'Qashqai', 2021, 'LT-0036-S', 'SUV', 'essence', 5, 'Rouge', 35000, 'standard', score=89),
    _v('Nissan', 'X-Trail', 2020, 'LT-0037-S', 'SUV', 'diesel', 7, 'Gris', 42000, 'standard', score=86),
    _v('Nissan', 'Navara', 2021, 'LT-0038-S', 'Pickup', 'diesel', 5, 'Blanc', 48000, 'standard', score=88),
    _v('Honda', 'CR-V', 2021, 'LT-0039-S', 'SUV', 'essence', 5, 'Blanc', 40000, 'standard', 'premium', score=91),
    _v('Mazda', 'CX-5', 2022, 'LT-0040-S', 'SUV', 'essence', 5, 'Rouge', 43000, 'standard', 'premium', score=92),
    _v('Mitsubishi', 'Outlander', 2020, 'LT-0041-S', 'SUV', 'essence', 7, 'Gris', 38000, 'standard', score=85),
    _v('Mitsubishi', 'L200', 2021, 'LT-0042-S', 'Pickup', 'diesel', 5, 'Blanc', 46000, 'standard', score=87),
    _v('Mitsubishi', 'Pajero', 2018, 'CE-0043-S', 'SUV', 'diesel', 7, 'Argent', 50000, 'standard', 'premium', score=90, mv=30000000),
    _v('Suzuki', 'Vitara', 2021, 'LT-0044-S', 'SUV', 'essence', 5, 'Vert', 32000, 'standard', score=89),
    _v('Peugeot', '3008', 2021, 'LT-0045-S', 'SUV', 'diesel', 5, 'Gris', 45000, 'standard', 'premium', score=90),
    _v('Peugeot', '508', 2020, 'LT-0046-S', 'Berline', 'diesel', 5, 'Noir', 38000, 'standard', score=87),
    _v('Volkswagen', 'Tiguan', 2021, 'LT-0047-S', 'SUV', 'diesel', 5, 'Blanc', 44000, 'standard', 'premium', score=90),
    _v('Isuzu', 'D-Max', 2022, 'LT-0048-S', 'Pickup', 'diesel', 5, 'Blanc', 47000, 'standard', score=91),
    _v('Ford', 'Ranger', 2021, 'LT-0049-S', 'Pickup', 'diesel', 5, 'Gris', 49000, 'standard', score=89),
    _v('Ford', 'Everest', 2020, 'LT-0050-S', 'SUV', 'diesel', 7, 'Argent', 53000, 'standard', 'premium', score=87),
    _v('Mercedes', 'Sprinter', 2021, 'LT-0051-S', 'Van', 'diesel', 9, 'Blanc', 55000, 'standard', 'premium', score=92),
    _v('Dacia', 'Duster', 2021, 'LT-0052-S', 'SUV', 'diesel', 5, 'Orange', 28000, 'standard', score=88),

    # ── PREMIUM — SUV haut de gamme & berlines premium (55 000 – 90 000 F/jour) ──
    _v('Toyota', 'Land Cruiser Prado', 2022, 'LT-0053-P', 'SUV', 'diesel', 7, 'Blanc', 75000, 'premium', 'all_risk', score=96),
    _v('Toyota', 'Land Cruiser', 2020, 'CE-0054-P', 'SUV', 'diesel', 7, 'Noir', 85000, 'premium', 'all_risk', score=93),
    _v('Toyota', 'Highlander', 2022, 'LT-0055-P', 'SUV', 'hybrid', 7, 'Gris', 68000, 'premium', 'all_risk', score=94),
    _v('Toyota', 'Sienna', 2022, 'LT-0056-P', 'Van', 'hybrid', 8, 'Argent', 65000, 'premium', 'premium', score=95),
    _v('Mercedes', 'Classe C 300', 2022, 'LT-0057-P', 'Berline', 'essence', 5, 'Noir', 70000, 'premium', 'all_risk', score=95),
    _v('Mercedes', 'Classe E 350', 2021, 'LT-0058-P', 'Berline', 'diesel', 5, 'Argent', 78000, 'premium', 'all_risk', score=93),
    _v('Mercedes', 'GLC 300', 2022, 'LT-0059-P', 'SUV', 'essence', 5, 'Blanc', 80000, 'premium', 'all_risk', score=96),
    _v('BMW', 'Serie 5', 2022, 'CE-0060-P', 'Berline', 'essence', 5, 'Noir', 80000, 'premium', 'all_risk', score=99, status='rented'),
    _v('BMW', 'X3', 2021, 'LT-0061-P', 'SUV', 'diesel', 5, 'Blanc', 72000, 'premium', 'all_risk', score=92),
    _v('BMW', 'X5', 2022, 'LT-0062-P', 'SUV', 'diesel', 7, 'Noir', 88000, 'premium', 'all_risk', score=95),
    _v('Audi', 'Q5', 2022, 'LT-0063-P', 'SUV', 'diesel', 5, 'Gris', 75000, 'premium', 'all_risk', score=94),
    _v('Audi', 'A6', 2021, 'LT-0064-P', 'Berline', 'diesel', 5, 'Noir', 70000, 'premium', 'all_risk', score=91),
    _v('Lexus', 'RX 350', 2021, 'LT-0065-P', 'SUV', 'hybrid', 5, 'Blanc', 78000, 'premium', 'all_risk', score=94),
    _v('Lexus', 'GX 460', 2020, 'LT-0066-P', 'SUV', 'essence', 7, 'Noir', 82000, 'premium', 'all_risk', score=90),
    _v('Nissan', 'Patrol', 2020, 'CE-0067-P', 'SUV', 'essence', 7, 'Noir', 85000, 'premium', 'all_risk', score=89),
    _v('Volkswagen', 'Touareg', 2021, 'LT-0068-P', 'SUV', 'diesel', 5, 'Gris', 76000, 'premium', 'all_risk', score=92),

    # ── GOLD — luxe & prestige (> 90 000 F/jour) ──
    _v('Mercedes', 'GLE 350', 2023, 'CE-0069-G', 'SUV', 'diesel', 7, 'Blanc', 95000, 'gold', 'all_risk', score=97, mv=65000000),
    _v('Mercedes', 'GLS 450', 2022, 'LT-0070-G', 'SUV', 'essence', 7, 'Noir', 120000, 'gold', 'all_risk', score=95, mv=85000000),
    _v('Mercedes', 'Classe S 500', 2023, 'LT-0071-G', 'Berline', 'hybrid', 5, 'Noir', 150000, 'gold', 'all_risk', score=98, mv=120000000),
    _v('Mercedes', 'Classe G 63', 2022, 'LT-0072-G', 'SUV', 'essence', 5, 'Vert', 200000, 'gold', 'all_risk', score=96, mv=160000000),
    _v('BMW', 'X7', 2023, 'LT-0073-G', 'SUV', 'essence', 7, 'Noir', 130000, 'gold', 'all_risk', score=96, mv=85000000),
    _v('BMW', 'Serie 7', 2022, 'LT-0074-G', 'Berline', 'hybrid', 5, 'Gris', 125000, 'gold', 'all_risk', score=94, mv=95000000),
    _v('Lexus', 'LX 570', 2021, 'CE-0075-G', 'SUV', 'essence', 7, 'Blanc', 110000, 'gold', 'all_risk', score=93, mv=110000000),
    _v('Range Rover', 'Evoque', 2022, 'LT-0076-G', 'SUV', 'essence', 5, 'Vert', 110000, 'gold', 'all_risk', score=98, mv=55000000),
    _v('Range Rover', 'Sport', 2023, 'LT-0077-G', 'SUV', 'diesel', 5, 'Noir', 140000, 'gold', 'all_risk', score=97, mv=120000000),
    _v('Range Rover', 'Velar', 2022, 'LT-0078-G', 'SUV', 'essence', 5, 'Gris', 105000, 'gold', 'all_risk', score=95, mv=75000000),
    _v('Toyota', 'Land Cruiser V8 VXR', 2023, 'LT-0079-G', 'SUV', 'diesel', 7, 'Blanc', 100000, 'gold', 'all_risk', score=98, mv=90000000),
    _v('Porsche', 'Cayenne', 2022, 'LT-0080-G', 'SUV', 'essence', 5, 'Noir', 160000, 'gold', 'all_risk', score=97, mv=75000000),
    _v('Audi', 'Q7', 2022, 'LT-0081-G', 'SUV', 'diesel', 7, 'Noir', 98000, 'gold', 'all_risk', score=94),
    _v('Audi', 'Q8', 2023, 'LT-0082-G', 'SUV', 'essence', 5, 'Gris', 135000, 'gold', 'all_risk', score=96),

    # ── COLLECTION — Super Luxe / modèles d'exception (> 180 000 F/jour) ──
    _v('Bentley', 'Bentayga', 2023, 'LT-0083-C', 'SUV', 'essence', 5, 'Noir', 280000, 'collection', 'all_risk', score=99, mv=180000000),
    _v('Porsche', 'Panamera', 2023, 'LT-0084-C', 'Berline', 'hybrid', 5, 'Gris', 250000, 'collection', 'all_risk', score=98, mv=140000000),
    _v('Maserati', 'Levante', 2022, 'CE-0085-C', 'SUV', 'essence', 5, 'Bleu', 220000, 'collection', 'all_risk', score=96, mv=110000000),
]


class Command(BaseCommand):
    help = 'Seed : super admin (env) + flotte de véhicules plateforme (idempotent)'

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username=ADMIN_USERNAME,
            defaults=dict(
                email=ADMIN_EMAIL, first_name='Admin', last_name='AutoLink',
                role='ADMIN', phone='+237222200001', is_verified=True,
                is_staff=True, is_superuser=True,
            ),
        )
        if created:
            if ADMIN_PASSWORD:
                admin.set_password(ADMIN_PASSWORD)
            else:
                generated = secrets.token_urlsafe(16)
                admin.set_password(generated)
                self.stdout.write(self.style.WARNING(
                    f'ADMIN_PASSWORD non défini — mot de passe généré : {generated}\n'
                    'Définissez ADMIN_PASSWORD dans Dokploy puis redéployez.'))
            admin.save()
        else:
            # Répare les droits admin si le compte existait déjà, et applique
            # ADMIN_PASSWORD si la variable est explicitement définie.
            fixed = False
            for attr, val in (('role', 'ADMIN'), ('email', ADMIN_EMAIL),
                              ('is_staff', True), ('is_superuser', True),
                              ('is_verified', True), ('is_active', True)):
                if getattr(admin, attr) != val:
                    setattr(admin, attr, val)
                    fixed = True
            if ADMIN_PASSWORD:
                admin.set_password(ADMIN_PASSWORD)
                fixed = True
            if fixed:
                admin.save()
        # Si un username custom est utilisé, désactive l'ancien 'admin'
        # par défaut pour ne pas laisser un super admin prévisible.
        if ADMIN_USERNAME != 'admin':
            User.objects.filter(username='admin').exclude(pk=admin.pk).update(
                is_active=False, is_staff=False, is_superuser=False)
        self.stdout.write(f'Admin: {admin.username} ready')

        # Compte propriétaire de la flotte plateforme.
        owner, owner_created = User.objects.get_or_create(
            username=OWNER_USERNAME,
            defaults=dict(
                email=OWNER_EMAIL, first_name='Propriétaire', last_name='AutoLink',
                role='OWNER', is_verified=True,
            ),
        )
        if owner.pk == admin.pk:
            # Cas dégénéré : OWNER_USERNAME == ADMIN_USERNAME → pas de compte
            # séparé, la flotte reste au compte admin.
            owner = admin
        else:
            fixed = False
            for attr, val in (('role', 'OWNER'), ('email', OWNER_EMAIL),
                              ('is_verified', True), ('is_active', True)):
                if getattr(owner, attr) != val:
                    setattr(owner, attr, val)
                    fixed = True
            if OWNER_PASSWORD:
                owner.set_password(OWNER_PASSWORD)
                fixed = True
            elif owner_created:
                generated = secrets.token_urlsafe(16)
                owner.set_password(generated)
                self.stdout.write(self.style.WARNING(
                    f'OWNER_PASSWORD non défini — mot de passe généré : {generated}\n'
                    'Définissez OWNER_PASSWORD dans Dokploy puis redéployez.'))
                fixed = True
            if fixed:
                owner.save()
        self.stdout.write(f'Owner: {owner.username} ready')

        # Nettoyage des anciens comptes démo : les véhicules sont réassignés au
        # compte propriétaire AVANT (FK protégée), puis les réservations/
        # paiements/payouts démo liés (PROTECT) sont supprimés, puis les comptes.
        from apps.bookings.models import Booking
        from apps.payments.models import Payment, Payout
        demo_qs = User.objects.filter(
            Q(username__in=DEMO_IDENTITIES) | Q(email__in=DEMO_IDENTITIES)
        ).exclude(pk__in=(admin.pk, owner.pk))
        if demo_qs.exists():
            Vehicle.objects.filter(owner__in=demo_qs).update(owner=owner)
            Booking.objects.filter(Q(client__in=demo_qs) | Q(driver__in=demo_qs)).delete()
            Payment.objects.filter(payer__in=demo_qs).delete()
            Payout.objects.filter(recipient__in=demo_qs).delete()
            count = demo_qs.count()
            demo_qs.delete()
            self.stdout.write(f'Demo cleanup: {count} comptes supprimés')

        # Tous les véhicules rattachés à un compte ADMIN passent au compte
        # propriétaire — ils deviennent éditables depuis l'espace propriétaire.
        reassigned = (Vehicle.objects.filter(owner__role='ADMIN')
                      .exclude(owner__pk=owner.pk).update(owner=owner))
        if reassigned:
            self.stdout.write(f'Vehicles reassignés au propriétaire : {reassigned}')
        # Photos réelles par modèle (vignettes allégées Wikimedia Commons)
        images = {}
        img_path = os.path.join(
            settings.BASE_DIR, 'apps', 'vehicles', 'data', 'vehicle_images.json')
        if os.path.exists(img_path):
            with open(img_path, encoding='utf-8') as f:
                images = json.load(f)

        for v in DEMO_VEHICLES:
            image_url = images.get(f"{v['brand']}|{v['model']}", '')
            obj, created = Vehicle.objects.get_or_create(
                plate=v['plate'],
                defaults={**v, 'owner': owner, 'image_url': image_url,
                          'insurance_expiry': timezone.now().date() + timedelta(days=365)},
            )
            if not created:
                # Flotte existante : resynchronise les champs objectifs puis reclassifie
                for f in ('market_value', 'city', 'mileage', 'daily_rate', 'insurance_type', 'condition_score'):
                    setattr(obj, f, v[f])
                if image_url:
                    obj.image_url = image_url
                # Caution & forfait km : recalculés sur la nouvelle catégorie
                obj.deposit_amount = None
                obj.km_included_per_day = None
                obj.extra_km_rate = None
                obj.save()  # reclassifie + recalcule prix indicatif
        # Véhicules sans image_url (créés hors seed : plaque différente,
        # ajout propriétaire…) — on leur attribue une photo réaliste de leur
        # catégorie pour éviter le placeholder générique côté frontend.
        cat_img = {}
        for v in DEMO_VEHICLES:
            url = images.get(f"{v['brand']}|{v['model']}")
            if url and v['category'] not in cat_img:
                cat_img[v['category']] = url
        generic = next(iter(images.values()), '')
        filled = 0
        for veh in Vehicle.objects.filter(image_url=''):
            url = cat_img.get(veh.category) or generic
            if url:
                veh.image_url = url
                veh.save(update_fields=['image_url'])
                filled += 1
        if filled:
            self.stdout.write(f'image_url remplie sur {filled} véhicule(s)')

        self.stdout.write(f'Vehicles: {Vehicle.objects.count()} ready')
        self.stdout.write(self.style.SUCCESS('Seed termine'))
