import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import TopUpModal, { MethodPicker, QUICK_AMOUNTS, TOPUP_METHODS } from '../../components/TopUpModal';
import { walletAPI } from '../../services/api';
import { formatDate, formatNumber, formatTime, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.client.Wallet', text, options);

const KIND_STYLES = {
  topup: { label: 'Recharge', cls: 'bg-primary-fixed/50 text-on-primary-fixed-variant', icon: 'add_circle', sign: '+' },
  refund: { label: 'Remboursement', cls: 'bg-secondary text-on-secondary', icon: 'undo', sign: '+' },
  debit: { label: 'Paiement', cls: 'bg-secondary-fixed text-on-secondary-fixed-variant', icon: 'payments', sign: '−' },
};

const METHOD_LABELS = { wallet: 'Solde portefeuille', mtn: 'MTN MoMo', orange: 'Orange Money', stripe: 'Carte bancaire', paypal: 'PayPal' };

const PERIODS = [
  { value: 30, label: 'Derniers 30 jours' },
  { value: 90, label: 'Derniers 90 jours' },
  { value: 0, label: 'Tout l’historique' },
];

const PAGE_SIZE = 8;

const TOPUP_BANNERS = {
  success: { cls: 'bg-primary-fixed/40 text-on-primary-fixed-variant', icon: 'check_circle', text: 'Paiement confirmé — votre solde a été rechargé.' },
  canceled: { cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'cancel', text: "Paiement annulé — aucun montant n'a été débité." },
  pending: { cls: 'bg-secondary-fixed text-on-secondary-fixed-variant', icon: 'hourglass_top', text: 'Paiement en cours de traitement — votre solde sera mis à jour automatiquement.' },
  error: { cls: 'bg-error-container text-on-error-container', icon: 'error', text: "Le paiement n'a pas abouti. Réessayez ou choisissez un autre moyen." },
};

const isDeposit = (tx) => /-DEP$|^DEPOSIT-/.test(tx.reference || '');

export default function Wallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [expressAmount, setExpressAmount] = useState(0);
  const [expressMethod, setExpressMethod] = useState('');
  const [configured, setConfigured] = useState([]);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [period, setPeriod] = useState(30);
  const [page, setPage] = useState(1);
  const topupResult = searchParams.get('topup');

  const load = useCallback(() => {
    walletAPI.get().then(({ data }) => { setWallet(data); setError(''); })
      .catch(() => setError(t('API injoignable — portefeuille indisponible.')));
  }, []);

  useEffect(() => {
    load();
    walletAPI.methods().then(({ data }) => {
      const list = data.configured_methods || [];
      setConfigured(list);
      const first = TOPUP_METHODS.find((m) => list.includes(m.id));
      if (first) setExpressMethod(first.id);
    }).catch(() => {});
  }, [load]);

  useEffect(() => {
    const reference = searchParams.get('ref');
    if (topupResult === 'orange' && reference) {
      walletAPI.status(reference).then(({ data }) => {
        load();
        setSearchParams({ topup: data.status === 'completed' ? 'success' : 'pending' }, { replace: true });
      }).catch(() => setSearchParams({ topup: 'error' }, { replace: true }));
    }
  }, [topupResult, searchParams, setSearchParams, load]);

  const transactions = useMemo(() => wallet?.transactions || [], [wallet]);

  const filtered = useMemo(() => {
    const since = period ? Date.now() - period * 86400000 : 0;
    const query = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (since && new Date(tx.created_at).getTime() < since) return false;
      if (kind === 'deposit' ? !isDeposit(tx) : kind && tx.kind !== kind) return false;
      if (!query) return true;
      return [tx.reference, tx.note, tx.method].some((v) => String(v || '').toLowerCase().includes(query));
    });
  }, [transactions, search, kind, period]);

  useEffect(() => { setPage(1); }, [search, kind, period]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const toppedUpThisMonth = transactions
    .filter((tx) => tx.kind === 'topup' && tx.status === 'completed' && new Date(tx.created_at) >= monthStart)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const depositsReturned = transactions.filter((tx) => tx.kind === 'refund' && /^DEPOSIT-/.test(tx.reference || ''));
  const balance = Number(wallet?.balance || 0);
  const heldDeposit = Number(wallet?.held_deposit || 0);
  const held = wallet?.held_deposits || [];

  const exportCsv = () => {
    const header = ['Date', 'Type', 'Référence', 'Libellé', 'Moyen', 'Montant', 'Solde après', 'Statut'];
    const rows = filtered.map((tx) => [tx.created_at, tx.kind, tx.reference, tx.note, tx.method, tx.amount, tx.balance_after, tx.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'releve-portefeuille-autolink.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      title={t('Mon Portefeuille & Gestion des Cautions')}
      subtitle={t('Gérez votre solde numérique, rechargez vos fonds et suivez vos cautions sous séquestre en toute transparence.')}
      actions={(
        <>
          <button onClick={() => setModal({ amount: 25000 })} className="btn-primary"><Icon name="add_circle" size={20} />{t('Recharger mon portefeuille')}</button>
          <button onClick={exportCsv} className="btn-secondary"><Icon name="download" size={20} />{t('Télécharger le relevé (CSV)')}</button>
        </>
      )}
    >
      <div className="flex flex-col gap-8">
        {topupResult && TOPUP_BANNERS[topupResult] && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-2 font-label-lg text-label-lg ${TOPUP_BANNERS[topupResult].cls}`}>
            <Icon name={TOPUP_BANNERS[topupResult].icon} />{t(TOPUP_BANNERS[topupResult].text)}
          </div>
        )}
        {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-low dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center shrink-0"><Icon name="verified_user" /></span>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Garantie séquestre des cautions')}</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">{t('Les cautions ne sont jamais encaissées par les propriétaires : elles restent bloquées pendant la location puis vous sont restituées après l’état des lieux retour.')}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="badge-neutral"><Icon name="lock" size={14} />{t('Chiffrement 256-bit')}</span>
            <span className="badge-neutral"><Icon name="account_balance" size={14} />{t('Fonds séquestrés')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-xl bg-primary text-on-primary p-6 shadow-md flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary-fixed/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed font-bold">{t('Solde disponible')}</span>
                <span className="w-9 h-9 rounded-lg bg-on-primary/15 flex items-center justify-center"><Icon name="account_balance_wallet" /></span>
              </div>
              <div className="font-headline-xl text-headline-xl tracking-tight mt-3">{wallet ? formatNumber(balance) : '—'} <span className="font-headline-sm text-headline-sm text-primary-fixed">FCFA</span></div>
              <p className="font-body-sm text-body-sm text-primary-fixed/90 mt-1">{t('Immédiatement utilisable pour vos locations et options de mobilité.')}</p>
            </div>
            <button onClick={() => setModal({ amount: 25000 })} className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-container-lowest text-primary font-label-lg text-label-lg hover:bg-primary-fixed/30 hover:text-on-primary transition-colors">
              <Icon name="bolt" size={20} />{t('Recharger via MoMo / OM / Carte')}
            </button>
          </div>

          <div className="lg:col-span-5 card-dark flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant font-bold">{t('Caution bloquée sous séquestre')}</span>
                <span className="w-9 h-9 rounded-full bg-surface-variant/15 flex items-center justify-center text-tertiary-fixed-dim"><Icon name="lock" /></span>
              </div>
              <div className="font-headline-xl text-headline-xl tracking-tight text-surface-bright mt-3">{formatNumber(heldDeposit)} <span className="font-headline-sm text-headline-sm text-surface-variant">FCFA</span></div>
            </div>
            <div className="flex flex-col gap-2">
              {held.length === 0 && <p className="font-body-sm text-body-sm text-surface-variant">{t('Aucune caution bloquée actuellement.')}</p>}
              {held.slice(0, 2).map((item) => (
                <Link key={item.booking} to={`/client/bookings/${item.booking}`} className="rounded-lg bg-surface-variant/10 hover:bg-surface-variant/20 p-3 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon name="directions_car" size={18} className="text-primary-fixed-dim" />
                    <span className="min-w-0">
                      <span className="block font-label-md text-label-md text-surface-bright truncate">{item.vehicle} (BK-{String(item.booking).padStart(4, '0')})</span>
                      <span className="block text-[11px] text-surface-variant">{formatDate(item.start_date)} → {formatDate(item.end_date)}</span>
                    </span>
                  </span>
                  <span className="font-label-md text-label-md text-tertiary-fixed-dim whitespace-nowrap">{formatNumber(item.amount)} F</span>
                </Link>
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-surface-variant border-t border-surface-variant/15 pt-3">{t('Caution restituée automatiquement à la clôture de la location sans dommage.')}</p>
          </div>

          <div className="lg:col-span-3 card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="overline">{t('Performances du compte')}</span>
              <span className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center"><Icon name="query_stats" size={18} /></span>
            </div>
            <div className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-3">
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Total rechargé ce mois')}</div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{formatNumber(toppedUpThisMonth)} FCFA</div>
            </div>
            <div className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-3">
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Cautions restituées')}</div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{formatNumber(depositsReturned.reduce((s, tx) => s + Number(tx.amount), 0))} FCFA</div>
              <div className="text-[11px] text-on-surface-variant">{t('{{count}} location(s)', { count: depositsReturned.length })}</div>
            </div>
            <div className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-3">
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Opérations enregistrées')}</div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{transactions.length}</div>
            </div>
          </div>
        </div>

        <section className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center"><Icon name="bolt" /></span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Recharge express en 1 clic')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Créditation instantanée 24h/7j sans déplacement en agence.')}</p>
              </div>
            </div>
            <span className="badge-success"><Icon name="savings" size={14} />{t('0 % de frais sur les rechargements')}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="overline mb-3">{t('1. Choisissez votre compte de débit')}</div>
              <MethodPicker methods={TOPUP_METHODS} value={expressMethod} onChange={setExpressMethod} configured={configured} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="overline">{t('2. Montant à créditer (FCFA)')}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_AMOUNTS.slice(1).map((value) => (
                  <button key={value} onClick={() => setExpressAmount(value)}
                    className={`py-3.5 rounded-xl font-headline-sm text-headline-sm transition-all border-2 ${expressAmount === value ? 'bg-primary text-on-primary border-primary shadow-md scale-105' : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant dark:bg-slate-900 dark:border-slate-700 dark:text-white hover:border-primary'}`}>
                    +{formatNumber(value)}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1 flex items-center gap-2 px-4 rounded-xl bg-surface-container-low dark:bg-slate-900 border-2 border-outline-variant dark:border-slate-700 focus-within:border-primary transition-colors">
                  <span className="font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">{t('Montant personnalisé :')}</span>
                  <input type="number" min={500} step={500} value={expressAmount} onChange={(e) => setExpressAmount(Number(e.target.value))}
                    className="w-full bg-transparent py-3 font-label-lg text-label-lg text-right focus:outline-none dark:text-white" />
                  <span className="font-label-md text-label-md text-on-surface-variant">FCFA</span>
                </label>
                <button disabled={expressAmount < 500 || !expressMethod} onClick={() => setModal({ amount: expressAmount })} className="btn-primary">
                  <Icon name="account_balance_wallet" size={20} />{t('Recharger maintenant')}
                </button>
              </div>
              <div className="rounded-xl bg-surface-container-low dark:bg-slate-900 px-4 py-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant"><Icon name="info" size={18} />{t('Nouveau solde estimé :')}
                  <strong className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{formatNumber(balance + Number(expressAmount || 0))} FCFA</strong>
                </span>
                <span className="hidden md:inline text-[11px] text-outline">{t('Validation par push USSD direct')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-surface-container-low text-on-surface-variant flex items-center justify-center"><Icon name="history" /></span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Historique complet des transactions')}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Recharges, réservations, cautions et restitutions.')}</p>
              </div>
            </div>
            <button onClick={exportCsv} className="btn-secondary py-2 px-4"><Icon name="download" size={18} />{t('Exporter CSV')}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3 mb-4">
            <label className="flex items-center gap-2 px-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest dark:bg-slate-900 dark:border-slate-700">
              <Icon name="search" size={20} className="text-outline" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Filtrer par référence, libellé…')}
                className="w-full bg-transparent py-3 font-body-md text-body-md focus:outline-none dark:text-white" />
            </label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className="input-field">
              <option value="">{t('Tous les types d’opérations')}</option>
              <option value="topup">{t('Recharges')}</option>
              <option value="debit">{t('Paiements')}</option>
              <option value="refund">{t('Remboursements')}</option>
              <option value="deposit">{t('Cautions')}</option>
            </select>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className="input-field">
              {PERIODS.map((p) => <option key={p.value} value={p.value}>{t(p.label)}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-outline-variant/30 dark:border-slate-700">
            <table className="w-full min-w-[760px]">
              <thead className="table-head">
                <tr>
                  {['Date & heure', 'Type', 'Référence', 'Libellé', 'Moyen / source', 'Montant'].map((h) => (
                    <th key={h} className={`px-4 py-3 ${h === 'Montant' ? 'text-right' : ''}`}>{t(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                {visible.map((tx) => {
                  const deposit = isDeposit(tx);
                  const style = deposit
                    ? (tx.kind === 'refund'
                      ? { label: 'Caution restituée', cls: 'bg-primary text-on-primary', icon: 'lock_open', sign: '+' }
                      : { label: 'Caution bloquée', cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'lock', sign: '−' })
                    : KIND_STYLES[tx.kind] || KIND_STYLES.debit;
                  return (
                    <tr key={tx.id} className={`${deposit && tx.kind !== 'refund' ? 'bg-tertiary-fixed/20' : ''} hover:bg-surface-container-low/60 dark:hover:bg-slate-800/60`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-label-md text-label-md text-on-surface dark:text-white">{formatDate(tx.created_at)}</div>
                        <div className="text-[11px] text-on-surface-variant">{formatTime(tx.created_at)}</div>
                      </td>
                      <td className="px-4 py-3"><span className={`badge ${style.cls}`}><Icon name={style.icon} size={14} />{t(style.label)}</span></td>
                      <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">{tx.reference || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-label-md text-label-md text-on-surface dark:text-white">{tx.note || t(style.label)}</div>
                        {tx.status !== 'completed' && <div className={`text-[11px] ${tx.status === 'failed' ? 'text-error' : 'text-tertiary'}`}>{tx.status === 'failed' ? t('Échouée') : t('En attente')}</div>}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{t(METHOD_LABELS[tx.method] || 'Solde portefeuille')}</td>
                      <td className={`px-4 py-3 text-right font-headline-sm text-headline-sm whitespace-nowrap ${style.sign === '+' ? 'text-primary' : 'text-on-surface dark:text-white'}`}>
                        {style.sign}{formatNumber(tx.amount)} <span className="font-label-sm text-label-sm">FCFA</span>
                      </td>
                    </tr>
                  );
                })}
                {!visible.length && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center font-body-md text-body-md text-on-surface-variant">{wallet ? t('Aucune opération pour ces filtres.') : t('Chargement…')}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t('Affichage de {{from}} à {{to}} sur {{total}} opérations', {
                from: filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0,
                to: Math.min(page * PAGE_SIZE, filtered.length),
                total: filtered.length,
              })}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant disabled:opacity-40 hover:bg-surface-container-low">{t('Précédent')}</button>
              {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 5).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg font-label-md text-label-md ${n === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-low text-on-surface-variant'}`}>{n}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg font-label-md text-label-md text-on-surface-variant disabled:opacity-40 hover:bg-surface-container-low">{t('Suivant')}</button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-secondary-fixed/40 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center"><Icon name="shield" /></span>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Fonds garantis et tracés')}</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Chaque mouvement est horodaté et rattaché à une référence unique. Une question ? Notre support portefeuille vous répond.')}</p>
            </div>
          </div>
          <Link to="/messages?support=1" className="btn-secondary py-2 px-4 shrink-0"><Icon name="support_agent" size={18} />{t('Support portefeuille')}</Link>
        </div>

        <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-primary/5 dark:bg-slate-900 border border-primary/20">
          <div className="text-center">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Besoin d\'un véhicule ?')}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t('Parcourez notre catalogue et réservez votre prochain véhicule.')}</p>
          </div>
          <Link to="/client/search" className="btn-primary py-3 px-6"><Icon name="directions_car" size={20} />{t('Voir le catalogue')}</Link>
        </div>
      </div>

      {modal && <TopUpModal initialAmount={modal.amount} onClose={() => { setModal(null); load(); }} onDone={load} />}
    </DashboardLayout>
  );
}
