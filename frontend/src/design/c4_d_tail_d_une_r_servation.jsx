import React, { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { bookingsAPI, vehiclesAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dmy = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '');
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
<button class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm font-label-lg text-label-lg" type="button" title="Imprimer la réservation">
<span class="material-symbols-outlined text-[18px] text-secondary">print</span>
        </button>
<button class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors shadow-sm font-label-lg text-label-lg" type="button" title="Télécharger le reçu PDF">
<span class="material-symbols-outlined text-[18px] text-secondary">download</span>
        </button>
<a class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md font-label-lg text-label-lg" href="https://wa.me/237670421890" rel="noopener noreferrer" target="_blank" title="Discuter sur WhatsApp">
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
<section id="avis" class="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-3">
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
  'Assistance WhatsApp': '/messages',
};

export default function C4DetailReservation() {
  const { id } = useParams();
  const { data: b } = useApiData(() => bookingsAPI.detail(id), [id]);
  const { data: veh } = useApiData(() => (b?.vehicle ? vehiclesAPI.detail(b.vehicle) : Promise.resolve({ data: null })), [b?.vehicle]);

  useEffect(() => {
    const click = (e) => {
      // Etoiles : clic direct sur un <span> (avant le filtre button,a)
      const star = e.target.closest('.rate-star');
      if (star) {
        e.preventDefault();
        window._rating = Number(star.dataset.r);
        document.querySelectorAll('.rate-star').forEach((s) => {
          const on = Number(s.dataset.r) <= window._rating;
          s.classList.toggle('text-yellow-500', on);
          s.classList.toggle('text-surface-dim', !on);
        });
        const form = document.getElementById('review-form');
        if (form) form.style.display = '';
        return;
      }
      const el = e.target.closest('button, a');
      if (!el) return;
      const t = el.textContent || '';
      if (t.trim() === 'print') {
        e.preventDefault();
        window.print();
        return;
      }
      if (t.trim() === 'download') {
        e.preventDefault();
        bookingsAPI.receipt(id).then((r) => {
          const url = URL.createObjectURL(r.data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recu-BK-${String(id).padStart(4, '0')}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }).catch(() => alert('Reçu indisponible pour cette réservation.'));
        return;
      }
      if (t.includes("Demander l'annulation")) {
        e.preventDefault();
        if (window.confirm('Annuler cette réservation ?')) {
          bookingsAPI.updateStatus(id, 'cancelled').then(() => window.location.reload()).catch(() => {});
        }
      } else if (t.includes('médiation') || t.includes('Signaler un litige')) {
        e.preventDefault();
        import('../services/api').then(({ messagingAPI }) => {
          // Litige enregistre cote reservation + conversation client <-> admins
          bookingsAPI.dispute(id, 'Litige ouvert via la page de réservation').catch(() => {});
          messagingAPI.open({ support: true, subject: `Litige BK-${String(id).padStart(4, '0')} — ${b?.vehicle_name || ''}` })
            .then(({ data: conv }) => {
              const info = `Litige ouvert sur la réservation BK-${String(id).padStart(4, '0')}\nVéhicule : ${b?.vehicle_name || ''} (${b?.vehicle_plate || ''})\nStatut : ${b?.status || ''}\nPériode : ${b?.start_date || ''} → ${b?.end_date || ''}\nMontant : ${b?.subtotal || 0} FCFA\nCaution : ${b?.deposit_amount || 0} FCFA`;
              messagingAPI.send(conv.id, { content: info }).finally(() => { window.location.href = `/messages?conv=${conv.id}`; });
            }).catch(() => { window.location.href = '/messages'; });
        });
        return;
      }
      if (el.closest('#review-submit')) {
        e.preventDefault();
        if (!window._rating) { alert('Choisissez d\'abord une note en cliquant sur une étoile.'); return; }
        const review = document.getElementById('review-text')?.value || '';
        bookingsAPI.rate(id, window._rating, review)
          .then(() => window.location.reload())
          .catch((err) => alert(err?.response?.data?.detail || 'Impossible d\'enregistrer l\'avis.'));
      }
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [id, b]);

  // Ancre #avis : scroll vers la section Avis & Évaluation (depuis "Laisser un avis")
  useEffect(() => {
    if (b && window.location.hash === '#avis') {
      const t = setTimeout(() => document.getElementById('avis')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [b]);

  const html = useMemo(() => {
    if (!b) return HTML;
    const name = b.vehicle_name || 'Véhicule';
    const days = b.days || Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 864e5));
    const sTime = (b.start_time || '08:30').slice(0, 5);
    const eTime = (b.end_time || '08:30').slice(0, 5);
    const created = b.created_at ? new Date(b.created_at) : null;
    const createdTxt = created ? `${created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${created.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : '';
    const createdShort = created ? created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
    const STEP = { pending: 1, confirmed: 2, active: 4, completed: 5, cancelled: 0, disputed: 3 };
    const stepIdx = STEP[b.status] ?? 2;
    const stepTxt = b.status === 'cancelled' ? 'Réservation annulée' : `Étape ${stepIdx} sur 5 complétée avec succès`;
    const hoursLeft = Math.max(0, Math.round((new Date(`${b.start_date}T${sTime}`) - Date.now()) / 36e5));
    // Cycle de vie dynamique : chaque etape passe au vert selon dates/statut reel
    const nowTs = Date.now();
    const startTs = new Date(`${b.start_date}T${sTime}`).getTime();
    const endTs = new Date(`${b.end_date}T${eTime}`).getTime();
    const cancelled = b.status === 'cancelled';
    const depDone = cancelled || b.status === 'completed' || b.deposit_status === 'released';
    const step3Done = cancelled || ['active', 'completed'].includes(b.status) || nowTs >= startTs;
    const step4Done = cancelled || b.status === 'completed' || nowTs >= endTs;
    const step5Done = depDone;
    const stepsDone = 2 + (step3Done ? 1 : 0) + (step4Done ? 1 : 0) + (step5Done ? 1 : 0);
    const markStep = (html, from, to, doneLabel) => {
      const i = html.indexOf(from); const j = html.indexOf(to, i);
      if (i < 0 || j < 0) return html;
      const seg = html.slice(i, j)
        .replace('opacity-60', '')
        .replace('bg-secondary-container text-on-secondary-container', 'bg-primary text-on-primary')
        .replace('bg-surface-container text-on-surface-variant', 'bg-primary text-on-primary')
        .replace('ring-primary/20 animate-pulse', 'ring-surface-container-lowest')
        .replace('text-secondary font-semibold uppercase', 'text-primary font-semibold uppercase')
        .replace(/Étape \d+ • [^<]*/, doneLabel);
      return html.slice(0, i) + seg + html.slice(j);
    };
    // Politique d'annulation reelle (identique a _refund_if_paid cote serveur)
    const beforeStart = nowTs < startTs;
    const depPct = Math.round(Number(b.deposit_refund_percent ?? 90));
    const remainingDays = Math.max(0, Math.round((endTs - nowTs) / 864e5));
    const dailyPart = (Number(b.subtotal || 0) - Number(b.delivery_fee || 0)) / days;
    const refundRes = beforeStart ? Number(b.subtotal || 0) : dailyPart * remainingDays;
    const refundDep = beforeStart ? Number(b.deposit_amount || 0) * depPct / 100 : Number(b.deposit_amount || 0);
    const resPct = beforeStart ? 100 : Math.round(100 * remainingDays / days);
    const pickup = b.pickup_address || (b.vehicle_city ? `${b.vehicle_city} - Prise en charge à convenir` : '');
    const drvName = b.driver_name || null;
    const drvPhone = b.driver_phone || '';
    const phoneDigits = (drvPhone || b.owner_phone || '').replace(/\D/g, '') || '237670421890';
    const DRESP = { offered: 'assigné — en attente de sa confirmation', accepted: 'confirmé', refused: 'remplacement en cours' };
    let h = HTML
      .replace(/Toyota RAV4 AWD Hybrid 2022/g, esc(name))
      .replace(/Toyota RAV4 AWD Hybrid/g, esc(name))
      .replace('#ALP-2025-DLA-8924', `BK-${String(b.id).padStart(4, '0')}`)
      .replace('Confirmée • Clés prêtes pour demain', ST[b.status] || b.status)
      .replace('Créée le 27 Octobre 2025 à 14:12', `Créée le ${esc(createdTxt)}`)
      .replace('Étape 2 sur 5 complétée avec succès', esc(stepTxt))
      .replace('27 Oct à 14:15 via Portefeuille', `${esc(createdShort)} via ${esc(b.payment_method === 'wallet' ? 'Portefeuille' : b.payment_method || 'Portefeuille')}`)
      .replace('29 Oct • 08:30 (Hub Akwa)', `${dmy(b.start_date)} • ${sTime}`)
      .replace('30 Oct • 08:30', `${dmy(b.end_date)} • ${eTime}`)
      .replace('Gamme Premium', `Gamme ${esc(b.vehicle_tier || 'Standard')}`)
      .replace('Inspection certifiée 9.8 / 10', `Inspection certifiée ${esc(veh?.last_inspection_score ?? veh?.condition_score ?? '—')} / 10`)
      .replace(/data-alt="[^"]*" src="[^"]+">/, b.vehicle_image ? `src="${esc(b.vehicle_image)}">` : (m) => m)
      .replace('MAT-LT-4921-CM • Châssis vérifié CEMAC', `${esc(b.vehicle_plate || '')} • ${esc(b.vehicle_city || '')}`)
      .replace('55 000 FCFA<span', `${fmt(b.daily_rate)} FCFA<span`)
      .replace(/55 000 FCFA/g, `${fmt(Number(b.subtotal || 0) - Number(b.driver_fee || 0) - Number(b.delivery_fee || 0))} FCFA`)
      .replace('73 500 FCFA (100%)', `${fmt(refundRes)} FCFA (${resPct}%)`)
      .replace(/73 500 FCFA/g, `${fmt(b.subtotal)} FCFA`)
      .replace(/150 000 FCFA/g, `${fmt(b.deposit_amount)} FCFA`)
      .replace('Déblocage caution :</span>\n</div>', `Déblocage caution :</span>\n<span class="font-bold text-primary">${fmt(refundDep)} FCFA (${beforeStart ? depPct : 100}%)</span>\n</div>`)
      .replace('Mercredi 29 Octobre 2025 • 08:30', `${dmy(b.start_date)} • ${sTime}`)
      .replace('Jeudi 30 Octobre 2025 • 08:30', `${dmy(b.end_date)} • ${eTime}`)
      .replace('Hub Central Akwa, Douala (Face Direction MTN)', esc(pickup))
      .replace('Hub Akwa ou Dépose Aéroport International DLA', esc(b.dropoff_address || pickup))
      .replace('Location véhicule (24 heures)', `Location véhicule (${days} jour${days > 1 ? 's' : ''} / ${days * 24}h)`)
      .replace('Chauffeur privé certifié (24h)', `Chauffeur AutoLink (${days} jour${days > 1 ? 's' : ''})`)
      .replace('Livraison personnalisée (Hub / Aéroport DLA)', 'Livraison du véhicule')
      .replace('3 500 FCFA', 'Inclus')
      .replace('Portefeuille AutoLink • 27 Octobre', `${esc(b.payment_method === 'wallet' ? 'Portefeuille AutoLink' : b.payment_method || 'Portefeuille')} • ${esc(createdShort)}`)
      .replace('Jean-Pierre Mbida', esc(drvName || 'Sans chauffeur attitré'))
      .replace('Chauffeur professionnel bilingue (FR/EN) • 4.98 ★ (184 courses)',
        esc(drvName ? `Chauffeur AutoLink — ${DRESP[b.driver_response] || 'assigné'}` : 'Aucun chauffeur attitré à cette location'))
      .replace(/\+237 670 42 18 90|\+237 699 12 34 56/g, esc(drvPhone || b.owner_phone || ''))
      .replace(/tel:\+237670421890/g, `tel:+${phoneDigits}`)
      .replace(/wa\.me\/237670421890/g, `wa.me/${phoneDigits}`)
      .replace('Annulation 100% gratuite', beforeStart ? 'Annulation avant le départ' : 'Annulation en cours de location')
      .replace('18h restantes', beforeStart ? `${hoursLeft}h restantes` : 'En cours')
      .replace('Jusqu\'au 28 Oct à 08:30', beforeStart ? `Jusqu'au ${dmy(b.start_date)} à ${sTime}` : `${remainingDays} jour(s) restants remboursés`)
      .replace('<p class="font-body-sm text-body-sm text-on-surface-variant leading-snug">\n          </p>',
        `<p class="font-body-sm text-body-sm text-on-surface-variant leading-snug">${beforeStart
          ? `Annulation avant le départ : location remboursée à 100 %, caution remboursée à ${depPct} % (AutoLink conserve ${100 - depPct} %).`
          : 'Annulation pendant la location : caution remboursée à 100 %, seuls les jours restants sont remboursés (le jour d\u2019annulation est dû).'}</p>`)
      .replace('width: 32%;', `width: ${Math.min(100, stepsDone * 20)}%;`)
      .replace(/<div class="p-4 rounded-xl bg-surface-container-low flex items-center gap-3 text-on-surface-variant">[\s\S]*?verified_user[\s\S]*?<\/div>\n<\/div>/, '');
    // Avis : etoiles cliquables a tout statut, ou avis deja donne
    const stars = [1, 2, 3, 4, 5].map((n) => {
      const filled = Number(b.client_rating || 0) >= n;
      return `<span class="material-symbols-outlined text-[22px] ${filled ? 'text-yellow-500' : 'text-surface-dim'} rate-star cursor-pointer hover:text-yellow-500 transition-colors" data-r="${n}">${filled ? 'star' : 'star'}</span>`;
    }).join('');
    h = h.replace(/<div class="flex items-center gap-2 text-on-surface-variant">(\s*<span class="material-symbols-outlined text-\[22px\] text-surface-dim">star<\/span>)+\s*<\/div>/,
      `<div class="flex items-center gap-2 text-on-surface-variant">${stars}</div>
<div id="review-form" class="flex flex-col gap-2" style="display:none">
  <textarea id="review-text" rows="3" placeholder="Votre commentaire sur la location (optionnel)…" class="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 font-body-sm"></textarea>
  <button id="review-submit" type="button" class="self-start px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold">Publier mon avis</button>
</div>`)
      .replace('Verrouillé', b.client_rating ? 'Votre avis' : 'Disponible')
      .replace(/L'évaluation du véhicule et du chauffeur [^<]* sera déverrouillée[^<]*\./,
        b.client_rating ? `Votre évaluation : ${b.client_rating}/5${b.client_review ? ` — ${esc(b.client_review)}` : ''}`
          : `Cliquez sur une étoile pour évaluer ${drvName ? `le véhicule et ${esc(drvName)}` : 'ce véhicule'}.`);
    if (veh) {
      h = h
        .replace('250 km inclus', `${fmt(veh.km_included_per_day)} km inclus`)
        .replace('150 FCFA/km sup.', `${fmt(veh.extra_km_rate)} FCFA/km sup.`)
        .replace('Automatique AWD', esc(veh.transmission || 'Automatique'))
        .replace('4x4 Intelligent', esc(veh.category || ''))
        .replace('Essence Hybride', esc(veh.fuel_display || veh.fuel || ''))
        .replace('Plein au départ (100%)', veh.fuel_level != null ? `Plein (${veh.fuel_level}%)` : 'Niveau à vérifier')
        .replace('Climatisation Pro', 'Climatisation')
        .replace('Filtre anti-poussière', `${fmt(veh.mileage)} km`);
    }
    // Lignes financières : montants réels ou masquage
    const drvFee = Number(b.driver_fee || 0);
    const delFee = Number(b.delivery_fee || 0);
    if (drvFee > 0) h = h.replace('10 000 FCFA', `${fmt(drvFee)} FCFA`);
    else h = h.replace(/<div class="flex items-center justify-between text-on-surface-variant">\s*<span class="flex items-center gap-1\.5">\s*<span class="">Chauffeur AutoLink[\s\S]*?<\/div>\n/, '');
    if (delFee > 0) h = h.replace('5 000 FCFA', `${fmt(delFee)} FCFA`);
    else h = h.replace(/<div class="flex items-center justify-between text-on-surface-variant">\s*<span class="">Livraison du véhicule<\/span>[\s\S]*?<\/div>\n/, '');
    // Chauffeur : masquer les boutons d'appel si aucun chauffeur
    if (!drvName) {
      h = h.replace(/<a aria-label="Appeler le chauffeur"[\s\S]*?<\/a>/, '')
           .replace(/<a aria-label="Contacter via WhatsApp"[\s\S]*?<\/a>/, '');
    }
    // Annulation : uniquement si le statut le permet
    if (!['pending', 'confirmed'].includes(b.status)) {
      h = h.replace(/<button[^>]*>\s*<span class="material-symbols-outlined text-\[18px\]">cancel<\/span>\s*Demander l'annulation[\s\S]*?<\/button>/, '');
    }
    // Bandeau modification en attente de validation proprietaire
    if (b.modification) {
      const md = Number(b.modification.delta || 0);
      h = h.replace('<!-- Parcours & Cycle de Vie du Contrat -->',
        `<div class="mb-4 p-4 rounded-xl bg-yellow-100/60 border border-yellow-300 flex items-center gap-3"><span class="material-symbols-outlined text-yellow-700">pending_actions</span><div class="font-body-sm text-body-sm text-on-surface"><strong>Modification en attente de validation par le propriétaire</strong> — ${md > 0 ? '+' : ''}${fmt(md)} FCFA. Les détails affichés ci-dessous restent ceux de la réservation actuelle.</div></div><!-- Parcours & Cycle de Vie du Contrat -->`);
    }
    // Etapes qui passent au vert selon la progression reelle
    if (step3Done) h = markStep(h, '<!-- Step 3', '<!-- Step 4 -->', 'Étape 3 • Réglée');
    if (step4Done) h = markStep(h, '<!-- Step 4 -->', '<!-- Step 5 -->', 'Étape 4 • Réglée');
    if (step5Done) h = markStep(h, '<!-- Step 5 -->', '</section>', 'Étape 5 • Réglée')
        .replace('Sous 15 min après retour', 'Caution débloquée sur le portefeuille');
    return h;
  }, [b, veh]);

  return <DesignPage html={html} links={LINKS} />;
}
