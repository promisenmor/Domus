from django.urls import path
from .views import AgentDashboardView, ClientDashboardView

urlpatterns = [
    path("agent/", AgentDashboardView.as_view(), name='agent-dasboard'),
    path("client/", ClientDashboardView.as_view(), name='client-dashboard'),
    path("api/dashboard/agent/", AgentDashboardView.as_view(), name='agent-dashboard-api'),
    path("api/dashboard/client/", ClientDashboardView.as_view(), name='client-dashboard-api'),
]

