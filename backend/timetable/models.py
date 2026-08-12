from django.db import models
from staff.models import Staff, Subject


class ClassRoom(models.Model):

    LEVEL_CHOICES = [
        ("Primary", "Primary"),
        ("JSS", "JSS"),
        ("SSS", "SSS"),
    ]

    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)

    grade = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["level", "grade"], name="unique_classroom")
        ]
        ordering = ["level", "grade"]

    def __str__(self):
        return f"{self.level} {self.grade}"


class Period(models.Model):
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    order = models.PositiveSmallIntegerField(unique=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"


class TimetableEntry(models.Model):

    DAY_CHOICES = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
    ]

    classroom = models.ForeignKey(
        ClassRoom, on_delete=models.CASCADE, related_name="timetable_entries"
    )

    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="timetable_entries"
    )

    teacher = models.ForeignKey(
        Staff, on_delete=models.CASCADE, related_name="timetable_entries"
    )

    day = models.CharField(max_length=10, choices=DAY_CHOICES)

    period = models.ForeignKey(
        Period, on_delete=models.PROTECT, related_name="timetable_entries"
    )

    room = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["day", "period__order"]

    def __str__(self):
        return (
            f"{self.day} | "
            f"{self.classroom} | "
            f"{self.subject} | "
            f"{self.teacher}"
        )
