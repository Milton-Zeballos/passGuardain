from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from miProyecto.views import (
    MeView,
    RegisterView,
    PasswordHealthViewSet,
    VaultCategoryViewSet,
    VaultEntryViewSet,
)

router = DefaultRouter()
router.register("categories", VaultCategoryViewSet, basename="vault-category")
router.register("entries", VaultEntryViewSet, basename="vault-entry")
router.register("password-health", PasswordHealthViewSet, basename="password-health")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("", include(router.urls)),
]

