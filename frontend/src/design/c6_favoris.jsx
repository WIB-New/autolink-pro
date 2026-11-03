import React, { useMemo, useEffect } from 'react';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { vehiclesAPI } from '../services/api';

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0));
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=70';
const TIER = { premium: 'Gamme Premium', standard: 'Gamme Standard', basic: 'Gamme Basic', luxury: 'Gamme Luxe' };

const card = (v) => {
  const img = v.photos?.[0]?.image || v.image || FALLBACK_IMG;
  return `<article class="fav-card group flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-card-id="${v.id}" data-city="${esc(v.city || '')}" data-gamme="${esc(v.tier || '')}">
<div class="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${esc(img)}" alt="${esc(v.brand)} ${esc(v.model)}"/>
<div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20"></div>
<div class="absolute top-3 left-3"><span class="px-2.5 py-1 rounded-full bg-surface-container-low/95 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-sm">${TIER[v.tier] || esc(v.tier_label || 'Standard')}</span></div>
<button aria-label="Retirer des favoris" class="remove-fav-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-error flex items-center justify-center shadow-md hover:bg-error-container hover:text-on-error-container transition-all" data-remove-id="${v.id}" type="button">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
</button>
<div class="absolute bottom-3 right-3"><div class="px-3 py-1.5 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface flex items-baseline gap-1 shadow-md"><span class="font-currency-display text-currency-display text-primary-fixed font-black">${fmt(v.daily_rate || v.price_min)}</span><span class="font-label-sm text-label-sm font-semibold opacity-90">FCFA / j</span></div></div>
<div class="absolute bottom-3 left-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md font-label-sm text-label-sm font-semibold text-on-surface shadow-sm"><span class="w-2 h-2 rounded-full bg-primary"></span><span>${esc(v.city || '')}</span></span></div>
</div>
<div class="p-space-lg flex-1 flex flex-col justify-between space-y-space-md">
<div class="space-y-space-xs">
<div class="flex items-start justify-between gap-2">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">${esc(v.brand)} ${esc(v.model)} ${v.year || ''}</h2>
<div class="flex items-center gap-2 mt-1">
<div class="flex items-center text-tertiary"><span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span><span class="font-label-md text-label-md font-bold ml-1 text-on-surface">${v.rating || '—'}</span></div>
<span class="text-outline text-label-sm font-label-sm">·</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">${v.rating_count || 0} avis</span>
</div>
</div>
${v.driver_available ? '<span class="px-2 py-1 rounded-md bg-primary-container/15 text-primary font-label-sm text-label-sm font-semibold shrink-0">Option Chauffeur</span>' : ''}
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm"><span class="material-symbols-outlined text-[18px] text-secondary">local_gas_station</span><span class="truncate">${esc(v.fuel || '')}</span></div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm"><span class="material-symbols-outlined text-[18px] text-secondary">category</span><span class="truncate">${esc(v.category || '')}</span></div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm"><span class="material-symbols-outlined text-[18px] text-secondary">location_on</span><span class="truncate">${esc(v.city || '')}</span></div>
</div>
</div>
<div class="pt-2 flex items-center gap-space-sm">
<button class="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] fav-book" data-id="${v.id}" type="button"><span class="material-symbols-outlined text-[20px]">calendar_today</span><span>Réserver maintenant</span></button>
<button class="h-12 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors flex items-center justify-center fav-detail" data-id="${v.id}" title="Voir la fiche" type="button"><span class="material-symbols-outlined text-[20px]">visibility</span></button>
</div>
</div>
</article>`;
};

const HTML = `<div class="flex flex-col w-full">
<div class="w-full max-w-[1280px] mx-auto space-y-space-lg">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div class="space-y-space-xs">
<div class="flex items-center gap-3">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight font-extrabold">
            Mes Véhicules Favoris
          </h1>
<span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-label-md font-bold" id="fav-count-badge">
            4
          </span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Retrouvez vos véhicules préférés à Douala et Yaoundé et réservez-les en un clic selon leurs disponibilités en temps réel.
        </p>
</div>
</div>
<div class="p-4 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-4">
<div class="flex flex-wrap gap-4 items-center">
<div class="relative flex-1 min-w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
<input class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Rechercher un véhicule, une marque…" type="text">
</div>
<div class="flex items-center gap-2">
<span class="font-body-sm text-body-sm text-on-surface-variant">Prix max :</span>
<input class="w-32 accent-primary" max="280000" min="15000" step="5000" type="range" value="280000">
<span class="font-label-lg text-label-lg text-primary whitespace-nowrap">280 000 F</span>
</div>
<label class="flex items-center gap-2 font-label-md text-label-md cursor-pointer"><input checked="" class="w-4 h-4 accent-primary" type="checkbox">Disponibles uniquement</label>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Formule</span><select class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"><option selected="">Toutes les formules</option><option>3 heures</option><option>8 heures</option><option>24 heures</option><option>Interurbain</option><option>Longue durée</option></select></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Gamme</span><select class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"><option selected="">Toutes les gammes</option><option>Économique</option><option>Intermédiaire</option><option>Premium</option><option>Luxe</option><option>Super Luxe</option></select></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Disponible à partir du</span><input class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Jusqu'au</span><input class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Marque</span><select class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"><option selected="">Toutes les marques</option><option>Toyota</option><option>Hyundai</option><option>Peugeot</option><option>Kia</option></select></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Modèle</span><select class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"><option selected="">Tous les modèles</option><option>RAV4</option><option>Tucson</option><option>Corolla</option><option>Picanto</option></select></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Carburant</span><select class="px-3 py-2 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface outline-none cursor-pointer"><option selected="">Tous les carburants</option><option>Essence</option><option>Diesel</option><option>Hybride</option></select></label>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg" id="favorites-grid">
<article class="fav-card group flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-card-id="1" data-city="douala" data-gamme="suv">
<div class="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A pristine metallic dark grey Toyota RAV4 AWD Hybrid parked along a sunlit coastal boulevard in Douala, Cameroon. Golden tropical daylight illuminates its sleek body lines, deep glossy paint reflection, modern alloy rims. High visual fidelity, realistic automotive commercial styling with lush equatorial palm reflections." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjo3iCZrpVAcV3CzFhQZ9kjWD4Ut9bmlfXqb7UnkMCqZMIP1MGrDI7UawCAn_lVd4HkUUwy96LPitS7TqpmA8ET09RoXIy_j965WGhFCM0NIuWH4l63k2ALg2EYYIpFfHP4WzXs6cjEMENvoJWr36Jf26E9MpDa4Roi1lz8gADXrmbW29Hd6Rb4cWse4wNWM-ou3MsyxR5VZbSUdfaecYFQhQDmb4JDZBAzgzomlx5-JdzKhqp24DWrw"/>
<div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20"></div>
<div class="absolute top-3 left-3 flex items-center gap-2">
<span class="px-2.5 py-1 rounded-full bg-surface-container-low/95 backdrop-blur-md text-primary font-label-sm text-label-sm font-bold shadow-sm">
              Gamme Premium
            </span>

</div>
<button aria-label="Retirer des favoris" class="remove-fav-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-error flex items-center justify-center shadow-md hover:bg-error-container hover:text-on-error-container transition-all" data-remove-id="1">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
</button>
<div class="absolute bottom-3 right-3">
<div class="px-3 py-1.5 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface flex items-baseline gap-1 shadow-md">
<span class="font-currency-display text-currency-display text-primary-fixed font-black">55 000</span>
<span class="font-label-sm text-label-sm font-semibold opacity-90">FCFA / j</span>
</div>
</div>
<div class="absolute bottom-3 left-3">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md font-label-sm text-label-sm font-semibold text-on-surface shadow-sm">
<span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
<span>Douala Akwa</span>
</span>
</div>
</div>
<div class="p-space-lg flex-1 flex flex-col justify-between space-y-space-md">
<div class="space-y-space-xs">
<div class="flex items-start justify-between gap-2">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Toyota RAV4 AWD Hybrid 2022
                </h2>
<div class="flex items-center gap-2 mt-1">
<div class="flex items-center text-tertiary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md font-bold ml-1 text-on-surface">4.95</span>
</div>
<span class="text-outline text-label-sm font-label-sm">·</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">38 avis certifiés</span>
</div>
</div>
<span class="px-2 py-1 rounded-md bg-primary-container/15 text-primary font-label-sm text-label-sm font-semibold shrink-0">
                Option Chauffeur
              </span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
<span>🟢 Disponible immédiatement à Douala Akwa</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">swap_driving_apps</span>
<span class="truncate">Automatique</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">mode_heat</span>
<span class="truncate">AWD Intégral</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">airline_seat_recline_normal</span>
<span class="truncate">5 Places</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">ac_unit</span>
<span class="truncate">Clim A/C bi-zone</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm col-span-2 sm:col-span-2">
<span class="material-symbols-outlined text-[18px] text-primary">eco</span>
<span class="truncate">Hybride Électrique / Essence</span>
</div>
</div>
</div>
<div class="pt-2 flex items-center gap-space-sm">
<button class="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px]">calendar_today</span>
<span>Réserver maintenant</span>
</button>
<button class="h-12 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center" title="Fiche technique">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
</article>
<article class="fav-card group flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-card-id="2" data-city="yaounde" data-gamme="suv">
<div class="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A luxurious pearl-white Toyota Land Cruiser Prado TX V6 2023 positioned outside an upscale diplomatic villa in Yaoundé Bastos, Cameroon. Rich afternoon ambient lighting, spotless chrome grill, tinted executive privacy windows, lush green tropical hill background. Authoritative fintech mobility photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjIgey8uON9aKuKvrmE1oAFT3pOh3_P4RiKN6TUx5WB24oz0xq9fDq2FuszHDes6EVdGjH1qdxCPATZUP68R7Zui8y-pJu2gEhAJLZmHWla3mSdaZ6f-jtHdYDnMc7HprWR7qM1ouJR95CUzDw_WUcUeSvqbOHQM5dLyikuoLr9fJZnDwVfPz6tsjmBPTr2E62iGf_7HldHBSWagDYftEmwnTxab_Cl-Q1iDf40g4z9y8lpM4AbTO3Qw"/>
<div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20"></div>
<div class="absolute top-3 left-3 flex items-center gap-2">
<span class="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold shadow-sm">
              Gamme Gold VIP
            </span>

</div>
<button aria-label="Retirer des favoris" class="remove-fav-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-error flex items-center justify-center shadow-md hover:bg-error-container hover:text-on-error-container transition-all" data-remove-id="2">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
</button>
<div class="absolute bottom-3 right-3">
<div class="px-3 py-1.5 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface flex items-baseline gap-1 shadow-md">
<span class="font-currency-display text-currency-display text-tertiary-fixed font-black">110 000</span>
<span class="font-label-sm text-label-sm font-semibold opacity-90">FCFA / j</span>
</div>
</div>
<div class="absolute bottom-3 left-3">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md font-label-sm text-label-sm font-semibold text-on-surface shadow-sm">
<span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
<span>Yaoundé Bastos</span>
</span>
</div>
</div>
<div class="p-space-lg flex-1 flex flex-col justify-between space-y-space-md">
<div class="space-y-space-xs">
<div class="flex items-start justify-between gap-2">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Toyota Land Cruiser Prado TX V6 2023
                </h2>
<div class="flex items-center gap-2 mt-1">
<div class="flex items-center text-tertiary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md font-bold ml-1 text-on-surface">5.0</span>
</div>
<span class="text-outline text-label-sm font-label-sm">·</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">24 avis VIP</span>
</div>
</div>
<span class="px-2 py-1 rounded-md bg-tertiary-fixed/30 text-tertiary font-label-sm text-label-sm font-bold shrink-0">
                Chauffeur VIP inclus
              </span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
<span>🟢 Disponible dès demain à Yaoundé Bastos</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">terrain</span>
<span class="truncate">4x4 Tout-Terrain</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">swap_driving_apps</span>
<span class="truncate">Automatique</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">group</span>
<span class="truncate">7 Places VIP</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">person_pin</span>
<span class="truncate">Chauffeur certifié</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm col-span-2 sm:col-span-2">
<span class="material-symbols-outlined text-[18px] text-secondary">local_gas_station</span>
<span class="truncate">Moteur V6 Essence · Blindage léger</span>
</div>
</div>
</div>
<div class="pt-2 flex items-center gap-space-sm">
<button class="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px]">calendar_today</span>
<span>Réserver maintenant</span>
</button>
<button class="h-12 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center" title="Fiche technique">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
</article>
<article class="fav-card group flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-card-id="3" data-city="douala" data-gamme="suv">
<div class="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A modern teal-blue Hyundai Tucson 2023 parked near Bonapriso residential quarter in Douala. Sharp daytime architectural shadows, angular front LED light signatures, crystal clean rims, lush tropical green vegetation backdrop. High resolution automotive studio outdoor photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeIPILfLgwdAzREXYp-vA8cbENGHBA2JoQSIeNL4zEzkbxhfQ22CtzSyqm827u6s2t-99vO_yA7RluAVWC8l93pq-bOwM8PX4xLGpT8w6cV4l2-eaKdonbBF4OtbDW5UcQ2s4uCe5jaHVMd9HvzrFl3U9UHz3ZGyfGYn4c20NQtvdgOlO4O6r_DSAtDK8mEJ4VobXJhGGM5A8IjIWRI4X3Ws0_KJv-0_VB5Or6XI54rwgg31pxcQBm5g"/>
<div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20"></div>
<div class="absolute top-3 left-3 flex items-center gap-2">
<span class="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold shadow-sm">
              Gamme Premium
            </span>

</div>
<button aria-label="Retirer des favoris" class="remove-fav-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-error flex items-center justify-center shadow-md hover:bg-error-container hover:text-on-error-container transition-all" data-remove-id="3">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
</button>
<div class="absolute bottom-3 right-3">
<div class="px-3 py-1.5 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface flex items-baseline gap-1 shadow-md">
<span class="font-currency-display text-currency-display text-primary-fixed font-black">60 000</span>
<span class="font-label-sm text-label-sm font-semibold opacity-90">FCFA / j</span>
</div>
</div>
<div class="absolute bottom-3 left-3">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md font-label-sm text-label-sm font-semibold text-on-surface shadow-sm">
<span class="w-2 h-2 rounded-full bg-tertiary"></span>
<span>Douala Bonapriso</span>
</span>
</div>
</div>
<div class="p-space-lg flex-1 flex flex-col justify-between space-y-space-md">
<div class="space-y-space-xs">
<div class="flex items-start justify-between gap-2">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Hyundai Tucson 2023
                </h2>
<div class="flex items-center gap-2 mt-1">
<div class="flex items-center text-tertiary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md font-bold ml-1 text-on-surface">4.88</span>
</div>
<span class="text-outline text-label-sm font-label-sm">·</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">19 avis</span>
</div>
</div>
<span class="px-2 py-1 rounded-md bg-tertiary-fixed-dim/30 text-tertiary font-label-sm text-label-sm font-semibold shrink-0">
                Bientôt libre
              </span>
</div>
<div class="p-2.5 rounded-xl bg-tertiary-fixed/20 flex items-center gap-2 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px] text-tertiary">event_busy</span>
<span>🟡 En location jusqu'au 31 Oct (Bientôt dispo)</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">swap_driving_apps</span>
<span class="truncate">Boîte Auto</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">local_gas_station</span>
<span class="truncate">Diesel Eco</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">airline_seat_recline_normal</span>
<span class="truncate">5 Places</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">videocam</span>
<span class="truncate">Caméra 360°</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm col-span-2 sm:col-span-2">
<span class="material-symbols-outlined text-[18px] text-secondary">screen_search_desktop</span>
<span class="truncate">Apple CarPlay & Android Auto</span>
</div>
</div>
</div>
<div class="pt-2 flex items-center gap-space-sm">
<button class="flex-1 h-12 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-lg text-label-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px] text-primary">notifications_active</span>
<span>M'alerter lors du retour</span>
</button>
<button class="h-12 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-1">
<span>Voir fiche</span>
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</article>
<article class="fav-card group flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" data-card-id="4" data-city="douala" data-gamme="berlines">
<div class="relative aspect-[16/10] w-full overflow-hidden bg-surface-container">
<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A clean silver Toyota Corolla 2021 parked on a paved street in Douala Bonanjo business district. Clear sunny sky, reflective windshield, professional commercial vehicle rental angle, polished tires, sleek urban background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcYlhs3OwPGIlbiMPpp-i-kSVKVyaHmgrbBMe1dcuRted4lpy0xE9rQwkc6NFG-riawtvu2MnF1ZFSBQEBWfIWwHUyCU6Y8sivWXXdYdqY1LVquUgPmFlj6szP4ngNL3tpOsnq8M3XogL9N5e4ooEuzckEkBH421-IB0o_R_Qhzc97v0a2Vgx9f9W9dVUDSejCVZZanDpeEuWrwgLHKddVsUbUC-hRUqwE8qWOrlN79lef1asJX8OJSw"/>
<div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-black/20"></div>
<div class="absolute top-3 left-3 flex items-center gap-2">
<span class="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold shadow-sm">
              Gamme Standard
            </span>

</div>
<button aria-label="Retirer des favoris" class="remove-fav-btn absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 backdrop-blur-md text-error flex items-center justify-center shadow-md hover:bg-error-container hover:text-on-error-container transition-all" data-remove-id="4">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
</button>
<div class="absolute bottom-3 right-3">
<div class="px-3 py-1.5 rounded-xl bg-inverse-surface/90 backdrop-blur-md text-inverse-on-surface flex items-baseline gap-1 shadow-md">
<span class="font-currency-display text-currency-display text-primary-fixed font-black">35 000</span>
<span class="font-label-sm text-label-sm font-semibold opacity-90">FCFA / j</span>
</div>
</div>
<div class="absolute bottom-3 left-3">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md font-label-sm text-label-sm font-semibold text-on-surface shadow-sm">
<span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
<span>Douala Bonanjo</span>
</span>
</div>
</div>
<div class="p-space-lg flex-1 flex flex-col justify-between space-y-space-md">
<div class="space-y-space-xs">
<div class="flex items-start justify-between gap-2">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                  Toyota Corolla 2021
                </h2>
<div class="flex items-center gap-2 mt-1">
<div class="flex items-center text-tertiary">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-md text-label-md font-bold ml-1 text-on-surface">4.90</span>
</div>
<span class="text-outline text-label-sm font-label-sm">·</span>
<span class="font-body-sm text-body-sm text-on-surface-variant font-medium">52 avis clients</span>
</div>
</div>
<span class="px-2 py-1 rounded-md bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm font-semibold shrink-0">
                Top Économique
              </span>
</div>
<div class="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2 text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
<span>🟢 Disponible à Douala Bonanjo</span>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">swap_driving_apps</span>
<span class="truncate">Automatique</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">local_gas_station</span>
<span class="truncate">Essence SP95</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">airline_seat_recline_normal</span>
<span class="truncate">5 Places</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm">
<span class="material-symbols-outlined text-[18px] text-secondary">ac_unit</span>
<span class="truncate">Climatisation</span>
</div>
<div class="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant text-label-sm font-label-sm col-span-2 sm:col-span-2">
<span class="material-symbols-outlined text-[18px] text-secondary">bluetooth</span>
<span class="truncate">Audio Bluetooth & USB</span>
</div>
</div>
</div>
<div class="pt-2 flex items-center gap-space-sm">
<button class="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]">
<span class="material-symbols-outlined text-[20px]">calendar_today</span>
<span>Réserver maintenant</span>
</button>
<button class="h-12 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center" title="Fiche technique">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
</article>
</div>
<section class="mt-space-xl p-8 rounded-3xl bg-surface-container-low shadow-sm relative overflow-hidden">
<div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
<div class="flex items-center gap-5">
<div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-sm shrink-0">
<span class="material-symbols-outlined text-[32px]">travel_explore</span>
</div>
<div class="space-y-1 text-center md:text-left">
<h3 class="font-headline-md text-headline-md text-on-surface font-bold">
              Vous cherchez un autre modèle ?
            </h3>
<p class="font-body-md text-body-md text-on-surface-variant">
              Parcourez nos 36 véhicules rigoureusement vérifiés par nos mécaniciens à Douala et Yaoundé.
            </p>
</div>
</div>
<a class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-sm shrink-0" data-path="catalogue-vehicules" href="#">
<span>Explorer tout le catalogue (36 véhicules certifiés)</span>
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</a>
</div>
<div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-primary/5 pointer-events-none"></div>
</section>
<div class="p-4"></div>
</div>
<script>
    (function() {
      // Favoris Removal Interaction
      const removeButtons = document.querySelectorAll('.remove-fav-btn');
      const badgeCount = document.getElementById('fav-count-badge');
      let totalItems = 4;

      removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const cardId = btn.getAttribute('data-remove-id');
          const card = document.querySelector(\`.fav-card[data-card-id="\${cardId}"]\`);
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            card.style.transition = 'all 0.25s ease';
            setTimeout(() => {
              card.remove();
              totalItems = Math.max(0, totalItems - 1);
              if (badgeCount) badgeCount.textContent = totalItems;
              updateCompareCount();
            }, 250);
          }
        });
      });

      // City Filter Toggle
      const cityButtons = document.querySelectorAll('.filter-city-btn');
      cityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          cityButtons.forEach(b => {
            b.classList.remove('bg-primary', 'text-on-primary');
            b.classList.add('text-on-surface-variant');
          });
          btn.classList.add('bg-primary', 'text-on-primary');
          btn.classList.remove('text-on-surface-variant');

          const city = btn.getAttribute('data-city');
          filterGrid(city, null);
        });
      });

      // Gamme Filter Toggle
      const gammeButtons = document.querySelectorAll('.filter-gamme-btn');
      gammeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          gammeButtons.forEach(b => {
            b.classList.remove('bg-surface-container-high', 'text-on-surface');
            b.classList.add('text-on-surface-variant');
          });
          btn.classList.add('bg-surface-container-high', 'text-on-surface');
          btn.classList.remove('text-on-surface-variant');

          const gamme = btn.getAttribute('data-gamme');
          filterGrid(null, gamme);
        });
      });

      let currentCity = 'all';
      let currentGamme = 'all';

      function filterGrid(city, gamme) {
        if (city !== null) currentCity = city;
        if (gamme !== null) currentGamme = gamme;

        const cards = document.querySelectorAll('.fav-card');
        cards.forEach(card => {
          const cardCity = card.getAttribute('data-city');
          const cardGamme = card.getAttribute('data-gamme');

          const cityMatch = (currentCity === 'all' || cardCity === currentCity);
          const gammeMatch = (currentGamme === 'all' || cardGamme === currentGamme);

          if (cityMatch && gammeMatch) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }

      // Checkbox compare counter
      const compareBoxes = document.querySelectorAll('.compare-checkbox');
      const compareCounter = document.getElementById('compare-count');

      function updateCompareCount() {
        const checked = document.querySelectorAll('.compare-checkbox:checked').length;
        if (compareCounter) compareCounter.textContent = checked;
      }

      compareBoxes.forEach(box => {
        box.addEventListener('change', updateCompareCount);
      });
    })();
  </script>
`;
const LINKS = {
  'Réserver maintenant': '/client/booking/recap',
  'Voir fiche': '/client/vehicule/2',
  'Explorer tout le catalogue': '/client/search',
  'Comparer la séléction': '/client/search',
  "M'alerter lors du retour": '/client/bookings',
};

export default function C6Favoris() {
  const { data } = useApiData(() => vehiclesAPI.favorites(), []);
  const html = useMemo(() => {
    if (!data) return HTML;
    const items = Array.isArray(data) ? data : data.results || [];
    const cards = items.length
      ? items.map(card).join('')
      : '<div class="col-span-full text-center py-16 text-on-surface-variant">Aucun favori pour le moment.<br/><a href="/client/search" class="text-primary font-semibold underline">Explorer le catalogue</a></div>';
    return HTML.replace(/id="favorites-grid"[^>]*>[\s\S]*?(?=<div class="rounded-2xl bg-surface-container-low p-space-md|<script)/,
      `id="favorites-grid">${cards}`);
  }, [data]);
  useEffect(() => {
    const click = (e) => {
      const rm = e.target.closest('.remove-fav-btn');
      const book = e.target.closest('.fav-book');
      const detail = e.target.closest('.fav-detail');
      if (rm) {
        const id = rm.dataset.removeId;
        vehiclesAPI.removeFavorite(id).catch(() => {});
        rm.closest('.fav-card')?.remove();
      } else if (book) window.location.href = `/client/booking/recap?vehicle=${book.dataset.id}`;
      else if (detail) window.location.href = `/client/vehicule/${detail.dataset.id}`;
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
  return <DesignPage html={html} links={LINKS} />;
}
