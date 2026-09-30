from rest_framework import serializers


class EmployeeDashboardSerializer(serializers.Serializer):
    remaining_annual_leave_days = serializers.IntegerField()
    used_annual_leave_days = serializers.IntegerField()
    approved_leave_requests = serializers.IntegerField()
    pending_leave_requests = serializers.IntegerField()


class ManagerDashboardSerializer(serializers.Serializer):
    pending_requests = serializers.IntegerField()
    approved_today = serializers.IntegerField()
    total_employees = serializers.IntegerField()