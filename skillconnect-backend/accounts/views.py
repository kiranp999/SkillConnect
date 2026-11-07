from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from accounts.serializers import (
    RegisterCustomerSerializer,
    RegisterWorkerSerializer,
    ChangePasswordSerializer,
    UserSerializer,
    UpdateProfileSerializer
)
from customers.serializers import CustomerSerializer
from workers.serializers import WorkerSerializer

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterCustomerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterCustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            tokens = get_tokens_for_user(customer.user)
            return Response({
                'message': 'Customer registered successfully.',
                'tokens': tokens,
                'user': CustomerSerializer(customer).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterWorkerView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterWorkerSerializer(data=request.data)
        if serializer.is_valid():
            worker = serializer.save()
            return Response({
                'message': 'Worker registered successfully. Pending admin verification.',
                'user': WorkerSerializer(worker).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        password = request.data.get('password', '')
        role = str(request.data.get('role', 'customer')).strip().lower()

        if not email or not password:
            return Response({'error': 'Please provide both email and password.'}, status=status.HTTP_400_BAD_REQUEST)

        if role not in {User.Role.CUSTOMER, User.Role.WORKER, User.Role.ADMIN}:
            return Response({'error': 'Invalid account role.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role != role:
            return Response({'error': f'This account is registered as {user.get_role_display()}, not {role.capitalize()}.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.is_active:
            return Response({'error': 'This account is inactive.'}, status=status.HTTP_403_FORBIDDEN)

        if user.role == User.Role.WORKER:
            if not hasattr(user, 'worker_profile'):
                return Response({'error': 'Worker profile not found.'}, status=status.HTTP_404_NOT_FOUND)
            if user.worker_profile.verification_status != user.worker_profile.VerificationStatus.VERIFIED:
                return Response({'error': f'Worker verification is currently {user.worker_profile.verification_status.lower()}. Please wait for administrator verification.'}, status=status.HTTP_403_FORBIDDEN)

        if user.role == User.Role.ADMIN and not (user.is_staff or user.is_superuser):
            return Response({'error': 'This admin account is not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        if hasattr(user, 'customer_profile'):
            user_data['profile'] = CustomerSerializer(user.customer_profile).data
            user_data['name'] = user.customer_profile.full_name
        elif hasattr(user, 'worker_profile'):
            user_data['profile'] = WorkerSerializer(user.worker_profile).data
            user_data['name'] = user.worker_profile.full_name
        else:
            user_data['name'] = user.email.split('@')[0].capitalize()

        return Response({'message': 'Login successful.', 'tokens': tokens, 'user': user_data}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data
        if hasattr(user, 'customer_profile'):
            data['customer_profile'] = CustomerSerializer(user.customer_profile).data
        elif hasattr(user, 'worker_profile'):
            data['worker_profile'] = WorkerSerializer(user.worker_profile).data
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = UpdateProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        vdata = serializer.validated_data

        if 'email' in vdata:
            user.email = vdata['email']
            user.username = vdata['email']
        if 'phone' in vdata:
            user.phone = vdata['phone']
        if 'email' in vdata or 'phone' in vdata:
            user.save()

        profile_fields = set(vdata.keys()) - {'email', 'phone'}
        if hasattr(user, 'customer_profile'):
            customer = user.customer_profile
            if 'email' in vdata:
                customer.email = vdata['email']
            if 'phone' in vdata:
                customer.phone = vdata['phone']
            for key in profile_fields:
                if hasattr(customer, key):
                    setattr(customer, key, vdata[key])
            customer.save()
            return Response(CustomerSerializer(customer).data, status=status.HTTP_200_OK)

        if hasattr(user, 'worker_profile'):
            worker = user.worker_profile
            if 'email' in vdata:
                worker.email = vdata['email']
            if 'phone' in vdata:
                worker.phone = vdata['phone']
            for key in profile_fields:
                if hasattr(worker, key):
                    setattr(worker, key, vdata[key])
            worker.save()
            return Response(WorkerSerializer(worker).data, status=status.HTTP_200_OK)

        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'error': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.', 'tokens': get_tokens_for_user(user)}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get('email', '')).strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        # A real email delivery provider is not part of this project. Do not claim that an email was sent.
        if not User.objects.filter(email=email, is_active=True).exists():
            return Response({'error': 'No active account was found for this email.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Password reset email delivery is not configured in this deployment.'}, status=status.HTTP_501_NOT_IMPLEMENTED)
