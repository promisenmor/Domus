from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone



class Property(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING_REVIEW = 'PENDING_REVIEW', 'Pending review'
        PUBLISHED = 'PUBLISHED', 'Published'
        SOLD = 'SOLD', 'Sold'
        LET = 'LET', 'Let'
        ARCHIVED = 'ARCHIVED', 'Archived'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    class PropertyType(models.TextChoices):
        HOUSE = 'HOUSE', 'House'
        APARTMENT = 'APARTMENT', 'Apartment'
        BUNGALOW = 'BUNGALOW', 'Bungalow'
        COMMERCIAL = 'COMMERCIAL', 'Commercial property'
        LAND = 'LAND', 'Land'
        OTHER = 'OTHER', 'Other'

    class ListingType(models.TextChoices):
        FOR_SALE = 'FOR_SALE', 'For sale'
        TO_RENT = 'TO_RENT', 'To rent'

    class Source(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual'
        CRM = 'CRM', 'CRM'
        ADMIN_IMPORT = 'ADMIN_IMPORT', 'Admin import'

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    location = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    region = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=20, blank=True, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    property_type = models.CharField(max_length=20, choices=PropertyType.choices, default=PropertyType.HOUSE)
    listing_type = models.CharField(max_length=20, choices=ListingType.choices, default=ListingType.FOR_SALE)
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    reception_rooms = models.PositiveSmallIntegerField(default=0)
    parking = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    furnished = models.BooleanField(default=False)
    currency = models.CharField(max_length=3, default='NGN')
    price_frequency = models.CharField(max_length=20, blank=True)
    reference_number = models.CharField(max_length=100, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.MANUAL)
    external_id = models.CharField(max_length=100, blank=True, db_index=True)
    featured = models.BooleanField(default=False, db_index=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=500, blank=True)
    canonical_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='properties/', null=True, blank=True)
    crm_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_crm_synced = models.BooleanField(default=False)
    manual_override = models.BooleanField(default=False)
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings', limit_choices_to={"role": "AGENT"}, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'city', 'price']),
            models.Index(fields=['status', 'listing_type', 'property_type']),
            models.Index(fields=['status', '-created_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            suffix = 2
            while Property.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{suffix}'
                suffix += 1
            self.slug = slug
        if self.status == self.Status.PUBLISHED:
            self.is_published = True
            if not self.published_at:
                self.published_at = timezone.now()
        elif self.is_published:
            self.status = self.Status.PUBLISHED
            if not self.published_at:
                self.published_at = timezone.now()
        super().save(*args, **kwargs)


class ListingImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'pk']


class Enquiry(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        IN_PROGRESS = 'IN_PROGRESS', 'In progress'
        CLOSED = 'CLOSED', 'Closed'
        SPAM = 'SPAM', 'Spam'

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='enquiries',
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='enquiries',
    )
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_enquiries',
        limit_choices_to={'role': 'AGENT'},
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=30, blank=True)
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    internal_notes = models.TextField(blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at', '-pk']
        indexes = [
            models.Index(fields=['assigned_agent', 'status', '-created_at']),
            models.Index(fields=['property', 'status']),
        ]

    def __str__(self):
        return f'{self.name} - {self.property.title}'
    


