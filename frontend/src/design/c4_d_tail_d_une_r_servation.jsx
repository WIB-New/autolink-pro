import React, { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { bookingsAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dmy = (d) => (d ? new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '');
const ST = { pending: 'En attente', confirmed: 'Confirmée', active: 'En cours', completed: 'Terminée', cancelled: 'Annulée', disputed: 'Litige' };

const HTML = `<div class="flex flex-col w-full pb-16">
<!-- Top Navigation Context / Breadcrumb & Header Action Strip -->
<div class="flex flex-col gap-4 mb-6">
<div class="flex items-center justify-between">
<nav aria-label="Fil d'Ariane" class="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
<a class="hover:text-primary transition-colors flex items-center gap-1.5" href="#">
<span class="material-symbols-outlined text-[16px]">arrow_back</span>
          Mes réservations
        </a>
<span class="">/</span>
<span class="text-on-surface font-label-md font-semibold">Dossier #ALP-2025-DLA-8924</span>
</nav>
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
</div>
</div>
<!-- Main Title & Operational Actions Header -->
<div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
<div class="flex flex-col gap-1.5">
<div class="flex flex-wrap items-center gap-3">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Réservation Toyota RAV4 AWD Hybrid 2022
          </h1>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md shadow-sm">
<span class="material-symbols-outlined text-[16px]">verified</span>
            Confirmée • Clés prêtes pour demain
          </span>
</div>
<div class="flex items-center gap-3 text-on-surface-variant font-body-sm text-body-sm">
<span class="">Créée le 27 Octobre 2025 à 14:12</span>
<span class="">•</span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[15px] text-primary">security</span>
          </span>
</div>
</div>
<!-- Action Cluster -->
<div class="flex flex-wrap items-center gap-2.5">
<button class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm font-label-lg text-label-lg" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary">print</span>
        </button>
<button class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm font-label-lg text-label-lg" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary">download</span>
        </button>
<a class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md font-label-lg text-label-lg" href="https://wa.me/237670421890" rel="noopener noreferrer" target="_blank">
<span class="material-symbols-outlined text-[18px]">chat</span>
        </a>
</div>
</div>
</div>
<!-- Stepper / Progress Timeline Bar (5 steps visual horizontal stepper) -->
<section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm mb-8">
<div class="flex items-center justify-between mb-5">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">linear_scale</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Parcours & Cycle de Vie du Contrat</h2>
</div>
<span class="text-on-surface-variant font-label-sm text-label-sm">Étape 2 sur 5 complétée avec succès</span>
</div>
<div class="relative">
<!-- Background Connecting Bar -->
<div class="hidden lg:block absolute top-5 left-8 right-8 h-1 bg-surface-container rounded-full z-0">
<div class="h-full bg-primary rounded-full transition-all duration-700" style="width: 32%;"></div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
<!-- Step 1 -->
<div class="flex lg:flex-col items-start gap-3">
<div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm ring-4 ring-surface-container-lowest">
<span class="material-symbols-outlined text-[20px]">check</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">Étape 1 • Réglée</span>
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px] leading-snug">Réservation & Débit</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">27 Oct à 14:15 via Portefeuille</span>
</div>
</div>
<!-- Step 2 -->
<div class="flex lg:flex-col items-start gap-3">
<div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm ring-4 ring-surface-container-lowest">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-primary font-semibold uppercase tracking-wider">Étape 2 • Sécurisée</span>
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px] leading-snug">Séquestre caution</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">150 000 FCFA bloqués</span>
</div>
</div>
<!-- Step 3 (Active Upcoming) -->
<div class="flex lg:flex-col items-start gap-3">
<div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 ring-4 ring-primary/20 animate-pulse">
<span class="material-symbols-outlined text-[20px]">key</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">Étape 3 • Prévue</span>
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px] leading-snug">Départ & Clés</span>
<span class="text-primary font-body-sm text-body-sm font-semibold">29 Oct • 08:30 (Hub Akwa)</span>
</div>
</div>
<!-- Step 4 -->
<div class="flex lg:flex-col items-start gap-3 opacity-60">
<div class="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 ring-4 ring-surface-container-lowest">
<span class="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Étape 4 • Prévue</span>
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px] leading-snug">Retour & Restitution</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">30 Oct • 08:30</span>
</div>
</div>
<!-- Step 5 -->
<div class="flex lg:flex-col items-start gap-3 opacity-60">
<div class="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 ring-4 ring-surface-container-lowest">
<span class="material-symbols-outlined text-[20px]">lock_open</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Étape 5 • Finalisation</span>
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px] leading-snug">Déblocage caution</span>
<span class="text-on-surface-variant font-body-sm text-body-sm">Sous 15 min après retour</span>
</div>
</div>
</div>
</div>
</section>
<!-- Two-Column Master Operational Grid -->
<div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
<!-- LEFT COLUMN (Span 7) -->
<div class="xl:col-span-7 flex flex-col gap-8 min-w-0">
<!-- Bloc Véhicule & Itinéraire -->
<section class="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
<div class="relative w-full h-72 overflow-hidden bg-surface-container-high">
<img class="w-full h-full object-cover" data-alt="High quality professional studio shot of a 2022 Toyota RAV4 AWD Hybrid in pristine pearl white finish, parked in front of a sleek modern architectural glass building in Douala under bright sunlit daylight, highly detailed, photorealistic automotive styling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz4FQFMH6-o9rbWw-ILwxZA_z2PHgzn2B4wN4iOUCehHezzFw4-Go25_NcuBqLc_inPtclbAh-RkV2B95pAG9bQyqXyR_V7B1WxXV7_J4PGA49PEMODA7pqgisn0CJHSYVNE-fvEphJk9hoKMHJHju2Y082Czd6fJ_Imf1gaarrCuZunr_snzt7RCbcF2H5BPJ-Fqa1o_cit2dGtvdNciGZWDXHov-aqBy3-14bT3lMYJkE0I0ZoR5Mw">
<div class="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent"></div>
<div class="absolute top-4 left-4 flex items-center gap-2">
<span class="px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold tracking-wide uppercase shadow">
              Gamme Premium
            </span>
<span class="px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm flex items-center gap-1 shadow">
<span class="material-symbols-outlined text-primary text-[15px]">verified</span>
              Inspection certifiée 9.8 / 10
            </span>
</div>
<div class="absolute bottom-4 left-4 right-4 flex items-end justify-between text-on-primary">
<div>
<div class="font-headline-lg text-headline-lg font-bold">Toyota RAV4 AWD Hybrid (2022)</div>
<div class="font-mono text-label-md text-surface-container tracking-wider flex items-center gap-2 mt-0.5">
<span class="material-symbols-outlined text-[16px]">pin</span>
                MAT-LT-4921-CM • Châssis vérifié CEMAC
              </div>
</div>
<span class="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-currency-display text-[16px] leading-tight font-bold shadow">
              55 000 FCFA<span class="font-body-sm text-body-sm font-normal text-on-surface-variant">/j</span>
</span>
</div>
</div>
<div class="p-6 flex flex-col gap-6">
<!-- Route Itinerary Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-low">
<div class="flex items-start gap-3">
<div class="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">flight_takeoff</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Prise en charge</span>
<span class="font-label-lg text-label-lg text-on-surface">Mercredi 29 Octobre 2025 • 08:30</span>
<span class="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
<span class="material-symbols-outlined text-[14px] text-primary">location_on</span>
                  Hub Central Akwa, Douala (Face Direction MTN)
                </span>
</div>
</div>
<div class="flex items-start gap-3">
<div class="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">flight_land</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Restitution prévue</span>
<span class="font-label-lg text-label-lg text-on-surface">Jeudi 30 Octobre 2025 • 08:30</span>
<span class="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
<span class="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  Hub Akwa ou Dépose Aéroport International DLA
                </span>
</div>
</div>
</div>
<!-- Specs row -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
<div class="p-3 rounded-lg bg-surface-container flex flex-col items-center gap-1">
<span class="material-symbols-outlined text-secondary text-[20px]">speed</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Kilométrage</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">250 km inclus</span>
<span class="text-body-sm font-body-sm text-[10px] text-on-surface-variant">150 FCFA/km sup.</span>
</div>
<div class="p-3 rounded-lg bg-surface-container flex flex-col items-center gap-1">
<span class="material-symbols-outlined text-secondary text-[20px]">settings_suggest</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Transmission</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">Automatique AWD</span>
<span class="text-body-sm font-body-sm text-[10px] text-on-surface-variant">4x4 Intelligent</span>
</div>
<div class="p-3 rounded-lg bg-surface-container flex flex-col items-center gap-1">
<span class="material-symbols-outlined text-secondary text-[20px]">local_gas_station</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Carburant</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">Essence Hybride</span>
<span class="text-body-sm font-body-sm text-[10px] text-on-surface-variant">Plein au départ (100%)</span>
</div>
<div class="p-3 rounded-lg bg-surface-container flex flex-col items-center gap-1">
<span class="material-symbols-outlined text-secondary text-[20px]">ac_unit</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Confort</span>
<span class="font-label-md text-label-md text-on-surface font-semibold">Climatisation Pro</span>
<span class="text-body-sm font-body-sm text-[10px] text-on-surface-variant">Filtre anti-poussière</span>
</div>
</div>
<!-- Chauffeur assigné Card -->
<div class="p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div class="flex items-center gap-3.5">
<div class="relative">
<img class="w-14 h-14 rounded-full object-cover ring-2 ring-primary" data-alt="Close up portrait photograph of a confident Cameroonian professional private chauffeur wearing a crisp black blazer and collared shirt, warm friendly smile, natural daylight, soft bokeh background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM3NHp6KY3_bJ2tJh3lZ2zlhU_DDeF4qKM9QZb1KTtjz-sO1ETFe3h3ZR-ZYBGFAZLECYJYB47HTp7J030hWYY7h4YOl9TDEfc5T6ZTaRrgeLQCdHkXA-YB8tY3L6m8I6ZJG821Jcn-fU_FOJCJeQ5zzoYj-xo21EUPQsZACnnYSkrg47A9VYrC19i-D6xobEcss5mG_kh9VMHOnFWIeXGMZqOawKgDVSQTXwGpjAUg-pcfm5HtIHX1Q">
<span class="absolute bottom-0 right-0 w-4 h-4 bg-primary text-on-primary rounded-full flex items-center justify-center text-[10px]">
<span class="material-symbols-outlined text-[11px]">verified</span>
</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface text-[16px]">Jean-Pierre Mbida</span>
<span class="px-2 py-0.5 rounded text-[11px] font-label-sm bg-primary-container text-on-primary-container font-semibold">
                    Certifié AutoLink
                  </span>
</div>
<span class="text-body-sm font-body-sm text-on-surface-variant">Chauffeur professionnel bilingue (FR/EN) • 4.98 ★ (184 courses)</span>
<span class="text-label-sm font-label-sm text-secondary font-mono mt-0.5">+237 670 42 18 90</span>
</div>
</div>
<div class="flex items-center gap-2 self-end sm:self-center">
<a aria-label="Appeler le chauffeur" class="p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary transition-colors shadow-sm" href="tel:+237670421890">
<span class="material-symbols-outlined text-[20px]">phone</span>
</a>
<a aria-label="Contacter via WhatsApp" class="p-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:text-primary transition-colors shadow-sm" href="https://wa.me/237670421890" rel="noopener noreferrer" target="_blank">
<span class="material-symbols-outlined text-[20px]">chat</span>
</a>
</div>
</div>
</div>
</section>
</div>
<!-- RIGHT COLUMN (Span 5) -->
<div class="xl:col-span-5 flex flex-col gap-6">
<!-- Bloc Détail Financier & Séquestre -->
<section class="bg-surface-container-lowest rounded-xl p-6 shadow-md flex flex-col gap-5">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Détail Financier</h2>
</div>
<span class="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold">
            Payé intégralement
          </span>
</div>
<!-- Breakdown List -->
<div class="flex flex-col gap-3 font-body-md text-body-md">
<div class="flex items-center justify-between text-on-surface-variant">
<span class="">Location véhicule (24 heures)</span>
<span class="font-semibold text-on-surface">55 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant">
<span class="flex items-center gap-1.5">
<span class="">Chauffeur privé certifié (24h)</span>
<span class="material-symbols-outlined text-[14px] text-primary" title="Chauffeur dédié">person</span>
</span>
<span class="font-semibold text-on-surface">10 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant">
<span class="">Livraison personnalisée (Hub / Aéroport DLA)</span>
<span class="font-semibold text-on-surface">5 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant">
<span class="">Frais de service & Assurance tous risques</span>
<span class="font-semibold text-on-surface">3 500 FCFA</span>
</div>
<div class="pt-3 mt-1 bg-surface-container-high/40 p-3.5 rounded-lg flex items-center justify-between">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface-variant">Total débité</span>
<span class="text-body-sm font-body-sm text-on-surface-variant">Portefeuille AutoLink • 27 Octobre</span>
</div>
<div class="font-currency-display text-currency-display text-primary font-bold">
              73 500 FCFA
            </div>
</div>
</div>
<!-- Caution Séquestre Box -->
<div class="p-4 rounded-xl bg-surface-container-high/60 flex flex-col gap-2.5">
<div class="flex items-center justify-between">
<div class="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold">
<span class="material-symbols-outlined text-primary text-[18px]">account_balance</span>
              Caution bloquée sous séquestre
            </div>
<span class="font-currency-display text-[17px] font-bold text-on-surface">150 000 FCFA</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant leading-snug">
          </p>
<div class="flex items-center gap-2 pt-1 text-[11px] font-label-sm text-primary">
<span class="material-symbols-outlined text-[15px]">verified</span>
          </div>
</div>
</section>
<!-- Bloc Annulation & Remboursement calculé en direct -->
<section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-5">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">event_repeat</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Conditions d'Annulation</h3>
</div>
<span class="text-label-sm font-label-sm text-primary font-semibold">18h restantes</span>
</div>
<!-- Jauge d'annulation -->
<div class="flex flex-col gap-2">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-on-surface font-semibold">Annulation 100% gratuite</span>
<span class="text-on-surface-variant">Jusqu'au 28 Oct à 08:30</span>
</div>
<div class="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
<div class="bg-primary h-full rounded-full transition-all duration-500" style="width: 72%;"></div>
</div>
</div>
<!-- Estimation remboursement en direct -->
<div class="p-3.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Estimation de remboursement immédiat :</span>
<div class="flex items-center justify-between font-label-md text-label-md text-on-surface">
<span class="">Remboursement réservation :</span>
<span class="font-bold text-primary">73 500 FCFA (100%)</span>
</div>
<div class="flex items-center justify-between font-label-md text-label-md text-on-surface">
<span class="">Déblocage caution :</span>
</div>
<span class="text-body-sm font-body-sm text-[11px] text-on-surface-variant mt-1">
          </span>
</div>
<button class="w-full py-2.5 px-4 rounded-lg bg-error-container text-error hover:bg-error hover:text-on-error transition-all font-label-md text-label-md font-semibold flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined text-[18px]">cancel</span>
          Demander l'annulation de cette réservation
        </button>
</section>
<!-- Bloc Litige & Signalement d'incident -->
<section class="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3">
<div class="flex items-start gap-3">
<div class="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px] text-secondary">support_agent</span>
</div>
<div class="flex flex-col gap-1">
<h4 class="font-headline-sm text-headline-sm text-on-surface text-[16px]">Un imprévu ou un problème ?</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Notre équipe d'arbitrage intervient 24/7 pour régler les désaccords d'horaires, de conformité ou de chauffeur.
            </p>
</div>
</div>
<button class="w-full py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md font-semibold flex items-center justify-center gap-2" type="button">
<span class="material-symbols-outlined text-[18px]">gavel</span>
          Ouvrir une médiation / Signaler un litige
        </button>
</section>
<!-- Bloc Avis & Évaluation (Inactif / Protégé) -->
<section class="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3 opacity-75">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-on-surface-variant text-[20px]">star_rate</span>
<h4 class="font-headline-sm text-headline-sm text-on-surface text-[16px]">Avis & Évaluation</h4>
</div>
<span class="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-label-sm">
            Verrouillé
          </span>
</div>
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-[22px] text-surface-dim">star</span>
<span class="material-symbols-outlined text-[22px] text-surface-dim">star</span>
<span class="material-symbols-outlined text-[22px] text-surface-dim">star</span>
<span class="material-symbols-outlined text-[22px] text-surface-dim">star</span>
<span class="material-symbols-outlined text-[22px] text-surface-dim">star</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant italic">
          L'évaluation du véhicule et du chauffeur Jean-Pierre Mbida sera déverrouillée immédiatement après la restitution définitive du véhicule.
        </p>
</section>
<!-- Information Garantie AutoLink CEMAC -->
<div class="p-4 rounded-xl bg-surface-container-low flex items-center gap-3 text-on-surface-variant">
<span class="material-symbols-outlined text-primary text-[24px]">verified_user</span>
<div class="flex flex-col">
<span class="text-body-sm font-body-sm text-[11px]">Véhicule de remplacement garanti sous 45 min en cas de panne technique à Douala.</span>
</div>
</div>
</div>
</div>
`;

const LINKS = {
  'Mes réservations': '/client/bookings',
  'Ouvrir une médiation / Signaler un litige': '/messages',
  'Assistance WhatsApp': '/messages',
};

export default function C4DetailReservation() {
  const { id } = useParams();
  const { data: b } = useApiData(() => bookingsAPI.detail(id), [id]);

  useEffect(() => {
    const click = (e) => {
      const el = e.target.closest('button, a');
      if (!el) return;
      const t = el.textContent || '';
      if (t.includes("Demander l'annulation")) {
        e.preventDefault();
        if (window.confirm('Annuler cette réservation ?')) {
          bookingsAPI.updateStatus(id, 'cancelled').then(() => window.location.reload()).catch(() => {});
        }
      } else if (t.trim() === 'star' && el.closest('[data-rate-zone]')) {
        e.preventDefault();
        const stars = [...el.closest('[data-rate-zone]').querySelectorAll('button')];
        window._rating = stars.indexOf(el.closest('button') || el) + 1;
        if (window._rating < 1) window._rating = 1;
        stars.slice(0, window._rating).forEach((s) => { s.style.color = '#f59e0b'; });
      } else if (t.includes('Envoyer mon évaluation') || t.includes('Soumettre')) {
        e.preventDefault();
        const ta = document.querySelector('[data-rate-zone] textarea');
        bookingsAPI.rate(id, window._rating || 5, ta?.value || '')
          .then(() => window.location.reload())
          .catch((err) => alert(err?.response?.data?.detail || 'Évaluation impossible.'));
      } else if (t.includes('médiation') || t.includes('Signaler un litige')) {
        e.preventDefault();
        const reason = window.prompt('Décrivez le problème rencontré :');
        if (reason !== null) {
          bookingsAPI.dispute(id, reason || 'Problème signalé par le client')
            .then(() => window.location.reload())
            .catch((err) => alert(err?.response?.data?.status || err?.response?.data?.detail || "Impossible d'ouvrir un litige sur cette réservation."));
        }
      }
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [id]);

  const html = useMemo(() => {
    if (!b) return HTML;
    const name = b.vehicle_name || 'Véhicule';
    const days = Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 864e5));
    let h = HTML
      .replace(/Toyota RAV4 AWD Hybrid 2022/g, esc(name))
      .replace(/Toyota RAV4 AWD Hybrid/g, esc(name))
      .replace('#ALP-2025-DLA-8924', `#${esc(b.reference || `BK-${String(b.id).padStart(4, '0')}`)}`)
      .replace(/data-alt="[^"]*" src="[^"]+">/, b.vehicle_image ? `src="${b.vehicle_image}">` : (m) => m)
      .replace('MAT-LT-4921-CM', esc(b.vehicle_plate || ''))
      .replace('Confirmée • Clés prêtes pour demain', ST[b.status] || b.status)
      .replace(/55 000 FCFA\/j/g, `${fmt(b.daily_rate)} FCFA/j`)
      .replace(/55 000 FCFA/g, `${fmt(b.subtotal)} FCFA`)
      .replace(/73 500 FCFA/g, `${fmt(b.subtotal)} FCFA`)
      .replace(/150 000 FCFA/g, `${fmt(b.deposit_amount)} FCFA`)
      .replace('Déblocage caution :', `Déblocage caution : ${fmt(b.deposit_amount)} FCFA`)
      .replace('Mercredi 29 Octobre 2025 • 08:30', dmy(b.start_date))
      .replace('Jeudi 30 Octobre 2025 • 08:30', dmy(b.end_date))
      .replace('Location véhicule (24 heures)', `Location véhicule (${days} jour${days > 1 ? 's' : ''} / ${days * 24}h)`)
      .replace('Jean-Pierre Mbida', esc(b.driver_name || 'Sans chauffeur'))
      .replace(/\+237 670 42 18 90|\+237 699 12 34 56/g, esc(b.driver_phone || b.owner_phone || ''))
      .replace(/Douala - Hub Akwa( \(Face Direction MTN\))?/g, esc(b.pickup_address || b.vehicle_city || ''))
      .replace(/Hub Akwa ou D.pose A.roport International DLA/g, esc(b.dropoff_address || b.pickup_address || ''))
      .replace('Hub Central Akwa, Douala (Face Direction MTN)', esc(b.pickup_address || b.vehicle_city || ''))
      .replace('Douala - Hub Central Akwa', esc(b.dropoff_address || b.vehicle_city || ''));
    // Bloc Avis : interactif si terminée non notée, note affichée si notée
    if (b.status === 'completed' && !b.client_rating) {
      h = h.replace(/<section class="[^"]*"[^>]*>[\s\S]*?Avis & Évaluation[\s\S]*?<\/section>/,
        `<section class="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3" data-rate-zone>
          <h2 class="font-headline-sm text-headline-sm text-on-surface">Avis & Évaluation</h2>
          <div class="flex gap-1">${[1, 2, 3, 4, 5].map(() => '<button type="button" class="material-symbols-outlined text-[32px] text-outline hover:text-amber-500 transition-colors">star</button>').join('')}</div>
          <textarea class="w-full rounded-lg border border-outline-variant p-3 text-sm" rows="3" placeholder="Décrivez votre expérience..."></textarea>
          <button class="self-start px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold">Envoyer mon évaluation</button>
        </section>`);
    } else if (b.client_rating) {
      h = h.replace(/<section class="[^"]*"[^>]*>[\s\S]*?Avis & Évaluation[\s\S]*?<\/section>/,
        `<section class="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-2 opacity-90">
          <h2 class="font-headline-sm text-headline-sm text-on-surface">Avis & Évaluation</h2>
          <div class="flex gap-0.5 text-amber-500">${'<span class="material-symbols-outlined text-[24px]">star</span>'.repeat(b.client_rating)}${'<span class="material-symbols-outlined text-[24px] text-outline">star</span>'.repeat(5 - b.client_rating)}</div>
          ${b.client_review ? `<p class="text-body-sm text-on-surface-variant italic">“${esc(b.client_review)}”</p>` : ''}
          <span class="text-label-sm text-on-surface-variant">Merci pour votre évaluation.</span>
        </section>`);
    }
    if (b.driver_type === 'none') {
      h = h.replace(/Chauffeur privé certifié \(24h\)[^<]*/g, '')
           .replace(/<span[^>]*>10 000 FCFA<\/span>/, '')
           .replace(/Livraison personnalisée \(Hub \/ Aéroport DLA\)[^<]*/g, '')
           .replace(/<span[^>]*>5 000 FCFA<\/span>/, '');
    }
    return h;
  }, [b]);

  return <DesignPage html={html} links={LINKS} />;
}
