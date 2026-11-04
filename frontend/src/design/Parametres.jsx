import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DesignShell from './DesignShell';
import { usersAPI } from '../services/api';

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

export default function Parametres({ role = 'client' }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'en' ? 'en' : 'fr';
  const setLang = (v) => { i18n.changeLanguage(v); usersAPI.updateMe({ language: v }).catch(() => {}); };
  const [sms, setSms] = useState(true);
  const [wa, setWa] = useState(true);
  const [email, setEmail] = useState(false);
  const [push, setPush] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = (v) => { setDark(v); document.documentElement.classList.toggle('dark', v); localStorage.setItem('autolink_theme', v ? 'dark' : 'light'); };
  const [twofa, setTwofa] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <DesignShell role={role}>
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
            <div className="flex gap-1"><Opt label="Douala" active onClick={() => {}} /><Opt label="Yaoundé" active={false} onClick={() => {}} /></div>
          </Row>
          <Row icon="dark_mode" title="Mode sombre" desc="Thème de l'interface">
            <Toggle on={dark} setOn={toggleDark} />
          </Row>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span> Notifications
          </h2>
          <Row icon="sms" title="SMS transactionnels" desc="Confirmations de réservation et codes OTP"><Toggle on={sms} setOn={setSms} /></Row>
          <Row icon="chat" title="WhatsApp" desc="Alertes de prise en charge et de caution"><Toggle on={wa} setOn={setWa} /></Row>
          <Row icon="mail" title="Email" desc="Factures et relevés hebdomadaires"><Toggle on={email} setOn={setEmail} /></Row>
          <Row icon="notifications_active" title="Push navigateur" desc="Messages et rappels de location"><Toggle on={push} setOn={setPush} /></Row>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span> Sécurité
          </h2>
          <Row icon="phonelink_lock" title="Double authentification (2FA)" desc="SMS +237 670 •• •• 90"><Toggle on={twofa} setOn={setTwofa} /></Row>
          <Row icon="password" title="Mot de passe" desc="Dernière modification il y a 3 mois">
            <button type="button" className="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-colors" onClick={save}>Mettre à jour</button>
          </Row>
          <Row icon="devices" title="Sessions actives" desc="Chrome sur Windows — Douala, Cameroun">
            <button type="button" className="text-error font-label-md text-label-md font-semibold hover:underline" onClick={save}>Tout déconnecter</button>
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
    </DesignShell>
  );
}
