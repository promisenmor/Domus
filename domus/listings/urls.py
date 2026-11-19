from django.urls import path, include
from .views import AgentListingViewSet
from .api_views import PropertyDetailAPIView, PropertyListAPIView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'my-listings', AgentListingViewSet, basename='agent-listing')


urlpatterns = [
    path('api/properties/', PropertyListAPIView.as_view(), name='property-list-api'),
    path('api/properties/<int:pk>/', PropertyDetailAPIView.as_view(), name='property-detail-api'),
    path('api/', include(router.urls)),
]