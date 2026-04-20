from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from miProyecto.models import VaultEntry
from miProyecto.serializers import VaultEntrySerializer


class VaultEntryViewSet(ModelViewSet):
    serializer_class = VaultEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VaultEntry.objects.filter(user=self.request.user).order_by("title")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
