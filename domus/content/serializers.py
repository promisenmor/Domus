from rest_framework import serializers
from .models import BlogPost, Page, MenuItem


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'content', 'image', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'canonical_url',
        ]
        read_only_fields = fields


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = [
            'title', 'slug', 'body', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'canonical_url',
        ]
        read_only_fields = fields

class MenuItemSerializer(serializers.ModelSerializer):
    page_slug = serializers.SlugRelatedField(
        source='page',
        slug_field='slug',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = MenuItem
        fields = ['id', 'slug', 'name', 'url', 'page_slug', 'order']
        read_only_fields = fields

