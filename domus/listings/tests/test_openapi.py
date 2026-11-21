from django.urls import reverse
from rest_framework.test import APITestCase


class OpenAPISchemaTests(APITestCase):
    def test_schema_includes_existing_api_routes(self):
        response = self.client.get(reverse('schema'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('/api/properties/', response.data['paths'])
        self.assertIn('/api/properties/{id}/', response.data['paths'])
        self.assertIn('/api/pages/', response.data['paths'])
        self.assertIn('/api/pages/{slug}/', response.data['paths'])
        self.assertIn('/api/blog-posts/', response.data['paths'])
        self.assertIn('/api/blog-posts/{slug}/', response.data['paths'])
        self.assertIn('/api/menus/', response.data['paths'])
        self.assertIn('/api/register/', response.data['paths'])
        self.assertIn('/api/me/', response.data['paths'])
        self.assertIn('/api/auth/login/', response.data['paths'])
        self.assertIn('/api/auth/email/verify/', response.data['paths'])
        self.assertIn('/api/auth/email/verification/resend/', response.data['paths'])
        self.assertIn('/api/auth/logout/', response.data['paths'])
        self.assertIn('/api/auth/password/change/', response.data['paths'])
        self.assertIn('/api/auth/password/forgot/', response.data['paths'])
        self.assertIn('/api/auth/password/reset/', response.data['paths'])
        self.assertIn('/api/token/refresh/', response.data['paths'])
        self.assertNotIn('/api/token/', response.data['paths'])
