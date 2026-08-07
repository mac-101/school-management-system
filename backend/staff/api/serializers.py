from rest_framework import serializers
from ..models import Staff, Subject, TeachingAssignment, ClassModerator


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    # accept subject as a PK on write, return PK on read (frontend will fetch subject list separately)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    teacher = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all())

    class Meta:
        model = TeachingAssignment
        fields = [
            "id",
            "teacher",
            "subject",
            "level",
            "grade",
        ]


class ClassModeratorSerializer(serializers.ModelSerializer):
    # include teacher so we can create/update/delete by API
    teacher = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all())

    class Meta:
        model = ClassModerator
        fields = [
            "id",
            "teacher",
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