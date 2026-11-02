import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full pb-16">
<!-- Page Header -->
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
<div class="space-y-1">
<div class="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
<span class="">Mobilité Cameroun</span>
<span class="">•</span>
<span class="">Douala & Yaoundé</span>
</div>
<h1 class="font-headline-xl text-headline-xl text-on-surface">Mes Réservations</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        Consultez, gérez et suivez l'historique de vos locations de véhicules à Douala et Yaoundé.
      </p>
</div>
<div class="flex items-center gap-3">
<a class="px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95" href="#">
<span class="material-symbols-outlined text-[20px]">add_circle</span>
        Nouvelle réservation
      </a>
</div>
</div>
<!-- KPI Cards : résumé des réservations -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-8">
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[22px]">event_available</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">7</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Réservations totales</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-primary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0"><span class="material-symbols-outlined text-[22px]">event_upcoming</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">1</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">À venir</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-secondary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0"><span class="material-symbols-outlined text-[22px]">timer</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">1</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">En cours</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-blue-800"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0"><span class="material-symbols-outlined text-[22px]">task_alt</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">4</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Terminées</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-green-600"></span>
</div>
</div>
<!-- Barre unique : onglets statut + recherche + filtres -->
<div class="bg-surface-container-lowest rounded-2xl p-4 mb-8 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
<div class="relative bg-surface-container-low rounded-lg px-3 py-1.5 min-w-[140px] shrink-0">
<label class="block font-label-sm text-[10px] text-on-surface-variant">Statut</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
<option selected="">Toutes (7)</option>
<option>À venir (1)</option>
<option>En cours (1)</option>
<option>Terminées (4)</option>
<option>Annulées (1)</option>
</select>
</div>
<div class="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-1">
<div class="relative w-full md:flex-1">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
<input class="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Véhicule, ville, n° de dossier..." type="text">
</div>
<div class="grid grid-cols-3 gap-3 w-full md:w-auto">
<div class="relative bg-surface-container-low rounded-lg px-3 py-1.5 min-w-[110px]">
<label class="block font-label-sm text-[10px] text-on-surface-variant">Période</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
<option>Toutes</option>
<option>30 derniers jours</option>
<option selected="">Année 2025</option>
</select>
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-1.5 min-w-[110px]">
<label class="block font-label-sm text-[10px] text-on-surface-variant">Ville</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
<option selected="">Toutes</option>
<option>Douala</option>
<option>Yaoundé</option>
</select>
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-1.5 min-w-[130px]">
<label class="block font-label-sm text-[10px] text-on-surface-variant">Trier par</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
<option selected="">Date la plus proche</option>
<option>Plus récentes</option>
<option>Montant décroissant</option>
</select>
</div>
</div>
</div>
</div>
<!-- Tableau des réservations -->
<div class="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[960px]">
<thead>
<tr class="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant border-b border-outline-variant/30 bg-surface-container-low/50">
<th class="px-5 py-3.5 font-semibold">Véhicule</th>
<th class="px-4 py-3.5 font-semibold">Référence</th>
<th class="px-4 py-3.5 font-semibold">Période</th>
<th class="px-4 py-3.5 font-semibold">Lieu / Trajet</th>
<th class="px-4 py-3.5 font-semibold">Montant</th>
<th class="px-4 py-3.5 font-semibold">Statut</th>
<th class="px-4 py-3.5 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md">
<!-- Ligne 1 : À venir -->
<tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-center gap-3">
<img class="w-14 h-11 rounded-lg object-cover shrink-0" data-alt="Toyota RAV4 AWD Hybrid 2022" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC64AlM-HYTNrUKSQXBUyK0rlmVm0bMt08X72X1A2J1vkJ90iS9cmbNqrnD7TPaizJ_kogVe4ywgzQWf8k3xOVTzS9rEcWt3_lrnGtxEKWMBhy01bJgl_hAvCVQ6hkk1dplBSNvphnuR0bGq9UaUQSB40nc8mjJfKMFpCPtlSqJPTbERaomo7QC7gCmY9Gx0lVW2ihoCtZq6fIMxR9LbLtJAk9VjFw9iszXva4u4FkN0J5xVto5wFUVoA">
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface truncate">Toyota RAV4 AWD Hybrid 2022</span>
<span class="block font-body-sm text-[12px] text-on-surface-variant">Premium · Chauffeur pro</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">#ALP-2025-DLA-8924</td>
<td class="px-4 py-4 whitespace-nowrap">29 Oct 08:30 → 30 Oct 08:30</td>
<td class="px-4 py-4">Douala • Hub Akwa / Aéroport DLA</td>
<td class="px-4 py-4 whitespace-nowrap font-label-md text-label-md font-bold text-on-surface">73 500 F</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Confirmée</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Voir en détail</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Modifier la réservation" type="button"><span class="material-symbols-outlined text-[18px]">edit_calendar</span><span class="sr-only">Modifier</span></button>
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Contacter le chauffeur" type="button"><span class="material-symbols-outlined text-[18px]">call</span><span class="sr-only">Contacter</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer / Annuler" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 2 : En cours -->
<tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-center gap-3">
<img class="w-14 h-11 rounded-lg object-cover shrink-0" data-alt="Hyundai Tucson 2023" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhIjFqbCArgIk1O-g_dETJhvLPjDeg74-FsKUMvJSmSW5RjLVKE6XI-ExgkZaS2Lb-A8ByzJTcv2tEbNLUo8TNSAprcHP45yQ5mnU4l6fFuKm4gJa6Ur6dskCTgYvuvzhISkD7fbgbatf2-Ik86Tku7QZb7HWAqUgwJuPLE-_xIarYhYTr7ZhwqViRQHO8GSY3Bz5F-HBEWRxVcIsvosFM_n3e-oIGTMGLssGdJoESvskrAgMzeRw7PQ">
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface truncate">Hyundai Tucson 2023</span>
<span class="block font-body-sm text-[12px] text-on-surface-variant">Premium · Km illimité</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">#ALP-2025-DLA-8740</td>
<td class="px-4 py-4 whitespace-nowrap">27 Oct 09:00 → 28 Oct 18:00</td>
<td class="px-4 py-4">Yaoundé • Bastos (Ambassades)</td>
<td class="px-4 py-4 whitespace-nowrap font-label-md text-label-md font-bold text-on-surface">60 000 F</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>En cours</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Voir en détail</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Prolonger la durée" type="button"><span class="material-symbols-outlined text-[18px]">update</span><span class="sr-only">Prolonger</span></button>
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Check-out & État des lieux" type="button"><span class="material-symbols-outlined text-[18px]">fact_check</span><span class="sr-only">Check-out</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer / Annuler" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 3 : Terminée -->
<tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-center gap-3">
<img class="w-14 h-11 rounded-lg object-cover shrink-0" data-alt="Toyota Corolla 2021" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_wrLtGic9aNbisTE2MhZA9QxCGfYHvXuTHcZHRYtykIdB88-EmrfioPw10GIABj9tMcAtkb8HkN8IMMMoPCNDH3BGPjfHFpWMvxTOP-I0UcTud_Yz7UQyaKE7nAD_vaiTrrP-wAxm3PoeyuftlqmbLkB5jBV3kdluUGn02wouhhXXtiwMQDsWOtjU-WhksHuQv2-FYcQLpFDLnCA48wWIztB_uMeT9Jn-NFrJHsZJ05ik4zwlL80GZg">
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface truncate">Toyota Corolla 2021</span>
<span class="block font-body-sm text-[12px] text-on-surface-variant">Standard · 5 portes</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">#ALP-2024-YDE-7201</td>
<td class="px-4 py-4 whitespace-nowrap">12 Oct 10:00 → 15 Oct 10:00</td>
<td class="px-4 py-4">Yaoundé Bastos → Centre-Ville</td>
<td class="px-4 py-4 whitespace-nowrap font-label-md text-label-md font-bold text-on-surface">35 000 F</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold"><span class="material-symbols-outlined text-[14px]">task_alt</span>Terminée</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Voir en détail</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Télécharger la facture" type="button"><span class="material-symbols-outlined text-[18px]">download</span><span class="sr-only">Facture</span></button>
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Réserver à nouveau" type="button"><span class="material-symbols-outlined text-[18px]">replay</span><span class="sr-only">Réserver à nouveau</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 4 : Annulée -->
<tr class="hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-center gap-3">
<img class="w-14 h-11 rounded-lg object-cover shrink-0" data-alt="Kia Picanto 2022" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1_hB9WJpLirmw0vx8c3Z9EdODah5Y9xZAR7qrpewqi8Y40N4swCi7lXiHeTExg-SSUs5pWE-khNoma2JJlqlm_39CezfgwZ7ETwYMY-eLnUhIH1E4tzH1jM5DCEc4huJFQ40Wuf6JoUvMb3PgTIsBllYhx6H3HIjx_1XcFXFVE4I76dGMhv13u3GGMUOBzzpgipfXL-m3qaP37UbauD6US7TYuUdpeCR9U87mTIesI9oNpTMMPX0RCw">
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface truncate">Kia Picanto 2022</span>
<span class="block font-body-sm text-[12px] text-on-surface-variant">Économique · Manuelle</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant">#ALP-2024-DLA-6512</td>
<td class="px-4 py-4 whitespace-nowrap">Annulée le 02 Sept 2024</td>
<td class="px-4 py-4">Douala • Akwa</td>
<td class="px-4 py-4 whitespace-nowrap font-label-md text-label-md font-bold text-on-surface">25 000 F</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold"><span class="material-symbols-outlined text-[14px]">cancel</span>Annulée</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Voir en détail</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Voir motif d'annulation" type="button"><span class="material-symbols-outlined text-[18px]">info</span><span class="sr-only">Motif</span></button>
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Réserver à nouveau" type="button"><span class="material-symbols-outlined text-[18px]">replay</span><span class="sr-only">Réserver à nouveau</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Pagination / Footer Info -->
<div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant">
<p class="font-body-sm text-body-sm">
      Affichage de <span class="font-semibold text-on-surface">4 réservations</span> sur un total de 7 dossiers enregistrés.
    </p>
<div class="flex items-center gap-2">
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant cursor-not-allowed font-label-sm text-label-sm" disabled="" type="button">
        Précédent
      </button>
<button class="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">
        1
      </button>
<button class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
        2
      </button>
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">
        Suivant
      </button>
</div>
</div>
</div>`;
const LINKS = {
  'Nouvelle réservation': '/client/search',
  'Réserver à nouveau': '/client/search',
  'Voir en détail': '/client/bookings/1',
  'Modifier': '/client/bookings/1',
  'Prolonger': '/client/bookings/1',
  'Check-out': '/client/bookings/1',
  'Motif': '/client/bookings/1',
  'Contacter': '/messages',
};

export default function c3mesrservations() {
  return <DesignPage html={HTML} links={LINKS} />;
}
