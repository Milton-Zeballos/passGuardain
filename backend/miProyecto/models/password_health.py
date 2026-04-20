from django.db import models

from .base import TimestampedModel
from .vault_entry import VaultEntry


class PasswordHealth(TimestampedModel):
    entry = models.OneToOneField(
        VaultEntry,
        on_delete=models.CASCADE,
        related_name="health",
    )
    score = models.PositiveSmallIntegerField(default=0)
    is_weak = models.BooleanField(default=False)
    is_reused = models.BooleanField(default=False)
    reused_count = models.PositiveIntegerField(default=0)
    breached = models.BooleanField(default=False)
    last_checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Password health"
        verbose_name_plural = "Password health"

    def __str__(self):
        return f"Health for {self.entry.title}: {self.score}/100"
