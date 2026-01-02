from django.core.management.base import BaseCommand
from debateapp.personas import load_personas


class Command(BaseCommand):
    help = 'Load AI personas into the database'

    def handle(self, *args, **options):
        self.stdout.write('Loading AI personas...')
        load_personas()
        self.stdout.write(
            self.style.SUCCESS('Successfully loaded AI personas')
        )