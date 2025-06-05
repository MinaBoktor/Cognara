from django.shortcuts import render
from rest_framework import viewsets
from .models import Article, Subscriber
from .serializers import ArticleSerializer, SubscriberSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('-created_at')
    serializer_class = ArticleSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        article = self.get_object()
        article.approved = True
        article.save()
        subscribers = Subscriber.objects.all()
        for sub in subscribers:
            send_mail(
                subject=f"New article on Cognara: {article.title}",
                message=f"{article.content[:200]}...\nRead more: https://cognara.com/article/{article.slug}",
                from_email='noreply@cognara.com',
                recipient_list=[sub.email],
            )
        return Response({'status': 'approved and notified'})

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer