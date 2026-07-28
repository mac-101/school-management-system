from rest_framework import generics
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
        })


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer