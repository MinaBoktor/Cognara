import smtplib
from email.mime.text import MIMEText
from django.conf import settings
import re

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


if __name__ == "__main__":
    send_email("Test", "This is a test email sent from Python using Outlook SMTP.", "mina.maged.pe@gmail.com")
