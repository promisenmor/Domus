from rest_framework import generics, filters
from .models import Property
from .serializers import PublicPropertySerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny



class PropertyListAPIView(generics.ListAPIView):
    queryset = Property.objects.filter(is_published=True)
    serializer_class = PublicPropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    ordering = ['-created_at', '-pk']

    filterset_fields = ['location', 'price']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at']
    permission_classes = [AllowAny]


class PropertyDetailAPIView(generics.RetrieveAPIView):
    queryset = Property.objects.filter(is_published=True)
    serializer_class = PublicPropertySerializer
    permission_classes = [AllowAny]

    