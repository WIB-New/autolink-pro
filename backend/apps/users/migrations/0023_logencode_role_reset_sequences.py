from django.db import migrations, models


def reset_sequences(apps, schema_editor):
    """Recale les séquences Postgres sur MAX(id) de chaque table.

    Si des lignes ont été importées avec des PK explicites (restore, seed,
    copie SQL), la séquence reste en retard et chaque INSERT lève
    « duplicate key value violates unique constraint » — ce qui rendait
    toute création de compte impossible en production.
    No-op hors PostgreSQL.
    """
    connection = schema_editor.connection
    if connection.vendor != 'postgresql':
        return
    with connection.cursor() as cursor:
        for model in apps.get_models():
            pk = model._meta.pk
            if not pk.auto_created or pk.get_internal_type() not in (
                    'AutoField', 'BigAutoField', 'SmallAutoField'):
                continue
            table = model._meta.db_table
            cursor.execute(
                "SELECT pg_get_serial_sequence(%s, %s)", [table, pk.column])
            row = cursor.fetchone()
            if not row or not row[0]:
                continue
            cursor.execute(
                'SELECT setval(%s, COALESCE((SELECT MAX("{col}") FROM "{tbl}"), 1), '
                '(SELECT MAX("{col}") FROM "{tbl}") IS NOT NULL)'.format(
                    tbl=table, col=pk.column),
                [row[0]])


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0022_document_verification'),
    ]

    operations = [
        migrations.AddField(
            model_name='logincode',
            name='role',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.RunPython(reset_sequences, migrations.RunPython.noop),
    ]
