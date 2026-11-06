# Correctif : les colonnes héritées d'anciennes migrations fusionnées
# (commission_rate sur users_user) sont NOT NULL sans valeur par défaut,
# ce qui fait échouer tout INSERT sur users_user (inscription → erreur 500).
# Le modèle actuel ne les connaît plus : on les rend nulles/défaut en BDD.

from django.db import migrations


# Colonnes héritées à assouplir : (table, colonne) — nulles + défaut sain.
LEGACY_COLUMNS = [
    ('users_user', 'commission_rate', '0'),
]


def fix_columns(apps, schema_editor):
    conn = schema_editor.connection
    if conn.vendor != 'postgresql':
        # SQLite (dev) : ALTER COLUMN non supporté — la colonne est corrigée
        # manuellement en local. Les bases fraîches n'ont pas ces colonnes.
        return
    for table, column, default in LEGACY_COLUMNS:
        with conn.cursor() as cur:
            existing = {c.name for c in conn.introspection.get_table_description(cur, table)}
        if column not in existing:
            continue
        schema_editor.execute(
            f'ALTER TABLE {table} ALTER COLUMN {column} SET DEFAULT {default}')
        schema_editor.execute(
            f'ALTER TABLE {table} ALTER COLUMN {column} DROP NOT NULL')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_kyc_platform_settings'),
    ]

    operations = [
        migrations.RunPython(fix_columns, reverse_code=migrations.RunPython.noop),
    ]
