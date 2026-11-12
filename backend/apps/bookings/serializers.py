from rest_framework import serializers
from apps.inspections.serializers import VehicleInspectionSerializer
from .models import Booking
from django.utils import timezone
from datetime import datetime


class BookingSerializer(serializers.ModelSerializer):
    terms_accepted = serializers.BooleanField(write_only=True, required=False)
    debit_authorized = serializers.BooleanField(write_only=True, required=False)
    client_name = serializers.SerializerMethodField()
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    vehicle_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)
    vehicle_tier = serializers.CharField(source='vehicle.tier', read_only=True)
    vehicle_city = serializers.CharField(source='vehicle.city', read_only=True)
    vehicle_image = serializers.SerializerMethodField()
    vehicle_rating = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    owner_phone = serializers.CharField(source='vehicle.owner.phone', read_only=True)
    driver_name = serializers.SerializerMethodField()
    driver_avatar = serializers.SerializerMethodField()
    driver_phone = serializers.CharField(source='driver.phone', read_only=True)
    payment_method = serializers.CharField(source='payment.method', read_only=True)
    payment_status = serializers.CharField(source='payment.status', read_only=True)
    escrow_status = serializers.CharField(source='payment.escrow_status', read_only=True)
    deposit_status = serializers.CharField(source='payment.deposit_status', read_only=True)
    inspections = VehicleInspectionSerializer(many=True, read_only=True)
    deposit_refund_percent = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['client', 'driver', 'daily_rate', 'days', 'subtotal',
                            'driver_fee', 'delivery_fee', 'terms_accepted_at', 'debit_authorized_at', 'terms_version',
                            'commission_amount', 'owner_amount', 'discount_percent',
                            'deposit_amount',
                            'dispute_reason', 'dispute_opened_at', 'driver_response',
                            'owner_response', 'owner_responded_at',
                            'created_at', 'updated_at']

    def get_deposit_refund_percent(self, obj):
        from apps.users.models import PlatformSettings
        return 100 - float(PlatformSettings.current().cancel_deposit_keep_percent or 0)

    def get_client_name(self, obj): return obj.client.get_full_name()
    def get_vehicle_name(self, obj): return str(obj.vehicle)
    def get_driver_name(self, obj): return obj.driver.get_full_name() if obj.driver else None

    def get_driver_avatar(self, obj):
        if not obj.driver or not obj.driver.avatar:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.driver.avatar.url) if request else obj.driver.avatar.url
    def get_driver_phone(self, obj): return (obj.driver.phone or None) if obj.driver else None
    def get_vehicle_rating(self, obj): return float(obj.vehicle.rating or 0)
    def get_owner_name(self, obj): return obj.vehicle.owner.get_full_name()

    def get_vehicle_image(self, obj):
        vehicle = obj.vehicle
        photo = vehicle.photos.filter(kind='image').order_by('uploaded_at').first()
        if photo and photo.image:
            request = self.context.get('request')
            return request.build_absolute_uri(photo.image.url) if request else photo.image.url
        return getattr(vehicle, 'image_url', '') or None

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        stime = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        etime = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if bool(stime) != bool(etime):
            raise serializers.ValidationError({'end_time': 'Les deux heures sont obligatoires.'})
        if start and end and (end < start or (stime and datetime.combine(end, etime) < datetime.combine(start, stime))):
            raise serializers.ValidationError({'end_date': 'La fin ne peut pas précéder le début.'})
        if not self.instance and stime and not self.context.get('quote'):
            errors = {field: 'Votre accord est obligatoire.' for field in ('terms_accepted', 'debit_authorized') if not attrs.get(field)}
            if errors:
                raise serializers.ValidationError(errors)
        return attrs

    def create(self, validated_data):
        accepted = validated_data.pop('terms_accepted', False)
        authorized = validated_data.pop('debit_authorized', False)
        if accepted and authorized:
            validated_data.update(terms_accepted_at=timezone.now(), debit_authorized_at=timezone.now(), terms_version='location-v1')
        vehicle = validated_data['vehicle']
        # Prix affiché (ajusté par le proprio dans la marge encadrée) + caution figée
        validated_data['daily_rate'] = vehicle.daily_rate or vehicle.computed_rate
        validated_data['deposit_amount'] = vehicle.deposit_amount or 0
        return super().create(validated_data)
