import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="w-full px-gutter py-space-lg flex flex-col gap-space-xl">
<!-- Header Greeting & Action Bar -->
<div class="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
<div class="flex flex-col gap-space-xs">
<div class="flex items-center gap-space-sm">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Bonjour, Emmanuel 👋</h1>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Compte Actif
          </span>
</div>
<p class="font-body-lg text-body-lg text-on-surface-variant">Ravi de vous revoir sur votre espace AutoLink Pro (Douala / Yaoundé).</p>
</div>
<div class="flex flex-wrap items-center gap-space-sm">
<button class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[20px]">directions_car</span>
<span>Rechercher un véhicule</span>
</button>
<button class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-all" type="button">
<span class="material-symbols-outlined text-[20px] text-primary">add_card</span>
<span>Recharger mon portefeuille</span>
</button>
<button class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container transition-all" title="Télécharger les relevés de factures" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary">download</span>
<span>Factures</span>
</button>
</div>
</div>
<!-- Urgent Alerts (Yellow/Amber & Red status tags) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div class="flex items-start justify-between gap-space-md p-space-md rounded-xl bg-error-container text-on-error-container shadow-sm">
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-error text-[24px] mt-0.5">warning</span>
<div class="flex flex-col gap-1">
<span class="font-label-md text-label-md uppercase tracking-wider font-bold text-error">Pièce justificative requise</span>
<p class="font-body-md text-body-md text-on-error-container">Votre permis de conduire expire dans 15 jours. Mettez à jour votre document pour vos prochaines réservations.</p>
</div>
</div>
<button class="shrink-0 px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-error font-label-md text-label-md shadow-sm hover:bg-surface-container-high transition-colors" type="button">
          Mettre à jour
        </button>
</div>
<div class="flex items-start justify-between gap-space-md p-space-md rounded-xl bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
<div class="flex items-start gap-space-sm">
<span class="material-symbols-outlined text-tertiary text-[24px] mt-0.5">assignment_turned_in</span>
<div class="flex flex-col gap-1">
<span class="font-label-md text-label-md uppercase tracking-wider font-bold text-tertiary">État des lieux numérique disponible</span>
<p class="font-body-md text-body-md text-on-tertiary-fixed">Votre location de demain est confirmée. Préparez votre check-in photographique en ligne.</p>
</div>
</div>
<button class="shrink-0 px-space-md py-space-xs rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity" type="button">
          Ouvrir check-in
        </button>
</div>
</div>
<!-- Top Row: Fintech Wallet Card & Quick Stats Bento -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- Prominent Fintech Wallet Card (7 cols) -->
<div class="lg:col-span-7 flex flex-col justify-between p-space-lg rounded-xl bg-inverse-surface text-inverse-on-surface shadow-md relative overflow-hidden">
<div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
<div class="flex flex-col gap-space-md relative z-10">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary-fixed-dim text-[24px]">account_balance_wallet</span>
<span class="font-label-lg text-label-lg tracking-wide uppercase text-surface-variant font-semibold">Portefeuille Mobilité Sécurisé</span>
</div>
<div class="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-surface-container-highest/20 text-surface-bright font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px] text-primary-fixed-dim">verified</span>
<span>Agrément BEAC / CEMAC</span>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-space-lg pt-space-xs">
<div class="flex flex-col gap-space-xs">
<span class="font-label-md text-label-md text-surface-variant">Solde disponible</span>
<div class="font-headline-xl text-headline-xl font-bold text-surface-bright tracking-tight leading-none">
                45 000 <span class="font-label-lg text-label-lg text-primary-fixed-dim font-normal">FCFA</span>
</div>
<span class="font-body-sm text-body-sm text-surface-variant/80">Immédiatement utilisable pour vos trajets</span>
</div>
<div class="flex flex-col gap-space-xs sm:pl-space-md sm:border-l sm:border-surface-variant/20">
<div class="flex items-center gap-1">
<span class="font-label-md text-label-md text-surface-variant">Caution séquestrée bloquée</span>
<span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim cursor-pointer" title="Fonds réservés pour garantie de location">lock</span>
</div>
<div class="font-headline-lg text-headline-lg font-bold text-surface-bright tracking-tight">
                150 000 <span class="font-label-lg text-label-lg text-surface-variant font-normal">FCFA</span>
</div>
<span class="font-body-sm text-body-sm text-surface-variant/80 leading-relaxed">
                Protégée sous séquestre CEMAC, débloquée automatiquement après état des lieux retour conforme.
              </span>
</div>
</div>
</div>
<div class="mt-space-lg pt-space-md border-t border-surface-variant/15 flex flex-wrap items-center justify-between gap-space-md relative z-10">
<div class="flex items-center gap-space-md">
<div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest/30">
<span class="w-2.5 h-2.5 rounded-full bg-primary-fixed"></span>
<span class="font-label-sm text-label-sm text-surface-bright">MTN MoMo</span>
</div>
<div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest/30">
<span class="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim"></span>
<span class="font-label-sm text-label-sm text-surface-bright">Orange Money</span>
</div>
<div class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest/30">
<span class="material-symbols-outlined text-[14px] text-surface-bright">credit_card</span>
<span class="font-label-sm text-label-sm text-surface-bright">Carte Bancaire</span>
</div>
</div>
<button class="px-space-lg py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container transition-all" type="button">
            Recharger via MoMo / OM / Carte
          </button>
</div>
</div>
<!-- Quick Personal Stats & Sparkline (5 cols) -->
<div class="lg:col-span-5 flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div>
<div class="flex items-center justify-between pb-space-sm">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Activité Mobilité</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
<span class="material-symbols-outlined text-[14px]">military_tech</span>
              Locataire Certifié Or
            </span>
</div>
<div class="grid grid-cols-3 gap-space-sm py-space-sm text-center">
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-headline-lg text-headline-lg font-bold text-primary">6</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Locations</span>
<span class="font-body-sm text-[10px] text-on-surface-variant mt-0.5">4 DLA • 2 YDE</span>
</div>
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<span class="font-headline-lg text-headline-lg font-bold text-secondary">1 240</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Kilomètres</span>
<span class="font-body-sm text-[10px] text-on-surface-variant mt-0.5">Total parcouru</span>
</div>
<div class="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
<div class="flex items-center justify-center gap-1">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface">4.9</span>
<span class="material-symbols-outlined text-[18px] text-tertiary">star</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Score Confiance</span>
<span class="font-body-sm text-[10px] text-primary font-semibold mt-0.5">Top 5% certifié</span>
</div>
</div>
</div>
<div class="pt-space-md flex flex-col gap-space-xs">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md font-semibold text-on-surface-variant">Dépenses mensuelles de mobilité</span>
<span class="font-label-md text-label-md font-bold text-on-surface">195 000 FCFA total</span>
</div>
<!-- Inline Sparkline Chart -->
<div class="h-20 w-full flex items-end justify-between gap-3 px-2 pt-2">
<div class="flex-1 flex flex-col items-center gap-1">
<div class="w-full bg-secondary-container rounded-t-lg transition-all" style="height: 38px;"></div>
<span class="font-label-sm text-[11px] text-on-surface-variant">Juil</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1">
<div class="w-full bg-secondary-container rounded-t-lg transition-all" style="height: 52px;"></div>
<span class="font-label-sm text-[11px] text-on-surface-variant">Août</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1">
<div class="w-full bg-secondary-container rounded-t-lg transition-all" style="height: 30px;"></div>
<span class="font-label-sm text-[11px] text-on-surface-variant">Sept</span>
</div>
<div class="flex-1 flex flex-col items-center gap-1">
<div class="w-full bg-primary rounded-t-lg transition-all shadow-sm" style="height: 64px;"></div>
<span class="font-label-sm text-[11px] text-primary font-bold">Oct</span>
</div>
</div>
</div>
</div>
</div>
<!-- Quick Search Widget Dock -->
<div class="w-full p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
<div class="flex items-center gap-space-xs px-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">bolt</span>
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Besoin d'un véhicule rapidement ?</span>
<span class="font-body-sm text-body-sm text-on-surface-variant ml-2 hidden md:inline">Réservation instantanée confirmée en moins de 15 minutes</span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm items-center">
<div class="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary text-[20px]">location_on</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Ville & Retrait</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Douala (Akwa / Bonanjo)</span>
</div>
</div>
<div class="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Date de début</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Aujourd'hui, 14:00</span>
</div>
</div>
<div class="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary text-[20px]">schedule</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Formule</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">24h (Journée complète)</span>
</div>
</div>
<button class="h-full min-h-[52px] flex items-center justify-center gap-space-xs px-space-lg rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-sm hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[20px]">search</span>
<span>Trouver un véhicule</span>
</button>
</div>
</div>
<!-- Réservation à venir (Upcoming high-fidelity vehicle card) -->
<div class="flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[24px]">event_upcoming</span>
<h2 class="font-headline-lg text-headline-lg text-on-surface font-bold">Réservation à venir</h2>
</div>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
<span class="w-2 h-2 rounded-full bg-primary"></span> Confirmée & Caution Bloquée
        </span>
</div>
<div class="p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-md flex flex-col xl:flex-row gap-space-lg items-stretch">
<!-- Vehicle Visual -->
<div class="xl:w-5/12 flex flex-col justify-between rounded-xl overflow-hidden bg-surface-container-low relative min-h-[240px]">
<img class="w-full h-full object-cover rounded-xl" data-alt="High-end 2022 Toyota RAV4 AWD Hybrid silver SUV parked outside a clean modern business district in Douala Cameroon under bright sunlit afternoon sky, 4k automotive photography, realistic reflections and sharp clean finish" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4WuJPW8j1PhPwmDNeUp5biYF-LCdZCJhOUagyanaCrg2qStQ6674lHMZO0ipCvv4VFqgtGJjvs0eqfvzXKRqnSclncNur8pNLcC3e1x89Ua0NmNxn_thN0xQr8TJXv_p1KyvQRvWchFNDSErP631BDZpEC5V83NgPst-119VWBHzT-MlnF0Dvl6YMbZH3TkUzbRbm8hdSSrO4gjYrH-977AKaEbL_1fxxh9F-4gR1SRr8iBlA90rC3w"/>
<div class="absolute top-space-sm left-space-sm flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-sm">
<span class="material-symbols-outlined text-[16px]">verified</span> Catégorie Standard Pro
          </div>
<div class="absolute bottom-space-sm right-space-sm px-3 py-1.5 rounded-xl bg-on-surface/90 backdrop-blur-md text-surface-bright font-headline-lg text-headline-lg font-bold shadow-sm">
            45 000 <span class="font-label-sm text-label-sm text-surface-variant font-normal">FCFA / jour</span>
</div>
</div>
<!-- Vehicle Details & Operational Specs -->
<div class="xl:w-7/12 flex flex-col justify-between gap-space-md">
<div class="flex flex-col gap-space-sm">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div>
<span class="font-label-md text-label-md text-primary uppercase font-bold tracking-wider">Douala • Agence Akwa Boulevard de la Liberté</span>
<h3 class="font-headline-lg text-headline-lg text-on-surface font-bold">Toyota RAV4 AWD Hybrid 2022</h3>
</div>
<div class="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md">
<span class="material-symbols-outlined text-[18px] text-tertiary">star</span>
<span class="font-bold">4.95</span>
<span class="text-on-surface-variant">(38 avis agence)</span>
</div>
</div>
<!-- Specs Grid -->
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-xs py-space-xs">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">settings</span>
<span>Automatique</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">ac_unit</span>
<span>Climatisation A/C</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">airline_seat_recline_normal</span>
<span>5 Places</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">local_gas_station</span>
<span>Hybride Essence</span>
</div>
</div>
<!-- Timeline & Chauffeur Badge -->
<div class="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-primary text-[24px]">schedule</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Période réservée</span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Demain 29 Oct 08:30 → 30 Oct 08:30 (24h)</span>
</div>
</div>
<div class="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm">
<span class="material-symbols-outlined text-primary text-[18px]">person_pin</span>
<span class="font-semibold">Avec chauffeur certifié (bilingue)</span>
</div>
</div>
</div>
<!-- Quick Action Buttons -->
<div class="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div class="flex flex-wrap items-center gap-space-xs">
<button class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-sm hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">fact_check</span>
<span>Feuille de route & Check-in</span>
</button>
<a class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg font-semibold hover:bg-surface-container transition-all" href="tel:+237670000012">
<span class="material-symbols-outlined text-primary text-[18px]">call</span>
<span>Chauffeur (+237 670 •• •• 12)</span>
</a>
</div>
<button class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container transition-all font-label-md text-label-md" type="button">
<span class="material-symbols-outlined text-[18px]">edit_calendar</span>
<span>Modifier / Annuler</span>
</button>
</div>
</div>
</div>
</div>
<!-- Bottom Bento Grid: Transactions History (7 cols) & Personalized Vehicle Suggestions (5 cols) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- Dernières transactions du Portefeuille (7 cols) -->
<div class="lg:col-span-7 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div class="flex items-center justify-between pb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Dernières transactions Portefeuille</h3>
</div>
<button class="font-label-md text-label-md text-primary font-bold hover:underline" type="button">
            Voir tout le relevé
          </button>
</div>
<div class="flex flex-col gap-space-xs">
<!-- Item 1 -->
<div class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[20px]">phone_iphone</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-semibold text-on-surface">Rechargement MTN MoMo</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">27 Oct 2024 • Réf: MOMO-89342</span>
</div>
</div>
<div class="text-right flex flex-col items-end">
<span class="font-headline-sm text-headline-sm font-bold text-primary">+50 000 FCFA</span>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Réussi
              </span>
</div>
</div>
<!-- Item 2 -->
<div class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[20px]">lock_open</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-semibold text-on-surface">Caution débloquée Toyota Corolla</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">25 Oct 2024 • État des lieux validé</span>
</div>
</div>
<div class="text-right flex flex-col items-end">
<span class="font-headline-sm text-headline-sm font-bold text-primary">+100 000 FCFA</span>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary font-semibold">
<span class="material-symbols-outlined text-[14px]">assignment_turned_in</span> Restitué
              </span>
</div>
</div>
<!-- Item 3 -->
<div class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
<span class="material-symbols-outlined text-[20px]">key</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-semibold text-on-surface">Paiement location Toyota Corolla</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">24 Oct 2024 • Durée: 24h Yaoundé</span>
</div>
</div>
<div class="text-right flex flex-col items-end">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">-35 000 FCFA</span>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant font-semibold">
<span class="material-symbols-outlined text-[14px]">check</span> Validé
              </span>
</div>
</div>
<!-- Item 4 -->
<div class="flex items-center justify-between p-space-sm rounded-xl hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/30 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg font-semibold text-on-surface">Rechargement Orange Money</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">20 Oct 2024 • Réf: OM-66120</span>
</div>
</div>
<div class="text-right flex flex-col items-end">
<span class="font-headline-sm text-headline-sm font-bold text-primary">+60 000 FCFA</span>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold">
<span class="material-symbols-outlined text-[14px]">check_circle</span> Réussi
              </span>
</div>
</div>
</div>
</div>
<!-- Recommandations personnalisées pour vous (5 cols) -->
<div class="lg:col-span-5 flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div>
<div class="flex items-center justify-between pb-space-md">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-tertiary text-[22px]">auto_awesome</span>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Recommandations Privilège</h3>
</div>
<span class="font-label-sm text-label-sm text-primary font-bold">Tarifs Membre Or</span>
</div>
<div class="flex flex-col gap-space-md">
<!-- Recommendation 1: Hyundai Tucson 2023 -->
<div class="flex gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
<div class="w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
<img class="w-full h-full object-cover" data-alt="Modern dark blue 2023 Hyundai Tucson SUV parked neatly on an asphalt road in Bastos Yaounde, elegant exterior styling, cinematic natural morning daylight, pristine condition" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLWcT0i4i2nTe8sZ9JzoH8BE8s6Wc2T_YIXzskwpp93OSqp80d9t_oxjNZ0cXqXw9ceQvkbLuUhdvv_XsHsyfl2fkoGVHJFxJDQcpTXAKKP1n3mgQKWEzzCYCaAgMfcL0zb9lfjzlwwTTujVR4JHAKkcc0z2MwY6cIhIYHGEnAMud3ziM0xKafwpJdCsMcssJNeAV3fLfgG-zcVnG3sTS9u5NdenW1FbGpn7gn2fpzthak1rQM7kMNog"/>
</div>
<div class="flex flex-col justify-between flex-1 min-w-0">
<div>
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-primary font-bold">Yaoundé (Bastos)</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold flex items-center">
<span class="material-symbols-outlined text-[14px] text-tertiary mr-0.5">star</span> 4.9
                    </span>
</div>
<h4 class="font-label-lg text-label-lg font-bold text-on-surface truncate">Hyundai Tucson 2023</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Automatique • 5 places • Diesel</span>
</div>
<div class="flex items-baseline justify-between pt-1">
<span class="font-headline-sm text-headline-sm font-bold text-primary">60 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA/j</span></span>
<span class="font-label-sm text-label-sm font-semibold text-primary underline">Réserver</span>
</div>
</div>
</div>
<!-- Recommendation 2: Toyota Prado TX -->
<div class="flex gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer">
<div class="w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
<img class="w-full h-full object-cover" data-alt="Imposing white Toyota Prado TX 4x4 executive SUV parked in front of modern corporate glass architecture in Douala Bonanjo, premium automotive lighting, crystal clear clean paint" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYghQQomgKFnIM7GkgKToyFLIZoJeC420Gi9LIrfpTO-7aRGfdMARyOOZOpWaXGQxsxj73wGZdFj5g7p6wbxv-Olqkcxh4uDOYtN3hdswsmOCprIC3-DFErwpAniqxkQf0SVCsn9DMdhKikuYM_rVk26DmeL5uSPHtXYYmXALw-sO_Z7W-sjirY9uoLcdvXrvT_FQIeAV_bbMAFtSm3LKp6tX-IWa5ldhvw6X1AE72DYJtho4IYCp45Q"/>
</div>
<div class="flex flex-col justify-between flex-1 min-w-0">
<div>
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm text-secondary font-bold">Douala (Bonanjo)</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold flex items-center">
<span class="material-symbols-outlined text-[14px] text-tertiary mr-0.5">star</span> 5.0
                    </span>
</div>
<h4 class="font-label-lg text-label-lg font-bold text-on-surface truncate">Toyota Prado TX V6</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">4x4 Tout-Terrain • 7 places • Chauffeur inclus</span>
</div>
<div class="flex items-baseline justify-between pt-1">
<span class="font-headline-sm text-headline-sm font-bold text-primary">110 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA/j</span></span>
<span class="font-label-sm text-label-sm font-semibold text-primary underline">Réserver</span>
</div>
</div>
</div>
</div>
</div>
<div class="mt-space-md p-space-sm rounded-xl bg-surface-container-low flex items-center gap-space-sm">
<span class="material-symbols-outlined text-primary text-[20px]">shield</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">
            Assurance tous risques Activa Assurances incluse sur tous les véhicules partenaires.
          </span>
</div>
</div>
</div>
</div>
</div>`;
const LINKS = {
  'Rechercher un véhicule': '/client/search',
  'Trouver un véhicule': '/client/search',
  'Réserver': '/client/booking/recap',
  'Recharger mon portefeuille': '/client/wallet?recharge=1',
  'Recharger via MoMo / OM / Carte': '/client/wallet?recharge=1',
  'Factures': '/client/bookings',
  'Mettre à jour': '/profile',
  'Ouvrir check-in': '/client/bookings/1',
  'Feuille de route & Check-in': '/client/bookings/1',
  'Modifier / Annuler': '/client/bookings/1',
  'Voir tout le relevé': '/client/wallet',
};

export default function c1tableaudebordclient() {
  return <DesignPage html={HTML} links={LINKS} />;
}
