from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from drf_spectacular.utils import extend_schema, inline_serializer
from account.models import User
from listings.models import Property, Enquiry
from account.serializers import UserProfileSerializer
from listings.serializers import PublicPropertySerializer


class AgentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            name='AgentDashboard',
            fields={'properties': serializers.ListField(child=serializers.CharField())},
        )
    )
    def get(self, request):
        if not request.user.is_agent():
            return Response({"detail": "Not authorised."}, status=403)
        listings = Property.objects.filter(agent=request.user)
        enquiries = Enquiry.objects.filter(assigned_agent=request.user)
        return Response({
            "profile": UserProfileSerializer(request.user).data,
            "overview": {
                "total_listings": listings.count(),
                "published_listings": listings.filter(status=Property.Status.PUBLISHED, is_published=True).count(),
                "draft_listings": listings.filter(status=Property.Status.DRAFT).count(),
                "pending_listings": listings.filter(status=Property.Status.PENDING_REVIEW).count(),
                "sold_listings": listings.filter(status=Property.Status.SOLD).count(),
                "let_listings": listings.filter(status=Property.Status.LET).count(),
                "total_enquiries": enquiries.count(),
                "new_enquiries": enquiries.filter(status=Enquiry.Status.NEW).count(),
            },
            "properties": PublicPropertySerializer(
                listings.order_by('-created_at', '-pk')[:10],
                many=True,
                context={'request': request},
            ).data,
        })
    

class ClientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            name='ClientDashboard',
            fields={'Saved_listings': serializers.ListField(child=serializers.CharField())},
        )
    )
    def get(self, request):
        if not request.user.is_client():
            return Response({"detail": "Not authorised"}, status=403)
        saved = request.user.saved_listings.filter(
            status=Property.Status.PUBLISHED,
            is_published=True,
        ).order_by('-created_at', '-pk')
        saved_count = saved.count()
        enquiries = Enquiry.objects.filter(client=request.user).select_related('property')
        enquiry_count = enquiries.count()
        active_enquiry_count = enquiries.exclude(
            status__in=[Enquiry.Status.CLOSED, Enquiry.Status.SPAM]
        ).count()
        return Response({
            "profile": UserProfileSerializer(request.user).data,
            "overview": {
                "saved_properties": saved_count,
                "total_enquiries": enquiry_count,
                "active_enquiries": active_enquiry_count,
            },
            "saved_listings": PublicPropertySerializer(
                saved[:10],
                many=True,
                context={'request': request},
            ).data,
            "enquiries": [
                {
                    "id": enquiry.pk,
                    "property": enquiry.property_id,
                    "property_title": enquiry.property.title,
                    "status": enquiry.status,
                    "created_at": enquiry.created_at,
                    "updated_at": enquiry.updated_at,
                }
                for enquiry in enquiries[:20]
            ],
        })
