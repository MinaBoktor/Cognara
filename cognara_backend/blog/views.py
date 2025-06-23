from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .models import Article, Subscriber
from .serializers import ArticleSerializer, SubscriberSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('-created_at')
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.all().order_by('-created_at')
        slug = self.request.query_params.get('slug', None)
        approved = self.request.query_params.get('approved', None)
        
        if slug is not None:
            queryset = queryset.filter(slug=slug)
        if approved is not None:
            approved_bool = approved.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(approved=approved_bool)
            
        return queryset

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        """Get article by slug"""
        article = get_object_or_404(Article, slug=slug)
        serializer = self.get_serializer(article)
        return Response(serializer.data)

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