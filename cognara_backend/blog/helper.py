import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from django.http import JsonResponse
import re
import random
import os
from supabase import create_client
from functools import wraps


SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY
SUPABASE_BUCKET = {'Articles':'article-photos', "Assets": 'assets'}

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_email(subject, body, to_email):
    from_email = settings.EMAIL_HOST_USER
    app_password = settings.EMAIL_HOST_PASSWORD

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    with smtplib.SMTP(settings.EMAIL_HOST, 587) as server:
        server.starttls()
        server.login(from_email, app_password)
        server.send_message(msg)

    print("✅ Email sent!")


def send_confirmation(code, to_email):
    try:
        from_email = settings.EMAIL_HOST_USER
        app_password = settings.EMAIL_HOST_PASSWORD

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subjects["confirmation"]
        msg["From"] = from_email
        msg["To"] = to_email

        text_part = f"Your Cognara confirmation code is: {code}\n\nIt expires in 10 minutes."

        template_path = os.path.join(settings.BASE_DIR, 'emails', 'confirmation.html')
        with open(template_path, 'r', encoding='utf-8') as file:
            html_template = file.read()
        html_part = html_template.replace('{code}', code)

        msg.attach(MIMEText(text_part, "plain"))
        msg.attach(MIMEText(html_part, "html"))

        with smtplib.SMTP(settings.EMAIL_HOST, 587) as server:
            server.starttls()
            server.login(from_email, app_password)
            server.send_message(msg)

        print("✅ Email sent!")
        return True
    except:
        return False


def is_strong_password(password):
    if len(password) < 12:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=/\\[\]`~']", password):
        return False
    return True

def generate_code():
    return str(random.randint(100000, 999999))


def require_frontend_token(view_func):
    def wrapped_view(request, *args, **kwargs):
        token = request.headers.get('App-Token')
        if token != settings.FRONTEND_API_TOKEN:
            return JsonResponse({'error': 'Unauthorized access'}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapped_view

def require_session_login(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        print("SESSION DATA:", request.session.items())
        if 'id' not in request.session:
            print('Session missing user id')
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def get_user(id):
    user = supabase.table('users').select('first_name, last_name').eq('id', id).execute()
    if not user.data:
        return False
    return user.data[0]


def upload_article_image(article_id, file_obj, filename):
    storage_path = f"{article_id}/{filename}"

    # Upload to storage bucket
    response = supabase.storage.from_('article-photos').upload(storage_path, file_obj)
    if response.get("error"):
        raise Exception("Upload failed: " + str(response["error"]))

    return storage_path


subjects = {"confirmation": "Your Cognara Confirmation Code"

             }


if __name__ == "__main__":
    send_email("Test", "This is a test email sent from Python using Outlook SMTP.", "mina.maged.pe@gmail.com")
