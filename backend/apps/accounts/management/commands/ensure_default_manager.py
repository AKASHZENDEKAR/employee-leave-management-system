import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create or update the configured default manager account."

    def handle(self, *args, **options):
        username = os.getenv("DEFAULT_MANAGER_USERNAME", "manager").strip()
        password = os.getenv("DEFAULT_MANAGER_PASSWORD", "")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Default manager not configured; set "
                    "DEFAULT_MANAGER_PASSWORD to enable it."
                )
            )
            return

        User = get_user_model()
        manager, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": f"{username}@example.invalid",
                "first_name": "Manager",
            },
        )

        manager.role = User.Role.MANAGER
        manager.is_active = True
        manager.set_password(password)
        manager.save()

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{action} default manager account '{username}'.")
        )
