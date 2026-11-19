from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from account.models import User
from listings.models import Property


class ListingAPITests(APITestCase):
    def test_public_listing_api_only_returns_published_properties(self):
        published = Property.objects.create(
            title="Published House",
            description="A published listing",
            price=500000,
            location="Lagos",
            is_published=True,
        )
        Property.objects.create(
            title="Draft House",
            description="A draft listing",
            price=400000,
            location="Lagos",
        )

        response = self.client.get(reverse("property-list-api"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Published House")

        detail_response = self.client.get(
            reverse("property-detail-api", kwargs={"pk": published.pk})
        )
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_public_detail_api_hides_drafts(self):
        draft = Property.objects.create(
            title="Draft House",
            description="Not published",
            price=400000,
            location="Lagos",
        )

        response = self.client.get(
            reverse("property-detail-api", kwargs={"pk": draft.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_client_cannot_create_agent_listing(self):
        client_user = User.objects.create_user(
            username="client",
            password="strongpassword123",
            role="CLIENT",
        )
        self.client.force_authenticate(user=client_user)

        response = self.client.post(reverse("agent-listing-list"), {
            "title": "Client Listing",
            "description": "Should not be accepted",
            "price": "250000.00",
            "location": "Lagos",
        })

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Property.objects.filter(title="Client Listing").exists())

    def test_agent_listing_is_unpublished_and_cannot_self_publish(self):
        agent = User.objects.create_user(
            username="agent",
            password="strongpassword123",
            role="AGENT",
        )
        self.client.force_authenticate(user=agent)

        response = self.client.post(reverse("agent-listing-list"), {
            "title": "Agent Listing",
            "description": "Awaiting review",
            "price": "250000.00",
            "location": "Lagos",
            "is_published": True,
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        listing = Property.objects.get(title="Agent Listing")
        self.assertEqual(listing.agent, agent)
        self.assertFalse(listing.is_published)

    def test_agent_cannot_access_another_agents_listing(self):
        other_agent = User.objects.create_user(
            username="other-agent",
            password="strongpassword123",
            role="AGENT",
        )
        listing = Property.objects.create(
            title="Private Agent Listing",
            description="Owned by another agent",
            price=250000,
            location="Lagos",
            agent=other_agent,
        )
        agent = User.objects.create_user(
            username="agent",
            password="strongpassword123",
            role="AGENT",
        )
        self.client.force_authenticate(user=agent)

        response = self.client.get(
            reverse("agent-listing-detail", kwargs={"pk": listing.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)