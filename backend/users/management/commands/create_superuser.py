from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Run migrations and create a superuser if it does not exist'

    def handle(self, *args, **options):
        # Run migrations
        call_command('migrate')

        # Create superuser
        User = get_user_model()
        username = 'admin'
        email = 'admin@example.com'
        password = 'adminpassword'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser "{username}" already exists.'))