from rest_framework import generics
from staff.models import Staff
from .serializers import StaffSerializer


class StaffListAPIView(generics.ListAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer