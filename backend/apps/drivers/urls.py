from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDriverApplicationViewSet,
    AdminDriverProfileViewSet,
    DriverApplicationViewSet,
    DriverEarningListView,
    DriverProfileViewSet,
)

router = DefaultRouter()
router.register(r'applications', DriverApplicationViewSet, basename='driver-application')
router.register(r'profiles', DriverProfileViewSet, basename='driver-profile')
router.register(r'earnings', DriverEarningListView, basename='driver-earning')

admin_router = DefaultRouter()
admin_router.register(r'applications', AdminDriverApplicationViewSet, basename='admin-driver-application')
admin_router.register(r'profiles', AdminDriverProfileViewSet, basename='admin-driver-profile')

urlpatterns = [
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
