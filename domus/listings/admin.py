from django.contrib import admin
from . models import  *


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'price', 'city', 'agent', 'featured', 'is_published', 'updated_at', 'source')
    list_filter = ('status', 'property_type', 'listing_type', 'city', 'is_published', 'featured', 'source')
    search_fields = ('title', 'slug', 'location', 'city', 'postcode', 'reference_number', 'external_id')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('featured',)


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




admin.site.site_header = "Domus Admin"
admin.site.site_title = "Domus Dashboard"
admin.site.index_title = "Welcome to Domus Admin Panel"
