from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Property
from .serializers import PropertySerializers

class IsAgentAndOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'AGENT' and obj.agent == request.user
    

class AgentListingViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializers
    permission_classes = [permissions.IsAuthenticated, IsAgentAndOwner]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Property.objects.none()
        return Property.objects.filter(agent=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(agent=self.request.user)



    
