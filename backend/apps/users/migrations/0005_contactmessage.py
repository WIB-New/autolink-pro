# CreateModel ContactMessage — nom aligné sur la migration appliquée en
# production (chaîne devin). Idempotente : la table peut déjà exister.

from django.db import migrations, models
from config.migration_utils import CreateModelIfMissing


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_logincode'),
    ]

    operations = [
        CreateModelIfMissing(
            name='ContactMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_name', models.CharField(max_length=100)),
                ('first_name', models.CharField(max_length=100)),
                ('phone', models.CharField(max_length=30)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('rental_type', models.CharField(blank=True, max_length=120)),
                ('message', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_handled', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Message de contact',
                'verbose_name_plural': 'Messages de contact',
                'ordering': ['-created_at'],
            },
        ),
    ]
