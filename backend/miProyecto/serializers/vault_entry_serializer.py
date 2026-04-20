from rest_framework import serializers

from miProyecto.models import VaultEntry


class VaultEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultEntry
        fields = [
            "id",
            "category",
            "title",
            "account_identifier",
            "encrypted_secret",
            "website_url",
            "notes",
            "last_accessed_at",
            "is_favorite",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
