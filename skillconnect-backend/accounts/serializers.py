from rest_framework import serializers
from django.contrib.auth import get_user_model
from customers.models import Customer
from workers.models import Worker
from categories.models import Category

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'phone', 'role', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')

class RegisterCustomerSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=6)
    address = serializers.CharField(required=False, allow_blank=True)
    ward = serializers.CharField(required=False, allow_blank=True, default='')
    panchayat = serializers.CharField(required=False, allow_blank=True, default='')
    district = serializers.CharField(required=False, allow_blank=True, default='')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    pincode = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        phone = validated_data.pop('phone')
        full_name = validated_data.pop('full_name')

        user = User.objects.create_user(
            email=email,
            password=password,
            phone=phone,
            role=User.Role.CUSTOMER,
            is_verified=True
        )

        customer = Customer.objects.create(
            user=user,
            full_name=full_name,
            email=email,
            phone=phone,
            **validated_data
        )
        return customer

class RegisterWorkerSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=6)
    category_id = serializers.CharField(required=True)
    experience = serializers.CharField(required=False, default='5 Years')
    hourly_rate = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, default=500.00, min_value=0)
    address = serializers.CharField(required=False, allow_blank=True)
    ward = serializers.CharField(required=False, allow_blank=True)
    panchayat = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True, default='')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    pincode = serializers.CharField(required=False, allow_blank=True, default='')
    about = serializers.CharField(required=False, allow_blank=True)

    profile_photo = serializers.ImageField(required=False, allow_null=True)
    government_id = serializers.FileField(required=True)
    trade_certificate = serializers.FileField(required=True)
    experience_certificate = serializers.FileField(required=False, allow_null=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        phone = validated_data.pop('phone')
        full_name = validated_data.pop('full_name')
        category_slug = validated_data.pop('category_id', 'electrician')

        category_obj = Category.objects.filter(category_id=category_slug).first()

        user = User.objects.create_user(
            email=email,
            password=password,
            phone=phone,
            role=User.Role.WORKER,
            is_verified=False
        )

        worker = Worker.objects.create(
            user=user,
            full_name=full_name,
            email=email,
            phone=phone,
            category=category_obj,
            category_name=category_obj.category_name if category_obj else category_slug.capitalize(),
            verification_status=Worker.VerificationStatus.PENDING,
            **validated_data
        )
        return worker

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

class UpdateProfileSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=False, max_length=150)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    ward = serializers.CharField(required=False)
    panchayat = serializers.CharField(required=False)
    district = serializers.CharField(required=False)
    state = serializers.CharField(required=False)
    pincode = serializers.CharField(required=False)

    def validate_email(self, value):
        user = self.context.get('request').user if self.context.get('request') else None
        if User.objects.filter(email=value).exclude(pk=getattr(user, 'pk', None)).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower().strip()
