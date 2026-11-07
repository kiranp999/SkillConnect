from rest_framework import serializers
from categories.models import Category

class CategorySerializer(serializers.ModelSerializer):
    workers_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'category_id', 'category_name', 'description',
            'icon', 'color', 'image', 'avg_price', 'popular_services',
            'workers_count', 'created_at'
        )

    def get_workers_count(self, obj):
        return obj.workers.filter(verification_status='Verified').count()
