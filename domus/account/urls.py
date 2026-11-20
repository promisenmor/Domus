from django.urls import path
from .views import (
    CurrentUserAPIView,
    EmailLoginAPIView,
    EmailVerificationAPIView,
    EmailVerificationResendAPIView,
    ForgotPasswordAPIView,
    LogoutAPIView,
    PasswordChangeAPIView,
    PasswordResetConfirmAPIView,
    RegisterUserAPIView,
    SavedListingAPIView,
)

urlpatterns = [
    path('api/register/', RegisterUserAPIView.as_view(), name='user-register'),
    path('api/me/', CurrentUserAPIView.as_view(), name='user-profile'),
    path('api/auth/login/', EmailLoginAPIView.as_view(), name='auth-login'),
    path('api/auth/email/verify/', EmailVerificationAPIView.as_view(), name='email-verify'),
    path('api/auth/email/verification/resend/', EmailVerificationResendAPIView.as_view(), name='email-verify-resend'),
    path('api/auth/logout/', LogoutAPIView.as_view(), name='auth-logout'),
    path('api/auth/password/change/', PasswordChangeAPIView.as_view(), name='password-change'),
    path('api/auth/password/forgot/', ForgotPasswordAPIView.as_view(), name='password-forgot'),
    path('api/auth/password/reset/', PasswordResetConfirmAPIView.as_view(), name='password-reset'),
    path('saved-listing/', SavedListingAPIView.as_view(), name='saved-listings'),
    path('api/saved-listings/', SavedListingAPIView.as_view(), name='saved-listings-api'),
]

