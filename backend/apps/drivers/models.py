from django.db import models
from django.conf import settings


class DriverApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente'
        REVIEW = 'review', 'En examen'
        APPROVED = 'approved', 'Approuvé'
        REJECTED = 'rejected', 'Refusé'

    applicant = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_application', null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # Identité publique (candidature depuis la landing, sans compte)
    full_name = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    city = models.CharField(max_length=80, blank=True)

    # Permis & expérience
    experience_years = models.IntegerField(default=0)
    license_type = models.CharField(max_length=10, blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    license_obtained_at = models.DateField(null=True, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    has_valid_license = models.BooleanField(default=False)

    # Disponibilité, garantie, références
    class Availability(models.TextChoices):
        FULL = 'full', 'Temps plein'
        PART = 'part', 'Temps partiel'
        WEEKEND = 'weekend', 'Week-ends uniquement'
    availability = models.CharField(max_length=20, choices=Availability.choices, default=Availability.FULL)
    guarantee_type = models.CharField(max_length=60, blank=True)
    references = models.TextField(blank=True)

    # Véhicule & conformité
    has_vehicle = models.BooleanField(default=False)
    vehicle_description = models.CharField(max_length=120, blank=True)
    has_insurance = models.BooleanField(default=False)
    professional_status = models.CharField(max_length=60, blank=True)
    message = models.TextField(blank=True)
    license_document = models.ImageField(upload_to='drivers/licenses/', null=True, blank=True)
    has_clean_criminal_record = models.BooleanField(default=False)
    criminal_record_document = models.ImageField(upload_to='drivers/criminal/', null=True, blank=True)
    has_medical_certificate = models.BooleanField(default=False)
    medical_certificate_document = models.ImageField(upload_to='drivers/medical/', null=True, blank=True)
    driving_test_passed = models.BooleanField(default=False)
    driving_test_score = models.IntegerField(null=True, blank=True)
    training_completed = models.BooleanField(default=False)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewer_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Candidature chauffeur"
        verbose_name_plural = "Candidatures chauffeurs"

    def __str__(self):
        name = self.applicant.get_full_name() if self.applicant else self.full_name
        return f'{name} — {self.status}'

    @property
    def compliance_score(self):
        checks = [
            self.has_valid_license,
            self.has_clean_criminal_record,
            self.has_medical_certificate,
            self.driving_test_passed,
            self.training_completed,
            bool(self.license_document),
            bool(self.criminal_record_document),
            bool(self.medical_certificate_document),
            self.experience_years >= 2,
        ]
        return round((sum(checks) / len(checks)) * 100)


class DriverProfile(models.Model):
    driver = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    assigned_vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    total_trips = models.IntegerField(default=0)
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    acceptance_rate = models.IntegerField(default=100)
    on_time_rate = models.IntegerField(default=100)
    is_online = models.BooleanField(default=False)
    certified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Profil chauffeur"

    def __str__(self):
        return f'Chauffeur: {self.driver.get_full_name()}'
