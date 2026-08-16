from django.db import models

from posts.models import Student
from staff.models import Subject


class StudentResult(models.Model):

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

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="result_records"
    )

    # Snapshot of the student's class when this result was recorded.
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    grade = models.PositiveSmallIntegerField()

    term = models.CharField(
        max_length=20,
        choices=TERM_CHOICES
    )
    
    date_created = models.DateTimeField(auto_now_add=True)

    academic_session = models.CharField(
        max_length=20
    )
    teacher_remark = models.TextField(
        blank=True,
    )
    principal_remark = models.TextField(
        blank=True,
    )

    @property
    def total_score(self):
        return sum(
            score.score
            for score in self.subject_scores.all()
        )

    @property
    def average_score(self):
        scores = list(self.subject_scores.all())

        if not scores:
            return 0

        return self.total_score / len(scores)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "term",
                    "academic_session",
                ],
                name="unique_student_result_term_session",
            )
        ]

        ordering = [
            "student__last_name",
            "student__first_name",
        ]

    def __str__(self):
        return (
            f"{self.student} - "
            f"{self.level} {self.grade} - "
            f"{self.term} - "
            f"{self.academic_session}"
        )


class SubjectScore(models.Model):

    result = models.ForeignKey(
        StudentResult,
        on_delete=models.CASCADE,
        related_name="subject_scores"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name="student_scores"
    )

    score = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["result", "subject"],
                name="unique_result_subject",
            )
        ]

        ordering = [
            "subject__name",
        ]

    def __str__(self):
        return f"{self.subject} - {self.score}"