from django.db import models
from django_ckeditor_5.fields import CKEditor5Field
from django.utils.text import slugify
from django.utils import timezone


def _unique_slug(instance, value):
    base_slug = slugify(value) or instance._meta.model_name
    slug = base_slug
    suffix = 2
    queryset = instance.__class__.objects.all()
    if instance.pk:
        queryset = queryset.exclude(pk=instance.pk)
    while queryset.filter(slug=slug).exists():
        slug = f'{base_slug}-{suffix}'
        suffix += 1
    return slug


class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    content = CKEditor5Field('content', config_name='default')
    image = models.ImageField(upload_to='blog/', null=True, blank=True)
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    canonical_url = models.URLField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(self, self.title)
        super().save(*args, **kwargs)

    
    def __str__(self):
        return self.title
    

class Page(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    body = CKEditor5Field('body', config_name='default')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    canonical_url = models.URLField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(self, self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    

class MenuItem(models.Model):
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    name = models.CharField(max_length=100)
    url = models.CharField(max_length=255, blank=True)
    page = models.ForeignKey(Page, on_delete=models.SET_NULL, null=True, blank=True, related_name='menu_items')
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)


    class Meta:
        ordering = ['order', 'pk']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name