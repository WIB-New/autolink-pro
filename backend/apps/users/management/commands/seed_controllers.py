from decouple import config
from django.core.management.base import BaseCommand
from apps.users.models import User


# Comptes contrôleurs techniques — créés pour l'équipe hub qui réalise les
# fiches d'entrée/sortie. Configurables via CONTROLLER*_USERNAME / *_EMAIL /
# *_PASSWORD dans l'environnement ; mots de passe de démonstration sinon.
CONTROLLERS = [
    dict(
        username=config('CONTROLLER1_USERNAME', default='controleur1'),
        email=config('CONTROLLER1_EMAIL', default='controleur1@autolink.cm'),
        password=config('CONTROLLER1_PASSWORD', default='Controleur2026!'),
        first_name='Brice', last_name='Mballa',
        phone='+237691000001', city='Douala',
    ),
    dict(
        username=config('CONTROLLER2_USERNAME', default='controleur2'),
        email=config('CONTROLLER2_EMAIL', default='controleur2@autolink.cm'),
        password=config('CONTROLLER2_PASSWORD', default='Controleur2026!'),
        first_name='Solange', last_name='Ndoumbe',
        phone='+237691000002', city='Yaoundé',
    ),
]


class Command(BaseCommand):
    help = 'Seed : comptes CONTROLLER pour l\'équipe d\'inspection (idempotent)'

    def handle(self, *args, **options):
        for spec in CONTROLLERS:
            user, created = User.objects.get_or_create(
                username=spec['username'],
                defaults=dict(
                    email=spec['email'], first_name=spec['first_name'],
                    last_name=spec['last_name'], role='CONTROLLER',
                    phone=spec['phone'], city=spec['city'], is_verified=True,
                ),
            )
            fixed = False
            for attr, val in (('role', 'CONTROLLER'), ('email', spec['email']),
                              ('first_name', spec['first_name']),
                              ('last_name', spec['last_name']),
                              ('is_verified', True), ('is_active', True)):
                if getattr(user, attr) != val:
                    setattr(user, attr, val)
                    fixed = True
            if created or fixed:
                user.set_password(spec['password'])
                user.save()
            self.stdout.write(
                f"Controller: {user.username} ({user.get_full_name()}) "
                f"{'créé' if created else 'vérifié'}")
