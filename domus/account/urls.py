from django.urls import path
from .views import RegisterUserAPIView, SavedListingAPIView

urlpatterns = [
    path('api/register/', RegisterUserAPIView.as_view(), name='user-register'),
    path('saved-listing/', SavedListingAPIView.as_view(), name='saved-listings'),
]

