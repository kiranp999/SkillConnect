from django.db import models
from bookings.models import Booking
from customers.models import Customer
from workers.models import Worker

class Review(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='review'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    worker = models.ForeignKey(
        Worker,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.FloatField(default=5.0)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review #{self.id} for {self.worker.full_name} ({self.rating}★)"
