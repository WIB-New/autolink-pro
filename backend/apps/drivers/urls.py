from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverApplicationViewSet,
    DriverProfileViewSet,
)

router = DefaultRouter()
router.register(r'applications', DriverApplicationViewSet, basename='driver-application')
router.register(r'profiles', DriverProfileViewSet, basename='driver-profile')

urlpatterns = [
    path('', include(router.urls)),
]
