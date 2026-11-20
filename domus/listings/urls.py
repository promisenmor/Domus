from django.urls import path, include
from .views import (
    AgentListingViewSet,
    StaffListingViewSet,
    ListingImageViewSet,
    EnquiryCreateAPIView,
    AgentEnquiryViewSet,
)
from .api_views import PropertyDetailAPIView, PropertyListAPIView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'my-listings', AgentListingViewSet, basename='agent-listing')
router.register(r'moderation/listings', StaffListingViewSet, basename='staff-listing')
router.register(r'my-listing-images', ListingImageViewSet, basename='listing-image')
router.register(r'my-enquiries', AgentEnquiryViewSet, basename='agent-enquiry')


urlpatterns = [
    path('api/properties/', PropertyListAPIView.as_view(), name='property-list-api'),
    path('api/properties/<int:pk>/', PropertyDetailAPIView.as_view(), name='property-detail-api'),
    path('api/enquiries/', EnquiryCreateAPIView.as_view(), name='enquiry-create-api'),
    path('api/', include(router.urls)),
]