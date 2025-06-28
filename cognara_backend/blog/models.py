from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify


class User(AbstractUser):
    is_admin = models.BooleanField(default=False)


class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    excerpt = models.TextField()
    content = models.TextField()
    image = models.URLField(blank=True, null=True)  # You can change to ImageField if using local storage
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed = models.BooleanField(default=True)

    def __str__(self):
        return self.email


class ShareLog(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    platform = models.CharField(max_length=100)
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.article.title} shared on {self.platform}"
