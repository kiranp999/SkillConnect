from django.core.validators import MinValueValidator
from django.db import models
from customers.models import Customer
from workers.models import Worker


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        ACCEPTED = 'Accepted', 'Accepted'
        REJECTED = 'Rejected', 'Rejected'
        ESTIMATE_SUBMITTED = 'Estimate Submitted', 'Estimate Submitted'
        ESTIMATE_REJECTED = 'Estimate Rejected', 'Estimate Rejected'
        ESTIMATE_APPROVED = 'Estimate Approved', 'Estimate Approved'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'

    booking_code = models.CharField(max_length=30, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='bookings')
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='bookings')

    booking_date = models.DateField(auto_now_add=True)
    service_date = models.DateField()
    service_time = models.CharField(max_length=50, default='10:00 AM - 12:00 PM')
    address = models.TextField()
    notes = models.TextField(blank=True, default='')

    # IMPORTANT: a new booking has no estimate. The worker creates it later.
    estimate_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    estimate_breakdown = models.JSONField(default=list, blank=True)
    booking_status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
    )
    timeline = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.booking_code} - {self.customer.full_name} -> {self.worker.full_name} [{self.booking_status}]"
