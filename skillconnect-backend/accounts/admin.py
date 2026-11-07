from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'role', 'phone', 'is_verified', 'is_staff', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'role')}),
        ('Verification & Status', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )

    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'phone', 'is_staff', 'is_superuser'),
        }),
    )
