from django.contrib.sitemaps import Sitemap
from .models import Property
from content.models import BlogPost, Page

class PropertySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9 

    def items(self):
        return Property.objects.filter(
            status=Property.Status.PUBLISHED,
            is_published=True,
        ).order_by('pk')
    
    def location(self, obj):
        return f"/properties/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class PageSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Page.objects.filter(is_active=True).order_by('pk')

    def location(self, obj):
        return f"/pages/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at


class BlogPostSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return BlogPost.objects.filter(published=True).order_by('pk')

    def location(self, obj):
        return f"/blog/{obj.slug}/"

    def lastmod(self, obj):
        return obj.updated_at
    
