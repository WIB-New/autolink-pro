import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { vehiclesAPI } from '../services/api';

const fmt = (n) => new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Math.round(Number(n) || 0));
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FUEL_FR = { essence: 'Essence', diesel: 'Diesel', hybride: 'Hybride', electrique: 'Électrique' };

const spec = (icon, label, value) => `
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low"><span class="material-symbols-outlined text-primary text-[22px]">${icon}</span><div><div class="font-label-sm text-label-sm text-on-surface-variant">${label}</div><div class="font-label-md text-label-md font-bold text-on-surface">${esc(value)}</div></div></div>`;

const reviewCard = (r) => {
  const initials = (r.client || 'C').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
  return `<div class="flex gap-3 p-4 rounded-xl bg-surface-container-low">
<div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-label-md shrink-0">${esc(initials)}</div>
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2"><span class="font-label-md font-bold text-on-surface">${esc(r.client)}</span><span class="font-body-sm text-[11px] text-primary flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">verified</span>Location vérifiée</span></div>
<span class="font-body-sm text-[11px] text-on-surface-variant">${new Date(r.date).toLocaleDateString('fr-FR')} · <span class="text-amber-500">${stars}</span></span>
<p class="font-body-sm text-body-sm text-on-surface-variant">${esc(r.review || '—')}</p>
</div></div>`;
};

const simCard = (s) => `<a class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" href="/client/vehicule/${s.id}">
<div class="h-36 bg-surface-container"><img class="w-full h-full object-cover" src="${esc(s.photos?.[0]?.image || s.image_url || '')}" alt="${esc(`${s.brand} ${s.model}`)}"/></div>
<div class="p-4"><div class="font-label-md font-bold text-on-surface">${esc(`${s.brand} ${s.model} ${s.year}`)}</div>
<div class="flex items-center justify-between mt-1"><span class="font-body-sm text-body-sm text-on-surface-variant">${esc(s.city || '')} · ★${s.rating || '—'}</span><span class="font-label-md font-bold text-primary">${fmt(s.daily_rate)} F/j</span></div></div></a>`;

function buildHtml(v, rev, sim) {
  const name = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
  const photos = (v.photos || []).map((p) => p.image).filter(Boolean);
  if (!photos.length && v.image_url) photos.push(v.image_url);
  const main = photos[0] || '';
  const reviews = Array.isArray(rev) ? rev : (rev?.results || []);
  const sims = (Array.isArray(sim) ? sim : (sim?.results || [])).slice(0, 3);
  const specs = [
    ['airline_seat_recline_normal', 'Places', `${v.seats ?? '—'} passagers`],
    ['settings', 'Boîte', v.transmission || v.gearbox || 'Automatique'],
    ['local_gas_station', 'Carburant', FUEL_FR[(v.fuel || '').toLowerCase()] || v.fuel || '—'],
    ['calendar_today', 'Année', v.year || '—'],
    ['palette', 'Couleur', v.color || '—'],
    ['speed', 'Kilométrage', `${fmt(v.mileage)} km`],
    ['directions_car', 'Catégorie', v.category || '—'],
    ['badge', 'Immatriculation', v.plate || '—'],
    ['route', 'Forfait km/jour', v.km_included_per_day ? `${fmt(v.km_included_per_day)} km` : '—'],
    ['add_road', 'Km supplémentaire', v.extra_km_rate ? `${fmt(v.extra_km_rate)} F/km` : '—'],
    ['fact_check', 'Score état', v.condition_score ? `${v.condition_score}/100` : '—'],
    ['local_gas_station', 'Niveau carburant', v.fuel_level != null ? `${v.fuel_level}%` : '—'],
  ];

  return `<div class="flex flex-col w-full pb-16 max-w-[1280px] mx-auto">
<div class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-4">
<a class="hover:text-primary transition-colors" href="/client/search">Catalogue</a>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-on-surface font-label-sm font-bold">${esc(name)}</span>
</div>
<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
<div class="xl:col-span-2 flex flex-col gap-8">
<div class="flex flex-wrap items-center gap-3">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">${esc(name)}</h1>
<span class="px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant">${esc(v.category || 'Véhicule')}</span>
<span class="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Disponible</span>
<span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">location_on</span>${esc(v.city || '')}</span>
<span class="font-body-sm text-body-sm text-primary font-bold flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">star</span>${v.rating || '—'} (${v.rating_count || 0} avis)</span>
</div>
<!-- Galerie : grande photo + vignettes cliquables -->
<div class="flex flex-col gap-2">
<div class="rounded-2xl overflow-hidden bg-surface-container relative h-[300px] md:h-[400px]">
<img id="veh-main-img" class="w-full h-full object-cover" src="${esc(main)}" alt="${esc(name)}"/>
<span class="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-inverse-surface/70 text-inverse-on-surface font-label-sm text-label-sm backdrop-blur-sm flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">photo_library</span>${photos.length} photo(s)</span>
</div>
<div class="grid grid-cols-5 gap-2">
${photos.slice(0, 5).map((p, i) => `<button class="veh-thumb rounded-xl overflow-hidden bg-surface-container h-20 md:h-24 ${i === 0 ? 'ring-2 ring-primary' : ''}" data-src="${esc(p)}" type="button"><img class="w-full h-full object-cover" src="${esc(p)}" alt="vue ${i + 1}"/></button>`).join('')}
</div>
</div>
<!-- Caractéristiques réelles -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-5">Caractéristiques techniques</h2>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">${specs.map(([i, l, val]) => spec(i, l, val)).join('')}</div>
</div>
<!-- Description réelle -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-3">Description et recommandations</h2>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${esc(v.description || `${name} — véhicule AutoLink Pro inspecté et prêt pour vos déplacements.`)}</p>
</div>
<!-- Avis réels -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<div class="flex items-center justify-between mb-5">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Avis certifiés de voyageurs</h2>
<button id="veh-all-reviews" class="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer" type="button" title="Voir tous les avis"><span class="material-symbols-outlined text-primary text-[22px]">star</span><span class="font-headline-md font-bold text-on-surface">${v.rating || '—'}</span><span class="font-body-sm text-body-sm text-on-surface-variant underline decoration-dotted">${reviews.length} avis vérifiés</span></button>
</div>
<div class="flex flex-col gap-4" id="veh-reviews">
${reviews.length ? reviews.slice(0, 3).map(reviewCard).join('') : '<p class="font-body-md text-body-md text-on-surface-variant">Aucun avis pour ce véhicule pour le moment.</p>'}
</div>
${reviews.length > 3 ? `<button id="veh-reviews-more" class="mt-4 self-center px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-md text-label-md font-semibold text-primary transition-colors" type="button" data-count="${reviews.length}">Voir les ${reviews.length} avis</button>` : ''}
</div>
<!-- Véhicules similaires réels -->
${sims.length ? `<div class="flex flex-col gap-4">
<div class="flex items-center justify-between"><h2 class="font-headline-sm text-headline-sm text-on-surface">Véhicules similaires recommandés</h2><a class="font-label-sm text-label-sm text-primary font-bold" href="/client/search">Voir tout le catalogue</a></div>
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${sims.map(simCard).join('')}</div>
</div>` : ''}
</div>
<!-- Colonne réservation -->
<aside class="xl:col-span-1">
<div class="sticky top-4 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-5">
<div class="flex items-center justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant">${esc(v.plate || '')} · ${esc(v.city || '')}</span>
<div class="text-right"><span class="font-headline-lg font-extrabold text-on-surface">${fmt(v.daily_rate)}</span><span class="font-label-sm text-label-sm text-on-surface-variant"> FCFA / jour</span></div>
</div>
<div class="flex flex-col gap-3">
<div class="grid grid-cols-2 gap-2">
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Début</span><input id="veh-date-start" class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Heure début</span><input id="veh-time-start" class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="time" value="08:30"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Fin</span><input id="veh-date-end" class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="date"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Heure fin</span><input id="veh-time-end" class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" type="time" value="08:30"/></label>
</div>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Conduite</span><select id="veh-driver-opt" class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none cursor-pointer"><option value="driver">Avec chauffeur</option><option value="self">Sans chauffeur</option></select></label>
</div>
<div class="flex flex-col gap-2 py-3 border-y border-outline-variant/30 font-body-sm text-body-sm">
<div class="flex justify-between"><span class="text-on-surface-variant" id="veh-rate-line">24 heures — ${fmt(v.daily_rate)} F × 1 j</span><span class="text-on-surface" id="veh-rate-amt">${fmt(v.daily_rate)} F</span></div>
<div class="flex justify-between" id="veh-driver-line"><span class="text-on-surface-variant">Chauffeur AutoLink</span><span class="text-on-surface" id="veh-driver-amt">+10 000 F</span></div>
<div class="flex justify-between"><span class="text-on-surface-variant">Assurance & assistance 24/7</span><span class="text-primary font-bold">Inclus</span></div>
</div>
<div class="flex items-center justify-between"><span class="font-label-md text-label-md font-bold text-on-surface">Total TTC</span><span class="font-headline-md font-extrabold text-on-surface" id="veh-total">${fmt(Number(v.daily_rate || 0) + 10000)} FCFA</span></div>
<div class="flex items-center justify-between"><span class="font-body-sm text-body-sm text-on-surface-variant">Caution (pré-autorisation)</span><span class="font-label-md text-label-md font-bold text-on-surface">${fmt(v.deposit_amount || v.caution)} F</span></div>
<a id="veh-book-link" href="/client/booking/recap?vehicle=${v.id}" class="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all text-center flex items-center justify-center">Réserver maintenant</a>
<button id="veh-fav-btn" class="w-full py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-2" type="button"><span class="material-symbols-outlined text-[18px] text-primary">favorite</span><span id="veh-fav-txt">Ajouter aux favoris</span></button>
<div class="flex items-center gap-2">
<button id="veh-call" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-primary">call</span>Appeler</button>
<button id="veh-wa" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-green-600">chat</span>WhatsApp</button>
<button id="veh-share" class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors" type="button"><span class="material-symbols-outlined text-[16px] text-primary">share</span>Partager</button>
</div>
</div>
</aside>
</div>
</div>`;
}

export default function C11VehiculeDetail() {
  const { id } = useParams();
  const { data: v } = useApiData(() => vehiclesAPI.detail(id), [id]);
  const { data: rev } = useApiData(() => vehiclesAPI.reviews(id), [id]);
  const { data: sim } = useApiData(() => vehiclesAPI.similar(id), [id]);
  const { data: favs } = useApiData(() => vehiclesAPI.favorites(), []);

  const html = useMemo(() => (v ? buildHtml(v, rev, sim) : '<div class="p-10 text-center text-on-surface-variant">Chargement…</div>'), [v, rev, sim]);

  React.useEffect(() => {
    if (!v) return undefined;
    // Galerie : clic vignette -> photo principale
    const click = (e) => {
      const thumb = e.target.closest('.veh-thumb');
      if (thumb) {
        const img = document.getElementById('veh-main-img');
        if (img) img.src = thumb.dataset.src;
        document.querySelectorAll('.veh-thumb').forEach((t) => t.classList.remove('ring-2', 'ring-primary'));
        thumb.classList.add('ring-2', 'ring-primary');
        return;
      }
      // Total : dates + conduite -> recalc
      if (e.target.closest('#veh-fav-btn')) {
        (async () => {
          const { vehiclesAPI } = await import('../services/api');
          const { data: list } = await vehiclesAPI.favorites();
          const has = (list || []).some((f) => f.id === v.id || f.vehicle === v.id);
          if (has) await vehiclesAPI.removeFavorite(v.id).catch(() => {});
          else await vehiclesAPI.addFavorite(v.id).catch(() => {});
          const t = document.getElementById('veh-fav-txt');
          const b = document.getElementById('veh-fav-btn');
          if (t) t.textContent = has ? 'Ajouter aux favoris' : 'Retirer des favoris';
          if (b) b.classList.toggle('bg-error-container', !has);
        })();
        return;
      }
      if (e.target.closest('#veh-call')) { window.location.href = `tel:${(v.owner_phone || v.owner?.phone || '+237656789000').replace(/\s/g, '')}`; return; }
      if (e.target.closest('#veh-wa')) { window.open(`https://wa.me/${(v.owner_phone || v.owner?.phone || '+237656789000').replace(/[\s+]/g, '')}`, '_blank'); return; }
      if (e.target.closest('#veh-share')) {
        const url = window.location.href;
        if (navigator.share) navigator.share({ title: `${v.brand} ${v.model} — AutoLink Pro`, url }).catch(() => {});
        else navigator.clipboard?.writeText(url).then(() => { const b = document.getElementById('veh-share'); if (b) { b.innerHTML = '<span class="material-symbols-outlined text-[16px] text-primary">check</span>Lien copié !'; } });
        return;
      }
      // "X avis vérifies" / "Voir les X avis" -> afficher tous les avis ou réduire
      const revToggle = e.target.closest('#veh-all-reviews') || e.target.closest('#veh-reviews-more');
      if (revToggle) {
        const box = document.getElementById('veh-reviews');
        const all = Array.isArray(rev) ? rev : (rev?.results || []);
        const expanded = box?.dataset.expanded === '1';
        if (box && all.length) {
          box.innerHTML = (expanded ? all.slice(0, 3) : all).map(reviewCard).join('');
          box.dataset.expanded = expanded ? '' : '1';
          const more = document.getElementById('veh-reviews-more');
          if (more) more.textContent = expanded ? `Voir les ${all.length} avis` : 'Réduire les avis';
          box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };
    // Recalcul total sur dates/conduite
    const calc = () => {
      const sEl = document.getElementById('veh-date-start');
      const eEl = document.getElementById('veh-date-end');
      const tsEl = document.getElementById('veh-time-start');
      const teEl = document.getElementById('veh-time-end');
      const s = sEl?.value;
      const e2 = eEl?.value;
      let ts = tsEl?.value || '08:30';
      let te = teEl?.value || '08:30';
      // Controle : fin jamais avant debut (date puis heure si meme jour)
      if (s && e2) {
        if (e2 < s) {
          eEl.value = s;
          if (teEl) teEl.value = ts; te = ts;
        } else if (e2 === s && te < ts) {
          if (teEl) teEl.value = ts; te = ts;
        }
      }
      // Jours calcules sur les HEURES reelles : <=24h=1j, <=48h=2j, ...
      let days = 1;
      let hours = 24;
      if (s && e2) {
        const start = new Date(`${s}T${ts}`);
        const end = new Date(`${eEl?.value || e2}T${te}`);
        hours = Math.max(0, (end - start) / 36e5);
        days = Math.max(1, Math.ceil(hours / 24));
      }
      const driver = document.getElementById('veh-driver-opt')?.value === 'driver';
      const rate = Number(v.daily_rate || 0) * days;
      const line = document.getElementById('veh-rate-line'); const amt = document.getElementById('veh-rate-amt');
      const dline = document.getElementById('veh-driver-line'); const tot = document.getElementById('veh-total');
      if (line) line.textContent = `${Math.round(hours)} heures — ${fmt(v.daily_rate)} F × ${days} j`;
      if (amt) amt.textContent = `${fmt(rate)} F`;
      if (dline) dline.style.display = driver ? '' : 'none';
      const damt = document.getElementById('veh-driver-amt');
      if (damt) damt.textContent = `+${fmt(10000)} F × ${days} j`;
      if (tot) tot.textContent = `${fmt(rate + (driver ? 10000 * days : 0))} FCFA`;
      // Le lien Réserver emporte dates + heures + conduite
      const link = document.getElementById('veh-book-link');
      if (link) link.href = `/client/booking/recap?vehicle=${v.id}&start=${s || ''}&end=${eEl?.value || e2 || ''}&stime=${ts}&etime=${te}${driver ? '&driver=1' : ''}`;
    };
    // Réserver : n'avance que si les 2 dates sont saisies
    const gate = (e) => {
      const link = e.target.closest('#veh-book-link');
      if (!link) return;
      const s = document.getElementById('veh-date-start')?.value;
      const e2 = document.getElementById('veh-date-end')?.value;
      if (!s || !e2) {
        e.preventDefault();
        ['veh-date-start', 'veh-date-end'].forEach((i) => {
          const el = document.getElementById(i);
          if (el && !el.value) { el.classList.add('ring-2', 'ring-error'); el.focus(); }
        });
      }
    };
    document.addEventListener('click', gate);
    document.addEventListener('click', click);
    document.addEventListener('click', gate);
    ['veh-date-start', 'veh-date-end', 'veh-time-start', 'veh-time-end', 'veh-driver-opt'].forEach((i) => document.getElementById(i)?.addEventListener('change', calc));
    // Effacer le highlight des dates quand saisies
    ['veh-date-start', 'veh-date-end'].forEach((i) => document.getElementById(i)?.addEventListener('input', (e) => e.target.classList.remove('ring-2', 'ring-error')));
    // Etat favori initial
    const favList = Array.isArray(favs) ? favs : (favs?.results || []);
    if (favList.some((f) => f.id === v.id || f.vehicle === v.id)) {
      const t = document.getElementById('veh-fav-txt'); const b = document.getElementById('veh-fav-btn');
      if (t) t.textContent = 'Retirer des favoris'; if (b) b.classList.add('bg-error-container');
    }
    return () => document.removeEventListener('click', click);
  }, [v, favs, rev]);

  return <DesignPage html={html} links={{}} />;
}
