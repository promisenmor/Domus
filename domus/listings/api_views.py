from rest_framework import generics, filters
from .models import Property
from .serializers import PropertySerializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated



class PropertyListAPIView(generics.ListAPIView):
    queryset = Property.objects.filter(is_published=True)
    serializer_class = PropertySerializers
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]


    filterset_fields = ['location', 'price']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at']
    permission_classes = [IsAuthenticated]

    