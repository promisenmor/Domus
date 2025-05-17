from django.urls import path
from .api_views import *

urlpatterns = [
    path('api/blog-posts/', BlogPostListAPIView.as_view(), name='blog-posts-api'),
    path('api/pages/', PageListAPIView.as_view(), name='pages-api'),
    path('api/menus/', MenuListAPIView.as_view(), name='menus-api'
         )
]