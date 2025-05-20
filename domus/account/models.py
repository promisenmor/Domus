from django.db import models
from django.contrib.auth.models import AbstractUser
from listings.models import Property


class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
        ('AGENT', 'Agent'),
        ('CLIENT', 'Client'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT')
    phone_number = models.CharField(max_length=15, blank=True)
    company = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=50, blank=True)


    saved_listings = models.ManyToManyField('listings.Property', blank=True)


    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser
    
    def is_staff_member(self):
        return self.role == 'STAFF' or self.is_staff
    
    def is_agent(self):
        return self.role == 'AGENT'
    
    def is_client(self):
        return self.role == 'CLIENT'
    
