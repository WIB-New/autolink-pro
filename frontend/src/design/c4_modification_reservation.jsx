import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full max-w-4xl mx-auto py-8 px-4">
<div class="mb-6">
<h1 class="font-headline-xl text-headline-xl text-on-surface">Modifier la réservation</h1>
<p class="text-body-md text-body-md text-on-surface-variant">Mettez à jour les détails de votre réservation.</p>
</div>

<div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
<div class="mb-6 p-4 bg-surface-container rounded-lg">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-primary text-[24px]">directions_car</span>
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Toyota RAV4 AWD Hybrid 2022</h2>
<p class="text-body-sm text-body-sm text-on-surface-variant">Réf. #ALP-2025-DLA-8924</p>
</div>
</div>
<div class="grid grid-cols-2 gap-4 text-sm text-on-surface-variant">
<div><span class="block">Date actuelle :</span><span class="font-label-md text-label-md text-on-surface">29 Oct 2025 08:30</span></div>
<div><span class="block">Lieu départ :</span><span class="font-label-md text-label-md text-on-surface">Douala - Hub Akwa</span></div>
<div><span class="block">Lieu arrivée :</span><span class="font-label-md text-label-md text-on-surface">Aéroport DLA</span></div>
</div>
</div>

<form class="space-y-6">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Nouvelle date de départ</label>
<input type="datetime-local" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" value="2025-10-29T08:30" />
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Nouvelle date de fin</label>
<input type="datetime-local" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" value="2025-10-30T08:30" />
</div>
</div>

<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Lieu de prise en charge</label>
<input type="text" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Douala - Bonanjo, Rue 123" value="Douala - Hub Akwa" />
</div>

<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Lieu de restitution</label>
<input type="text" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Aéroport International de Douala" value="Aéroport DLA" />
</div>

<div class="p-4 rounded-xl bg-tertiary-fixed/10 text-tertiary text-body-sm text-body-sm">
<div class="flex items-start gap-2">
<span class="material-symbols-outlined text-[20px]">info</span>
<p>Les modifications de date et de lieu sont soumises à validation par le propriétaire. Vous recevrez une notification une fois la modification acceptée.</p>
</div>
</div>

<div class="flex gap-4 pt-4">
<button type="button" class="flex-1 py-3 px-6 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-sm">
Enregistrer les modifications
</button>
<button type="button" class="flex-1 py-3 px-6 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
Annuler
</button>
</div>
</form>
</div>
</div>`;

const LINKS = {
  'Annuler': '/client/bookings',
  'Enregistrer les modifications': '/client/bookings',
};

export default function C4ModificationReservation() {
  return <DesignPage html={HTML} links={LINKS} role="client" />;
}
