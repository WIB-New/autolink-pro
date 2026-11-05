from datetime import date
from django.shortcuts import get_object_or_404
from django.db.models import Max, Q
from rest_framework.exceptions import PermissionDenied
from django.db.models.deletion import ProtectedError
import django_filters
from rest_framework import generics, permissions, filters, status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from config.pagination import StandardPagination
from .models import Favorite, Vehicle, VehicleAvailability, VehiclePhoto
from .serializers import VehicleMediaUploadSerializer, VehicleSerializer, VehicleAvailabilitySerializer, VehiclePhotoSerializer


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.role in ('ADMIN', 'CONTROLLER') or request.user.is_staff


class VehicleFilter(django_filters.FilterSet):
    min_rate = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='gte')
    max_rate = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='lte')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='iexact')
    model = django_filters.CharFilter(field_name='model', lookup_expr='iexact')
    city = django_filters.CharFilter(field_name='city', lookup_expr='iexact')

    class Meta:
        model = Vehicle
        fields = ['category', 'fuel', 'status', 'owner', 'tier', 'city', 'driver_available']


class VehicleViewSet(ModelViewSet):
    queryset = Vehicle.objects.filter(status='approved')
    serializer_class = VehicleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['brand', 'model', 'plate', 'category']
    ordering_fields = ['computed_rate', 'rating', 'year', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='pending')

    def get_queryset(self):
        qs = Vehicle.objects.all()
        if self.request.user.is_authenticated:
            if self.request.user.role in ['ADMIN', 'CONTROLLER']:
                return qs
            if self.request.user.role == 'OWNER':
                if self.request.query_params.get('mine'):
                    return qs.filter(owner=self.request.user)
                if self.action == 'retrieve':
                    return qs.filter(Q(owner=self.request.user) | Q(status='approved'))
                if self.action in ('update', 'partial_update', 'destroy', 'media', 'delete_media'):
                    return qs.filter(owner=self.request.user)
        qs = qs.filter(status='approved')
        if self.request.query_params.get('available') == '1':
            start = (self.request.query_params.get('start')
                     or self.request.query_params.get('start_date')
                     or date.today().isoformat())
            end = (self.request.query_params.get('end')
                   or self.request.query_params.get('end_date')
                   or start)
            try:
                date.fromisoformat(start)
                date.fromisoformat(end)
            except ValueError:
                return qs.none()
            from apps.bookings.models import Booking
            booked = Booking.objects.filter(
                status__in=('confirmed', 'active'),
                start_date__lte=end,
                end_date__gte=start,
            ).values('vehicle_id')
            qs = qs.exclude(id__in=booked)
        return qs

    def perform_update(self, serializer):
        vehicle = self.get_object()
        data = serializer.validated_data
        sensitive = any(data.get(field, getattr(vehicle, field)) != getattr(vehicle, field)
                        for field in ('brand', 'model', 'year', 'plate'))
        if self.request.user.role == 'OWNER' and vehicle.status == 'approved' and sensitive:
            serializer.save(status='pending')
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        vehicle = self.get_object()
        if vehicle.bookings.exists():
            return Response(
                {'detail': 'Ce véhicule possède des réservations. Retirez-le du catalogue au lieu de le supprimer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        vehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='reviews', permission_classes=[permissions.AllowAny])
    def reviews(self, request, pk=None):
        vehicle = self.get_object()
        qs = vehicle.bookings.exclude(client_rating__isnull=True).select_related('client').order_by('-updated_at')[:20]
        return Response([{
            'id': b.id,
            'rating': b.client_rating,
            'review': b.client_review,
            'client': (f"{b.client.first_name} {b.client.last_name[:1]}.").strip() or b.client.username,
            'date': b.updated_at,
            'verified': True,
        } for b in qs])

    @action(detail=True, methods=['get'], url_path='similar', permission_classes=[permissions.AllowAny])
    def similar(self, request, pk=None):
        vehicle = self.get_object()
        qs = Vehicle.objects.filter(status='approved').exclude(pk=vehicle.pk)
        qs = qs.filter(Q(tier=vehicle.tier) | Q(category=vehicle.category) | Q(city__iexact=vehicle.city)).distinct()[:6]
        return Response(VehicleSerializer(qs, many=True, context={'request': request}).data)

    @action(detail=True, methods=['post', 'get'], parser_classes=[MultiPartParser, FormParser])
    def media(self, request, pk=None):
        vehicle = self.get_object()
        if request.method == 'GET':
            return Response(VehiclePhotoSerializer(vehicle.photos.order_by('position', 'id'), many=True, context={'request': request}).data)
        uploads = request.FILES.getlist('files') or request.FILES.getlist('files[]')
        if not uploads:
            return Response({'files': 'Ajoutez au moins un fichier.'}, status=status.HTTP_400_BAD_REQUEST)
        positions = request.data.getlist('positions') if hasattr(request.data, 'getlist') else []
        default_position = request.data.get('position', 'exterior')
        serializers = []
        for index, file in enumerate(uploads):
            serializer = VehicleMediaUploadSerializer(data={
                'image': file,
                'position': positions[index] if index < len(positions) else default_position,
                'caption': request.data.get('caption', ''),
            })
            serializer.is_valid(raise_exception=True)
            serializers.append(serializer)
        created = [serializer.save(vehicle=vehicle) for serializer in serializers]
        if not vehicle.image_url:
            cover = next((photo for photo in created if photo.kind == 'image'), None)
            if cover:
                vehicle.image_url = request.build_absolute_uri(cover.image.url)
                vehicle.save(update_fields=['image_url', 'updated_at'])
        return Response(VehiclePhotoSerializer(created, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='media/(?P<media_id>[^/.]+)')
    def delete_media(self, request, pk=None, media_id=None):
        vehicle = self.get_object()
        try:
            media = vehicle.photos.get(pk=media_id)
        except VehiclePhoto.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminVehicleViewSet(ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['brand', 'model', 'plate', 'category', 'owner__username',
                     'owner__email', 'owner__first_name', 'owner__last_name']
    ordering_fields = ['brand', 'model', 'year', 'daily_rate', 'status', 'created_at']
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        return [AdminVehiclePermission()]

    def get_queryset(self):
        return Vehicle.objects.select_related('owner').all()

    def destroy(self, request, *args, **kwargs):
        vehicle = self.get_object()
        if vehicle.bookings.exists():
            return Response(
                {'detail': 'Ce véhicule possède des réservations et ne peut pas être supprimé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            vehicle.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Ce véhicule est lié à des données protégées et ne peut pas être supprimé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminVehiclePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class ControllerVehicleReviewPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('ADMIN', 'CONTROLLER')


class ControllerPendingVehicleListView(generics.ListAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [ControllerVehicleReviewPermission]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['brand', 'model', 'plate', 'owner__username', 'owner__email']
    ordering_fields = ['created_at', 'brand', 'year', 'daily_rate']
    ordering = ['-created_at']

    def get_queryset(self):
        return Vehicle.objects.filter(status='pending').select_related('owner')


class ControllerVehicleDecisionView(APIView):
    permission_classes = [ControllerVehicleReviewPermission]

    def patch(self, request, pk):
        status_value = request.data.get('status')
        if status_value not in ('approved', 'suspended'):
            return Response({'status': 'Valeurs possibles : approved ou suspended.'}, status=400)
        updated = Vehicle.objects.filter(pk=pk, status='pending').update(status=status_value)
        if not updated:
            return Response({'detail': 'Véhicule en attente introuvable.'}, status=404)
        return Response(VehicleSerializer(Vehicle.objects.select_related('owner').get(pk=pk)).data)


class VehicleFacetsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        vehicles = Vehicle.objects.filter(status='approved')
        brands = list(vehicles.order_by('brand').values_list('brand', flat=True).distinct())
        models = {
            brand: list(vehicles.filter(brand=brand).order_by('model').values_list('model', flat=True).distinct())
            for brand in brands
        }
        return Response({
            'brands': brands,
            'models': models,
            'categories': list(vehicles.order_by('category').values_list('category', flat=True).distinct()),
            'fuels': list(vehicles.order_by('fuel').values_list('fuel', flat=True).distinct()),
            'cities': list(vehicles.exclude(city='').order_by('city').values_list('city', flat=True).distinct()),
            'max_rate': vehicles.aggregate(max_rate=Max('daily_rate'))['max_rate'] or 0,
        })


class FavoriteViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('vehicle')

    def list(self, request, *args, **kwargs):
        vehicles = VehicleSerializer([favorite.vehicle for favorite in self.get_queryset()], many=True, context={'request': request})
        return Response(vehicles.data)

    def create(self, request, *args, **kwargs):
        vehicle_id = request.data.get('vehicle')
        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id, status='approved')
        except (Vehicle.DoesNotExist, ValueError, TypeError):
            return Response({'vehicle': 'Véhicule introuvable.'}, status=status.HTTP_400_BAD_REQUEST)
        Favorite.objects.get_or_create(user=request.user, vehicle=vehicle)
        return Response({'vehicle': vehicle.pk}, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        favorite = self.get_queryset().filter(vehicle_id=kwargs['pk']).first()
        if favorite:
            favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VehicleAvailabilityView(generics.ListCreateAPIView):
    serializer_class = VehicleAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['start_date', 'end_date']
    search_fields = ['vehicle__brand', 'vehicle__model', 'vehicle__plate', 'reason']
    ordering_fields = ['start_date', 'end_date', 'vehicle__brand']

    def get_queryset(self):
        return VehicleAvailability.objects.filter(vehicle_id=self.kwargs['vehicle_id'])

    def perform_create(self, serializer):
        vehicle = get_object_or_404(Vehicle, pk=self.kwargs['vehicle_id'])
        user = self.request.user
        if vehicle.owner_id != user.id and user.role not in ('ADMIN', 'CONTROLLER'):
            raise PermissionDenied('Seul le propriétaire du véhicule peut déclarer une indisponibilité.')
        serializer.save(vehicle=vehicle)
