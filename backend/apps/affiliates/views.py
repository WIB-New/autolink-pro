from django.db import transaction
from rest_framework import filters, generics, permissions, serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import action
from config.pagination import StandardPagination
from .models import Agent, AgentPayout
from .serializers import AgentPayoutSerializer, AgentSerializer


class AffiliateAdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = AgentSerializer
    permission_classes = [AffiliateAdminPermission]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'phone', 'city', 'agent_type']
    ordering_fields = ['code', 'name', 'city', 'commission_rate', 'is_active', 'created_at']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        return Agent.objects.all()

    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """Filleuls rattachés à l'agent — paginé, recherche nom/email,
        avec leurs stats de locations complétées (CA attribué à l'agent)."""
        from django.db.models import Count, Q, Sum
        from apps.bookings.models import Booking
        agent = self.get_object()
        qs = agent.referrals.select_related('referred_user').order_by('-created_at')
        # 'search' est réservé au SearchFilter (il filtrerait les agents → 404).
        search = request.query_params.get('q', '').strip()
        if search:
            qs = qs.filter(
                Q(referred_user__first_name__icontains=search) |
                Q(referred_user__last_name__icontains=search) |
                Q(referred_user__email__icontains=search) |
                Q(referred_user__username__icontains=search))
        page = self.paginate_queryset(qs)
        rows = list(page) if page is not None else list(qs)
        stats = {
            s['client']: s for s in Booking.objects
                .filter(client_id__in=[r.referred_user_id for r in rows], status='completed')
                .values('client')
                .annotate(n=Count('id'), total=Sum('subtotal'))
        }
        data = [{
            'user_id': r.referred_user_id,
            'name': r.referred_user.get_full_name() or r.referred_user.username,
            'email': r.referred_user.email,
            'phone': r.referred_user.phone,
            'city': r.referred_user.city,
            'since': r.created_at,
            'completed_bookings': stats.get(r.referred_user_id, {}).get('n', 0),
            'generated_revenue': stats.get(r.referred_user_id, {}).get('total') or 0,
        } for r in rows]
        if page is not None:
            return self.get_paginated_response(data)
        return Response(data)


class AgentPayoutViewSet(viewsets.ModelViewSet):
    serializer_class = AgentPayoutSerializer
    permission_classes = [AffiliateAdminPermission]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['agent__code', 'agent__name', 'note', 'paid_by__email']
    ordering_fields = ['paid_at', 'amount', 'agent__code']
    ordering = ['-paid_at']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = AgentPayout.objects.select_related('agent', 'paid_by').all()
        agent = self.request.query_params.get('agent')
        if agent:
            qs = qs.filter(agent_id=agent)
        return qs

    @transaction.atomic
    def perform_create(self, serializer):
        agent = Agent.objects.select_for_update().filter(
            pk=serializer.validated_data['agent'].pk, is_active=True).first()
        if not agent:
            raise ValidationError({'agent': 'Agent introuvable ou désactivé.'})
        amount = serializer.validated_data['amount']
        if amount > agent.commission_due:
            raise ValidationError({'amount': 'Le montant dépasse les commissions dues.'})
        serializer.save(paid_by=self.request.user)
