import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DesignShell from './DesignShell';
import OwnerLayout from '../components/ownerdash/OwnerLayout';
import { usersAPI, authAPI } from '../services/api';
import useApiData from '../utils/useApiData';

function Row({ icon, title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
      <div className="flex items-center gap-space-sm min-w-0">
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="font-label-lg text-label-lg font-semibold text-on-surface">{title}</span>
          {desc && <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{desc}</span>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ on, setOn }) {
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-primary' : 'bg-surface-container-high'}`}
    >
      <span className={`w-4 h-4 bg-surface-container-lowest rounded-full absolute top-1 transition-all ${on ? 'right-1' : 'left-1'}`} />
    </button>
  );
}

const Opt = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all ${active ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
  >
    {label}
  </button>
);

/* Chrome adaptatif : OwnerLayout pour le propriétaire, DesignShell sinon. */
const Shell = ({ role, children }) => (role === 'owner' ? <OwnerLayout>{children}</OwnerLayout> : <DesignShell role={role}>{children}</DesignShell>);

export default function Parametres({ role = 'client' }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const setLang = (v) => { i18n.changeLanguage(v); usersAPI.updateMe({ language: v }).catch(() => {}); };
  const [notif, setNotif] = useState({ sms: true, wa: true, email: false, push: true });
  const setNotifKey = (k) => (v) => {
    setNotif((p) => {
      const next = { ...p, [k]: v };
      usersAPI.updateMe({ notif_prefs: next }).catch(() => {});
      return next;
    });
  };
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = (v) => { setDark(v); document.documentElement.classList.toggle('dark', v); localStorage.setItem('autolink_theme', v ? 'dark' : 'light'); };
  const [twofa, setTwofa] = useState(true);
  const [saved, setSaved] = useState(false);
  const [city, setCity] = useState('douala');
  const [pwOpen, setPwOpen] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState(false);
  const [pwVal, setPwVal] = useState('');
  const [pwShow, setPwShow] = useState({}); // visibilité par champ
  const [fpStep, setFpStep] = useState(null); // 'code' = réinit via OTP email
  const [sessOpen, setSessOpen] = useState(false);
  const [sessList, setSessList] = useState([]);
  const [sessBusy, setSessBusy] = useState(false);
  const [sessErr, setSessErr] = useState('');

  const parseAgent = (ua = '') => {
    const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur';
    const o = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Autre OS';
    return `${b} sur ${o}`;
  };
  const openSessions = () => {
    setSessOpen(true); setSessErr(''); setSessBusy(true);
    usersAPI.sessions().then((r) => setSessList(r.data?.results || r.data || [])).catch(() => setSessErr('Impossible de charger les sessions.')).finally(() => setSessBusy(false));
  };
  const logoutAll = () => {
    if (!window.confirm('Déconnecter tous les appareils (y compris celui-ci) ?')) return;
    usersAPI.logoutAllSessions().catch(() => {}).finally(() => {
      localStorage.clear(); window.location.href = '/login';
    });
  };
  const PW_CHECKS = [
    ['Au moins 8 caractères', (v) => v.length >= 8],
    ['Une majuscule (A-Z)', (v) => /[A-Z]/.test(v)],
    ['Une minuscule (a-z)', (v) => /[a-z]/.test(v)],
    ['Un chiffre (0-9)', (v) => /\d/.test(v)],
    ['Un symbole (!@#…)', (v) => /[^A-Za-z0-9]/.test(v)],
  ];
  const pwScore = PW_CHECKS.filter(([, test]) => test(pwVal)).length;
  const pwLevel = pwScore <= 2 ? ['bg-error', 'Faible'] : pwScore <= 4 ? ['bg-amber-500', 'Moyen'] : ['bg-primary', 'Fort'];
  const { data: me } = useApiData(() => authAPI.me(), []);

  useEffect(() => {
    if (me?.city) setCity(me.city.toLowerCase().includes('yaound') ? 'yaounde' : 'douala');
    if (me?.notif_prefs && typeof me.notif_prefs === 'object') setNotif((p) => ({ ...p, ...me.notif_prefs }));
    if (me?.notif_prefs?.twofa !== undefined) setTwofa(me.notif_prefs.twofa);
  }, [me]);

  const save = () => {
    usersAPI.updateMe({ city: city === 'yaounde' ? 'Yaoundé' : 'Douala' })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }).catch(() => {});
  };

  return (
    <Shell role={role}>
      <div className="max-w-[860px] mx-auto flex flex-col gap-space-lg pt-4 sm:pt-6 pb-12">
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Compte &amp; Application</span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Paramètres</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Préférences de votre espace client — données d'exemple, aucune synchronisation serveur.</p>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">language</span> Région &amp; Langue
          </h2>
          <Row icon="translate" title="Langue de l'interface" desc="Appliquée à l'ensemble de l'application">
            <div className="flex gap-1"><Opt label="Français" active={lang === 'fr'} onClick={() => setLang('fr')} /><Opt label="English" active={lang === 'en'} onClick={() => setLang('en')} /></div>
          </Row>
          <Row icon="payments" title="Devise" desc="Franc CFA zone CEMAC">
            <span className="font-label-md text-label-md font-bold text-on-surface">FCFA (XAF)</span>
          </Row>
          <Row icon="location_on" title="Ville de prédilection" desc="Pré-remplie lors des recherches">
            <div className="flex gap-1"><Opt label="Douala" active={city === 'douala'} onClick={() => setCity('douala')} /><Opt label="Yaoundé" active={city === 'yaounde'} onClick={() => setCity('yaounde')} /></div>
          </Row>
          <Row icon="dark_mode" title="Mode sombre" desc="Thème de l'interface">
            <Toggle on={dark} setOn={toggleDark} />
          </Row>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span> Notifications
          </h2>
          <Row icon="sms" title="SMS transactionnels" desc="Confirmations de réservation et codes OTP"><Toggle on={notif.sms} setOn={setNotifKey('sms')} /></Row>
          <Row icon="chat" title="WhatsApp" desc="Alertes de prise en charge et de caution"><Toggle on={notif.wa} setOn={setNotifKey('wa')} /></Row>
          <Row icon="mail" title="Email" desc="Factures et relevés hebdomadaires"><Toggle on={notif.email} setOn={setNotifKey('email')} /></Row>
          <Row icon="notifications_active" title="Push navigateur" desc="Messages et rappels de location"><Toggle on={notif.push} setOn={setNotifKey('push')} /></Row>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span> Sécurité
          </h2>
          <Row icon="phonelink_lock" title="Double authentification (2FA)" desc="SMS +237 670 •• •• 90"><Toggle on={twofa} setOn={(v) => { setTwofa(v); usersAPI.updateMe({ notif_prefs: { ...notif, twofa: v } }).catch(() => {}); }} /></Row>
          <Row icon="password" title="Mot de passe" desc="Dernière modification il y a 3 mois">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors" onClick={() => { setPwOpen(true); setPwErr(''); setPwOk(false); }}>Mettre à jour</button>
          </Row>
          <Row icon="devices" title="Sessions actives" desc="Appareils connectés au compte">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors mr-2" onClick={openSessions}>Voir les appareils</button>
            <button type="button" className="text-error font-label-md text-label-md font-semibold hover:underline" onClick={logoutAll}>Tout déconnecter</button>
          </Row>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-tertiary text-[20px]">download</span> Données personnelles
          </h2>
          <Row icon="folder_shared" title="Exporter mes données (CEMAC)" desc="Historique réservations, factures et documents">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors" onClick={() => window.print()}>PDF</button>
          </Row>
          <Row icon="delete_forever" title="Supprimer mon compte" desc="Irréversible — exportez vos données d'abord">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-error-container text-error hover:bg-error hover:text-on-error font-label-md text-label-md font-semibold transition-colors" onClick={save}>Supprimer</button>
          </Row>
        </section>

        <div className="flex items-center justify-between">
          <button type="button" onClick={save} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all active:scale-[0.98]">
            Enregistrer les préférences
          </button>
          <span className={`font-label-md text-label-md text-primary font-semibold transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>Préférences enregistrées ✓</span>
        </div>
      </div>
      {sessOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setSessOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Appareils connectés</h2>
            {sessBusy && <p className="font-body-sm text-on-surface-variant">Chargement…</p>}
            {sessErr && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{sessErr}</p>}
            {!sessBusy && !sessErr && sessList.length === 0 && <p className="font-body-sm text-on-surface-variant">Aucune session enregistrée.</p>}
            {sessList.map((s) => (
              <div key={s.jti} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low">
                <div className="min-w-0">
                  <div className="font-label-md font-bold text-on-surface truncate">{parseAgent(s.user_agent)}</div>
                  <div className="font-body-sm text-[12px] text-on-surface-variant">
                    {s.ip_address ? `IP ${s.ip_address} · ` : ''}Connexion : {new Date(s.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <button type="button" title="Déconnecter cet appareil" onClick={() => {
                  usersAPI.disconnectSession(s.jti).then(() => setSessList((l) => l.filter((x) => x.jti !== s.jti))).catch(() => {});
                }} className="w-8 h-8 rounded-lg hover:bg-error-container text-on-error-container inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={logoutAll} className="flex-1 py-2.5 rounded-lg bg-error-container text-on-error-container font-label-md font-bold">Tout déconnecter</button>
              <button type="button" onClick={() => setSessOpen(false)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Fermer</button>
            </div>
          </div>
        </div>
      )}
      {pwOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setPwOpen(false); }}>
          <form className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl" onSubmit={(e) => {
            e.preventDefault();
            const f = e.target;
            setPwBusy(true); setPwErr('');
            if (fpStep === 'code') {
              if (f.new_password.value !== f.new_password2.value) { setPwErr('Les mots de passe ne correspondent pas.'); setPwBusy(false); return; }
              authAPI.resetPassword({ email: me.email, code: f.fp_code.value.trim(), new_password: f.new_password.value })
                .then(() => setPwOk(true))
                .catch((er) => setPwErr(er?.response?.data?.detail || 'Échec de la réinitialisation.'))
                .finally(() => setPwBusy(false));
              return;
            }
            usersAPI.updatePassword({
              current_password: f.current_password.value,
              new_password: f.new_password.value,
              new_password2: f.new_password2.value,
            }).then(() => setPwOk(true)).catch((er) => setPwErr(er?.response?.data?.detail || 'Échec de la mise à jour.')).finally(() => setPwBusy(false));
          }}>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Mettre à jour le mot de passe</h2>
            {pwOk ? (
              <>
                <p className="font-body-md text-body-md text-on-surface-variant">Mot de passe mis à jour avec succès.</p>
                <button type="button" onClick={() => setPwOpen(false)} className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold">Fermer</button>
              </>
            ) : (
              <>
                {fpStep === 'code' ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Un code de vérification a été envoyé à <strong>{me?.email}</strong>.</p>
                    <input name="fp_code" inputMode="numeric" maxLength={6} required placeholder="Code à 6 chiffres"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface text-center tracking-widest font-body-md outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                ) : null}
                {[
                  ...(fpStep === 'code' ? [] : [{ name: 'current_password', placeholder: 'Mot de passe actuel', auto: 'current-password', val: undefined, onCh: undefined }]),
                  { name: 'new_password', placeholder: 'Nouveau mot de passe', auto: 'new-password', val: pwVal, onCh: (e) => setPwVal(e.target.value) },
                  { name: 'new_password2', placeholder: 'Confirmer le nouveau mot de passe', auto: 'new-password', val: undefined, onCh: undefined },
                ].map((f) => (
                  <div key={f.name} className="relative">
                    <input name={f.name} type={pwShow[f.name] ? 'text' : 'password'} required minLength={f.name === 'current_password' ? 1 : 8} placeholder={f.placeholder} autoComplete={f.auto}
                      {...(f.val !== undefined ? { value: f.val, onChange: f.onCh } : {})}
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" onClick={() => setPwShow((s) => ({ ...s, [f.name]: !s[f.name] }))} aria-label={pwShow[f.name] ? 'Masquer' : 'Afficher'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-[19px]">{pwShow[f.name] ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                ))}
                {pwVal && (
                  <div className="flex flex-col gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${pwLevel[0]}`} style={{ width: `${(pwScore / PW_CHECKS.length) * 100}%` }} />
                      </div>
                      <span className={`font-label-sm text-[11px] font-bold transition-colors ${pwScore === PW_CHECKS.length ? 'text-primary' : pwScore >= 3 ? 'text-amber-600' : 'text-error'}`}>{pwLevel[1]}</span>
                    </div>
                    <ul className="grid grid-cols-1 gap-1">
                      {PW_CHECKS.map(([label, test]) => {
                        const ok = test(pwVal);
                        return (
                          <li key={label} className={`flex items-center gap-2 font-body-sm text-[12px] transition-all duration-300 ${ok ? 'text-primary' : 'text-on-surface-variant'}`}>
                            <span className={`material-symbols-outlined text-[15px] transition-all duration-300 ${ok ? 'text-primary scale-110' : 'text-outline scale-90'}`}>{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {fpStep !== 'code' && (
                  <button type="button" disabled={pwBusy} onClick={() => {
                    setPwBusy(true); setPwErr('');
                    authAPI.otpRequest({ email: me.email })
                      .then(() => setFpStep('code'))
                      .catch(() => setPwErr("Impossible d'envoyer le code — réessayez."))
                      .finally(() => setPwBusy(false));
                  }} className="self-end font-label-sm text-label-sm text-primary hover:underline disabled:opacity-60">Mot de passe oublié ?</button>
                )}
                {pwErr && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{pwErr}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setPwOpen(false); setFpStep(null); }} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
                  <button type="submit" disabled={pwBusy} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{pwBusy ? 'Enregistrement…' : 'Enregistrer'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </Shell>
  );
}
