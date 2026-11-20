from django.urls import path, include
from .views import AgentListingViewSet, StaffListingViewSet, ListingImageViewSet
from .api_views import PropertyDetailAPIView, PropertyListAPIView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'my-listings', AgentListingViewSet, basename='agent-listing')
router.register(r'moderation/listings', StaffListingViewSet, basename='staff-listing')
router.register(r'my-listing-images', ListingImageViewSet, basename='listing-image')


urlpatterns = [
    path('api/properties/', PropertyListAPIView.as_view(), name='property-list-api'),
    path('api/properties/<int:pk>/', PropertyDetailAPIView.as_view(), name='property-detail-api'),
    path('api/', include(router.urls)),
]