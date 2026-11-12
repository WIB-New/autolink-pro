import React, { useMemo } from 'react';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { bookingsAPI, authAPI, walletAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));

const HTML = `<div class="w-full px-gutter py-space-lg flex flex-col gap-space-lg">
<!-- Header Greeting & Action Bar -->
<div class="flex flex-col gap-space-xs">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Bienvenue, Emmanuel!</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant">Ravi de vous revoir sur votre espace AutoLink Pro.</p>
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
<span class="font-label-md text-label-md text-on-surface-variant mt-1">Votre score de confiance</span>
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
<span class="font-headline-sm text-headline-sm font-bold text-on-surface">Votre score de confiance</span>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">military_tech</span>Top 5 %</span>
</div>
<svg class="w-full h-24" viewBox="0 0 300 80" preserveAspectRatio="none">
<polyline points="0,65 50,60 100,62 150,45 200,40 250,30 300,15" fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="300" cy="15" r="5" fill="#0d9488" stroke="#fff" stroke-width="2"/>
</svg>
<div class="flex items-end justify-between pt-space-sm border-t border-outline-variant/30">
<div class="flex flex-col"><span class="font-label-sm text-label-sm text-on-surface-variant">Note des propriétaires</span><span class="font-headline-lg text-headline-lg font-bold text-on-surface">4.9 / 5</span></div>
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
<button class="w-full inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all" title="Télécharger le relevé des factures (PDF)" data-tip="Télécharger le relevé des factures (PDF)" type="button">
<span class="material-symbols-outlined text-[20px] text-secondary">download</span>
<span>Factures</span>
</button>
</div>
</div>
</div>`;
const LINKS = {
  'Rechercher un véhicule': '/client/search',
  'Recharger mon portefeuille': '/client/wallet?recharge=1',
};

export default function C1TableauDeBordClient() {
  const { data: d } = useApiData(() => bookingsAPI.clientDashboard(), []);
  const { data: me } = useApiData(() => authAPI.me(), []);
  const html = useMemo(() => {
    const name = (me?.first_name || me?.username || '').trim() || 'Client';
    let h = HTML.replace('Bienvenue, Emmanuel!', `Bienvenue, ${name}!`);
    if (d) {
      h = h
        .replace('>45 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Solde disponible<', `>${fmt(d.balance)} <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Solde disponible<`)
        .replace('>6</span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Locations<', `>${fmt(d.bookings_total)}</span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Locations<`)
        .replace('>150 000 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Caution bloquée<', `>${fmt(d.held_deposit)} <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">FCFA</span></span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Caution bloquée<`)
        .replace('>4.9</span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Votre score de confiance<', `>${d.trust_score}</span>\n<span class="font-label-md text-label-md text-on-surface-variant mt-1">Votre score de confiance<`);

      // --- Graphique dépenses : courbe réelle sur 6 mois ---
      const MN = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const now = new Date();
      const monthly = Array.isArray(d.monthly) ? d.monthly : [];
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const ref = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const found = monthly.find((m) => new Date(m.month).getMonth() === ref.getMonth() && new Date(m.month).getFullYear() === ref.getFullYear());
        return { label: MN[ref.getMonth()], total: Number(found?.total || 0), count: Number(found?.count || 0) };
      });
      const maxT = Math.max(1, ...last6.map((m) => m.total));
      const maxC = Math.max(1, ...last6.map((m) => m.count));
      const step = 600 / Math.max(1, last6.length - 1);
      const pts = last6.map((m, i) => `${Math.round(i * step)},${Math.round(150 - (m.total / maxT) * 110)}`).join(' ');
      const dots = last6.map((m, i) => (m.total > 0
        ? `<circle cx="${Math.round(i * step)}" cy="${Math.round(150 - (m.total / maxT) * 110)}" r="7" fill="#0d9488" stroke="#fff" stroke-width="2" data-tip="${m.label} : ${fmt(m.total)} FCFA" style="cursor:pointer;animation:dp-fade .4s ease-out ${0.3 + i * 0.1}s both"></circle>`
        : '')).join('');
      h = h
        .replace(/<polyline points="[^"]+" fill="url\(#gDep\)" stroke="none"\/>/, `<polyline points="${pts} 600,180 0,180" fill="url(#gDep)" stroke="none" style="animation:dp-fade 1.4s ease-out .5s both"/>`)
        .replace(/<polyline points="[^"]+" fill="none" stroke="#0d9488" stroke-width="3"[^/]*\/>/, `<polyline points="${pts}" fill="none" stroke="#0d9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:900;stroke-dashoffset:900;animation:dp-draw 1.4s ease-out forwards"/>`)
        .replace(/<polyline points="[^"]+" fill="url\(#gRec\)" stroke="none"\/>/, '')
        .replace(/<polyline points="[^"]+" fill="none" stroke="#b45309"[^/]*\/>/, '')
        .replace(/<circle cx="500" cy="60"[^/]*\/>\s*<circle cx="600" cy="45"[^/]*\/>/, dots)
        .replace('</svg>\n<div class="flex justify-between px-1 font-label-sm text-[11px] text-on-surface-variant">',
          '</svg>\n<style>@keyframes dp-draw{to{stroke-dashoffset:0}}@keyframes dp-fade{from{opacity:0}to{opacity:1}}@keyframes dp-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes dp-spin{from{transform:rotate(-90deg) scale(.8);opacity:0}to{transform:rotate(0) scale(1);opacity:1}}</style>\n<div class="flex justify-between px-1 font-label-sm text-[11px] text-on-surface-variant">')
        .replace(/<span>Mai<\/span><span>Juin<\/span><span>Juil<\/span><span>Ao.t<\/span><span>Sept<\/span><span>Oct<\/span>/, last6.map((m) => `<span>${m.label}</span>`).join(''))
        .replace('485 000 FCFA', `${fmt(last6.reduce((a, m) => a + m.total, 0))} FCFA`)
        .replace('<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span>Recharges</span>', '')
        .replace('+38 % vs N-1', `${d.upcoming || 0} à venir`)
        .replace(/<span class="inline-flex items-center gap-1 px-2\.5 py-1 rounded-full bg-tertiary-fixed[^>]*>.*?Top 5 %<\/span>/,
                 `<span class="font-label-sm text-label-sm text-primary font-bold">${d.completed || 0} terminée${(d.completed || 0) > 1 ? 's' : ''}</span>`);

      // --- Barres : locations par mois ---
      const bars = last6.map((m, i) => `<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[34px] ${m.count === maxC && m.count > 0 ? 'bg-primary' : 'bg-secondary-container'} rounded-t-md" data-tip="${m.label} : ${m.count} location${m.count > 1 ? 's' : ''}" style="height:${Math.max(10, Math.round((m.count / maxC) * 110))}px;cursor:pointer;transform-origin:bottom;animation:dp-grow .7s ease-out ${i * 0.08}s both"></div><span class="font-label-sm text-[11px] ${m.count === maxC && m.count > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}">${m.label}</span></div>`).join('');
      h = h.replace(/<div class="flex-1 flex items-end justify-between gap-3 px-1 min-h-\[130px\]">[\s\S]*?<\/div>\n<div class="pt-space-sm border-t/,
        `<div class="flex-1 flex items-end justify-between gap-3 px-1 min-h-[130px]">${bars}</div>\n<div class="pt-space-sm border-t`)
        .replace(/6 locations en octobre . record personnel/, `${d.bookings_total} location${d.bookings_total > 1 ? 's' : ''} au total`);

      // --- Donut types de locations ---
      const split = Array.isArray(d.driver_split) ? d.driver_split : [];
      const totalB = Math.max(1, split.reduce((a, s) => a + (s.count || 0), 0));
      const cat = (k) => split.find((s) => s.driver_type === k)?.count || 0;
      const pNo = Math.round((cat('none') / totalB) * 100);
      const pInt = Math.round((cat('internal') / totalB) * 100);
      const pOwn = Math.max(0, 100 - pNo - pInt);
      h = h
        .replace(/class="relative w-32 h-32 rounded-full" style="background: conic-gradient[^"]*"/, `class="relative w-32 h-32 rounded-full" data-tip="Sans chauffeur ${pNo}% · AutoLink ${pInt}% · Proprio ${pOwn}%" style="background: conic-gradient(#0d9488 0 ${pNo}%, #b45309 ${pNo}% ${pNo + pInt}%, #64748b ${pNo + pInt}% 100%);animation:dp-spin .9s ease-out both;transform-origin:center;cursor:pointer"`)
        .replace(/>12<\/span>\s*<span class="font-label-sm text-label-sm text-on-surface-variant mt-1">trajets</, `>${totalB}</span><span class="font-label-sm text-label-sm text-on-surface-variant mt-1">trajets<`)
        .replace('Trajets urbains</span><span class="font-label-md text-label-md font-bold text-on-surface">55%', `Sans chauffeur</span><span class="font-label-md text-label-md font-bold text-on-surface">${pNo}%`)
        .replace('Interurbains</span><span class="font-label-md text-label-md font-bold text-on-surface">25%', `Chauffeur AutoLink</span><span class="font-label-md text-label-md font-bold text-on-surface">${pInt}%`)
        .replace('Avec chauffeur</span><span class="font-label-md text-label-md font-bold text-on-surface">20%', `Chauffeur proprio</span><span class="font-label-md text-label-md font-bold text-on-surface">${pOwn}%`)
        .replace('4.9 / 5', `${Number(d.average_rating || 0).toFixed(1)} / 5`)
        .replace('Annulations</span><span class="font-label-lg text-label-lg font-bold text-primary">0</span>', `Annulations</span><span class="font-label-lg text-label-lg font-bold text-primary">${d.cancelled || 0}</span>`)
        // Sparkline → vraie jauge du score de confiance
        .replace(/<svg class="w-full h-24" viewBox="0 0 300 80" preserveAspectRatio="none">[\s\S]*?<\/svg>/,
          `<div class="flex flex-col gap-2 py-4"><div class="w-full h-4 rounded-full bg-surface-container overflow-hidden"><div class="h-full rounded-full bg-primary transition-all" style="width:${Math.min(100, Math.max(0, d.trust_score || 0))}%;"></div></div><div class="flex justify-between font-label-sm text-[11px] text-on-surface-variant"><span>0</span><span>${d.trust_score} / 100</span><span>100</span></div></div>`);
    }
    return h;
  }, [d, me]);
  React.useEffect(() => {
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:#0f172a;color:#fff;font-size:12px;font-weight:600;padding:6px 10px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.3);display:none;white-space:nowrap;';
    document.body.appendChild(tip);
    const move = (e) => {
      const el = e.target.closest?.('[data-tip]');
      if (el) {
        tip.textContent = el.dataset.tip;
        tip.style.display = 'block';
        tip.style.left = `${e.clientX + 12}px`;
        tip.style.top = `${e.clientY - 34}px`;
      } else tip.style.display = 'none';
    };
    document.addEventListener('mousemove', move);
    const click = (e) => {
      const el = e.target.closest('button');
      if (!el || !el.textContent.includes('Factures')) return;
      e.preventDefault();
      walletAPI.statement().then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'releve-factures.pdf';
        a.click();
        URL.revokeObjectURL(url);
      }).catch(() => alert('Relevé indisponible.'));
    };
    document.addEventListener('click', click);
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('click', click); tip.remove(); };
  }, []);

  return <DesignPage html={html} links={LINKS} />;
}
