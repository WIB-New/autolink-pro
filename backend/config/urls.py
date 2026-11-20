import os

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from apps.users.views import ContactAPIView, ContactMessageViewSet, SiteConfigAPIView

MEDIA_PREVIEWABLE = ('.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg', '.txt')


def serve_media(request, path):
    """Sert les médias ; force le téléchargement pour les formats non
    prévisualisables (.docx, .xlsx, .zip…) au lieu d'ouvrir un onglet vide."""
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    ext = os.path.splitext(path)[1].lower()
    if ext not in MEDIA_PREVIEWABLE:
        filename = os.path.basename(path).replace('"', '')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


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
    # Médias uploadés : servis par Django quel que soit DEBUG
    # (static() ne s'enregistre qu'en DEBUG — tout /media/ renvoyait 404 en prod).
    re_path(r'^media/(?P<path>.*)$', serve_media),
]
