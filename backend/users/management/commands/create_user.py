from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Run migrations and create a test user if it does not exist'

    def handle(self, *args, **options):
        # Create test user
        User = get_user_model()
        
        username = 'test'
        email = 'test@email.com'
        password = 'test'

        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Test user "{username}" created successfully.'))
        else:
            self.stdout.write(self.style.WARNING(f'Test user "{username}" already exists.'))