from django.urls import path
from .views import RegisterView, MeView, UserListView, LoginView, UserDetailView, GoogleAuthView, NotificationListView, NotificationReadView, OTPRequestView, OTPVerifyView, AgentListView, AgentDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('me/', MeView.as_view(), name='me'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', NotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('agents/', AgentListView.as_view(), name='agents'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agent-detail'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('', UserListView.as_view(), name='user-list'),
]
