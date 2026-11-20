from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Property, ListingImage
from .serializers import PropertySerializers, ListingImageSerializer

class IsAgentAndOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'AGENT'

    def has_object_permission(self, request, view, obj):
        return obj.agent == request.user
    

class AgentListingViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializers
    permission_classes = [permissions.IsAuthenticated, IsAgentAndOwner]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Property.objects.none()
        return Property.objects.filter(agent=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(
            agent=self.request.user,
            status=Property.Status.DRAFT,
            is_published=False,
            source=Property.Source.MANUAL,
        )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        listing = self.get_object()
        if listing.status in [Property.Status.PUBLISHED, Property.Status.PENDING_REVIEW]:
            return Response(
                {'detail': 'This listing cannot be submitted in its current status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        listing.status = Property.Status.PENDING_REVIEW
        listing.save(update_fields=['status', 'updated_at'])
        return Response(PropertySerializers(listing, context={'request': request}).data)


class IsStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ('STAFF', 'ADMIN') or request.user.is_superuser
        )


class StaffListingViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('agent').prefetch_related('images')
    serializer_class = PropertySerializers
    permission_classes = [permissions.IsAuthenticated, IsStaffOrAdmin]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        listing = self.get_object()
        listing.status = Property.Status.PUBLISHED
        listing.is_published = True
        listing.published_at = timezone.now()
        listing.save(update_fields=['status', 'is_published', 'published_at', 'updated_at'])
        return Response(PropertySerializers(listing, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        listing = self.get_object()
        listing.status = Property.Status.DRAFT
        listing.is_published = False
        listing.save(update_fields=['status', 'is_published', 'updated_at'])
        return Response(PropertySerializers(listing, context={'request': request}).data)


class ListingImageViewSet(viewsets.ModelViewSet):
    serializer_class = ListingImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        return super().get_permissions()

    def has_permission_guard(self, request):
        return request.user.is_authenticated and request.user.role == 'AGENT'

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not self.has_permission_guard(request):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only agents can manage listing images.')

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ListingImage.objects.none()
        return ListingImage.objects.filter(property__agent=self.request.user)

    def perform_create(self, serializer):
        property_id = self.request.data.get('property')
        listing = Property.objects.filter(pk=property_id, agent=self.request.user).first()
        if listing is None:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only upload images for your own listings.')
        serializer.save(property=listing)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        listing = self.get_object()
        listing.status = Property.Status.ARCHIVED
        listing.is_published = False
        listing.save(update_fields=['status', 'is_published', 'updated_at'])
        return Response(PropertySerializers(listing, context={'request': request}).data)



    
