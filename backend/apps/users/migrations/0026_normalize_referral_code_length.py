import secrets

from django.db import migrations, models


def normalize_referral_codes(apps, schema_editor):
    """Ramène tous les codes parrainage au format ALP-XXXXXXXX (12 chars).

    Un ancien seed écrivait des codes au format « ALP-{USERNAME}-{hex} »
    (14 à 19 caractères, ex. ALP-YVESANAG-8FBB50) directement en base.
    La colonne porte une contrainte unique en production : chaque nouveau
    code est vérifié contre l'ensemble des codes existants.
    """
    User = apps.get_model('users', 'User')
    existing = set(User.objects.exclude(referral_code='')
                   .values_list('referral_code', flat=True))
    for u in User.objects.exclude(referral_code='').iterator():
        if len(u.referral_code) <= 12:
            continue
        code = f'ALP-{secrets.token_hex(4).upper()}'
        while code in existing:
            code = f'ALP-{secrets.token_hex(4).upper()}'
        existing.add(code)
        u.referral_code = code
        u.save(update_fields=['referral_code'])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0025_platformsettings_max_withdrawal_amount_and_more'),
    ]

    operations = [
        migrations.RunPython(normalize_referral_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='user',
            name='referral_code',
            field=models.CharField(blank=True, default='', max_length=12),
        ),
    ]
