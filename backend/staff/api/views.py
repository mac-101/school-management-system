from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
import traceback
from staff.models import Staff, Subject, TeachingAssignment, ClassModerator
from .serializers import (
    StaffSerializer,
    SubjectSerializer,
    TeachingAssignmentSerializer,
    ClassModeratorSerializer,
)


class StaffListCreateAPIView(generics.ListCreateAPIView):
    queryset = Staff.objects.all().order_by("last_name", "first_name")
    serializer_class = StaffSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            tb = traceback.format_exc()
            return Response({"detail": str(e), "trace": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StaffRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer


class SubjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer


class SubjectRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class TeachingAssignmentListCreateAPIView(generics.ListCreateAPIView):
    queryset = TeachingAssignment.objects.all()
    serializer_class = TeachingAssignmentSerializer


class TeachingAssignmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TeachingAssignment.objects.all()
    serializer_class = TeachingAssignmentSerializer


class ClassModeratorListCreateAPIView(generics.ListCreateAPIView):
    queryset = ClassModerator.objects.all()
    serializer_class = ClassModeratorSerializer


class ClassModeratorRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClassModerator.objects.all()
    serializer_class = ClassModeratorSerializer