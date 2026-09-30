from django.contrib import admin
from django.urls import include, path

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

from .views import health_check


urlpatterns = [
    # Health check
    path(
        "",
        health_check,
        name="health-check",
    ),

    # Django admin
    path(
        "admin/",
        admin.site.urls,
    ),

    # Authentication
    path(
        "api/auth/",
        include("apps.accounts.urls"),
    ),

    # Leave management
    path(
        "api/",
        include("apps.leaves.urls"),
    ),

    # Dashboard
    path(
        "api/dashboard/",
        include("apps.dashboard.urls"),
    ),

    # OpenAPI schema
    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    # Swagger UI
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema",
        ),
        name="swagger-ui",
    ),
]