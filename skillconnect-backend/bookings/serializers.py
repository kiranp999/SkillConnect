from decimal import Decimal

from rest_framework import serializers
from django.utils import timezone

from bookings.models import Booking
from customers.serializers import CustomerSerializer
from workers.serializers import WorkerSerializer


class BookingSerializer(serializers.ModelSerializer):
    worker_details = WorkerSerializer(source='worker', read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'booking_code', 'customer', 'worker', 'customer_details',
            'worker_details', 'booking_date', 'service_date', 'service_time',
            'address', 'notes', 'estimate_amount', 'estimate_breakdown',
            'booking_status', 'timeline', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'booking_code', 'customer', 'worker', 'booking_date', 'estimate_amount',
            'estimate_breakdown', 'booking_status', 'timeline', 'created_at', 'updated_at'
        )


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('worker', 'service_date', 'service_time', 'address', 'notes')

    def validate_service_date(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('Service date cannot be in the past.')
        return value

    def validate_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Service address is required.')
        return value.strip()


class EstimateSubmitSerializer(serializers.Serializer):
    estimate_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0.01'),
    )
    estimate_breakdown = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_estimate_breakdown(self, value):
        cleaned = []
        total = Decimal('0')

        for index, item in enumerate(value, start=1):
            name = str(item.get('item', '')).strip()
            if not name:
                raise serializers.ValidationError(f'Estimate item {index} needs a description.')

            try:
                cost = Decimal(str(item.get('cost', '')))
            except Exception:
                raise serializers.ValidationError(f'Estimate item {index} has an invalid cost.')

            if cost < 0:
                raise serializers.ValidationError(f'Estimate item {index} cannot have a negative cost.')

            total += cost
            cleaned.append({'item': name, 'cost': float(cost)})

        return cleaned

    def validate(self, attrs):
        amount = attrs['estimate_amount']
        breakdown_total = sum(Decimal(str(item['cost'])) for item in attrs['estimate_breakdown'])
        if abs(amount - breakdown_total) > Decimal('0.01'):
            raise serializers.ValidationError({
                'estimate_amount': 'The estimate total must equal the sum of the itemized costs.'
            })
        return attrs
