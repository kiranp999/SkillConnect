from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from customers.models import Customer
from workers.models import Worker
from bookings.models import Booking


# ============================================================
# HELPERS
# ============================================================

def is_admin_user(user):
    return (
        getattr(user, "role", None) == "admin"
        or user.is_staff
        or user.is_superuser
    )


def serialize_worker(worker, request=None):
    """Return worker details and absolute URLs for admin verification documents."""
    def document_url(field_name):
        file_field = getattr(worker, field_name, None)
        if not file_field:
            return None
        try:
            url = file_field.url
            return request.build_absolute_uri(url) if request else url
        except (ValueError, AttributeError):
            return None

    return {
        "id": worker.id,
        "full_name": getattr(worker, "full_name", ""),
        "email": getattr(worker, "email", ""),
        "phone": getattr(worker, "phone", ""),
        "district": getattr(worker, "district", ""),
        "state": getattr(worker, "state", ""),
        "city": getattr(worker, "city", ""),
        "ward": getattr(worker, "ward", ""),
        "panchayat": getattr(worker, "panchayat", ""),
        "address": getattr(worker, "address", ""),
        "pincode": getattr(worker, "pincode", ""),
        "about": getattr(worker, "about", ""),
        "skills": getattr(worker, "skills", []) or [],
        "category_name": getattr(worker, "category_name", ""),
        "government_id": document_url("government_id"),
        "trade_certificate": document_url("trade_certificate"),
        "experience_certificate": document_url("experience_certificate"),
        "profile_photo": document_url("profile_photo"),
        "category": (
            getattr(worker.category, "name", "")
            if getattr(worker, "category_id", None)
            else ""
        ),
        "verification_status": getattr(
            worker,
            "verification_status",
            ""
        ),
        "availability": getattr(worker, "availability", False),
        "hourly_rate": float(
            getattr(worker, "hourly_rate", 0) or 0
        ),
        "experience": getattr(worker, "experience", ""),
        "created_at": (
            worker.created_at.isoformat()
            if getattr(worker, "created_at", None)
            else None
        ),
    }


def booking_status_counts():
    """
    Return booking counts using the actual Booking.Status values.
    """

    counts = {
        "pending": 0,
        "accepted": 0,
        "rejected": 0,
        "estimate_submitted": 0,
        "estimate_rejected": 0,
        "estimate_approved": 0,
        "completed": 0,
        "cancelled": 0,
    }

    for booking in Booking.objects.all():
        status_value = str(
            getattr(booking, "booking_status", "")
        ).lower()

        if status_value == "pending":
            counts["pending"] += 1

        elif status_value == "accepted":
            counts["accepted"] += 1

        elif status_value == "rejected":
            counts["rejected"] += 1

        elif status_value == "estimate_submitted":
            counts["estimate_submitted"] += 1

        elif status_value == "estimate_rejected":
            counts["estimate_rejected"] += 1

        elif status_value == "estimate_approved":
            counts["estimate_approved"] += 1

        elif status_value == "completed":
            counts["completed"] += 1

        elif status_value == "cancelled":
            counts["cancelled"] += 1

    return counts


# ============================================================
# CUSTOMER DASHBOARD
# ============================================================

class CustomerDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if getattr(user, "role", None) != "customer":
            return Response(
                {
                    "error": "You do not have permission to access the customer dashboard."
                },
                status=403,
            )

        customer = getattr(
            user,
            "customer_profile",
            None
        )

        if customer is None:
            return Response(
                {
                    "error": "Customer profile was not found."
                },
                status=404,
            )

        bookings = Booking.objects.filter(
            customer=customer
        ).order_by("-created_at")

        booking_counts = {
            "total": bookings.count(),
            "pending": 0,
            "accepted": 0,
            "rejected": 0,
            "estimate_submitted": 0,
            "estimate_rejected": 0,
            "estimate_approved": 0,
            "completed": 0,
            "cancelled": 0,
        }

        for booking in bookings:

            status_value = str(
                getattr(booking, "booking_status", "")
            ).lower()

            if status_value in booking_counts:
                booking_counts[status_value] += 1

        recent_bookings = []

        for booking in bookings[:5]:

            worker = getattr(
                booking,
                "worker",
                None
            )

            recent_bookings.append(
                {
                    "id": booking.id,
                    "booking_code": getattr(
                        booking,
                        "booking_code",
                        ""
                    ),
                    "worker_name": getattr(
                        worker,
                        "full_name",
                        ""
                    ),
                    "booking_status": getattr(
                        booking,
                        "booking_status",
                        ""
                    ),
                    "service_date": str(
                        getattr(
                            booking,
                            "service_date",
                            ""
                        )
                    ),
                    "estimate_amount": float(
                        getattr(
                            booking,
                            "estimate_amount",
                            0
                        )
                        or 0
                    ),
                }
            )

        return Response(
            {
                "customer": {
                    "id": customer.id,
                    "full_name": getattr(
                        customer,
                        "full_name",
                        ""
                    ),
                    "email": getattr(
                        customer,
                        "email",
                        user.email
                    ),
                },
                "booking_counts": booking_counts,
                "recent_bookings": recent_bookings,
            }
        )


# ============================================================
# WORKER DASHBOARD
# ============================================================

class WorkerDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if getattr(user, "role", None) != "worker":
            return Response(
                {
                    "error": "You do not have permission to access the worker dashboard."
                },
                status=403,
            )

        worker = getattr(
            user,
            "worker_profile",
            None
        )

        if worker is None:
            return Response(
                {
                    "error": "Worker profile was not found."
                },
                status=404,
            )

        bookings = Booking.objects.filter(
            worker=worker
        ).order_by("-created_at")

        booking_counts = {
            "total": bookings.count(),
            "pending": 0,
            "accepted": 0,
            "rejected": 0,
            "estimate_submitted": 0,
            "estimate_rejected": 0,
            "estimate_approved": 0,
            "completed": 0,
            "cancelled": 0,
        }

        for booking in bookings:

            status_value = str(
                getattr(booking, "booking_status", "")
            ).lower()

            if status_value in booking_counts:
                booking_counts[status_value] += 1

        pending_jobs = []

        for booking in bookings.filter(
            booking_status="pending"
        )[:10]:

            customer = getattr(
                booking,
                "customer",
                None
            )

            pending_jobs.append(
                {
                    "id": booking.id,
                    "booking_code": getattr(
                        booking,
                        "booking_code",
                        ""
                    ),
                    "customer_name": getattr(
                        customer,
                        "full_name",
                        ""
                    ),
                    "service_date": str(
                        getattr(
                            booking,
                            "service_date",
                            ""
                        )
                    ),
                    "service_time": getattr(
                        booking,
                        "service_time",
                        ""
                    ),
                    "address": getattr(
                        booking,
                        "address",
                        ""
                    ),
                    "notes": getattr(
                        booking,
                        "notes",
                        ""
                    ),
                    "booking_status": getattr(
                        booking,
                        "booking_status",
                        ""
                    ),
                }
            )

        recent_jobs = []

        for booking in bookings[:10]:

            customer = getattr(
                booking,
                "customer",
                None
            )

            recent_jobs.append(
                {
                    "id": booking.id,
                    "booking_code": getattr(
                        booking,
                        "booking_code",
                        ""
                    ),
                    "customer_name": getattr(
                        customer,
                        "full_name",
                        ""
                    ),
                    "service_date": str(
                        getattr(
                            booking,
                            "service_date",
                            ""
                        )
                    ),
                    "booking_status": getattr(
                        booking,
                        "booking_status",
                        ""
                    ),
                    "estimate_amount": float(
                        getattr(
                            booking,
                            "estimate_amount",
                            0
                        )
                        or 0
                    ),
                }
            )

        completed_bookings = bookings.filter(
            booking_status="completed"
        )

        earnings = completed_bookings.aggregate(
            total=Sum("estimate_amount")
        )["total"] or 0

        return Response(
            {
                "worker": serialize_worker(worker, request=request),

                "booking_counts": booking_counts,

                "pending_jobs": pending_jobs,

                "recent_jobs": recent_jobs,

                "earnings": float(earnings),
            }
        )


# ============================================================
# ADMIN DASHBOARD
# ============================================================

class AdminDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if not is_admin_user(user):
            return Response(
                {
                    "error": "You do not have permission to access the admin dashboard."
                },
                status=403,
            )

        # ----------------------------------------------------
        # USERS
        # ----------------------------------------------------

        total_users = User.objects.count()

        total_customers = User.objects.filter(
            role="customer"
        ).count()

        total_workers = User.objects.filter(
            role="worker"
        ).count()

        total_admins = User.objects.filter(
            role="admin"
        ).count()

        active_users = User.objects.filter(
            is_active=True
        ).count()

        # ----------------------------------------------------
        # WORKERS
        # ----------------------------------------------------

        workers = Worker.objects.all()

        verified_workers = workers.filter(
            verification_status__iexact="verified"
        ).count()

        pending_workers_queryset = workers.filter(
            verification_status__iexact="pending"
        )

        pending_workers = pending_workers_queryset.count()

        rejected_workers = workers.filter(
            verification_status__iexact="rejected"
        ).count()

        pending_worker_list = [
            serialize_worker(worker, request=request)
            for worker in pending_workers_queryset.order_by(
                "-created_at"
            )[:20]
        ]

        # ----------------------------------------------------
        # BOOKINGS
        # ----------------------------------------------------

        total_bookings = Booking.objects.count()

        status_counts = booking_status_counts()

        # ----------------------------------------------------
        # REVENUE
        # ----------------------------------------------------

        completed_revenue = (
            Booking.objects.filter(
                booking_status="completed"
            ).aggregate(
                total=Sum("estimate_amount")
            )["total"]
            or 0
        )

        # ----------------------------------------------------
        # RECENT BOOKINGS
        # ----------------------------------------------------

        recent_bookings = []

        for booking in Booking.objects.select_related(
            "customer",
            "worker"
        ).order_by("-created_at")[:10]:

            customer = getattr(
                booking,
                "customer",
                None
            )

            worker = getattr(
                booking,
                "worker",
                None
            )

            recent_bookings.append(
                {
                    "id": booking.id,

                    "booking_code": getattr(
                        booking,
                        "booking_code",
                        ""
                    ),

                    "customer_name": getattr(
                        customer,
                        "full_name",
                        ""
                    ),

                    "worker_name": getattr(
                        worker,
                        "full_name",
                        ""
                    ),

                    "booking_status": getattr(
                        booking,
                        "booking_status",
                        ""
                    ),

                    "service_date": str(
                        getattr(
                            booking,
                            "service_date",
                            ""
                        )
                    ),

                    "estimate_amount": float(
                        getattr(
                            booking,
                            "estimate_amount",
                            0
                        )
                        or 0
                    ),

                    "created_at": (
                        booking.created_at.isoformat()
                        if getattr(
                            booking,
                            "created_at",
                            None
                        )
                        else None
                    ),
                }
            )

        # ----------------------------------------------------
        # PLATFORM ACTIVITY
        # ----------------------------------------------------

        today = timezone.localdate()

        activity = []

        for days_ago in range(6, -1, -1):

            date_value = today - timedelta(
                days=days_ago
            )

            count = Booking.objects.filter(
                created_at__date=date_value
            ).count()

            activity.append(
                {
                    "date": date_value.isoformat(),
                    "count": count,
                }
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                # High-level metrics
                "total_users": total_users,
                "total_customers": total_customers,
                "total_workers": total_workers,
                "total_admins": total_admins,
                "active_users": active_users,

                # Worker verification
                "verified_workers": verified_workers,
                "pending_workers": pending_workers,
                "rejected_workers": rejected_workers,
                "pending_workers_list": pending_worker_list,

                # Frontend currently expects this name
                "pending_workers_data": pending_worker_list,

                # Booking metrics
                "total_bookings": total_bookings,
                "booking_status_counts": status_counts,

                # Compatibility with older frontend code
                "booking_stats": status_counts,

                # Revenue
                "platform_revenue": float(
                    completed_revenue
                ),

                # Recent activity
                "recent_bookings": recent_bookings,
                "activity": activity,

                # Useful summary
                "summary": {
                    "total_users": total_users,
                    "customers": total_customers,
                    "workers": total_workers,
                    "verified_workers": verified_workers,
                    "pending_verification": pending_workers,
                    "bookings": total_bookings,
                },
            }
        )