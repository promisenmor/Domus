from django.urls import reverse
from rest_framework.test import APITestCase


class OpenAPISchemaTests(APITestCase):
    def test_schema_includes_existing_api_routes(self):
        response = self.client.get(reverse('schema'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('/api/properties/', response.data['paths'])
        self.assertIn('/api/register/', response.data['paths'])
