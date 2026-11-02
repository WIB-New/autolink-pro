import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="w-full px-gutter py-space-lg flex flex-col gap-space-lg">
<!-- Header Greeting & Action Bar -->
<div class="flex flex-col gap-space-xs">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Bienvenue, Emmanuel!</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Ravi de vous revoir sur votre espace AutoLink Pro (Douala / Yaoundé).</p>
</div>
<!-- KPI Cards Row -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[22px]">account_balance_wallet</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">45 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Solde disponible</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-primary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0"><span class="material-symbols-outlined text-[22px]">directions_car</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">6</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Locations</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-secondary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0"><span class="material-symbols-outlined text-[22px]">lock</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">150 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Caution bloquée</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-blue-800"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0"><span class="material-symbols-outlined text-[22px]">star</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">4.9</span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Score Confiance</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-green-600"></span>
</div>
</div>
<!-- Graphiques dynamiques : utilisation de l'application -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- Courbe : dépenses mensuelles (area chart) -->
<div class="lg:col-span-8 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div class="flex items-center justify-between pb-space-md">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Dépenses de mobilité</span>
<div class="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span>Dépenses</span>
<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>Recharges</span>
</div>
</div>
<div class="relative">
<svg class="w-full h-44" viewBox="0 0 600 180" preserveAspectRatio="none">
<defs>
<linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d9488" stop-opacity="0.35"/><stop offset="100%" stop-color="#0d9488" stop-opacity="0"/></linearGradient>
<linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b45309" stop-opacity="0.3"/><stop offset="100%" stop-color="#b45309" stop-opacity="0"/></linearGradient>
</defs>
<polyline points="0,140 100,120 200,128 300,85 400,95 500,60 600,45" fill="url(#gDep)" stroke="none"/>
<polyline points="0,140 100,120 200,128 300,85 400,95 500,60 600,45" fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<polyline points="0,160 100,150 200,155 300,130 400,140 500,110 600,100" fill="url(#gRec)" stroke="none"/>
<polyline points="0,160 100,150 200,155 300,130 400,140 500,110 600,100" fill="none" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>
<circle cx="500" cy="60" r="5" fill="#0d9488" stroke="#fff" stroke-width="2"/>
<circle cx="600" cy="45" r="5" fill="#0d9488" stroke="#fff" stroke-width="2"/>
</svg>
<div class="flex justify-between px-1 font-label-sm text-[11px] text-on-surface-variant">
<span>Mai</span><span>Juin</span><span>Juil</span><span>Août</span><span>Sept</span><span>Oct</span>
</div>
</div>
<div class="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
<span class="font-label-md text-label-md font-semibold text-on-surface-variant">Total dépensé cette année</span>
<span class="font-headline-sm text-headline-sm font-bold text-primary">485 000 FCFA</span>
</div>
</div>
<!-- Donut : répartition des locations -->
<div class="lg:col-span-4 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div class="flex items-center justify-between pb-space-sm">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Types de locations</span>
</div>
<div class="flex items-center justify-center py-space-sm">
<div class="relative w-32 h-32 rounded-full" style="background: conic-gradient(#0d9488 0 55%, #b45309 55% 80%, #64748b 80% 100%);">
<div class="absolute inset-3 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">12</span>
<span class="font-label-sm text-label-sm text-on-surface-variant mt-1">trajets</span>
</div>
</div>
</div>
<div class="flex flex-col gap-2 pt-space-sm">
<div class="flex items-center justify-between font-body-sm text-body-sm"><span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span>Trajets urbains</span><span class="font-label-md text-label-md font-bold text-on-surface">55%</span></div>
<div class="flex items-center justify-between font-body-sm text-body-sm"><span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>Interurbains</span><span class="font-label-md text-label-md font-bold text-on-surface">25%</span></div>
<div class="flex items-center justify-between font-body-sm text-body-sm"><span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-outline"></span>Avec chauffeur</span><span class="font-label-md text-label-md font-bold text-on-surface">20%</span></div>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<!-- Barres : locations par mois -->
<div class="lg:col-span-5 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div class="flex items-center justify-between pb-space-md">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Locations par mois</span>
<span class="font-label-sm text-label-sm text-primary font-bold">+38 % vs N-1</span>
</div>
<div class="flex-1 flex items-end justify-between gap-3 px-1 min-h-[130px]">
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-secondary-container rounded-t-md" style="height:35%;"></div><span class="font-label-sm text-[11px] text-on-surface-variant">Mai</span></div>
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-secondary-container rounded-t-md" style="height:50%;"></div><span class="font-label-sm text-[11px] text-on-surface-variant">Juin</span></div>
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-secondary-container rounded-t-md" style="height:42%;"></div><span class="font-label-sm text-[11px] text-on-surface-variant">Juil</span></div>
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-secondary-container rounded-t-md" style="height:66%;"></div><span class="font-label-sm text-[11px] text-on-surface-variant">Août</span></div>
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-secondary-container rounded-t-md" style="height:55%;"></div><span class="font-label-sm text-[11px] text-on-surface-variant">Sept</span></div>
<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] bg-primary rounded-t-md shadow-sm" style="height:88%;"></div><span class="font-label-sm text-[11px] text-primary font-bold">Oct</span></div>
</div>
<div class="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface-variant">6 locations en octobre — record personnel</span>
<span class="material-symbols-outlined text-primary text-[20px]">trending_up</span>
</div>
</div>
<!-- Courbe sparkline : score confiance -->
<div class="lg:col-span-4 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
<div class="flex items-center justify-between pb-space-md">
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Score Confiance</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">military_tech</span>Top 5 %</span>
</div>
<svg class="w-full h-24" viewBox="0 0 300 80" preserveAspectRatio="none">
<polyline points="0,65 50,60 100,62 150,45 200,40 250,30 300,15" fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="300" cy="15" r="5" fill="#0d9488" stroke="#fff" stroke-width="2"/>
</svg>
<div class="flex items-end justify-between pt-space-sm border-t border-outline-variant/30">
<div class="flex flex-col"><span class="font-label-sm text-label-sm text-on-surface-variant">Note actuelle</span><span class="font-headline-lg text-headline-lg font-bold text-on-surface">4.9 / 5</span></div>
<div class="flex flex-col items-end"><span class="font-label-sm text-label-sm text-on-surface-variant">Annulations</span><span class="font-label-lg text-label-lg font-bold text-primary">0</span></div>
</div>
</div>
<!-- Actions rapides -->
<div class="lg:col-span-3 flex flex-col justify-center gap-space-sm p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<button class="w-full inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-all" type="button">
<span class="material-symbols-outlined text-[20px]">directions_car</span>
<span>Rechercher un véhicule</span>
</button>
<button class="w-full inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all" type="button">
<span class="material-symbols-outlined text-[20px] text-primary">add_card</span>
<span>Recharger mon portefeuille</span>
</button>
<button class="w-full inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all" title="Télécharger les relevés de factures" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary">download</span>
<span>Factures</span>
</button>
</div>
</div>
</div>`;
const LINKS = {
  'Rechercher un véhicule': '/client/search',
  'Recharger mon portefeuille': '/client/wallet?recharge=1',
  'Factures': '/client/bookings',
};

export default function c1tableaudebordclient() {
  return <DesignPage html={HTML} links={LINKS} />;
}
