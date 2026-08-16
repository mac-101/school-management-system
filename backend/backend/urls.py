from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("scheme.api.urls")),
    path("api/", include("posts.api.urls")),
    path("api/", include("staff.api.urls")),
    path("api/timetable/", include("timetable.api.urls")),
    path("api/results/", include("results.api.urls")),
]