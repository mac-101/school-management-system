from django.db import models


class Scheme(models.Model):

    TERM_CHOICES = [
        ("First Term", "First Term"),
        ("Second Term", "Second Term"),
        ("Third Term", "Third Term"),
    ]

    LEVEL_CHOICES = [
        ("Primary", "Primary"),
        ("JSS", "JSS"),
        ("SSS", "SSS"),
    ]

    subject = models.ForeignKey(
        "staff.Subject",
        on_delete=models.CASCADE,
        related_name="schemes"
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    grade = models.PositiveSmallIntegerField()

    term = models.CharField(
        max_length=20,
        choices=TERM_CHOICES
    )

    academic_session = models.CharField(
        max_length=20
    )

    def __str__(self):
        return f"{self.subject} - {self.level} {self.grade} - {self.term}"


class SchemeWeek(models.Model):

    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE,
        related_name="weeks"
    )

    week_number = models.PositiveSmallIntegerField()

    topic = models.CharField(
        max_length=200
    )

    def __str__(self):
        return f"Week {self.week_number} - {self.topic}"


class SchemeSubtopic(models.Model):

    week = models.ForeignKey(
        SchemeWeek,
        on_delete=models.CASCADE,
        related_name="subtopics"
    )

    title = models.CharField(
        max_length=200
    )

    def __str__(self):
        return self.title