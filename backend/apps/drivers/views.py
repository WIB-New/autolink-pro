from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import DriverApplication, DriverProfile
from .serializers import DriverApplicationSerializer, DriverProfileSerializer


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsAdminOrSelf(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        return getattr(obj, 'applicant', None) == request.user or getattr(obj, 'driver', None) == request.user


class DriverApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = DriverApplicationSerializer

    def get_permissions(self):
        # La candidature publique (landing « Postuler ») est ouverte à tous ;
        # la consultation/modification reste réservée aux authentifiés.
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverApplication.objects.all()
        return DriverApplication.objects.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user if self.request.user.is_authenticated else None)

    def perform_update(self, serializer):
        if self.request.user.role == 'ADMIN':
            serializer.save(reviewer=self.request.user, reviewed_at=timezone.now())
        else:
            serializer.save()

    # Actions dédiées admin — 'status' est read-only dans le serializer,
    # donc le PATCH simple ne change rien (et un candidat ne doit pas
    # pouvoir s'auto-approuver via PATCH direct).
    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def approve(self, request, pk=None):
        app = self.get_object()
        app.status = DriverApplication.Status.APPROVED
        app.reviewer = request.user
        app.reviewed_at = timezone.now()
        app.save(update_fields=['status', 'reviewer', 'reviewed_at'])
        return Response(self.get_serializer(app).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def reject(self, request, pk=None):
        app = self.get_object()
        app.status = DriverApplication.Status.REJECTED
        app.reviewer = request.user
        app.reviewed_at = timezone.now()
        app.save(update_fields=['status', 'reviewer', 'reviewed_at'])
        return Response(self.get_serializer(app).data)


class DriverProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return DriverProfile.objects.all()
        return DriverProfile.objects.filter(driver=self.request.user)
