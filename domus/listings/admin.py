from django.contrib import admin
from . models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'location', 'is_published', 'updated_at')
    list_filter = ('is_published', 'location')
    search_fields = ('title', 'location')