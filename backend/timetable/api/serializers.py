from rest_framework import serializers

from timetable.models import ClassRoom, Period, TimetableEntry


class ClassRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRoom
        fields = [
            "id",
            "level",
            "grade",
        ]
        
class PeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Period
        fields = [
            "id",
            "name",
            "start_time",
            "end_time",
            "order",
        ]


class TimetableEntrySerializer(serializers.ModelSerializer):

    classroom_name = serializers.CharField(
        source="classroom",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    teacher_name = serializers.SerializerMethodField()

    period_name = serializers.CharField(
        source="period.name",
        read_only=True
    )

    period_start_time = serializers.TimeField(
        source="period.start_time",
        read_only=True
    )

    period_end_time = serializers.TimeField(
        source="period.end_time",
        read_only=True
    )

    class Meta:
        model = TimetableEntry
        fields = [
            "id",
            "classroom",
            "classroom_name",
            "subject",
            "subject_name",
            "teacher",
            "teacher_name",
            "day",
            "period",
            "period_name",
            "period_start_time",
            "period_end_time",
            "room",
        ]

    def get_teacher_name(self, obj):
        return f"{obj.teacher.first_name} {obj.teacher.last_name}"

    def validate(self, attrs):

        classroom = attrs.get(
            "classroom",
            getattr(self.instance, "classroom", None)
        )

        subject = attrs.get(
            "subject",
            getattr(self.instance, "subject", None)
        )

        teacher = attrs.get(
            "teacher",
            getattr(self.instance, "teacher", None)
        )

        day = attrs.get(
            "day",
            getattr(self.instance, "day", None)
        )

        period = attrs.get(
            "period",
            getattr(self.instance, "period", None)
        )

        # -----------------------------------------
        # Find entries on the same day and period
        # -----------------------------------------

        conflicting_entries = TimetableEntry.objects.filter(
            day=day,
            period=period,
        )

        # Don't compare an entry against itself
        # when updating.
        if self.instance:
            conflicting_entries = conflicting_entries.exclude(
                pk=self.instance.pk
            )

        # -----------------------------------------
        # Teacher conflict
        # -----------------------------------------

        if conflicting_entries.filter(
            teacher=teacher
        ).exists():

            raise serializers.ValidationError({
                "teacher": (
                    "This teacher already has a timetable entry "
                    "during this period."
                )
            })

        # -----------------------------------------
        # Class conflict
        # -----------------------------------------

        if conflicting_entries.filter(
            classroom=classroom
        ).exists():

            raise serializers.ValidationError({
                "classroom": (
                    "This class already has a timetable entry "
                    "during this period."
                )
            })

        # -----------------------------------------
        # Teaching assignment validation
        # -----------------------------------------

        assignment_exists = teacher.assignments.filter(
            subject=subject,
            level=classroom.level,
            grade=classroom.grade,
        ).exists()

        if not assignment_exists:
            raise serializers.ValidationError({
                "teacher": (
                    f"{teacher} is not assigned to teach "
                    f"{subject} for {classroom}."
                )
            })

        return attrs