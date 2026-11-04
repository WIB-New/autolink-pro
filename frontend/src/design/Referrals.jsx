import React, { useState } from 'react';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';
import useApiData from '../utils/useApiData';
import { usersAPI } from '../services/api';

const OFFERS = [
  { title: '-10 % week-end', desc: 'Locations de vendredi à dimanche sur la gamme Économique.', tag: 'WEEKEND10' },
  { title: '1 jour offert', desc: 'Dès 7 jours de location consécutifs sur la gamme Premium.', tag: 'LONG7' },
];

export default function Referrals({ role = 'client' }) {
  const { data } = useApiData(() => usersAPI.referral().then((r) => r.data), []);
  const [copied, setCopied] = useState(false);
  const code = data?.code || '…';
  const refs = data?.referred || [];
  const dmy = (d) => new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: 'numeric', month: 'short', year: 'numeric' });
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <DesignShell role={role}>
      <div className="w-full px-gutter py-space-lg flex flex-col gap-space-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Parrainage & Réductions</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Parrainez vos proches et cumulez des réductions sur vos locations.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-lg flex flex-col gap-space-md relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col gap-2">
              <span className="font-label-lg text-label-lg uppercase tracking-wide text-surface-variant">Votre code parrainage</span>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-highest/20 px-4 py-3">
                <span className="font-display-lg text-display-lg-mobile tracking-wider text-primary-fixed">{code}</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md">
                  <Icon name={copied ? 'check' : 'content_copy'} size={16} />{copied ? 'Copié' : 'Copier'}
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-surface-variant/80">Vous gagnez 5 000 FCFA quand votre filleul termine sa première location.</p>
              <p className="font-body-sm text-body-sm text-surface-variant/80">Crédits gagnés : <strong>{new Intl.NumberFormat((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')).format(Number(data?.credits || 0))} FCFA</strong></p>
            </div>
          </div>
          <div className="card flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Offres actives</h2>
            {OFFERS.map((o) => (
              <div key={o.tag} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4">
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">{o.title}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{o.desc}</div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{o.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Vos filleuls ({data?.referred_count ?? refs.length})</h2>
          <div className="flex flex-col divide-y divide-outline-variant/30">
            {refs.length === 0 && <p className="py-4 text-on-surface-variant text-body-sm">Aucun filleul pour le moment — partagez votre code pour commencer.</p>}
            {refs.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-label-lg text-label-lg font-semibold text-on-surface">{r.name}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{dmy(r.date)}</div>
                </div>
                <div className="text-right">
                  <div className={`font-label-lg text-label-lg font-bold ${r.status === 'active' ? 'text-primary' : 'text-on-surface-variant'}`}>{r.status === 'active' ? '+5 000 FCFA' : '—'}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{r.status === 'active' ? 'Bonus crédité' : 'En attente — première location'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesignShell>
  );
}
