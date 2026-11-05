from rest_framework import serializers
from .models import DriverApplication, DriverEarning, DriverProfile


class DriverApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    applicant_phone = serializers.CharField(source='applicant.phone', read_only=True)
    compliance_score = serializers.ReadOnlyField()

    class Meta:
        model = DriverApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'reviewer', 'applied_at', 'reviewed_at', 'status',
                            'driving_test_passed', 'driving_test_score', 'training_completed']

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and request.user.role != 'ADMIN':
            fields['status'].read_only = True
            fields['reviewer_notes'].read_only = True
        return fields

    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name() if obj.applicant else obj.full_name

    def validate(self, attrs):
        user = self.context['request'].user
        # Candidat sans compte (landing) : identité complète obligatoire
        if not (user and user.is_authenticated):
            missing = [f for f in ('full_name', 'email', 'phone', 'city') if not attrs.get(f)]
            if missing:
                raise serializers.ValidationError({f: 'Champ obligatoire.' for f in missing})
        if attrs.get('experience_years', 0) < 0:
            raise serializers.ValidationError({'experience_years': 'Valeur invalide.'})
        return attrs


class DriverProfileSerializer(serializers.ModelSerializer):
    driver_name = serializers.SerializerMethodField()
    driver_email = serializers.EmailField(source='driver.email', read_only=True)

    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = ['total_trips', 'total_earned', 'rating', 'rating_count', 'certified_at']

    def get_driver_name(self, obj):
        return obj.driver.get_full_name()


class DriverEarningSerializer(serializers.ModelSerializer):
    booking_reference = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()

    class Meta:
        model = DriverEarning
        fields = ['id', 'booking', 'booking_reference', 'vehicle_name', 'amount', 'created_at']
        read_only_fields = fields

    def get_booking_reference(self, obj):
        return f'BK-{obj.booking_id:04d}'

    def get_vehicle_name(self, obj):
        return f'{obj.booking.vehicle.brand} {obj.booking.vehicle.model}'
