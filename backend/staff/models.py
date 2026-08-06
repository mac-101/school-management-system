from django.db import models

# Create your models here.


class Staff(models.Model):

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    ROLE_CHOICES = [
        ("Teacher", "Teacher"),
        ("Principal", "Principal"),
        ("Vice Principal", "Vice Principal"),
        ("Bursar", "Bursar"),
        ("Secretary", "Secretary"),
        ("Librarian", "Librarian"),
        ("Lab Assistant", "Lab Assistant"),
        ("Security", "Security"),
        ("Cleaner", "Cleaner"),
        ("Other", "Other"),
    ]

    EMPLOYMENT_CHOICES = [
        ("Full Time", "Full Time"),
        ("Part Time", "Part Time"),
        ("Contract", "Contract"),
    ]

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    age = models.PositiveSmallIntegerField()

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )

    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_CHOICES,
        default="Full Time"
    )

    phone_number = models.CharField(max_length=20)

    email = models.EmailField(blank=True)

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    date_employed = models.DateField()

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
class Subject(models.Model):

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    

class TeachingAssignment(models.Model):

    LEVEL_CHOICES = [
        ("Primary", "Primary"),
        ("JSS", "JSS"),
        ("SSS", "SSS"),
    ]

    teacher = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    grade = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.teacher} - {self.subject} ({self.level} {self.grade})"
    
class ClassModerator(models.Model):

    LEVEL_CHOICES = [
        ("Primary", "Primary"),
        ("JSS", "JSS"),
        ("SSS", "SSS"),
    ]

    teacher = models.OneToOneField(
    Staff,
    on_delete=models.CASCADE,
    related_name="class_moderator"
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    grade = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.teacher} - {self.level} {self.grade}"