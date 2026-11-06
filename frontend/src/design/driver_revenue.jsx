import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

const STATUS_META = {
  pending: ['En attente', 'bg-tertiary-fixed text-on-tertiary-fixed'],
  paid: ['Virement effectué', 'bg-primary-fixed text-on-primary-fixed-variant'],
  rejected: ['Refusée', 'bg-error-container text-on-error-container'],
  credited: ['Crédité', 'bg-primary-fixed text-on-primary-fixed-variant'],
};

const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

export default function DriverRevenue() {
  const [method, setMethod] = useState('mtn');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [earnings, setEarnings] = useState(null);
  const [ops, setOps] = useState([]);
  const [wdDetail, setWdDetail] = useState(null);
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const PER = 8;

  const load = () => {
    import('../services/api').then(({ driversAPI, walletAPI, withdrawalsAPI }) => {
      driversAPI.earnings().then(({ data }) => setEarnings(data)).catch(() => {});
      walletAPI.get().then(({ data }) => setWallet(data)).catch(() => {});
      Promise.all([
        driversAPI.earningLedger({ page_size: 50 }).then(({ data }) => (Array.isArray(data) ? data : (data.results || [])).map((e) => ({
          date: e.created_at, label: e.booking_ref || `Gain course #${e.booking || e.id}`,
          ref: e.booking_ref || `#${e.booking || e.id}`, method: 'Gains', amount: Number(e.amount), status: 'credited', kind: 'gain', realId: e.booking, earnId: e.id,
        }))).catch(() => []),
        withdrawalsAPI.list({ page_size: 50 }).then(({ data }) => (Array.isArray(data) ? data : (data.results || [])).map((w) => ({
          date: w.created_at, label: `Retrait ${{ mtn: 'MTN MoMo', orange: 'Orange Money', card: 'Carte bancaire' }[w.method] || w.method} ${w.phone}`,
          ref: w.reference, method: { mtn: 'MTN MoMo', orange: 'Orange Money', card: 'Carte bancaire' }[w.method] || w.method, amount: -Number(w.amount), status: w.status, kind: 'retrait', realId: w.id,
        }))).catch(() => []),
      ]).then(([g, w]) => setOps([...g, ...w]));
    });
  };

  React.useEffect(load, []);

  const balance = wallet ? Number(wallet.balance ?? wallet.available_balance ?? 0) : 0;
  const monthEarn = earnings?.monthly_earnings?.length ? earnings.monthly_earnings[earnings.monthly_earnings.length - 1] : null;
  const monthAmt = monthEarn ? Number(monthEarn.earnings) : 0;

  const withdraw = () => {
    if (state !== 'idle') return;
    const amt = parseInt(amount, 10) || 0;
    if (!amt || amt < 500) { setError('Montant minimum : 500 FCFA'); return; }
    if (amt > balance) { setError('Montant supérieur au solde disponible'); return; }
    if (!phone.trim()) { setError(method === 'card' ? 'Indiquez le numéro de carte' : 'Indiquez le numéro à créditer'); return; }
    setError(''); setState('sent');
    import('../services/api').then(({ withdrawalsAPI }) => {
      withdrawalsAPI.create({ amount: amt, method, phone: phone.trim() })
        .then(() => { setState('ok'); setTimeout(() => { setState('idle'); setAmount(''); load(); }, 2500); })
        .catch((e) => {
          setState('idle');
          setError(e.response?.data?.amount?.[0] || e.response?.data?.detail || 'Erreur lors du retrait — réessayez');
        });
    });
  };

  const toggleSort = (k) => { if (sortKey === k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(true); } };
  const sortIco = (k) => (sortKey !== k ? 'unfold_more' : sortAsc ? 'expand_less' : 'expand_more');

  const filtered = ops
    .filter((o) => !q || `${o.label} ${o.ref} ${o.method}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const v = sortKey === 'amount' ? a.amount - b.amount : sortKey === 'label' ? a.label.localeCompare(b.label, 'fr') : sortKey === 'method' ? (a.method || '').localeCompare(b.method || '', 'fr') : sortKey === 'status' ? (a.status || '').localeCompare(b.status || '', 'fr') : new Date(a.date) - new Date(b.date);
      return sortAsc ? v : -v;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const pageOps = filtered.slice((page - 1) * PER, page * PER);

  const exportCsv = () => {
    const rows = [['Date', 'Opération', 'Référence', 'Méthode', 'Montant FCFA', 'Statut'],
      ...filtered.map((o) => [new Date(o.date).toLocaleDateString('fr-FR'), o.label, o.ref, o.method, o.amount, STATUS_META[o.status]?.[0] || o.status])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    a.download = 'operations-chauffeur.csv'; a.click();
  };

  const downloadReceipt = (o) => {
    import('../services/api').then(({ driversAPI, withdrawalsAPI }) => {
      const call = o.kind === 'gain' ? driversAPI.earningReceipt(o.earnId) : withdrawalsAPI.receipt(o.realId);
      call.then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-${o.ref || o.realId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }).catch(() => alert('Reçu indisponible pour cette opération.'));
    });
  };

  return (
    <DesignShell role="driver">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1150px] mx-auto flex flex-col gap-space-lg">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Revenus &amp; Retraits</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Gains de course crédités après chaque clôture. Retraits Mobile Money traités 24h/24.</p>
        </div>

        {/* KPIs — style cards client */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {[
            ['account_balance_wallet', 'Solde disponible', fmt(balance), 'Retirable immédiatement', 'bg-emerald-100 text-emerald-700', 'bg-emerald-600'],
            ['payments', 'Gains ce mois', fmt(monthAmt), monthEarn?.month || '—', 'bg-teal-100 text-teal-700', 'bg-teal-600'],
            ['savings', 'Total encaissé', fmt(earnings?.total_earned || 0), `${earnings?.total_trips ?? 0} courses au total`, 'bg-sky-100 text-sky-700', 'bg-sky-600'],
          ].map(([icon, label, val, sub, iconCls, bar]) => (
            <div key={label} className="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
              <span className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}><Icon name={icon} size={22} /></span>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none truncate">{val}</span>
                <span className="font-label-md text-label-md text-on-surface-variant mt-1">{label}</span>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">{sub}</span>
              </div>
              <span className={`absolute top-0 bottom-0 right-0 w-1.5 ${bar}`} />
            </div>
          ))}
        </div>

        {/* Retrait express — fonctionnel */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center"><Icon name="send_money" size={22} /></div>
            <div><h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Retrait express</h2><p className="font-body-sm text-body-sm text-on-surface-variant">Virement Mobile Money — demande validée par l'équipe AutoLink Pro.</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[['mtn', 'MTN MoMo', '#FFCC00', 'M', 'Numéro MTN à créditer'], ['orange', 'Orange Money', '#FF7900', 'O', 'Numéro Orange à créditer'], ['card', 'Carte bancaire', '', 'credit_card', 'Compte carte à créditer']].map(([k, label, bg, i, sub]) => (
              <button key={k} type="button" onClick={() => setMethod(k)} className={`flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left ${method === k ? 'ring-2 ring-primary' : ''}`}>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shadow-sm text-[12px]" style={bg ? { background: bg, color: k === 'orange' ? '#fff' : '#000' } : { background: 'var(--surface-container-highest)' }}>
                  {i.length < 3 ? i : <Icon name={i} size={20} className="text-secondary" />}
                </span>
                <span className="flex flex-col"><span className="font-label-lg text-label-lg text-on-surface">{label}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span></span>
                {method === k && <Icon name="check_circle" size={18} className="text-primary ml-auto" />}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" placeholder={method === 'card' ? 'Numéro de carte bancaire' : 'Numéro à créditer (+237 6XX XX XX XX)'} className="px-4 py-3 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" />
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} type="text" placeholder={`Montant FCFA (max ${balance.toLocaleString('fr-FR')})`} className="px-4 py-3 rounded-xl bg-surface-container-low font-headline-sm text-headline-sm text-on-surface outline-none focus:ring-2 focus:ring-primary" />
          </div>
          {error && <p className="font-body-sm text-body-sm text-error flex items-center gap-1"><Icon name="error" size={16} />{error}</p>}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <button onClick={withdraw} disabled={state !== 'idle'} className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-80 flex items-center justify-center gap-2">
              {state === 'idle' && <><Icon name="payments" size={18} />Retirer {amount ? `${Number(amount).toLocaleString('fr-FR')} FCFA` : 'maintenant'}</>}
              {state === 'sent' && <><Icon name="refresh" size={18} />Demande envoyée…</>}
              {state === 'ok' && <><Icon name="check_circle" size={18} />Retrait enregistré !</>}
            </button>
          </div>
          <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="info" size={16} className="text-primary" />
            <span>Solde après retrait estimé : <strong className="text-on-surface">{Math.max(0, balance - (parseInt(amount, 10) || 0)).toLocaleString('fr-FR')} FCFA</strong></span>
          </div>
        </section>

        {/* Historique — tableau façon espace client */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historique des opérations <span className="text-on-surface-variant font-normal">({filtered.length})</span></h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Rechercher une opération…" className="w-full md:w-64 pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button onClick={exportCsv} className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors"><Icon name="download" size={16} />CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                  {[['date', 'Date'], ['label', 'Opération'], ['method', 'Méthode'], ['amount', 'Montant'], ['status', 'Statut'], [null, 'Document']].map(([k, lbl]) => (
                    <th key={lbl} className="px-3 py-2 border-b border-outline-variant/40">
                      {k ? <button onClick={() => toggleSort(k)} className="flex items-center gap-1 uppercase font-semibold hover:text-on-surface transition-colors">{lbl}<Icon name={sortIco(k)} size={14} /></button> : lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageOps.map((o, i) => (
                  <tr key={o.ref + i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-3 py-3 border-b border-outline-variant/20 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">{new Date(o.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-3 py-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${o.kind === 'gain' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'}`}><Icon name={o.kind === 'gain' ? 'directions_car' : 'send_money'} size={16} /></div>
                        <div className="flex flex-col min-w-0"><span className="font-label-md text-label-md text-on-surface truncate">{o.label}</span><span className="font-body-sm text-body-sm text-outline">{o.ref}</span></div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-outline-variant/20 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">{o.method}</td>
                    <td className={`px-3 py-3 border-b border-outline-variant/20 font-label-md text-label-md font-bold whitespace-nowrap ${o.amount < 0 ? 'text-error' : 'text-primary'}`}>{o.amount < 0 ? '−' : '+'}{Math.abs(o.amount).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-3 py-3 border-b border-outline-variant/20"><span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${STATUS_META[o.status]?.[1] || 'bg-surface-container-high text-on-surface-variant'}`}>{STATUS_META[o.status]?.[0] || o.status}</span></td>
                    <td className="px-3 py-3 border-b border-outline-variant/20 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => o.kind === 'gain' ? navigate(`/driver/courses/${o.realId}`) : setWdDetail(o)} title="Voir en détail" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center"><Icon name="visibility" size={16} /></button>
                        <button onClick={() => downloadReceipt(o)} title="Télécharger le reçu" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center"><Icon name="download" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!pageOps.length && <tr><td colSpan="6" className="px-3 py-10 text-center font-body-md text-body-md text-on-surface-variant">Aucune opération trouvée.</td></tr>}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 font-label-md text-label-md">
              <span className="text-on-surface-variant">Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors">Précédent</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors">Suivant</button>
              </div>
            </div>
          )}
        </section>
      </div>
      {wdDetail && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4" onClick={() => setWdDetail(null)}>
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Opération {wdDetail.ref}</h3>
              <button onClick={() => setWdDetail(null)} className="w-8 h-8 rounded-lg hover:bg-surface-container inline-flex items-center justify-center text-on-surface-variant"><Icon name="close" size={18} /></button>
            </div>
            <dl className="space-y-3 font-body-md text-body-md">
              {[['event', 'Date', new Date(wdDetail.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
                ['send_money', 'Opération', wdDetail.label],
                ['account_balance_wallet', 'Méthode', wdDetail.method],
                ['payments', 'Montant', `${wdDetail.amount < 0 ? '−' : '+'}${Math.abs(wdDetail.amount).toLocaleString('fr-FR')} FCFA`],
                ['task_alt', 'Statut', STATUS_META[wdDetail.status]?.[0] || wdDetail.status],
              ].map(([icon, label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon name={icon} size={18} className="text-secondary mt-0.5 shrink-0" />
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt><dd className="text-on-surface">{value}</dd></div>
                </div>
              ))}
            </dl>
            <button onClick={() => downloadReceipt(wdDetail)} className="mt-5 w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold inline-flex items-center justify-center gap-2"><Icon name="download" size={16} />Télécharger le reçu</button>
          </div>
        </div>
      )}
    </DesignShell>
  );
}
