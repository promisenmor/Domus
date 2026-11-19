from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from account.tasks import (
    send_email_verification,
    send_password_reset_email,
    send_welcome_email,
)
from account.tokens import make_email_verification_token

User = get_user_model()


class RegistrationAndLoginTests(APITestCase):
    def test_registration_accepts_full_name_email_password_and_queues_welcome_email(self):
        data = {
            'full_name': 'Test User',
            'email': 'TEST@example.com',
            'password': 'pT8!vK2#rQ9$zL4',
        }

        with patch('account.views.send_welcome_email.delay') as send_welcome, \
                self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(reverse('user-register'), data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data, {
            'full_name': 'Test User',
            'email': 'test@example.com',
        })
        user = User.objects.get(email='test@example.com')
        self.assertEqual(user.get_full_name(), 'Test User')
        self.assertEqual(user.role, 'CLIENT')
        self.assertFalse(user.is_verified)
        self.assertTrue(user.check_password(data['password']))
        send_welcome.assert_called_once_with(user.pk)

    def test_registration_rejects_fields_outside_the_auth_contract(self):
        response = self.client.post(reverse('user-register'), {
            'full_name': 'Test User',
            'email': 'test@example.com',
            'password': 'pT8!vK2#rQ9$zL4',
            'role': 'ADMIN',
            'license_number': 'LIC-123',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email='test@example.com').exists())

    def test_registration_rejects_duplicate_email(self):
        User.objects.create_user(
            username='existing',
            email='test@example.com',
            password='existing-password',
        )

        response = self.client.post(reverse('user-register'), {
            'full_name': 'Another User',
            'email': 'TEST@example.com',
            'password': 'pT8!vK2#rQ9$zL4',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_uses_email_and_returns_jwt_pair(self):
        user = User.objects.create_user(
            username='internal-user-name',
            email='test@example.com',
            password='pT8!vK2#rQ9$zL4',
        )

        response = self.client.post(reverse('auth-login'), {
            'email': 'TEST@example.com',
            'password': 'pT8!vK2#rQ9$zL4',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(RefreshToken(response.data['refresh'])['user_id'], user.pk)

    def test_login_rejects_incorrect_password(self):
        User.objects.create_user(
            username='internal-user-name',
            email='test@example.com',
            password='pT8!vK2#rQ9$zL4',
        )

        response = self.client.post(reverse('auth-login'), {
            'email': 'test@example.com',
            'password': 'incorrect-password',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_requires_verified_email(self):
        User.objects.create_user(
            username='unverified-user',
            email='unverified@example.com',
            password='pT8!vK2#rQ9$zL4',
            is_verified=False,
        )

        response = self.client.post(reverse('auth-login'), {
            'email': 'unverified@example.com',
            'password': 'pT8!vK2#rQ9$zL4',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AuthLifecycleTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='auth-user',
            email='auth@example.com',
            password='pT8!vK2#rQ9$zL4',
        )

    def test_logout_blacklists_the_authenticated_users_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse('auth-logout'), {'refresh': str(refresh)})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            BlacklistedToken.objects.filter(token__token=str(refresh)).exists()
        )

    def test_logout_rejects_another_users_refresh_token(self):
        other_user = User.objects.create_user(
            username='other-user',
            email='other@example.com',
            password='pT8!vK2#rQ9$zL4',
        )
        refresh = RefreshToken.for_user(other_user)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse('auth-logout'), {'refresh': str(refresh)})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            BlacklistedToken.objects.filter(token__token=str(refresh)).exists()
        )

    def test_forgot_password_queues_email_without_disclosing_account_existence(self):
        with patch('account.views.send_password_reset_email.delay') as send_reset, \
                self.captureOnCommitCallbacks(execute=True):
            known_response = self.client.post(
                reverse('password-forgot'),
                {'email': self.user.email},
            )
        unknown_response = self.client.post(
            reverse('password-forgot'),
            {'email': 'missing@example.com'},
        )

        self.assertEqual(known_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(known_response.data, unknown_response.data)
        send_reset.assert_called_once_with(self.user.pk)

    def test_password_reset_changes_password_and_blacklists_old_refresh_tokens(self):
        refresh = RefreshToken.for_user(self.user)
        outstanding = OutstandingToken.objects.get(token=str(refresh))
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(reverse('password-reset'), {
            'uid': uid,
            'token': token,
            'new_password': 'New!Password9284',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('New!Password9284'))
        self.assertTrue(BlacklistedToken.objects.filter(token=outstanding).exists())

    def test_password_change_requires_current_password_and_revokes_refresh_tokens(self):
        refresh = RefreshToken.for_user(self.user)
        outstanding = OutstandingToken.objects.get(token=str(refresh))
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse('password-change'), {
            'current_password': 'pT8!vK2#rQ9$zL4',
            'new_password': 'Changed!Password382',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Changed!Password382'))
        self.assertTrue(BlacklistedToken.objects.filter(token=outstanding).exists())

    def test_password_change_rejects_incorrect_current_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse('password-change'), {
            'current_password': 'incorrect-password',
            'new_password': 'Changed!Password382',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_rejects_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(reverse('password-reset'), {
            'uid': uid,
            'token': 'invalid-token',
            'new_password': 'New!Password9284',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_requires_authentication_and_role_is_read_only(self):
        url = reverse('user-profile')
        self.assertEqual(self.client.get(url).status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(url, {
            'first_name': 'Domus',
            'email': 'new@example.com',
            'role': 'ADMIN',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Domus')
        self.assertEqual(self.user.email, 'auth@example.com')
        self.assertEqual(self.user.role, 'CLIENT')

    def test_email_verification_activates_unverified_account(self):
        self.user.is_verified = False
        self.user.save(update_fields=['is_verified'])
        token = make_email_verification_token(self.user.pk)

        response = self.client.post(reverse('email-verify'), {'token': token})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)

        login_response = self.client.post(reverse('auth-login'), {
            'email': self.user.email,
            'password': 'pT8!vK2#rQ9$zL4',
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_email_verification_rejects_invalid_token(self):
        response = self.client.post(
            reverse('email-verify'),
            {'token': 'invalid-token'},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_verification_rejects_expired_token(self):
        token = make_email_verification_token(self.user.pk)

        with override_settings(EMAIL_VERIFICATION_TIMEOUT=-1):
            response = self.client.post(reverse('email-verify'), {'token': token})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_email_verification_is_generic_and_queues_only_unverified_accounts(self):
        self.user.is_verified = False
        self.user.save(update_fields=['is_verified'])

        with patch('account.views.send_email_verification.delay') as send_verification, \
                self.captureOnCommitCallbacks(execute=True):
            known_response = self.client.post(
                reverse('email-verify-resend'),
                {'email': self.user.email},
            )
        unknown_response = self.client.post(
            reverse('email-verify-resend'),
            {'email': 'missing@example.com'},
        )

        self.assertEqual(known_response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(known_response.data, unknown_response.data)
        send_verification.assert_called_once_with(self.user.pk)


class UserEmailTaskTests(TestCase):
    def test_welcome_email_is_sent_by_celery_task(self):
        mail.outbox.clear()
        user = User.objects.create_user(
            username='task-user',
            email='task@example.com',
            password='pT8!vK2#rQ9$zL4',
            first_name='Task User',
            is_verified=False,
        )

        with override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'
        ):
            send_welcome_email.run(user.pk)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [user.email])
        self.assertIn('Welcome to Domus', mail.outbox[0].subject)
        self.assertIn('verify-email?token=', mail.outbox[0].body)

    def test_password_reset_email_contains_frontend_reset_link(self):
        mail.outbox.clear()
        user = User.objects.create_user(
            username='reset-task-user',
            email='reset-task@example.com',
            password='pT8!vK2#rQ9$zL4',
            first_name='Reset User',
        )

        with override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
            FRONTEND_BASE_URL='https://app.example.com/',
        ):
            send_password_reset_email.run(user.pk)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('https://app.example.com/reset-password?uid=', mail.outbox[0].body)
        self.assertIn('&token=', mail.outbox[0].body)

    def test_verification_email_contains_verification_link(self):
        mail.outbox.clear()
        user = User.objects.create_user(
            username='verify-task-user',
            email='verify-task@example.com',
            password='pT8!vK2#rQ9$zL4',
            is_verified=False,
        )

        with override_settings(
            EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
            FRONTEND_BASE_URL='https://app.example.com',
        ):
            send_email_verification.run(user.pk)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('https://app.example.com/verify-email?token=', mail.outbox[0].body)
