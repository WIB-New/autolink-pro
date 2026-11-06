"""Opérations de migration idempotentes.

La base de production a accumulé des colonnes/tables créées par des
migrations de branches parallèles, ensuite renommées ou supprimées lors
des merges. Les opérations ci-dessous vérifient l'existence réelle des
objets en base avant d'agir — compatible SQLite et PostgreSQL.
"""

from django.db import migrations


def existing_columns(connection, table):
    with connection.cursor() as cursor:
        return {
            column.name
            for column in connection.introspection.get_table_description(cursor, table)
        }


class AddFieldIfMissing(migrations.AddField):
    """AddField qui ne touche pas la base si la colonne existe déjà."""

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if not self.allow_migrate_model(schema_editor.connection.alias, model):
            return
        field = model._meta.get_field(self.name)
        if field.column not in existing_columns(schema_editor.connection, model._meta.db_table):
            super().database_forwards(app_label, schema_editor, from_state, to_state)


class AlterFieldIfPresent(migrations.AlterField):
    """AlterField ignoré si la colonne n'existe pas en base."""

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if not self.allow_migrate_model(schema_editor.connection.alias, model):
            return
        field = model._meta.get_field(self.name)
        if field.column in existing_columns(schema_editor.connection, model._meta.db_table):
            super().database_forwards(app_label, schema_editor, from_state, to_state)


class CreateModelIfMissing(migrations.CreateModel):
    """CreateModel qui ne touche pas la base si la table existe déjà."""

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.name)
        if not self.allow_migrate_model(schema_editor.connection.alias, model):
            return
        if model._meta.db_table not in schema_editor.connection.introspection.table_names():
            super().database_forwards(app_label, schema_editor, from_state, to_state)


def constraint_exists(connection, name):
    """Vérifie l'existence d'une contrainte/index sans exécuter de DDL
    (un échec SQL dans une transaction PostgreSQL est irrécupérable)."""
    with connection.cursor() as cur:
        if connection.vendor == 'postgresql':
            cur.execute('SELECT 1 FROM pg_constraint WHERE conname = %s', [name])
        elif connection.vendor == 'sqlite':
            cur.execute("SELECT 1 FROM sqlite_master WHERE name = %s", [name])
        else:
            cur.execute(
                'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS '
                'WHERE CONSTRAINT_NAME = %s', [name],
            )
        return cur.fetchone() is not None


class AddConstraintIfMissing(migrations.AddConstraint):
    """AddConstraint ignoré si la contrainte existe déjà en base."""

    def database_forwards(self, app_label, schema_editor, from_state, to_state):
        model = to_state.apps.get_model(app_label, self.model_name)
        if not self.allow_migrate_model(schema_editor.connection.alias, model):
            return
        if not constraint_exists(schema_editor.connection, self.constraint.name):
            super().database_forwards(app_label, schema_editor, from_state, to_state)
