from django.db import models
from django_ckeditor_5.fields import CKEditor5Field
from django.conf import settings



class Property(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    image = models.ImageField(upload_to='properties/', null=True, blank=True)
    crm_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    is_crm_synced = models.BooleanField(default=False)
    manual_override = models.BooleanField(default=False)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings', limit_choices_to={"role": "AGENT"}, null=True, blank=True)


    def __str__(self):
        return self.title
    

class Page(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = CKEditor5Field('Content', config_name='default')
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_visible = models.BooleanField(default=True)

    
    def __str__(self):
        return self.title
    

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    content = CKEditor5Field('Content', config_name='default')
    image = models.ImageField(upload_to='blog/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    



class Menu(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    page = models.ForeignKey(Page, on_delete=models.SET_NULL, null=True, blank=True)
    url = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    


    


