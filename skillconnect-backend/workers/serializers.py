from rest_framework import serializers
from workers.models import Worker
from categories.serializers import CategorySerializer

class WorkerSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Worker
        fields = (
            'id', 'full_name', 'email', 'phone', 'category', 'category_name',
            'category_details', 'experience', 'hourly_rate', 'profile_photo',
            'banner_photo', 'government_id', 'trade_certificate',
            'experience_certificate', 'availability', 'address', 'ward',
            'panchayat', 'district', 'state', 'pincode', 'verification_status',
            'average_rating', 'reviews_count', 'completed_jobs_count',
            'about', 'skills', 'certifications_list', 'created_at'
        )
        read_only_fields = ('id', 'verification_status', 'average_rating', 'reviews_count', 'completed_jobs_count', 'created_at')

class WorkerVerificationAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ('id', 'verification_status')
