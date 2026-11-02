import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full pb-16 max-w-[1100px] mx-auto">
<!-- Header -->
<div class="flex flex-col gap-2 mb-6">
<h1 class="font-headline-xl text-headline-xl text-on-surface">Comment pouvons-nous vous aider ?</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Trouvez une réponse immédiate : réservations, caution, Mobile Money, documents — ou contactez notre équipe à Douala & Yaoundé.</p>
</div>
<!-- Recherche FAQ -->
<div class="relative mb-6">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input class="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="Rechercher une question (caution, réservation, chauffeur…)" type="text"/>
</div>
<!-- Catégories -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
<button class="px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm">Toutes les catégories</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Réservation & Véhicules</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Paiement & Caution</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Assistance & Sécurité</button>
</div>
<!-- FAQ accordéons -->
<div class="bg-surface-container-lowest rounded-2xl shadow-sm divide-y divide-outline-variant/30 mb-8">
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quel est le délai minimum pour réserver un véhicule ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Est-ce que le prix affiché varie entre Douala et Yaoundé ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Comment fonctionne l'option avec chauffeur certifié ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Comment recharger mon portefeuille avec MTN/Orange Money ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quand ma caution est-elle débloquée après la location ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quels documents dois-je fournir pour débloquer mon compte ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Que faire si mon véhicule tombe en panne pendant la location ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Puis-je modifier ou annuler ma réservation gratuitement ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
<div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Les véhicules sont-ils équipés pour les trajets interurbains ?</span><span class="material-symbols-outlined text-outline">expand_more</span></div>
</div>
<!-- Canaux d'assistance -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[22px]">call</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Appeler le standard — 24h/24</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Urgences route, pannes et retards.</span>
<span class="font-label-md text-label-md text-primary font-bold">+237 699 456 123</span>
<span class="font-label-md text-label-md text-primary font-bold">+237 656 789 000</span>
</div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><span class="material-symbols-outlined text-[22px]">chat</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">WhatsApp Business</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Réponse moyenne en moins de 10 min, 7j/7 de 7h à 22h.</span>
<span class="font-label-md text-label-md text-green-600 font-bold">Démarrer sur WhatsApp</span>
</div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800"><span class="material-symbols-outlined text-[22px]">location_on</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Nos agences</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Douala — Bonanjo, Av. de Gaulle<br>Yaoundé — Bastos, Rue 1.739<br>Lun–Sam : 8h–18h</span>
</div>
</div>
<!-- Formulaire de contact -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-1">Envoyez-nous un message</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-5">Réponse sous 24 h ouvrées · support@autolinkpro.cm · +237 656 789 000</p>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Nom complet *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" value="Emmanuel Ndedi" type="text"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Numéro de téléphone *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="+237 6XX XX XX XX" type="tel"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Adresse e-mail *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="votre@email.com" type="email"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Sujet de la demande *</span><select class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none cursor-pointer"><option>Réservation</option><option>Paiement & Caution</option><option>Documents & Profil</option><option>Litige / Réclamation</option><option>Autre</option></select></label>
</div>
<label class="flex flex-col gap-1 mb-5"><span class="font-label-sm text-label-sm text-on-surface-variant">Votre message *</span><textarea class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary min-h-[110px] resize-y" placeholder="Décrivez votre demande ou votre problème en quelques lignes…"></textarea></label>
<button class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">send</span>Envoyer le message
</button>
</div>
</div>`;
const LINKS = {};

export default function c10aide() {
  return <DesignPage html={HTML} links={LINKS} />;
}
