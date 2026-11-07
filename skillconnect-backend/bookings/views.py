import secrets

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.models import Booking
from bookings.serializers import BookingCreateSerializer, BookingSerializer, EstimateSubmitSerializer
from core.permissions import IsCustomer, IsWorker


def now_label():
    return timezone.localtime().strftime('%Y-%m-%d %I:%M %p')


def set_timeline_step(timeline, contains, done=None, timestamp=None):
    for step in timeline:
        if contains.lower() in str(step.get('status', '')).lower():
            if done is not None:
                step['done'] = done
            if timestamp is not None:
                step['timestamp'] = timestamp


def new_booking_code():
    # Cryptographically random and collision-safe because booking_code is unique.
    for _ in range(20):
        code = f'SKC-{secrets.randbelow(900000) + 100000}'
        if not Booking.objects.filter(booking_code=code).exists():
            return code
    raise RuntimeError('Unable to generate a unique booking code.')


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('customer', 'worker', 'worker__category')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']
    filterset_fields = ['booking_status']
    search_fields = ['booking_code', 'address', 'notes', 'worker__full_name', 'customer__full_name']
    ordering_fields = ['created_at', 'service_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin' or user.is_staff or user.is_superuser:
            return self.queryset
        if user.role == 'customer' and hasattr(user, 'customer_profile'):
            return self.queryset.filter(customer=user.customer_profile)
        if user.role == 'worker' and hasattr(user, 'worker_profile'):
            return self.queryset.filter(worker=user.worker_profile)
        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'customer_profile'):
            return Response({'error': 'Only customer accounts can create service bookings.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        worker = serializer.validated_data['worker']

        # Customers can book only verified and currently available workers.
        if worker.verification_status != worker.VerificationStatus.VERIFIED:
            return Response({'error': 'This worker has not been verified by the administrator.'}, status=status.HTTP_400_BAD_REQUEST)
        if not worker.availability:
            return Response({'error': 'This worker is currently unavailable.'}, status=status.HTTP_400_BAD_REQUEST)

        timeline = [
            {'status': 'Request Created', 'timestamp': now_label(), 'done': True},
            {'status': 'Worker Reviewing', 'timestamp': 'Pending', 'done': False},
            {'status': 'Estimate Prepared', 'timestamp': 'Pending', 'done': False},
            {'status': 'Work In Progress', 'timestamp': 'Pending', 'done': False},
            {'status': 'Completed & Paid', 'timestamp': 'Pending', 'done': False},
        ]

        booking = Booking.objects.create(
            booking_code=new_booking_code(),
            customer=request.user.customer_profile,
            worker=worker,
            service_date=serializer.validated_data['service_date'],
            service_time=serializer.validated_data.get('service_time', '10:00 AM - 12:00 PM'),
            address=serializer.validated_data['address'],
            notes=serializer.validated_data.get('notes', ''),
            estimate_amount=0,
            estimate_breakdown=[],
            booking_status=Booking.Status.PENDING,
            timeline=timeline,
        )
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsCustomer])
    def my_bookings(self, request):
        bookings = self.get_queryset().order_by('-created_at')
        return Response(self.get_serializer(bookings, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsWorker])
    def my_jobs(self, request):
        bookings = self.get_queryset().order_by('-created_at')
        return Response(self.get_serializer(bookings, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsWorker])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.worker_id != request.user.worker_profile.id:
            return Response({'error': 'You are not authorized to accept this booking.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status != Booking.Status.PENDING:
            return Response({'error': 'Only pending bookings can be accepted.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.booking_status = Booking.Status.ACCEPTED
        set_timeline_step(booking.timeline, 'Worker Reviewing', True, now_label())
        booking.save(update_fields=['booking_status', 'timeline', 'updated_at'])
        return Response({'message': 'Booking accepted.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[IsWorker])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.worker_id != request.user.worker_profile.id:
            return Response({'error': 'You are not authorized to reject this booking.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status != Booking.Status.PENDING:
            return Response({'error': 'Only pending bookings can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.booking_status = Booking.Status.REJECTED
        set_timeline_step(booking.timeline, 'Worker Reviewing', True, now_label())
        booking.save(update_fields=['booking_status', 'timeline', 'updated_at'])
        return Response({'message': 'Booking rejected.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[IsWorker])
    def submit_estimate(self, request, pk=None):
        booking = self.get_object()
        if booking.worker_id != request.user.worker_profile.id:
            return Response({'error': 'You are not authorized to submit an estimate for this booking.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status not in [Booking.Status.ACCEPTED, Booking.Status.ESTIMATE_REJECTED]:
            return Response({'error': 'The booking must be accepted before submitting an estimate.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EstimateSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking.estimate_amount = serializer.validated_data['estimate_amount']
        booking.estimate_breakdown = serializer.validated_data['estimate_breakdown']
        booking.booking_status = Booking.Status.ESTIMATE_SUBMITTED
        set_timeline_step(booking.timeline, 'Estimate Prepared', True, now_label())
        booking.save(update_fields=['estimate_amount', 'estimate_breakdown', 'booking_status', 'timeline', 'updated_at'])
        return Response({'message': 'Estimate submitted successfully.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer])
    def approve_estimate(self, request, pk=None):
        booking = self.get_object()
        if booking.customer_id != request.user.customer_profile.id:
            return Response({'error': 'You are not authorized to approve this estimate.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status != Booking.Status.ESTIMATE_SUBMITTED:
            return Response({'error': 'There is no estimate waiting for approval.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.estimate_amount <= 0 or not booking.estimate_breakdown:
            return Response({'error': 'The worker has not submitted a valid estimate yet.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.booking_status = Booking.Status.ESTIMATE_APPROVED
        set_timeline_step(booking.timeline, 'Estimate Prepared', True, now_label())
        set_timeline_step(booking.timeline, 'Work In Progress', False, 'Ready to Start')
        booking.save(update_fields=['booking_status', 'timeline', 'updated_at'])
        return Response({'message': 'Estimate approved successfully.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[IsCustomer])
    def reject_estimate(self, request, pk=None):
        booking = self.get_object()
        if booking.customer_id != request.user.customer_profile.id:
            return Response({'error': 'You are not authorized to reject this estimate.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status != Booking.Status.ESTIMATE_SUBMITTED:
            return Response({'error': 'There is no estimate waiting for rejection.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.booking_status = Booking.Status.ESTIMATE_REJECTED
        set_timeline_step(booking.timeline, 'Estimate Prepared', False, now_label())
        booking.save(update_fields=['booking_status', 'timeline', 'updated_at'])
        return Response({'message': 'Estimate rejected. The worker can submit a revised estimate.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[IsWorker])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if booking.worker_id != request.user.worker_profile.id:
            return Response({'error': 'You are not authorized to complete this booking.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.booking_status != Booking.Status.ESTIMATE_APPROVED:
            return Response({'error': 'The estimate must be approved before completing the service.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            booking.booking_status = Booking.Status.COMPLETED
            for step in booking.timeline:
                step['done'] = True
                if 'Completed & Paid' in str(step.get('status', '')):
                    step['timestamp'] = now_label()
            booking.save(update_fields=['booking_status', 'timeline', 'updated_at'])
            worker = booking.worker
            worker.completed_jobs_count = Booking.objects.filter(
                worker=worker, booking_status=Booking.Status.COMPLETED
            ).count()
            worker.save(update_fields=['completed_jobs_count', 'updated_at'])

        return Response({'message': 'Service job marked as completed.', 'booking': BookingSerializer(booking).data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        is_customer = hasattr(request.user, 'customer_profile') and booking.customer_id == request.user.customer_profile.id
        is_worker = hasattr(request.user, 'worker_profile') and booking.worker_id == request.user.worker_profile.id
        is_admin = request.user.is_staff or request.user.is_superuser or request.user.role == 'admin'

        if not (is_customer or is_worker or is_admin):
            return Response({'error': 'You are not authorized to cancel this booking.'}, status=status.HTTP_403_FORBIDDEN)

        cancellable = {
            Booking.Status.PENDING,
            Booking.Status.ACCEPTED,
            Booking.Status.ESTIMATE_SUBMITTED,
            Booking.Status.ESTIMATE_REJECTED,
            Booking.Status.ESTIMATE_APPROVED,
        }
        if not is_admin and booking.booking_status not in cancellable:
            return Response({'error': 'This booking can no longer be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.booking_status in [Booking.Status.COMPLETED, Booking.Status.REJECTED, Booking.Status.CANCELLED]:
            return Response({'error': 'This booking can no longer be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.booking_status = Booking.Status.CANCELLED
        booking.save(update_fields=['booking_status', 'updated_at'])
        return Response({'message': 'Booking cancelled.', 'booking': BookingSerializer(booking).data})
