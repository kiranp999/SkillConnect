from django.db import models

class Category(models.Model):
    category_id = models.CharField(max_length=50, unique=True, help_text="Slug identifier like electrician, plumber")
    category_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=100, blank=True, default='BsLightningChargeFill')
    color = models.CharField(max_length=30, blank=True, default='#2563eb')
    image = models.ImageField(upload_to='category_images/', null=True, blank=True)
    avg_price = models.CharField(max_length=50, blank=True, default='$25-$45/hr')
    popular_services = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name
