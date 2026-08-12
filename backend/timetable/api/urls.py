from django.urls import path

from .views import (
    ClassRoomListAPIView,
    PeriodListAPIView,
    TimetableListCreateAPIView,
    TimetableRetrieveUpdateDestroyAPIView,
)

urlpatterns = [
    path(
        "classes/",
        ClassRoomListAPIView.as_view(),
        name="classroom-list",
    ),

    path(
        "periods/",
        PeriodListAPIView.as_view(),
        name="period-list",
    ),

    path(
        "",
        TimetableListCreateAPIView.as_view(),
        name="timetable-list-create",
    ),

    path(
        "<int:pk>/",
        TimetableRetrieveUpdateDestroyAPIView.as_view(),
        name="timetable-detail",
    ),
]