from rest_framework import serializers
from . models import Property
from .models import ListingImage


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'caption', 'alt_text', 'is_primary', 'order']
        read_only_fields = ['id']


class PropertySerializers(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, required=False)

    class Meta:
        model = Property
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'short_description',
            'price',
            'location',
            'address',
            'city',
            'region',
            'postcode',
            'latitude',
            'longitude',
            'property_type',
            'listing_type',
            'bedrooms',
            'bathrooms',
            'reception_rooms',
            'parking',
            'garden',
            'balcony',
            'furnished',
            'currency',
            'price_frequency',
            'reference_number',
            'status',
            'image',
            'images',
            'is_published',
            'created_at',
            'updated_at',
            'published_at',
            'featured',
            'source',
            'external_id',
            'agent',
            'crm_id',
            'is_crm_synced',
            'manual_override',
        ]
        read_only_fields = [
            'slug',
            'agent',
            'is_published',
            'status',
            'published_at',
            'featured',
            'source',
            'external_id',
            'crm_id',
            'is_crm_synced',
            'manual_override',
        ]

    def create(self, validated_data):
        validated_data.pop('images', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('images', None)
        return super().update(instance, validated_data)


class PublicPropertySerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'slug', 'description', 'short_description', 'price',
            'location', 'address', 'city', 'region', 'postcode', 'latitude',
            'longitude', 'property_type', 'listing_type', 'bedrooms', 'bathrooms',
            'reception_rooms', 'parking', 'garden', 'balcony', 'furnished',
            'currency', 'price_frequency', 'reference_number', 'featured',
            'image', 'images', 'created_at', 'published_at',
        ]
        read_only_fields = fields

