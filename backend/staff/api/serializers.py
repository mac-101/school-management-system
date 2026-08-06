from rest_framework import serializers
from ..models import Staff, Subject, TeachingAssignment, ClassModerator


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()

    class Meta:
        model = TeachingAssignment
        fields = [
            "id",
            "subject",
            "level",
            "grade",
        ]


class ClassModeratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassModerator
        fields = [
            "level",
            "grade",
        ]


class StaffSerializer(serializers.ModelSerializer):
    assignments = TeachingAssignmentSerializer(
        many=True,
        read_only=True,
    )

    class_moderator = ClassModeratorSerializer(
        read_only=True,
    )

    class Meta:
        model = Staff
        fields = "__all__"