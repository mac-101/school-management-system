from rest_framework import generics

from staff.models import Subject, SubjectLevel
from results.models import StudentResult
from .serializers import (
    SubjectOptionSerializer,
    StudentResultSerializer,
)


class SubjectsByLevelAPIView(generics.ListAPIView):
    serializer_class = SubjectOptionSerializer

    def get_queryset(self):
        level = self.kwargs["level"]

        return (
            Subject.objects
            .filter(levels__level=level)
            .order_by("name")
            .distinct()
        )


class StudentResultListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = StudentResultSerializer

    def get_queryset(self):
        queryset = (
            StudentResult.objects
            .select_related("student")
            .prefetch_related(
                "subject_scores__subject"
            )
            .order_by("-date_created")
        )

        student_id = self.request.query_params.get("student")

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        return queryset


class StudentResultRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        StudentResult.objects
        .select_related("student")
        .prefetch_related(
            "subject_scores__subject"
        )
    )

    serializer_class = StudentResultSerializer