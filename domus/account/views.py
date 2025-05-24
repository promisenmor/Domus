from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics, status
from .serializers import UserRegistrationSerializer, SavedListingSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from listings.models import Property
from rest_framework.views import APIView



User = get_user_model()

class RegisterUserAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            User = serializer.save()
            return Response({"message": "User registered sucessfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class SavedListingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        listings = request.user.saved_listings.all()
        serializer = SavedListingSerializer(listings, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        listing_id = request.data.get('listing_id')
        try:
            listing = Property.objects.get(id=listing_id)
            request.user.saved_listings.add(listing)
            return Response({"message": "Listing added to favourites. "})
        except Property.DoesNotExist:
            return Response({"message": "Listing not found"}, status=404)

    def delete(self, request):
        listing_id = request.data.get('listing_id')
        try:
            listing = Property.objects.get(id=listing_id)
            request.user.saved_listings.remove(listing)
            return Response({"message": "This Listing has been removed from your favourites. "})
        except Property.DoesNotExist:
            return Response({"error": "Listing not found. "}, status=404)