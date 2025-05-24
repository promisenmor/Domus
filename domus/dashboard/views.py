from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.models import User
from listings.models import Property


class AgentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_agent():
            return Response({"detail": "Not authorised."}, status=403)
        listings = Property.objects.filter(agent=request.user)
        return Response({"properties": [l.title for l in listings]})
    

class ClientDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_client():
            return Response({"detail": "Not authorised"}, status=403)
        saved = request.user.saved_listings.all()
        return Response({"Saved_listings": [l.title for l in saved]})
