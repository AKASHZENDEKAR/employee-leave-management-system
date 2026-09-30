from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class LeaveRequest(models.Model):
    class LeaveType(models.TextChoices):
        ANNUAL = "ANNUAL", "Annual"
        SICK = "SICK", "Sick"
        CASUAL = "CASUAL", "Casual"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_requests",
    )

    leave_type = models.CharField(
        max_length=20,
        choices=LeaveType.choices,
        default=LeaveType.ANNUAL,
    )

    start_date = models.DateField()
    end_date = models.DateField()

    reason = models.TextField(max_length=500)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_leave_requests",
    )

    manager_comment = models.TextField(
        max_length=500,
        blank=True,
        default="",
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leave_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.employee.username} - "
            f"{self.start_date} to {self.end_date} - "
            f"{self.status}"
        )