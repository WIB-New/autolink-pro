import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full pb-16">
<!-- Page Header -->
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
<div class="space-y-1">
<h1 class="font-headline-xl text-headline-xl text-on-surface">Notifications</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        Suivez en temps réel vos réservations, cautions et échanges AutoLink.
      </p>
</div>
<button class="px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2 shadow-sm shrink-0" type="button">
<span class="material-symbols-outlined text-[18px]">done_all</span>
    Tout marquer comme lu
  </button>
</div>
<!-- Barre : recherche + filtre catégorie -->
<div class="bg-surface-container-lowest rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-3">
<div class="relative w-full md:flex-1">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
<input class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Rechercher une notification (caution, réservation, message…)" type="text">
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-2 min-w-[200px] shrink-0">
<label class="block font-label-sm text-[10px] text-on-surface-variant">Catégorie</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
<option selected="">Toutes (14)</option>
<option>Non lues (4)</option>
<option>Réservations</option>
<option>Paiements & Caution</option>
<option>Sécurité</option>
</select>
</div>
</div>
<!-- Tableau des notifications -->
<div class="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[860px]">
<thead>
<tr class="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant border-b border-outline-variant/30 bg-surface-container-low/50">
<th class="px-5 py-3.5 font-semibold">Notification</th>
<th class="px-4 py-3.5 font-semibold">Catégorie</th>
<th class="px-4 py-3.5 font-semibold">Reçue</th>
<th class="px-4 py-3.5 font-semibold">Statut</th>
<th class="px-4 py-3.5 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md">
<!-- Ligne 1 : Caution débloquée (non lue) -->
<tr class="border-b border-outline-variant/20 bg-primary-fixed/10 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[20px]">lock_open</span></div>
<div class="min-w-0">
<span class="block font-label-md text-label-md font-bold text-on-surface">Caution débloquée #ALP-8812 — 150 000 FCFA libérés</span>
<span class="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">État des lieux validé sans dommage. Votre plafond a été restauré.</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="font-label-sm text-label-sm text-on-surface-variant">Paiements & Caution</span></td>
<td class="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">Il y a 25 min</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Non lue</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Voir le reçu</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span><span class="sr-only">Marquer lu</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 2 : Réservation confirmée (non lue) -->
<tr class="border-b border-outline-variant/20 bg-primary-fixed/10 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0"><span class="material-symbols-outlined text-[20px]">key</span></div>
<div class="min-w-0">
<span class="block font-label-md text-label-md font-bold text-on-surface">Réservation confirmée #ALP-8924</span>
<span class="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">Départ demain 08h30 au Hub AutoLink d'Akwa (Douala). Contrat prêt pour émargement.</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="font-label-sm text-label-sm text-on-surface-variant">Réservations</span></td>
<td class="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">Il y a 2 heures</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Non lue</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span><span class="sr-only">Détail de la réservation</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span><span class="sr-only">Marquer lu</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 3 : Message Samuel Transport -->
<tr class="border-b border-outline-variant/20 hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0"><span class="material-symbols-outlined text-[20px]">chat_bubble</span></div>
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface">Nouveau message de Samuel Transport</span>
<span class="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">« Le véhicule a été nettoyé et le plein fait. Je vous attends demain. »</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="font-label-sm text-label-sm text-on-surface-variant">Messagerie</span></td>
<td class="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">Hier à 18:30</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Lue</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Répondre" type="button"><span class="material-symbols-outlined text-[18px]">reply</span><span class="sr-only">Répondre via la messagerie</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span><span class="sr-only">Marquer lu</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
<!-- Ligne 4 : Inspection programmée -->
<tr class="hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4">
<div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0"><span class="material-symbols-outlined text-[20px]">event_available</span></div>
<div class="min-w-0">
<span class="block font-label-md text-label-md font-semibold text-on-surface">Inspection de départ programmée</span>
<span class="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">Rendez-vous demain 08h00 au Hub Akwa pour signature et remise des clés.</span>
</div>
</div>
</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="font-label-sm text-label-sm text-on-surface-variant">Réservations</span></td>
<td class="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">Hier à 14:10</td>
<td class="px-4 py-4 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Lue</span></td>
<td class="px-4 py-4">
<div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors" title="Consulter" type="button"><span class="material-symbols-outlined text-[18px]">fact_check</span><span class="sr-only">Consulter le guide</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span><span class="sr-only">Marquer lu</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span><span class="sr-only">Supprimer</span></button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Pagination -->
<div class="mt-6 flex items-center justify-between text-on-surface-variant">
<p class="font-body-sm text-body-sm">Affichage de <span class="font-semibold text-on-surface">4 notifications</span> sur un total de 14.</p>
<div class="flex items-center gap-2">
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant cursor-not-allowed font-label-sm text-label-sm" disabled="" type="button">Précédent</button>
<button class="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">1</button>
<button class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">2</button>
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">Suivant</button>
</div>
</div>
</div>`;
const LINKS = {
  'Voir le reçu': '/client/wallet',
  'Détail de la réservation': '/client/bookings/1',
  'Répondre via la messagerie': '/messages',
  'Consulter le guide': '/client/bookings/1',
};

export default function c8notifications({ role = 'client' }) {
  return <DesignPage html={HTML} links={LINKS} role={role} />;
}
