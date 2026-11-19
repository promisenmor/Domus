from rest_framework import serializers
from . models import Property


class PropertySerializers(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'id',
            'title',
            'description',
            'price',
            'location',
            'image',
            'is_published',
            'created_at',
            'updated_at',
            'agent',
            'crm_id',
            'is_crm_synced',
            'manual_override',
        ]
        read_only_fields = [
            'agent',
            'is_published',
            'crm_id',
            'is_crm_synced',
            'manual_override',
        ]


class PublicPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'price', 'location', 'image', 'created_at']
        read_only_fields = fields

