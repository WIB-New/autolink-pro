from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from apps.users.views import ContactAPIView, ContactMessageViewSet, SiteConfigAPIView


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health, name='health'),
    path('api/contact/', ContactAPIView.as_view(), name='contact'),
    path('api/contact/messages/', ContactMessageViewSet.as_view({'get': 'list'}), name='contact-messages'),
    path('api/contact/messages/<int:pk>/', ContactMessageViewSet.as_view({
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='contact-message-detail'),
    path('api/site-config/', SiteConfigAPIView.as_view(), name='site-config'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('apps.users.urls')),
    path('api/vehicles/', include('apps.vehicles.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/drivers/', include('apps.drivers.urls')),
    path('api/inspections/', include('apps.inspections.urls')),
    path('api/affiliates/', include('apps.affiliates.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
