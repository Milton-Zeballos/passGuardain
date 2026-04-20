from rest_framework import serializers

from miProyecto.models import VaultCategory


class VaultCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VaultCategory
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
