from django.urls import path
from .views import StaffListAPIView

urlpatterns = [
    path("staff/", StaffListAPIView.as_view(), name="staff-list"),
]