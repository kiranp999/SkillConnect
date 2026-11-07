from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from categories.models import Category

User = get_user_model()


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.get_or_create(category_id='electrician', defaults={'category_name': 'Electrician'})[0]

    def test_register_customer(self):
        response = self.client.post('/api/auth/register/customer/', {
            'full_name': 'Test Customer', 'email': 'customer@test.com', 'phone': '+91 98765 00001',
            'password': 'password123', 'address': '123 Main St',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertTrue(User.objects.filter(email='customer@test.com', role=User.Role.CUSTOMER).exists())

    def test_register_worker_starts_pending(self):
        response = self.client.post('/api/auth/register/worker/', {
            'full_name': 'Test Worker', 'email': 'worker@test.com', 'phone': '+91 98765 00002',
            'password': 'password123', 'category_id': 'electrician', 'hourly_rate': '40.00',
            'government_id': SimpleUploadedFile('id.pdf', b'id', content_type='application/pdf'),
            'trade_certificate': SimpleUploadedFile('trade.pdf', b'trade', content_type='application/pdf'),
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('tokens', response.data)
        user = User.objects.get(email='worker@test.com')
        self.assertEqual(user.role, User.Role.WORKER)
        self.assertEqual(user.worker_profile.verification_status, 'Pending')

    def test_login_requires_matching_role(self):
        User.objects.create_user(email='login@test.com', password='password123', role=User.Role.CUSTOMER)
        wrong_role = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'password123', 'role': 'worker'
        }, format='json')
        self.assertEqual(wrong_role.status_code, status.HTTP_403_FORBIDDEN)

        correct = self.client.post('/api/auth/login/', {
            'email': 'login@test.com', 'password': 'password123', 'role': 'customer'
        }, format='json')
        self.assertEqual(correct.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', correct.data)

    def test_protected_profile_api(self):
        user = User.objects.create_user(email='profile@test.com', password='password123', role=User.Role.CUSTOMER)
        self.assertEqual(self.client.get('/api/auth/profile/').status_code, status.HTTP_401_UNAUTHORIZED)
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@test.com')
