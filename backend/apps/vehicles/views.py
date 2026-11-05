from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Vehicle, VehicleAvailability, VehiclePhoto
from .serializers import VehicleSerializer, VehicleAvailabilitySerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.role in ('ADMIN', 'CONTROLLER') or request.user.is_staff


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.filter(status='approved')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'fuel', 'status', 'mode', 'insurance_type']
    search_fields = ['brand', 'model', 'plate', 'category']
    ordering_fields = ['computed_rate', 'rating', 'year', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        vehicle = serializer.save(owner=self.request.user, status='pending')
        # Photos multipart (étape 3) — chaque fichier reçoit son slot en caption
        # ('front34' = extérieur/cover, 'interior'/'rear' = habitacle)
        slots = self.request.data.getlist('photo_slots')
        for i, f in enumerate(self.request.FILES.getlist('photos')):
            caption = slots[i] if i < len(slots) else ''
            VehiclePhoto.objects.create(vehicle=vehicle, image=f, caption=caption)

    def get_queryset(self):
        qs = Vehicle.objects.all()
        if self.request.user.is_authenticated:
            if self.request.user.role in ['ADMIN', 'CONTROLLER']:
                return qs
            # Actions détail (retrieve/update/destroy) : le propriétaire accède
            # à ses propres véhicules quel que soit le statut (ex. pending après
            # création) + au catalogue approuvé en lecture.
            if self.request.user.role == 'OWNER' and self.action != 'list':
                return qs.filter(Q(owner=self.request.user) | Q(status='approved'))
            # Le propriétaire gère ses véhicules via ?mine=1 ; sinon il peut
            # aussi parcourir le catalogue public et louer comme un client.
            if self.request.user.role == 'OWNER' and self.request.query_params.get('mine'):
                return qs.filter(owner=self.request.user)
        return qs.filter(status='approved')


class VehicleAvailabilityView(generics.ListCreateAPIView):
    serializer_class = VehicleAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VehicleAvailability.objects.filter(vehicle_id=self.kwargs['vehicle_id'])

    def perform_create(self, serializer):
        serializer.save(vehicle_id=self.kwargs['vehicle_id'])
