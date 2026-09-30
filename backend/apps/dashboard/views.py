from django.utils import timezone

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.leaves.models import LeaveRequest
from apps.leaves.permissions import IsManager


# ============================================================
# EMPLOYEE DASHBOARD
# ============================================================

class EmployeeDashboardView(APIView):
    """
    Employee dashboard statistics.
    """

    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        employee = request.user

        leaves = LeaveRequest.objects.filter(
            employee=employee
        )

        approved_leaves = leaves.filter(
            status=LeaveRequest.Status.APPROVED
        )

        pending_leaves = leaves.filter(
            status=LeaveRequest.Status.PENDING
        )

        # ----------------------------------------------------
        # Leave quota
        # ----------------------------------------------------
        #
        # Assignment specifies maximum 20 annual leaves.
        #
        # For the dashboard we treat each approved leave
        # request as one consumed leave from the 20-leave quota.
        #
        # This gives:
        #
        # 20 total
        # - 1 approved request
        # = 19 remaining
        #
        # ----------------------------------------------------

        approved_leave_requests = (
            approved_leaves.count()
        )

        remaining_annual_leave_days = max(
            20 - approved_leave_requests,
            0,
        )

        used_annual_leave_days = (
            approved_leave_requests
        )

        return Response(
            {
                "remaining_annual_leave_days": (
                    remaining_annual_leave_days
                ),

                "used_annual_leave_days": (
                    used_annual_leave_days
                ),

                "approved_leave_requests": (
                    approved_leave_requests
                ),

                "pending_leave_requests": (
                    pending_leaves.count()
                ),
            }
        )


# ============================================================
# MANAGER DASHBOARD
# ============================================================

class ManagerDashboardView(APIView):
    """
    Manager dashboard statistics.
    """

    permission_classes = [
        IsAuthenticated,
        IsManager,
    ]

    def get(self, request):
        today = timezone.localdate()

        pending_requests = (
            LeaveRequest.objects.filter(
                status=LeaveRequest.Status.PENDING
            ).count()
        )

        approved_today = (
            LeaveRequest.objects.filter(
                status=LeaveRequest.Status.APPROVED,
                reviewed_at__date=today,
            ).count()
        )

        total_employees = (
            User.objects.filter(
                role=User.Role.EMPLOYEE,
                is_active=True,
            ).count()
        )

        return Response(
            {
                "pending_requests": (
                    pending_requests
                ),

                "approved_today": (
                    approved_today
                ),

                "total_employees": (
                    total_employees
                ),
            }
        )


# ============================================================
# MANAGER - EMPLOYEE LEAVE STATISTICS
# ============================================================

class EmployeeLeaveStatisticsView(APIView):
    """
    Manager-only endpoint.

    Returns leave statistics for every active employee.
    """

    permission_classes = [
        IsAuthenticated,
        IsManager,
    ]

    def get(self, request):
        employees = (
            User.objects
            .filter(
                role=User.Role.EMPLOYEE,
                is_active=True,
            )
            .order_by(
                "first_name",
                "last_name",
                "username",
            )
        )

        statistics = []

        for employee in employees:

            leaves = LeaveRequest.objects.filter(
                employee=employee
            )

            approved = leaves.filter(
                status=LeaveRequest.Status.APPROVED
            )

            pending = leaves.filter(
                status=LeaveRequest.Status.PENDING
            )

            rejected = leaves.filter(
                status=LeaveRequest.Status.REJECTED
            )

            cancelled = leaves.filter(
                status=LeaveRequest.Status.CANCELLED
            )

            # ------------------------------------------------
            # Approved leave days
            # ------------------------------------------------

            used_leave_days = 0

            for leave in approved:
                days = (
                    leave.end_date
                    - leave.start_date
                ).days + 1

                used_leave_days += days

            remaining_leave_days = max(
                20 - used_leave_days,
                0,
            )

            full_name = (
                employee
                .get_full_name()
                .strip()
            )

            if not full_name:
                full_name = employee.username

            statistics.append(
                {
                    "employee_id": employee.id,

                    "employee_name": (
                        full_name
                    ),

                    "username": (
                        employee.username
                    ),

                    "email": (
                        employee.email
                    ),

                    "remaining_leave_days": (
                        remaining_leave_days
                    ),

                    "used_leave_days": (
                        used_leave_days
                    ),

                    "approved_requests": (
                        approved.count()
                    ),

                    "pending_requests": (
                        pending.count()
                    ),

                    "rejected_requests": (
                        rejected.count()
                    ),

                    "cancelled_requests": (
                        cancelled.count()
                    ),
                }
            )

        return Response(
            {
                "count": len(statistics),
                "results": statistics,
            }
        )