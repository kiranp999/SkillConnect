from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'ward', 'panchayat', 'district', 'created_at')
    search_fields = ('full_name', 'email', 'phone', 'ward', 'panchayat', 'district')
    list_filter = ('district', 'state', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
