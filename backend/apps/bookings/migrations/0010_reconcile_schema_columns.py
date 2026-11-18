"""Réconciliation du schéma réel avec les modèles.

La base de production a été partiellement créée/modifiée hors migrations :
des colonnes attendues par les modèles manquent dans les tables réelles —
POST /api/bookings/ renvoyait 500 à l'INSERT alors que lecture et calcul
de devis fonctionnaient (même schéma de dérive que referral_code).

Cette migration ajoute toute colonne manquante aux tables du chemin
d'écriture d'une réservation, sans toucher aux colonnes existantes —
idempotente, sans effet sur une base déjà conforme.
"""

from django.db import migrations

from config.migration_utils import existing_columns


def reconcile_columns(apps, schema_editor):
    conn = schema_editor.connection
    for app_label, model_name in (
        ('bookings', 'Booking'),
        ('payments', 'Payment'),
        ('payments', 'WalletTransaction'),
        ('users', 'Notification'),
    ):
        model = apps.get_model(app_label, model_name)
        if model._meta.db_table not in conn.introspection.table_names():
            continue
        existing = existing_columns(conn, model._meta.db_table)
        for field in model._meta.fields:
            if field.auto_created or field.column in existing:
                continue
            schema_editor.add_field(model, field)


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0009_booking_owner_rating_booking_owner_review'),
        ('payments', '0009_alter_withdrawalrequest_method'),
        ('users', '0024_backfill_referral_codes'),
    ]

    operations = [
        migrations.RunPython(reconcile_columns, migrations.RunPython.noop),
    ]
