import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full">
<div class="w-full max-w-[1280px] mx-auto space-y-space-lg">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div class="space-y-space-xs">
<nav class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
<span>Espace Client</span>
<span class="material-symbols-outlined text-[14px]">chevron_right</span>
<span class="text-primary font-semibold">Favoris</span>
</nav>
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
<div class="flex items-center gap-space-sm self-start md:self-auto">
<button class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-colors font-label-lg text-label-lg shadow-sm" id="compare-btn">
<span class="material-symbols-outlined text-[18px]">compare_arrows</span>
<span>Comparer la sélection (<span id="compare-count">2</span>)</span>
</button>
</div>
</div>
<div class="p-4 rounded-2xl bg-surface-container-low shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
<div class="flex flex-wrap items-center gap-2">
<div class="flex items-center p-1 rounded-xl bg-surface-container-lowest shadow-sm gap-1">
<button class="filter-city-btn px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md transition-all" data-city="all">
            Toutes les villes
          </button>
<button class="filter-city-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" data-city="douala">
            Douala (3)
          </button>
<button class="filter-city-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" data-city="yaounde">
            Yaoundé (1)
          </button>
</div>
<div class="hidden sm:block w-px h-6 bg-outline-variant/30 mx-1"></div>
<div class="flex items-center p-1 rounded-xl bg-surface-container-lowest shadow-sm gap-1 overflow-x-auto">
<button class="filter-gamme-btn px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md transition-all" data-gamme="all">
            Toutes gammes
          </button>
<button class="filter-gamme-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all whitespace-nowrap" data-gamme="suv">
            SUV & 4x4
          </button>
<button class="filter-gamme-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" data-gamme="berlines">
            Berlines
          </button>
<button class="filter-gamme-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all" data-gamme="citadines">
            Citadines
          </button>
</div>
</div>
<div class="flex items-center gap-3 justify-between xl:justify-end">
<div class="relative flex items-center bg-surface-container-lowest rounded-xl shadow-sm px-3 py-2 cursor-pointer hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined text-[18px] text-primary mr-2">tune</span>
<span class="font-label-md text-label-md text-on-surface font-semibold mr-3">Tri : Disponibilité immédiate</span>
<span class="material-symbols-outlined text-[16px] text-outline">expand_more</span>
</div>
<div class="hidden md:flex items-center gap-1.5 text-outline text-label-sm font-label-sm bg-surface-container-lowest px-3 py-2 rounded-xl shadow-sm">
<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span>Actualisé à l'instant</span>
</div>
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
<label class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md cursor-pointer text-on-surface font-label-sm text-label-sm shadow-sm select-none">
<input checked="" class="compare-checkbox accent-primary rounded w-3.5 h-3.5" data-id="1" type="checkbox"/>
<span>Comparer</span>
</label>
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
<label class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md cursor-pointer text-on-surface font-label-sm text-label-sm shadow-sm select-none">
<input checked="" class="compare-checkbox accent-primary rounded w-3.5 h-3.5" data-id="2" type="checkbox"/>
<span>Comparer</span>
</label>
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
<label class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md cursor-pointer text-on-surface font-label-sm text-label-sm shadow-sm select-none">
<input class="compare-checkbox accent-primary rounded w-3.5 h-3.5" data-id="3" type="checkbox"/>
<span>Comparer</span>
</label>
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
<label class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md cursor-pointer text-on-surface font-label-sm text-label-sm shadow-sm select-none">
<input class="compare-checkbox accent-primary rounded w-3.5 h-3.5" data-id="4" type="checkbox"/>
<span>Comparer</span>
</label>
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
  'Voir fiche': '/client/booking/recap',
  'Explorer tout le catalogue': '/client/search',
  'Comparer la séléction': '/client/search',
  "M'alerter lors du retour": '/client/bookings',
};

export default function c6favoris() {
  return <DesignPage html={HTML} links={LINKS} />;
}
