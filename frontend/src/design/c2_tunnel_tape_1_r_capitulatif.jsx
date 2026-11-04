import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { vehiclesAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const iso = (d) => d.toISOString().slice(0, 10);
const dmy = (isoStr) => new Date(isoStr).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const HTML = `<div class="flex flex-col w-full">
<!-- Stepper Bar Sub-Header -->
<div class="w-full bg-surface-container-low/80 py-space-sm px-margin">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm">
<!-- Interactive Visual Stepper --></div>
<!-- Interactive Visual Stepper -->
<nav aria-label="Progression du tunnel de réservation" class="flex items-center gap-space-xs sm:gap-space-sm">
<!-- Step 1: Active -->
<div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary text-on-primary shadow-sm">
<span class="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center font-label-sm text-label-sm font-bold">1</span>
<span class="font-label-md text-label-md font-semibold whitespace-nowrap">Récapitulatif & Documents</span>
</div>
<span class="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
<!-- Step 2: Upcoming -->
<div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface text-on-surface-variant">
<span class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-label-sm text-label-sm font-semibold">2</span>
<span class="font-label-md text-label-md whitespace-nowrap hidden sm:inline">Paiement Portefeuille</span>
<span class="font-label-md text-label-md whitespace-nowrap sm:hidden">Paiement</span>
</div>
<span class="material-symbols-outlined text-outline-variant text-[18px]">chevron_right</span>
<!-- Step 3: Upcoming -->
<div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface text-on-surface-variant">
<span class="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-label-sm text-label-sm font-semibold">3</span>
<span class="font-label-md text-label-md whitespace-nowrap hidden sm:inline">Confirmation & Check-in</span>
<span class="font-label-md text-label-md whitespace-nowrap sm:hidden">Check-in</span>
</div>
</nav>
</div>
</div>
<!-- Main Content Canvas -->
<div class="w-full max-w-7xl mx-auto px-margin py-space-lg">
<!-- Title Section with Asymmetric Metadata Pill -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
<div>
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">
          Finalisez votre réservation
        </h1>
</div>
</div>
<!-- 2-Column</div>
</div>
<!-- 2-Column Responsive Split Grid -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-start">
<!-- LEFT COLUMN: Main Verification & Vehicle Details (7 cols) -->
<section class="md:col-span-7 flex flex-col gap-space-lg min-w-0">
<!-- Vehicle Hero Overview Card -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div class="flex flex-col sm:flex-row gap-space-md items-start sm:items-center justify-between">
<div class="flex flex-col gap-space-xs">
<h2 class="font-headline-lg text-headline-lg text-on-surface">Toyota RAV4 Limited AWD 2022</h2>
</div>
<span class="font-label-md text-label-md px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-mono">
              MAT-LT-4921-CM
            </span>
</div>
<!-- Vehicle Media & Specification Ribbon -->
<div class="relative w-full h-56 sm:h-64 rounded-lg overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover" data-alt="Modern pearlescent white Toyota RAV4 Limited AWD 2022 parked under natural Douala daylight in front of lush tropical palm greenery, glossy high dynamic range automotive photography, deep rich contrast, sun reflections on metallic surface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJdQMBzIaMpO-wZTzveNhZx7PwKer24m1g_QJcRFjSyEENVJ01Uby7hlGMVeny8hFYzCMtatM2n1Iv6hwbGBNS_AtChu_OWg8cOSQyZzMdvSyhCYNJbV7QxG_brCQSdmEkDL-4b5ROmF0YI23E--q7QMqx_VgP73eZST19LnHvEC7oAu7dKWts5Y3gW2_6g4bo5XZjGfLSSyR2sxG7jsdb4RhSY3m4m3RQWm3kDilEZQblEYc7a6fjVQ"/>
<div class="absolute bottom-space-sm left-space-sm bg-inverse-surface/85 backdrop-blur-md px-space-md py-space-xs rounded-full flex items-center gap-space-xs text-inverse-on-surface">
<span class="material-symbols-outlined text-[16px] text-primary-fixed">verified</span>
<span class="font-label-sm text-label-sm font-semibold">Inspection 40 points validée hier</span>
</div>
<div class="absolute top-space-sm right-space-sm bg-surface-container-lowest/90 backdrop-blur-sm px-space-sm py-space-xs rounded-full text-on-surface flex items-center gap-space-xs font-label-sm text-label-sm font-bold shadow-sm">
<span class="material-symbols-outlined text-[16px] text-primary">local_gas_station</span>
              Plein fait (100%)
            </div>
</div>
<!-- Key Vehicle Specs Grid -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">settings</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Boîte</span>
<span class="font-label-md text-label-md font-bold">Automatique</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">ac_unit</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Confort</span>
<span class="font-label-md text-label-md font-bold">Clim. Bi-Zone</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">airline_seat_recline_normal</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Capacité</span>
<span class="font-label-md text-label-md font-bold">5 Sièges cuir</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">speed</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Traction</span>
<span class="font-label-md text-label-md font-bold">AWD Intégral</span>
</div>
</div>
</div>
<!-- Pickup and Delivery Matrix -->
<div class="flex flex-col gap-space-sm pt-space-xs">
<div class="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low">
<span class="material-symbols-outlined text-primary text-[22px] mt-0.5">pin_drop</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Lieu de prise en charge</span>
<span class="font-headline-sm text-headline-sm text-on-surface">Douala - Hub Central Akwa (ou livraison Aéroport DLA)</span>

</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
<div class="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
<div class="flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
                  Début de location
                </div>
<span class="font-headline-sm text-headline-sm text-on-surface">Mer. 29 Oct 2025</span>
<span class="font-label-md text-label-md text-on-surface-variant">08:30 (Matinée)</span>
</div>
<div class="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
<div class="flex items-center gap-space-xs text-primary font-label-md text-label-md font-semibold">
<span class="material-symbols-outlined text-[18px]">event_available</span>
                  Fin de location
                </div>
<span class="font-headline-sm text-headline-sm text-on-surface">Jeu. 30 Oct 2025</span>
<span class="font-label-md text-label-md text-on-surface-variant">08:30 (24h totales)</span>
</div>
</div>
<div class="flex items-center justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">social_distance</span>
<span class="font-body-md text-body-md text-on-surface">Kilométrage forfaitaire inclus :</span>
</div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">250 km inclus <span class="text-on-surface-variant font-normal">(150 FCFA/km sup)</span></span>
</div>
</div>
</div>
<!-- Options & Add-ons Summary Box -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">tune</span>
<h2 class="font-headline-md text-headline-md text-on-surface">Options et compléments confirmés</h2>
</div>
<button class="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-0.5 transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">edit</span>
              Modifier les options
            </button>
</div>
<div class="flex flex-col gap-space-sm">
<!-- Chauffeur -->
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-start gap-space-md">
<div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed mt-0.5">
<span class="material-symbols-outlined text-[20px]">person_apron</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Chauffeur professionnel certifié bilingue</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Maîtrise parfaite des axes Douala, Bonanjo, Akwa & Corridor Bonabéri. Bilingue Français / Anglais.</span>
<div class="mt-1 flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">verified_user</span>
                    Conducteur habilité par la plateforme AutoLink Pro
                  </div>
</div>
</div>
<span class="font-headline-sm text-headline-sm text-on-surface whitespace-nowrap">+10 000 FCFA</span>
</div>
<!-- Delivery -->
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-start gap-space-md">
<div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mt-0.5">
<span class="material-symbols-outlined text-[20px]">flight_land</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Livraison à l'Aéroport International de Douala (DLA)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Prise en charge au terminal des arrivées internationales avec pancarte personnalisée.</span>
</div>
</div>
<span class="font-headline-sm text-headline-sm text-on-surface whitespace-nowrap">+5 000 FCFA</span>
</div>
<!-- Insurance -->
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-start gap-space-md">
<div class="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-on-primary-fixed mt-0.5">
<span class="material-symbols-outlined text-[20px]">health_and_safety</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Assurance Tous Risques Activa Cameroun</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Couverture complète Responsabilité Civile, Bris de glace, Collision & Assistance remorquage 24/7. Franchise standard.</span>
</div>
</div>
<span class="font-headline-sm text-headline-sm text-primary whitespace-nowrap">Inclus</span>
</div>
</div>
</div>
<!-- Document Verification & Compliance Control -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[24px]">assignment_ind</span>
<div class="flex flex-col">
<h2 class="font-headline-md text-headline-md text-on-surface">Vérification de profil & Pièces requises</h2>
<span class="font-body-sm text-body-sm text-on-surface-variant">Conformité réglementaire pour la remise des clés au Cameroun</span>
</div>
</div>
<!-- Document 1: CNI/Passeport (Validated) -->
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-start gap-space-md">
<div class="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary mt-0.5">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Pièce d'identité (CNI Camerounaise ou Passeport)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Titulaire : Emmanuel K. • CNI N° 102938472 (Délivrée à Douala)</span>
</div>
</div>
<div class="flex items-center gap-space-xs bg-primary-fixed text-on-primary-fixed-variant px-space-md py-1 rounded-full font-label-sm text-label-sm font-bold">
<span class="material-symbols-outlined text-[16px]">check_circle</span>
              Validé
            </div>
</div>
<!-- Document 2: Driving License (Action Required Warning Banner) -->
<div class="p-space-md rounded-xl bg-tertiary-fixed/30 flex flex-col gap-space-sm" id="drivingLicenseBlock">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-start gap-space-md">
<div class="w-9 h-9 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mt-0.5">
<span class="material-symbols-outlined text-[20px]">warning</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-space-xs flex-wrap">
<span class="font-headline-sm text-headline-sm text-on-surface">Permis de conduire B</span>
<span class="bg-tertiary text-on-tertiary px-space-xs py-0.5 rounded font-label-sm text-label-sm font-bold">
                      Document manquant ou à renouveler
                    </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Veuillez téléverser votre permis de conduire (recto-verso) valide au Cameroun pour être autorisé à prendre le volant.
                  </p>
</div>
</div>
</div>
<!-- Upload Area & Alternative Checkbox -->
<div class="mt-space-xs flex flex-col gap-space-sm">
<div class="p-space-md rounded-lg bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-[32px] text-tertiary">cloud_upload</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md font-bold text-on-surface">Téléverser mon permis de conduire</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Formats acceptés : PDF, JPG, PNG (Max 10 Mo)</span>
</div>
</div>
<label class="cursor-pointer bg-surface-container-high hover:bg-surface-variant text-on-surface px-space-md py-space-xs rounded-lg font-label-md text-label-md font-bold transition-colors inline-flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px]">file_upload</span>
<span>Sélectionner le fichier</span>
<input accept=".pdf,.jpg,.jpeg,.png" class="hidden" id="licenseFileInput" type="file"/>
</label>
</div>
<!-- Exempt Checkbox if Driver Option is picked -->
<label class="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest/80 cursor-pointer select-none">
<input checked="" class="w-5 h-5 accent-primary rounded cursor-pointer" id="driverExemptCheck" type="checkbox"/>
<span class="font-label-md text-label-md text-on-surface">
<strong>Option avec chauffeur sélectionnée :</strong> Je serai uniquement passager, le permis du locataire n'est pas requis pour cette course.
                </span>
</label>
</div>
</div>
</div>
<!-- Note to Host / Agence Instructions Textarea -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">chat</span>
<label class="font-headline-md text-headline-md text-on-surface" for="bookingNotes">
              Précisions ou instructions de prise en charge <span class="font-body-sm text-body-sm text-on-surface-variant font-normal">(Optionnel)</span>
</label>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant">
            Partagez vos coordonnées de vol, numéro d'appel WhatsApp d'urgence ou toute demande spécifique pour faciliter l'accueil à Douala.
          </p>
<div class="relative w-full">
<textarea class="w-full rounded-lg bg-surface-container-low text-on-surface p-space-md font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest transition-all resize-y placeholder:text-outline" id="bookingNotes" placeholder="Ex: Arrivée vol Camair-Co QC204 à 08:15 avec 2 valises, merci de prévoir un panneau d'accueil au nom de K. Emmanuel..." rows="3"></textarea>
</div>
</div>
<!-- Big Primary Step Forward Action (Mobile & Desktop) -->
<div class="pt-space-xs">
<button class="w-full h-14 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-space-md shadow-lg transition-transform active:scale-[0.99]" id="btnContinuePayment" type="button">
<span>Continuer vers le paiement (Étape 2)</span>
<span class="material-symbols-outlined text-[24px]">arrow_forward</span>
</button>

</div>
</section>
<!-- RIGHT COLUMN: Sticky Financial Summary & Wallet Readiness (5 cols) -->
<aside class="md:col-span-5 sticky top-20 flex flex-col gap-space-md">
<!-- Booking Financial Summary Bento Card -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between pb-space-xs">
<h2 class="font-headline-lg text-headline-lg text-on-surface">Récapitulatif financier</h2>
<span class="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded font-mono font-label-sm text-label-sm">
              REF-DL-8290
            </span>
</div>
<!-- Vehicle Thumbnail Row -->
<div class="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low">
<div class="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-surface-container">
<img class="w-full h-full object-cover" data-alt="Toyota RAV4 2022 front three-quarter thumbnail view, clean studio lighting on car paint, compact rental preview badge." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_6_Gej-nB_hPlHQkuwMBDenrFu6482hehmIGoX9qGRAjNwLx7ALbGLhr6piSGizQxbpVklFQ5fAGCnSVIqFMZ_Mt3_RKYu7-ZzPKI9NBhddNoRyJXFG_gW3GF_RntLp5Kuu6dFh4HFl5ovDzbRF_bUJrdjj_f141C9h3XPY8Xhf7IEsY0vXURpSOQUC0XnULF92DC5rcNncMMTc72Ic_yAeDsTPou6w75_bRIwwm-icxwKqZR6Zi3Rw"/>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-lg text-label-lg font-bold text-on-surface truncate">Toyota RAV4 Limited</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">AWD 2022 • Douala Akwa</span>
<span class="text-primary font-label-sm text-label-sm font-semibold">24h de réservation</span>
</div>
</div>
<!-- Cost Breakdown List -->
<div class="flex flex-col gap-space-xs text-body-md text-body-md">
<div class="flex items-center justify-between py-1">
<span class="text-on-surface-variant">Location véhicule (1 jour / 24h)</span>
<span class="font-semibold text-on-surface">55 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-1">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Option Chauffeur certifié (24h)</span>
</div>
<span class="font-semibold text-on-surface">10 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-1">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Livraison Aéroport de Douala</span>
</div>
<span class="font-semibold text-on-surface">5 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-1">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Frais de service & Assurance Activa</span>
<span class="material-symbols-outlined text-[14px] text-outline cursor-help" title="Couverture tous risques obligatoire CEMAC">info</span>
</div>
<span class="font-semibold text-on-surface">3 500 FCFA</span>
</div>
</div>
<!-- Subtotal to be Charged Box -->
<div class="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-xs">
<div class="flex items-baseline justify-between">
<span class="font-headline-sm text-headline-sm text-on-surface">Total à débiter</span>
<div class="flex items-baseline gap-1">
<span class="font-display-lg text-headline-xl text-primary font-extrabold tracking-tight">73 500</span>
<span class="font-headline-sm text-headline-sm text-primary font-bold">FCFA</span>
</div>
</div>

</div>
<!-- Escrow / Caution Section -->
<div class="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs text-on-surface">
<span class="material-symbols-outlined text-[18px] text-tertiary">lock_clock</span>
<span class="font-headline-sm text-headline-sm">Caution sous séquestre</span>
</div>
<span class="font-currency-display text-currency-display text-on-surface">150 000 FCFA</span>
</div>
</div>
<!-- Wallet Balance Status Callout -->
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
<span class="font-label-md text-label-md font-semibold text-on-surface">Portefeuille AutoLink</span>
</div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Solde : 45 000 FCFA</span>
</div>
</div>
</div>
</aside>
</div>
</div>
<!-- Interactive State Micro-Script -->
<script>
    document.addEventListener('DOMContentLoaded', function () {
      const driverExemptCheck = document.getElementById('driverExemptCheck');
      const drivingLicenseBlock = document.getElementById('drivingLicenseBlock');
      const licenseFileInput = document.getElementById('licenseFileInput');
      const btnContinuePayment = document.getElementById('btnContinuePayment');

      if (driverExemptCheck && drivingLicenseBlock) {
        driverExemptCheck.addEventListener('change', function () {
          if (this.checked) {
            drivingLicenseBlock.classList.remove('bg-tertiary-fixed/30');
            drivingLicenseBlock.classList.add('bg-surface-container-low');
          } else {
            drivingLicenseBlock.classList.add('bg-tertiary-fixed/30');
            drivingLicenseBlock.classList.remove('bg-surface-container-low');
          }
        });
      }

      if (licenseFileInput) {
        licenseFileInput.addEventListener('change', function (e) {
          if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            alert('Fichier sélectionné avec succès : ' + fileName + '. Prêt pour transmission sécurisée.');
          }
        });
      }

      if (btnContinuePayment) {
        btnContinuePayment.addEventListener('click', function () {
          // Provide instant feedback and navigate to Step 2
          this.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span> <span>Chargement de la passerelle de paiement...</span>';
          this.disabled = true;
          setTimeout(function() {
            window.location.hash = '#etape-2-paiement';
          }, 600);
        });
      }
    });
  </script>
`;
const LINKS = {
  'Continuer vers le paiement': '/client/booking/paiement',
  'Retour au véhicule': '/client/search',
  'Modifier les options': '/client/search',
  'Assistance 24/7': '/help',
};

export default function C2TunnelEtape1Recapitulatif() {
  const [params] = useSearchParams();
  const vid = params.get('vehicle') || '';
  const start = params.get('start') || iso(new Date(Date.now() + 864e5));
  const end = params.get('end') || iso(new Date(Date.now() + 2 * 864e5));
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 864e5));
  const { data: v } = useApiData(() => (vid ? vehiclesAPI.detail(vid) : Promise.resolve({ data: null })), [vid]);

  const links = useMemo(() => ({
    ...LINKS,
    'Continuer vers le paiement': `/client/booking/paiement?vehicle=${vid}&start=${start}&end=${end}`,
  }), [vid, start, end]);

  const html = useMemo(() => {
    if (!v) return HTML;
    const name = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
    const rate = Number(v.daily_rate || v.computed_rate || 0);
    const deposit = Number(v.deposit_amount || 0);
    return HTML
      .replace(/Toyota RAV4 Limited AWD 2022/g, esc(name))
      .replace(/Toyota RAV4 Limited/g, esc(name))
      .replace('MAT-LT-4921-CM', esc(v.plate || ''))
      .replace('Douala - Hub Central Akwa (ou livraison Aéroport DLA)', esc(v.city ? `${v.city} - Prise en charge à convenir` : 'Lieu de prise en charge à convenir'))
      .replace('Mer. 29 Oct 2025', dmy(start))
      .replace('Jeu. 30 Oct 2025', dmy(end))
      .replace('(24h totales)', `(${days * 24}h totales)`)
      .replace(/24h de r.servation/g, `${days * 24}h de réservation`)
      .replace(/Location v.hicule \(1 jour \/ 24h\)/g, `Location véhicule (${days} jour${days > 1 ? 's' : ''} / ${days * 24}h)`)
      .replace('55 000 FCFA', `${fmt(rate * days)} FCFA`)
      .replace('73 500', `${fmt(rate * days + 18500)}`)
      .replace('150 000 FCFA', `${fmt(deposit)} FCFA`)
      .replace('45 000 FCFA', `${fmt(deposit)} FCFA`);
  }, [v, start, end, days]);

  return <DesignPage html={html} links={links} />;
}
