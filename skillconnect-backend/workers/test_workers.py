from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from categories.models import Category
from workers.models import Worker

User = get_user_model()


class WorkerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.get_or_create(category_id='electrician', defaults={'category_name': 'Electrician'})[0]
        self.w1_user = User.objects.create_user(email='w1@test.com', password='password123', role=User.Role.WORKER, is_verified=True)
        self.w1 = Worker.objects.create(
            user=self.w1_user, full_name='Verified Worker One', email=self.w1_user.email,
            phone='+91 99999 11111', category=self.category, category_name='Electrician',
            verification_status=Worker.VerificationStatus.VERIFIED, district='Central Metro',
            average_rating=4.8, availability=True
        )
        self.w2_user = User.objects.create_user(email='w2@test.com', password='password123', role=User.Role.WORKER)
        self.w2 = Worker.objects.create(
            user=self.w2_user, full_name='Pending Worker Two', email=self.w2_user.email,
            phone='+91 99999 22222', category=self.category, category_name='Electrician',
            verification_status=Worker.VerificationStatus.PENDING, district='Central Metro'
        )
        self.admin_user = User.objects.create_user(
            email='admin@test.com', password='admin123', role=User.Role.ADMIN,
            is_staff=True, is_superuser=True
        )

    def test_public_search_hides_unverified_workers(self):
        response = self.client.get('/api/workers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        ids = [w['id'] for w in results]
        self.assertIn(self.w1.id, ids)
        self.assertNotIn(self.w2.id, ids)

    def test_pending_worker_can_access_own_profile(self):
        self.client.force_authenticate(user=self.w2_user)
        response = self.client.get(f'/api/workers/{self.w2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_verification_approval(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/workers/{self.w2.id}/verify/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.w2.refresh_from_db()
        self.assertEqual(self.w2.verification_status, 'Verified')
        self.assertTrue(self.w2.user.is_verified)

    def test_admin_verification_rejection(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/workers/{self.w2.id}/reject/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.w2.refresh_from_db()
        self.assertEqual(self.w2.verification_status, 'Rejected')
        self.assertFalse(self.w2.user.is_verified)

    def test_worker_toggle_availability(self):
        self.client.force_authenticate(user=self.w1_user)
        response = self.client.post('/api/workers/toggle_availability/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.w1.refresh_from_db()
        self.assertFalse(self.w1.availability)
