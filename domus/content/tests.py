from django.test import TestCase
from django.urls import reverse

from listings.models import Property
from .models import BlogPost, MenuItem, Page


class PublicContentAPITests(TestCase):
    def test_public_page_api_includes_seo_and_hides_inactive_pages(self):
        page = Page.objects.create(
            title='About Domus',
            body='<p>About us</p>',
            meta_title='About',
            meta_description='Information about Domus.',
            canonical_url='https://example.com/about/',
        )
        Page.objects.create(title='Private Page', body='Not public', is_active=False)

        list_response = self.client.get(reverse('pages-api'))
        detail_response = self.client.get(
            reverse('page-detail-api', kwargs={'slug': page.slug})
        )
        hidden_response = self.client.get('/api/pages/private-page/')

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data['results']), 1)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.data['meta_title'], 'About')
        self.assertEqual(detail_response.data['meta_description'], 'Information about Domus.')
        self.assertEqual(hidden_response.status_code, 404)

    def test_blog_api_hides_unpublished_posts_and_exposes_detail(self):
        post = BlogPost.objects.create(
            title='CMS Release',
            content='<p>News</p>',
            meta_title='Release',
            meta_description='Latest release news.',
        )
        BlogPost.objects.create(
            title='Unpublished Post',
            content='Draft',
            published=False,
        )

        list_response = self.client.get(reverse('blog-posts-api'))
        detail_response = self.client.get(
            reverse('blog-post-detail-api', kwargs={'slug': post.slug})
        )
        hidden_response = self.client.get('/api/blog-posts/unpublished-post/')

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data['results']), 1)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.data['meta_title'], 'Release')
        self.assertEqual(hidden_response.status_code, 404)

    def test_menu_api_only_returns_visible_items_in_order(self):
        page = Page.objects.create(title='Menu Destination', body='Page')
        MenuItem.objects.create(name='Second', url='/second/', order=2)
        MenuItem.objects.create(name='First', url='/first/', order=1)
        MenuItem.objects.create(name='Page link', page=page, order=3)
        MenuItem.objects.create(
            name='Hidden',
            url='/hidden/',
            order=0,
            is_visible=False,
        )

        response = self.client.get(reverse('menus-api'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item['name'] for item in response.data['results']],
            ['First', 'Second', 'Page link'],
        )
        self.assertEqual(response.data['results'][2]['page_slug'], page.slug)

    def test_generated_slugs_are_unique_for_duplicate_or_untransliterable_titles(self):
        first = Page.objects.create(title='About Us', body='First')
        second = Page.objects.create(title='About Us', body='Second')
        unicode_title = Page.objects.create(title='東京', body='Tokyo')

        self.assertEqual(first.slug, 'about-us')
        self.assertEqual(second.slug, 'about-us-2')
        self.assertEqual(unicode_title.slug, 'page')


class SitemapAndRobotsTests(TestCase):
    def test_robots_txt_advertises_sitemap(self):
        response = self.client.get(reverse('robots-txt'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/plain')
        self.assertIn('Sitemap: http://testserver/sitemap.xml', response.content.decode())

    def test_sitemap_includes_published_properties_pages_and_posts(self):
        Page.objects.create(title='Public Page', body='Page content')
        BlogPost.objects.create(title='Public Post', content='Post content')
        Property.objects.create(
            title='Public Property',
            description='Published listing',
            price=100000,
            location='Lagos',
            status=Property.Status.PUBLISHED,
            is_published=True,
        )

        response = self.client.get(reverse('django.contrib.sitemaps.views.sitemaps'))

        self.assertEqual(response.status_code, 200)
        content = response.content.decode()
        self.assertIn('http://testserver/pages/public-page/', content)
        self.assertIn('http://testserver/blog/public-post/', content)
        self.assertIn('http://testserver/properties/public-property/', content)
