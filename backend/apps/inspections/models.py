from django.db import models
from django.conf import settings


class VehicleInspection(models.Model):
    class InspectionType(models.TextChoices):
        ENTRY = 'entry', "Fiche d'entrée"
        EXIT = 'exit', "Fiche de sortie"

    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='inspections')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='inspections')
    controller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    inspection_type = models.CharField(max_length=10, choices=InspectionType.choices)
    inspection_date = models.DateTimeField(auto_now_add=True)
    mileage_at_inspection = models.IntegerField()
    fuel_level = models.IntegerField()
    condition_score = models.IntegerField()
    checklist = models.JSONField(default=dict)
    issues = models.JSONField(default=list)
    notes = models.TextField(blank=True)
    edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='edited_inspections')
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Inspection véhicule"
        verbose_name_plural = "Inspections véhicules"
        ordering = ['-inspection_date']
        unique_together = [['booking', 'inspection_type']]

    def __str__(self):
        return f'{self.get_inspection_type_display()} — {self.vehicle} — {self.inspection_date.strftime("%d/%m/%Y")}'


class InspectionPhoto(models.Model):
    inspection = models.ForeignKey(VehicleInspection, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='inspections/')
    caption = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Photo inspection {self.inspection}'
