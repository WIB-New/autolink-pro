import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { bookingsAPI, driversAPI, siteAPI, walletAPI, withdrawalsAPI } from '../services/api';
import { formatDate, formatNumber, formatTime, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Revenue', text, options);

const ACCOUNTS = [
  { id: 'mtn', label: 'MTN MoMo', short: 'MoMo', tile: 'bg-yellow-400 text-yellow-950' },
  { id: 'orange', label: 'Orange Money', short: 'OM', tile: 'bg-orange-500 text-white' },
];

const WITHDRAWAL_STATUS = {
  pending: { label: 'En attente', cls: 'badge-warning', icon: 'schedule' },
  paid: { label: 'Succès', cls: 'badge-success', icon: 'check_circle' },
  rejected: { label: 'Refusé', cls: 'badge-error', icon: 'cancel' },
};

const PAGE_SIZE = 6;

export default function Revenue() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const isOwner = user?.role === 'OWNER';
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [minimum, setMinimum] = useState(5000);
  const [account, setAccount] = useState('mtn');
  const [phone, setPhone] = useState(user?.phone || '');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const tasks = [
      walletAPI.get().then(({ data }) => setWallet(data)),
      withdrawalsAPI.list({ page_size: 50 }).then(({ data }) => setWithdrawals(data.results || data || [])),
      siteAPI.config().then(({ data }) => data.min_withdrawal_amount && setMinimum(Number(data.min_withdrawal_amount))),
    ];
    if (isOwner) {
      tasks.push(bookingsAPI.ownerStats().then(({ data }) => setStats(data)));
      tasks.push(bookingsAPI.list({ page_size: 200, ordering: '-start_date' }).then(({ data }) => {
        setRows((data.results || data || []).filter((b) => ['confirmed', 'active', 'completed'].includes(b.status)));
      }));
    } else {
      tasks.push(driversAPI.earnings().then(({ data }) => setStats(data)));
      tasks.push(driversAPI.earningLedger({ page_size: 200 }).then(({ data }) => setRows(data.results || data || [])));
    }
    const results = await Promise.allSettled(tasks);
    if (results.every((r) => r.status === 'rejected')) setMessage({ error: true, text: t('API injoignable — données financières indisponibles.') });
  }, [isOwner]);

  useEffect(() => { load(); }, [load]);

  const balance = Number(wallet?.balance || 0);
  const pendingWithdrawals = Number(wallet?.pending_withdrawals || 0);
  const pendingEscrow = Number(stats?.pending_escrow || 0);
  const yearTotal = isOwner ? Number(stats?.revenue_year || 0) : Number(stats?.total_earned || 0);
  const series = isOwner ? (stats?.monthly_series || []) : (stats?.monthly_earnings || []).map((m) => ({ month: m.month, revenue: m.earnings }));
  const maxSeries = Math.max(1, ...series.map((s) => Number(s.revenue)));

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((r) => !query || [r.vehicle_name, r.vehicle_plate, r.client_name, r.booking_reference, r.id].some((v) => String(v || '').toLowerCase().includes(query)));
  }, [rows, search]);
  const pages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const submit = async () => {
    const ok = await confirm({
      title: t('Confirmer le retrait ?'),
      message: t('{{amount}} FCFA seront débités de votre solde et virés sur {{account}} ({{phone}}) après validation.', { amount: formatNumber(amount), account: ACCOUNTS.find(a => a.id === account)?.label || account, phone }),
      confirmLabel: t('Confirmer le retrait'),
    });
    if (!ok) return;
    setBusy(true); setMessage(null);
    try {
      const { data } = await withdrawalsAPI.create({ amount: Number(amount), method: account, phone });
      setMessage({ text: t('Demande {{ref}} enregistrée : {{amount}} FCFA seront virés après validation.', { ref: data.reference, amount: formatNumber(data.amount) }) });
      setAmount('');
      load();
    } catch (e) {
      const data = e.response?.data || {};
      setMessage({ error: true, text: data.amount?.[0] || data.phone?.[0] || data.detail || t('Retrait impossible.') });
    }
    setBusy(false);
  };

  const exportCsv = () => {
    const header = isOwner ? ['Dossier', 'Début', 'Fin', 'Véhicule', 'Locataire', 'Brut', 'Commission', 'Net', 'Statut'] : ['Course', 'Date', 'Véhicule', 'Gain'];
    const data = filteredRows.map((r) => (isOwner
      ? [`BK-${r.id}`, r.start_date, r.end_date, r.vehicle_name, r.client_name, r.subtotal, r.commission_amount, r.owner_amount, r.status]
      : [r.booking_reference, r.created_at, r.vehicle_name, r.amount]));
    const csv = [header, ...data].map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'revenus-autolink.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  const amountValue = Number(amount || 0);
  const canSubmit = amountValue >= minimum && amountValue <= balance && phone.trim().length >= 8 && !busy;

  return (
    <DashboardLayout
      title={isOwner ? t('Revenus & Retraits Propriétaire') : t('Revenus & Retraits Chauffeur')}
      subtitle={t('Encaissements, virements vers Mobile Money et décompte détaillé de vos locations.')}
      actions={<button onClick={exportCsv} className="btn-secondary"><Icon name="download" size={20} />{t('Export Excel / CSV')}</button>}
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between"><span className="overline">{t('Solde disponible immédiat')}</span><span className="w-9 h-9 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name="account_balance_wallet" /></span></div>
            <div className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight">{formatNumber(balance)} <span className="font-headline-sm text-headline-sm text-on-surface-variant">FCFA</span></div>
            <span className="badge-success w-fit"><Icon name="bolt" size={14} />{t('0 % de frais sur virement MTN / Orange')}</span>
          </div>
          <div className="card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between"><span className="overline">{t('En attente de virement')}</span><span className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center"><Icon name="hourglass_top" /></span></div>
            <div className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface dark:text-white tracking-tight">{formatNumber(pendingEscrow + pendingWithdrawals)} <span className="font-headline-sm text-headline-sm text-on-surface-variant">FCFA</span></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><Icon name="info" size={16} />
              {isOwner ? t('{{escrow}} FCFA en séquestre (locations en cours) · {{w}} FCFA de retraits en traitement', { escrow: formatNumber(pendingEscrow), w: formatNumber(pendingWithdrawals) }) : t('Retraits en cours de traitement')}
            </p>
          </div>
          <div className="card flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between"><span className="overline">{isOwner ? t('Total versé ({{year}})', { year: new Date().getFullYear() }) : t('Total gagné')}</span><span className="w-9 h-9 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center"><Icon name="trending_up" /></span></div>
            <div className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface dark:text-white tracking-tight">{formatNumber(yearTotal)} <span className="font-headline-sm text-headline-sm text-on-surface-variant">FCFA</span></div>
            <div className="flex items-end gap-1 h-10">
              {series.map((s) => (
                <span key={s.month} title={`${s.month} : ${formatNumber(s.revenue)} FCFA`} className="flex-1 rounded-t bg-primary/70" style={{ height: `${Math.max(6, (Number(s.revenue) / maxSeries) * 100)}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <section className="card flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center"><Icon name="payments" /></span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Demander un retrait de fonds')}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Virement vers votre portefeuille Mobile Money après validation AutoLink.')}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="overline mb-3">{t('1. Sélectionner le compte bénéficiaire')}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCOUNTS.map((item) => (
                  <button key={item.id} onClick={() => setAccount(item.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${account === item.id ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/40 hover:bg-surface-container-low dark:border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><span className={`w-9 h-9 rounded-lg flex items-center justify-center font-label-sm text-label-sm font-black ${item.tile}`}>{item.short}</span><span className="font-label-lg text-label-lg text-on-surface dark:text-white">{item.label}</span></span>
                      {account === item.id && <Icon name="check_circle" fill className="text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
              <label className="block mt-3">
                <span className="label">{t('Numéro Mobile Money bénéficiaire')}</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+237 6XX XX XX XX" />
              </label>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="overline">{t('2. Montant à décaisser (FCFA)')}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Plafond disponible : {{amount}} FCFA', { amount: formatNumber(balance) })}</span>
              </div>
              <div className="flex items-center gap-2 px-4 rounded-xl bg-surface-container-low dark:bg-slate-900">
                <span className="font-label-lg text-label-lg text-on-surface-variant">XAF</span>
                <input type="number" min={minimum} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                  className="flex-1 bg-transparent py-3 font-headline-md text-headline-md focus:outline-none dark:text-white" />
                <span className="font-label-md text-label-md text-on-surface-variant">FCFA</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[25000, 50000, 100000].filter((v) => v <= balance).map((v) => (
                  <button key={v} onClick={() => setAmount(String(v))} className={`px-3 py-1.5 rounded-lg font-label-md text-label-md ${amountValue === v ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-low hover:bg-surface-container dark:bg-slate-900 dark:text-slate-200'}`}>{formatNumber(v)} FCFA</button>
                ))}
                <button disabled={!balance} onClick={() => setAmount(String(Math.floor(balance)))} className="ml-auto px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50">{t('Tout retirer ({{amount}} FCFA)', { amount: formatNumber(balance) })}</button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{t('Montant minimum : {{amount}} FCFA. Le montant est réservé dès la demande et recrédité en cas de refus.', { amount: formatNumber(minimum) })}</p>
            </div>
            {message && <div className={`rounded-xl px-4 py-3 font-label-lg text-label-lg ${message.error ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed/40 text-on-primary-fixed-variant'}`}>{message.text}</div>}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-surface-container-low dark:bg-slate-900">
              <span className="flex items-center gap-3 flex-1">
                <span className="w-10 h-10 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name="bolt" /></span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Traitement sous 24 h ouvrées par l’équipe finance AutoLink, notification à chaque étape.')}</span>
              </span>
              <button disabled={!canSubmit} onClick={submit} className="btn-primary w-full sm:w-auto"><Icon name="lock" size={18} />{t('Confirmer le retrait de {{amount}} FCFA', { amount: formatNumber(amountValue) })}</button>
            </div>
          </section>

          <aside className="card flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="shield" className="text-primary" />{t('Protocole sécurisé')}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Chaque retrait est vérifié par l’équipe finance avant virement vers votre numéro Mobile Money.')}</p>
            {[
              { title: 'Caution locative sanctuarisée', text: 'Les dépôts de garantie des locataires sont isolés sur un compte séquestre.' },
              { title: 'Commission transparente', text: 'La commission AutoLink est déduite avant crédit : le montant affiché est votre gain net.' },
              { title: 'Traçabilité complète', text: 'Chaque mouvement est rattaché à une référence unique visible dans votre historique.' },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex gap-2">
                <Icon name="check_circle" size={20} className="text-primary shrink-0" />
                <div><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(item.title)}</div><p className="font-body-sm text-body-sm text-on-surface-variant">{t(item.text)}</p></div>
              </div>
            ))}
          </aside>
        </div>

        <section className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{isOwner ? t('Détail par location & décomposition des revenus') : t('Détail des courses rémunérées')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Décompte transparent des commissions et montants nets.')}</p>
            </div>
            <label className="flex items-center gap-2 px-3 rounded-xl bg-surface-container-low dark:bg-slate-900 md:w-80">
              <Icon name="search" size={20} className="text-outline" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('Rechercher un dossier, véhicule, client…')} className="w-full bg-transparent py-2.5 font-body-md text-body-md focus:outline-none dark:text-white" />
            </label>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30 dark:border-slate-700">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr>
                  {(isOwner ? ['Date & dossier', 'Véhicule loué', 'Locataire', 'Montant brut', 'Commission', 'Gain net', 'Statut'] : ['Date & course', 'Véhicule', 'Gain']).map((h) => <th key={h} className="px-4 py-3">{t(h)}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                {pageRows.map((row) => (isOwner ? (
                  <tr key={row.id} className="hover:bg-surface-container-low/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3"><div className="font-label-md text-label-md text-on-surface dark:text-white">{formatDate(row.start_date)}</div><div className="font-mono text-[11px] text-on-surface-variant">BK-{String(row.id).padStart(4, '0')}</div></td>
                    <td className="px-4 py-3"><div className="font-label-md text-label-md text-on-surface dark:text-white">{row.vehicle_name}</div><div className="text-[11px] text-on-surface-variant">{row.vehicle_plate}</div></td>
                    <td className="px-4 py-3"><div className="font-label-md text-label-md text-on-surface dark:text-white">{row.client_name}</div><div className="text-[11px] text-on-surface-variant">{t('{{count}} jour(s)', { count: row.days })}</div></td>
                    <td className="px-4 py-3 font-body-md text-body-md">{formatNumber(row.subtotal)} FCFA</td>
                    <td className="px-4 py-3 font-body-md text-body-md text-error">−{formatNumber(row.commission_amount)} FCFA</td>
                    <td className="px-4 py-3 font-headline-sm text-headline-sm text-primary">{formatNumber(row.owner_amount)}</td>
                    <td className="px-4 py-3"><span className={row.status === 'completed' ? 'badge-success' : 'badge-warning'}>{row.status === 'completed' ? t('Versé') : t('En séquestre')}</span></td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    <td className="px-4 py-3"><div className="font-label-md text-label-md text-on-surface dark:text-white">{formatDate(row.created_at)}</div><div className="font-mono text-[11px] text-on-surface-variant">{row.booking_reference}</div></td>
                    <td className="px-4 py-3 font-label-md text-label-md">{row.vehicle_name}</td>
                    <td className="px-4 py-3 font-headline-sm text-headline-sm text-primary">{formatNumber(row.amount)} FCFA</td>
                  </tr>
                )))}
                {!pageRows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">{t('Aucune ligne de revenu pour le moment.')}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">{t('{{count}} enregistrement(s)', { count: filteredRows.length })}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg font-label-md text-label-md disabled:opacity-40 hover:bg-surface-container-low">{t('Précédent')}</button>
              <span className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md">{page} / {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg font-label-md text-label-md disabled:opacity-40 hover:bg-surface-container-low">{t('Suivant')}</button>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center"><Icon name="receipt_long" /></span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Historique des retraits')}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Traçabilité complète des virements vers vos comptes Mobile Money.')}</p>
            </div>
          </div>
          {!withdrawals.length && <p className="font-body-md text-body-md text-on-surface-variant py-6 text-center">{t('Aucun retrait demandé pour le moment.')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {withdrawals.map((w) => {
              const status = WITHDRAWAL_STATUS[w.status] || WITHDRAWAL_STATUS.pending;
              return (
                <div key={w.id} className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(w.created_at)} · {formatTime(w.created_at)}</span>
                    <span className={status.cls}><Icon name={status.icon} size={14} />{t(status.label)}</span>
                  </div>
                  <div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{formatNumber(w.amount)} <span className="font-label-sm text-label-sm">FCFA</span></div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Vers {{method}} ({{phone}})', { method: w.method === 'mtn' ? 'MTN MoMo' : 'Orange Money', phone: w.phone })}</div>
                  {w.admin_note && <div className="font-body-sm text-body-sm text-on-surface-variant italic">{w.admin_note}</div>}
                  <div className="px-3 py-2 rounded-lg bg-surface-container-lowest dark:bg-slate-800 font-mono text-[11px]">TX : {w.reference}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
