import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

from categories.models import Category
from workers.models import Worker
from customers.models import Customer
from bookings.models import Booking

User = get_user_model()


class EndToEndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Category.objects.get_or_create(category_id='electrician', defaults={'category_name': 'Electrician'})
        self.admin = User.objects.create_superuser(email='admin@skillconnect.test', password='AdminPass123!')

    def register_customer(self):
        response = self.client.post('/api/auth/register/customer/', {
            'full_name': 'Customer One', 'email': 'customer@skillconnect.test', 'phone': '9999999999', 'password': 'CustomerPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def register_worker(self):
        response = self.client.post('/api/auth/register/worker/', {
            'full_name': 'Worker One', 'email': 'worker@skillconnect.test', 'phone': '8888888888', 'password': 'WorkerPass123!',
            'category_id': 'electrician', 'hourly_rate': '500.00', 'district': 'Test District',
            'government_id': SimpleUploadedFile('id.pdf', b'id', content_type='application/pdf'),
            'trade_certificate': SimpleUploadedFile('trade.pdf', b'trade', content_type='application/pdf'),
        }, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return Worker.objects.get(user__email='worker@skillconnect.test')

    def login(self, email, password, role):
        response = self.client.post('/api/auth/login/', {'email': email, 'password': password, 'role': role}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['tokens']['access']}")
        return response.data

    def test_end_to_end_customer_worker_admin_flow(self):
        customer_data = self.register_customer()
        self.register_worker()

        # Worker cannot log in before verification.
        pending_login = self.client.post('/api/auth/login/', {
            'email': 'worker@skillconnect.test', 'password': 'WorkerPass123!', 'role': 'worker'
        }, format='json')
        self.assertEqual(pending_login.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        workers = self.client.get('/api/workers/pending/')
        self.assertEqual(workers.status_code, status.HTTP_200_OK)
        worker = Worker.objects.get(user__email='worker@skillconnect.test')
        verified = self.client.post(f'/api/workers/{worker.id}/verify/')
        self.assertEqual(verified.status_code, status.HTTP_200_OK)

        # Public worker search now exposes the verified worker.
        self.client.force_authenticate(user=None)
        search = self.client.get('/api/workers/?category=electrician')
        self.assertEqual(search.status_code, status.HTTP_200_OK)
        self.assertTrue(search.data.get('results', search.data))

        self.login('customer@skillconnect.test', 'CustomerPass123!', 'customer')
        profile = self.client.get('/api/auth/profile/')
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        update = self.client.put('/api/auth/profile/', {'full_name': 'Updated Customer', 'phone': '7777777777'}, format='json')
        self.assertEqual(update.status_code, status.HTTP_200_OK)

        booking = self.client.post('/api/bookings/', {
            'worker': worker.id,
            'service_date': (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            'service_time': '10:00 AM - 12:00 PM', 'address': 'Test Address', 'notes': 'Fix a switch',
        }, format='json')
        self.assertEqual(booking.status_code, status.HTTP_201_CREATED)
        booking_id = booking.data['id']
        self.assertEqual(booking.data['estimate_amount'], '0.00')
        self.assertEqual(booking.data['estimate_breakdown'], [])

        my_bookings = self.client.get('/api/bookings/my_bookings/')
        self.assertEqual(my_bookings.status_code, status.HTTP_200_OK)

        self.login('worker@skillconnect.test', 'WorkerPass123!', 'worker')
        my_jobs = self.client.get('/api/bookings/my_jobs/')
        self.assertEqual(my_jobs.status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.post('/api/workers/toggle_availability/').status_code, status.HTTP_200_OK)
        # Put the worker back online so this test does not leave a misleading state in DB.
        self.client.post('/api/workers/toggle_availability/')

        accepted = self.client.post(f'/api/bookings/{booking_id}/accept/')
        self.assertEqual(accepted.status_code, status.HTTP_200_OK)
        estimate = self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '700.00',
            'estimate_breakdown': [{'item': 'Switch Module', 'cost': 500}, {'item': 'Labour', 'cost': 200}],
        }, format='json')
        self.assertEqual(estimate.status_code, status.HTTP_200_OK)

        self.login('customer@skillconnect.test', 'CustomerPass123!', 'customer')
        rejected = self.client.post(f'/api/bookings/{booking_id}/reject_estimate/')
        self.assertEqual(rejected.status_code, status.HTTP_200_OK)

        self.login('worker@skillconnect.test', 'WorkerPass123!', 'worker')
        revised = self.client.post(f'/api/bookings/{booking_id}/submit_estimate/', {
            'estimate_amount': '650.00', 'estimate_breakdown': [{'item': 'Switch Module', 'cost': 450}, {'item': 'Labour', 'cost': 200}],
        }, format='json')
        self.assertEqual(revised.status_code, status.HTTP_200_OK)

        self.login('customer@skillconnect.test', 'CustomerPass123!', 'customer')
        approved = self.client.post(f'/api/bookings/{booking_id}/approve_estimate/')
        self.assertEqual(approved.status_code, status.HTTP_200_OK)
        self.assertEqual(approved.data['booking']['booking_status'], 'Estimate Approved')

        self.login('worker@skillconnect.test', 'WorkerPass123!', 'worker')
        completed = self.client.post(f'/api/bookings/{booking_id}/complete/')
        self.assertEqual(completed.status_code, status.HTTP_200_OK)

        self.login('customer@skillconnect.test', 'CustomerPass123!', 'customer')
        review = self.client.post('/api/reviews/', {'booking': booking_id, 'rating': 4, 'comment': 'Good service'}, format='json')
        self.assertEqual(review.status_code, status.HTTP_201_CREATED)
        duplicate = self.client.post('/api/reviews/', {'booking': booking_id, 'rating': 5, 'comment': 'Duplicate'}, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        customer_dashboard = self.client.get('/api/dashboard/customer/')
        self.assertEqual(customer_dashboard.status_code, status.HTTP_200_OK)

        self.login('admin@skillconnect.test', 'AdminPass123!', 'admin')
        admin_dashboard = self.client.get('/api/dashboard/admin/')
        self.assertEqual(admin_dashboard.status_code, status.HTTP_200_OK)
        all_bookings = self.client.get('/api/bookings/')
        self.assertEqual(all_bookings.status_code, status.HTTP_200_OK)
