from django.urls import reverse
from rest_framework.test import APIClient
from listings.models import Property
from account.models import User

class TestListing(APIClient):
    def setUp(self):
        self.user = User.objects.create_user(username="agent", password="password")
        self.client.force_authenticate(user=self.user)

    def test_create_listing(self):
        data = {
                "title": "New House",
                "description": "Nice View",
                "price": 500000,
                "location": "Lagos"
            }
        response = self.client.post(reverse("listing:create"), data)
        self.assertEqual(response.status_code, 201)

            