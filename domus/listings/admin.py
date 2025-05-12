from django.contrib import admin
from . models import  *


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'location', 'is_published', 'updated_at')
    list_filter = ('is_published', 'location',)
    search_fields = ('title', 'location')

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'created_at')
    prepopulated_fields = {"slug": ("title", )}
    search_fields = ('title', 'content')
    list_filter = ('is_published',)


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_visible')
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ('title', 'content')


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'page', 'url', 'order', 'visible')
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ('order', 'visible')

