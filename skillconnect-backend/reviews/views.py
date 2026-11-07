from django.db.models import Avg
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.models import Booking
from core.permissions import IsCustomer
from reviews.models import Review
from reviews.serializers import ReviewCreateSerializer, ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('customer', 'worker', 'booking')
    serializer_class = ReviewSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_worker']:
            return [permissions.AllowAny()]
        return [IsCustomer()]

    def create(self, request, *args, **kwargs):
        customer = getattr(request.user, 'customer_profile', None)
        if not customer:
            return Response({'error': 'Only customer accounts can submit reviews.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.validated_data['booking']

        if booking.customer_id != customer.id:
            return Response({'error': 'Booking not found or not owned by you.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.booking_status != Booking.Status.COMPLETED:
            return Response({'error': 'You can review a service only after it is completed.'}, status=status.HTTP_400_BAD_REQUEST)
        if Review.objects.filter(booking=booking).exists():
            return Response({'error': 'Review already submitted for this booking.'}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            booking=booking,
            customer=customer,
            worker=booking.worker,
            rating=serializer.validated_data['rating'],
            comment=serializer.validated_data['comment'],
        )

        worker = booking.worker
        stats = Review.objects.filter(worker=worker).aggregate(avg=Avg('rating'))
        worker.average_rating = round(float(stats['avg'] or 0), 2)
        worker.reviews_count = Review.objects.filter(worker=worker).count()
        worker.save(update_fields=['average_rating', 'reviews_count', 'updated_at'])

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path=r'worker/(?P<worker_id>[^/.]+)')
    def by_worker(self, request, worker_id=None):
        reviews = self.queryset.filter(worker_id=worker_id)
        return Response(self.get_serializer(reviews, many=True).data)
