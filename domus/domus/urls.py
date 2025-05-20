"""
URL configuration for domus project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import django_ckeditor_5
from django.contrib.sitemaps.views import sitemap
from listings.sitemaps import PropertySitemap
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def robots_txt(request):
    return HttpResponse("User-Agent: *\nDisallow:", content_type="text/plain")


sitemaps = {
    'properties' : PropertySitemap,
}





urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor5/', include('django_ckeditor_5.urls')),
    path('', include('listings.urls')),
    path('', include('content.urls')),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemaps'),
    path("robots.txt", robots_txt),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_view'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_view'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
