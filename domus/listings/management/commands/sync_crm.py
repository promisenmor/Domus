import json
from django.core.management.base import BaseCommand
from listings.models import Property

MOCK_CRM_DATA = [
    {
        "crm_id": "crm-001",
        "title": "3 Bedroom Apartment in Lekki",
        "description": "Spacious and modern flat.",
        "price": "35000000.00",
        "location": "Lekki Phase 1",
        "is_published": True
    },
    {
        "crm_id": "crm-002",
        "title": "2 Bedroom Apartment in Lekki",
        "description": "Spacious and modern flat.",
        "price": "30000000.00",
        "location": "Lekki Phase 1",
        "is_published": True
    },
]


class Command(BaseCommand):
    help = 'Sync properties from CRM'

    def handle(self, *args, **kwargs):
        for item in MOCK_CRM_DATA:
            property_obj, created = Property.objects.update_or_create(
                crm_id=item["crm_id"],
                defaults={
                    "title": item["title"],
                    "description": item["description"],
                    "price": item["price"],
                    "location": item["location"],
                    "is_published": item["is_published"],
                    "is_crm_synced": True
                }
            )
            status = "created" if created else "updated"
            self.stdout.write(self.style.SUCCESS(f"{status} property: {property_obj.title}"))

    

