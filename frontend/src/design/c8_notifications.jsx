import React, { useMemo } from 'react';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { notificationsAPI } from '../services/api';

const KIND_ICON = {
  booking: 'event_available', payment: 'lock_open', deposit: 'lock',
  message: 'chat_bubble', security: 'verified_user', general: 'notifications',
};
const KIND_LABEL = {
  booking: 'Réservations', payment: 'Paiements & Caution', deposit: 'Paiements & Caution',
  message: 'Messagerie', security: 'Sécurité', general: 'Général',
};
const KIND_LABEL_DRIVER = {
  booking: 'Courses', payment: 'Revenus', deposit: 'Revenus',
  message: 'Messagerie', security: 'Sécurité', general: 'Général',
};
const ROLE_TEXT = {
  driver: {
    title: 'Notifications Chauffeur',
    sub: 'Attributions de courses, confirmations de clients, paiements de vos prestations et alertes Hub.',
    options: '<option selected="" value="">Toutes</option><option value="booking">Courses</option><option value="payment">Revenus</option><option value="message">Messagerie</option><option value="security">Sécurité</option>',
    search: 'Rechercher une notification (course, paiement, message…)',
  },
  client: {
    title: 'Notifications',
    sub: 'Suivez en temps réel vos réservations, cautions et échanges AutoLink.',
    options: '<option selected="" value="">Toutes</option><option value="booking">Réservations</option><option value="payment">Paiements & Caution</option><option value="message">Messagerie</option><option value="security">Sécurité</option>',
    search: 'Rechercher une notification (caution, réservation, message…)',
  },
};
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rel = (iso) => {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  if (m < 1440) return `Il y a ${Math.floor(m / 60)} h`;
  return new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: 'numeric', month: 'short' });
};
const row = (n, labels = KIND_LABEL) => `<tr class="border-b border-outline-variant/20 ${n.is_read ? '' : 'bg-primary-fixed/10'} hover:bg-surface-container-low/60 transition-colors">
<td class="px-5 py-4"><div class="flex items-start gap-3">
<div class="w-10 h-10 rounded-xl ${n.is_read ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[20px]">${KIND_ICON[n.kind] || 'notifications'}</span></div>
<div class="min-w-0">
<span class="block font-label-md text-label-md ${n.is_read ? 'font-semibold' : 'font-bold'} text-on-surface">${esc(n.title)}</span>
<span class="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">${esc(n.message)}</span>
</div></div></td>
<td class="px-4 py-4 whitespace-nowrap"><span class="font-label-sm text-label-sm text-on-surface-variant">${labels[n.kind] || 'Général'}</span></td>
<td class="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">${rel(n.created_at)}</td>
<td class="px-4 py-4 whitespace-nowrap">${n.is_read
    ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Lue</span>'
    : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Non lue</span>'}</td>
<td class="px-4 py-4"><div class="flex items-center justify-end gap-1">
<button class="w-8 h-8 rounded-lg text-primary hover:bg-primary-fixed flex items-center justify-center transition-colors notif-open" data-id="${n.id}" data-link="${esc(n.link || '')}" title="Voir en détail" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
<button class="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors notif-read" data-id="${n.id}" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span></button>
<button class="w-8 h-8 rounded-lg text-error hover:bg-error-container flex items-center justify-center transition-colors notif-del" data-id="${n.id}" title="Supprimer" type="button"><span class="material-symbols-outlined text-[18px]">delete</span></button>
</div></td></tr>`;

const buildHtml = (list, unread, role = 'client') => {
  const T = ROLE_TEXT[role] || ROLE_TEXT.client;
  const labels = role === 'driver' ? KIND_LABEL_DRIVER : KIND_LABEL;
  return `<div class="flex flex-col w-full pb-16">
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
<div class="space-y-1">
<h1 class="font-headline-xl text-headline-xl text-on-surface">${T.title}</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        ${T.sub}
        ${unread ? `<strong class="text-primary">${unread} non lue${unread > 1 ? 's' : ''}</strong>` : 'Tout est à jour.'}
      </p>
</div>
<button class="px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2 shadow-sm shrink-0" id="mark-all-read" type="button">
<span class="material-symbols-outlined text-[18px]">done_all</span>
    Tout marquer comme lu
  </button>
</div>
<div class="bg-surface-container-lowest rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-3">
<div class="relative w-full md:flex-1">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
<input class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" id="notif-search" placeholder="${T.search}" type="text">
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-2 min-w-[200px] shrink-0">
<label class="block font-label-sm text-label-sm text-[10px] text-on-surface-variant">Catégorie</label>
<select class="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer" id="notif-kind">
${T.options}
</select>
</div>
</div>
<div class="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse min-w-[860px]">
<thead>
<tr class="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant border-b border-outline-variant/30 bg-surface-container-low/50">
<th class="px-5 py-3.5 font-semibold">Notification</th>
<th class="px-4 py-3.5 font-semibold">Catégorie</th>
<th class="px-4 py-3.5 font-semibold">Reçue</th>
<th class="px-4 py-3.5 font-semibold">Statut</th>
<th class="px-4 py-3.5 font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody class="font-body-md text-body-md" id="notif-rows">
${list.length ? list.map((n) => row(n, labels)).join('') : '<tr><td class="px-5 py-12 text-center text-on-surface-variant" colspan="5">Aucune notification pour le moment.</td></tr>'}
</tbody>
</table>
</div>
</div>
</div>`;
};

export default function C8Notifications({ role = 'client' }) {
  const { data } = useApiData(() => notificationsAPI.list(), []);
  const html = useMemo(() => {
    const items = data?.results || (Array.isArray(data) ? data : []) || [];
    const unread = data?.unread ?? items.filter((n) => !n.is_read).length;
    return buildHtml(items, unread, role);
  }, [data, role]);

  React.useEffect(() => {
    const reload = () => window.location.reload();
    const click = (e) => {
      const read = e.target.closest('.notif-read');
      const del = e.target.closest('.notif-del');
      const open = e.target.closest('.notif-open');
      if (e.target.closest('#mark-all-read')) {
        notificationsAPI.readAll().then(reload).catch(() => {});
      } else if (read) {
        notificationsAPI.read(read.dataset.id).then(reload).catch(() => {});
      } else if (del) {
        notificationsAPI.remove(del.dataset.id).then(reload).catch(() => {});
      } else if (open?.dataset.link) {
        window.location.href = open.dataset.link;
      }
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);

  React.useEffect(() => {
    const q = document.getElementById('notif-search');
    const k = document.getElementById('notif-kind');
    if (!q || !k) return undefined;
    const filter = () => {
      const needle = q.value.toLowerCase();
      const kind = k.value;
      const labels = role === 'driver' ? KIND_LABEL_DRIVER : KIND_LABEL;
      document.querySelectorAll('#notif-rows tr').forEach((tr) => {
        const text = tr.textContent.toLowerCase();
        const cat = tr.querySelector('td:nth-child(2)')?.textContent || '';
        const okKind = !kind || (labels[kind] && cat.includes(labels[kind]));
        tr.style.display = text.includes(needle) && okKind ? '' : 'none';
      });
    };
    q.addEventListener('input', filter); k.addEventListener('change', filter);
    return () => { q.removeEventListener('input', filter); k.removeEventListener('change', filter); };
  });

  return <DesignPage html={html} links={{}} role={role} />;
}
