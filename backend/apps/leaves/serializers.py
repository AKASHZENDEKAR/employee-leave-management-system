from datetime import date

from django.utils import timezone
from rest_framework import serializers

from .models import LeaveRequest


class LeaveRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and viewing employee leave requests.

    Business rules:
    1. Cannot apply for past dates.
    2. End date cannot be before start date.
    3. Maximum 20 annual leave days per calendar year.
    4. Approved leave dates cannot overlap.
    """

    employee_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()

    class Meta:
        model = LeaveRequest

        fields = [
            "id",
            "employee",
            "employee_name",
            "leave_type",
            "start_date",
            "end_date",
            "total_days",
            "reason",
            "status",
            "reviewed_by",
            "reviewed_by_name",
            "manager_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "employee",
            "employee_name",
            "total_days",
            "status",
            "reviewed_by",
            "reviewed_by_name",
            "manager_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]

    def get_employee_name(self, obj) -> str:
        """
        Return employee full name.
        Fall back to username when full name is not configured.
        """
        full_name = obj.employee.get_full_name().strip()

        if full_name:
            return full_name

        return obj.employee.username

    def get_reviewed_by_name(self, obj):
        """
        Return manager full name.
        Fall back to username when full name is not configured.
        """
        if not obj.reviewed_by:
            return None

        full_name = obj.reviewed_by.get_full_name().strip()

        if full_name:
            return full_name

        return obj.reviewed_by.username

    def get_total_days(self, obj) -> int:
        """Return inclusive number of leave days."""
        return (obj.end_date - obj.start_date).days + 1

    def _get_days_in_year(
        self,
        start_date: date,
        end_date: date,
        year: int,
    ) -> int:
        """
        Return the number of days from a leave period
        that belong to the specified calendar year.
        """

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)

        effective_start = max(start_date, year_start)
        effective_end = min(end_date, year_end)

        if effective_start > effective_end:
            return 0

        return (effective_end - effective_start).days + 1

    def _validate_annual_leave_limit(
        self,
        employee,
        start_date: date,
        end_date: date,
        instance=None,
    ) -> None:
        """
        Validate the 20-day annual leave limit for every
        calendar year touched by the requested leave.
        """

        years = range(start_date.year, end_date.year + 1)

        existing_annual_leaves = (
            LeaveRequest.objects.filter(
                employee=employee,
                leave_type=LeaveRequest.LeaveType.ANNUAL,
            )
            .exclude(
                status__in=[
                    LeaveRequest.Status.REJECTED,
                    LeaveRequest.Status.CANCELLED,
                ]
            )
        )

        if instance:
            existing_annual_leaves = existing_annual_leaves.exclude(
                pk=instance.pk
            )

        for year in years:
            requested_days = self._get_days_in_year(
                start_date,
                end_date,
                year,
            )

            if requested_days == 0:
                continue

            used_days = 0

            for leave in existing_annual_leaves:
                used_days += self._get_days_in_year(
                    leave.start_date,
                    leave.end_date,
                    year,
                )

            if used_days + requested_days > 20:
                remaining_days = max(20 - used_days, 0)

                raise serializers.ValidationError(
                    {
                        "leave_type": (
                            f"Annual leave limit is 20 days per "
                            f"calendar year. For {year}, you have "
                            f"{remaining_days} day(s) available."
                        )
                    }
                )

    def _validate_approved_leave_overlap(
        self,
        employee,
        start_date: date,
        end_date: date,
        instance=None,
    ) -> None:
        """
        Prevent overlap with an existing approved leave.
        """

        overlapping_approved = LeaveRequest.objects.filter(
            employee=employee,
            status=LeaveRequest.Status.APPROVED,
            start_date__lte=end_date,
            end_date__gte=start_date,
        )

        if instance:
            overlapping_approved = overlapping_approved.exclude(
                pk=instance.pk
            )

        if overlapping_approved.exists():
            raise serializers.ValidationError(
                {
                    "start_date": (
                        "The requested dates overlap with an "
                        "existing approved leave."
                    )
                }
            )

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")

        leave_type = attrs.get(
            "leave_type",
            LeaveRequest.LeaveType.ANNUAL,
        )

        today = timezone.localdate()

        # --------------------------------------------------
        # Rule 1: Cannot apply for a past date
        # --------------------------------------------------
        if start_date and start_date < today:
            raise serializers.ValidationError(
                {
                    "start_date": (
                        "Leave cannot be applied for a past date."
                    )
                }
            )

        # --------------------------------------------------
        # Rule 2: End date cannot be before start date
        # --------------------------------------------------
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {
                    "end_date": (
                        "End date cannot be before start date."
                    )
                }
            )

        # If both dates are not available yet, stop here.
        if not start_date or not end_date:
            return attrs

        employee = self.context["request"].user

        # --------------------------------------------------
        # Rule 3: Maximum 20 annual leave days per year
        # --------------------------------------------------
        if leave_type == LeaveRequest.LeaveType.ANNUAL:
            self._validate_annual_leave_limit(
                employee=employee,
                start_date=start_date,
                end_date=end_date,
                instance=self.instance,
            )

        # --------------------------------------------------
        # Rule 4: Cannot overlap approved leave
        # --------------------------------------------------
        self._validate_approved_leave_overlap(
            employee=employee,
            start_date=start_date,
            end_date=end_date,
            instance=self.instance,
        )

        return attrs


class LeaveReviewSerializer(serializers.Serializer):
    """
    Serializer used by managers when approving or rejecting leave.
    """

    manager_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )