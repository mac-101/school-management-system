from django.urls import path

from .views import (
    SubjectsByLevelAPIView,
    StudentResultListCreateAPIView,
    StudentResultRetrieveUpdateDestroyAPIView,
)


urlpatterns = [
    path(
        "subjects/<str:level>/",
        SubjectsByLevelAPIView.as_view(),
        name="subjects-by-level",
    ),

    path(
        "",
        StudentResultListCreateAPIView.as_view(),
        name="result-list-create",
    ),

    path(
        "<int:pk>/",
        StudentResultRetrieveUpdateDestroyAPIView.as_view(),
        name="result-detail",
    ),
]