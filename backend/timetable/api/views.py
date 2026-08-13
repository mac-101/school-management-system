from rest_framework import generics

from timetable.models import ClassRoom, Period, TimetableEntry
from .serializers import (
    ClassRoomSerializer,
    TimetableEntrySerializer,
    PeriodSerializer,
)

class PeriodListAPIView(generics.ListCreateAPIView):
    queryset = Period.objects.all().order_by("order")
    serializer_class = PeriodSerializer


class PeriodRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    
class ClassRoomListAPIView(generics.ListAPIView):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer


class TimetableListCreateAPIView(generics.ListCreateAPIView):
    queryset = (
        TimetableEntry.objects
        .select_related(
            "classroom",
            "subject",
            "teacher",
        )
        .order_by("day", "period__order")
    )

    serializer_class = TimetableEntrySerializer


class TimetableRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        TimetableEntry.objects
        .select_related(
            "classroom",
            "subject",
            "teacher",
        )
    )

    serializer_class = TimetableEntrySerializer