from django.conf import settings
from django.core import signing

EMAIL_VERIFICATION_SALT = 'account.email-verification'


def make_email_verification_token(user_id):
    return signing.dumps(user_id, salt=EMAIL_VERIFICATION_SALT)


def decode_email_verification_token(token):
    return signing.loads(
        token,
        salt=EMAIL_VERIFICATION_SALT,
        max_age=settings.EMAIL_VERIFICATION_TIMEOUT,
    )
