from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Post(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    
    def __str__(self):
        return f'Posts: {self.title}'
    
class User(AbstractUser):
    pass
