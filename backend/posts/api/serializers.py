from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from ..models import User, Student

        
class RegisterSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user
    
class StudentSerializer(ModelSerializer):
    fee_balance = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = "__all__"