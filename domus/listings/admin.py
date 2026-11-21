from django.contrib import admin
from .models import Enquiry, ListingImage, Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'price', 'city', 'agent', 'featured', 'is_published', 'updated_at', 'source')
    list_filter = ('status', 'property_type', 'listing_type', 'city', 'is_published', 'featured', 'source')
    search_fields = ('title', 'slug', 'location', 'city', 'postcode', 'reference_number', 'external_id')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('featured',)


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'caption', 'is_primary', 'order')
    list_filter = ('is_primary',)
    search_fields = ('property__title', 'caption', 'alt_text')


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'property', 'assigned_agent', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'property__title')
    readonly_fields = ('created_at', 'updated_at')


admin.site.site_header = "Domus Admin"
admin.site.site_title = "Domus Dashboard"
admin.site.index_title = "Welcome to Domus Admin Panel"
