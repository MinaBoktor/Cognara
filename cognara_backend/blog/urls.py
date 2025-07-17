from django.urls import path
from . import views

urlpatterns = [
    path('get_csrf_token', views.get_csrf_token, name="get_csrf_token"),
    path('articles', views.get_articles, name='get_articles'),
    path('articles/<article_id>', views.get_article, name='get_article'),
    path('articles/<article_id>/comments', views.get_comments, name='get_comments'),
    path('articles/add-comment', views.post_comment, name='post_comment'),
    path('usercheck', views.check_user, name='check_user'),
    path('emailcheck', views.check_email, name='check_email'),
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('auth/status', views.auth_status, name='auth_status'),
    path('coderequest', views.request_code, name="request_code"),
    path('verifycode', views.verify_code, name="verify_code"),
    path('auth/google', views.google_auth, name="google_auth"),
    path('forgetpass', views.forgetpass, name="forgetpass"),
    path('newsletter/subscribe', views.newsletter_subscription, name="newsletter_subscription"),
    path("get-article-images", views.get_article_images ,name="get_article_images"),
]