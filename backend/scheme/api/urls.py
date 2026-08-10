from django.urls import path

from .views import (
    SchemeListCreateAPIView,
    SchemeRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path(
        "schemes/",
        SchemeListCreateAPIView.as_view(),
        name="scheme-list-create",
    ),

    path(
        "schemes/<int:pk>/",
        SchemeRetrieveUpdateDestroyAPIView.as_view(),
        name="scheme-detail",
    ),
]