from rest_framework import serializers
from pathlib import Path
from .models import Vehicle, VehiclePhoto, VehicleAvailability


class VehiclePhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = VehiclePhoto
        fields = ['id', 'image', 'kind', 'position', 'caption', 'uploaded_at']
        read_only_fields = fields

    def get_image(self, obj):
        if not obj.image:
            return ''
        url = obj.image.url
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url


class VehicleMediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehiclePhoto
        fields = ['image', 'kind', 'position', 'caption']

    IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'}
    VIDEO_EXTS = {'.mp4', '.webm', '.mov', '.avi', '.mkv'}
    MAX_IMAGE_SIZE = 10 * 1024 * 1024
    MAX_VIDEO_SIZE = 100 * 1024 * 1024

    def validate_image(self, file):
        ext = Path(file.name).suffix.lower()
        is_video = ext in self.VIDEO_EXTS
        if ext not in self.IMAGE_EXTS and not is_video:
            raise serializers.ValidationError(f'Type de fichier « {ext or "inconnu"} » non supporté (images et vidéos uniquement).')
        limit = self.MAX_VIDEO_SIZE if is_video else self.MAX_IMAGE_SIZE
        if file.size > limit:
            raise serializers.ValidationError(f'Fichier trop volumineux (max {limit // (1024 * 1024)} Mo).')
        return file

    def validate(self, attrs):
        ext = Path(attrs['image'].name).suffix.lower()
        attrs['kind'] = 'video' if ext in self.VIDEO_EXTS else 'image'
        return attrs


class VehicleSerializer(serializers.ModelSerializer):
    is_favorite = serializers.SerializerMethodField()

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        return obj.favorites.filter(user=user).exists()
    photos = VehiclePhotoSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()
    price_min = serializers.ReadOnlyField()
    price_max = serializers.ReadOnlyField()
    tier_label = serializers.CharField(source='get_tier_display', read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ['owner', 'tier', 'computed_rate', 'deposit_amount', 'km_included_per_day',
                            'extra_km_rate', 'total_bookings', 'total_earned',
                            'rating', 'rating_count', 'is_favorite', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return obj.owner.get_full_name()

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user.role == 'OWNER' and attrs.get('status') not in (None, 'suspended'):
            raise serializers.ValidationError({'status': 'Le statut est géré par AutoLink.'})
        return attrs


class VehicleAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleAvailability
        fields = '__all__'
