import secrets

from django.db import migrations


def widen_referral_code_column(apps, schema_editor):
    """Réaligne la colonne prod (varchar(12), créée hors migrations)
    sur le varchar(20) déclaré par la migration 0011."""
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute(
            'ALTER TABLE users_user ALTER COLUMN referral_code TYPE varchar(20)')


def backfill_referral_codes(apps, schema_editor):
    """Attribue un code parrainage unique aux comptes dont referral_code == ''.

    La colonne porte une contrainte unique en production : un seul '' est
    toléré et chaque INSERT de '' supplémentaire levait une IntegrityError
    (500 à l'inscription). On renseigne un code réel pour les comptes
    existants ; User.save() génère désormais le code pour les nouveaux.
    """
    User = apps.get_model('users', 'User')
    for u in User.objects.filter(referral_code='').iterator():
        code = f'ALP-{secrets.token_hex(4).upper()}'
        while User.objects.filter(referral_code=code).exists():
            code = f'ALP-{secrets.token_hex(4).upper()}'
        u.referral_code = code
        u.save(update_fields=['referral_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0023_logencode_role_reset_sequences'),
    ]

    operations = [
        migrations.RunPython(widen_referral_code_column, migrations.RunPython.noop),
        migrations.RunPython(backfill_referral_codes, migrations.RunPython.noop),
    ]
