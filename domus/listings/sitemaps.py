from django.contrib.sitemaps import Sitemap
from .models import Property

class PropertySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9 

    def items(self):
        return Property.objects.filter(is_published=True)
    
    def location(self, obj):
        return f"/properties/{obj.slug}/"
    
