# blog/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Optional: Add any custom fields here
    pass
