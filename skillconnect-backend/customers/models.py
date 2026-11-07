from django.db import models
from django.conf import settings

class Customer(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, default='')
    ward = models.CharField(max_length=100, blank=True, default='Ward 12')
    panchayat = models.CharField(max_length=100, blank=True, default='Gandhi Nagar')
    district = models.CharField(max_length=100, blank=True, default='Central Metro')
    state = models.CharField(max_length=100, blank=True, default='Karnataka')
    pincode = models.CharField(max_length=20, blank=True, default='560001')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} ({self.email})"
