from django.urls import path
from . import views
from .api_views import PropertyListAPIView

urlpatterns = [
    path('api/properties/', PropertyListAPIView.as_view(), name='property-list-api'),
    
]