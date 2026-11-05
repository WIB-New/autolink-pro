"""
Seed de démo : compte client + véhicules + réservations + portefeuille +
notifications + messagerie — pour tester TOUTES les pages de l'espace client.

Usage : python manage.py shell < seed_client_demo.py
        (ou : ./venv/Scripts/python.exe manage.py shell < seed_client_demo.py)

Compte client :  emmanuel@autolink.cm  /  Client2024!
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from datetime import date, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.vehicles.models import Vehicle, Favorite
from apps.bookings.models import Booking
from apps.payments.models import Payment, WalletTransaction
from apps.messaging.models import Conversation, Message
from apps.users.models import Notification

User = get_user_model()
today = timezone.now().date()
PW = 'Client2024!'

# ============ UTILISATEURS ============
client, _ = User.objects.get_or_create(username='emmanuel', defaults={
    'email': 'emmanuel@autolink.cm', 'role': 'CLIENT', 'first_name': 'Emmanuel',
    'last_name': 'Ndedi', 'phone': '+237 670 42 18 90', 'city': 'Douala',
})
client.email = 'emmanuel@autolink.cm'
client.role = 'CLIENT'
client.first_name = 'Emmanuel'; client.last_name = 'Ndedi'
client.phone = '+237 670 42 18 90'; client.city = 'Douala'
client.is_active = True; client.is_verified = True
client.balance = Decimal('26500')
client.kyc_status = 'approved'; client.id_document_verified = True
client.id_document = 'kyc/emmanuel_cni.pdf'
client.driving_license = 'kyc/emmanuel_permis.pdf'
client.driving_license_expires_at = today + timedelta(days=400)
client.set_password(PW); client.save()

owner, _ = User.objects.get_or_create(username='yves', defaults={
    'email': 'yves@autolink.cm', 'role': 'OWNER', 'first_name': 'ANANGUE',
    'last_name': 'Yves', 'phone': '+237 699 12 34 56', 'city': 'Douala',
})
owner.role = 'OWNER'; owner.is_verified = True; owner.is_active = True
owner.set_password(PW); owner.save()

driver, _ = User.objects.get_or_create(username='jpm', defaults={
    'email': 'jpm@autolink.cm', 'role': 'DRIVER', 'first_name': 'Jean-Pierre',
    'last_name': 'Mbida', 'phone': '+237 680 11 22 33', 'city': 'Douala',
})
driver.role = 'DRIVER'; driver.is_verified = True; driver.is_active = True
driver.set_password(PW); driver.save()

admin, _ = User.objects.get_or_create(username='admin', defaults={
    'email': 'admin@autolink.cm', 'role': 'ADMIN', 'first_name': 'Support',
    'last_name': 'AutoLink', 'is_staff': True, 'is_superuser': True,
})
admin.role = 'ADMIN'; admin.is_staff = True; admin.is_superuser = True
admin.is_active = True; admin.set_password(PW); admin.save()

print('Users OK')

# ============ VÉHICULES ============
IMG = {
    'suv': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=70',
    'berline': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=70',
    'citadine': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=70',
    'luxe': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=70',
}
VEHICLES = [
    dict(brand='Toyota', model='RAV4 AWD Hybrid', year=2022, plate='LT-4921-CM', category='SUV',
         tier='premium', fuel='hybrid', seats=5, city='Douala', daily_rate=55000, deposit_amount=150000,
         driver_available=True, rating=4.95, rating_count=38, image_url=IMG['suv']),
    dict(brand='Toyota', model='Corolla', year=2021, plate='LT-1002-A', category='Berline',
         tier='basic', fuel='essence', seats=5, city='Yaoundé', daily_rate=20000, deposit_amount=40000,
         driver_available=True, rating=4.6, rating_count=88, image_url=IMG['berline']),
    dict(brand='Mercedes', model='Classe S 500', year=2023, plate='LT-7788-S', category='Berline',
         tier='premium', fuel='essence', seats=5, city='Douala', daily_rate=120000, deposit_amount=300000,
         driver_available=True, rating=4.9, rating_count=21, image_url=IMG['luxe']),
    dict(brand='Hyundai', model='Elantra', year=2018, plate='LT-3345-E', category='Berline',
         tier='standard', fuel='essence', seats=5, city='Douala', daily_rate=28000, deposit_amount=60000,
         driver_available=False, rating=4.5, rating_count=44, image_url=IMG['berline']),
    dict(brand='Peugeot', model='208', year=2020, plate='LT-5566-P', category='Citadine',
         tier='basic', fuel='diesel', seats=5, city='Douala', daily_rate=20000, deposit_amount=40000,
         driver_available=False, rating=4.5, rating_count=52, image_url=IMG['citadine']),
    dict(brand='Toyota', model='Land Cruiser Prado', year=2022, plate='LT-9000-L', category='SUV',
         tier='premium', fuel='diesel', seats=7, city='Yaoundé', daily_rate=95000, deposit_amount=250000,
         driver_available=True, rating=4.8, rating_count=29, image_url=IMG['suv']),
    dict(brand='Dacia', model='Duster', year=2021, plate='LT-2211-D', category='SUV',
         tier='standard', fuel='essence', seats=5, city='Douala', daily_rate=32000, deposit_amount=80000,
         driver_available=False, rating=4.4, rating_count=33, image_url=IMG['suv']),
    dict(brand='Kia', model='Sorento', year=2022, plate='LT-8899-K', category='SUV',
         tier='standard', fuel='diesel', seats=7, city='Yaoundé', daily_rate=48000, deposit_amount=120000,
         driver_available=True, rating=4.7, rating_count=19, image_url=IMG['suv']),
    dict(brand='Toyota', model='Avensis', year=2014, plate='LT-4455-V', category='Berline',
         tier='basic', fuel='essence', seats=5, city='Yaoundé', daily_rate=18000, deposit_amount=35000,
         driver_available=False, rating=4.3, rating_count=61, image_url=IMG['berline']),
    dict(brand='BMW', model='X7', year=2023, plate='LT-7070-X', category='SUV',
         tier='premium', fuel='diesel', seats=7, city='Douala', daily_rate=150000, deposit_amount=400000,
         driver_available=True, rating=4.95, rating_count=12, image_url=IMG['luxe']),
]
vehicles = {}
for spec in VEHICLES:
    plate = spec.pop('plate')
    spec.setdefault('color', 'Gris')
    spec.setdefault('description', f"{spec['brand']} {spec['model']} vérifié AutoLink.")
    spec.setdefault('market_value', Decimal('25000000'))
    spec.setdefault('insurance_type', 'premium')
    spec.setdefault('insurance_expiry', today + timedelta(days=300))
    spec.setdefault('technical_control_date', today + timedelta(days=200))
    spec.setdefault('mode', 'platform')
    spec.setdefault('computed_rate', spec['daily_rate'])
    spec.setdefault('km_included_per_day', 250)
    spec.setdefault('extra_km_rate', 150)
    v, _ = Vehicle.objects.update_or_create(
        plate=plate, defaults={**spec, 'owner': owner, 'status': 'approved'})
    vehicles[v.brand + ' ' + v.model] = v
print('Vehicles OK:', len(vehicles))

# ============ FAVORIS ============
for v in list(vehicles.values())[:4]:
    Favorite.objects.get_or_create(user=client, vehicle=v)
print('Favorites OK')

# ============ RÉSERVATIONS (6 mois pour les graphiques) ============
def mk_booking(v, start, days, status, driver_type='none', rating=None, review='',
               pickup='Douala - Hub Central Akwa', dropoff='', client_=None):
    days = max(1, days)
    b, _ = Booking.objects.get_or_create(
        client=client_ or client, vehicle=v, start_date=start, end_date=start + timedelta(days=days),
        defaults=dict(status=status, driver_type=driver_type,
                      pickup_address=pickup, dropoff_address=dropoff or pickup,
                      daily_rate=Decimal(str(v.daily_rate)), days=days,
                      subtotal=Decimal(str(v.daily_rate)) * days,
                      commission_amount=(Decimal(str(v.daily_rate)) * days) * Decimal('0.5'),
                      owner_amount=(Decimal(str(v.daily_rate)) * days) * Decimal('0.5'),
                      deposit_amount=v.deposit_amount,
                      client_rating=rating, client_review=review))
    return b

rav4 = vehicles['Toyota RAV4 AWD Hybrid']
corolla = vehicles['Toyota Corolla']
elantra = vehicles['Hyundai Elantra']
p208 = vehicles['Peugeot 208']
duster = vehicles['Dacia Duster']
sorento = vehicles['Kia Sorento']

REVIEWS = [
    (5, 'Véhicule impeccable, climatisation au top et prise en charge à l\'heure.'),
    (5, 'Très bonne expérience : voiture propre, suivi SMS rassurant.'),
    (4, 'Bon véhicule, conforme aux photos. Petit retard au retour.'),
]
bs = []
# Terminées — réparties sur 6 mois → alimentent courbe/barres/avis
for i, (v, m_ago, days, dt_, rating, review) in enumerate([
    (corolla, 5, 2, 'none', 5, REVIEWS[0][1]),
    (duster, 4, 3, 'none', 4, REVIEWS[2][1]),
    (elantra, 3, 1, 'internal', 5, REVIEWS[1][1]),
    (rav4, 2, 4, 'internal', 5, 'Excellent SUV, chauffeur très professionnel.'),
    (p208, 1, 2, 'none', 4, 'Citadine parfaite pour la ville.'),
    (sorento, 0, 3, 'owner', 5, 'Très spacieux pour un voyage famille.'),
]):
    start = today - timedelta(days=30 * m_ago + 12)
    bs.append(mk_booking(v, start, days, 'completed', dt_, rating, review))

# À venir + en cours + annulée + litige
b_up = mk_booking(rav4, today + timedelta(days=5), 1, 'confirmed', 'internal',
                  pickup="Aéroport International de Douala (DLA)")
b_up.driver = driver; b_up.save(update_fields=['driver'])
bs.append(b_up)
bs.append(mk_booking(duster, today - timedelta(days=1), 4, 'active'))
# Terminée récente SANS avis → pour tester le bloc "Avis & Évaluation"
bs.append(mk_booking(p208, today - timedelta(days=3), 1, 'completed', 'none', rating=None, review=''))
bs.append(mk_booking(p208, today + timedelta(days=10), 2, 'pending'))
bs.append(mk_booking(elantra, today - timedelta(days=45), 2, 'cancelled'))
bs.append(mk_booking(corolla, today - timedelta(days=60), 3, 'disputed'))
# À venir garanties — dates futures pour tester modifier/annuler
bs.append(mk_booking(sorento, today + timedelta(days=7), 3, 'confirmed'))
bs.append(mk_booking(elantra, today + timedelta(days=14), 2, 'pending'))
bs.append(mk_booking(duster, today + timedelta(days=21), 4, 'pending', 'internal'))
print('Bookings OK:', len(bs))

# ============ PAIEMENTS (séquestre/caution) ============
for b in bs:
    if b.status in ('confirmed', 'active', 'completed'):
        Payment.objects.get_or_create(
            booking=b, defaults=dict(payer=client, method='wallet',
                status='succeeded', amount=b.subtotal,
                commission=b.commission_amount, owner_payout=b.owner_amount,
                paid_at=timezone.now(),
                escrow_status='held' if b.status != 'completed' else 'released',
                deposit_amount=b.deposit_amount,
                deposit_status='held' if b.status != 'completed' else 'released'))
print('Payments OK')

# ============ TRANSACTIONS PORTEFEUILLE ============
def tx(kind, amount, bal, note, method='wallet', ref='', months_ago=0, status='completed'):
    return WalletTransaction.objects.get_or_create(
        user=client, kind=kind, amount=Decimal(amount), reference=ref,
        defaults=dict(balance_after=Decimal(bal), note=note, method=method,
                      status=status))[0]

bal = Decimal('0')
for m_ago, amount in [(6, 120000), (5, 80000), (4, 60000), (3, 110000), (2, 45000), (1, 50000), (0, 30000)]:
    bal += Decimal(amount)
    t = tx('topup', amount, bal, 'Recharge portefeuille', 'mtn', f'TOP-{6 - m_ago:03d}', m_ago)
    t.created_at = timezone.now() - timedelta(days=30 * m_ago + 8)
    t.save(update_fields=['created_at'])
# débits liés aux réservations terminées
for b in bs:
    if b.status in ('completed', 'confirmed', 'active'):
        bal -= b.subtotal
        t = tx('debit', b.subtotal, bal, f'Location {b.vehicle}', 'wallet', f'BK-{b.id:04d}')
        t.created_at = b.created_at + timedelta(minutes=2)
        t.save(update_fields=['created_at'])
# remboursement de l'annulée + restitution caution terminée
bal += Decimal('56000')
t = tx('refund', 56000, bal, 'Remboursement réservation annulée', 'wallet', 'REFUND-001')
t.created_at = timezone.now() - timedelta(days=40); t.save(update_fields=['created_at'])
client.balance = Decimal('26500'); client.save(update_fields=['balance'])
print('Wallet TX OK')

# ============ NOTIFICATIONS ============
NOTIFS = [
    ('Réservation confirmée', f'Votre location du {rav4} est confirmée pour le {bs[6].start_date:%d/%m/%Y}.', 'booking', '/client/bookings', False),
    ('Paiement reçu', '73 500 FCFA débités de votre portefeuille AutoLink.', 'payment', '/client/wallet', False),
    ('Caution séquestrée', 'La caution de 150 000 FCFA est bloquée le temps de la location.', 'payment', '/client/wallet', True),
    ('Nouveau message', 'Jean-Pierre M. vous a envoyé un message sur votre réservation.', 'message', '/messages', False),
    ('Location en cours', f'Votre {duster} est actuellement en location. Bon trajet !', 'booking', '/client/bookings', True),
    ('Location terminée', f'Merci d\'avoir utilisé le {p208}. Laissez un avis !', 'booking', '/client/bookings', True),
    ('Identité vérifiée', 'Vos documents KYC ont été validés par nos équipes.', 'security', '/client/profile', True),
    ('Recharge réussie', '30 000 FCFA crédités via MTN Mobile Money.', 'payment', '/client/wallet', True),
]
for title, msg, kind, link, read in NOTIFS:
    Notification.objects.get_or_create(user=client, title=title, message=msg,
        defaults=dict(kind=kind, link=link, is_read=read))
print('Notifications OK')

# ============ MESSAGERIE ============
# 1) Conversation réservation (client + owner + driver)
conv1, _ = Conversation.objects.get_or_create(kind='booking', related_booking=bs[6])
conv1.participants.set([client, owner, driver])
msgs1 = [
    (driver, 'Bonjour M. Emmanuel, je serai au terminal des arrivées à 08h15 avec une pancarte à votre nom.', False),
    (client, 'Parfait, mon vol arrive à 08h00. J\'ai 2 valises.', True),
    (driver, 'Bien reçu. Le véhicule sera climatisé et prêt. À demain !', False),
]
for sender, content, read in msgs1:
    Message.objects.get_or_create(conversation=conv1, sender=sender, content=content,
        defaults=dict(is_read=read))

# 2) Conversation support (client + admin)
conv2, _ = Conversation.objects.get_or_create(kind='support')
conv2.participants.set([client, admin])
msgs2 = [
    (client, 'Bonjour, comment se passe la restitution de ma caution après la location ?', True),
    (admin, 'Bonjour ! La caution est restituée automatiquement 15 min après l\'état des lieux de retour, directement sur votre portefeuille AutoLink.', True),
    (client, 'Merci beaucoup pour votre réponse rapide.', True),
]
for sender, content, read in msgs2:
    Message.objects.get_or_create(conversation=conv2, sender=sender, content=content,
        defaults=dict(is_read=read))
# === PARRAINAGE : code + filleuls pour tester la page Parrainage ===
if not client.referral_code:
    client.referral_code = 'ALP-EMMANUEL-A1B2C3'
    client.referral_credits = Decimal('15000')
    client.save(update_fields=['referral_code', 'referral_credits'])
for uname, fname, lname, city_ in [('rachid', 'Rachid', 'Mbappé', 'Douala'), ('sandra', 'Sandra', 'Ngono', 'Yaoundé'), ('fred', 'Fred', 'Essomba', 'Douala')]:
    u, _ = User.objects.get_or_create(username=uname, defaults=dict(
        email=f'{uname}@autolink.cm', first_name=fname, last_name=lname,
        role='CLIENT', phone='+237 6XX XX XX XX', city=city_, is_verified=True))
    u.set_password('Client2024!'); u.referred_by = client; u.save()
# 1 filleul actif (a une réservation terminée)
sandra = User.objects.get(username='sandra')
if not sandra.bookings.filter(status='completed').exists():
    mk_booking(elantra, today - timedelta(days=10), 2, 'completed', 'none', client_=sandra)
print('Referral OK')

print('Messaging OK')

print('\n=== SEED TERMINÉ ===')
print(f'Client : emmanuel@autolink.cm / {PW}')
print(f'Owner  : yves@autolink.cm / {PW}')
print(f'Driver : jpm@autolink.cm / {PW}')
print(f'Admin  : admin@autolink.cm / {PW}')
print('Pages testables : dashboard, réservations, portefeuille, catalogue,')
print('favoris, notifications, messagerie, profil, détail véhicule, tunnel.')
