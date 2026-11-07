import datetime

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


class BookingWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = Category.objects.get_or_create(category_id='plumber', defaults={'category_name': 'Plumber'})[0]

        self.cust_user = User.objects.create_user(email='cust@test.com', password='password123', role=User.Role.CUSTOMER)
        self.customer = Customer.objects.create(
            user=self.cust_user, full_name='Test Customer', email=self.cust_user.email,
            phone='+91 90000 11111', address='123 Test St'
        )

        self.work_user = User.objects.create_user(
            email='work@test.com', password='password123', role=User.Role.WORKER, is_verified=True
        )
        self.worker = Worker.objects.create(
            user=self.work_user, full_name='Test Plumber', email=self.work_user.email,
            phone='+91 90000 22222', category=category, verification_status='Verified', hourly_rate=30.00
        )

    def create_booking(self):
        self.client.force_authenticate(user=self.cust_user)
        response = self.client.post('/api/bookings/', {
            'worker': self.worker.id,
            'service_date': (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d'),
            'service_time': '10:00 AM - 12:00 PM',
            'address': '123 Test St',
            'notes': 'Fix leaking kitchen tap',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['estimate_amount'], '0.00')
        self.assertEqual(response.data['estimate_breakdown'], [])
        return response.data['id']

    def test_full_booking_workflow(self):
        booking_id = self.create_booking()

        self.client.force_authenticate(user=self.work_user)
        accepted = self.client.post(f'/api/bookings/{booking_id}/accept/')
        self.assertEqual(accepted.status_code, status.HTTP_200_OK)

        invalid_total = self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '75.00',
            'estimate_breakdown': [{'item': 'Tap', 'cost': 45}, {'item': 'Labor', 'cost': 20}],
        }, format='json')
        self.assertEqual(invalid_total.status_code, status.HTTP_400_BAD_REQUEST)

        estimate = self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '75.00',
            'estimate_breakdown': [{'item': 'Tap Replacement Unit', 'cost': 45}, {'item': 'Labor Charge', 'cost': 30}],
        }, format='json')
        self.assertEqual(estimate.status_code, status.HTTP_200_OK)
        self.assertEqual(estimate.data['booking']['booking_status'], 'Estimate Submitted')

        self.client.force_authenticate(user=self.cust_user)
        approved = self.client.post(f'/api/bookings/{booking_id}/approve_estimate/')
        self.assertEqual(approved.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.work_user)
        completed = self.client.post(f'/api/bookings/{booking_id}/complete/')
        self.assertEqual(completed.status_code, status.HTTP_200_OK)
        self.assertEqual(completed.data['booking']['booking_status'], 'Completed')

        self.client.force_authenticate(user=self.cust_user)
        review = self.client.post('/api/reviews/', {
            'booking': booking_id, 'rating': 5, 'comment': 'Excellent work.'
        }, format='json')
        self.assertEqual(review.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

        self.worker.refresh_from_db()
        self.assertEqual(self.worker.completed_jobs_count, 1)
        self.assertEqual(self.worker.average_rating, 5.0)

    def test_customer_can_reject_and_worker_can_resubmit(self):
        booking_id = self.create_booking()
        self.client.force_authenticate(user=self.work_user)
        self.client.post(f'/api/bookings/{booking_id}/accept/')
        self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '50.00', 'estimate_breakdown': [{'item': 'Labor', 'cost': 50}],
        }, format='json')

        self.client.force_authenticate(user=self.cust_user)
        rejected = self.client.post(f'/api/bookings/{booking_id}/reject_estimate/')
        self.assertEqual(rejected.status_code, status.HTTP_200_OK)
        self.assertEqual(rejected.data['booking']['booking_status'], 'Estimate Rejected')

        self.client.force_authenticate(user=self.work_user)
        revised = self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '60.00', 'estimate_breakdown': [{'item': 'Labor', 'cost': 60}],
        }, format='json')
        self.assertEqual(revised.status_code, status.HTTP_200_OK)

    def test_worker_cannot_access_another_workers_booking_action(self):
        booking_id = self.create_booking()
        other_user = User.objects.create_user(email='other@test.com', password='password123', role=User.Role.WORKER, is_verified=True)
        other_worker = Worker.objects.create(
            user=other_user, full_name='Other', email=other_user.email, phone='123',
            verification_status='Verified'
        )
        self.client.force_authenticate(user=other_user)
        response = self.client.post(f'/api/bookings/{booking_id}/accept/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
