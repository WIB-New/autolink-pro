from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal

# ═══════════════════════════════════════════════════════════════════════════
# CLASSIFICATION & TARIFICATION — barème objectif paramétrable
# (Entretien « Classification des véhicules et politique tarifaire », sept. 2026)
#
# 5 catégories : Économique (basic), Intermédiaire (standard), Premium,
# Luxe (gold), Super Luxe / Collection (collection).
# L'attribution est AUTOMATIQUE à partir de données factuelles :
# marque, modèle, année, kilométrage, état, valeur marchande.
# Le propriétaire n'ajuste QUE le prix affiché, dans une marge encadrée (±20 %).
# ═══════════════════════════════════════════════════════════════════════════

# Standing de marque — pèse plus que toute autre variable (marché camerounais)
PRESTIGE_BRANDS = {
    'bentley', 'aston martin', 'maserati', 'porsche', 'rolls-royce',
    'ferrari', 'lamborghini', 'maybach',
}
PREMIUM_BRANDS = {
    'mercedes', 'bmw', 'audi', 'lexus', 'range rover', 'land rover',
    'jaguar', 'volvo', 'infiniti', 'cadillac', 'genesis',
}
UPPER_BRANDS = {
    'toyota', 'volkswagen', 'honda', 'nissan', 'mitsubishi', 'ford',
    'mazda', 'isuzu', 'peugeot', 'subaru',
}
# Modèles dont le standing réel diffère du standing de marque
MODEL_STANDING = {
    # utilitaires & citadines : standing abaissé même sous marque valorisée
    'sprinter': 'standard', 'hiace': 'standard', 'h-1': 'standard',
    'starlet': 'economy', 'yaris': 'economy', 'polo': 'economy',
    'golf': 'economy', 'civic': 'economy', 'vitara': 'standard',
    # modèles à forte valeur marchande au Cameroun : standing relevé
    'land cruiser': 'premium', 'prado': 'premium', 'patrol': 'premium',
    'touareg': 'premium', 'highlander': 'premium', 'sienna': 'premium',
}

# Prix indicatif journalier par catégorie (FCFA) — grille marché CM
TIER_BASE = {
    'basic': 18000, 'standard': 35000, 'premium': 70000,
    'gold': 130000, 'collection': 250000,
}
# Caution de garantie client par catégorie (luxe ⇒ caution élevée)
TIER_DEPOSIT = {
    'basic': 50000, 'standard': 100000, 'premium': 200000,
    'gold': 400000, 'collection': 800000,
}
# Forfait kilométrique inclus par jour + tarif du km supplémentaire
TIER_KM = {
    'basic': (200, 100), 'standard': (250, 150), 'premium': (300, 250),
    'gold': (350, 400), 'collection': (400, 600),
}
# Coefficient ville (élasticité prix locale)
CITY_COEF = {
    'douala': Decimal('1.00'), 'yaoundé': Decimal('0.95'), 'yaounde': Decimal('0.95'),
    'bafoussam': Decimal('0.90'), 'bamenda': Decimal('0.90'), 'buea': Decimal('0.90'),
    'limbe': Decimal('0.90'), 'kribi': Decimal('0.90'), 'garoua': Decimal('0.85'),
    'ngaoundéré': Decimal('0.85'), 'maroua': Decimal('0.85'), 'bertoua': Decimal('0.85'),
}
# Marge d'ajustement du prix par le propriétaire autour du prix indicatif
PRICE_MARGIN = Decimal('0.20')
# Socle valeur marchande : un véhicule se loue ≈ 0,15 % de sa valeur par jour
MARKET_VALUE_RATE = Decimal('0.0015')


class Vehicle(models.Model):
    class Mode(models.TextChoices):
        PLATFORM = 'platform', 'Confié à AutoLink'
        HOME = 'home', 'Chez le propriétaire (à la demande)'

    class Status(models.TextChoices):
        PENDING = 'pending', 'En attente de validation'
        APPROVED = 'approved', 'Approuvé'
        RENTED = 'rented', 'En location'
        MAINTENANCE = 'maintenance', 'En maintenance'
        SUSPENDED = 'suspended', 'Suspendu'

    class Tier(models.TextChoices):
        BASIC = 'basic', 'Économique'
        STANDARD = 'standard', 'Intermédiaire'
        PREMIUM = 'premium', 'Premium'
        GOLD = 'gold', 'Luxe'
        COLLECTION = 'collection', 'Super Luxe'

    class Fuel(models.TextChoices):
        ESSENCE = 'essence', 'Essence'
        DIESEL = 'diesel', 'Diesel'
        SUPER = 'super', 'Super'
        GASOIL = 'gasoil', 'Gasoil'
        HYBRID = 'hybrid', 'Hybride'
        ELECTRIC = 'electric', 'Électrique'

    class InsuranceType(models.TextChoices):
        STANDARD = 'standard', 'Standard'
        PREMIUM = 'premium', 'Premium'
        ALL_RISK = 'all_risk', 'Tous risques'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField(validators=[MinValueValidator(2000), MaxValueValidator(2030)])
    plate = models.CharField(max_length=20, unique=True)
    category = models.CharField(max_length=50)
    tier = models.CharField(max_length=20, choices=Tier.choices, default=Tier.STANDARD)
    fuel = models.CharField(max_length=20, choices=Fuel.choices)
    seats = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)])
    color = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    image_url = models.URLField(
        max_length=500, blank=True,
        help_text='Photo réelle du modèle (vignette allégée Wikimedia Commons).')
    mode = models.CharField(max_length=20, choices=Mode.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    driver_available = models.BooleanField(
        default=True,
        help_text='Le propriétaire peut fournir son propre chauffeur avec ce véhicule.'
    )

    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    computed_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # ── Données objectives de classification / tarification ──
    market_value = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True,
        help_text='Valeur marchande estimée du véhicule (FCFA) — socle du prix de location.')
    city = models.CharField(max_length=50, default='Douala',
                            help_text='Ville de mise à disposition — coefficient tarifaire local.')
    deposit_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Caution de garantie demandée au client (bloquée pendant la location).')
    km_included_per_day = models.IntegerField(null=True, blank=True)
    extra_km_rate = models.IntegerField(null=True, blank=True, help_text='Tarif du kilomètre au-delà du forfait (FCFA).')

    insurance_type = models.CharField(max_length=20, choices=InsuranceType.choices)
    insurance_expiry = models.DateField()
    technical_control_date = models.DateField(null=True, blank=True)
    condition_score = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    last_inspection_at = models.DateTimeField(null=True, blank=True)
    last_inspection_score = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])

    # Pièces justificatives téléversées par le propriétaire (étape 4 du wizard)
    registration_doc = models.FileField(upload_to='vehicles/docs/', null=True, blank=True,
                                        help_text='Carte grise — recto-verso.')
    insurance_doc = models.FileField(upload_to='vehicles/docs/', null=True, blank=True,
                                     help_text="Attestation d'assurance.")
    technical_control_doc = models.FileField(upload_to='vehicles/docs/', null=True, blank=True,
                                             help_text='Certificat de visite technique.')

    mileage = models.IntegerField(default=0)
    fuel_level = models.IntegerField(default=100, validators=[MinValueValidator(0), MaxValueValidator(100)])

    total_bookings = models.IntegerField(default=0)
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Véhicule'
        verbose_name_plural = 'Véhicules'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.brand} {self.model} {self.year} ({self.plate})'

    # ─── Classification objective ──────────────────────────────────────────
    def _standing(self):
        """Niveau de gamme : prestige > premium > standard > economy.
        Le modèle prime sur la marque pour les exceptions connues."""
        brand = (self.brand or '').strip().lower()
        model = (self.model or '').strip().lower()
        # Exception exacte (ex. Mazda « 3 »)
        if model == '3':
            return 'economy'
        for key, level in sorted(MODEL_STANDING.items(), key=lambda kv: -len(kv[0])):
            if key in model:
                return level
        if brand in PRESTIGE_BRANDS:
            return 'prestige'
        if brand in PREMIUM_BRANDS:
            return 'premium'
        if brand in UPPER_BRANDS:
            return 'standard'
        return 'economy'

    def _score(self):
        """Score objectif 0–100+ : année, kilométrage, état, valeur marchande."""
        s = 0.0
        age = timezone.now().year - self.year
        s += 12 if age <= 1 else 10 if age <= 3 else 7 if age <= 6 else 4 if age <= 10 else 2
        km = self.mileage or 0
        s += 12 if km < 30000 else 10 if km < 80000 else 7 if km < 150000 else 4 if km < 250000 else 2
        s += (self.condition_score or 0) * 0.12                      # 0–12 pts
        mv = float(self.market_value or 0)
        s += 18 if mv > 100_000_000 else 15 if mv > 60_000_000 else \
             12 if mv > 40_000_000 else 9 if mv > 25_000_000 else \
             6 if mv > 15_000_000 else 3 if mv > 8_000_000 else 0
        if self.insurance_type == 'all_risk':
            s += 2
        return s

    def classify(self):
        """Catégorie automatique : standing (marque/modèle) × score objectif."""
        st, sc = self._standing(), self._score()
        if st == 'prestige':
            return 'collection'
        if st == 'premium':
            return 'gold' if sc >= 45 else 'premium'
        if st == 'standard':
            if sc >= 60:
                return 'gold'
            if sc >= 48:
                return 'premium'
            return 'standard' if sc >= 30 else 'basic'
        return 'standard' if sc >= 33 else 'basic'

    # ─── Tarification ──────────────────────────────────────────────────────
    def compute_rate(self):
        """Prix indicatif AutoLink (FCFA/jour) : base catégorie + valeur
        marchande + ajustements année/km/état/assurance, coefficient ville."""
        base = float(TIER_BASE.get(self.tier, TIER_BASE['standard']))
        if self.market_value:
            base = max(base, float(self.market_value) * float(MARKET_VALUE_RATE))
        age = timezone.now().year - self.year
        if age <= 1:
            base += 5000
        elif age <= 3:
            base += 2000
        if (self.mileage or 0) > 150000:
            base -= 4000
        elif (self.mileage or 0) > 80000:
            base -= 1500
        base += round((self.condition_score or 0) / 100 * 5000)
        if self.insurance_type in ('premium', 'all_risk'):
            base += 2000
        coef = float(CITY_COEF.get((self.city or '').strip().lower(), Decimal('0.90')))
        return max(round(base * coef / 500) * 500, 8000)

    @property
    def price_min(self):
        return round(float(self.computed_rate or 0) * (1 - float(PRICE_MARGIN)))

    @property
    def price_max(self):
        return round(float(self.computed_rate or 0) * (1 + float(PRICE_MARGIN)))

    def save(self, *args, **kwargs):
        # 1) Catégorie : toujours recalculée — attribution objective, pas manuelle
        self.tier = self.classify()
        # 2) Prix indicatif recalculé
        self.computed_rate = self.compute_rate()
        # 3) Prix affiché : ajustement propriétaire encadré à ±20 % de l'indicatif
        indicative = float(self.computed_rate)
        if not self.daily_rate:
            self.daily_rate = indicative
        else:
            lo, hi = indicative * (1 - float(PRICE_MARGIN)), indicative * (1 + float(PRICE_MARGIN))
            self.daily_rate = min(max(float(self.daily_rate), lo), hi)
        # 4) Défauts liés à la catégorie si non renseignés
        if self.deposit_amount is None:
            self.deposit_amount = TIER_DEPOSIT[self.tier]
        km_def = TIER_KM[self.tier]
        if not self.km_included_per_day:
            self.km_included_per_day = km_def[0]
        if not self.extra_km_rate:
            self.extra_km_rate = km_def[1]
        super().save(*args, **kwargs)


class VehiclePhoto(models.Model):
    class Kind(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Vidéo'

    class Position(models.TextChoices):
        EXTERIOR = 'exterior', 'Extérieur'
        INTERIOR = 'interior', 'Intérieur'
        OTHER = 'other', 'Autre'

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='photos')
    image = models.FileField(upload_to='vehicles/')
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.IMAGE)
    position = models.CharField(max_length=10, choices=Position.choices, default=Position.EXTERIOR)
    caption = models.CharField(max_length=100, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Photo de {self.vehicle}'


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicle_favorites')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'vehicle'], name='unique_user_vehicle_favorite'),
        ]
        ordering = ['-created_at']


class VehicleAvailability(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='unavailable_periods')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = 'Indisponibilité'

    def __str__(self):
        return f'{self.vehicle} — {self.start_date} au {self.end_date}'
