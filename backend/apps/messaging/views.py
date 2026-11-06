from django.db.models import Q
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.bookings.models import Booking
from apps.users.models import Notification, User
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

STAFF_ROLES = ('ADMIN', 'CONTROLLER')


def _booking_members(booking):
    members = {booking.client, booking.vehicle.owner}
    if booking.driver:
        members.add(booking.driver)
    return members


class ConversationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                          mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Conversations de l'utilisateur connecté.

    POST accepte l'un de : ``booking`` (id), ``support`` (true) ou ``user`` (id,
    réservé à l'équipe AutoLink). Une conversation existante est réutilisée.
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['subject', 'participants__first_name', 'participants__last_name',
                     'related_booking__vehicle__brand', 'related_booking__vehicle__model']

    def get_queryset(self):
        qs = Conversation.objects.prefetch_related('participants', 'messages').select_related(
            'related_booking__vehicle')
        user = self.request.user
        if user.role == 'ADMIN' and self.request.query_params.get('scope') == 'all':
            return qs.distinct()
        qs = qs.filter(participants=user)
        kind = self.request.query_params.get('kind')
        if kind:
            qs = qs.filter(kind=kind)
        return qs.distinct()

    def create(self, request, *args, **kwargs):
        user = request.user
        booking_id = request.data.get('booking')
        if booking_id:
            booking = Booking.objects.select_related('vehicle__owner', 'client', 'driver').filter(
                pk=booking_id).first()
            if not booking:
                raise ValidationError({'booking': 'Réservation introuvable.'})
            members = _booking_members(booking)
            if user not in members and user.role not in STAFF_ROLES:
                raise PermissionDenied('Vous ne participez pas à cette réservation.')
            conversation = Conversation.objects.filter(kind='booking', related_booking=booking).first()
            if not conversation:
                conversation = Conversation.objects.create(
                    kind='booking', related_booking=booking,
                    subject=f'Réservation BK-{booking.pk:04d} · {booking.vehicle}')
            conversation.participants.add(*members, user)
        elif str(request.data.get('support', '')).lower() in ('1', 'true'):
            conversation = Conversation.objects.filter(kind='support', participants=user).first()
            if not conversation:
                conversation = Conversation.objects.create(
                    kind='support', subject=request.data.get('subject') or 'Support AutoLink')
                admins = User.objects.filter(role='ADMIN', is_active=True)
                conversation.participants.add(user, *admins)
        elif request.data.get('users'):
            others = User.objects.filter(pk__in=request.data.get('users') or [], is_active=True)
            if not others.exists():
                raise ValidationError({'users': 'Aucun utilisateur sélectionné.'})
            names = ', '.join((u.get_full_name() or u.username) for u in others[:3])
            conversation = Conversation.objects.create(
                kind='direct', subject=request.data.get('subject') or names)
            conversation.participants.add(user, *others)
        elif request.data.get('user'):
            other = User.objects.filter(pk=request.data.get('user')).first()
            if not other:
                raise ValidationError({'user': 'Utilisateur introuvable.'})
            conversation = (Conversation.objects.filter(kind='direct', participants=user)
                            .filter(participants=other).first())
            if not conversation:
                conversation = Conversation.objects.create(
                    kind='direct', subject=request.data.get('subject') or '')
                conversation.participants.add(user, other)
        else:
            raise ValidationError({'detail': 'Précisez une réservation, le support ou un utilisateur.'})
        return Response(self.get_serializer(conversation).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def users(self, request):
        """Annuaire léger pour composer un nouvel échange (photo, nom, email, rôle)."""
        q = (request.query_params.get('search') or '').strip()
        role = (request.query_params.get('role') or '').strip()
        qs = User.objects.filter(is_active=True).exclude(pk=request.user.pk)
        if role in ('CLIENT', 'DRIVER', 'OWNER', 'ADMIN'):
            qs = qs.filter(role=role)
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q) | Q(last_name__icontains=q)
                | Q(email__icontains=q) | Q(username__icontains=q))
        return Response([{
            'id': u.pk, 'name': u.get_full_name() or u.username, 'email': u.email,
            'role': u.role,
            'photo': u.photo.url if getattr(u, 'photo', None) and getattr(u.photo, 'url', None) else '',
        } for u in qs.order_by('first_name', 'last_name')[:40]])

    @action(detail=True, methods=['get', 'post'], parser_classes=[JSONParser, MultiPartParser, FormParser])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        if request.method == 'GET':
            conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
            data = MessageSerializer(conversation.messages.select_related('sender'), many=True,
                                     context={'request': request}).data
            return Response(data)
        if not conversation.participants.filter(pk=request.user.pk).exists():
            conversation.participants.add(request.user)
        serializer = MessageSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        message = serializer.save(conversation=conversation, sender=request.user)
        conversation.save(update_fields=['updated_at'])
        sender = request.user.get_full_name() or request.user.username
        Notification.objects.bulk_create([
            Notification(user=member, title='Nouveau message',
                         message=f'{sender} : {(message.content or "Pièce jointe")[:120]}')
            for member in conversation.participants.exclude(pk=request.user.pk)
        ])
        return Response(MessageSerializer(message, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'ok'})


class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user, is_read=False,
        ).filter(~Q(sender=request.user)).distinct().count()
        return Response({'unread': count})
