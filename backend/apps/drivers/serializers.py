from rest_framework import serializers
from .models import DriverApplication, DriverProfile


class DriverApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    compliance_score = serializers.ReadOnlyField()

    class Meta:
        model = DriverApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'reviewer', 'applied_at', 'reviewed_at', 'status',
                            'driving_test_passed', 'driving_test_score', 'training_completed']

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

    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = ['total_trips', 'total_earned', 'rating', 'rating_count', 'certified_at']

    def get_driver_name(self, obj):
        return obj.driver.get_full_name()
