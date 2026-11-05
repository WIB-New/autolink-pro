import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, Wallet, CheckCircle2, AlertCircle, Loader, BadgeCheck } from 'lucide-react';
import RoleLayout from '../components/RoleLayout';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS = {
  CLIENT: 'Client', OWNER: 'Propriétaire Partenaire', DRIVER: 'Chauffeur',
  ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur',
};

const card = 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6';
const input = 'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all';
const label = 'text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { refreshUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setForm({
      first_name: user?.firstName || '',
      last_name: user?.lastName || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await updateUser({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
    });
    setMsg(res.success
      ? { ok: true, text: res.offline ? 'Profil mis à jour localement — synchronisation au retour de la connexion.' : 'Profil mis à jour avec succès.' }
      : { ok: false, text: res.error || 'Erreur lors de la mise à jour.' });
    setSaving(false);
  };

  const dirty = form.first_name !== (user?.firstName || '')
    || form.last_name !== (user?.lastName || '')
    || form.phone !== (user?.phone || '');

  return (
    <RoleLayout title="Mon profil">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Mon <span className="text-teal-600">Profil</span></h1>
          <p className="text-sm text-slate-500 mt-1">Vos informations personnelles et votre identité AutoLink.</p>
        </div>

        {/* Carte identité */}
        <div className={`${card} flex items-center gap-5`}>
          <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">{ROLE_LABELS[user?.role] || user?.role}</span>
              {user?.is_verified || user?.verified ? (
                <span className="text-[10px] font-black bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg flex items-center gap-1"><BadgeCheck size={11} /> Certifié</span>
              ) : (
                <span className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">Non vérifié</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Mail size={12} /> {user?.email}
            </div>
          </div>
        </div>

        {/* Solde (clients & propriétaires) */}
        {(user?.role === 'CLIENT' || user?.role === 'OWNER') && user?.balance != null && (
          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet size={24} className="text-teal-400" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solde AutoLink</div>
                  <div className="text-2xl font-black">{Number(user.balance).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} <span className="text-sm text-teal-400">FCFA</span></div>
                </div>
              </div>
              {user.role === 'CLIENT' && (
                <div className="text-[10px] text-slate-400 text-right">Rechargez depuis votre tableau de bord</div>
              )}
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        <form onSubmit={save} className={`${card} space-y-4`}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <User size={15} className="text-teal-600" /> Informations personnelles
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Prénom</label>
              <input type="text" className={input} value={form.first_name} onChange={e => set('first_name', e.target.value)} />
            </div>
            <div>
              <label className={label}>Nom</label>
              <input type="text" className={input} value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={label}>Téléphone</label>
            <div className="relative">
              <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" className={`${input} pl-9`} placeholder="+237 6XX XX XX XX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" className={`${input} opacity-60 cursor-not-allowed`} value={user?.email || ''} disabled />
            <p className="text-[10px] text-slate-400 mt-1.5">L'adresse email ne peut pas être modifiée — contactez le support.</p>
          </div>

          {msg && (
            <div className={`rounded-xl p-3.5 text-xs font-bold flex items-center gap-2 ${msg.ok ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {msg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {msg.text}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving || !dirty}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader size={13} className="animate-spin" />}
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        {/* Compte */}
        <div className={card}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
            <Shield size={15} className="text-teal-600" /> Compte
          </h3>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <div>Membre depuis le <strong className="text-slate-700 dark:text-slate-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')) : '—'}</strong></div>
            <div>Identifiant : <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{user?.username || user?.email}</span></div>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
