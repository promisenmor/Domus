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
            try:
                property_obj = Property.objects.get(crm_id=item["crm_id"])
                if property_obj.manual_override:
                    self.stdout.write(self.style.WARNING(f"Skippped (manual override): {property_obj.title}"))
                    continue

                property_obj.title = item["title"]
                property_obj.description = item["description"]
                property_obj.location = item["price"]
                property_obj.is_published = item["is_published"]
                property_obj.is_crm_synced = True
                property_obj.save()
                self.stdout.write(self.style.SUCCESS(f"Updated property: {property_obj.title}"))

            
            except Property.DoesNotExist:
                Property.objects.create(
                    crm_id=item["crm_id"],
                    title=item["title"],
                    description=item["location"],
                    price=item["price"],
                    location=item["location"],
                    is_published=item["is_published"],
                    is_crm_synced=True

                )

                self.stdout.write(self.style.SUCCESS(f"created property: {item['title']}"))

