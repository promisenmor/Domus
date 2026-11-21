from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import BlogPost, Page, MenuItem
from .serializers import BlogPostSerializer, PageSerializer, MenuItemSerializer

class BlogPostListAPIView(generics.ListAPIView):
    queryset = BlogPost.objects.filter(published=True).order_by('-created_at', '-pk')
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]


class BlogPostDetailAPIView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.filter(published=True)
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class PageListAPIView(generics.ListAPIView):
    queryset = Page.objects.filter(is_active=True).order_by('title', 'pk')
    serializer_class = PageSerializer
    permission_classes = [AllowAny]


class PageDetailAPIView(generics.RetrieveAPIView):
    queryset = Page.objects.filter(is_active=True)
    serializer_class = PageSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class MenuListAPIView(generics.ListAPIView):
    queryset = MenuItem.objects.filter(is_visible=True).order_by('order', 'pk')
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    