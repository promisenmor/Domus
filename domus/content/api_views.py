from rest_framework import generics
from .models import *
from .serializers import *

class BlogPostListAPIView(generics.ListAPIView):
    queryset = BlogPost.objects.filter(published=True)
    serializer_class = BlogPostSerializer


class PageListAPIView(generics.ListAPIView):
    queryset = Page.objects.filter(is_active=True)
    serializer_class = PageSerializer


class MenuListAPIView(generics.ListAPIView):
    queryset = MenuItem.objects.filter(is_visible=True)
    serializer_class = MenuItemSerializer

    