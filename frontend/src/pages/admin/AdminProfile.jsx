import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import Icon from '../../components/Icon';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { mediaUrl } from '../../utils/media';
import { formatDate, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.AdminProfile', text, options);

const EMPTY = (user) => ({
  first_name: user?.first_name || user?.firstName || '',
  last_name: user?.last_name || user?.lastName || '',
  email: user?.email || '',
  phone: user?.phone || '',
  whatsapp: user?.whatsapp || '',
});

/* Champ déclaré HORS du composant — sinon React le remonte à chaque
   frappe (nouveau type à chaque render) et l'input perd le focus. */
function Field({ name, label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input id={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500" />
    </div>
  );
}

/* Nom d'appareil lisible depuis le user-agent. */
function deviceName(ua = '') {
  const s = ua.toLowerCase();
  const os = s.includes('windows') ? 'Windows' : s.includes('android') ? 'Android'
    : s.includes('iphone') || s.includes('ipad') ? 'iOS' : s.includes('mac') ? 'macOS'
    : s.includes('linux') ? 'Linux' : 'Appareil inconnu';
  const browser = s.includes('edg') ? 'Edge' : s.includes('chrome') ? 'Chrome'
    : s.includes('firefox') ? 'Firefox' : s.includes('safari') ? 'Safari' : 'Navigateur';
  return `${browser} · ${os}`;
}

export default function AdminProfile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState(EMPTY(user));
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  /* Mot de passe */
  const [pw, setPw] = useState({ current_password: '', new_password: '', new_password2: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  /* Sessions */
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionMsg, setSessionMsg] = useState(null);

  useEffect(() => { refreshUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(EMPTY(user)); }, [user]);

  const loadSessions = useCallback(() => {
    setSessionsLoading(true);
    usersAPI.sessions()
      .then(res => setSessions(res.data.results || res.data))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);
  useEffect(() => { loadSessions(); }, [loadSessions]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setPwField = (key) => (e) => setPw((f) => ({ ...f, [key]: e.target.value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY(user)) || !!photo;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (photo) fd.append('avatar', photo);
    const res = await updateUser(fd);
    setMsg(res.success
      ? { ok: true, text: t('Profil mis à jour avec succès.') }
      : { ok: false, text: res.error || t('Erreur lors de la mise à jour.') });
    if (res.success) setPhoto(null);
    setSaving(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true); setPwMsg(null);
    try {
      await usersAPI.updatePassword(pw);
      setPwMsg({ ok: true, text: t('Mot de passe mis à jour.') });
      setPw({ current_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.detail || t('Échec du changement de mot de passe.') });
    }
    setPwSaving(false);
  };

  const disconnect = async (jti) => {
    try {
      await usersAPI.disconnectSession(jti);
      setSessions(s => s.filter(x => x.jti !== jti));
      setSessionMsg({ ok: true, text: t('Appareil déconnecté.') });
    } catch (_) { setSessionMsg({ ok: false, text: t('Échec de la déconnexion.') }); }
  };

  const logoutAll = async () => {
    try {
      await usersAPI.logoutAllSessions();
      setSessions([]);
      setSessionMsg({ ok: true, text: t('Toutes les sessions ont été révoquées. Vous allez être redirigé vers la connexion.') });
      setTimeout(() => { localStorage.clear(); window.location.href = '/login'; }, 1500);
    } catch (_) { setSessionMsg({ ok: false, text: t('Échec de la déconnexion globale.') }); }
  };

  const initials = `${(form.first_name || '')[0] || ''}${(form.last_name || '')[0] || ''}`.toUpperCase() || 'A';
  const avatarSrc = photo ? URL.createObjectURL(photo) : user?.avatar ? mediaUrl(user.avatar) : null;

  return (
    <AdminLayout title={t('Mon profil')} subtitle={t('Informations personnelles du compte administrateur')}>
      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">
        <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center gap-3">
          {avatarSrc
            ? <img src={avatarSrc} alt="" className="w-24 h-24 rounded-full object-cover" />
            : <span className="w-24 h-24 rounded-full bg-teal-600 flex items-center justify-center text-white text-3xl font-black">{initials}</span>}
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{form.first_name} {form.last_name}</h2>
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1"><Icon name="mail" size={15} />{user?.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-wide">{t('Administrateur')}</span>
            {user?.is_superuser && <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wide">{t('Superuser')}</span>}
          </div>
          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div><div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('Membre depuis')}</div><div className="text-xs font-bold text-slate-700 dark:text-slate-200">{user?.created_at ? formatDate(user.created_at) : '—'}</div></div>
            <div><div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('Identifiant')}</div><div className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono truncate">{user?.username || user?.email}</div></div>
          </div>
          <Link to="/admin/settings" className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mt-1">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"><Icon name="settings" size={18} className="text-teal-600" />{t('Paramètres de la plateforme')}</span>
            <Icon name="chevron_right" size={18} className="text-slate-400" />
          </Link>
        </aside>

        <div className="flex flex-col gap-6">
          {/* ═══ Informations ═══ */}
          <form onSubmit={save} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Icon name="edit" size={18} className="text-teal-600" />{t('Modifier mes informations')}</h3>
            <div className="flex items-center gap-4">
              {avatarSrc
                ? <img src={avatarSrc} alt="" className="w-16 h-16 rounded-full object-cover" />
                : <span className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-black text-lg">{initials}</span>}
              <label className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {t('Changer la photo')}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="first_name" label={t('Prénom')} value={form.first_name} onChange={set('first_name')} />
              <Field name="last_name" label={t('Nom')} value={form.last_name} onChange={set('last_name')} />
              <Field name="email" label={t('Email')} type="email" value={form.email} onChange={set('email')} />
              <Field name="phone" label={t('Téléphone')} type="tel" value={form.phone} onChange={set('phone')} />
              <Field name="whatsapp" label={t('WhatsApp')} type="tel" value={form.whatsapp} onChange={set('whatsapp')} />
            </div>
            {msg && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</p>}
            <button type="submit" disabled={!dirty || saving}
              className="self-start px-6 py-3 rounded-xl bg-teal-600 text-white text-xs font-black uppercase tracking-wide hover:bg-teal-700 transition-colors disabled:opacity-40">
              {saving ? t('Enregistrement…') : t('Enregistrer')}
            </button>
          </form>

          {/* ═══ Mot de passe ═══ */}
          <form onSubmit={savePassword} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Icon name="lock" size={18} className="text-teal-600" />{t('Changer le mot de passe')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field name="current_password" label={t('Mot de passe actuel')} type="password" value={pw.current_password} onChange={setPwField('current_password')} />
              <Field name="new_password" label={t('Nouveau mot de passe')} type="password" value={pw.new_password} onChange={setPwField('new_password')} />
              <Field name="new_password2" label={t('Confirmation')} type="password" value={pw.new_password2} onChange={setPwField('new_password2')} />
            </div>
            {pwMsg && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${pwMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{pwMsg.text}</p>}
            <button type="submit" disabled={pwSaving || !pw.new_password || pw.new_password !== pw.new_password2}
              className="self-start px-6 py-3 rounded-xl bg-slate-800 text-white text-xs font-black uppercase tracking-wide hover:bg-slate-900 transition-colors disabled:opacity-40">
              {pwSaving ? t('Enregistrement…') : t('Changer le mot de passe')}
            </button>
          </form>

          {/* ═══ Sessions actives ═══ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Icon name="devices" size={18} className="text-teal-600" />{t('Sessions actives')} ({sessions.length})</h3>
              {sessions.length > 0 && (
                <button onClick={logoutAll} className="text-[10px] font-black uppercase tracking-wide text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                  {t('Tout déconnecter')}
                </button>
              )}
            </div>
            {sessionMsg && <p className={`rounded-xl px-4 py-3 text-xs font-bold ${sessionMsg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{sessionMsg.text}</p>}
            {sessionsLoading && <p className="text-xs text-slate-400 py-4 text-center">{t('Chargement…')}</p>}
            {!sessionsLoading && sessions.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">{t('Aucune session active enregistrée.')}</p>}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessions.map(s => (
                <div key={s.jti} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon name="smartphone" size={18} className="text-slate-500" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{deviceName(s.user_agent)}</p>
                      <p className="text-[10px] text-slate-400 truncate">{s.ip_address || 'IP inconnue'} · {t('connecté le')} {formatDate(s.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => disconnect(s.jti)}
                    className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-500 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                    {t('Déconnecter')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
