import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full h-[calc(100vh-6rem)]">
<div class="flex items-center justify-between pb-space-sm mb-space-sm">
<div class="flex items-center gap-space-sm">
<span class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Messagerie & Échanges</span>
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        Canal chiffré TLS
      </span>
</div>
<div class="flex items-center gap-space-sm">
<button class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors shadow-sm">
<span class="material-symbols-outlined text-[18px] text-primary">verified_user</span>
<span>Contrat certifié #ALP-2025</span>
</button>
<button class="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors">
<span class="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</div>
<div class="flex-1 flex gap-space-md min-h-0 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
<!-- Left Column: Conversation List (380px) -->
<div class="w-[380px] shrink-0 flex flex-col bg-surface-container-lowest">
<!-- Search & Filters -->
<div class="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Messages</h2>
<span class="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">1 non lu</span>
</div>
<button class="w-7 h-7 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-colors" title="Nouvel échange">
<span class="material-symbols-outlined text-[18px]">edit_square</span>
</button>
</div>
<div class="relative">
<span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
<span class="material-symbols-outlined text-[18px]">search</span>
</span>
<input class="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-xl focus:bg-surface-container-lowest focus:outline-none transition-all shadow-inner" placeholder="Rechercher un échange, un chauffeur..." type="text"/>
</div>
<!-- Filter tabs -->
<div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl">

</div>
<!-- Filter by role -->
<div class="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl">
<button class="flex-1 py-1 px-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-sm transition-all text-center">Tous</button>
<button class="flex-1 py-1 px-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all text-center">Clients</button>
<button class="flex-1 py-1 px-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all text-center">Chauffeurs</button>
<button class="flex-1 py-1 px-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all text-center">Propriétaires</button>
<button class="flex-1 py-1 px-2 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm font-medium transition-all text-center">Support</button>
</div>
</div>
<!-- Conversations Scrollable Area -->
<div class="flex-1 overflow-y-auto px-2 space-y-1">
<!-- Item 1: Active -->
<div class="p-3 rounded-xl bg-surface-container-high cursor-pointer transition-all">
<div class="flex items-start gap-3">
<div class="relative shrink-0">
<div class="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm text-[16px] font-bold shadow-sm">
                JM
              </div>
<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<span class="font-headline-sm text-[14px] text-on-surface font-bold truncate">Jean-Pierre Mbida</span>
<span class="font-label-sm text-label-sm text-primary font-bold">10:42</span>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-secondary-container font-label-sm text-[10px] font-semibold">
<span class="material-symbols-outlined text-[11px] text-primary">directions_car</span>
                  Toyota RAV4 · 29 Oct
                </span>
<span class="w-1 h-1 rounded-full bg-outline-variant"></span>
<span class="font-label-sm text-[10px] text-outline font-medium">Chauffeur Pro</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface font-medium truncate">
                Bonjour M. Emmanuel, je serai au terminal à 08h15...
              </p>
</div>
<div class="shrink-0 flex flex-col items-end gap-1.5">
<span class="w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shadow-sm">1</span>
</div>
</div>
</div>
<!-- Item 2: Support Hub Akwa -->
<div class="p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all">
<div class="flex items-start gap-3">
<div class="relative shrink-0">
<div class="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm text-[16px] shadow-sm">
<span class="material-symbols-outlined text-[20px]">hub</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<span class="font-headline-sm text-[14px] text-on-surface font-semibold truncate">Coordination Hub Akwa</span>
<span class="font-label-sm text-label-sm text-outline">Hier</span>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-[10px]">
                  Support Douala
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">
                Votre contrat certifié CEMAC est validé avec succès.
              </p>
</div>
</div>
</div>
<!-- Item 3: Conciergerie AutoLink -->
<div class="p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all">
<div class="flex items-start gap-3">
<div class="relative shrink-0">
<div class="w-11 h-11 rounded-full bg-surface-container-high text-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[20px]">shield_person</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<span class="font-headline-sm text-[14px] text-on-surface font-semibold truncate">Service Conciergerie AutoLink</span>
<span class="font-label-sm text-label-sm text-outline">25 Oct</span>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-[10px]">
                  Caution sécurisée
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">
                Remboursement de la caution 100 000 FCFA clôturé sur MTN MoMo...
              </p>
</div>
</div>
</div>
<!-- Item 4: Propriétaire Marc T. -->
<div class="p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-all">
<div class="flex items-start gap-3">
<div class="relative shrink-0">
<div class="w-11 h-11 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-sm shadow-sm">
                MT
              </div>
</div>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between mb-0.5">
<span class="font-headline-sm text-[14px] text-on-surface font-semibold truncate">Propriétaire Partenaire (Marc T.)</span>
<span class="font-label-sm text-label-sm text-outline">12 Oct</span>
</div>
<div class="flex items-center gap-1.5 mb-1">
<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-[10px]">
                  Prado Yaoundé
                </span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant truncate">
                Merci pour votre retour de location impeccable à Bastos !
              </p>
</div>
</div>
</div>
</div>
<!-- Trust Bottom Footer pill -->
<div class="p-3 bg-surface-container-low/70 m-2 rounded-xl flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-primary">lock</span>
<span class="font-body-sm text-[11px] text-on-surface-variant">Communications tracées pour la conformité assurance CIMA</span>
</div>
</div>
<!-- Right Column: Active Conversation (Flex-1) -->
<div class="flex-1 flex flex-col min-w-0 bg-surface-container-lowest relative">
<!-- Sticky Context Header -->
<div class="p-space-md bg-surface-container-low/60 backdrop-blur-md flex flex-col gap-space-sm z-10">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-sm min-w-0">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-sm font-bold shadow-sm">
                JM
              </div>
<span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-container ring-2 ring-surface-container-lowest"></span>
</div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface truncate">Jean-Pierre Mbida</span>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
<span class="material-symbols-outlined text-[13px] text-primary">verified</span>
                  Chauffeur certifié AutoLink
                </span>
</div>
<div class="flex items-center gap-3 text-outline font-label-sm text-label-sm mt-0.5">
<span class="flex items-center gap-1 text-tertiary font-bold">
<span class="material-symbols-outlined text-[15px] fill-current" style="font-variation-settings: 'FILL' 1;">star</span>
                  4.98
                  <span class="text-on-surface-variant font-normal">(142 courses)</span>
</span>
<span class="flex items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined text-[14px]">call</span>
                  +237 670 42 18 90
                </span>
<span class="flex items-center gap-1 text-primary font-medium">
<span class="w-2 h-2 rounded-full bg-primary"></span>
                  En ligne
                </span>
</div>
</div>
</div>
<div class="flex items-center gap-space-sm shrink-0">
<a class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-all shadow-sm" href="tel:+237670421890">
<span class="material-symbols-outlined text-[18px] text-primary">call</span>
<span>Appeler</span>
</a>
<button class="w-9 h-9 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all shadow-sm" title="Options du dossier">
<span class="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</div>
<!-- Booking Context Card Banner -->
<div class="p-3 bg-surface-container-lowest rounded-xl flex items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-3 min-w-0">
<div class="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined text-[20px]">calendar_month</span>
</div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-2">
<span class="font-label-md text-label-md font-bold text-on-surface">Dossier #ALP-2025-DLA-8924</span>
<span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
<span class="font-label-md text-label-md text-primary font-semibold truncate">Toyota RAV4 AWD Hybrid (2023)</span>
<span class="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">Confirmée</span>
</div>
<p class="font-body-sm text-[12px] text-on-surface-variant truncate">
                Prise en charge : <span class="font-semibold text-on-surface">Mercredi 29 Oct à 08:30</span> · Aéroport International de Douala (DLA)
              </p>
</div>
</div>
<a class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:text-primary-container font-bold shrink-0 transition-colors" href="#">
<span>Voir le dossier</span>
<span class="material-symbols-outlined text-[15px]">arrow_forward</span>
</a>
</div>
</div>
<!-- Messages Thread History (Scrollable) -->
<div class="flex-1 overflow-y-auto p-space-md space-y-4">
<!-- Date Separator -->
<div class="flex items-center justify-center my-2">
<div class="px-3.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-semibold uppercase tracking-wider shadow-sm">
            Aujourd'hui, 28 Octobre
          </div>
</div>
<!-- Inbound Message 1 -->
<div class="flex items-end gap-2.5 max-w-[80%]">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
            JM
          </div>
<div class="flex flex-col gap-1 items-start">
<div class="p-3.5 rounded-2xl rounded-bl-sm bg-surface-container-low text-on-surface text-body-md font-body-md shadow-sm">
              Bonjour M. Emmanuel ! Je suis Jean-Pierre, votre chauffeur certifié AutoLink pour votre trajet de demain à Douala.
            </div>
<span class="font-label-sm text-[11px] text-outline ml-1">09:15</span>
</div>
</div>
<!-- Outbound Message 1 (Emmanuel K.) -->
<div class="flex items-end justify-end gap-2.5 w-full">
<div class="flex flex-col gap-1 items-end max-w-[80%]">
<div class="p-3.5 rounded-2xl rounded-br-sm bg-primary text-on-primary text-body-md font-body-md shadow-sm">
              Bonjour Jean-Pierre, merci. Mon vol Camair-Co arrive vers 08h15 au terminal domestique. J'aurai 2 valises.
            </div>
<div class="flex items-center gap-1 mr-1 text-outline">
<span class="font-label-sm text-[11px]">09:30</span>
<span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1;">done_all</span>
</div>
</div>
</div>
<!-- Inbound Message 2 with Photo Card Attachment -->
<div class="flex items-end gap-2.5 max-w-[85%]">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
            JM
          </div>
<div class="flex flex-col gap-1.5 items-start">
<div class="p-3.5 rounded-2xl rounded-bl-sm bg-surface-container-low text-on-surface text-body-md font-body-md shadow-sm space-y-3">
<p>Parfait, c'est bien noté. Le véhicule est déjà inspecté et lavé au Hub d'Akwa. Voici une photo de l'état de propreté intérieur.</p>
<!-- Vehicle Interior Attachment Card -->
<div class="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm w-full max-w-[380px]">
<div class="relative h-48 w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" data-alt="Interior of a pristine black Toyota RAV4 with clean leather seats and polished dashboard, sunlight entering through the window, clean and prepared for executive passenger transport in Douala Cameroon." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdUyZU7GA2tYdNSxZsTWEPFWkqMUzwwEFn0uzs8AoLVXv4Zf1iyAJZQzM8uuMDxpvwM5pnH0ZdY3Jr240Qwm_Z9FncsWE9R1EziS2U25JiTf7-MXX93NpWyRO583FdoQx7CbnS6ktREYyoRciFNEtW2KhM7MhYOsczRYP9NhPdA40MpnZvtTKBpN9u2lk3nc1ItfrFoBK5NNCU-M2LB1VnBigb6v5zEtXGOaXzAvu-4bXQlDC3m6NCdQ"/>
<div class="absolute top-2 left-2 px-2 py-1 rounded-md bg-inverse-surface/80 backdrop-blur-md text-inverse-on-surface font-label-sm text-[10px] flex items-center gap-1">
<span class="material-symbols-outlined text-[13px] text-primary-fixed">verified</span>
<span>Photo horodatée Hub Akwa 08:45</span>
</div>
<button class="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-surface-container-lowest/90 text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-lowest transition-colors">
<span class="material-symbols-outlined text-[16px]">zoom_in</span>
</button>
</div>
<div class="p-2.5 flex items-center justify-between bg-surface-container-low">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[16px] text-primary">fact_check</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Protocole Nettoyage Pro validé</span>
</div>
<span class="font-label-sm text-[11px] text-outline font-medium">1.8 Mo · JPEG</span>
</div>
</div>
</div>
<span class="font-label-sm text-[11px] text-outline ml-1">09:48</span>
</div>
</div>
<!-- Inbound Message 3 -->
<div class="flex items-end gap-2.5 max-w-[80%]">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
            JM
          </div>
<div class="flex flex-col gap-1 items-start">
<div class="p-3.5 rounded-2xl rounded-bl-sm bg-surface-container-low text-on-surface text-body-md font-body-md shadow-sm">
              Je vous attendrai dès 08h10 dans le hall des arrivées avec une pancarte à votre nom. Bonne journée !
            </div>
<span class="font-label-sm text-[11px] text-outline ml-1">10:42</span>
</div>
</div>
</div>
<!-- Quick Reply Action Chips -->
<div class="px-space-md py-1.5 flex items-center gap-2 overflow-x-auto bg-surface-container-lowest">
<button class="shrink-0 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
          Je serai là à l'heure
        </button>
<button class="shrink-0 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
          Retard de vol Camair-Co
        </button>
<button class="shrink-0 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
          Pouvez-vous m'appeler ?
        </button>
<button class="shrink-0 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm font-medium transition-colors">
          Préciser le point de rendez-vous
        </button>
</div>
<!-- Message Composer -->
<div class="p-space-md bg-surface-container-lowest">
<div class="flex items-end gap-space-sm p-2 rounded-2xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-md transition-all">
<div class="flex items-center gap-1 pb-1">
<button class="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors" title="Ajouter une pièce jointe">
<span class="material-symbols-outlined text-[20px]">attach_file</span>
</button>
<button class="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors" title="Envoyer une photo">
<span class="material-symbols-outlined text-[20px]">photo_camera</span>
</button>
</div>
<div class="flex-1 min-w-0">
<textarea class="w-full bg-transparent resize-none py-2 px-1 text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none max-h-28" placeholder="Écrivez votre message à Jean-Pierre Mbida..." rows="1"></textarea>
</div>
<div class="flex items-center gap-1.5 pb-1">
<button class="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors" title="Insérer un émoji">
<span class="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
</button>
<button class="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm transition-transform active:scale-95">
<span>Envoyer</span>
<span class="material-symbols-outlined text-[18px]">send</span>
</button>
</div>
</div>
</div>
</div>
</div>
`;
const LINKS = {
  'Voir le dossier': '/client/bookings/1',
};

export default function c7messagerie({ role = 'client' }) {
  const html = role === 'driver' ? HTML.replace('Voir le dossier', 'Voir la course') : HTML;
  const links = role === 'driver' ? { ...LINKS, 'Voir la course': '/driver/dashboard' } : LINKS;
  return <DesignPage html={html} links={links} role={role} />;
}
