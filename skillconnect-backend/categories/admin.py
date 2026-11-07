from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'category_id', 'description', 'avg_price', 'created_at')
    search_fields = ('category_name', 'category_id', 'description')
    ordering = ('category_name',)
    readonly_fields = ('created_at', 'updated_at')
