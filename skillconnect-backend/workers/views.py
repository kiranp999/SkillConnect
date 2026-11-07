from django.db import models
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsAdminUserRole, IsWorker
from workers.models import Worker
from workers.serializers import WorkerSerializer


class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.select_related('category', 'user').order_by('-created_at')
    serializer_class = WorkerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['district', 'availability', 'verification_status']
    search_fields = ['full_name', 'category_name', 'skills', 'district', 'about']
    ordering_fields = ['average_rating', 'completed_jobs_count', 'hourly_rate', 'created_at']

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and (user.role == 'admin' or user.is_staff or user.is_superuser):
            return self.queryset

        # A worker can always access their own profile, even while pending/rejected.
        if user.is_authenticated and user.role == 'worker' and hasattr(user, 'worker_profile'):
            if self.action in {'retrieve', 'update', 'partial_update', 'destroy', 'toggle_availability'}:
                return self.queryset.filter(pk=user.worker_profile.pk)

        queryset = self.queryset.filter(verification_status=Worker.VerificationStatus.VERIFIED)

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(
                models.Q(category__category_id=category_slug) |
                models.Q(category_name__iexact=category_slug)
            )

        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except (TypeError, ValueError):
                pass

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'toggle_availability':
            return [IsWorker()]
        if self.action in ['verify', 'reject', 'pending']:
            return [IsAdminUserRole()]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        if self.action == 'destroy':
            return [IsAdminUserRole()]
        return [IsAdminUserRole()]

    def _ensure_self_or_admin(self, request, worker):
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'admin':
            return True
        return request.user.role == 'worker' and hasattr(request.user, 'worker_profile') and worker.id == request.user.worker_profile.id

    def update(self, request, *args, **kwargs):
        worker = self.get_object()
        if not self._ensure_self_or_admin(request, worker):
            return Response({'error': 'You are not authorized to edit this worker profile.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == 'worker' and not (request.user.is_staff or request.user.is_superuser):
            # Workers cannot self-verify or modify protected moderation/stat fields.
            protected = {'verification_status', 'verified_by', 'verified_date', 'average_rating', 'reviews_count', 'completed_jobs_count', 'user'}
            data = request.data.copy()
            for field in protected:
                data.pop(field, None)
            serializer = self.get_serializer(worker, data=data, partial=kwargs.get('partial', False))
        else:
            serializer = self.get_serializer(worker, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUserRole])
    def pending(self, request):
        workers = self.queryset.filter(verification_status=Worker.VerificationStatus.PENDING).order_by('created_at')
        return Response(self.get_serializer(workers, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def verify(self, request, pk=None):
        worker = self.get_object()
        worker.verification_status = Worker.VerificationStatus.VERIFIED
        worker.verified_by = request.user
        worker.verified_date = timezone.now()
        worker.save(update_fields=['verification_status', 'verified_by', 'verified_date', 'updated_at'])
        worker.user.is_verified = True
        worker.user.save(update_fields=['is_verified', 'updated_at'])
        return Response({'message': f'Worker {worker.full_name} verified successfully.', 'worker': WorkerSerializer(worker).data})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        worker = self.get_object()
        worker.verification_status = Worker.VerificationStatus.REJECTED
        worker.verified_by = request.user
        worker.verified_date = timezone.now()
        worker.save(update_fields=['verification_status', 'verified_by', 'verified_date', 'updated_at'])
        worker.user.is_verified = False
        worker.user.save(update_fields=['is_verified', 'updated_at'])
        return Response({'message': f'Worker {worker.full_name} verification rejected.', 'worker': WorkerSerializer(worker).data})

    @action(detail=False, methods=['post'], permission_classes=[IsWorker])
    def toggle_availability(self, request):
        worker = request.user.worker_profile
        if worker.verification_status != Worker.VerificationStatus.VERIFIED:
            return Response({'error': 'Your worker account must be verified before changing availability.'}, status=status.HTTP_403_FORBIDDEN)
        worker.availability = not worker.availability
        worker.save(update_fields=['availability', 'updated_at'])
        return Response({'message': f'Availability set to {worker.availability}', 'availability': worker.availability})
