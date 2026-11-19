import smtplib
from urllib.parse import urlencode

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .tokens import make_email_verification_token

User = get_user_model()


def _verification_instructions(user):
    token = make_email_verification_token(user.pk)
    verification_url = (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}/verify-email?"
        f"{urlencode({'token': token})}"
    )
    return (
        f'Hello {user.get_full_name()},\n\n'
        'Verify your email address to activate your account:'
        f'\n{verification_url}'
    )


@shared_task(
    autoretry_for=(OSError, smtplib.SMTPException),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
)
def send_welcome_email(user_id):
    user = User.objects.get(pk=user_id)
    message = f'Hello {user.get_full_name()},\n\nWelcome to Domus.'
    if not user.is_verified:
        message += f'\n\n{_verification_instructions(user)}'
    send_mail(
        subject='Welcome to Domus',
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@shared_task(
    autoretry_for=(OSError, smtplib.SMTPException),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
)
def send_email_verification(user_id):
    user = User.objects.get(pk=user_id)
    if user.is_active and not user.is_verified:
        send_mail(
            subject='Verify your Domus email',
            message=_verification_instructions(user),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


@shared_task(
    autoretry_for=(OSError, smtplib.SMTPException),
    retry_backoff=True,
    retry_kwargs={'max_retries': 3},
)
def send_password_reset_email(user_id):
    user = User.objects.get(pk=user_id)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_url = (
        f"{settings.FRONTEND_BASE_URL.rstrip('/')}"
        f"/reset-password?uid={uid}&token={token}"
    )
    send_mail(
        subject='Reset your Domus password',
        message=(
            f'Hello {user.get_full_name()},\n\n'
            f'Use this link to reset your password:\n{reset_url}\n\n'
            'If you did not request a password reset, you can ignore this email.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
