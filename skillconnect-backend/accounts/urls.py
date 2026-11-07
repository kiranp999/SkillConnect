from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import (
    RegisterCustomerView,
    RegisterWorkerView,
    LoginView,
    ProfileView,
    ChangePasswordView,
    ForgotPasswordView
)

urlpatterns = [
    path('register/customer/', RegisterCustomerView.as_view(), name='register-customer'),
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
]
