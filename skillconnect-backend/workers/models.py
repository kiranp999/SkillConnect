from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from categories.models import Category

class Worker(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        VERIFIED = 'Verified', 'Verified'
        REJECTED = 'Rejected', 'Rejected'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='worker_profile'
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workers'
    )
    category_name = models.CharField(max_length=100, blank=True, default='')
    experience = models.CharField(max_length=50, default='5 Years')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=30.00, validators=[MinValueValidator(0)])
    
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    banner_photo = models.ImageField(upload_to='banner_photos/', null=True, blank=True)
    government_id = models.FileField(upload_to='government_ids/', null=True, blank=True)
    trade_certificate = models.FileField(upload_to='trade_certificates/', null=True, blank=True)
    experience_certificate = models.FileField(upload_to='experience_certificates/', null=True, blank=True)
    
    availability = models.BooleanField(default=True)
    address = models.TextField(blank=True, default='')
    ward = models.CharField(max_length=100, blank=True, default='')
    panchayat = models.CharField(max_length=100, blank=True, default='')
    district = models.CharField(max_length=100, blank=True, default='Central Metro')
    state = models.CharField(max_length=100, blank=True, default='Karnataka')
    pincode = models.CharField(max_length=20, blank=True, default='560001')
    
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_workers'
    )
    verified_date = models.DateTimeField(null=True, blank=True)
    
    average_rating = models.FloatField(default=5.0)
    reviews_count = models.IntegerField(default=0)
    completed_jobs_count = models.IntegerField(default=0)
    
    about = models.TextField(blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    certifications_list = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.category_name or 'General'} [{self.verification_status}]"
