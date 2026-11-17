import secrets

from django.db import migrations


def backfill_referral_codes(apps, schema_editor):
    """Attribue un code parrainage unique aux comptes dont referral_code == ''.

    La colonne porte une contrainte unique en production : un seul '' est
    toléré et chaque INSERT de '' supplémentaire levait une IntegrityError
    (500 à l'inscription). On renseigne un code réel pour les comptes
    existants ; User.save() génère désormais le code pour les nouveaux.
    """
    User = apps.get_model('users', 'User')
    for u in User.objects.filter(referral_code='').iterator():
        prefix = (u.username or 'U').upper()[:8]
        code = f'ALP-{prefix}-{secrets.token_hex(3).upper()}'
        while User.objects.filter(referral_code=code).exists():
            code = f'ALP-{prefix}-{secrets.token_hex(3).upper()}'
        u.referral_code = code
        u.save(update_fields=['referral_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_logencode_role_reset_sequences'),
    ]

    operations = [
        migrations.RunPython(backfill_referral_codes, migrations.RunPython.noop),
    ]
