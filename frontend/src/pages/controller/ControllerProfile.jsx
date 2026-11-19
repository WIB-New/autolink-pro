import React, { useState } from 'react';
import DesignShell from '../../design/DesignShell';
import { authAPI, usersAPI, inspectionsAPI } from '../../services/api';
import useApiData from '../../utils/useApiData';
import { mediaUrl } from '../../utils/media';

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

const Stat = ({ icon, label, value, tone = 'bg-primary-fixed text-primary' }) => (
  <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center gap-3">
    <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
      <span className="material-symbols-outlined text-[22px]">{icon}</span>
    </span>
    <div className="min-w-0">
      <div className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">{value}</div>
      <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
    </div>
  </div>
);

/* Profil du contrôleur — identité, activité d'inspection, édition. */
export default function ControllerProfile() {
  const { data: me } = useApiData(() => authAPI.me(), []);
  const { data: stats } = useApiData(() => inspectionsAPI.dashboard(), []);
  const { data: insp } = useApiData(() => inspectionsAPI.list({ page_size: 1 }), []);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState(null);

  const name = me ? `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username : '';
  const init = name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || 'CT';
  const total = insp?.count ?? insp?.results?.length ?? null;

  const save = (e) => {
    e.preventDefault();
    const f = e.target;
    const fd = new FormData();
    ['first_name', 'last_name', 'email', 'phone', 'whatsapp'].forEach((k) => { if (f[k]?.value) fd.append(k, f[k].value); });
    if (photo) fd.append('avatar', photo);
    setSaving(true); setErr('');
    usersAPI.updateMe(fd)
      .then((res) => {
        if (res?.data) localStorage.setItem('autolink_user', JSON.stringify(res.data));
        window.location.reload();
      })
      .catch((er) => {
        const d = er?.response?.data || {};
        setErr(d.email?.[0] || d.detail || 'Échec de l\'enregistrement.');
      })
      .finally(() => setSaving(false));
  };

  const F = ({ name: n, label, type = 'text', value }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={n} className="font-label-md text-label-md text-on-surface-variant">{label}</label>
      <input id={n} name={n} type={type} defaultValue={value || ''} className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );

  return (
    <DesignShell role="controller">
      <div className="max-w-[860px] mx-auto flex flex-col gap-6 pt-4 sm:pt-6 pb-12 px-4">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Compte</span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Profil &amp; Paramètres</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Vos informations personnelles et votre activité d'inspection.</p>
        </div>

        {/* Bandeau identité */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            {me?.avatar
              ? <img src={mediaUrl(me.avatar)} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
              : <div className="w-20 h-20 rounded-2xl bg-primary text-on-primary font-headline-lg flex items-center justify-center font-black shadow-md">{init}</div>}
            {me?.is_verified && <span className="material-symbols-outlined text-primary text-[18px] absolute -bottom-1 -right-1 bg-surface-container-lowest rounded-full" style={{ fontVariationSettings: "'FILL' 1" }} title="Compte officiel vérifié">check_circle</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{name || '—'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">Contrôleur AutoLink</span>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-on-surface-variant font-body-sm text-body-sm">
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">mail</span>{me?.email || '—'}</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">call</span>{me?.phone || '—'}</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_month</span>Membre depuis le {fmtDate(me?.created_at)}</span>
            </div>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary-container transition-all">
            <span className="material-symbols-outlined text-[18px]">edit</span>Modifier mon profil
          </button>
        </section>

        {/* Activité */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon="fact_check" label="Inspections totales" value={total ?? '…'} />
          <Stat icon="task_alt" label="Cette semaine" value={stats?.completed_week ?? '…'} tone="bg-green-100 text-green-800" />
          <Stat icon="pending_actions" label="En attente" value={(stats?.entry_pending ?? 0) + (stats?.exit_pending ?? 0) || '…'} tone="bg-amber-100 text-amber-800" />
          <Stat icon="report" label="Problèmes (7j)" value={stats?.issues_week ?? '…'} tone="bg-red-100 text-red-800" />
        </section>

        {/* Coordonnées */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">contact_page</span>Coordonnées
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['mail', 'Email', me?.email],
              ['call', 'Téléphone', me?.phone],
              ['chat', 'WhatsApp', me?.whatsapp],
              ['shield_person', 'Rôle', 'Contrôleur AutoLink'],
            ].map(([icon, label, value]) => (
              <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low">
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                <div className="min-w-0">
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
                  <div className="font-label-md font-bold text-on-surface truncate">{value || '—'}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-body-sm text-on-surface-variant flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
            Pour modifier votre mot de passe ou vos sessions actives, rendez-vous dans <a href="/controller/settings" className="text-primary font-semibold underline">Paramètres</a>.
          </p>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
          <form onSubmit={save} className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-lg flex flex-col gap-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Modifier mon profil</h2>
            <div className="flex items-center gap-4">
              {me?.avatar || photo
                ? <img src={photo ? URL.createObjectURL(photo) : mediaUrl(me.avatar)} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <span className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-lg font-bold">{init}</span>}
              <label className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold cursor-pointer">
                Changer la photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="first_name" label="Prénom" value={me?.first_name} />
              <F name="last_name" label="Nom" value={me?.last_name} />
              <F name="email" label="Email (identifiant de connexion)" type="email" value={me?.email} />
              <F name="phone" label="Téléphone" value={me?.phone} />
              <F name="whatsapp" label="WhatsApp" value={me?.whatsapp} />
            </div>
            {err && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{err}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
              <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}
    </DesignShell>
  );
}
