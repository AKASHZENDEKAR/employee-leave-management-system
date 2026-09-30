from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from .models import LeaveRequest


class LeaveRequestAPITests(APITestCase):
    def setUp(self):
        self.employee = User.objects.create_user(
            username="test_employee",
            email="employee@test.com",
            password="TestPassword123!",
            role=User.Role.EMPLOYEE,
        )

        self.manager = User.objects.create_user(
            username="test_manager",
            email="manager@test.com",
            password="TestPassword123!",
            role=User.Role.MANAGER,
        )

        self.employee_url = "/api/leaves/"

    def future_date(self, days_from_today):
        return date.today() + timedelta(
            days=days_from_today
        )

    # -------------------------------------------------------
    # Employee permissions
    # -------------------------------------------------------

    def test_employee_can_create_leave(self):
        self.client.force_authenticate(
            user=self.employee
        )

        start_date = self.future_date(5)
        end_date = self.future_date(7)

        response = self.client.post(
            self.employee_url,
            {
                "leave_type": LeaveRequest.LeaveType.CASUAL,
                "start_date": start_date,
                "end_date": end_date,
                "reason": "Personal work",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            LeaveRequest.objects.count(),
            1,
        )

        leave = LeaveRequest.objects.first()

        self.assertEqual(
            leave.employee,
            self.employee,
        )

        self.assertEqual(
            leave.status,
            LeaveRequest.Status.PENDING,
        )

    # -------------------------------------------------------
    # Employee can only see own leaves
    # -------------------------------------------------------

    def test_employee_can_only_see_own_leaves(self):
        other_employee = User.objects.create_user(
            username="other_employee",
            email="other@test.com",
            password="TestPassword123!",
            role=User.Role.EMPLOYEE,
        )

        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(6),
            reason="My leave",
        )

        LeaveRequest.objects.create(
            employee=other_employee,
            leave_type=LeaveRequest.LeaveType.SICK,
            start_date=self.future_date(8),
            end_date=self.future_date(9),
            reason="Other leave",
        )

        self.client.force_authenticate(
            user=self.employee
        )

        response = self.client.get(
            self.employee_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        results = response.data["results"]

        self.assertEqual(
            len(results),
            1,
        )

    # -------------------------------------------------------
    # Manager can see all leaves
    # -------------------------------------------------------

    def test_manager_can_see_all_leaves(self):
        other_employee = User.objects.create_user(
            username="other_employee",
            email="other@test.com",
            password="TestPassword123!",
            role=User.Role.EMPLOYEE,
        )

        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(6),
            reason="Employee one",
        )

        LeaveRequest.objects.create(
            employee=other_employee,
            leave_type=LeaveRequest.LeaveType.SICK,
            start_date=self.future_date(8),
            end_date=self.future_date(9),
            reason="Employee two",
        )

        self.client.force_authenticate(
            user=self.manager
        )

        response = self.client.get(
            self.employee_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["results"]),
            2,
        )

    # -------------------------------------------------------
    # Manager can approve
    # -------------------------------------------------------

    def test_manager_can_approve_pending_leave(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(7),
            reason="Vacation",
        )

        self.client.force_authenticate(
            user=self.manager
        )

        response = self.client.post(
            f"/api/leaves/{leave.id}/approve/",
            {
                "manager_comment": "Approved",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        leave.refresh_from_db()

        self.assertEqual(
            leave.status,
            LeaveRequest.Status.APPROVED,
        )

        self.assertEqual(
            leave.reviewed_by,
            self.manager,
        )

    # -------------------------------------------------------
    # Employee cannot approve
    # -------------------------------------------------------

    def test_employee_cannot_approve(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(7),
            reason="Vacation",
        )

        self.client.force_authenticate(
            user=self.employee
        )

        response = self.client.post(
            f"/api/leaves/{leave.id}/approve/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    # -------------------------------------------------------
    # Manager can reject
    # -------------------------------------------------------

    def test_manager_can_reject_pending_leave(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(7),
            reason="Vacation",
        )

        self.client.force_authenticate(
            user=self.manager
        )

        response = self.client.post(
            f"/api/leaves/{leave.id}/reject/",
            {
                "manager_comment": "Not approved",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        leave.refresh_from_db()

        self.assertEqual(
            leave.status,
            LeaveRequest.Status.REJECTED,
        )

    # -------------------------------------------------------
    # Employee can cancel pending leave
    # -------------------------------------------------------

    def test_employee_can_cancel_pending_leave(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(7),
            reason="Vacation",
        )

        self.client.force_authenticate(
            user=self.employee
        )

        response = self.client.post(
            f"/api/leaves/{leave.id}/cancel/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        leave.refresh_from_db()

        self.assertEqual(
            leave.status,
            LeaveRequest.Status.CANCELLED,
        )

    # -------------------------------------------------------
    # Employee cannot cancel approved leave
    # -------------------------------------------------------

    def test_employee_cannot_cancel_approved_leave(self):
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(5),
            end_date=self.future_date(7),
            reason="Vacation",
            status=LeaveRequest.Status.APPROVED,
        )

        self.client.force_authenticate(
            user=self.employee
        )

        response = self.client.post(
            f"/api/leaves/{leave.id}/cancel/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # -------------------------------------------------------
    # Overlapping approved leave cannot be approved
    # -------------------------------------------------------

    def test_overlapping_approved_leave_is_rejected(self):
        LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.CASUAL,
            start_date=self.future_date(10),
            end_date=self.future_date(15),
            reason="Existing approved leave",
            status=LeaveRequest.Status.APPROVED,
        )

        pending_leave = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=LeaveRequest.LeaveType.SICK,
            start_date=self.future_date(12),
            end_date=self.future_date(14),
            reason="Overlapping leave",
            status=LeaveRequest.Status.PENDING,
        )

        self.client.force_authenticate(
            user=self.manager
        )

        response = self.client.post(
            f"/api/leaves/{pending_leave.id}/approve/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        pending_leave.refresh_from_db()

        self.assertEqual(
            pending_leave.status,
            LeaveRequest.Status.PENDING,
        )