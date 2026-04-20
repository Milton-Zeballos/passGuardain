from django.contrib import admin

from .models import PasswordHealth, VaultCategory, VaultEntry


@admin.register(VaultCategory)
class VaultCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
    list_filter = ('created_at',)


@admin.register(VaultEntry)
class VaultEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'account_identifier', 'user', 'category', 'is_favorite')
    search_fields = ('title', 'account_identifier', 'user__username')
    list_filter = ('is_favorite', 'category', 'created_at')


@admin.register(PasswordHealth)
class PasswordHealthAdmin(admin.ModelAdmin):
    list_display = ('entry', 'score', 'is_weak', 'is_reused', 'breached', 'last_checked_at')
    search_fields = ('entry__title', 'entry__account_identifier')
    list_filter = ('is_weak', 'is_reused', 'breached')
