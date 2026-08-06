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


class StudentSerializer(serializers.ModelSerializer):
    fee_balance = serializers.ReadOnlyField()

    class Meta:
        model = Student
        fields = "__all__"

    def validate(self, data):
        level = data.get("level")
        grade = data.get("grade")

        valid_grades = {
            "Primary": range(1, 6),
            "JSS": range(1, 4),
            "SSS": range(1, 4),
        }

        if level and grade not in valid_grades[level]:
            raise serializers.ValidationError(
                {"grade": f"{level} only allows grades {list(valid_grades[level])}."}
            )

        return data