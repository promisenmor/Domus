from rest_framework import generics, filters
from .models import Property
from .serializers import PublicPropertySerializer
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from rest_framework.permissions import AllowAny



class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    min_bathrooms = django_filters.NumberFilter(field_name='bathrooms', lookup_expr='gte')
    status = django_filters.ChoiceFilter(
        field_name='status',
        choices=((Property.Status.PUBLISHED, 'Published'),),
    )

    class Meta:
        model = Property
        fields = [
            'location', 'city', 'region', 'postcode', 'property_type',
            'listing_type', 'bedrooms', 'bathrooms', 'parking', 'garden',
            'balcony', 'furnished', 'featured',
        ]


class PropertyListAPIView(generics.ListAPIView):
    queryset = Property.objects.filter(status=Property.Status.PUBLISHED, is_published=True).select_related('agent').prefetch_related('images')
    serializer_class = PublicPropertySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    ordering = ['-created_at', '-pk']

    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'short_description', 'location', 'address', 'city', 'region', 'postcode']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'bathrooms']
    permission_classes = [AllowAny]


class PropertyDetailAPIView(generics.RetrieveAPIView):
    queryset = Property.objects.filter(status=Property.Status.PUBLISHED, is_published=True).select_related('agent').prefetch_related('images')
    serializer_class = PublicPropertySerializer
    permission_classes = [AllowAny]

    