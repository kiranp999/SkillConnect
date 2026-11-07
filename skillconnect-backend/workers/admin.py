from django.contrib import admin
from .models import Worker

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'email',
        'phone',
        'get_category_display',
        'experience',
        'ward',
        'panchayat',
        'district',
        'availability',
        'verification_status',
        'created_at',
    )
    list_filter = (
        'verification_status',
        'category',
        'availability',
        'district',
        'panchayat',
        'ward',
    )
    search_fields = (
        'full_name',
        'email',
        'phone',
        'ward',
        'panchayat',
        'district',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'verified_date')

    @admin.display(description='Category')
    def get_category_display(self, obj):
        return obj.category.category_name if obj.category else obj.category_name or '-'
