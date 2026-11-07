from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from bookings.models import Booking
from categories.models import Category
from customers.models import Customer
from reviews.models import Review
from workers.models import Worker

User = get_user_model()


class ReviewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = Category.objects.get_or_create(category_id='plumber', defaults={'category_name': 'Plumber'})[0]
        cu = User.objects.create_user(email='customer@test.com', password='password123', role=User.Role.CUSTOMER)
        self.customer = Customer.objects.create(user=cu, full_name='Customer', email=cu.email, phone='123')
        wu = User.objects.create_user(email='worker@test.com', password='password123', role=User.Role.WORKER, is_verified=True)
        self.worker = Worker.objects.create(user=wu, full_name='Worker', email=wu.email, phone='456', category=category, verification_status='Verified')
        self.booking = Booking.objects.create(
            booking_code='SKC-111111', customer=self.customer, worker=self.worker,
            service_date='2026-09-25', service_time='10:00 AM - 12:00 PM', address='Test',
            estimate_amount=50, estimate_breakdown=[{'item': 'Labor', 'cost': 50}], booking_status=Booking.Status.PENDING
        )
        self.client.force_authenticate(user=cu)

    def test_cannot_review_before_completion(self):
        response = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 5, 'comment': 'Good'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_completed_booking_can_be_reviewed_once(self):
        self.booking.booking_status = Booking.Status.COMPLETED
        self.booking.save(update_fields=['booking_status'])
        response = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 4.5, 'comment': 'Good service'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post('/api/reviews/', {'booking': self.booking.id, 'rating': 5, 'comment': 'Again'}, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
