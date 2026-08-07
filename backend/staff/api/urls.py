from django.urls import path
from .views import (
    StaffListCreateAPIView,
    StaffRetrieveUpdateDestroyAPIView,
    SubjectListCreateAPIView,
    SubjectRetrieveUpdateDestroyAPIView,
    TeachingAssignmentListCreateAPIView,
    TeachingAssignmentRetrieveUpdateDestroyAPIView,
    ClassModeratorListCreateAPIView,
    ClassModeratorRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path("staff/", StaffListCreateAPIView.as_view(), name="staff-list"),
    path("staff/<int:pk>/", StaffRetrieveUpdateDestroyAPIView.as_view(), name="staff-detail"),

    path("subjects/", SubjectListCreateAPIView.as_view(), name="subject-list"),
    path("subjects/<int:pk>/", SubjectRetrieveUpdateDestroyAPIView.as_view(), name="subject-detail"),

    path("teaching-assignments/", TeachingAssignmentListCreateAPIView.as_view(), name="teachingassignment-list"),
    path("teaching-assignments/<int:pk>/", TeachingAssignmentRetrieveUpdateDestroyAPIView.as_view(), name="teachingassignment-detail"),

    path("class-moderators/", ClassModeratorListCreateAPIView.as_view(), name="classmoderator-list"),
    path("class-moderators/<int:pk>/", ClassModeratorRetrieveUpdateDestroyAPIView.as_view(), name="classmoderator-detail"),
]