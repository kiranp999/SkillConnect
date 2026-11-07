from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        'customer',
        'worker',
        'booking',
        'rating',
        'comment',
        'created_at',
    )
    list_filter = (
        'rating',
        'created_at',
    )
    search_fields = (
        'customer__full_name',
        'worker__full_name',
        'comment',
        'booking__booking_code',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
