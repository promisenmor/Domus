from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from account.models import User
from listings.models import Enquiry, Property


class DashboardAndEnquiryTests(APITestCase):
    def setUp(self):
        self.agent = User.objects.create_user(
            username='dashboard-agent',
            password='strongpassword123',
            role='AGENT',
        )
        self.client_user = User.objects.create_user(
            username='dashboard-client',
            password='strongpassword123',
            role='CLIENT',
        )
        self.listing = Property.objects.create(
            title='Dashboard Listing',
            description='For dashboard tests',
            price=500000,
            location='Lagos',
            agent=self.agent,
            status=Property.Status.PUBLISHED,
            is_published=True,
        )

    def test_guest_can_create_enquiry_and_agent_dashboard_counts_it(self):
        response = self.client.post(reverse('enquiry-create-api'), {
            'property': self.listing.pk,
            'name': 'Guest User',
            'email': 'guest@example.com',
            'phone_number': '+234800000000',
            'message': 'Please contact me.',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        enquiry = Enquiry.objects.get(pk=response.data['id'])
        self.assertEqual(enquiry.assigned_agent, self.agent)
        self.assertIsNone(enquiry.client)

        self.client.force_authenticate(user=self.agent)
        dashboard = self.client.get(reverse('agent-dashboard-api'))

        self.assertEqual(dashboard.status_code, status.HTTP_200_OK)
        self.assertEqual(dashboard.data['overview']['total_listings'], 1)
        self.assertEqual(dashboard.data['overview']['published_listings'], 1)
        self.assertEqual(dashboard.data['overview']['total_enquiries'], 1)
        self.assertEqual(dashboard.data['overview']['new_enquiries'], 1)

    def test_authenticated_client_enquiry_is_in_client_history(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(reverse('enquiry-create-api'), {
            'property': self.listing.pk,
            'name': 'Dashboard Client',
            'email': 'dashboard@example.com',
            'message': 'I am interested.',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        enquiry = Enquiry.objects.get(pk=response.data['id'])
        self.assertEqual(enquiry.client, self.client_user)

        dashboard = self.client.get(reverse('client-dashboard-api'))
        self.assertEqual(dashboard.status_code, status.HTTP_200_OK)
        self.assertEqual(len(dashboard.data['enquiries']), 1)
        self.assertEqual(dashboard.data['enquiries'][0]['status'], Enquiry.Status.NEW)

    def test_agent_can_update_assigned_enquiry_and_filter_by_status(self):
        enquiry = Enquiry.objects.create(
            property=self.listing,
            assigned_agent=self.agent,
            name='Lead',
            email='lead@example.com',
            message='Interested',
        )

        self.client.force_authenticate(user=self.agent)
        detail = reverse('agent-enquiry-detail', kwargs={'pk': enquiry.pk})
        updated = self.client.patch(detail, {
            'status': Enquiry.Status.CONTACTED,
            'internal_notes': 'Called the client',
        })
        filtered = self.client.get(reverse('agent-enquiry-list'), {'status': 'CONTACTED'})

        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data['status'], Enquiry.Status.CONTACTED)
        self.assertEqual(updated.data['internal_notes'], 'Called the client')
        self.assertEqual(filtered.data['count'], 1)

    def test_draft_listing_cannot_receive_enquiry(self):
        draft = Property.objects.create(
            title='Draft Listing',
            description='Not public',
            price=300000,
            location='Abuja',
        )

        response = self.client.post(reverse('enquiry-create-api'), {
            'property': draft.pk,
            'name': 'Guest',
            'email': 'guest@example.com',
            'message': 'Can I view this?',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)