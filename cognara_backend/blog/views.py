from django.http import JsonResponse
from supabase import create_client
from django.views.decorators.http import require_GET
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime, timezone
from .helper import *
from django.contrib.auth.hashers import make_password
from django.conf import settings


SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY
SUPABASE_BUCKET = settings.SUPABASE_BUCKET

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

@api_view(['POST'])
@permission_classes([AllowAny])
def check_user(request):
    try:
        if user_unique(request.data.get('username')):
            return JsonResponse({'Found': 0}, status=200)
        else:
            return JsonResponse({'Found': 1}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    try:
        if email_unique(request.data.get('email')):
            return JsonResponse({'Found': 0}, status=200)
        else:
            return JsonResponse({'Found': 1}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def user_unique(username):
    user = supabase.table('users').select('username').eq('username', username.lower()).execute()

    if not user.data:
        return True
    else:
        return False

def email_unique(email):
    email = supabase.table('users').select('username').eq('email', email.lower()).execute()

    if not email.data:
        return True
    else:
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    try:
        # Extract and validate fields
        username = request.data.get('username').lower()
        email = request.data.get('email').lower()
        password = request.data.get('password_hash')
        firstname = request.data.get('first_name').lower()
        lastname = request.data.get('last_name').lower()

        # Check for required fields
        if not username or not email or not password:
            return JsonResponse({'error': 'username, email, and password are required.'}, status=401)

        # Check password strength
        if not is_strong_password(password):
            return JsonResponse({
                'error': 'Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            }, status=400)

        # Build user data
        data = {
            "username": username,
            "email": email,
            "password_hash": make_password(password),
            "first_name": firstname,
            "last_name": lastname,
            "bio": "Learner at Cognara"
        }

        # Insert into Supabase
        response = supabase.table("users").insert(data).execute()

        return JsonResponse({'message': 'Signup successful'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)