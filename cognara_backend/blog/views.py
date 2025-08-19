from django.http import JsonResponse
from supabase import create_client
from rest_framework.response import Response

from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime, timezone
from .helper import *
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import time
from django.views.decorators.csrf import csrf_exempt




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
        response = supabase.table('articles').select('*').eq('status', 'published').execute()

        for res in range(len(response.data)):
            user = get_user(response.data[res]['author_id'])
            response.data[res]['author_first_name'] = user['first_name']
            response.data[res]['author_last_name'] = user['last_name']

        return JsonResponse(response.data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['GET'])
def user_articles(request):
    try:
        # This will raise an exception if Supabase fails
        response = supabase.table('articles').select('*').eq('author_id', request.session['id']).execute()

        for res in range(len(response.data)):
            user = get_user(response.data[res]['author_id'])
            response.data[res]['author_first_name'] = user['first_name']
            response.data[res]['author_last_name'] = user['last_name']

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

        user = get_user(response.data[0]['author_id'])
        response.data[0]['author_first_name'] = user['first_name']
        response.data[0]['author_last_name'] = user['last_name']

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

        response = supabase.table('users').select('*').eq('email', email).execute()
        user_data = response.data
        if not user_data:
            return JsonResponse({'status': '0'}, status=200)
        hashed_password = user_data[0]['password_hash']
        if check_password(password, hashed_password):
            
            request.session['id'] = user_data[0]['id']
            request.session['email'] = user_data[0]['email']
            request.session['username'] = user_data[0]['username']
            request.session['first_name'] = user_data[0]['first_name']
            request.session['last_name'] = user_data[0]['last_name']
            request.session['bio'] = user_data[0]['bio']
            request.session['email_verified'] = user_data[0]['email_verified']
            return JsonResponse({'status': '1'}, status=200)
        else:
            return JsonResponse({'status': '0'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def submit(request):
    try:
        article_id = request.data.get('article_id')  # None if not provided
        title = request.data.get('title')
        content = request.data.get('content')
        status = request.data.get('status')  # This should be a string

        if user_unique(request.session.get('username')):
            return JsonResponse({'error': 'User not found'}, status=400)

        data = {
            "title": title,
            "content": content,
            "author_id": request.session.get('id'),
            "status": status,
        }

        if article_id:
            response = supabase.table('articles').select('*').eq('id', article_id).execute()
            if not response.data:
                response = supabase.table('articles').insert(data).execute()
                message = 'Article created successfully'
            else:
                response = supabase.table('articles').update(data).eq('id', article_id).execute()
                message = 'Article updated successfully'
        else:
            response = supabase.table('articles').insert(data).execute()
            message = 'Article created successfully'


        if not response.data:
            return JsonResponse({'error': 'Database operation failed'}, status=500)

            

        return JsonResponse({
            'success': True,
            'message': message,
            'article_id': response.data[0]['id'],
            'data': response.data[0]
        }, status=201)
        
    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)



@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@require_session_login
@require_frontend_token
def logout(request):
    try:
        request.session.flush()
        return JsonResponse({'status': 'logged out'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['GET'])
def auth_status(request):
    if 'id' in request.session:
        print("True")
        return Response({
            'authenticated': True,
            'id': request.session['id'],
            'email': request.session['email'],
            'first_name': request.session['first_name'],
            'last_name' : request.session['last_name'],
            'bio': request.session['bio'],
            'email_verified': request.session['email_verified']
        })
    else:
        return Response({'authenticated': False})


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


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
@require_session_login
def upload_article_photo(request):
    try:
        article_id = request.data.get("article_id")
        file = request.FILES.get("file")

        if not article_id or not file:
            return JsonResponse({'error': 'article_id and file are required'}, status=400)

        try:
            article_id = int(article_id)
        except ValueError:
            return JsonResponse({'error': 'Invalid article_id'}, status=400)

        # Check if article exists
        response = supabase.table("articles").select("id").eq("id", article_id).execute()
        if not response.data:
            return JsonResponse({'error': 'Article not found'}, status=404)

        # Upload image to Supabase Storage
        filename = f"{int(time.time())}_{file.name}"
        storage_path = upload_article_image(article_id, file, filename)

        data = {
            "article_id": article_id,
            "path": storage_path,
        }

        # Insert image record into article_photos table
        insert_response = supabase.table("article_photos").insert(data).execute()

        # Get public URL
        public_url = supabase.storage.from_("article-photos").get_public_url(storage_path).get("publicURL")

        return JsonResponse({'status': '1'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def get_article_images(request):
    try:
        article_id = request.data.get("article_id")

        if not article_id:
            return JsonResponse({"error": "Missing article_id"}, status=400)

        try:
            article_id = int(article_id)
        except ValueError:
            return JsonResponse({"error": "Invalid article_id"}, status=400)

        # ✅ Get all photo paths for the article
        response = supabase.table("article_photos").select("path").eq("article_id", article_id).execute()

        images = []
        for item in response.data:
            path = item["path"]

            signed_url_data = supabase.storage.from_("article-photos").create_signed_url(path, 3600)  # 3600 seconds = 1 hour
            signed_url = signed_url_data.get("signedURL")

            images.append({
                "path": path,
                "url": signed_url
            })

        return JsonResponse({"images": images}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def post_comment(request):
    print("POST COMMENT VIEW CALLED")
    try:
        comment = request.data.get('comment')
        article_id = request.data.get('article_id')
        user_id = request.session.get('id')
        
        print(f"Comment: {comment}, Article ID: {article_id}, User ID: {user_id}")
        
        if not comment or not article_id:
            return Response({'error': 'Comment and Article ID are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_user(user_id)
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            'content': comment,
            'user_id': user_id,
            'article_id': article_id
        }

        response = supabase.table('comments').insert(data).execute()
        
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error in post_comment: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_article_image(request, article_id):
    try:
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.FILES['file']

        if not file_obj.name:
            return Response({"error": "File has no name"}, status=status.HTTP_400_BAD_REQUEST)

        # First, check if there are existing images for this article
        try:
            existing_images_response = supabase.table("article_photos").select("path").eq("article_id", article_id).execute()
            existing_images = existing_images_response.data
            
            # Delete existing images from storage and database
            if existing_images:
                print(f"Found {len(existing_images)} existing images for article {article_id}")
                
                # Delete from storage
                for image in existing_images:
                    try:
                        delete_res = supabase.storage.from_('article-photos').remove([image['path']])
                        print(f"Deleted image from storage: {image['path']}")
                    except Exception as delete_error:
                        print(f"Warning: Failed to delete image from storage {image['path']}: {delete_error}")
                        # Continue even if storage deletion fails
                
                # Delete from database
                try:
                    delete_db_res = supabase.table("article_photos").delete().eq("article_id", article_id).execute()
                    print(f"Deleted {len(existing_images)} records from article_photos table")
                except Exception as db_delete_error:
                    print(f"Warning: Failed to delete from database: {db_delete_error}")
                    # Continue even if database deletion fails
                    
        except Exception as cleanup_error:
            print(f"Warning: Error during cleanup: {cleanup_error}")
            # Continue with upload even if cleanup fails

        # Now upload the new image
        storage_path = f"{article_id}/{file_obj.name}"
        file_content = file_obj.read()

        # Upload to storage bucket - handle Supabase response properly
        try:
            # This is the corrected upload call
            res = supabase.storage.from_('article-photos').upload(
                path=storage_path,
                file=file_content,
                file_options={"content-type": file_obj.content_type}
            )

            public_url = supabase.storage.from_('article-photos').get_public_url(storage_path)

            # Check for errors in the Supabase response
            if hasattr(res, 'error') and res.error:
                raise Exception(f"Upload failed: {res.error.message}")
                
        except Exception as upload_error:
            raise Exception(f"Supabase upload error: {str(upload_error)}")

        # Insert new record into article_photos table
        data = {
            "article_id": article_id,
            "path": storage_path,
        }

        insert_res = supabase.table("article_photos").insert(data).execute()
        
        # Check for insert errors
        if hasattr(insert_res, 'error') and insert_res.error:
            raise Exception(f"Database insert failed: {insert_res.error}")

        print(f"Successfully uploaded new image for article {article_id}: {storage_path}")

        return Response({
            "url": public_url,  # Return URL instead of path
            "path": storage_path,
            "message": f"Image uploaded successfully. Replaced {len(existing_images) if existing_images else 0} existing images."
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error in upload_article_image: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def delete_article_image(request, article_id):
    try:
        # First check if the article exists
        article_response = supabase.table("articles").select("id").eq("id", article_id).execute()
        if not article_response.data:
            return Response({"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get all images for this article
        images_response = supabase.table("article_photos").select("path").eq("article_id", article_id).execute()
        if not images_response.data:
            return Response({"error": "No images found for this article"}, status=status.HTTP_404_NOT_FOUND)

        # Delete all images from storage
        paths_to_delete = [img['path'] for img in images_response.data]
        delete_res = supabase.storage.from_('article-photos').remove(paths_to_delete)
        
        # Delete records from article_photos table
        supabase.table("article_photos").delete().eq("article_id", article_id).execute()

        return Response({
            "message": f"Deleted {len(paths_to_delete)} images successfully",
            "deleted_paths": paths_to_delete
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def change_status(request):
    try:
        article_id = request.data.get('article_id')
        status = request.data.get('status')
        user_id = request.session.get('id')

        response = supabase.table('articles').select("*").eq('id', article_id).execute()
        if not response.data:
            return JsonResponse({'status': 'Article Not Found'}, status=404)
        if response.data[0]['author_id'] != user_id:
            return JsonResponse({'status': 'Unauthorized'}, status=403)

        if status in ['published', 'rejected']:
            return JsonResponse({'status': 'Unauthorized'}, status=403)

        # Update the article status to 'review'
        update_data = {
            "status": status,
        }
        response = supabase.table('articles').update(update_data).eq('id', article_id).execute()

        if not response.data:
            return JsonResponse({'error': 'Failed to update article status'}, status=500)

        return JsonResponse({'status': 'success', 'message': 'Article published for review'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


OPEN_STATUSES = ["started", "in_progress"]
VALID_STATUSES = ["started", "in_progress", "completed",
                  "abandoned", "skimmed", "deep_read"]
OPEN_SESSION_WINDOW_MIN = 180


def find_latest_open_session(user_id, article_id):
    try:
        # Get the latest session for this user and article
        response = (supabase.table("article_reads")
                   .select("*")
                   .eq("user_id", user_id)
                   .eq("article_id", article_id)
                   .order("created_at", desc=True)
                   .limit(1)
                   .execute())
        
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error finding latest session: {e}")
        return None

@require_frontend_token
@api_view(['POST'])
@permission_classes([AllowAny])
def log_article_read(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)

    try:
        data = parse_request_data(request)
        print("Parsed data:", data)

        user_id = data.get("user_id")
        article_id = data.get("article_id")
        status = data.get("status", "started")
        scroll_depth = data.get("scroll_depth", 0.0)
        active_time_seconds = data.get("active_time_seconds", 0)
        required_time_seconds = data.get("required_time_seconds")
        session_id = data.get("session_id")
        force_new_session = data.get("force_new_session", False)  # Add this parameter

        # Basic validation (same as before)
        if not user_id or not article_id:
            return JsonResponse({"success": False, "error": "user_id and article_id are required"}, status=400)

        try:
            user_id = int(user_id)
            article_id = int(article_id)
            scroll_depth = float(scroll_depth or 0)
            active_time_seconds = int(active_time_seconds or 0)
            if required_time_seconds is not None:
                required_time_seconds = int(required_time_seconds)
        except (ValueError, TypeError) as e:
            return JsonResponse({"success": False, "error": f"Invalid data types: {e}"}, status=400)

        if status not in VALID_STATUSES:
            return JsonResponse({"success": False, "error": f"status must be one of {VALID_STATUSES}"}, status=400)
        if not (0.0 <= scroll_depth <= 100.0):
            return JsonResponse({"success": False, "error": "scroll_depth must be between 0.0 and 100.0"}, status=400)
        if active_time_seconds < 0:
            return JsonResponse({"success": False, "error": "active_time_seconds must be non-negative"}, status=400)

        # -------------------------
        # 1) Update by session_id (only if not forcing new session)
        # -------------------------
        if session_id and not force_new_session:
            existing = (supabase.table("article_reads")
                        .select("id, session_id, status, scroll_depth, active_time_seconds, required_time_seconds")
                        .eq("session_id", session_id)
                        .limit(1).execute())
            if existing.data:
                row = existing.data[0]
                db_rts = int(row.get("required_time_seconds") or 0)
                if db_rts <= 0:
                    db_rts = required_time_seconds if (isinstance(required_time_seconds, int) and required_time_seconds > 0) else estimate_required_time_seconds(article_id)
                new_status, new_depth, new_time = merge_progress(row, status, scroll_depth, active_time_seconds)

                upd = {
                    "status": new_status,
                    "scroll_depth": new_depth,
                    "active_time_seconds": new_time,
                    "required_time_seconds": db_rts
                }

                if new_status == "completed":
                    classification = classify_read(new_depth, new_time, db_rts)
                    if classification:
                        upd["status"] = classification

                resp = (supabase.table("article_reads")
                        .update(upd)
                        .eq("session_id", session_id)
                        .execute())
                return JsonResponse({"success": True, "session_id": session_id, "data": resp.data[0] if resp.data else upd})

        # -------------------------
        # 2) Only recover recent sessions (page refresh scenario)
        # -------------------------
        if not force_new_session:
            latest = find_latest_open_session(user_id, article_id)
            # Only recover if very recent (5 minutes) - likely a page refresh
            if latest and is_recent(latest.get("updated_at") or latest.get("created_at") or "", minutes=5):
                db_rts = int(latest.get("required_time_seconds") or 0)
                if db_rts <= 0:
                    db_rts = required_time_seconds if (isinstance(required_time_seconds, int) and required_time_seconds > 0) else estimate_required_time_seconds(article_id)
                new_status, new_depth, new_time = merge_progress(latest, status, scroll_depth, active_time_seconds)

                upd = {
                    "status": new_status,
                    "scroll_depth": new_depth,
                    "active_time_seconds": new_time,
                    "required_time_seconds": db_rts
                }

                if new_status == "completed":
                    classification = classify_read(new_depth, new_time, db_rts)
                    if classification:
                        upd["status"] = classification

                resp = (supabase.table("article_reads")
                        .update(upd)
                        .eq("session_id", latest["session_id"])
                        .execute())
                return JsonResponse({"success": True, "session_id": latest["session_id"], "data": resp.data[0] if resp.data else upd})

        # -------------------------
        # 3) Create fresh session
        # -------------------------
        rts = required_time_seconds if (isinstance(required_time_seconds, int) and required_time_seconds > 0) else estimate_required_time_seconds(article_id)
        ins = {
            "user_id": user_id,
            "article_id": article_id,
            "status": "started",
            "scroll_depth": float(scroll_depth or 0.0),
            "active_time_seconds": int(active_time_seconds or 0),
            "required_time_seconds": rts
        }
        resp = supabase.table("article_reads").insert(ins).execute()
        if not resp.data:
            return JsonResponse({"success": False, "error": "Insert failed"}, status=500)
        row = resp.data[0]
        return JsonResponse({"success": True, "session_id": row["session_id"], "data": row})

    except Exception as e:
        import traceback
        print("Exception in log_article_read:", e)
        print(traceback.format_exc())
        return JsonResponse({"success": False, "error": str(e)}, status=400)