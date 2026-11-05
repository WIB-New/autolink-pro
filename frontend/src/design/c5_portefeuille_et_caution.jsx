import React, { useMemo, useState } from 'react';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import api, { withdrawalsAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dt = (iso) => (iso ? new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const hm = (iso) => (iso ? new Date(iso).toLocaleTimeString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { hour: '2-digit', minute: '2-digit' }) : '');
const KIND_UI = {
  topup: ['Recharge', 'text-primary', '+'], debit: ['Paiement', 'text-error', '-'], refund: ['Remboursement', 'text-primary', '+'],
};
const txRow = (t) => {
  const [label, cls, sign] = KIND_UI[t.kind] || [t.kind || 'Transaction', 'text-on-surface', ''];
  const done = t.status === 'completed' || t.status === 'succeeded';
  return `<tr class="tx-row hover:bg-surface-container-low/70 transition-colors" data-kind="${t.kind}" data-date="${esc(t.created_at)}" data-ref="${esc(t.reference || '')}">
<td class="py-3.5 px-4 whitespace-nowrap"><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface">${dt(t.created_at)}</span><span class="text-on-surface-variant text-[11px]">${hm(t.created_at)}</span></div></td>
<td class="py-3.5 px-4 whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">${esc(label)}</span></td>
<td class="py-3.5 px-4 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">${esc(t.reference || t.id)}</td>
<td class="py-3.5 px-4"><span class="font-label-md text-label-md text-on-surface">${esc(t.note || label)}</span></td>
<td class="py-3.5 px-4 whitespace-nowrap text-on-surface-variant">${esc(t.method || '—')}</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm ${cls}">${sign}${fmt(t.amount)} FCFA</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${done ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'} font-label-sm text-label-sm"><span class="w-1.5 h-1.5 rounded-full ${done ? 'bg-primary' : 'bg-on-surface-variant'}"></span>${esc(t.status || '')}</span></td>
<td class="py-3.5 px-4 text-center whitespace-nowrap"><button class="p-1.5 rounded-lg bg-surface-container-low text-secondary tx-receipt" title="Reçu" data-ref="${esc(t.reference || '')}" type="button"><span class="material-symbols-outlined text-[18px]">receipt</span></button></td>
</tr>`;
};

const HTML = `<div class="flex flex-col w-full">
<div class="flex flex-col gap-8 pb-12 max-w-[1360px] mx-auto w-full">
<!-- En-tête de page & Actions principales -->
<div class="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-4">
<div class="flex flex-col gap-2 max-w-2xl">
<h1 class="text-headline-xl font-headline-xl text-on-surface tracking-tight">
          Mon Portefeuille & Gestion des Cautions
        </h1>
<p class="text-on-surface-variant font-body-md text-body-md leading-relaxed">
          Gérez votre solde numérique, rechargez vos fonds et suivez vos cautions sous séquestre bancaire sécurisé CEMAC en toute transparence.
        </p>
</div>
<div class="flex flex-wrap items-center gap-3">
<button class="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]" onclick="document.getElementById('quick-reload-panel').scrollIntoView({ behavior: 'smooth' })" type="button">
<span class="material-symbols-outlined text-[20px]">add_circle</span>
<span class="">Recharger mon portefeuille</span>
</button>
<button id="btn-withdraw" class="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary">payments</span>
<span class="">Retirer des fonds</span>
</button>
</div>
</div>
<!-- KPI Cards -->
<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0"><span class="material-symbols-outlined text-[22px]">account_balance_wallet</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">26 500 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Solde disponible</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-primary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0"><span class="material-symbols-outlined text-[22px]">lock_clock</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">150 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Caution bloquée</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-blue-800"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0"><span class="material-symbols-outlined text-[22px]">trending_up</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">110 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Rechargé ce mois</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-secondary"></span>
</div>
<div class="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
<span class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-600 shrink-0"><span class="material-symbols-outlined text-[22px]">task_alt</span></span>
<div class="flex flex-col min-w-0">
<span class="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">450 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Cautions restituées</span>
</div>
<span class="absolute top-0 bottom-0 right-0 w-1.5 bg-green-600"></span>
</div>
</div>
<!-- Historique détaillé des transactions -->
<div class="rounded-2xl bg-surface-container-lowest p-6 shadow-sm flex flex-col gap-6">
<!-- Titre et Barre de filtres -->
<div class="flex flex-col gap-4">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
<div class="flex items-center gap-3">
<div class="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]">history</span>
</div>
<div>
<h2 class="text-headline-sm font-headline-sm text-on-surface">Historique complet des transactions</h2>
<p class="text-body-sm font-body-sm text-on-surface-variant">Recharges, réservations, cautions sous séquestre et restitutions certifiées.</p>
</div>
</div>
<div class="flex items-center gap-2">
<button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">file_download</span>
<span class="">Exporter CSV</span>
</button>
<button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">
<span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
<span class="">Relevé PDF</span>
</button>
</div>
</div>
<!-- Filtres interactifs -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
<!-- Recherche textuelle -->
<div class="md:col-span-5 relative">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
<input class="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:ring-2 focus:ring-primary" placeholder="Filtrer par référence, libellé (#ALP, #TX, RAV4...)" type="text">
</div>
<!-- Type de transaction -->
<div class="md:col-span-4 relative">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">filter_list</span>
<select class="w-full pl-10 pr-8 py-2 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-primary">
<option value="all">Tous les types d'opérations</option>
<option value="recharge">Recharges de compte</option>
<option value="paiement">Paiements de location</option>
<option value="caution_bloquee">Cautions bloquées (Séquestre)</option>
<option value="caution_restituee">Cautions restituées (100%)</option>
<option value="remboursement">Remboursements</option>
</select>
<span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
</div>
<!-- Période -->
<div class="md:col-span-3 relative">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">calendar_today</span>
<select class="w-full pl-10 pr-8 py-2 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-primary">
<option value="30d">Derniers 30 jours</option>
<option value="t3">Trimestre en cours</option>
<option value="year">Année en cours</option>
</select>
<span class="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
</div>
</div>
</div>
<!-- Table Structurée Responsive -->
<div class="overflow-x-auto rounded-xl shadow-sm bg-surface-container-lowest">
<table class="w-full text-left border-collapse min-w-[1020px]">
<thead>
<tr class="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
<th class="py-3 px-4">Date & Heure</th>
<th class="py-3 px-4">Type</th>
<th class="py-3 px-4">Référence</th>
<th class="py-3 px-4">Libellé & Dossier</th>
<th class="py-3 px-4">Moyen / Source</th>
<th class="py-3 px-4 text-right">Montant</th>
<th class="py-3 px-4 text-center">Statut</th>
<th class="py-3 px-4 text-center">Document</th>
</tr>
</thead>
<tbody class="divide-y divide-surface-container-high/40 font-body-sm text-body-sm text-on-surface">
<!-- Ligne 1 : Paiement Toyota RAV4 -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">27 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">09:15 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">payments</span>
                  Paiement
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #TX-8924-PAY
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Paiement location Toyota RAV4 AWD</span>
<span class="text-on-surface-variant text-[11px]">Dossier voyageur : #ALP-8924 • Douala Akwa</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-primary text-[16px]">account_balance_wallet</span>
<span class="">Solde Portefeuille</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-error">
                -73 500 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Succès
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors" title="Télécharger la quittance PDF" type="button">
<span class="material-symbols-outlined text-[18px]">receipt_long</span>
</button>
</td>
</tr>
<!-- Ligne 2 : Caution bloquée séquestre RAV4 -->
<tr class="hover:bg-surface-container-low/70 transition-colors bg-tertiary-fixed/15">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">27 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">09:14 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">lock</span>
                  Caution bloquée
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #SEC-8924-CAU
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Séquestre caution Toyota RAV4 (Dossier #ALP-8924)</span>
<span class="text-tertiary font-label-sm text-label-sm">Séquestre fiduciaire actif</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5 text-on-surface-variant">
<span class="material-symbols-outlined text-tertiary text-[16px]">account_balance</span>
<span class="">Compte Séquestre CEMAC</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-tertiary">
                150 000 FCFA
                <span class="block text-[10px] text-on-surface-variant font-label-sm font-normal">Bloqué temporaire</span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[12px]">lock_clock</span>
                  Séquestré
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-tertiary transition-colors" title="Attestation de Séquestre Bancaire" type="button">
<span class="material-symbols-outlined text-[18px]">verified</span>
</button>
</td>
</tr>
<!-- Ligne 3 : Recharge MTN MoMo -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">27 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">08:50 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">add_circle</span>
                  Recharge
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #TOP-7712-MOM
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Rechargement portefeuille via MTN Mobile Money</span>
<span class="text-on-surface-variant text-[11px]">TxID MTN : MOMO-CM-994821</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5">
<span class="w-3.5 h-3.5 rounded-full bg-[#FFCC00] text-[8px] flex items-center justify-center font-bold text-black">M</span>
<span class="">MTN MoMo (+237 670 •• 89)</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-primary">
                +50 000 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Réussi
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors" title="Télécharger le reçu" type="button">
<span class="material-symbols-outlined text-[18px]">receipt</span>
</button>
</td>
</tr>
<!-- Ligne 4 : Caution restituée Corolla -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">25 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">18:15 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">lock_open</span>
                  Caution restituée
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #REL-7201-RES
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Restitution intégrale caution Toyota Corolla</span>
<span class="text-primary font-label-sm text-label-sm">Dossier #ALP-7201 • Zéro dommage certifié</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5 text-on-surface-variant">
<span class="material-symbols-outlined text-primary text-[16px]">task_alt</span>
<span class="">Déblocage Séquestre</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-primary">
                +100 000 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Restitué (100%)
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary transition-colors" title="Rapport de clôture et restitution" type="button">
<span class="material-symbols-outlined text-[18px]">verified_user</span>
</button>
</td>
</tr>
<!-- Ligne 5 : Paiement location Corolla -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">24 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">08:30 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">payments</span>
                  Paiement
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #TX-7201-PAY
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Paiement location 24h Toyota Corolla Yaoundé</span>
<span class="text-on-surface-variant text-[11px]">Agence Yaoundé Bastos</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-primary text-[16px]">account_balance_wallet</span>
<span class="">Solde Portefeuille</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-error">
                -35 000 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Succès
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors" title="Télécharger la quittance" type="button">
<span class="material-symbols-outlined text-[18px]">receipt_long</span>
</button>
</td>
</tr>
<!-- Ligne 6 : Recharge Orange Money -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">20 Oct 2025</span>
<span class="text-on-surface-variant text-[11px]">14:20 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">add_circle</span>
                  Recharge
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #TOP-6612-OM
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Rechargement portefeuille via Orange Money</span>
<span class="text-on-surface-variant text-[11px]">TxID OM : CI20251020-0091</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5">
<span class="w-3.5 h-3.5 rounded-full bg-[#FF7900] text-[8px] flex items-center justify-center font-bold text-white">O</span>
<span class="">Orange Money (+237 699 •• 42)</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-primary">
                +60 000 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Réussi
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors" title="Télécharger le reçu" type="button">
<span class="material-symbols-outlined text-[18px]">receipt</span>
</button>
</td>
</tr>
<!-- Ligne 7 : Remboursement sans frais Picanto -->
<tr class="hover:bg-surface-container-low/70 transition-colors">
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface">02 Sept 2025</span>
<span class="text-on-surface-variant text-[11px]">11:00 GMT+1</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">replay</span>
                  Remboursement
                </span>
</td>
<td class="py-3.5 px-4 font-mono font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                #REF-6512-ANN
              </td>
<td class="py-3.5 px-4">
<div class="flex flex-col max-w-xs">
<span class="font-label-md text-label-md text-on-surface truncate">Remboursement sans frais annulation Kia Picanto</span>
<span class="text-on-surface-variant text-[11px]">Dossier #ALP-6512 (Annulé &gt; 24h à l'avance)</span>
</div>
</td>
<td class="py-3.5 px-4 whitespace-nowrap">
<div class="flex items-center gap-1.5 text-on-surface-variant">
<span class="material-symbols-outlined text-secondary text-[16px]">history_toggle_off</span>
<span class="">Crédit Portefeuille AutoLink</span>
</div>
</td>
<td class="py-3.5 px-4 text-right whitespace-nowrap font-headline-sm text-headline-sm text-primary">
                +25 000 FCFA
              </td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Remboursé
                </span>
</td>
<td class="py-3.5 px-4 text-center whitespace-nowrap">
<button class="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors" title="Bordereau d'annulation" type="button">
<span class="material-symbols-outlined text-[18px]">receipt</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination de la table -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
<span class="font-body-sm text-body-sm text-on-surface-variant">
          Affichage de <strong class="text-on-surface">1 à 7</strong> sur <strong class="text-on-surface">24</strong> opérations
        </span>
<div class="flex items-center gap-1.5">
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant opacity-50 cursor-not-allowed font-label-sm text-label-sm" disabled="" type="button">
            Précédent
          </button>
<button class="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm flex items-center justify-center" type="button">
            1
          </button>
<button class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
            2
          </button>
<button class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
            3
          </button>
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">
            Suivant
          </button>
</div>
</div>
</div>
<!-- Bouton Catalogue en bas -->
<div class="mt-6">
<a class="inline-flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all" href="/client/search">
<span class="material-symbols-outlined text-[20px]">explore</span>
<span class="">Explorer le Catalogue de Véhicules</span>
</a>
</div>
</div>
</div>
<script>
  // Micro-interaction : Sélection dynamique des montants de recharge
  function selectAmount(amount, buttonElement) {
    const input = document.getElementById('custom-amount-input');
    const futureBalanceSpan = document.getElementById('future-balance');
    const buttons = document.querySelectorAll('.amount-btn');
    
    // Mise à jour de l'input
    input.value = amount;
    
    // Style toggle
    buttons.forEach(btn => {
      btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'shadow-sm');
      btn.classList.add('bg-surface-container', 'text-on-surface');
    });
    buttonElement.classList.remove('bg-surface-container', 'text-on-surface');
    buttonElement.classList.add('bg-primary-container', 'text-on-primary-container', 'shadow-sm');

    // Mise à jour du solde estimé (solde actuel = 26 500)
    const baseBalance = 26500;
    const total = baseBalance + parseInt(amount, 10);
    futureBalanceSpan.innerText = total.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')) + ' FCFA';
  }

  // Écoute de l'input manuel
  const customInput = document.getElementById('custom-amount-input');
  if (customInput) {
    customInput.addEventListener('input', function(e) {
      const val = parseInt(e.target.value, 10) || 0;
      const baseBalance = 26500;
      const total = baseBalance + val;
      const futureBalanceSpan = document.getElementById('future-balance');
      futureBalanceSpan.innerText = total.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')) + ' FCFA';
    });
  }

  // Simulation d'action sur le bouton Recharger
  const rechargeBtn = document.getElementById('confirm-recharge-btn');
  if (rechargeBtn) {
    rechargeBtn.addEventListener('click', function() {
      const amount = document.getElementById('custom-amount-input').value;
      const initialHTML = rechargeBtn.innerHTML;
      rechargeBtn.disabled = true;
      rechargeBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Demande USSD envoyée...</span>';
      
      setTimeout(function() {
        rechargeBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span><span>Approuvé par Mobile Money !</span>';
        setTimeout(function() {
          rechargeBtn.innerHTML = initialHTML;
          rechargeBtn.disabled = false;
        }, 2500);
      }, 1800);
    });
  }
</script>`;
const MODAL = `<div class="flex flex-col w-full relative">
<!-- DASHBOARD BACKGROUND: Portefeuille & Caution Screen (Slightly dimmed behind modal) -->
<div class="w-full space-y-gutter pointer-events-none select-none filter blur-[2px] opacity-40">
<div class="flex flex-wrap items-center justify-between gap-space-md">
<div>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Espace Financier Sécurisé</span>
<h1 class="font-headline-xl text-headline-xl text-on-surface">Portefeuille & Caution</h1>
</div>
<div class="flex items-center gap-space-sm">
<div class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[18px]">verified_user</span>
          Compte vérifié : Emmanuel K.
        </div>
</div>
</div>
<!-- Overview Cards in Background -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<span class="font-label-md text-label-md text-on-surface-variant">Solde Disponible</span>
<span class="p-2 rounded-lg bg-surface-container text-primary material-symbols-outlined">account_balance_wallet</span>
</div>
<div class="mt-4">
<span class="font-display-lg text-headline-xl text-on-surface font-extrabold">26 500</span>
<span class="font-label-lg text-label-lg font-bold text-primary ml-1">FCFA</span>
</div>
</div>
<div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<span class="font-label-md text-label-md text-on-surface-variant">Caution Bloquée (Toyota RAV4)</span>
<span class="p-2 rounded-lg bg-surface-container-high text-secondary material-symbols-outlined">lock</span>
</div>
<div class="mt-4">
<span class="font-display-lg text-headline-xl text-on-surface font-extrabold">150 000</span>
<span class="font-label-lg text-label-lg font-bold text-secondary ml-1">FCFA</span>
</div>
</div>
<div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div class="flex justify-between items-start">
<span class="font-label-md text-label-md text-on-surface-variant">Trajets Facturés (Ce mois)</span>
<span class="p-2 rounded-lg bg-surface-container text-tertiary-container material-symbols-outlined">receipt_long</span>
</div>
<div class="mt-4">
<span class="font-display-lg text-headline-xl text-on-surface font-extrabold">3</span>
<span class="font-body-md text-body-md text-outline ml-1">contrats clôturés</span>
</div>
</div>
</div>
</div>
<!-- SEMI-TRANSPARENT BACKDROP OVERLAY -->
<div class="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-sm sm:p-space-md overflow-y-auto">
<!-- HIGH-FIDELITY MODAL (Max-width 640px) -->
<div class="relative w-full max-w-[640px] my-auto bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all" id="recharge-modal">
<!-- Modal Header -->
<div class="px-space-lg pt-space-lg pb-space-sm flex items-start justify-between bg-surface-container-lowest">
<div class="space-y-1">
<h2 class="font-headline-lg text-headline-lg text-on-surface font-extrabold">Recharger mon Portefeuille AutoLink</h2>
</div>
<button aria-label="Fermer la fenêtre" class="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<!-- Main Modal Body -->
<div class="px-space-lg py-space-sm space-y-space-md">
<!-- 1. Compte de debit -->
<div class="space-y-space-xs">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block">1. Choisissez votre compte de débit</label>
<div class="space-y-space-xs">
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-sm">
<div class="flex items-center gap-space-md flex-1">
<input checked="" class="w-5 h-5 accent-primary cursor-pointer" name="payment_method" type="radio" value="mtn"/>
<div class="w-12 h-10 rounded-lg bg-[#FFCC00] flex items-center justify-center font-headline-sm font-black text-on-surface shadow-sm tracking-tighter">MoMo</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">MTN Mobile Money</span>
</div>
</div>

</label>
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-sm">
<div class="flex items-center gap-space-md flex-1">
<input class="w-5 h-5 accent-primary cursor-pointer" name="payment_method" type="radio" value="orange"/>
<div class="w-12 h-10 rounded-lg bg-[#FF7900] flex items-center justify-center font-headline-sm font-black text-on-primary shadow-sm tracking-tighter">OM</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Orange Money Cameroun</span>
</div>
</div>
</label>
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-sm">
<div class="flex items-center gap-space-md flex-1">
<input class="w-5 h-5 accent-primary cursor-pointer" name="payment_method" type="radio" value="visa"/>
<div class="w-12 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shadow-sm">
<span class="material-symbols-outlined text-[24px]">credit_card</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Carte Visa UBA Cameroun</span>
</div>
</div>
</label>
</div>
</div>
<!-- Champ numero mobile (MoMo / OM) -->
<div class="space-y-2" id="phone-number-field">
<label class="font-label-md text-label-md text-on-surface font-semibold">Numéro de compte Mobile Money à débiter</label>
<div class="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 focus-within:bg-surface-container transition-all">
<div class="flex items-center gap-1.5 pr-3 bg-surface-container rounded-lg px-2 py-1 text-on-surface font-label-md text-label-md font-bold">
<span class="text-[16px]">🇨🇲</span>
<span>+237</span>
</div>
<input class="w-full bg-transparent px-3 text-on-surface font-headline-sm text-headline-sm font-bold tracking-wider outline-none placeholder:text-outline" placeholder="6XX XX XX XX" type="tel"/>
</div>
</div>
<!-- Champ numero de carte (visible si Visa) -->
<div class="space-y-2 hidden" id="card-number-field">
<label class="font-label-md text-label-md text-on-surface font-semibold">Numéro de carte bancaire à débiter</label>
<div class="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 focus-within:bg-surface-container transition-all">
<span class="material-symbols-outlined text-on-surface-variant text-[20px]">credit_card</span>
<input class="w-full bg-transparent px-3 text-on-surface font-headline-sm text-headline-sm font-bold tracking-wider outline-none placeholder:text-outline" placeholder="•••• •••• •••• 4129" type="text"/>
<span class="material-symbols-outlined text-outline text-[20px]">lock</span>
</div>
</div>
<!-- 2. Montant a crediter -->
<div class="space-y-space-xs">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block">2. Montant à créditer (FCFA)</label>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
<button class="amount-pill py-2.5 px-3 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" type="button">15 000</button>
<button class="amount-pill py-2.5 px-3 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" type="button">30 000</button>
<button class="amount-pill py-2.5 px-3 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" type="button">50 000</button>
<button class="amount-pill py-2.5 px-3 rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" type="button">100 000</button>
</div>
<div class="relative">
<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">Montant personnalisé :</span>
<input class="w-full pl-44 pr-16 py-3 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40" id="custom-amount-input" placeholder="0" type="number" value="0">
<span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">FCFA</span>
</div>
<button class="w-full inline-flex items-center justify-center gap-2.5 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all" type="button">
<span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
<span>Recharger maintenant</span>
</button>
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[18px]">info</span>
<span>Nouveau solde estimé : <strong class="text-on-surface" id="future-balance">56 500 FCFA</strong></span>
</div>
<span class="text-outline-variant font-label-sm text-label-sm">Validation par push USSD direct</span>
</div>
</div>
</div>
<!-- Modal Footer Action Buttons -->
<div class="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
<button class="w-full sm:w-auto px-space-md py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center" type="button">
          Annuler
        </button>
<button class="w-full sm:w-auto px-space-lg py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" type="button">
<span>Continuer vers la validation</span>
<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
<script>
  function selectAmount(amt) {
    document.getElementById('display-amount').textContent = amt;
    document.getElementById('cta-amount').textContent = amt;
    
    // Toggle active styles on pills
    const pills = document.querySelectorAll('.amount-pill');
    pills.forEach(pill => {
      if (pill.textContent.includes(amt)) {
        pill.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
        pill.classList.add('bg-primary', 'text-on-primary', 'font-bold');
      } else {
        pill.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
        pill.classList.remove('bg-primary', 'text-on-primary', 'font-bold');
      }
    });
  }
</script>`;
const LINKS = {
  'Recharger mon portefeuille': 'modal',
  'Annuler': 'close-modal',
};

export default function C5PortefeuilleEtCaution() {
  const { data } = useApiData(() => api.get('/payments/wallet/'), []);
  const [wdOpen, setWdOpen] = useState(false);
  const [wdMethod, setWdMethod] = useState('mtn');
  const [wdAmount, setWdAmount] = useState('');
  const [wdPhone, setWdPhone] = useState('');
  const [wdBusy, setWdBusy] = useState(false);
  const [wdErr, setWdErr] = useState('');
  const [wdOk, setWdOk] = useState('');
  const doWithdraw = () => {
    const amt = Number(wdAmount);
    if (!amt || amt < 500) { setWdErr('Montant minimum : 500 FCFA.'); return; }
    if (!wdPhone.trim()) { setWdErr(wdMethod === 'card' ? 'Indiquez le numéro de carte ou de compte.' : 'Indiquez le numéro à créditer.'); return; }
    setWdBusy(true); setWdErr('');
    withdrawalsAPI.create({ amount: amt, method: wdMethod, phone: wdPhone.trim() })
      .then(() => { setWdOpen(false); setWdOk(`${fmt(amt)} FCFA — demande de retrait enregistrée, en attente de traitement.`); setTimeout(() => window.location.reload(), 1200); })
      .catch((e) => { const d = e?.response?.data || {}; setWdErr([d.amount, d.phone, d.detail].flat().filter(Boolean)[0] || 'Impossible de traiter la demande.'); })
      .finally(() => setWdBusy(false));
  };
  const html = useMemo(() => {
    if (!data) return HTML;
    let h = HTML;
    const patch = (val, label) => {
      h = h.replace(new RegExp(`>([\\d\\s\\u00a0]+) <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>\\s*<span class="font-label-md text-label-md text-on-surface-variant mt-1">${label}<`, 'g'),
        `>${fmt(val)} <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span><span class="font-label-md text-label-md text-on-surface-variant mt-1">${label}<`);
    };
    patch(data.balance, 'Solde disponible');
    patch(data.held_deposit, 'Caution bloquée');
    patch(data.released_deposits, 'Cautions restituées');
    const txs = data.transactions || [];
    const reloaded = data.recharged_month ?? txs.filter((t) => t.kind === 'topup').reduce((a, t) => a + Number(t.amount || 0), 0);
    patch(reloaded, 'Rechargé');
    const rows = txs.length ? txs.map(txRow).join('')
      : '<tr><td class="py-10 px-4 text-center text-on-surface-variant" colspan="8">Aucune transaction pour le moment.</td></tr>';
    return h.replace(/<tbody[^>]*>[\s\S]*?<\/tbody>/, `<tbody>${rows}</tbody>`);
  }, [data]);

  React.useEffect(() => {
    const selBy = (pattern) => [...document.querySelectorAll('select')].find((x) => [...x.options].some((o) => pattern.test(o.textContent)))?.value || '';
    const apply = () => {
      const typeV = selBy(/Recharges|location|Top-ups|rental/i);
      const periodV = selBy(/derniers jours|Trimestre|days|quarter|year/i);
      const rows = [...document.querySelectorAll('.tx-row')];
      const kindMap = { caution_restituee: ['refund'], restituee: ['refund'], remboursement: ['refund'], refund: ['refund'], caution_bloquee: ['debit'], caution: ['debit'], blocked: ['debit'], recharge: ['topup'], topup: ['topup'], 'top-up': ['topup'], paiement: ['debit'], payment: ['debit'], debit: ['debit'], rental: ['debit'] };
      const key = Object.keys(kindMap).find((k) => (typeV || '').toLowerCase().includes(k));
      const now = new Date();
      const matched = [];
      const isAll = (v) => /^(tous|toutes|all|tout)\b/i.test((v || '').trim());
      const q = ([...document.querySelectorAll('input')].find((i) => /recherch|search|dossier|file|recherche|filtrer|référence|libellé|filter|reference|label/i.test(i.placeholder || ''))?.value || '').toLowerCase();
      rows.forEach((r) => {
        const d = new Date(r.dataset.date || 0);
        const okT = !key || kindMap[key].includes(r.dataset.kind);
        const okQ = !q || r.textContent.toLowerCase().includes(q);
        const okP = !periodV || isAll(periodV)
          || (/30|derniers|days/i.test(periodV) && d >= new Date(now.getTime() - 30 * 864e5))
          || (periodV === 't3' && d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3))
          || (/ann[eé]e|year/i.test(periodV) && d.getFullYear() === now.getFullYear());
        const ok = okT && okP && okQ;
        r.dataset.match = ok ? '1' : '0';
        if (ok) matched.push(r);
      });
      const perPage = 8;
      const maxPage = Math.max(1, Math.ceil(matched.length / perPage));
      window._wPage = Math.min(Math.max(1, window._wPage || 1), maxPage);
      rows.forEach((r) => { if (r.dataset.match !== '1') r.style.display = 'none'; });
      matched.forEach((r, i) => { r.style.display = (i >= (window._wPage - 1) * perPage && i < window._wPage * perPage) ? '' : 'none'; });
      const info = [...document.querySelectorAll('strong')].find((x) => x.parentElement?.textContent.includes('opérations'));
      if (info) info.parentElement.innerHTML = `Affichage de <strong class="text-on-surface">${matched.length ? (window._wPage - 1) * perPage + 1 : 0} à ${Math.min(matched.length, window._wPage * perPage)}</strong> sur <strong class="text-on-surface">${matched.length}</strong> opérations`;
      document.querySelectorAll('button').forEach((x) => {
        const t = x.textContent.trim();
        if (t === 'Précédent') { x.disabled = window._wPage <= 1; x.style.opacity = x.disabled ? '.4' : '1'; }
        if (t === 'Suivant') { x.disabled = window._wPage >= maxPage; x.style.opacity = x.disabled ? '.4' : '1'; }
        if (/^\d+$/.test(t)) { x.style.display = Number(t) <= maxPage ? '' : 'none'; x.style.fontWeight = Number(t) === window._wPage ? '700' : '400'; }
      });
    };
    const click = (e) => {
      const el = e.target.closest('button, a');
      if (!el) return;
      if (el.closest('#btn-withdraw')) { e.preventDefault(); setWdOpen(true); return; }
      const t = el.textContent.replace(/\s+/g, ' ').trim();
      if (t === 'Précédent' || t === 'Suivant' || /^\d+$/.test(t)) {
        const rows = [...document.querySelectorAll('.tx-row[data-match="1"]')];
        const maxPage = Math.max(1, Math.ceil(rows.length / 8));
        if (t === 'Précédent') window._wPage = Math.max(1, (window._wPage || 1) - 1);
        else if (t === 'Suivant') window._wPage = Math.min(maxPage, (window._wPage || 1) + 1);
        else window._wPage = Number(t);
        apply(); return;
      }
      if (t.includes('Exporter CSV')) {
        e.preventDefault();
        const rows = [...document.querySelectorAll('.tx-row')].filter((r) => r.style.display !== 'none');
        const csv = ['Date;Type;Référence;Libellé;Moyen;Montant;Statut',
          ...rows.map((r) => [...r.cells].slice(0, 7).map((c) => `"${c.textContent.replace(/\s+/g, ' ').trim().replace(/"/g, '""')}"`).join(';'))].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        a.download = 'transactions-autolink.csv'; a.click(); return;
      }
      if (t.includes('Relevé PDF')) { e.preventDefault(); window.print(); return; }
      const rec = el.closest('.tx-receipt');
      if (rec) {
        const m = (rec.dataset.ref || '').match(/\d+/);
        if (m) window.location.href = `/client/bookings/${Number(m[0])}`;
      }
    };
    window._wPage = 1;
    document.addEventListener('click', click);
    document.addEventListener('change', apply);
    document.addEventListener('input', apply);
    // Ecouteur direct sur le champ recherche (secours si delegation ne remonte pas)
    const searchIn = [...document.querySelectorAll('input')].find((i) => /filtrer|référence|libellé|recherch|search|dossier|filter|reference|label/i.test(i.placeholder || ''));
    if (searchIn) searchIn.addEventListener('input', apply);
    apply();
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('change', apply);
      document.removeEventListener('input', apply);
      if (searchIn) searchIn.removeEventListener('input', apply);
    };
  }, [data]);

  return (
    <>
      <DesignPage html={html} links={LINKS} modalHtml={MODAL} />
      {wdOk && <div role="status" className="fixed bottom-4 right-4 z-[95] px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md shadow-lg">{wdOk}</div>}
      {wdOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="wd-title" onClick={(e) => { if (e.target === e.currentTarget) setWdOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl">
            <h2 id="wd-title" className="font-headline-md text-headline-md text-on-surface font-bold">Retirer des fonds</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Solde disponible : <strong>{fmt(data?.balance)} FCFA</strong> — le montant sera transféré après validation par l'équipe AutoLink.</p>
            <div className="flex flex-col gap-2">
              {[['mtn', 'MTN MoMo'], ['orange', 'Orange Money'], ['card', 'Carte bancaire / Compte bancaire']].map(([k, label]) => (
                <button key={k} type="button" onClick={() => setWdMethod(k)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${wdMethod === k ? 'bg-primary/10 ring-2 ring-primary' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                  <span className="material-symbols-outlined text-primary text-[20px]">{k === 'card' ? 'credit_card' : 'phone_iphone'}</span>
                  <span className="font-label-md text-label-md text-on-surface">{label}</span>
                  {wdMethod === k && <span className="material-symbols-outlined text-primary text-[18px] ml-auto">check_circle</span>}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">Montant (FCFA)
              <input type="number" min="500" step="1" value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} placeholder="Ex : 25 000"
                className="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">{wdMethod === 'card' ? 'Numéro de carte ou de compte' : 'Numéro à créditer'}
              <input type="text" value={wdPhone} onChange={(e) => setWdPhone(e.target.value)} placeholder={wdMethod === 'card' ? 'Ex : 4021 76•• •••• 9010' : '+237 6XX XX XX XX'}
                className="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" />
            </label>
            {wdErr && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{wdErr}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setWdOpen(false)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
              <button type="button" onClick={doWithdraw} disabled={wdBusy} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{wdBusy ? 'Envoi…' : 'Confirmer le retrait'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
