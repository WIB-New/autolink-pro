import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { bookingsAPI, authAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dmy = (d) => (d ? new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }) : '');

const HTML = `<div class="flex flex-col w-full pb-16">
<div class="max-w-7xl mx-auto px-margin-sm lg:px-margin w-full flex flex-col gap-8">
<!-- 1. Success Hero Banner -->
<section class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 lg:p-10 shadow-md">
<div class="absolute -right-20 -top-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none"></div>
<div class="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
<div class="flex items-start sm:items-center gap-5">
<div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-container/15 flex items-center justify-center shrink-0 text-primary">
<span class="material-symbols-outlined text-4xl sm:text-5xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<div class="flex flex-col gap-1.5">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Paiement confirmé & Réservation enregistrée avec succès !
            </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
              Votre demande a été transmise au propriétaire et au Hub AutoLink Akwa. Votre caution de 150 000 FCFA est placée sous séquestre sécurisé.
            </p>
</div>
</div>
<!-- Reference badge & copy -->
<div class="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-2 p-4 rounded-xl bg-surface-container-low shrink-0">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Numéro de réservation</span>
<div class="flex items-center gap-2">
<span class="font-headline-md text-headline-md text-primary tracking-wide" id="booking-ref">#ALP-2025-DLA-8924</span>
<button class="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface" id="copy-btn" title="Copier le code">
<span class="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
<span class="font-label-sm text-label-sm text-primary opacity-0 transition-opacity" id="copy-feedback">Copié dans le presse-papier !</span>
</div>
</div>
</section>
<!-- 2. Interactive Timeline: Que se passe-t-il maintenant ? -->
<section class="rounded-xl bg-surface-container-lowest p-6 lg:p-8 shadow-sm flex flex-col gap-6">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div class="flex items-center gap-3">
<div class="w-2.5 h-6 rounded-full bg-primary"></div>
<h2 class="font-headline-lg text-headline-lg text-on-surface">Que se passe-t-il maintenant ?</h2>
</div>
<div></div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
<!-- Step 1 (Completed) -->
<div class="relative flex flex-col p-5 rounded-xl bg-surface-container-low overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="w-8 h-8 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center font-bold">
<span class="material-symbols-outlined text-[18px]">done</span>
</span>
<span class="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">Validée</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Débit & Séquestre enregistrés</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
<strong>73 500 FCFA</strong> prélevés de votre portefeuille AutoLink. Caution de <strong>150 000 FCFA</strong> isolée sous séquestre bancaire.
          </p>
</div>
<!-- Step 2 (In Progress) -->
<div class="relative flex flex-col p-5 rounded-xl bg-surface-container-high/60 shadow-sm overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="w-8 h-8 rounded-full bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center font-bold animate-pulse">
              2
            </span>
<span class="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-primary animate-ping"></span> En cours
            </span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Vérification AutoLink Pro</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
            Nos agents au Hub Central de Douala vérifient la conformité de vos pièces d'identité et permis sous <strong>30 minutes</strong>.
          </p>
</div>
<!-- Step 3 (Upcoming) -->
<div class="relative flex flex-col p-5 rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center font-bold">
              3
            </span>
<span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sous 24h</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Confirmation finale du propriétaire</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
            Le propriétaire valide la mise à disposition sous 24h maximum.
          </p>
</div>
<!-- Step 4 (Delivery Day) -->
<div class="relative flex flex-col p-5 rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center font-bold">
              4
            </span>
<span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Jour J</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Notification SMS & WhatsApp</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
            Réception du code de remise et lien de l'état des lieux numérique photo avec le contact direct du chauffeur.
          </p>
</div>
</div>
</section>
<!-- 3. Two column layout below timeline -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
<!-- Left Column: Récapitulatif Véhicule & Itinéraire -->
<section class="lg:col-span-7 flex flex-col gap-6">
<div class="rounded-xl bg-surface-container-lowest p-6 lg:p-8 shadow-sm flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="font-headline-lg text-headline-lg text-on-surface">Détails de la réservation</h2>
</div>
<!-- Car snippet card -->
<div class="flex flex-col sm:flex-row gap-5 p-4 rounded-xl bg-surface-container-low items-center sm:items-stretch">
<img alt="Toyota RAV4 Hybrid" class="w-full sm:w-48 h-36 object-cover rounded-lg shrink-0 shadow-sm" data-alt="A modern pristine dark grey metallic Toyota RAV4 Hybrid 2022 parked in a sunny urban showroom in Douala Cameroon with reflective tinted windows and clean alloy wheels, architectural natural light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGGCNiwqQWNzhNpPZ9ItykT_vnEF9RNLehakyYV5vA5M5oato6S6az0uNjrS7GnLYRvRZLqBcpIN642mtifN9VwvBzITvXOouMuDKaSH9PZRq1kpAJ7L5FTRZvi7oORYcgOxCPLpAHObLbUO7XXYCzXiy3DsGfb1X6mbM-MuvvVYOrUhYtsw2UBYIPZV2fFsiyriYSyTRfWiC0AiUcCY1eI0DuNc_TRz74r-jlZP0ZbeWz0bn-v2hi1Q"/>
<div class="flex flex-col justify-between w-full py-1">
<div>
<div class="flex items-center gap-2">
<span class="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Flotte Certifiée Hub Akwa</span>
<span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Immat. LT-890-JA</span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mt-1">Toyota RAV4 AWD Hybrid 2022</h3>
<div class="flex flex-wrap items-center gap-4 mt-2 text-on-surface-variant font-label-sm text-label-sm">
<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span> 5 Places</span>
<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">settings</span> Hybride / Automatique</span>
<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">ac_unit</span> Clim A/C Bi-zone</span>
</div>
</div>
<div class="flex items-center gap-2 mt-3 pt-3">
<span class="material-symbols-outlined text-[16px] text-tertiary" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">4.92</span>
</div>
</div>
</div>
<!-- Schedule & Pickup Details -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
<span class="font-label-sm text-label-sm text-primary uppercase font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">location_on</span> Prise en charge
              </span>
<p class="font-headline-sm text-headline-sm text-on-surface">Mercredi 29 Oct. 2025</p>
<p class="font-label-md text-label-md text-on-surface font-semibold">08:30 GMT+1</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Hub Central AutoLink Akwa (Face Hôtel Douala Bercy) ou Livraison Terminal Douala International (DLA).
              </p>
</div>
<div class="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
<span class="font-label-sm text-label-sm text-secondary uppercase font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">event_repeat</span> Restitution
              </span>
<p class="font-headline-sm text-headline-sm text-on-surface">Jeudi 30 Oct. 2025</p>
<p class="font-label-md text-label-md text-on-surface font-semibold">08:30 GMT+1</p>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Hub Central AutoLink Akwa (Même point ou dépôt conventionné Yaoundé disponible).
              </p>
</div>
</div>
<!-- Included Options & Chauffeur -->
<div class="flex flex-col gap-3">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold">Options et services confirmés</h4>
<div class="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low">
<div class="flex items-center gap-3">
<div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">shield</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-semibold">Assurance Tous Risques Activa Assurances</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Couverture collision, vol et assistance dépannage 24/7</p>
</div>
</div>
<span class="font-label-md text-label-md text-primary font-bold">Incluse</span>
</div>
<div class="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low">
<div class="flex items-center gap-3">
<div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">person_check</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-semibold">Chauffeur professionnel bilingue (Français / Anglais)</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Conduite urbaine et axe lourd Douala-Yaoundé</p>
</div>
</div>
<span class="font-label-md text-label-md text-on-surface font-bold">+10 000 FCFA</span>
</div>
<!-- Chauffeur details card -->
<div class="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/40 mt-1">
<div class="flex items-center gap-3.5">
<div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-headline-sm shrink-0">
                  JM
                </div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-label-lg text-label-lg text-on-surface font-bold">Jean-Pierre M.</span>
<span class="px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">Chauffeur certifié</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Tél : +237 670 •• •• 12</span>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Right Column: Récapitulatif financier, Solde & Actions -->
<section class="lg:col-span-5 flex flex-col gap-6">
<!-- Financial Card -->
<div class="rounded-xl bg-surface-container-lowest p-6 lg:p-8 shadow-sm flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="font-headline-lg text-headline-lg text-on-surface">Règlement & Caution</h2>
<span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
</div>
<!-- Total Débité Breakdown -->
<div class="flex flex-col gap-3">
<div class="flex items-center justify-between py-2">
<span class="font-body-md text-body-md text-on-surface-variant">Location journalière (24h)</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">58 000 FCFA</span>
</div>
<div class="flex items-center justify-between py-2">
<span class="font-body-md text-body-md text-on-surface-variant">Prestation Chauffeur Pro</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">10 000 FCFA</span>
</div>
<div class="pt-3 flex items-center justify-between">
<div>
<span class="font-headline-md text-headline-md text-on-surface">Total payé & débité</span>
<p class="font-body-sm text-body-sm text-primary flex items-center gap-1 mt-0.5">
<span class="material-symbols-outlined text-[14px]">check</span> Portefeuille AutoLink
                </p>
</div>
<span class="font-currency-display text-currency-display text-primary font-extrabold">73 500 FCFA</span>
</div>
</div>
<!-- Caution Callout (High Trust) -->
<div class="p-4 rounded-xl bg-secondary-container/40 flex flex-col gap-2">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-secondary uppercase font-bold flex items-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">gavel</span> Caution sous séquestre bancaire
              </span>
<span class="font-headline-sm text-headline-sm text-on-surface">150 000 FCFA</span>
</div>
</div>
<!-- Remaining Wallet Balance -->
<div class="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-secondary text-2xl">account_balance</span>
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant">Nouveau solde portefeuille</p>
<p class="font-headline-sm text-headline-sm text-on-surface">26 500 FCFA</p>
</div>
</div>
<a class="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface transition-colors" href="/client/wallet?recharge=1">
              Recharger
            </a>
</div>
<!-- Downloads & Calendar buttons -->
<div class="flex flex-col gap-3 pt-2">
<button class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors" type="button">
<span class="material-symbols-outlined text-[20px] text-primary">download</span>
<span>Télécharger le reçu & contrat préliminaire (PDF)</span>
</button>
<button class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary">calendar_today</span>
<span>Ajouter au calendrier Google / Outlook</span>
</button>
</div>
</div>
<!-- WhatsApp Quick Support Banner -->
<div class="rounded-xl bg-surface-container-lowest p-6 shadow-sm flex items-start gap-4">
<div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-2xl">support_agent</span>
</div>
<div class="flex flex-col gap-1.5">
<h4 class="font-label-lg text-label-lg text-on-surface font-bold">Assistance locale 24/7</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Une question sur cette réservation ? Contactez notre Hub Douala en direct.
            </p>
<a class="inline-flex items-center gap-2 font-label-md text-label-md text-primary font-bold mt-1 hover:underline" href="https://wa.me/237655000000" rel="noopener noreferrer" target="_blank">
<span class="material-symbols-outlined text-[18px]">chat</span> WhatsApp : +237 655 00 00 00
            </a>
</div>
</div>
</section>
</div>
<!-- 4. Bottom Main Actions -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-surface-container-lowest shadow-sm mt-2">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary text-2xl">mark_email_read</span>
<span class="font-body-md text-body-md text-on-surface-variant">
          Un e-mail de confirmation détaillé vous a été adressé à <strong id="confirm-email">votre adresse</strong>
</span>
</div>
<div class="flex flex-wrap items-center gap-4 w-full sm:w-auto">
<a class="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors" href="#">
          Retour au tableau de bord
        </a>
<a class="w-full sm:w-auto text-center px-8 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-transform active:scale-95 shadow-sm" href="#">
          Voir mes réservations
        </a>
</div>
</div>
</div>
</div>
<script>
  function showToast() {
    const feedback = document.getElementById('copy-feedback');
    if (feedback) {
      feedback.classList.remove('opacity-0');
      feedback.classList.add('opacity-100');
      setTimeout(() => {
        feedback.classList.remove('opacity-100');
        feedback.classList.add('opacity-0');
      }, 2500);
    }
  }
</script>`;
const LINKS = {
  'Voir mes réservations': '/client/bookings',
  'Retour au tableau de bord': '/client/dashboard',
  'Recharger': '/client/wallet?recharge=1',
};

export default function C2TunnelEtape3Confirmation() {
  const [params] = useSearchParams();
  const bid = params.get('booking') || '';
  const { data: b } = useApiData(() => (bid ? bookingsAPI.detail(bid) : Promise.resolve({ data: null })), [bid]);
  const { data: me } = useApiData(() => authAPI.me(), []);

  const html = useMemo(() => {
    let h = HTML;
    if (b) {
      const name = b.vehicle_name || `${b.vehicle_brand || ''} ${b.vehicle_model || ''}`.trim();
      h = h
        .replace('#ALP-2025-DLA-8924', `#${esc(b.reference || `BK-${String(b.id).padStart(4, '0')}`)}`)
        .replace(/Toyota RAV4 Hybrid/g, esc(name))
        .replace('Immat. LT-890-JA', `Immat. ${esc(b.vehicle_plate || '')}`)
        .replace('Mercredi 29 Oct. 2025', dmy(b.start_date))
        .replace('Jeudi 30 Oct. 2025', dmy(b.end_date))
        .replace('58 000 FCFA', `${fmt(b.subtotal || b.total_price)} FCFA`)
        .replace(/73 500 FCFA/g, `${fmt(b.subtotal || b.total_price || 0)} FCFA`)
        .replace(/150 000 FCFA/g, `${fmt(b.deposit_amount)} FCFA`)
        .replace(/src="https:\/\/lh3\.googleusercontent\.com[^"]*"/, `src="${b.vehicle_image || ''}"`)
        .replace('Toyota RAV4 AWD Hybrid 2022', esc(name))
        .replace('5 Places', `${b.days || 1} jour(s) · ${b.vehicle_tier || ''}`)
        .replace('>4.92<', `>${b.vehicle_rating || '—'}<`)
        .replace('08:30 GMT+1', `${b.start_time ? String(b.start_time).slice(0, 5) : '—'} GMT+1`)
        .replace('08:30 GMT+1', `${b.end_time ? String(b.end_time).slice(0, 5) : '—'} GMT+1`)
        .replace('Hub Central AutoLink Akwa (Face Hôtel Douala Bercy) ou Livraison Terminal Douala International (DLA).', esc(b.pickup_address || 'Prise en charge à convenir'))
        .replace('Hub Central AutoLink Akwa (Même point ou dépôt conventionné Yaoundé disponible).', esc(b.dropoff_address || 'Restitution à convenir'))
        .replace('Jean-Pierre M.', esc(b.driver_name || 'Chauffeur AutoLink (assigné par le hub)'))
        .replace('+237 670 •• •• 12', esc(b.driver_phone || '—'));
    }
    if (me) h = h.replace('26 500 FCFA', `${fmt(me.balance)} FCFA`).replace('>votre adresse<', `>${esc(me.email || 'votre adresse')}<`);
    return h;
  }, [b, me]);

  React.useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('button, a');
      if (!el) return;
      if (el.id === 'copy-btn') {
        navigator.clipboard.writeText(b?.reference || `BK-${String(b?.id || 0).padStart(4, '0')}`);
        if (window.showToast) window.showToast();
      }
      if (el.textContent.includes('Télécharger le reçu')) {
        if (Date.now() - (window._pdfLast || 0) < 500) return;
        window._pdfLast = Date.now();
        const save = (data, name) => { const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); };
        if (b?.id) {
          bookingsAPI.receipt(b.id).then(({ data }) => save(data, `recu-BK-${String(b.id).padStart(4, '0')}.pdf`)).catch(() => {});
          bookingsAPI.contract(b.id).then(({ data }) => save(data, `contrat-BK-${String(b.id).padStart(4, '0')}.pdf`)).catch(() => {});
        }
      }
      // Ajouter au calendrier : .ics (Outlook) + Google Agenda (nouvel onglet)
      if (el.textContent.includes('calendrier')) {
        if (!b?.id) return;
        if (Date.now() - (window._icsLast || 0) < 500) return;
        window._icsLast = Date.now();
        const stamp = (d, t) => {
          const dt = new Date(`${d}T${t || '08:00'}`);
          return dt.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z';
        };
        const ics = [
          'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AutoLink Pro//FR', 'CALSCALE:GREGORIAN',
          'BEGIN:VEVENT',
          `UID:bk-${b.id}@autolink-pro`,
          `DTSTAMP:${stamp(new Date().toISOString().slice(0, 10), new Date().toTimeString().slice(0, 5))}`,
          `DTSTART:${stamp(b.start_date, b.start_time)}`,
          `DTEND:${stamp(b.end_date, b.end_time)}`,
          `SUMMARY:Location AutoLink — ${b.vehicle_name || 'Véhicule'} (BK-${String(b.id).padStart(4, '0')})`,
          `LOCATION:${(b.pickup_address || 'Prise en charge à convenir').replace(/,/g, '\\,')}`,
          `DESCRIPTION:Référence BK-${String(b.id).padStart(4, '0')} — Caution ${b.deposit_amount || 0} FCFA sous séquestre. ${(b.dropoff_address || '')}`,
          'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Prise en charge dans 2h', 'END:VALARM',
          'END:VEVENT', 'END:VCALENDAR',
        ].join('\r\n');
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
        const a = document.createElement('a'); a.href = url; a.download = `location-BK-${String(b.id).padStart(4, '0')}.ics`; a.click(); URL.revokeObjectURL(url);
        const gUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Location AutoLink — ${b.vehicle_name || 'Véhicule'} (BK-${String(b.id).padStart(4, '0')})`)}&dates=${stamp(b.start_date, b.start_time)}/${stamp(b.end_date, b.end_time)}&details=${encodeURIComponent(`Caution ${b.deposit_amount || 0} FCFA sous séquestre.`)}&location=${encodeURIComponent(b.pickup_address || '')}`;
        window.open(gUrl, '_blank', 'noopener');
      }
    };
    document.addEventListener('click', onClick);
    // Envoi du mail de confirmation (reçu + contrat en PJ) — une seule fois par réservation
    if (b?.id && me?.email && window[`_confMail${b.id}`] === undefined) {
      window[`_confMail${b.id}`] = 1;
      bookingsAPI.confirmationEmail(b.id).catch(() => {});
    }
    return () => document.removeEventListener('click', onClick);
  }, [b, me]);
  return <DesignPage html={html} links={LINKS} />;
}
