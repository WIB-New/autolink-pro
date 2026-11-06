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
<img class="w-full h-full object-cover" data-alt="Modern pearlescent white Toyota RAV4 Limited AWD 2022 parked under natural Douala daylight in front of lush tropical palm greenery, glossy high dynamic range automotive photography, deep rich contrast, sun reflections on metallic surface." src="__VEH_IMG__"/>


</div>
<!-- Key Vehicle Specs Grid -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs">
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">settings</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Boîte</span>
<span class="font-label-md text-label-md font-bold">__TRANS__</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">ac_unit</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Confort</span>
<span class="font-label-md text-label-md font-bold">__FUEL__</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">airline_seat_recline_normal</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Capacité</span>
<span class="font-label-md text-label-md font-bold">__SEATS__</span>
</div>
</div>
<div class="flex items-center gap-space-xs p-space-sm rounded-lg bg-surface-container-low text-on-surface">
<span class="material-symbols-outlined text-primary text-[20px]">speed</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Traction</span>
<span class="font-label-md text-label-md font-bold">__CAT__</span>
</div>
</div>
</div>
<!-- Pickup and Delivery Matrix -->
<div class="flex flex-col gap-space-sm pt-space-xs">
<div class="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low">
<span class="material-symbols-outlined text-primary text-[22px] mt-0.5">pin_drop</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Lieu de prise en charge</span>
<span class="font-headline-sm text-headline-sm text-on-surface">__PICKUP__</span>

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
<span class="font-label-lg text-label-lg font-bold text-on-surface">__KM__</span>
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
<button id="btn-edit-options" class="text-primary hover:text-primary-container font-label-md text-label-md font-semibold flex items-center gap-0.5 transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">edit</span>
              Modifier les dates de la réservation
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
<label class="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface cursor-pointer"><input id="opt-driver" type="checkbox" class="w-4 h-4 accent-primary"/>Chauffeur professionnel certifié bilingue</label>
<span class="font-body-sm text-body-sm text-on-surface-variant">Chauffeur professionnel certifié par la plateforme AutoLink Pro.</span>
<div class="mt-1 flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">verified_user</span>
                    Conducteur habilité par la plateforme AutoLink Pro
                  </div>
</div>
</div>
<span class="font-headline-sm text-headline-sm text-on-surface whitespace-nowrap" id="opt-driver-amt">+10 000 FCFA</span>
</div>
<!-- Delivery -->
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low">
<div class="flex items-start gap-space-md">
<div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mt-0.5">
<span class="material-symbols-outlined text-[20px]">flight_land</span>
</div>
<div class="flex flex-col">
<label class="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface cursor-pointer"><input id="opt-delivery" type="checkbox" class="w-4 h-4 accent-primary"/>Livraison du vehicule</label>
<span class="font-body-sm text-body-sm text-on-surface-variant">Livraison a l'adresse de votre choix (aéroport, domicile, agence).</span>
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
<span class="font-body-sm text-body-sm text-on-surface-variant">Couverture obligatoire CEMAC incluse dans le tarif.</span>
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
<div class="flex items-start justify-between p-space-md rounded-lg bg-surface-container-low" id="cniBlock">
<div class="flex items-start gap-space-md">
<div class="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary mt-0.5">
<span class="material-symbols-outlined text-[20px]">badge</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface">Pièce d'identité (CNI Camerounaise ou Passeport)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant" id="cni-holder">Vérification du document…</span>
</div>
</div>
<div class="flex items-center gap-space-xs bg-surface-container-high text-on-surface-variant px-space-md py-1 rounded-full font-label-sm text-label-sm font-bold" id="cni-badge">
<span class="material-symbols-outlined text-[16px]">hourglass_empty</span>
              En attente
            </div>
</div>
<!-- Document 2: Driving License (Action Required Warning Banner) -->
<div class="p-space-md rounded-xl bg-tertiary-fixed/30 flex flex-col gap-space-sm" id="drivingLicenseBlock" data-doc="permis">
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
<textarea class="w-full rounded-lg bg-surface-container-low text-on-surface p-space-md font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest transition-all resize-y placeholder:text-outline" id="bookingNotes" oninput="try{localStorage.setItem('alp_booking_notes',this.value)}catch(e){}" placeholder="Ex: Arrivée vol Camair-Co QC204 à 08:15 avec 2 valises, merci de prévoir un panneau d'accueil au nom de K. Emmanuel..." rows="3"></textarea>
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
              REF-__REF__
            </span>
</div>
<!-- Vehicle Thumbnail Row -->
<div class="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low">
<div class="w-20 h-14 rounded overflow-hidden flex-shrink-0 bg-surface-container">
<img class="w-full h-full object-cover" data-alt="Toyota RAV4 2022 front three-quarter thumbnail view, clean studio lighting on car paint, compact rental preview badge." src="__VEH_IMG__"/>
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
<div class="flex items-center justify-between py-1" id="row-driver" style="display:none">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Option Chauffeur certifié (24h)</span>
</div>
<span class="font-semibold text-on-surface" id="amt-driver">10 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-1" id="row-delivery" style="display:none">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Livraison du véhicule</span>
</div>
<span class="font-semibold text-on-surface">5 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-1">
<div class="flex items-center gap-1 text-on-surface-variant">
<span>Frais de service & Assurance Activa</span>
<span class="material-symbols-outlined text-[14px] text-outline cursor-help" title="Couverture tous risques obligatoire CEMAC">info</span>
</div>
<span class="font-semibold text-primary">Inclus</span>
</div>
</div>
<!-- Subtotal to be Charged Box -->
<div class="p-space-md rounded-xl bg-surface-container-high flex flex-col gap-space-xs">
<div class="flex items-baseline justify-between">
<span class="font-headline-sm text-headline-sm text-on-surface">Total à débiter</span>
<div class="flex items-baseline gap-1">
<span id="veh-total-amount" class="font-headline-lg text-headline-lg text-primary font-extrabold tracking-tight">73 500</span>
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
<span class="font-headline-md text-headline-md font-bold text-on-surface">150 000 FCFA</span>
</div>
</div>
<!-- Wallet Balance Status Callout -->
<div class="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
<span class="font-label-md text-label-md font-semibold text-on-surface">Portefeuille AutoLink</span>
</div>
<span id="veh-wallet-bal" class="font-label-lg text-label-lg font-bold text-on-surface">Solde : __BAL__ FCFA</span>
</div>
</div>
</div>
</aside>
</div>
</div>

`;
const LINKS = {
  'Retour au véhicule': '/client/search',
  'Assistance 24/7': '/help',
};

export default function C2TunnelEtape1Recapitulatif() {
  const [params] = useSearchParams();
  const vid = params.get('vehicle') || '';
  const start = params.get('start') || iso(new Date(Date.now() + 864e5));
  const end = params.get('end') || iso(new Date(Date.now() + 2 * 864e5));
  const stime = params.get('stime') || '08:30';
  const etime = params.get('etime') || '08:30';
  const realHours = Math.max(0, (new Date(`${end}T${etime}`) - new Date(`${start}T${stime}`)) / 36e5);
  const days = Math.max(1, Math.ceil(realHours / 24));
  const { data: v } = useApiData(() => (vid ? vehiclesAPI.detail(vid) : Promise.resolve({ data: null })), [vid]);

  const links = useMemo(() => ({
    ...LINKS,
    'Modifier les dates de la réservation': `/client/vehicule/${vid}`, 
  }), [vid, start, end]);

  const html = useMemo(() => {
    if (!v) return HTML;
    const name = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
    const rate = Number(v.daily_rate || v.computed_rate || 0);
    const deposit = Number(v.deposit_amount || 0);
    const img = v.photos?.[0]?.image || v.image_url || '';
    const drv = params.get('driver') === '1';
    const opts = rate * days + (drv ? 10000 * days : 0);
    // Heures réelles passées par la fiche véhicule
    const period = (t) => { const h = parseInt(t, 10); return h < 12 ? 'Matinée' : h < 18 ? 'Après-midi' : 'Soirée'; };
    return HTML
      .replace(/__VEH_IMG__/g, esc(img))
      .replace('__REF__', `DL-${String(v.id || 0).padStart(4, '0')}-${String(Date.now()).slice(-5)}`)
      .replace('__TRANS__', esc(v.transmission || 'Automatique'))
      .replace('__FUEL__', esc(v.fuel_display || v.fuel || 'Essence'))
      .replace('__SEATS__', `${v.seats || 5} place${(v.seats || 5) > 1 ? 's' : ''} cuir`)
      .replace('__CAT__', esc(v.category || 'Traction'))
      .replace('__PICKUP__', esc(v.city ? `${v.city} - Prise en charge à convenir` : 'Lieu à convenir'))
      .replace('__KM__', `${fmt(v.km_included_per_day || 250)} km inclus <span class="text-on-surface-variant font-normal">(${fmt(v.extra_km_rate || 150)} FCFA/km sup)</span>`)
      .replace('__BAL__', '…')
      .replace(/Toyota RAV4 Limited AWD 2022/g, esc(name))
      .replace(/Toyota RAV4 Limited/g, esc(name))
      .replace('MAT-LT-4921-CM', esc(v.plate || ''))
      .replace('__PICKUP__', esc(v.city ? `${v.city} - Prise en charge à convenir` : 'Lieu de prise en charge à convenir'))
      .replace('Mer. 29 Oct 2025', dmy(start))
      .replace('Jeu. 30 Oct 2025', dmy(end))
      .replace('08:30 (Matinée)', `${stime} (${period(stime)})`)
      .replace('08:30 (24h totales)', `${etime} (${realHours}h totales)`)
      .replace(/24h de r.servation/g, `${realHours}h de réservation`)
      .replace(/Location v.hicule \(1 jour \/ 24h\)/g, `Location véhicule (${days} jour${days > 1 ? 's' : ''} facturés / ${realHours}h)`)
      .replace('Option Chauffeur certifié (24h)', `Option Chauffeur certifié (${days} jour${days > 1 ? 's' : ''})`)
      .replace('AWD 2022 • Douala Akwa', esc(`${v.category || ''} ${v.year || ''} · ${v.city || ''}`))
      .replace('55 000 FCFA', `${fmt(rate * days)} FCFA`)
      .replace('10 000 FCFA', drv ? `${fmt(10000 * days)} FCFA` : '')
      .replace('>73 500<', `>${fmt(opts)}<`)
      .replace('150 000 FCFA', `${fmt(deposit)} FCFA`)
      .replace('45 000 FCFA', `${fmt(deposit)} FCFA`);
  }, [v, start, end, days, stime, etime, realHours, params]);

  React.useEffect(() => {
    if (!v) return undefined;
    const click = (e) => {
      if (e.target.closest('#btnContinuePayment')) {
        const next = new URLSearchParams(params);
        next.set('driver', document.getElementById('opt-driver')?.checked ? '1' : '0');
        next.set('delivery', document.getElementById('opt-delivery')?.checked ? '1' : '0');
        const notes = document.getElementById('bookingNotes');
        if (notes) localStorage.setItem('alp_booking_notes', notes.value);
        window.location.href = `/client/booking/paiement?${next.toString()}`;
      }
      if (e.target.closest('label input[type=file]')) return;
    };
    // Upload d'un document (id_document | driving_license) -> persiste en base + apercu maj
    const uploadDoc = (field, file) => {
      if (!file) return;
      const fd = new FormData(); fd.append(field, file);
      import('../services/api').then(({ kycAPI, usersAPI }) => {
        kycAPI.upload(fd).then(() => usersAPI.me()).then(({ data: u2 }) => renderDocs(u2))
          .catch(() => {});
      });
    };
    // Apercu d'un document : vignette cliquable + bouton upload
    const docCard = (field, icon, label, url) => `
<div class="flex items-center gap-3 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
  <a href="${url || '#'}" ${url ? 'target="_blank" rel="noopener"' : ''} class="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden hover:opacity-80 transition-opacity" title="Ouvrir ${label}">
    ${url && /\.(jpe?g|png|gif|webp)$/i.test(url)
      ? `<img src="${url}" class="w-full h-full object-cover" alt="${label}"/>`
      : `<span class="material-symbols-outlined text-primary text-[26px]">description</span>`}
  </a>
  <div class="flex flex-col min-w-0 flex-1">
    <span class="font-label-md text-label-md font-bold text-on-surface truncate">${label}</span>
    ${url ? `<a href="${url}" target="_blank" rel="noopener" class="font-label-sm text-[11px] text-primary underline">Ouvrir le document</a>` : '<span class="font-label-sm text-[11px] text-on-surface-variant">Non fourni</span>'}
  </div>
  <label class="cursor-pointer bg-surface-container-high hover:bg-surface-variant text-on-surface px-3 py-1.5 rounded-lg font-label-sm text-label-sm font-bold transition-colors flex items-center gap-1" title="Téléverser / remplacer">
    <span class="material-symbols-outlined text-[15px]">upload</span>${url ? 'Remplacer' : 'Téléverser'}
    <input accept=".pdf,.jpg,.jpeg,.png" class="hidden" data-docfield="${field}" type="file"/>
  </label>
</div>`;
    const renderDocs = (u) => {
      const block = document.getElementById('drivingLicenseBlock');
      if (!block) return;
      const cniUrl = u?.id_document || '';
      const licUrl = u?.driving_license || '';
      block.innerHTML = `<div class="flex flex-col gap-2">
<div class="flex items-center gap-2 font-label-md text-label-md font-bold text-on-surface"><span class="material-symbols-outlined text-primary">check_circle</span>${cniUrl || licUrl ? 'Documents fournis — chargés depuis votre profil' : 'Documents à téléverser'}</div>
${docCard('id_document', 'badge', "Pièce d'identité", cniUrl)}
${docCard('driving_license', 'directions_car', 'Permis de conduire', licUrl)}
</div>`;
      block.querySelectorAll('input[data-docfield]').forEach((inp) => {
        inp.addEventListener('change', () => uploadDoc(inp.dataset.docfield, inp.files?.[0]));
      });
      // Badge CNI maj
      const cniBadge = document.getElementById('cni-badge');
      if (cniBadge && cniUrl) cniBadge.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span>Validé';
    };
    // Solde portefeuille reel — cible le seul element, jamais d'ancetre
    import('../services/api').then(({ walletAPI }) => {
      walletAPI.get().then(({ data: w }) => {
        const bal = document.getElementById('veh-wallet-bal');
        if (bal) bal.textContent = `Solde : ${fmt(w.balance ?? 0)} FCFA`;
      }).catch(() => {});
    });
    // Options : pré-cocher chauffeur si driver=1 + recalcul dynamique du total
    const rate = Number(v.daily_rate || v.computed_rate || 0);
    const drv = params.get('driver') === '1';
    const driverChk = document.getElementById('opt-driver');
    const deliveryChk = document.getElementById('opt-delivery');
    if (driverChk) driverChk.checked = drv;
    if (deliveryChk) deliveryChk.checked = params.get('delivery') === '1';
    const recalc = () => {
      const d = driverChk?.checked ? 10000 * days : 0;
      const l = deliveryChk?.checked ? 5000 : 0;
      const total = rate * days + d + l;
      const drvRow = document.getElementById('row-driver');
      if (drvRow) drvRow.style.display = driverChk?.checked ? '' : 'none';
      const drvAmt = document.getElementById('amt-driver');
      if (drvAmt) drvAmt.textContent = `${fmt(10000 * days)} FCFA`;
      document.querySelectorAll('#opt-driver-amt').forEach((a) => { a.textContent = driverChk?.checked ? `+${fmt(10000 * days)} FCFA` : ''; });
      const livAmt = document.getElementById('opt-delivery')?.closest('div')?.querySelector('.font-headline-sm.whitespace-nowrap, .whitespace-nowrap');
      if (livAmt && livAmt.id !== 'opt-driver-amt') livAmt.textContent = deliveryChk?.checked ? '+5 000 FCFA' : '';
      const delivRow = document.getElementById('row-delivery');
      if (delivRow) delivRow.style.display = deliveryChk?.checked ? '' : 'none';
      const totalEl = document.getElementById('veh-total-amount');
      if (totalEl) totalEl.textContent = fmt(total);
    };
    // Modifier les options -> scroll vers le bloc options
    document.getElementById('btn-edit-options')?.addEventListener('click', () => {
      document.getElementById('opt-driver')?.closest('.bg-surface-container-lowest')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('opt-driver')?.focus();
    });
    driverChk?.addEventListener('change', recalc);
    deliveryChk?.addEventListener('change', recalc);
    recalc(); // etat initial : chauffeur pre-coche si driver=1, livraison masquee
    // Notes : persister dans localStorage pour l'etape 2 + admin
    const notes = document.getElementById('bookingNotes');
    if (notes) {
      notes.value = localStorage.getItem('alp_booking_notes') || '';
      const saveNotes = () => { try { localStorage.setItem('alp_booking_notes', notes.value); } catch (e) {} };
      notes.addEventListener('input', saveNotes);
      notes.addEventListener('change', saveNotes);
    }
    // Prefill : docs deja televerses au profil
    import('../services/api').then(({ usersAPI }) => {
      usersAPI.me().then(({ data: u }) => {
        // Bloc CNI : vrai titulaire + statut + lien
        const cniHolder = document.getElementById('cni-holder');
        const cniBadge = document.getElementById('cni-badge');
        const uname = `${u?.first_name || ''} ${(u?.last_name || '')[0] || ''}.`.trim();
        if (u?.id_document) {
          if (cniHolder) cniHolder.innerHTML = `Titulaire : ${esc(uname)} · <a href="${u.id_document}" target="_blank" rel="noopener" class="text-primary underline">Ouvrir le document</a>`;
          if (cniBadge) cniBadge.className = 'flex items-center gap-space-xs bg-primary-fixed text-on-primary-fixed-variant px-space-md py-1 rounded-full font-label-sm text-label-sm font-bold';
        }
        renderDocs(u);
      }).catch(() => {});
    });
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [v, links]);

  return <DesignPage html={html} links={links} />;
}
