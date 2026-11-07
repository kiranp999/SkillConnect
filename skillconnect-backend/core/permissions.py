from rest_framework.permissions import BasePermission
from accounts.models import User

class IsCustomer(BasePermission):
    """
    Permission check for Customer role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.CUSTOMER
        )

class IsWorker(BasePermission):
    """
    Permission check for Worker role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == User.Role.WORKER
        )

class IsAdminUserRole(BasePermission):
    """
    Permission check for Admin role or Superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )
