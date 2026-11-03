import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { vehiclesAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

const HTML = `<div class="flex flex-col w-full pb-16 max-w-[1280px] mx-auto">
<!-- Fil d'ariane -->
<div class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-4">
<a class="hover:text-primary transition-colors" href="/client/search">Catalogue</a>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-on-surface font-label-sm font-bold">Toyota Corolla 2016</span>
</div>
<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
<!-- Colonne principale -->
<div class="xl:col-span-2 flex flex-col gap-8">
<!-- Titre + statut -->
<div class="flex flex-wrap items-center gap-3">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Toyota Corolla 2016</h1>
<span class="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">Berline</span>
<span class="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Disponible</span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">location_on</span>Yaoundé, Nlongkak</span>
<span class="font-body-sm text-body-sm text-primary font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">star</span>4.6 (88 avis)</span>
</div>
<!-- Galerie photos -->
<div class="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[360px]">
<div class="col-span-4 md:col-span-3 row-span-2 rounded-2xl overflow-hidden bg-surface-container relative group">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900&q=80" alt="Toyota Corolla 2016"/>
<span class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-inverse-surface/70 text-inverse-on-surface font-label-sm text-label-sm backdrop-blur-sm flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">photo_library</span>Voir les 6 photos</span>
</div>
<div class="hidden md:block rounded-2xl overflow-hidden bg-surface-container"><img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80" alt="vue 2"/></div>
<div class="hidden md:block rounded-2xl overflow-hidden bg-surface-container"><img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80" alt="intérieur"/></div>
</div>
<!-- Caractéristiques techniques -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-5">Caractéristiques techniques</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">airline_seat_recline_normal</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Places</div><div class="font-label-md text-label-md font-bold text-on-surface">5 passagers</div></div></div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">settings</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Boîte</div><div class="font-label-md text-label-md font-bold text-on-surface">Automatique</div></div></div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">local_gas_station</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Carburant</div><div class="font-label-md text-label-md font-bold text-on-surface">Essence</div></div></div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">calendar_today</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Année</div><div class="font-label-md text-label-md font-bold text-on-surface">2021</div></div></div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">palette</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Couleur</div><div class="font-label-md text-label-md font-bold text-on-surface">Blanc perle</div></div></div>
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">speed</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">Kilométrage</div><div class="font-label-md text-label-md font-bold text-on-surface">22 400 km</div></div></div>
</div>
</div>
<!-- Description -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-3">Description et recommandations</h2>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">Toyota Corolla 2016 entretenu avec soin, inspecté par nos experts terrain et prêt pour vos déplacements urbains ou interurbains. Intérieur impeccable, mécanique vérifiée et documents en règle. Idéal pour les trajets professionnels, les événements ou les longues distances au départ de Yaoundé.</p>
<div class="flex flex-wrap gap-2 mt-4">
<span class="px-3 py-1.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px] text-primary">ac_unit</span>Climatisation automatique</span>
<span class="px-3 py-1.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px] text-primary">bluetooth</span>Bluetooth & Audio</span>
<span class="px-3 py-1.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px] text-primary">speed</span>Régulateur de vitesse</span>
<span class="px-3 py-1.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px] text-primary">lock</span>Verrouillage central</span>
</div>
</div>
<!-- Scores certification -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-5">Fiche de certification véhicule</h2>
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
<div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low text-center"><div class="relative w-14 h-14"><svg class="w-14 h-14 -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-surface-variant" stroke="currentColor"/><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-primary" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset="8" stroke-linecap="round"/></svg><span class="absolute inset-0 flex items-center justify-center font-label-sm font-bold text-on-surface">94%</span></div><span class="font-label-sm text-label-sm font-bold text-on-surface">Contrôle technique</span><span class="font-body-sm text-[11px] text-on-surface-variant">Visite à jour</span></div>
<div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low text-center"><div class="relative w-14 h-14"><svg class="w-14 h-14 -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-surface-variant" stroke="currentColor"/><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-primary" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset="10" stroke-linecap="round"/></svg><span class="absolute inset-0 flex items-center justify-center font-label-sm font-bold text-on-surface">92%</span></div><span class="font-label-sm text-label-sm font-bold text-on-surface">Assurance & documents</span><span class="font-body-sm text-[11px] text-on-surface-variant">Carte grise vérifiée</span></div>
<div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low text-center"><div class="relative w-14 h-14"><svg class="w-14 h-14 -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-surface-variant" stroke="currentColor"/><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-blue-800" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset="5" stroke-linecap="round"/></svg><span class="absolute inset-0 flex items-center justify-center font-label-sm font-bold text-on-surface">96%</span></div><span class="font-label-sm text-label-sm font-bold text-on-surface">Entretien & historique</span><span class="font-body-sm text-[11px] text-on-surface-variant">Carnet complet</span></div>
<div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low text-center"><div class="relative w-14 h-14"><svg class="w-14 h-14 -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-surface-variant" stroke="currentColor"/><circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="text-green-600" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset="23" stroke-linecap="round"/></svg><span class="absolute inset-0 flex items-center justify-center font-label-sm font-bold text-on-surface">82%</span></div><span class="font-label-sm text-label-sm font-bold text-on-surface">Propriétaire</span><span class="font-body-sm text-[11px] text-on-surface-variant">Identité contrôlée</span></div>
</div>
<div class="flex items-center gap-2 mt-4 text-body-sm text-on-surface-variant"><span class="material-symbols-outlined text-[16px] text-primary">verified</span>Certifiée par nos experts de terrain le 03/10/2025 à Nlongkak</div>
</div>
<!-- Conditions -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm"><div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-primary">event_repeat</span><span class="font-label-md text-label-md font-bold text-on-surface">Annulation gratuite</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">Jusqu'à 24h avant le départ. Modification gratuite jusqu'à 15 min avant la prise en charge.</p></div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm"><div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-primary">schedule</span><span class="font-label-md text-label-md font-bold text-on-surface">Politique de retard</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">30 minutes d'attente offertes. Au-delà, facturation horaire ou réattribution possible.</p></div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm"><div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-primary">speed</span><span class="font-label-md text-label-md font-bold text-on-surface">300 km inclus / jour</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">Au-delà : 100 FCFA / km supplémentaire, décompté au retour du véhicule.</p></div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm"><div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-primary">local_gas_station</span><span class="font-label-md text-label-md font-bold text-on-surface">Carburant à niveau identique</span></div><p class="font-body-sm text-body-sm text-on-surface-variant">Le véhicule est remis avec le plein — il doit être restitué au même niveau.</p></div>
</div>
<!-- Avis -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<div class="flex items-center justify-between mb-5">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Avis certifiés de voyageurs</h2>
<div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[22px]">star</span><span class="font-headline-md font-bold text-on-surface">4.6</span><span class="font-body-sm text-body-sm text-on-surface-variant">88 avis vérifiés</span></div>
</div>
<div class="flex flex-col gap-4">
<div class="flex gap-3 p-4 rounded-xl bg-surface-container-low"><div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-label-md shrink-0">PN</div><div class="flex flex-col gap-1"><div class="flex items-center gap-2"><span class="font-label-md font-bold text-on-surface">Patrick N.</span><span class="font-body-sm text-[11px] text-primary flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">verified</span>Location vérifiée</span></div><span class="font-body-sm text-[11px] text-on-surface-variant">Douala · 15/10/2025</span><p class="font-body-sm text-body-sm text-on-surface-variant">Utilisé pour un trajet Douala–Yaoundé : confortable et sécurisé. Le suivi par SMS est rassurant.</p></div></div>
<div class="flex gap-3 p-4 rounded-xl bg-surface-container-low"><div class="w-10 h-10 rounded-full bg-secondary-fixed text-blue-800 flex items-center justify-center font-bold font-label-md shrink-0">VM</div><div class="flex flex-col gap-1"><div class="flex items-center gap-2"><span class="font-label-md font-bold text-on-surface">Vanessa M.</span><span class="font-body-sm text-[11px] text-primary flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">verified</span>Location vérifiée</span></div><span class="font-body-sm text-[11px] text-on-surface-variant">Yaoundé · 24/10/2025</span><p class="font-body-sm text-body-sm text-on-surface-variant">Très bonne expérience pour un mariage. Voiture propre, chauffeur discret et ponctuel.</p></div></div>
<div class="flex gap-3 p-4 rounded-xl bg-surface-container-low"><div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold font-label-md shrink-0">JF</div><div class="flex flex-col gap-1"><div class="flex items-center gap-2"><span class="font-label-md font-bold text-on-surface">Jean-Marie F.</span><span class="font-body-sm text-[11px] text-primary flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">verified</span>Location vérifiée</span></div><span class="font-body-sm text-[11px] text-on-surface-variant">Douala · 05/10/2025</span><p class="font-body-sm text-body-sm text-on-surface-variant">Véhicule impeccable, climatisation au top et chauffeur très professionnel. Prise en charge à l'heure à Bonanjo.</p></div></div>
</div>
</div>
<!-- Véhicules similaires -->
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between"><h2 class="font-headline-sm text-headline-sm text-on-surface">Véhicules similaires recommandés</h2><a class="font-label-sm text-label-sm text-primary font-bold" href="/client/search">Voir tout le catalogue</a></div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
<a class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" href="/client/vehicule/3"><div class="h-36 bg-surface-container"><img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80" alt="Toyota Avensis"/></div><div class="p-4"><div class="font-label-md font-bold text-on-surface">Toyota Avensis 2014</div><div class="flex items-center justify-between mt-1"><span class="font-body-sm text-body-sm text-on-surface-variant">Yaoundé, Essos · ★4.3</span><span class="font-label-md font-bold text-primary">20 000 F/j</span></div></div></a>
<a class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" href="/client/vehicule/4"><div class="h-36 bg-surface-container"><img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80" alt="Hyundai Elantra"/></div><div class="p-4"><div class="font-label-md font-bold text-on-surface">Hyundai Elantra 2018</div><div class="flex items-center justify-between mt-1"><span class="font-body-sm text-body-sm text-on-surface-variant">Douala, Bali · ★4.5</span><span class="font-label-md font-bold text-primary">20 000 F/j</span></div></div></a>
<a class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" href="/client/vehicule/5"><div class="h-36 bg-surface-container"><img class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&q=80" alt="Peugeot 208"/></div><div class="p-4"><div class="font-label-md font-bold text-on-surface">Peugeot 208 2020</div><div class="flex items-center justify-between mt-1"><span class="font-body-sm text-body-sm text-on-surface-variant">Douala, Deïdo · ★4.5</span><span class="font-label-md font-bold text-primary">20 000 F/j</span></div></div></a>
</div>
</div>
</div>
<!-- Colonne réservation -->
<aside class="xl:col-span-1">
<div class="sticky top-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-5">
<div class="flex items-center justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant">LT-1002-A · Yaoundé</span>
<div class="text-right"><span class="font-headline-lg font-extrabold text-on-surface">20 000</span><span class="font-label-sm text-label-sm text-on-surface-variant"> FCFA / jour</span></div>
</div>
<div class="flex flex-col gap-3">
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Début</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Fin</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Conduite</span><select class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none cursor-pointer"><option>Avec chauffeur</option><option>Sans chauffeur</option></select></label>
</div>
<div class="flex flex-col gap-2 py-3 border-y border-outline-variant/30 font-body-sm text-body-sm">
<div class="flex justify-between"><span class="text-on-surface-variant">24 heures — 20 000 F × 1 j</span><span class="text-on-surface">25 000 F</span></div>
<div class="flex justify-between"><span class="text-on-surface-variant">Chauffeur AutoLink</span><span class="text-on-surface">+5 000 F</span></div>
<div class="flex justify-between"><span class="text-on-surface-variant">Assurance & assistance 24/7</span><span class="text-primary font-bold">Inclus</span></div>
</div>
<div class="flex items-center justify-between"><span class="font-label-md text-label-md font-bold text-on-surface">Total TTC</span><span class="font-headline-md font-extrabold text-on-surface">30 000 FCFA</span></div>
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low"><span class="font-body-sm text-body-sm text-on-surface-variant">Caution (pré-autorisation)</span><span class="font-label-md font-bold text-blue-800">40 000 F</span></div>
<button class="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all" type="button">Réserver maintenant</button>
<button class="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-2" type="button"><span class="material-symbols-outlined text-[18px] text-primary">favorite</span>Ajouter aux favoris</button>
<div class="flex items-center justify-center gap-3 pt-1">
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-primary">call</span>Appeler</button>
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-green-600">chat</span>WhatsApp</button>
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-secondary">share</span>Partager</button>
</div>
</div>
</aside>
</div>
</div>`;
const LINKS = {
  'Réserver maintenant': '/client/booking/recap?vehicle=2',
  'Voir les 6 photos': '#',
  'Voir tout le catalogue': '/client/search',
  'Ajouter aux favoris': '/client/favorites',
  'Appeler': '/client/help',
  'WhatsApp': '/messages',
};

export default function C11VehiculeDetail() {
  const { id } = useParams();
  const { data: v } = useApiData(() => vehiclesAPI.detail(id), [id]);
  const { data: rev } = useApiData(() => vehiclesAPI.reviews(id), [id]);
  const { data: sim } = useApiData(() => vehiclesAPI.similar(id), [id]);
  const links = { ...LINKS, 'Réserver maintenant': `/client/booking/recap?vehicle=${id}` };
  const html = useMemo(() => {
    if (!v) return HTML;
    const name = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
    const img = v.photos?.[0]?.image || v.image;
    let h = HTML
      .replace(/Toyota Corolla 2016/g, esc(name))
      .replace(/Yaoundé, Nlongkak/g, esc(v.city || ''))
      .replace('>4.6 (88 avis)<', `>${v.rating || '—'} (${v.rating_count || 0} avis)<`)
      .replace(/20 000 FCFA\/jour/g, `${fmt(v.daily_rate)} FCFA/jour`)
      .replace('LT-1002-A · Yaoundé', `${esc(v.plate || '')} · ${esc(v.city || '')}`)
      .replace('>20 000\n    FCFA / jour<', `>${fmt(v.daily_rate)}\n    FCFA / jour<`);
    if (img) {
      h = h.replace(/src="https:\/\/lh3\.googleusercontent\.com\/[^"]+"/, `src="${esc(img)}"`);
    }
    if (v.caution || v.deposit_amount) {
      h = h.replace('40 000 F', `${fmt(v.caution || v.deposit_amount)} F`);
    }
    return h;
  }, [v]);
  return <DesignPage html={html} links={links} />;
}
