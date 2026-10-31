import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full">
<div class="flex flex-col gap-8 pb-12 max-w-[1360px] mx-auto w-full">
<!-- En-tête de page & Actions principales -->
<div class="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-4">
<div class="flex flex-col gap-2 max-w-2xl">
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Espace Sécurisé CEMAC / GIMAC
          </span>
<span class="text-outline-variant">•</span>
<span class="text-on-surface-variant font-label-sm text-label-sm">ID Client: #CM-DLA-88219</span>
</div>
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
<button class="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg shadow-sm transition-colors" type="button">
<span class="material-symbols-outlined text-secondary text-[20px]">download</span>
<span class="">Télécharger le relevé (PDF / Excel)</span>
</button>
</div>
</div>
<!-- Bannière de réassurance CEMAC -->
<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low shadow-sm">
<div class="flex items-center gap-3.5">
<div class="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-primary text-[22px]">verified_user</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface text-[15px]">Garantie Réglementaire Séquestre CEMAC</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Les fonds de caution ne sont jamais encaissés par les bailleurs, mais isolés sous compte fiduciaire séquestré agréé COBAC.</span>
</div>
</div>
<div class="flex items-center gap-2 shrink-0">
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-primary">lock</span>
          Chiffrement 256-bit
        </span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-tertiary">account_balance</span>
          Audité BEAC / GIMAC
        </span>
</div>
</div>
<!-- 3 Cartes Financières Principales (Overview) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
<!-- Carte 1: Solde disponible (Teal Accent) -->
<div class="lg:col-span-4 relative overflow-hidden rounded-xl bg-primary text-on-primary p-6 shadow-md flex flex-col justify-between min-h-[220px]">
<div class="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-primary-fixed-dim/20 pointer-events-none blur-2xl"></div>
<div class="flex flex-col gap-2 relative z-10">
<div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm uppercase tracking-wider text-primary-fixed opacity-90">Solde disponible</span>
<span class="p-1.5 rounded-full bg-primary-container text-on-primary-container">
<span class="material-symbols-outlined text-[18px]">account_balance_wallet</span>
</span>
</div>
<div class="flex items-baseline gap-2 mt-1">
<span class="text-display-lg font-display-lg text-on-primary tracking-tight">26 500</span>
<span class="text-headline-md font-headline-md text-primary-fixed">FCFA</span>
</div>
<p class="text-body-sm font-body-sm text-primary-fixed-dim mt-0.5">
            Immédiatement utilisable pour vos locations, carburant et options de mobilité.
          </p>
</div>
<div class="pt-5 mt-4 relative z-10">
<button class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all" onclick="document.getElementById('quick-reload-panel').scrollIntoView({ behavior: 'smooth' })" type="button">
<span class="material-symbols-outlined text-[18px]">bolt</span>
<span class="">Recharger via MoMo / OM / Carte</span>
</button>
</div>
</div>
<!-- Carte 2: Caution sous séquestre (Midnight / Inverse-Surface) -->
<div class="lg:col-span-5 relative overflow-hidden rounded-xl bg-inverse-surface text-inverse-on-surface p-6 shadow-md flex flex-col justify-between min-h-[220px]">
<div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-secondary-fixed-dim/10 pointer-events-none blur-3xl"></div>
<div class="flex flex-col gap-2 relative z-10">
<div class="flex items-center justify-between">
<div class="flex items-center gap-2">
<span class="text-label-sm font-label-sm uppercase tracking-wider text-secondary-fixed">Caution bloquée sous séquestre</span>
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-inverse-on-surface text-[10px] font-label-sm">
<span class="material-symbols-outlined text-[12px]">verified</span>
                Tiers agréé CEMAC
              </span>
</div>
<span class="p-1.5 rounded-full bg-surface-container-high/15 text-tertiary-fixed">
<span class="material-symbols-outlined text-[18px]">lock_clock</span>
</span>
</div>
<div class="flex items-baseline gap-2 mt-1">
<span class="text-display-lg font-display-lg text-inverse-on-surface tracking-tight">150 000</span>
<span class="text-headline-md font-headline-md text-secondary-fixed">FCFA</span>
</div>
<div class="flex flex-col gap-1.5 mt-1 bg-surface-container-high/10 p-2.5 rounded-lg">
<div class="flex items-center justify-between text-body-sm font-body-sm">
<span class="text-inverse-on-surface flex items-center gap-1.5">
<span class="material-symbols-outlined text-[16px] text-tertiary-fixed">directions_car</span>
                Toyota RAV4 AWD (#ALP-2025-DLA-8924)
              </span>
<span class="text-tertiary-fixed font-label-sm text-label-sm">En cours</span>
</div>
<div class="flex items-center gap-1 text-[11px] font-label-sm text-outline-variant">
<span class="material-symbols-outlined text-[14px] text-primary-fixed-dim">schedule</span>
              Déblocage automatique sous 15 min après retour sans dommage.
            </div>
</div>
</div>
<div class="flex items-center justify-between pt-4 mt-3 text-body-sm font-body-sm">
<span class="text-outline-variant">Caution restituable dès clôture</span>
<a class="inline-flex items-center gap-1 text-primary-fixed-dim hover:text-primary-fixed font-label-sm text-label-sm transition-colors" href="#">
<span class="">Voir l'acte de séquestre</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
</a>
</div>
</div>
<!-- Carte 3: Statistiques cumulées & Confiance -->
<div class="lg:col-span-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between">
<span class="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">Performances du compte</span>
<span class="p-1 rounded bg-surface-container text-primary">
<span class="material-symbols-outlined text-[18px]">query_stats</span>
</span>
</div>
<div class="flex flex-col gap-3">
<div class="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
<div class="flex flex-col">
<span class="text-label-sm font-label-sm text-on-surface-variant">Total rechargé ce mois</span>
<span class="text-headline-sm font-headline-sm text-on-surface">110 000 FCFA</span>
</div>
<span class="material-symbols-outlined text-primary text-[20px]">trending_up</span>
</div>
<div class="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low">
<div class="flex flex-col">
<div class="flex items-center gap-1">
<span class="text-label-sm font-label-sm text-on-surface-variant">Cautions restituées</span>
<span class="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-label-sm">100%</span>
</div>
<span class="text-headline-sm font-headline-sm text-on-surface">450 000 FCFA</span>
</div>
<div class="flex flex-col items-end">
<span class="text-label-sm font-label-sm text-primary">0 litige</span>
<span class="text-[11px] text-on-surface-variant">4 locations</span>
</div>
</div>
</div>
</div>
<div class="pt-3 flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-primary text-[16px]">sentiment_very_satisfied</span>
<span class="">Score de fiabilité locataire : <strong>100 / 100</strong></span>
</div>
</div>
</div>
<!-- Section Recharge Express en 1 clic -->
<div class="rounded-2xl bg-surface-container-lowest p-6 md:p-8 shadow-sm flex flex-col gap-6" id="quick-reload-panel">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-[24px]">flash_on</span>
</div>
<div class="flex flex-col">
<h2 class="text-headline-sm font-headline-sm text-on-surface">Recharge express en 1 clic</h2>
<p class="text-body-sm font-body-sm text-on-surface-variant">Créditation instantanée 24h/7j sans déplacement d'agence.</p>
</div>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px]">savings</span>
            0% de frais sur tous les rechargements
          </span>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
<!-- Sélection du Moyen de paiement -->
<div class="lg:col-span-5 flex flex-col gap-3">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            1. Choisissez votre compte de débit
          </label>
<div class="flex flex-col gap-2.5" id="payment-method-selector">
<!-- MTN MoMo -->
<label class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all shadow-sm">
<div class="flex items-center gap-3">
<input checked="" class="w-4 h-4 accent-primary cursor-pointer" name="payment_method" type="radio" value="mtn">
<div class="w-9 h-9 rounded-lg bg-[#FFCC00] text-black font-headline-sm text-[11px] flex items-center justify-center font-bold shadow-sm">
                  MoMo
                </div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface">MTN Mobile Money</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">+237 670 •• •• 89</span>
</div>
</div>
<span class="px-2 py-0.5 rounded bg-primary/15 text-primary text-[11px] font-label-sm">Par défaut</span>
</label>
<!-- Orange Money -->
<label class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all shadow-sm">
<div class="flex items-center gap-3">
<input class="w-4 h-4 accent-primary cursor-pointer" name="payment_method" type="radio" value="om">
<div class="w-9 h-9 rounded-lg bg-[#FF7900] text-white font-headline-sm text-[12px] flex items-center justify-center font-bold shadow-sm">
                  OM
                </div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface">Orange Money Cameroun</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">+237 699 •• •• 42</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant text-[20px]">check_circle</span>
</label>
<!-- Carte bancaire UBA/Visa -->
<label class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all shadow-sm">
<div class="flex items-center gap-3">
<input class="w-4 h-4 accent-primary cursor-pointer" name="payment_method" type="radio" value="visa">
<div class="w-9 h-9 rounded-lg bg-surface-container-highest text-on-surface font-headline-sm text-[12px] flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[20px] text-secondary">credit_card</span>
</div>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface">Carte Visa UBA Cameroun</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Expire 08/28 (•••• 4129)</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant text-[20px]">lock</span>
</label>
</div>
</div>
<!-- Sélection du Montant & Confirmation -->
<div class="lg:col-span-7 flex flex-col gap-4">
<label class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            2. Montant à créditer (FCFA)
          </label>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="amount-presets">
<button class="amount-btn py-3 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm text-center transition-all border border-outline-variant/40" onclick="selectAmount(15000, this)" type="button">
              +15 000
            </button>
<button class="amount-btn py-3 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm text-center transition-all border border-outline-variant/40" onclick="selectAmount(30000, this)" type="button">
              +30 000
            </button>
<button class="amount-btn py-3 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm text-center transition-all border border-outline-variant/40" onclick="selectAmount(50000, this)" type="button">
              +50 000
            </button>
<button class="amount-btn py-3 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-headline-sm text-headline-sm text-center transition-all border border-outline-variant/40" onclick="selectAmount(100000, this)" type="button">
              +100 000
            </button>
</div>
<div class="flex flex-col sm:flex-row gap-3 items-center">
<div class="relative w-full">
<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">Montant personnalisé :</span>
<input class="w-full pl-44 pr-16 py-3 rounded-xl bg-surface-container-low text-on-surface font-headline-sm text-headline-sm outline-none focus:ring-2 focus:ring-primary border border-outline-variant/40" id="custom-amount-input" placeholder="ex: 75000" type="number" value="0">
<span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md text-label-md">FCFA</span>
</div>
<button class="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]" id="confirm-recharge-btn" type="button">
<span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
<span class="">Recharger maintenant</span>
</button>
</div>
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low text-body-sm font-body-sm text-on-surface-variant">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[18px]">info</span>
<span class="">Nouveau solde estimé : <strong class="text-on-surface font-headline-sm text-headline-sm" id="future-balance">56 500 FCFA</strong></span>
</div>
<span class="text-outline-variant font-label-sm text-label-sm">Validation par push USSD direct</span>
</div>
</div>
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
<option value="t3">Trimestre 3 (2025)</option>
<option value="y2025">Année complète 2025</option>
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
<!-- Bannière / Footer de réassurance et d'audit -->
<div class="rounded-xl bg-surface-container p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[28px]">shield</span>
</div>
<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface text-[16px]">Fonds garantis et réglementés CEMAC</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">
            Vos fonds sont protégés et audités selon les normes financières CEMAC et GIMAC Afrique Centrale. Hotline portefeuille dédiée 24/7 au <strong>(+237) 670 00 24 24</strong>.
          </p>
</div>
</div>
<div class="flex items-center gap-3 shrink-0">
<a class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm shadow-sm transition-colors" href="#">
<span class="material-symbols-outlined text-[16px] text-primary">headset_mic</span>
<span class="">Support Portefeuille</span>
</a>
<a class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm text-label-sm shadow-sm transition-colors" href="#">
<span class="material-symbols-outlined text-[16px] text-secondary">policy</span>
<span class="">Charte de Séquestre</span>
</a>
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
    futureBalanceSpan.innerText = total.toLocaleString('fr-FR') + ' FCFA';
  }

  // Écoute de l'input manuel
  const customInput = document.getElementById('custom-amount-input');
  if (customInput) {
    customInput.addEventListener('input', function(e) {
      const val = parseInt(e.target.value, 10) || 0;
      const baseBalance = 26500;
      const total = baseBalance + val;
      const futureBalanceSpan = document.getElementById('future-balance');
      futureBalanceSpan.innerText = total.toLocaleString('fr-FR') + ' FCFA';
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
<div class="flex items-center gap-2">
<span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Transaction Cryptée 256-bit</span>
</div>
<h2 class="font-headline-lg text-headline-lg text-on-surface font-extrabold">Recharger mon Portefeuille AutoLink</h2>
</div>
<button aria-label="Fermer la fenêtre" class="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" type="button">
<span class="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<!-- 3-Step Stepper Component -->
<div class="px-space-lg py-space-sm">
<div class="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between">
<!-- Step 1: Montant (Completed) -->
<div class="flex items-center gap-2 flex-1">
<div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-outline">Étape 1</span>
<span class="font-label-md text-label-md text-on-surface font-bold">Montant</span>
</div>
</div>
<div class="w-8 h-[2px] bg-primary rounded-full mx-1"></div>
<!-- Step 2: Moyen de paiement (Active) -->
<div class="flex items-center gap-2 flex-1 px-1">
<div class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
<span class="font-label-sm text-label-sm font-bold">2</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-primary font-bold">Actuelle</span>
<span class="font-label-md text-label-md text-primary font-bold">Paiement</span>
</div>
</div>
<div class="w-8 h-[2px] bg-surface-container-highest rounded-full mx-1"></div>
<!-- Step 3: Validation USSD / OTP (Upcoming) -->
<div class="flex items-center gap-2 flex-1 justify-end opacity-60">
<div class="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
<span class="font-label-sm text-label-sm font-bold">3</span>
</div>
<div class="flex flex-col text-right">
<span class="font-label-sm text-label-sm text-outline">Étape 3</span>
<span class="font-label-md text-label-md text-on-surface">USSD / OTP</span>
</div>
</div>
</div>
</div>
<!-- Main Modal Body -->
<div class="px-space-lg py-space-sm space-y-space-md">
<!-- Selected Amount Recap & Quick Selector Tag Row -->
<div class="bg-surface-container-low p-space-md rounded-xl space-y-space-sm">
<div class="flex flex-wrap items-baseline justify-between gap-2">
<span class="font-body-md text-body-md text-on-surface-variant">Montant à créditer instantanément :</span>
<div class="flex items-baseline gap-1">
<span class="font-headline-xl text-headline-xl font-extrabold text-on-surface tracking-tight" id="display-amount">25 000</span>
<span class="font-label-lg text-label-lg font-bold text-primary">FCFA</span>
</div>
</div>
<!-- Quick Amount Pill Selectors -->
<div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
<button class="amount-pill px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" onclick="selectAmount('5 000')" type="button">
              5 000 FCFA
            </button>
<button class="amount-pill px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" onclick="selectAmount('10 000')" type="button">
              10 000 FCFA
            </button>
<button class="amount-pill px-3 py-1 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm font-bold" onclick="selectAmount('25 000')" type="button">
              25 000 FCFA
            </button>
<button class="amount-pill px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" onclick="selectAmount('50 000')" type="button">
              50 000 FCFA
            </button>
<button class="amount-pill px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm" onclick="selectAmount('100 000')" type="button">
              Autre montant
            </button>
</div>
<div class="flex items-center gap-1.5 pt-1 text-primary">
<span class="material-symbols-outlined text-[16px]">bolt</span>
<span class="font-label-sm text-label-sm font-semibold">0% de frais de transaction · Crédit immédiat 24h/24 & 7j/7</span>
</div>
</div>
<!-- Payment Method Options -->
<div class="space-y-space-xs">
<label class="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider block">
            Sélectionnez votre moyen de paiement au Cameroun
          </label>
<div class="space-y-space-xs">
<!-- Card 1: MTN Mobile Money (Selected) -->
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group">
<div class="flex items-center gap-space-md">
<input checked="" class="w-5 h-5 text-primary accent-primary cursor-pointer" name="payment_method" type="radio" value="mtn"/>
<!-- MTN MoMo Visual Badge -->
<div class="w-12 h-10 rounded-lg bg-[#FFCC00] flex items-center justify-center font-headline-sm font-black text-on-surface shadow-sm tracking-tighter">
                  MoMo
                </div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">MTN Mobile Money</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-bold">Instantané</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Cameroun (+237) · Frais opérateur pris en charge</span>
</div>
</div>
<div class="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
</label>
<!-- Card 2: Orange Money -->
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group">
<div class="flex items-center gap-space-md">
<input class="w-5 h-5 text-primary accent-primary cursor-pointer" name="payment_method" type="radio" value="orange"/>
<!-- Orange Money Visual Badge -->
<div class="w-12 h-10 rounded-lg bg-[#FF7900] flex items-center justify-center font-headline-sm font-black text-on-primary shadow-sm tracking-tighter">
                  OM
                </div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Orange Money Cameroun</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-bold">Instantané</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Orange Cameroun (+237) · Code direct #150#</span>
</div>
</div>
<span class="material-symbols-outlined text-outline text-[20px] opacity-40 group-hover:opacity-100">radio_button_unchecked</span>
</label>
<!-- Card 3: Carte Bancaire Visa / Mastercard -->
<label class="relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-all cursor-pointer shadow-sm group">
<div class="flex items-center gap-space-md">
<input class="w-5 h-5 text-primary accent-primary cursor-pointer" name="payment_method" type="radio" value="card"/>
<!-- Card Visual Badge -->
<div class="w-12 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary font-bold shadow-sm">
<span class="material-symbols-outlined text-[24px]">credit_card</span>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Carte Bancaire / UBA / Ecobank</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary font-bold">3D-Secure</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Visa, Mastercard émises en zone CEMAC & International</span>
</div>
</div>
<span class="material-symbols-outlined text-outline text-[20px] opacity-40 group-hover:opacity-100">radio_button_unchecked</span>
</label>
</div>
</div>
<!-- Phone Number Field Section -->
<div class="space-y-2 pt-1">
<label class="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
<span>Numéro de compte Mobile Money à débiter</span>
<span class="font-label-sm text-label-sm text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">shield</span>
              Authentification MTN MoMo
            </span>
</label>
<div class="flex items-center bg-surface-container-low rounded-xl px-3 py-2.5 focus-within:bg-surface-container transition-all">
<div class="flex items-center gap-1.5 pr-3 bg-surface-container rounded-lg px-2 py-1 text-on-surface font-label-md text-label-md font-bold">
<span class="text-[16px]">🇨🇲</span>
<span>+237</span>
</div>
<input class="w-full bg-transparent px-3 text-on-surface font-headline-sm text-headline-sm font-bold tracking-wider outline-none placeholder:text-outline" placeholder="6XX XX XX XX" type="tel" value="670 42 18 90"/>
<span class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
</div>
<!-- Use Registered Phone Checkbox -->
<label class="flex items-center gap-2.5 pt-1 cursor-pointer">
<input checked="" class="w-4 h-4 rounded text-primary accent-primary cursor-pointer" type="checkbox"/>
<span class="font-body-sm text-body-sm text-on-surface">
              Utiliser mon numéro enregistré de profil (<strong class="font-bold text-on-surface">+237 670 42 18 90</strong> · Emmanuel K.)
            </span>
</label>
</div>
<!-- Security & GIMAC/CEMAC Reassurance Notice -->
<div class="p-space-sm rounded-xl bg-surface-container flex items-start gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm mt-0.5">
<span class="material-symbols-outlined text-[18px]">verified</span>
</div>
<div class="space-y-0.5">
<span class="font-label-md text-label-md text-on-surface font-bold">Garantie d'autorisation CEMAC / GIMAC</span>
<p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Vous recevrez immédiatement un prompt USSD sur votre écran de téléphone pour valider votre code secret personnel. Ne partagez jamais votre code PIN.
            </p>
</div>
</div>
</div>
<!-- Modal Footer Action Buttons -->
<div class="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
<button class="w-full sm:w-auto px-space-md py-3 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors flex items-center justify-center" type="button">
          Annuler
        </button>
<button class="w-full sm:w-auto px-space-lg py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2" type="button">
<span>Continuer vers la validation (<span id="cta-amount">25 000</span> FCFA)</span>
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
  'Recharger maintenant': 'modal',
  'Recharger mon portefeuille': 'modal',
  'Recharger via MoMo / OM / Carte': 'modal',
  "Voir l'acte de séquestre": '/client/bookings/1',
  'Support Portefeuille': '/help',
  'Charte de Séquestre': '/help',
  'Annuler': 'close-modal',
};

export default function c5portefeuilleetcaution() {
  return <DesignPage html={HTML} links={LINKS} modalHtml={MODAL} />;
}
