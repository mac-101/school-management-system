from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser

# Create your models here.
    
class User(AbstractUser):
    pass

class Student(models.Model):

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
            "Primary": range(1, 6),  # 1–5
            "JSS": range(1, 4),      # 1–3
            "SSS": range(1, 4),      # 1–3
        }

        if self.grade not in valid_grades[self.level]:
            raise ValidationError(
                {"grade": f"{self.level} only allows grades {list(valid_grades[self.level])}."}
            )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"