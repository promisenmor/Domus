from rest_framework import serializers
from .models import *


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        models = Page
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        models = MenuItem
        fields = '__all__'

