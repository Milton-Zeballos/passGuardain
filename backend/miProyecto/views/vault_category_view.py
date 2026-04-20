from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from miProyecto.models import VaultCategory
from miProyecto.serializers import VaultCategorySerializer


class VaultCategoryViewSet(ModelViewSet):
    serializer_class = VaultCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VaultCategory.objects.filter(user=self.request.user).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
