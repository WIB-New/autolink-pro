import React, { useMemo, useState } from 'react';
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
const KIND_LABEL_DRIVER = { ...KIND_LABEL, booking: 'Courses', payment: 'Revenus', deposit: 'Revenus' };

const ROLE_TEXT = {
  client: {
    title: 'Notifications',
    sub: 'Suivez en temps réel vos réservations, cautions et échanges AutoLink.',
    search: 'Rechercher une notification (caution, réservation, message…)',
    kinds: { booking: 'Réservations', payment: 'Paiements & Caution', message: 'Messagerie', security: 'Sécurité' },
  },
  driver: {
    title: 'Notifications Chauffeur',
    sub: 'Attributions de courses, confirmations de clients, paiements de vos prestations et alertes Hub.',
    search: 'Rechercher une notification (course, paiement, message…)',
    kinds: { booking: 'Courses', payment: 'Revenus', message: 'Messagerie', security: 'Sécurité' },
  },
  owner: {
    title: 'Notifications',
    sub: 'Demandes de location, revenus, avis locataires et alertes sur vos véhicules.',
    search: 'Rechercher une notification (location, revenu, avis…)',
    kinds: { booking: 'Réservations', payment: 'Revenus', message: 'Messagerie', security: 'Sécurité' },
  },
  admin: {
    title: 'Notifications',
    sub: 'Signalements, litiges, validations et événements de la plateforme.',
    search: 'Rechercher une notification (litige, KYC, paiement…)',
    kinds: { booking: 'Réservations', payment: 'Finances', message: 'Messagerie', security: 'Sécurité' },
  },
};

const rel = (iso) => {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  if (m < 1440) return `Il y a ${Math.floor(m / 60)} h`;
  return new Date(iso).toLocaleDateString(localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short' });
};

const iconBtn = 'w-8 h-8 rounded-lg flex items-center justify-center transition-colors';

export default function NotificationsUI({ role = 'client', hideTitle = false }) {
  const T = ROLE_TEXT[role] || ROLE_TEXT.client;
  const labels = role === 'driver' ? KIND_LABEL_DRIVER : KIND_LABEL;
  const [refresh, setRefresh] = useState(0);
  const { data } = useApiData(() => notificationsAPI.list({ ordering: '-created_at', page_size: 200 }), [refresh]);
  const reload = () => setRefresh((v) => v + 1);
  const items = useMemo(() => data?.results || (Array.isArray(data) ? data : []) || [], [data]);
  const unread = data?.unread ?? items.filter((n) => !n.is_read).length;
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const [detail, setDetail] = useState(null);

  const filtered = items.filter((n) => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    const okKind = !kind || n.kind === kind;
    return text.includes(query.toLowerCase()) && okKind;
  });

  const toggleRead = (n) => (n.is_read ? notificationsAPI.unread(n.id) : notificationsAPI.read(n.id)).then(reload).catch(() => {});
  const remove = (id) => notificationsAPI.remove(id).then(reload).catch(() => {});
  const open = (n) => { if (!n.is_read) notificationsAPI.read(n.id).catch(() => {}); setDetail(n); };

  return (
    <div className="flex flex-col w-full gap-4 p-4 lg:p-6">
      {!hideTitle && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">{T.title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              {T.sub} {unread ? <strong className="text-primary">{unread} non lue{unread > 1 ? 's' : ''}</strong> : 'Tout est à jour.'}
            </p>
          </div>
          <button type="button" onClick={() => notificationsAPI.readAll().then(reload).catch(() => {})}
            className="px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors flex items-center gap-2 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Tout marquer comme lu
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={T.search}
            className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" />
        </div>
        <div className="relative bg-surface-container-low rounded-lg px-3 py-2 min-w-[200px] shrink-0 w-full md:w-auto">
          <label className="block font-label-sm text-label-sm text-[10px] text-on-surface-variant">Catégorie</label>
          <select value={kind} onChange={(e) => setKind(e.target.value)}
            className="w-full bg-transparent font-label-sm text-label-sm text-on-surface outline-none cursor-pointer">
            <option value="">Toutes</option>
            {Object.entries(T.kinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[860px]">
            <thead>
              <tr className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="px-5 py-3.5 font-semibold">Notification</th>
                <th className="px-4 py-3.5 font-semibold">Catégorie</th>
                <th className="px-4 py-3.5 font-semibold">Reçue</th>
                <th className="px-4 py-3.5 font-semibold">Statut</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md">
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-on-surface-variant">
                  {items.length ? 'Aucune notification ne correspond à votre recherche.' : 'Aucune notification pour le moment.'}
                </td></tr>
              )}
              {filtered.map((n) => (
                <tr key={n.id} className={`border-b border-outline-variant/20 ${n.is_read ? '' : 'bg-primary-fixed/10'} hover:bg-surface-container-low/60 transition-colors`}>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${n.is_read ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-fixed text-primary'} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[20px]">{KIND_ICON[n.kind] || 'notifications'}</span>
                      </div>
                      <div className="min-w-0">
                        <span className={`block font-label-md text-label-md ${n.is_read ? 'font-semibold' : 'font-bold'} text-on-surface`}>{n.title}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant truncate max-w-md">{n.message}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap"><span className="font-label-sm text-label-sm text-on-surface-variant">{labels[n.kind] || 'Général'}</span></td>
                  <td className="px-4 py-4 whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">{rel(n.created_at)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {n.is_read
                      ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Lue</span>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Non lue</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => open(n)} title="Voir en détail" className={`${iconBtn} text-primary hover:bg-primary-fixed`}>
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button type="button" onClick={() => toggleRead(n)} title={n.is_read ? 'Marquer comme non lue' : 'Marquer comme lue'} className={`${iconBtn} text-on-surface-variant hover:bg-surface-container`}>
                        <span className="material-symbols-outlined text-[18px]">{n.is_read ? 'mark_email_unread' : 'done'}</span>
                      </button>
                      <button type="button" onClick={() => remove(n.id)} title="Supprimer" className={`${iconBtn} text-error hover:bg-error-container`}>
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${detail.is_read ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-fixed text-primary'}`}>
                <span className="material-symbols-outlined text-[24px]">{KIND_ICON[detail.kind] || 'notifications'}</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{detail.title}</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{labels[detail.kind] || detail.kind || 'Général'} · {detail.created_at ? new Date(detail.created_at).toLocaleString('fr-FR') : ''}</p>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line">{detail.message || '—'}</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setDetail(null)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Fermer</button>
              {detail.link && (
                <button type="button" onClick={() => { window.location.href = detail.link; }} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold">Voir le dossier</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
