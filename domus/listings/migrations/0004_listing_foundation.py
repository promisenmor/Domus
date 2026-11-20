from django.db import migrations, models
from django.db.models import deletion
from django.utils.text import slugify


def populate_property_slugs(apps, schema_editor):
    Property = apps.get_model('listings', 'Property')
    used = set()
    for prop in Property.objects.all().iterator():
        base = slugify(prop.title) or f'property-{prop.pk}'
        slug = base
        suffix = 2
        while slug in used or Property.objects.filter(slug=slug).exclude(pk=prop.pk).exists():
            slug = f'{base}-{suffix}'
            suffix += 1
        used.add(slug)
        prop.slug = slug
        prop.save(update_fields=['slug'])


def populate_property_statuses(apps, schema_editor):
    Property = apps.get_model('listings', 'Property')
    published = Property.objects.filter(is_published=True)
    published.update(status='PUBLISHED')


class Migration(migrations.Migration):
    dependencies = [
        ('listings', '0003_alter_property_is_published'),
    ]

    operations = [
        migrations.AddField(model_name='property', name='slug', field=models.SlugField(blank=True, max_length=255, null=True, unique=True)),
        migrations.RunPython(populate_property_slugs, migrations.RunPython.noop),
        migrations.AlterField(model_name='property', name='slug', field=models.SlugField(max_length=255, unique=True)),
        migrations.AddField(model_name='property', name='address', field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='property', name='balcony', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='property', name='bathrooms', field=models.PositiveSmallIntegerField(default=0)),
        migrations.AddField(model_name='property', name='bedrooms', field=models.PositiveSmallIntegerField(default=0)),
        migrations.AddField(model_name='property', name='canonical_url', field=models.URLField(blank=True)),
        migrations.AddField(model_name='property', name='city', field=models.CharField(blank=True, db_index=True, max_length=100)),
        migrations.AddField(model_name='property', name='currency', field=models.CharField(default='NGN', max_length=3)),
        migrations.AddField(model_name='property', name='external_id', field=models.CharField(blank=True, db_index=True, max_length=100)),
        migrations.AddField(model_name='property', name='featured', field=models.BooleanField(db_index=True, default=False)),
        migrations.AddField(model_name='property', name='furnished', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='property', name='garden', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='property', name='latitude', field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
        migrations.AddField(model_name='property', name='listing_type', field=models.CharField(choices=[('FOR_SALE', 'For sale'), ('TO_RENT', 'To rent')], default='FOR_SALE', max_length=20)),
        migrations.AddField(model_name='property', name='longitude', field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
        migrations.AddField(model_name='property', name='meta_description', field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name='property', name='meta_title', field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='property', name='parking', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='property', name='postcode', field=models.CharField(blank=True, db_index=True, max_length=20)),
        migrations.AddField(model_name='property', name='price_frequency', field=models.CharField(blank=True, max_length=20)),
        migrations.AddField(model_name='property', name='property_type', field=models.CharField(choices=[('HOUSE', 'House'), ('APARTMENT', 'Apartment'), ('BUNGALOW', 'Bungalow'), ('COMMERCIAL', 'Commercial property'), ('LAND', 'Land'), ('OTHER', 'Other')], default='HOUSE', max_length=20)),
        migrations.AddField(model_name='property', name='published_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='property', name='reception_rooms', field=models.PositiveSmallIntegerField(default=0)),
        migrations.AddField(model_name='property', name='reference_number', field=models.CharField(blank=True, db_index=True, max_length=100)),
        migrations.AddField(model_name='property', name='region', field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name='property', name='short_description', field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name='property', name='source', field=models.CharField(choices=[('MANUAL', 'Manual'), ('CRM', 'CRM'), ('ADMIN_IMPORT', 'Admin import')], default='MANUAL', max_length=20)),
        migrations.AddField(model_name='property', name='status', field=models.CharField(choices=[('DRAFT', 'Draft'), ('PENDING_REVIEW', 'Pending review'), ('PUBLISHED', 'Published'), ('SOLD', 'Sold'), ('LET', 'Let'), ('ARCHIVED', 'Archived'), ('WITHDRAWN', 'Withdrawn')], db_index=True, default='DRAFT', max_length=20)),
        migrations.RunPython(populate_property_statuses, migrations.RunPython.noop),
        migrations.CreateModel(
            name='ListingImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='properties/')),
                ('caption', models.CharField(blank=True, max_length=255)),
                ('alt_text', models.CharField(max_length=255, blank=True)),
                ('is_primary', models.BooleanField(default=False)),
                ('order', models.PositiveIntegerField(default=0)),
                ('property', models.ForeignKey(on_delete=deletion.CASCADE, related_name='images', to='listings.property')),
            ],
            options={'ordering': ['order', 'pk']},
        ),
        migrations.AddIndex(model_name='property', index=models.Index(fields=['status', 'city', 'price'], name='listings_pr_status_3a4a2a_idx')),
        migrations.AddIndex(model_name='property', index=models.Index(fields=['status', 'listing_type', 'property_type'], name='listings_pr_status_64d4de_idx')),
        migrations.AddIndex(model_name='property', index=models.Index(fields=['status', '-created_at'], name='listings_pr_status_8e4bf8_idx')),
    ]
