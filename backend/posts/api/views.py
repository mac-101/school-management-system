from rest_framework import generics
from .serializers import RegisterSerializer, StudentSerializer
from rest_framework.views import APIView
from ..models import Student
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })

class StudentListAPIView(generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer