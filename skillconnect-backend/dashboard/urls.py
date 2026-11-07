from django.urls import path

from .views import (
    CustomerDashboardView,
    WorkerDashboardView,
    AdminDashboardView,
)


urlpatterns = [
    path(
        "customer/",
        CustomerDashboardView.as_view(),
        name="customer-dashboard",
    ),

    path(
        "worker/",
        WorkerDashboardView.as_view(),
        name="worker-dashboard",
    ),

    path(
        "admin/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),
]