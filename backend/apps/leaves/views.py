from django.db import transaction
from django.utils import timezone

import django_filters

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LeaveRequest
from .permissions import IsEmployee, IsManager
from .serializers import (
    LeaveRequestSerializer,
    LeaveReviewSerializer,
)


# ============================================================
# FILTERS
# ============================================================

class LeaveRequestFilter(django_filters.FilterSet):
    """
    Filters supported by the leave request API.
    """

    status = django_filters.ChoiceFilter(
        field_name="status",
        choices=LeaveRequest.Status.choices,
    )

    leave_type = django_filters.ChoiceFilter(
        field_name="leave_type",
        choices=LeaveRequest.LeaveType.choices,
    )

    employee = django_filters.NumberFilter(
        field_name="employee_id",
    )

    class Meta:
        model = LeaveRequest
        fields = [
            "status",
            "leave_type",
            "employee",
        ]


# ============================================================
# LEAVE REQUEST VIEWSET
# ============================================================

class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    Leave management API.

    Employee:
        - View own leave requests
        - Create leave request
        - Cancel own pending request

    Manager:
        - View all leave requests
        - Search requests
        - Filter requests
        - Order requests
        - Approve pending requests
        - Reject pending requests
    """

    serializer_class = LeaveRequestSerializer

    # We intentionally do not expose PUT, PATCH or DELETE.
    # State changes happen through controlled actions.
    http_method_names = [
        "get",
        "post",
        "head",
        "options",
    ]

    # --------------------------------------------------------
    # Filtering
    # --------------------------------------------------------

    filterset_class = LeaveRequestFilter

    # --------------------------------------------------------
    # Search
    # --------------------------------------------------------

    search_fields = [
        "employee__username",
        "employee__first_name",
        "employee__last_name",
        "employee__email",
        "reason",
    ]

    # --------------------------------------------------------
    # Ordering
    # --------------------------------------------------------

    ordering_fields = [
        "created_at",
        "start_date",
        "end_date",
        "status",
    ]

    ordering = [
        "-created_at",
    ]

    # --------------------------------------------------------
    # Queryset
    # --------------------------------------------------------

    def get_queryset(self):
        """
        Managers can see all leave requests.

        Employees can see only their own leave requests.
        """

        # Swagger schema generation
        if getattr(self, "swagger_fake_view", False):
            return LeaveRequest.objects.none()

        user = self.request.user

        if not user.is_authenticated:
            return LeaveRequest.objects.none()

        queryset = (
            LeaveRequest.objects
            .select_related(
                "employee",
                "reviewed_by",
            )
        )

        # Manager -> all leave requests
        if user.role == user.Role.MANAGER:
            return queryset

        # Employee -> own leave requests only
        return queryset.filter(
            employee=user
        )

    # --------------------------------------------------------
    # Permissions
    # --------------------------------------------------------

    def get_permissions(self):
        """
        Apply role-based permissions.
        """

        # Creating a leave request
        if self.action == "create":
            return [
                IsAuthenticated(),
                IsEmployee(),
            ]

        # Manager approval/rejection
        if self.action in [
            "approve",
            "reject",
        ]:
            return [
                IsAuthenticated(),
                IsManager(),
            ]

        # Employee cancellation
        if self.action == "cancel":
            return [
                IsAuthenticated(),
                IsEmployee(),
            ]

        # GET requests
        return [
            IsAuthenticated(),
        ]

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    def perform_create(self, serializer):
        """
        Never trust employee ID from frontend.

        The authenticated employee becomes the owner.
        """

        serializer.save(
            employee=self.request.user
        )

    # --------------------------------------------------------
    # CANCEL
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
    )
    def cancel(self, request, pk=None):
        """
        Cancel a pending leave request.

        Only the employee who created it can cancel it.
        """

        with transaction.atomic():

            # IMPORTANT:
            # Do not select_related("reviewed_by") here.
            #
            # reviewed_by is nullable and PostgreSQL does not
            # allow FOR UPDATE on the nullable side of an
            # OUTER JOIN.
            leave = (
                LeaveRequest.objects
                .select_for_update()
                .select_related(
                    "employee",
                )
                .filter(pk=pk)
                .first()
            )

            if leave is None:
                return Response(
                    {
                        "detail": "Leave request not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            if leave.employee_id != request.user.id:
                return Response(
                    {
                        "detail": (
                            "You can only cancel "
                            "your own leave request."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if leave.status != LeaveRequest.Status.PENDING:
                return Response(
                    {
                        "detail": (
                            "Only pending leave requests "
                            "can be cancelled."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            leave.status = (
                LeaveRequest.Status.CANCELLED
            )

            leave.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        serializer = LeaveRequestSerializer(
            leave,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # APPROVE
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
    )
    def approve(self, request, pk=None):
        """
        Approve a pending leave request.

        A manager can approve only a pending request.

        Approved-date overlap is checked again at approval
        time before changing the status.
        """

        review_serializer = LeaveReviewSerializer(
            data=request.data
        )

        review_serializer.is_valid(
            raise_exception=True
        )

        manager_comment = (
            review_serializer.validated_data.get(
                "manager_comment",
                "",
            )
        )

        with transaction.atomic():

            # IMPORTANT:
            # Keep employee because it is a required FK.
            # Do NOT join nullable reviewed_by while locking.
            leave = (
                LeaveRequest.objects
                .select_for_update()
                .select_related(
                    "employee",
                )
                .filter(pk=pk)
                .first()
            )

            if leave is None:
                return Response(
                    {
                        "detail": "Leave request not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            if leave.status != LeaveRequest.Status.PENDING:
                return Response(
                    {
                        "detail": (
                            "Only pending leave requests "
                            "can be approved."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Re-check overlap with another approved leave.
            overlapping_approved = (
                LeaveRequest.objects
                .filter(
                    employee=leave.employee,
                    status=LeaveRequest.Status.APPROVED,
                    start_date__lte=leave.end_date,
                    end_date__gte=leave.start_date,
                )
                .exclude(
                    pk=leave.pk
                )
                .exists()
            )

            if overlapping_approved:
                return Response(
                    {
                        "detail": (
                            "This leave request overlaps "
                            "with an existing approved leave."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            leave.status = (
                LeaveRequest.Status.APPROVED
            )

            leave.reviewed_by = request.user

            leave.reviewed_at = timezone.now()

            leave.manager_comment = manager_comment

            leave.save()

        serializer = LeaveRequestSerializer(
            leave,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # REJECT
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
    )
    def reject(self, request, pk=None):
        """
        Reject a pending leave request.

        A manager can reject only a pending request.
        """

        review_serializer = LeaveReviewSerializer(
            data=request.data
        )

        review_serializer.is_valid(
            raise_exception=True
        )

        manager_comment = (
            review_serializer.validated_data.get(
                "manager_comment",
                "",
            )
        )

        with transaction.atomic():

            # IMPORTANT:
            # Do not use select_related("reviewed_by")
            # together with select_for_update().
            leave = (
                LeaveRequest.objects
                .select_for_update()
                .select_related(
                    "employee",
                )
                .filter(pk=pk)
                .first()
            )

            if leave is None:
                return Response(
                    {
                        "detail": "Leave request not found."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            if leave.status != LeaveRequest.Status.PENDING:
                return Response(
                    {
                        "detail": (
                            "Only pending leave requests "
                            "can be rejected."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            leave.status = (
                LeaveRequest.Status.REJECTED
            )

            leave.reviewed_by = request.user

            leave.reviewed_at = timezone.now()

            leave.manager_comment = manager_comment

            leave.save()

        serializer = LeaveRequestSerializer(
            leave,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )