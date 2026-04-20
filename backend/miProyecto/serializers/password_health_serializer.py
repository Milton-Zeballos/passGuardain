from rest_framework import serializers

from miProyecto.models import PasswordHealth


class PasswordHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordHealth
        fields = [
            "id",
            "entry",
            "score",
            "is_weak",
            "is_reused",
            "reused_count",
            "breached",
            "last_checked_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
