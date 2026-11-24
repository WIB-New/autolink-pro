import io
import json
import os
import sys
import uuid
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.conf import settings
from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from apps.users.models import User
from apps.vehicles.models import Vehicle
from apps.bookings.models import Booking
from apps.affiliates.models import Agent, AgentReferral
from apps.payments.models import WalletTransaction

run = 'CYCLE-' + uuid.uuid4().hex[:7].upper()
results = []
actors = {}
vehicles = []
booking_ids = []

def call(role, method, url, payload=None, expected=(200,), multipart=False):
    c = APIClient()
    if role:
        c.credentials(HTTP_AUTHORIZATION='Bearer ' + str(AccessToken.for_user(actors[role])))
    r = getattr(c, method)(url, payload or {}, format='multipart' if multipart else 'json')
    ok = r.status_code in expected
    entry = {'actor': role or 'anonymous', 'method': method, 'url': url, 'status': r.status_code, 'expected': list(expected), 'ok': ok}
    if not ok:
        entry['response'] = str(getattr(r, 'data', r.content[:300]))[:1500]
    results.append(entry)
    print(json.dumps(entry, ensure_ascii=True), flush=True)
    return r

def image(name):
    b = io.BytesIO()
    Image.new('RGB', (64, 48), '#139a91').save(b, format='PNG')
    return SimpleUploadedFile(name, b.getvalue(), content_type='image/png')

def document(name):
    return SimpleUploadedFile(name, b'%PDF-1.4\n% TEST DOCUMENT - NOT VALID FOR ROAD USE\n%%EOF', content_type='application/pdf')

def check(label, value):
    item = {'check': label, 'ok': bool(value)}
    results.append(item)
    print(json.dumps(item), flush=True)

if len(sys.argv) == 3 and sys.argv[1] == '--verify':
    run = sys.argv[2]
    actors = {u.last_name: u for u in User.objects.filter(username__startswith=run + '-')}
    bs = list(Booking.objects.filter(notes__startswith=run).order_by('id'))
    from apps.messaging.models import Conversation, Message
    from apps.drivers.models import DriverEarning
    from apps.payments.models import Payout
    with override_settings(ALLOWED_HOSTS=['testserver', 'localhost'], EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'), patch.object(Booking, 'auto_complete_expired', return_value=None):
        for b in bs:
            cv = Conversation.objects.get(related_booking=b)
            call('client', 'post', f'/api/messaging/conversations/{cv.pk}/messages/', {'content': run + ' restitution confirmee'}, expected=(201,))
            call('owner', 'get', f'/api/messaging/conversations/{cv.pk}/messages/')
            call('stranger', 'get', f'/api/messaging/conversations/{cv.pk}/messages/', expected=(403, 404))
            check(f'{b.pk}: message persisted', Message.objects.filter(conversation=cv, content__contains=run).exists())
            call('client', 'get', f'/api/bookings/{b.pk}/contract/')
            call('stranger', 'get', f'/api/bookings/{b.pk}/contract/', expected=(403, 404))
            check(f'{b.pk}: six photos persist', b.vehicle.photos.count() == 6)
            check(f'{b.pk}: vehicle returned to catalogue', b.vehicle.status == 'approved')
            check(f'{b.pk}: unique owner payout', Payout.objects.filter(payment=b.payment, recipient=b.vehicle.owner).count() == 1)
            check(f'{b.pk}: deposit returned once', WalletTransaction.objects.filter(user=b.client, reference=f'DEPOSIT-{b.payment.pk:04d}').count() == 1)
            snapshot = list(User.objects.filter(pk__in=[b.client_id, b.vehicle.owner_id] + ([b.driver_id] if b.driver_id else [])).values_list('id', 'balance'))
            call('owner', 'patch', f'/api/bookings/{b.pk}/', {'status': 'completed'}, expected=(403,))
            check(f'{b.pk}: repeat completion no duplicate money', snapshot == list(User.objects.filter(pk__in=[x[0] for x in snapshot]).values_list('id', 'balance')))
        vid = bs[0].vehicle_id
        start = date.today()+timedelta(days=100)
        block = {'vehicle': vid, 'start_date': str(start), 'end_date': str(start+timedelta(days=2)), 'reason': run+' indisponibilite test'}
        call('stranger', 'post', f'/api/vehicles/{vid}/availability/', block, expected=(403,))
        call('owner', 'post', f'/api/vehicles/{vid}/availability/', block, expected=(201,))
        owner = User.objects.get(pk=actors['owner'].pk)
        client = User.objects.get(pk=actors['client'].pk)
        expected_client = Decimal('10000000') - sum((b.subtotal for b in bs), Decimal('0'))
        expected_owner = sum((b.payment.owner_payout for b in bs), Decimal('0'))
        check('client balance reconciles', client.balance == expected_client)
        check('owner balance reconciles', owner.balance == expected_owner)
        for b in bs:
            if b.driver_id:
                earning = DriverEarning.objects.filter(booking=b).first()
                check('driver earning persisted', earning is not None)
                check('driver fee collected covers driver earning', b.driver_fee >= (earning.amount if earning else 0))
                print('DRIVER_FINANCE', json.dumps({'booking': b.pk, 'driver_fee_collected': str(b.driver_fee), 'driver_earning': str(earning.amount) if earning else None, 'days': b.days}))
        print('BALANCES', json.dumps({'client': str(client.balance), 'owner': str(owner.balance), 'commission': str(sum((b.payment.commission for b in bs), Decimal('0')))}))
        print('BOOKINGS', json.dumps([{'id': b.pk, 'vehicle': b.vehicle_id, 'subtotal': str(b.subtotal), 'deposit': str(b.deposit_amount), 'owner_payout': str(b.payment.owner_payout), 'commission': str(b.payment.commission), 'driver_fee': str(b.driver_fee), 'status': b.status, 'payment': b.payment.status, 'escrow': b.payment.escrow_status, 'deposit_status': b.payment.deposit_status} for b in bs]))
    Path(os.environ.get('TEMP', '.'), run+'-verification.json').write_text(json.dumps(results, indent=2, default=str), encoding='utf-8')
    print('FOLLOWUP', len(results), 'checks;', sum(not r['ok'] for r in results), 'failures')
    sys.exit(0)

engine = settings.DATABASES['default']['ENGINE']
host = settings.DATABASES['default'].get('HOST', '')
if host not in ('', 'localhost', '127.0.0.1', '::1'):
    raise RuntimeError('Refusing non-local database')
print('RUN', run, 'DATABASE ENGINE', engine, 'LOCAL', flush=True)

with override_settings(ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'], EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'), patch.object(Booking, 'auto_complete_expired', return_value=None), patch('apps.bookings.views._assign_internal_driver', return_value=None):
    for name, role in [('admin', 'ADMIN'), ('controller', 'CONTROLLER'), ('owner', 'OWNER'), ('other_owner', 'OWNER'), ('driver', 'DRIVER'), ('other_driver', 'DRIVER'), ('client', 'CLIENT'), ('stranger', 'CLIENT')]:
        u = User.objects.create_user(username=f'{run}-{name}', email=f'{run.lower()}-{name}@example.invalid', role=role, first_name=f'TEST {run}', last_name=name, is_verified=True, kyc_status='approved', balance=Decimal('0'))
        u.set_unusable_password()
        u.save(update_fields=['password'])
        actors[name] = u
    client = actors['client']
    client.balance = Decimal('10000000')
    client.save(update_fields=['balance'])
    WalletTransaction.objects.create(user=client, kind='topup', amount=client.balance, balance_after=client.balance, reference=run, note='TEST LOCAL - financement fictif, aucun paiement externe')
    agent_r = call('admin', 'post', '/api/affiliates/agents/', {'name': f'TEST {run}', 'city': 'Douala', 'commission_rate': '0.05'}, expected=(201,))
    if agent_r.status_code == 201:
        agent = Agent.objects.get(pk=agent_r.data['id'])
        AgentReferral.objects.create(agent=agent, referred_user=client)
        call('client', 'get', f'/api/affiliates/agents/{agent.pk}/', expected=(403,))
    else:
        agent = None
    for n in range(1, 4):
        p = {'brand': 'Toyota', 'model': f'Corolla TEST {run} {n}', 'year': 2021, 'category': 'Berline', 'fuel': 'essence', 'gear': 'Manuelle', 'seats': 5, 'color': 'Vert test', 'city': 'Douala', 'mode': 'platform', 'insurance_type': 'standard', 'insurance_expiry': str(date.today() + timedelta(days=365)), 'mileage': 10000, 'description': f'TEST LOCAL {run} scenario {n} - NE PAS RESERVER'}
        preview = call('owner', 'post', '/api/vehicles/rate-preview/', p)
        p.update(plate=f'T-{run[-7:]}-{n}', daily_rate=preview.data['computed_rate'])
        call('owner', 'put', '/api/vehicles/draft/', {'step': 3, 'data': {'form': {'brand': p['brand'], 'model': p['model']}}})
        call('owner', 'get', '/api/vehicles/draft/')
        call('client', 'get', '/api/vehicles/draft/', expected=(403,))
        p.update(photos=[image(f'{run}-{n}-{i}.png') for i in range(6)], photo_slots=['front34', 'front', 'side', 'rear34', 'interior', 'rear'], registration_doc=document(f'{run}-{n}-registration.pdf'), insurance_doc=document(f'{run}-{n}-insurance.pdf'), technical_control_doc=document(f'{run}-{n}-technical.pdf'))
        created = call('owner', 'post', '/api/vehicles/', p, expected=(201,), multipart=True)
        if created.status_code != 201:
            continue
        vid = created.data['id']
        vehicles.append(vid)
        v = Vehicle.objects.get(pk=vid)
        check(f'{n}: six photos + three documents persisted', v.photos.count() == 6 and v.registration_doc and v.insurance_doc and v.technical_control_doc)
        call('owner', 'delete', '/api/vehicles/draft/', expected=(204,))
        call('client', 'patch', f'/api/vehicles/{vid}/', {'daily_rate': 1}, expected=(403, 404))
        call('other_owner', 'patch', f'/api/vehicles/{vid}/', {'description': 'unauthorized'}, expected=(403, 404))
        call('owner', 'patch', f'/api/vehicles/{vid}/', {'status': 'approved'}, expected=(400, 403))
        call('admin', 'patch', f'/api/vehicles/{vid}/', {'status': 'approved'})
        if n == 1:
            call('owner', 'post', f'/api/vehicles/{vid}/availability/', {'start_date': str(date.today()+timedelta(days=100)), 'end_date': str(date.today()+timedelta(days=102)), 'reason': run}, expected=(201,))
            call('stranger', 'post', f'/api/vehicles/{vid}/availability/', {'start_date': str(date.today()+timedelta(days=110)), 'end_date': str(date.today()+timedelta(days=111))}, expected=(403,))
        start = date.today() + timedelta(days=30+n*10)
        bp = {'vehicle': vid, 'start_date': str(start), 'end_date': str(start+timedelta(days=4 if n == 2 else 2)), 'driver_type': 'internal' if n == 2 else 'none', 'payment_method': 'wallet', 'terms_accepted': True, 'debit_authorized': True, 'notes': f'{run} scenario {n}'}
        call('client', 'post', '/api/bookings/quote/', bp)
        call('stranger', 'post', '/api/bookings/', bp, expected=(400,))
        booked = call('client', 'post', '/api/bookings/', bp, expected=(201,))
        if booked.status_code != 201:
            continue
        bid = booked.data['id']
        booking_ids.append(bid)
        base = f'/api/bookings/{bid}/'
        b = Booking.objects.get(pk=bid)
        check(f'{n}: payment and escrow held', b.status == 'confirmed' and b.payment.escrow_status == 'held')
        call('stranger', 'get', base, expected=(404,))
        call('other_owner', 'get', base, expected=(404,))
        call('other_driver', 'get', base, expected=(404,))
        call('client', 'patch', base, {'status': 'completed'}, expected=(403,))
        call('client', 'post', base+'rate/', {'rating': 5}, expected=(400,))
        call('owner', 'post', base+'owner-accept/')
        call('client', 'post', '/api/bookings/', bp, expected=(400,))
        ir = {'booking': bid, 'vehicle': vid, 'inspection_type': 'exit', 'mileage_at_inspection': 10000, 'fuel_level': 100, 'condition_score': 95, 'checklist': {'brakes': True, 'tires': True}, 'issues': [], 'notes': run+' depart'}
        call('client', 'post', '/api/inspections/', ir, expected=(403,))
        call('controller', 'post', '/api/inspections/', ir, expected=(201,))
        msg = call('client', 'post', '/api/messaging/conversations/', {'booking': bid}, expected=(200, 201))
        if msg.status_code in (200, 201):
            mid = msg.data['id']
            call('client', 'post', f'/api/messaging/conversations/{mid}/messages/', {'content': run+' remise des cles'}, expected=(200, 201))
            call('stranger', 'get', f'/api/messaging/conversations/{mid}/messages/', expected=(403, 404))
        if n == 2:
            call('owner', 'post', base+'assign-driver/', {'driver_id': actors['driver'].pk}, expected=(403,))
            call('admin', 'post', base+'assign-driver/', {'driver_id': actors['driver'].pk})
            call('driver', 'patch', base, {'status': 'active'}, expected=(400,))
            call('driver', 'post', base+'driver-refuse/')
            call('admin', 'post', base+'assign-driver/', {'driver_id': actors['other_driver'].pk})
            call('other_driver', 'post', base+'driver-accept/')
            call('other_driver', 'patch', base, {'status': 'active'})
        else:
            call('controller', 'patch', base, {'status': 'active'})
        ir.update(inspection_type='entry', mileage_at_inspection=10300, fuel_level=80, condition_score=85 if n == 3 else 94, notes=run+' restitution'+(' incident carrosserie' if n == 3 else ' normale'))
        call('controller', 'post', '/api/inspections/', ir, expected=(201,))
        call('controller', 'post', '/api/inspections/', ir, expected=(400,))
        if n == 3:
            call('client', 'post', base+'dispute/', {'reason': run+' contestation incident restitution'})
            call('owner', 'post', base+'dispute-response/', {'response': run+' constat retour joint au dossier inspection'})
            call('controller', 'post', base+'resolve-dispute/', {'decision': 'refund_deposit'}, expected=(403,))
            call('client', 'post', base+'resolve-dispute/', {'decision': 'refund_deposit'}, expected=(403,))
            call('admin', 'post', base+'resolve-dispute/', {'decision': 'refund_deposit', 'note': run+' location due et caution restituee au client'})
        else:
            call('other_driver' if n == 2 else 'owner', 'patch', base, {'status': 'completed'})
        call('client', 'post', base+'rate/', {'rating': 4 if n == 3 else 5, 'review': run+' avis apres restitution'})
        call('client', 'post', base+'rate/', {'rating': 5}, expected=(400,))
        call('client', 'get', base+'receipt/', expected=(200,))
        call('stranger', 'get', base+'receipt/', expected=(403, 404))
        b.refresh_from_db()
        b.payment.refresh_from_db()
        check(f'{n}: final completed', b.status == 'completed')
        check(f'{n}: two inspections persisted', b.inspections.count() == 2)
        check(f'{n}: escrow released', b.payment.escrow_status == 'released')
        print('FINAL', bid, b.status, 'deposit', b.payment.deposit_status, 'subtotal', b.subtotal, flush=True)
    if agent:
        call('admin', 'get', f'/api/affiliates/agents/{agent.pk}/')
        check('agent attributed completed rentals', agent.completed_bookings == len(booking_ids))
        print('AGENT', agent.pk, 'revenue', agent.generated_revenue, 'earned', agent.commission_earned, flush=True)

summary = {'run': run, 'actors': {k: v.pk for k, v in actors.items()}, 'vehicles': vehicles, 'bookings': booking_ids, 'checks': len(results), 'failures': [r for r in results if not r['ok']], 'results': results}
Path(os.environ.get('TEMP', '.'), run+'-results.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
print('SUMMARY', json.dumps({k:v for k,v in summary.items() if k != 'results'}, default=str), flush=True)
