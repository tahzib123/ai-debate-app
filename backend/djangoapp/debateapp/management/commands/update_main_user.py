from django.core.management.base import BaseCommand
from debateapp.models import User

class Command(BaseCommand):
    help = 'Update user ID 1 to have name "You" for the main user'

    def handle(self, *args, **options):
        try:
            user = User.objects.get(id=1)
            old_name = user.name
            user.name = "You"
            user.type = "human"
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated user ID 1 from "{old_name}" to "You"')
            )
        except User.DoesNotExist:
            # Create user ID 1 if it doesn't exist
            user = User.objects.create(
                id=1,
                name="You",
                type="human",
                agent_description=""
            )
            self.stdout.write(
                self.style.SUCCESS('Successfully created user ID 1 with name "You"')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating user: {e}')
            )