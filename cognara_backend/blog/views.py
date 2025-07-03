from django.http import JsonResponse
from supabase import create_client
from django.views.decorators.http import require_GET
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from datetime import datetime, timezone
from .helper import *
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.views.decorators.csrf import ensure_csrf_cookie


SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY
SUPABASE_BUCKET = settings.SUPABASE_BUCKET

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})


@require_frontend_token
@api_view(['GET'])
def get_articles(request):
    try:
        # This will raise an exception if Supabase fails
        response = supabase.table('articles').select('*').execute()

        return JsonResponse(response.data, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['GET'])
def get_article(request, article_id):
    try:
        response = supabase.table('articles').select('*').eq('id', article_id).execute()
        if not response.data:
            return JsonResponse({'error': 'Article not found'}, status=404)
        return JsonResponse(response.data[0])
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
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


@require_frontend_token
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


@require_frontend_token
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


@require_frontend_token
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


def emailtoID(email):
    try:
        response = supabase.table('users').select('id').eq('email', email.lower()).execute()
        user_data = response.data

        if not user_data:
            return False

        id = user_data[0]['id']
        return id
    except:
        return None


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def request_code(request):
    try:
        print(request)
        email = request.data.get('email')

        id = emailtoID(email)
        if not id:
            return JsonResponse({'error': 'User not found'}, status=404)

        code, _ = find_code(id)
        if code != -1:
            response = supabase.table("authtoken_token").delete().eq("user_id", id).execute()

        code = generate_code()
        if send_confirmation(code, email):
            data = {
                "user_id": id,
                "key": code,
                "created": datetime.now(timezone.utc).isoformat()
            }

            response = supabase.table("authtoken_token").insert(data).execute()
            return JsonResponse({'message': 'Code was sent successfully'}, status=200)
        else:
            return JsonResponse({'error': "Failed to send Email"}, status=500)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def find_code(id):
    try:
        response = supabase.table('authtoken_token').select('key, created').eq('user_id', id).execute()
        data = response.data

        if not data:
            return -1, 0

        code = data[0]['key']
        created = data[0]['created']

        created = datetime.fromisoformat(created)
        difference = (datetime.now(timezone.utc) - created).total_seconds() / 60.0
        return code, difference
    except Exception as e:
        print(e)
        return -1, -1


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    try:
        email = request.data.get('email')
        recieved_code = request.data.get('code')
        id = emailtoID(email)
        if not id:
            return JsonResponse({'error': 'User not found'}, status=400)

        code, diff = find_code(int(id))
        if diff > 10:
            return JsonResponse({'error': 'The Code has Expired'}, status=200)
        if int(recieved_code) == int(code):
            response = supabase.table("users").update({"email_verified": "True"}).eq("id", id).execute()
            return JsonResponse({'status': '1'}, status=200)
        else:
            return JsonResponse({'status': '0', "recieved_code": recieved_code, "code":code}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    credential = request.data.get('credential')
    if not credential:
        return Response({'detail': 'Missing credential'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

        # Get user info
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')

        # Check if user exists
        if email_unique(email):
            # Build user data
            data = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "bio": "Learner at Cognara",
                "email_verified": "True",
                "auth_provider": "Google",
            }

            # Insert into Supabase
            response = supabase.table("users").insert(data).execute()

            return JsonResponse({'status': 'success', "is_new": '1', "email": email}, status=200)
        else:
            data = {
                "first_name": first_name,
                "last_name": last_name,
                "email_verified": "True",
                "auth_provider": "Goolge",
            }

            response = supabase.table("users").update(data).eq("email", email).execute()
            return JsonResponse({'status': 'success', "is_new": '0', "email": email}, 200)
    except ValueError as e:
        # Invalid token
        return Response({'detail': 'Invalid token'}, status=400)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        email = request.data.get('email').lower()
        password = request.data.get('password_hash')

        response = supabase.table('users').select('password_hash').eq('email', email).execute()
        user_data = response.data
        if not user_data:
            return JsonResponse({'status': '0'}, status=200)
        hashed_password = user_data[0]['password_hash']
        if check_password(password, hashed_password):
            return JsonResponse({'status': '1'}, status=200)
        else:
            return JsonResponse({'status': '0'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def forgetpass(request):
    try:
        password = request.data.get('password')
        email = request.data.get('email').lower()

        data = {"password_hash": make_password(password)}
        response = supabase.table('users').update(data).eq('email', email).execute()
        user_data = response.data
        if not user_data:
            return JsonResponse({'status': '0'}, status=200)
        return JsonResponse({'status': '1'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_subscription(request):
    try:
        email = request.data.get('email', '')["email"]

        if not email:
            return JsonResponse({'error': 'Email is required'}, status=400)

        email = email.lower()

        data = {
            "email": email,
            "is_active": "True",
            "source": "website"
                }
        response = supabase.table('newsletter_subscribers').select("*").eq('email', email).execute()
        if response.data:
            return JsonResponse({'status': 'already registered'}, status=200)

        response = supabase.table('newsletter_subscribers').insert(data).execute()
        print(response.data)
        return JsonResponse({'status': 'success'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)