from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from account.models import User

class UserRegistrationTest(APITestCase):
    def test_user_can_register(self):
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "strongpassword123",
            "role": "Client"
        }
        response = self.client.post(reverse("account:register"), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())


