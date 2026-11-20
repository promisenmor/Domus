import logging
import uuid

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core import signing
from django.db import transaction
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from listings.models import Property
from .tokens import decode_email_verification_token

User = get_user_model()
logger = logging.getLogger(__name__)


def blacklist_user_refresh_tokens(user):
    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)


class UserRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=301, trim_whitespace=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def to_internal_value(self, data):
        extra_fields = set(data) - set(self.fields)
        if extra_fields:
            raise serializers.ValidationError({
                field: 'This field is not accepted during registration.'
                for field in sorted(extra_fields)
            })
        return super().to_internal_value(data)

    def validate_full_name(self, value):
        parts = value.split(maxsplit=1)
        if len(parts[0]) > 150 or (len(parts) == 2 and len(parts[1]) > 150):
            raise serializers.ValidationError('First and last names must be at most 150 characters.')
        return value

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email address already exists.')
        return value

    def validate(self, attrs):
        name_parts = attrs['full_name'].split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) == 2 else ''
        candidate = User(
            username=uuid.uuid4().hex,
            email=attrs['email'],
            first_name=first_name,
            last_name=last_name,
        )
        try:
            validate_password(attrs['password'], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages}) from exc
        return attrs

    def create(self, validated_data):
        full_name = validated_data['full_name']
        name_parts = full_name.split(maxsplit=1)
        return User.objects.create_user(
            username=uuid.uuid4().hex,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) == 2 else '',
            role='CLIENT',
            is_verified=False,
        )

    def to_representation(self, instance):
        return {
            'full_name': instance.get_full_name(),
            'email': instance.email,
        }


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        users = list(
            User.objects.filter(email__iexact=attrs['email'], is_active=True)[:2]
        )
        if len(users) > 1:
            logger.warning('Rejected login because the email maps to multiple active accounts.')
        if len(users) != 1 or not users[0].check_password(attrs['password']):
            raise AuthenticationFailed('Invalid email or password.')

        user = users[0]
        if not user.is_verified:
            raise AuthenticationFailed('Verify your email address before logging in.')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError('Invalid or expired refresh token.') from exc

        request_user_id = str(self.context['request'].user.pk)
        if str(token.get('user_id')) != request_user_id:
            raise serializers.ValidationError('Refresh token does not belong to this user.')

        self.refresh_token = token
        return value

    def save(self, **kwargs):
        self.refresh_token.blacklist()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({
                'current_password': 'Current password is incorrect.'
            })
        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError({
                'new_password': 'Choose a password different from your current password.'
            })
        try:
            validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'new_password': exc.messages}) from exc

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        with transaction.atomic():
            user.set_password(self.validated_data['new_password'])
            user.save(update_fields=['password'])
            blacklist_user_refresh_tokens(user)
        return user


class ResendEmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate(self, attrs):
        try:
            user_id = decode_email_verification_token(attrs['token'])
            user = User._default_manager.get(pk=user_id, is_active=True)
        except (signing.BadSignature, TypeError, ValueError, User.DoesNotExist) as exc:
            raise serializers.ValidationError(
                {'token': 'Invalid or expired verification link.'}
            ) from exc

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        if not user.is_verified:
            user.is_verified = True
            user.save(update_fields=['is_verified'])
        return user


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs['uid']))
            user = User._default_manager.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError({'token': 'Invalid or expired reset link.'}) from exc

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Invalid or expired reset link.'})

        try:
            validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'new_password': exc.messages}) from exc

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        with transaction.atomic():
            user.set_password(self.validated_data['new_password'])
            user.save(update_fields=['password'])
            blacklist_user_refresh_tokens(user)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'company',
            'license_number',
            'role',
            'is_verified',
        ]
        read_only_fields = ['username', 'email', 'role', 'is_verified']


class SavedListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'title', 'slug', 'price', 'location', 'city', 'image']
