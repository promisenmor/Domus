from django.urls import path
from .api_views import (
    BlogPostDetailAPIView,
    BlogPostListAPIView,
    MenuListAPIView,
    PageDetailAPIView,
    PageListAPIView,
)

urlpatterns = [
    path('api/blog-posts/', BlogPostListAPIView.as_view(), name='blog-posts-api'),
    path('api/blog-posts/<slug:slug>/', BlogPostDetailAPIView.as_view(), name='blog-post-detail-api'),
    path('api/pages/', PageListAPIView.as_view(), name='pages-api'),
    path('api/pages/<slug:slug>/', PageDetailAPIView.as_view(), name='page-detail-api'),
    path('api/menus/', MenuListAPIView.as_view(), name='menus-api'),
]