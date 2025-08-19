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
from rest_framework.response import Response
import uuid
import math
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import json
from datetime import datetime, timezone, timedelta



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
    """
    Decorator to check if user is logged in via session
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if 'id' not in request.session:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(request, *args, **kwargs)
    return wrapper



def get_user(id):
    user = supabase.table('users').select('first_name, last_name').eq('id', id).execute()
    if not user.data:
        return False
    return user.data[0]


OPEN_STATUSES = ["started", "in_progress"]
FINAL_STATUSES = ["abandoned", "skimmed", "read", "read_deeply"]
VALID_STATUSES = OPEN_STATUSES + FINAL_STATUSES
OPEN_SESSION_WINDOW_MIN = 180

def estimate_required_time_seconds(article_id):
    try:
        resp = supabase.table("articles") \
            .select("content") \
            .eq("id", article_id).limit(1).execute()
        if resp.data:
            row = resp.data[0]
            content = row.get("content") or ""

            # strip HTML tags and count words
            text = re.sub(r"<[^>]+>", " ", content)
            words = len(re.findall(r"\b\w+\b", text))

            # assume ~200 wpm reading speed
            return max(30, math.ceil((words / 200) * 60))
    except Exception as e:
        print("Estimate failed:", e)

    return 30


def parse_request_data(request):
    """
    Be tolerant of sendBeacon/text/plain. Try request.data first, then raw body JSON.
    """
    data = {}
    try:
        # DRF will populate this when content-type JSON/form-encoded
        if hasattr(request, "data") and request.data:
            data = request.data
    except Exception:
        pass
    if not data:
        try:
            raw = request.body.decode("utf-8") if request.body else ""
            if raw:
                data = json.loads(raw)
        except Exception as e:
            print("Fallback body parse failed:", e)
    return data or {}

def find_latest_open_session(user_id, article_id):
    """
    Find latest session in started/in_progress. We'll check freshness window in Python.
    """
    try:
        resp = (supabase.table("article_reads")
                .select("id, session_id, status, scroll_depth, active_time_seconds, required_time_seconds, updated_at, created_at")
                .eq("user_id", user_id)
                .eq("article_id", article_id)
                .in_("status", OPEN_STATUSES)
                .order("updated_at", desc=True)
                .limit(1)
                .execute())
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print("Find latest open session failed:", e)
    return None

def is_recent(ts_str, minutes=OPEN_SESSION_WINDOW_MIN):
    try:
        # Supabase returns ISO timestamps; parse to aware datetime
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        return (datetime.now(timezone.utc) - ts) <= timedelta(minutes=minutes)
    except Exception:
        return False

def merge_progress(existing, incoming_status, incoming_depth, incoming_time):
    """
    Merge new progress into existing row, preserving max stats, and escalate status if needed.
    """
    new_depth = max(float(existing.get("scroll_depth") or 0.0), float(incoming_depth or 0.0))
    new_time = max(int(existing.get("active_time_seconds") or 0), int(incoming_time or 0))
    new_status = "completed" if incoming_status == "completed" else ("in_progress" if new_depth > 0 or new_time > 0 else existing.get("status") or "started")
    return new_status, new_depth, new_time


CLASSIFICATION_STATUSES = ["abandoned", "skimmed", "deep_read"]
def classify_read(scroll_depth, active_time, required_time):
    """Infer whether the read was abandoned, skimmed, or deep_read."""
    if scroll_depth < 30:
        return "abandoned"
    if scroll_depth >= 30 and active_time < 0.5 * required_time:
        return "skimmed"
    if scroll_depth >= 80 and active_time >= 0.8 * required_time:
        return "deep_read"
    return None

subjects = {"confirmation": "Your Cognara Confirmation Code"

             }


if __name__ == "__main__":
    send_email("Test", "This is a test email sent from Python using Outlook SMTP.", "mina.maged.pe@gmail.com")
