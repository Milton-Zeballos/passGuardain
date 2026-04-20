from django.contrib.auth.models import User
from django.db import models

from .base import TimestampedModel


class VaultCategory(TimestampedModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="vault_categories",
    )
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ("user", "name")
        verbose_name_plural = "Vault categories"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.user.username})"
