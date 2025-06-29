from django.http import JsonResponse
from supabase import create_client
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


SUPABASE_URL = "https://rhwwleuleeqmngoesjos.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3dsZXVsZWVxbW5nb2Vzam9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA5MTk4NywiZXhwIjoyMDY2NjY3OTg3fQ.ViRtG74m4sLPAB6BtaVqC7pA2gvkUTgh6ngt6sy8OkY"
SUPABASE_BUCKET = "assets"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_articles(request):
    try:
        # This will raise an exception if Supabase fails
        response = supabase.table('articles').select('*').execute()

        return JsonResponse(response.data, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_GET
def get_article(request, article_id):
    try:
        response = supabase.table('articles').select('*').eq('id', article_id).execute()
        if not response.data:
            return JsonResponse({'error': 'Article not found'}, status=404)
        return JsonResponse(response.data[0])
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
def get_comments(request, article_id):
    try:
        # First get all comments for the article
        comments_response = supabase.table('comments').select('*').eq('article_id', article_id).execute()
        
        if not comments_response.data:
            return JsonResponse({'comments': [], 'count': 0}, status=200)
        
        # Get all unique user_ids from comments
        user_ids = list({comment['user_id'] for comment in comments_response.data if comment['user_id']})
        
        # Fetch usernames in a single query if there are any user_ids
        users = {}
        if user_ids:
            users_response = supabase.table('users').select('id,username').in_('id', user_ids).execute()
            users = {user['id']: user['username'] for user in users_response.data}
        
        # Enhance comments with usernames
        enhanced_comments = []
        for comment in comments_response.data:
            enhanced_comment = dict(comment)  # Create a copy
            enhanced_comment['username'] = users.get(comment['user_id']) if comment['user_id'] else None
            enhanced_comments.append(enhanced_comment)
        
        return JsonResponse({
            'comments': enhanced_comments,
            'count': len(enhanced_comments)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

