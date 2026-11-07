from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from categories.models import Category
from categories.serializers import CategorySerializer
from core.permissions import IsAdminUserRole

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['category_name', 'description', 'category_id']
    ordering_fields = ['category_name', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]
