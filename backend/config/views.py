from django.http import JsonResponse


def health_check(request):
    return JsonResponse(
        {
            "message": "Employee Leave Management API is running",
            "status": "ok",
        }
    )