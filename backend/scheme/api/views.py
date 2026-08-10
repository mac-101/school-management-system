from rest_framework import generics

from scheme.models import Scheme
from .serializers import SchemeSerializer


class SchemeListCreateAPIView(generics.ListCreateAPIView):
    queryset = (
        Scheme.objects
        .select_related("subject")
        .prefetch_related("weeks__subtopics")
        .order_by("level", "grade", "term", "subject__name")
    )

    serializer_class = SchemeSerializer


class SchemeRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        Scheme.objects
        .select_related("subject")
        .prefetch_related("weeks__subtopics")
    )

    serializer_class = SchemeSerializer