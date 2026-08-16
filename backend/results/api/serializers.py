from django.db import models, transaction
from rest_framework import serializers

from posts.models import Student
from staff.models import Subject, SubjectLevel
from results.models import StudentResult, SubjectScore


class SubjectOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
        ]


class SubjectScoreSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    class Meta:
        model = SubjectScore
        fields = [
            "id",
            "subject",
            "subject_name",
            "score",
        ]


class StudentResultSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    student_id = serializers.CharField(
        source="student.student_id",
        read_only=True
    )

    level = serializers.CharField()
    grade = serializers.IntegerField()

    total_score = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    average_score = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    subject_scores = SubjectScoreSerializer(
        many=True,
        required=False
    )
    

    class Meta:
        model = StudentResult
        fields = [
            "id",
            "student",
            "student_name",
            "student_id",
            "level",
            "grade",
            "term",
            "academic_session",
            "teacher_remark",
            "principal_remark",
            "subject_scores",
            "total_score",
            "average_score",
            "date_created",
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def validate(self, attrs):
        student = attrs.get(
            "student",
            getattr(self.instance, "student", None)
        )

        subject_scores = attrs.get(
            "subject_scores",
            None
        )

        if not student:
            raise serializers.ValidationError({
                "student": "A student is required."
            })

        if subject_scores is not None:
            subject_ids = set()

            for subject_data in subject_scores:
                subject = subject_data["subject"]

                # Prevent duplicate subjects in one result
                if subject.id in subject_ids:
                    raise serializers.ValidationError({
                        "subject_scores": (
                            f"{subject.name} has been added more than once."
                        )
                    })

                subject_ids.add(subject.id)

                # Make sure the subject is offered at the student's level
                allowed = SubjectLevel.objects.filter(
                    subject=subject,
                    level=student.level
                ).exists()

                if not allowed:
                    raise serializers.ValidationError({
                        "subject_scores": (
                            f"{subject.name} is not offered at "
                            f"{student.level} level."
                        )
                    })

                # Score must be 0–100
                score = subject_data["score"]

                if score < 0 or score > 100:
                    raise serializers.ValidationError({
                        "subject_scores": (
                            f"{subject.name} score must be "
                            "between 0 and 100."
                        )
                    })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        subject_scores_data = validated_data.pop(
            "subject_scores",
            []
        )

        result = StudentResult.objects.create(
            **validated_data
        )

        for score_data in subject_scores_data:
            SubjectScore.objects.create(
                result=result,
                **score_data
            )

        return result

    @transaction.atomic
    def update(self, instance, validated_data):
        subject_scores_data = validated_data.pop(
            "subject_scores",
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if subject_scores_data is not None:
            instance.subject_scores.all().delete()

            for score_data in subject_scores_data:
                SubjectScore.objects.create(
                    result=instance,
                    **score_data
                )

        return instance