from django.contrib import admin
from .models import User, Article, NewsletterSubscriber, ShareLog

admin.site.register(User)
admin.site.register(Article)
admin.site.register(NewsletterSubscriber)
admin.site.register(ShareLog)