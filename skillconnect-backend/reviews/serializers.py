from rest_framework import serializers
from reviews.models import Review
from customers.serializers import CustomerSerializer


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id', 'booking', 'customer', 'worker', 'customer_name',
            'customer_avatar', 'rating', 'comment', 'created_at'
        )
        read_only_fields = ('id', 'customer', 'worker', 'created_at')

    def get_customer_avatar(self, obj):
        return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"


class ReviewCreateSerializer(serializers.ModelSerializer):
    rating = serializers.FloatField(min_value=1, max_value=5)
    comment = serializers.CharField(min_length=3, trim_whitespace=True)

    class Meta:
        model = Review
        fields = ('booking', 'rating', 'comment')
