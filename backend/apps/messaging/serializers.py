from rest_framework import serializers
from .models import Conversation, Message


class ParticipantSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.SerializerMethodField()
    role = serializers.CharField()
    phone = serializers.CharField()
    avatar = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_avatar(self, obj):
        if not obj.avatar:
            return ''
        request = self.context.get('request')
        url = obj.avatar.url
        return request.build_absolute_uri(url) if request else url


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'attachment',
                  'is_read', 'is_mine', 'created_at']
        read_only_fields = ['id', 'conversation', 'sender', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return bool(request and request.user.id == obj.sender_id)

    def validate(self, attrs):
        if not (attrs.get('content') or '').strip() and not attrs.get('attachment'):
            raise serializers.ValidationError('Le message est vide.')
        return attrs


class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    booking_label = serializers.SerializerMethodField()
    booking_status = serializers.CharField(source='related_booking.status', read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'kind', 'subject', 'related_booking', 'booking_label', 'booking_status',
                  'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def _user(self):
        return self.context['request'].user

    def get_participants(self, obj):
        others = [u for u in obj.participants.all() if u.id != self._user().id]
        return ParticipantSerializer(others, many=True, context=self.context).data

    def get_last_message(self, obj):
        message = obj.messages.order_by('-created_at').first()
        return MessageSerializer(message, context=self.context).data if message else None

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False).exclude(sender=self._user()).count()

    def get_booking_label(self, obj):
        booking = obj.related_booking
        if not booking:
            return None
        return f'BK-{booking.pk:04d} · {booking.vehicle}'
