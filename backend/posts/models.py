from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.db import transaction


class User(AbstractUser):
    pass


class Student(models.Model):

    student_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
    )

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    LEVEL_CHOICES = [
        ("Primary", "Primary"),
        ("JSS", "JSS"),
        ("SSS", "SSS"),
    ]

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)

    age = models.PositiveSmallIntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    grade = models.PositiveSmallIntegerField()

    student_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    @property
    def fee_balance(self):
        return self.student_fee - self.amount_paid

    def clean(self):
        valid_grades = {
            "Primary": range(1, 6),
            "JSS": range(1, 4),
            "SSS": range(1, 4),
        }

        if self.grade not in valid_grades[self.level]:
            raise ValidationError({
                "grade": (
                    f"{self.level} only allows grades "
                    f"{list(valid_grades[self.level])}."
                )
            })

    def save(self, *args, **kwargs):

        if not self.student_id:

            with transaction.atomic():

                from datetime import date

                year = date.today().year

                last_student = (
                    Student.objects
                    .filter(
                        student_id__startswith=f"STU/{year}/"
                    )
                    .order_by("-student_id")
                    .first()
                )

                if last_student:
                    last_number = int(
                        last_student.student_id.split("/")[-1]
                    )
                    next_number = last_number + 1
                else:
                    next_number = 1

                self.student_id = (
                    f"STU/{year}/{next_number:04d}"
                )

                super().save(*args, **kwargs)

        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"