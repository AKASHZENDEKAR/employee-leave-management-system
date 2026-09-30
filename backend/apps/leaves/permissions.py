from rest_framework.permissions import BasePermission


class IsManager(BasePermission):
    message = "Manager access is required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.MANAGER
        )


class IsEmployee(BasePermission):
    message = "Employee access is required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.EMPLOYEE
        )


class IsEmployeeOwner(BasePermission):
    message = "You can only manage your own leave request."

    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_authenticated
            and obj.employee_id == request.user.id
        )