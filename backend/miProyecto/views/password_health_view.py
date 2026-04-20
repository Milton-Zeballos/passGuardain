from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from miProyecto.models import PasswordHealth
from miProyecto.serializers import PasswordHealthSerializer


class PasswordHealthViewSet(ModelViewSet):
    serializer_class = PasswordHealthSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PasswordHealth.objects.filter(entry__user=self.request.user).select_related("entry")

    def perform_create(self, serializer):
        entry = serializer.validated_data["entry"]
        if entry.user_id != self.request.user.id:
            raise ValidationError("No puedes crear salud para entradas de otro usuario.")
        serializer.save()

    def perform_update(self, serializer):
        entry = serializer.validated_data.get("entry", serializer.instance.entry)
        if entry.user_id != self.request.user.id:
            raise ValidationError("No puedes asociar salud a entradas de otro usuario.")
        serializer.save()
