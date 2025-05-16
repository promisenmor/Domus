from django.contrib import admin
from .models import  *


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'content', 'published',)
    list_filter = ('published', 'created_at',)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'body',)

@admin.register(MenuItem)
class MenuItem(admin.ModelAdmin):
    list_display = ('name', 'url', 'is_visible',)
    list_filter = ('url', 'is_visible',)
