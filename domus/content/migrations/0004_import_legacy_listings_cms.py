from django.db import migrations
from django.utils.text import slugify


def available_slug(model, value, fallback, using):
    max_length = model._meta.get_field('slug').max_length
    base = slugify(value) or fallback
    base = base[:max_length]
    candidate = base
    suffix = 2
    queryset = model.objects.using(using)
    while queryset.filter(slug=candidate).exists():
        suffix_text = f'-{suffix}'
        candidate = f'{base[:max_length - len(suffix_text)]}{suffix_text}'
        suffix += 1
    return candidate


def import_legacy_cms(apps, schema_editor):
    using = schema_editor.connection.alias
    LegacyPage = apps.get_model('listings', 'Page')
    LegacyBlogPost = apps.get_model('listings', 'BlogPost')
    LegacyMenu = apps.get_model('listings', 'Menu')
    Page = apps.get_model('content', 'Page')
    BlogPost = apps.get_model('content', 'BlogPost')
    MenuItem = apps.get_model('content', 'MenuItem')

    page_ids = {}
    for old_page in LegacyPage.objects.using(using).order_by('pk').iterator():
        page = Page.objects.using(using).create(
            title=old_page.title,
            slug=available_slug(Page, old_page.slug, 'page', using),
            body=old_page.content,
            is_active=old_page.is_published and old_page.is_visible,
            created_at=old_page.created_at,
            updated_at=old_page.updated_at,
        )
        Page.objects.using(using).filter(pk=page.pk).update(
            created_at=old_page.created_at,
            updated_at=old_page.updated_at,
        )
        page_ids[old_page.pk] = page.pk

    for old_post in LegacyBlogPost.objects.using(using).order_by('pk').iterator():
        post = BlogPost.objects.using(using).create(
            title=old_post.title,
            slug=available_slug(BlogPost, old_post.slug, 'blog-post', using),
            content=old_post.content,
            image=str(old_post.image) if old_post.image else '',
            published=old_post.is_published,
            created_at=old_post.created_at,
            updated_at=old_post.created_at,
        )
        BlogPost.objects.using(using).filter(pk=post.pk).update(
            created_at=old_post.created_at,
            updated_at=old_post.created_at,
        )

    for old_menu in LegacyMenu.objects.using(using).order_by('pk').iterator():
        MenuItem.objects.using(using).create(
            slug=available_slug(MenuItem, old_menu.slug, 'menu', using),
            name=old_menu.name,
            url=old_menu.url or '',
            page_id=page_ids.get(old_menu.page_id),
            order=old_menu.order,
            is_visible=old_menu.visible,
        )


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0003_alter_menuitem_options_blogpost_image_menuitem_page_and_more'),
        ('listings', '0006_enquiry'),
    ]

    operations = [
        migrations.RunPython(import_legacy_cms, migrations.RunPython.noop),
    ]
