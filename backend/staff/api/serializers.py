from rest_framework import serializers
from ..models import Staff, Subject, TeachingAssignment, ClassModerator


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class TeachingAssignmentSerializer(serializers.ModelSerializer):
    # Return full subject object on read, accept subject as PK on write
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        source='subject',
        write_only=True
    )
    teacher = serializers.PrimaryKeyRelatedField(queryset=Staff.objects.all())

    class Meta:
        model = TeachingAssignment
        fields = [
            "id",
            "teacher",
            "subject",
            "subject_id",
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