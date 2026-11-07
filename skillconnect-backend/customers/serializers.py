from rest_framework import serializers
from customers.models import Customer
from accounts.serializers import UserSerializer

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = (
            'id', 'user', 'full_name', 'email', 'phone',
            'address', 'ward', 'panchayat', 'district', 'state', 'pincode',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
