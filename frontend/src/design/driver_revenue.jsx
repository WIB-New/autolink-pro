import React, { useState } from 'react';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

const OPS = [
  ['25 Oct 2025', 'Course Kribi — Prado TXL', '+25 000 FCFA', 'Crédité'],
  ['23 Oct 2025', 'Retrait MTN MoMo +237 670 •• •• 90', '-60 000 FCFA', 'Traitée (4 min)'],
  ['21 Oct 2025', 'Course Aéroport DLA — RAV4', '+12 000 FCFA', 'Crédité'],
  ['15 Oct 2025', 'Demi-journée Douala Akwa', '+8 500 FCFA', 'Crédité'],
  ['09 Oct 2025', 'Trajet Douala → Bafoussam', '+15 000 FCFA', 'Crédité'],
];
const MOIS = [['Août 2025', '180 000', 12], ['Septembre 2025', '135 000', 9], ['Octobre 2025', '85 000', 6]];

export default function DriverRevenue() {
  const [method, setMethod] = useState('mtn');
  const [amount, setAmount] = useState('60000');
  const [state, setState] = useState('idle');
  const [earnings, setEarnings] = useState(null);
  const [ops, setOps] = useState(null);

  const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

  React.useEffect(() => {
    import('../services/api').then(({ driversAPI }) => {
      driversAPI.earnings().then(({ data }) => setEarnings(data)).catch(() => {});
      driversAPI.earningLedger({ page_size: 15 }).then(({ data }) => {
        const rows = Array.isArray(data) ? data : (data.results || []);
        if (rows.length) setOps(rows.map((e) => [
          new Date(e.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          e.booking_ref || `Gain course #${e.booking || e.id}`, `+${Number(e.amount).toLocaleString('fr-FR')} FCFA`, 'Crédité']));
      }).catch(() => {});
    });
  }, []);

  const balance = earnings ? Number(earnings.total_earned || 0) : 85000;
  const monthEarn = earnings?.monthly_earnings?.[0];
  const monthAmt = monthEarn ? Number(monthEarn.earnings) : balance;

  const withdraw = () => {
    if (state !== 'idle') return;
    setState('sent');
    setTimeout(() => setState('ok'), 1600);
    setTimeout(() => setState('idle'), 4000);
  };

  return (
    <DesignShell role="driver">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1150px] mx-auto flex flex-col gap-space-lg">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Revenus chauffeur · Zone CEMAC</span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Revenus &amp; Retraits</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Gains de course crédités après chaque clôture. Retraits Mobile Money traités 24h/24.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="rounded-xl bg-primary text-on-primary p-6 shadow-md flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">Solde disponible</span>
            <div className="flex items-baseline gap-2"><span className="font-display-lg text-display-lg">{balance.toLocaleString('fr-FR')}</span><span className="font-headline-md text-headline-md text-primary-fixed">FCFA</span></div>
            <span className="font-body-sm text-body-sm text-primary-fixed-dim">Retirable immédiatement</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Gains ce mois</span>
            <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">{fmt(monthAmt)}</span>
            <span className="font-body-sm text-body-sm text-primary flex items-center gap-1"><Icon name="trending_up" size={16} />{monthEarn?.month || 'ce mois'}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Total encaissé</span>
            <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">{fmt(earnings?.total_earned)}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{earnings?.total_trips ?? 0} courses au total</span>
          </div>
        </div>

        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"><Icon name="send_money" size={22} /></div>
            <div><h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Retrait express</h2><p className="font-body-sm text-body-sm text-on-surface-variant">0 FCFA de frais · Prompt USSD de validation</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[['mtn', 'MTN MoMo', '#FFCC00', 'M', '+237 670 •• •• 90'], ['om', 'Orange Money', '#FF7900', 'O', '+237 699 •• •• 42'], ['visa', 'Carte UBA', '', 'credit_card', '•••• 4129']].map(([k, label, bg, i, sub]) => (
              <button key={k} type="button" onClick={() => setMethod(k)} className={`flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left ${method === k ? 'ring-2 ring-primary' : ''}`}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shadow-sm text-[12px]" style={bg ? { background: bg, color: k === 'om' ? '#fff' : '#000' } : { background: 'var(--surface-container-highest)' }}>
                  {i.length < 3 ? i : <Icon name={i} size={20} className="text-secondary" />}
                </span>
                <span className="flex flex-col"><span className="font-label-lg text-label-lg text-on-surface">{label}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span></span>
                {method === k && <Icon name="check_circle" size={18} className="text-primary ml-auto" />}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} type="text" className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low font-headline-sm text-headline-sm text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Montant FCFA" />
            <button onClick={withdraw} disabled={state !== 'idle'} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2">
              {state === 'idle' && <><Icon name="payments" size={18} />Retirer {amount ? `${Number(amount).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} FCFA` : 'maintenant'}</>}
              {state === 'sent' && <><Icon name="refresh" size={18} />Prompt USSD envoyé...</>}
              {state === 'ok' && <><Icon name="check_circle" size={18} />Retrait approuvé !</>}
            </button>
          </div>
          <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="info" size={16} className="text-primary" />
            <span>Solde après retrait estimé : <strong className="text-on-surface">{Math.max(0, balance - (parseInt(amount, 10) || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} FCFA</strong></span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          <section className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historique des opérations</h2>
            <div className="flex flex-col divide-y divide-surface-container">
              {(ops || OPS).map(([d, lbl, amt, st]) => (
                <div key={d + lbl} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0"><span className="font-label-md text-label-md text-on-surface truncate">{lbl}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{d}</span></div>
                  <div className="flex flex-col items-end shrink-0"><span className={`font-label-md text-label-md font-bold ${amt.startsWith('-') ? 'text-error' : 'text-primary'}`}>{amt}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{st}</span></div>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Gains mensuels</h2>
            {(earnings?.monthly_earnings?.length ? earnings.monthly_earnings.map((x) => [x.month, Number(x.earnings).toLocaleString('fr-FR'), x.trips]) : MOIS).map(([m, amt, n]) => (
              <div key={m} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-on-surface capitalize">{m}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{n} courses</span></div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{amt}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </DesignShell>
  );
}
