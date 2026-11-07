from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_code',
        'customer',
        'worker',
        'service_date',
        'booking_status',
        'estimate_amount',
        'created_at',
    )
    list_filter = (
        'booking_status',
        'service_date',
        'created_at',
    )
    search_fields = (
        'booking_code',
        'customer__full_name',
        'customer__email',
        'worker__full_name',
        'worker__email',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'booking_date')
