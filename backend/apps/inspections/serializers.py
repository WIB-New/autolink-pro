from rest_framework import serializers
from django.db import transaction
from .models import VehicleInspection, InspectionPhoto


class InspectionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectionPhoto
        fields = ['id', 'image', 'caption', 'uploaded_at']


class VehicleInspectionSerializer(serializers.ModelSerializer):
    photos = InspectionPhotoSerializer(many=True, read_only=True)
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False)
    controller_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    booking_reference = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.CharField(source='vehicle.plate', read_only=True)

    class Meta:
        model = VehicleInspection
        fields = '__all__'
        read_only_fields = ['controller', 'inspection_date']

    def get_controller_name(self, obj):
        if not obj.controller:
            return None
        return obj.controller.get_full_name() or obj.controller.email

    def get_client_name(self, obj):
        c = obj.booking.client
        return c.get_full_name() or c.email

    def get_booking_reference(self, obj):
        return f'BK-{obj.booking_id:04d}'

    def get_vehicle_name(self, obj):
        return f'{obj.vehicle.brand} {obj.vehicle.model} {obj.vehicle.year}'

    def _add_photos(self, inspection, files):
        import os
        for image in files:
            # Le frontend nomme le fichier d'après son emplacement (ex. "Avant.jpg")
            caption = os.path.splitext(getattr(image, 'name', '') or '')[0] or 'Photo inspection'
            InspectionPhoto.objects.create(
                inspection=inspection, image=image, caption=caption[:100])

    @transaction.atomic
    def create(self, validated_data):
        files = validated_data.pop('uploaded_photos', [])
        inspection = super().create(validated_data)
        self._add_photos(inspection, files)
        return inspection

    @transaction.atomic
    def update(self, instance, validated_data):
        # Réédition : les nouvelles photos s'ajoutent à la fiche existante.
        files = validated_data.pop('uploaded_photos', [])
        inspection = super().update(instance, validated_data)
        self._add_photos(inspection, files)
        return inspection
