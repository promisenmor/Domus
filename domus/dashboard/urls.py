from django.urls import path
from .views import AgentDashboardView, ClientDashboardView

urlpatterns = [
    path("agent/", AgentDashboardView.as_view(), name='agent-dasboard'),
    path("client/", ClientDashboardView.as_view(), name='client-dashboard'),
]

