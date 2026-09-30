from django.urls import path

from .views import (
    EmployeeDashboardView,
    ManagerDashboardView,
    EmployeeLeaveStatisticsView,
)

urlpatterns = [
    path(
        "employee/",
        EmployeeDashboardView.as_view(),
        name="employee-dashboard",
    ),

    path(
        "manager/",
        ManagerDashboardView.as_view(),
        name="manager-dashboard",
    ),

    path(
        "manager/employee-statistics/",
        EmployeeLeaveStatisticsView.as_view(),
        name="employee-leave-statistics",
    ),
]