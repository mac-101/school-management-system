from django.db import transaction
from rest_framework import serializers

from staff.models import Subject
from scheme.models import Scheme, SchemeWeek, SchemeSubtopic


class SchemeSubtopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeSubtopic
        fields = [
            "id",
            "title",
        ]


class SchemeWeekSerializer(serializers.ModelSerializer):
    subtopics = SchemeSubtopicSerializer(many=True)

    class Meta:
        model = SchemeWeek
        fields = [
            "id",
            "week_number",
            "topic",
            "subtopics",
        ]


class SchemeSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    weeks = SchemeWeekSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Scheme
        fields = [
            "id",
            "subject",
            "subject_name",
            "level",
            "grade",
            "term",
            "academic_session",
            "weeks",
        ]

    @transaction.atomic
    def create(self, validated_data):
        weeks_data = validated_data.pop("weeks", [])

        scheme = Scheme.objects.create(**validated_data)

        for week_data in weeks_data:
            subtopics_data = week_data.pop("subtopics", [])

            week = SchemeWeek.objects.create(
                scheme=scheme,
                **week_data
            )

            for subtopic_data in subtopics_data:
                SchemeSubtopic.objects.create(
                    week=week,
                    **subtopic_data
                )

        return scheme
    
    @transaction.atomic
    def update(self, instance, validated_data):
        weeks_data = validated_data.pop("weeks", None)

        # Update the main Scheme fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Only replace weeks if weeks were actually included
        if weeks_data is not None:
            # Delete existing weeks.
            # Their subtopics are deleted automatically because
            # SchemeSubtopic.week uses CASCADE.
            instance.weeks.all().delete()

            for week_data in weeks_data:
                subtopics_data = week_data.pop("subtopics", [])

                week = SchemeWeek.objects.create(
                    scheme=instance,
                    **week_data
                )

                for subtopic_data in subtopics_data:
                    SchemeSubtopic.objects.create(
                        week=week,
                        **subtopic_data
                    )

        return instance