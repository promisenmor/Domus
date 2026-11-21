from rest_framework import serializers
from . models import Property
from .models import ListingImage, Enquiry


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
            'image', 'images', 'meta_title', 'meta_description', 'canonical_url',
            'created_at', 'published_at',
        ]
        read_only_fields = fields


class EnquirySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = Enquiry
        fields = [
            'id', 'property', 'property_title', 'client', 'assigned_agent',
            'name', 'email', 'phone_number', 'message', 'status',
            'internal_notes', 'follow_up_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'property_title', 'client', 'assigned_agent',
            'created_at', 'updated_at',
        ]

    def validate_property(self, listing):
        if listing.status != Property.Status.PUBLISHED or not listing.is_published:
            raise serializers.ValidationError('Enquiries can only be submitted for published listings.')
        return listing

