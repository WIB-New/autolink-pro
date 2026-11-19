from datetime import timedelta
from django.db.models import Avg, Q
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from config.pagination import StandardPagination
from apps.bookings.models import Booking
from apps.vehicles.models import Vehicle
from .models import VehicleInspection
from .serializers import VehicleInspectionSerializer


class IsControllerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'CONTROLLER']


class VehicleInspectionViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleInspectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filterset_fields = ['inspection_type', 'booking', 'vehicle']
    search_fields = [
        'vehicle__brand', 'vehicle__model', 'vehicle__plate',
        'booking__client__first_name', 'booking__client__last_name',
        'controller__username', 'notes',
    ]
    ordering_fields = ['inspection_date', 'condition_score', 'mileage_at_inspection', 'fuel_level']
    ordering = ['-inspection_date']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsControllerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'CONTROLLER']:
            return VehicleInspection.objects.select_related('booking__client', 'vehicle', 'controller').all()
        if user.role == 'OWNER':
            return VehicleInspection.objects.select_related('booking__client', 'vehicle', 'controller').filter(vehicle__owner=user)
        if user.role == 'CLIENT':
            return VehicleInspection.objects.select_related('booking__client', 'vehicle', 'controller').filter(booking__client=user)
        return VehicleInspection.objects.none()

    def _sync_vehicle(self, inspection):
        Vehicle.objects.filter(pk=inspection.vehicle_id).update(
            condition_score=inspection.condition_score,
            mileage=inspection.mileage_at_inspection,
            fuel_level=inspection.fuel_level,
            last_inspection_at=inspection.inspection_date,
            last_inspection_score=inspection.condition_score,
        )

    def perform_create(self, serializer):
        inspection = serializer.save(controller=self.request.user)
        self._sync_vehicle(inspection)

    def perform_update(self, serializer):
        # Réédition d'une fiche : l'état courant du véhicule reflète
        # les valeurs corrigées (kilométrage, carburant, score) et
        # l'identité du dernier éditeur est conservée pour l'audit.
        self._sync_vehicle(serializer.save(edited_by=self.request.user,
                                           edited_at=timezone.now()))

    def _queue_items(self, inspection_type):
        today = timezone.localdate()
        if inspection_type == VehicleInspection.InspectionType.ENTRY:
            bookings = Booking.objects.filter(
                # Fenêtre J+3 pour la planification + les locations déjà
                # actives qui ont raté leur fiche d'entrée (rattrapage).
                Q(status=Booking.Status.CONFIRMED,
                  start_date__lte=today + timedelta(days=3))
                | Q(status=Booking.Status.ACTIVE),
            ).exclude(inspections__inspection_type=inspection_type)
        else:
            bookings = Booking.objects.filter(
                status__in=[Booking.Status.ACTIVE, Booking.Status.COMPLETED],
            ).exclude(inspections__inspection_type=inspection_type)
        return bookings.select_related('vehicle', 'client', 'vehicle__owner').order_by('start_date')

    @action(detail=False, methods=['get'])
    def queue(self, request):
        if request.user.role not in ['ADMIN', 'CONTROLLER']:
            return Response({'detail': 'Accès réservé aux contrôleurs.'}, status=403)
        inspection_type = request.query_params.get('type', 'entry')
        if inspection_type not in ('entry', 'exit'):
            return Response({'type': 'Choisissez entry ou exit.'}, status=400)
        bookings = self._queue_items(inspection_type)
        search = request.query_params.get('search', '').strip()
        if search:
            bookings = bookings.filter(
                Q(vehicle__brand__icontains=search) |
                Q(vehicle__model__icontains=search) |
                Q(vehicle__plate__icontains=search) |
                Q(client__first_name__icontains=search) |
                Q(client__last_name__icontains=search) |
                Q(client__email__icontains=search))
        ordering = request.query_params.get('ordering', '-start_date')
        allowed_ordering = {
            'start_date', '-start_date', 'end_date', '-end_date',
            'vehicle__brand', '-vehicle__brand',
        }
        if ordering in allowed_ordering:
            bookings = bookings.order_by(ordering)
        page = self.paginate_queryset(bookings)
        results = [{
            'id': booking.id,
            'booking_reference': f'BK-{booking.pk:04d}',
            'inspection_type': inspection_type,
            'vehicle_id': booking.vehicle_id,
            'vehicle': f'{booking.vehicle.brand} {booking.vehicle.model} {booking.vehicle.year}',
            'plate': booking.vehicle.plate,
            'client': booking.client.get_full_name() or booking.client.email,
            'client_id': booking.client_id,
            'owner': booking.vehicle.owner.get_full_name() or booking.vehicle.owner.email,
            'start_date': booking.start_date,
            'end_date': booking.end_date,
            'mileage': booking.vehicle.mileage,
            'fuel_level': booking.vehicle.fuel_level,
        } for booking in page]
        return self.get_paginated_response(results)

    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[0-9]+)')
    def photos(self, request, pk=None, photo_id=None):
        """Supprimer une photo d'une fiche (remplacement dans l'éditeur)."""
        inspection = self.get_object()
        try:
            photo = inspection.photos.get(pk=photo_id)
        except Exception:
            return Response({'detail': 'Photo introuvable.'}, status=404)
        photo.delete()
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        if request.user.role not in ['ADMIN', 'CONTROLLER']:
            return Response({'detail': 'Accès réservé aux contrôleurs.'}, status=403)
        since = timezone.now() - timedelta(days=7)
        completed = VehicleInspection.objects.filter(inspection_date__gte=since)
        return Response({
            'entry_pending': self._queue_items('entry').count(),
            'exit_pending': self._queue_items('exit').count(),
            'completed_week': completed.count(),
            'issues_week': completed.exclude(issues=[]).count(),
            'average_score_week': completed.aggregate(value=Avg('condition_score'))['value'] or 0,
        })
