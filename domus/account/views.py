import logging

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    EmailLoginSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    LogoutSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    ResendEmailVerificationSerializer,
    SavedListingSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)
from .tasks import (
    send_email_verification,
    send_password_reset_email,
    send_welcome_email,
)
from listings.models import Property

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterUserAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        transaction.on_commit(lambda: send_welcome_email.delay(user.pk))


class CurrentUserAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class EmailLoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        request=EmailLoginSerializer,
        responses={
            200: inline_serializer(
                name='AuthTokens',
                fields={
                    'access': serializers.CharField(),
                    'refresh': serializers.CharField(),
                },
            )
        },
    )
    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class EmailVerificationAPIView(generics.GenericAPIView):
    serializer_class = EmailVerificationSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=EmailVerificationSerializer,
        responses={
            200: inline_serializer(
                name='EmailVerificationResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Email address verified successfully.'})


class EmailVerificationResendAPIView(generics.GenericAPIView):
    serializer_class = ResendEmailVerificationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        request=ResendEmailVerificationSerializer,
        responses={
            202: inline_serializer(
                name='EmailVerificationResendResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        users = list(
            User.objects.filter(
                email__iexact=serializer.validated_data['email'],
                is_active=True,
                is_verified=False,
            ).exclude(email='')[:2]
        )
        if len(users) == 1:
            user_id = users[0].pk
            transaction.on_commit(lambda: send_email_verification.delay(user_id))
        elif len(users) > 1:
            logger.warning(
                'Skipped email verification because the email maps to multiple active accounts.'
            )
        return Response(
            {'detail': 'If the account requires verification, instructions will be sent.'},
            status=202,
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LogoutSerializer,
        responses={
            200: inline_serializer(
                name='LogoutResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = LogoutSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Logged out successfully.'})


class PasswordChangeAPIView(generics.GenericAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PasswordChangeSerializer,
        responses={
            200: inline_serializer(
                name='PasswordChangeResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'})


class ForgotPasswordAPIView(generics.GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(
        request=ForgotPasswordSerializer,
        responses={
            202: inline_serializer(
                name='ForgotPasswordResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        users = list(
            User.objects.filter(
                email__iexact=serializer.validated_data['email'],
                is_active=True,
            ).exclude(email='')[:2]
        )
        if len(users) == 1:
            user_id = users[0].pk
            transaction.on_commit(lambda: send_password_reset_email.delay(user_id))
        elif len(users) > 1:
            logger.warning(
                'Skipped password reset because the email maps to multiple active accounts.'
            )
        return Response(
            {'detail': 'If an account exists for this email, password reset instructions will be sent.'},
            status=202,
        )


class PasswordResetConfirmAPIView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={
            200: inline_serializer(
                name='PasswordResetResponse',
                fields={'detail': serializers.CharField()},
            )
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password has been reset successfully.'})


class SavedListingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses=SavedListingSerializer(many=True))
    def get(self, request):
        listings = request.user.saved_listings.all()
        serializer = SavedListingSerializer(listings, many=True)
        return Response(serializer.data)

    @extend_schema(
        request=inline_serializer(
            name='SavedListingRequest',
            fields={'listing_id': serializers.IntegerField()},
        ),
        responses={
            200: inline_serializer(
                name='SavedListingAdded',
                fields={'message': serializers.CharField()},
            ),
            404: inline_serializer(
                name='SavedListingNotFound',
                fields={'message': serializers.CharField()},
            ),
        },
    )
    def post(self, request):
        listing_id = request.data.get('listing_id')
        try:
            listing = Property.objects.get(id=listing_id)
            request.user.saved_listings.add(listing)
            return Response({"message": "Listing added to favourites. "})
        except Property.DoesNotExist:
            return Response({"message": "Listing not found"}, status=404)

    @extend_schema(
        request=inline_serializer(
            name='SavedListingRemovalRequest',
            fields={'listing_id': serializers.IntegerField()},
        ),
        responses={
            200: inline_serializer(
                name='SavedListingRemoved',
                fields={'message': serializers.CharField()},
            ),
            404: inline_serializer(
                name='SavedListingRemovalNotFound',
                fields={'error': serializers.CharField()},
            ),
        },
    )
    def delete(self, request):
        listing_id = request.data.get('listing_id')
        try:
            listing = Property.objects.get(id=listing_id)
            request.user.saved_listings.remove(listing)
            return Response({"message": "This Listing has been removed from your favourites. "})
        except Property.DoesNotExist:
            return Response({"error": "Listing not found. "}, status=404)