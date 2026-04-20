from django.contrib.auth.models import User
from django.db import models

from .base import TimestampedModel
from .vault_category import VaultCategory


class VaultEntry(TimestampedModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="vault_entries",
    )
    category = models.ForeignKey(
        VaultCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="entries",
    )
    title = models.CharField(max_length=120)
    account_identifier = models.CharField(
        max_length=180,
        help_text="Email, username, phone or account alias.",
    )
    encrypted_secret = models.TextField(
        help_text="Encrypted credential payload (password/notes/etc).",
    )
    website_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    is_favorite = models.BooleanField(default=False)

    class Meta:
        ordering = ["title"]
        indexes = [
            models.Index(fields=["user", "title"]),
            models.Index(fields=["user", "account_identifier"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.account_identifier}"
