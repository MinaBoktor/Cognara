from django.urls import path
from . import views

urlpatterns = [
    path('articles', views.get_articles, name='get_articles'),
    path('articles/<article_id>', views.get_article, name='get_article'),
    path('articles/<article_id>/comments', views.get_comments, name='get_comments'),
    path('usercheck', views.check_user, name='check_user'),
    path('emailcheck', views.check_email, name='check_email'),
    path('signup', views.signup, name='signup'),
    path('coderequest', views.request_code, name="request_code"),
    path('verifycode', views.verify_code, name="verify_code"),
]