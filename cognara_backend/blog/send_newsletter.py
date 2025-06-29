from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from blog.models import Article, NewsletterSubscriber, EmailLog


class Command(BaseCommand):
    help = 'Send newsletter emails for a specific article'

    def add_arguments(self, parser):
        parser.add_argument('article_id', type=int, help='Article ID to send newsletter for')
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force send even if emails were already sent for this article',
        )

    def handle(self, *args, **options):
        article_id = options['article_id']
        force = options['force']

        try:
            article = Article.objects.get(id=article_id)
        except Article.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Article with ID {article_id} does not exist')
            )
            return

        if not article.is_published or not article.is_approved:
            self.stdout.write(
                self.style.ERROR('Article must be published and approved to send newsletter')
            )
            return

        # Check if emails were already sent
        if not force and EmailLog.objects.filter(article=article).exists():
            self.stdout.write(
                self.style.WARNING(
                    f'Newsletter emails for article "{article.title}" were already sent. '
                    'Use --force to send again.'
                )
            )
            return

        subscribers = NewsletterSubscriber.objects.filter(is_active=True, confirmed=True)
        
        if not subscribers.exists():
            self.stdout.write(
                self.style.WARNING('No active subscribers found')
            )
            return

        self.stdout.write(f'Sending newsletter for article: {article.title}')
        self.stdout.write(f'Number of subscribers: {subscribers.count()}')

        success_count = 0
        error_count = 0

        for subscriber in subscribers:
            try:
                send_mail(
                    subject=f"New article on Cognara: {article.title}",
                    message=(
                        f"Hello!\n\n"
                        f"We have a new article on Cognara that we think you'll enjoy:\n\n"
                        f'"{article.title}"\n\n'
                        f"{article.excerpt}\n\n"
                        f"Read the full article: {settings.FRONTEND_URL}/article/{article.slug}\n\n"
                        f"Best regards,\n"
                        f"The Cognara Team\n\n"
                        f"---\n"
                        f"You're receiving this email because you subscribed to Cognara newsletter.\n"
                        f"To unsubscribe, visit: {settings.FRONTEND_URL}/unsubscribe?email={subscriber.email}"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[subscriber.email],
                    fail_silently=False
                )
                
                EmailLog.objects.create(
                    article=article,
                    subscriber=subscriber,
                    success=True
                )
                success_count += 1
                
            except Exception as e:
                EmailLog.objects.create(
                    article=article,
                    subscriber=subscriber,
                    success=False,
                    error_message=str(e)
                )
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f'Failed to send email to {subscriber.email}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Newsletter sending completed. '
                f'Success: {success_count}, Errors: {error_count}'
            )
        )

