from django.urls import path
from .views import (
    GoogleAuthView,
    LoginView,
    MeReferralView,
    MeView,
    NotificationListView,
    NotificationReadView,
    OTPRequestView,
    OTPVerifyView,
    RegisterView,
    UserDetailView,
    UserListView,
    AgentListView,
    AgentDetailView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('me/', MeView.as_view(), name='me'),
    path('me/referral/', MeReferralView.as_view(), name='me-referral'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/read/', NotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('', UserListView.as_view(), name='user-list'),
    path('agents/', AgentListView.as_view(), name='agent-list'),
    path('agents/<int:pk>/', AgentDetailView.as_view(), name='agent-detail'),
]
