from django.contrib import admin
from .models import BlogPost, MenuItem, Page


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'published', 'created_at', 'updated_at')
    list_filter = ('published', 'created_at')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'slug', 'body')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'page', 'url', 'order', 'is_visible')
    list_filter = ('is_visible',)
    search_fields = ('name', 'slug', 'url')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('order', 'is_visible')
    ordering = ('order', 'pk')
