import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import TopUpModal from '../../components/TopUpModal';
import { walletAPI, bookingsAPI, vehiclesAPI } from '../../services/api';
import { RENTAL_TYPES } from '../../utils/carImages';
import { vehicleImage, vehicleName, vehicleRate } from '../../utils/vehicles';
import { formatNumber, formatDate, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.client.ClientDashboard', text, options);

const STATUS = {
  completed: { label: 'Terminé', cls: 'badge-neutral' },
  pending: { label: 'En attente de paiement', cls: 'badge-warning' },
  active: { label: 'En cours', cls: 'badge-success' },
  confirmed: { label: 'Confirmé', cls: 'badge-info' },
  cancelled: { label: 'Annulé', cls: 'badge-neutral' },
  disputed: { label: 'Litige', cls: 'badge-error' },
};

const TOPUP_BANNERS = {
  success: { cls: 'bg-primary-fixed/40 text-on-primary-fixed-variant', icon: 'check_circle', text: 'Paiement confirmé — votre solde a été rechargé.' },
  canceled: { cls: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', icon: 'cancel', text: "Paiement annulé — aucun montant n'a été débité." },
  pending: { cls: 'bg-secondary-fixed text-on-secondary-fixed-variant', icon: 'hourglass_top', text: 'Paiement en cours de traitement — votre solde sera mis à jour automatiquement.' },
  error: { cls: 'bg-error-container text-on-error-container', icon: 'error', text: "Le paiement n'a pas abouti. Réessayez ou choisissez un autre moyen." },
};

const FORMULA_ICONS = { urban_3h: 'timer', urban_8h: 'schedule', urban_day: 'calendar_month', intercity: 'alt_route', long_haul: 'date_range' };

const txSign = (tx) => (tx.kind === 'refund' || tx.kind === 'topup' ? '+' : '−');
const txIcon = (tx) => (/-DEP$|^DEPOSIT-/.test(tx.reference || '') ? (tx.kind === 'refund' ? 'lock_open' : 'lock') : tx.kind === 'topup' ? 'add_card' : tx.kind === 'refund' ? 'undo' : 'key');

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [wallet, setWallet] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, distinct_vehicles: 0, bookings_total: 0, total_spent: 0 });
  const [quick, setQuick] = useState({ city: '', type: 'urban_day', start: new Date().toISOString().slice(0, 10) });
  const topupResult = searchParams.get('topup');

  const loadWallet = () => walletAPI.get().then(({ data }) => setWallet(data)).catch(() => {});

  useEffect(() => {
    loadWallet();
    bookingsAPI.clientStats().then(({ data }) => setStats(data)).catch(() => {});
    bookingsAPI.getAll({ page_size: 50, ordering: '-start_date' }).then(({ data }) => setBookings(data.results || data || [])).catch(() => {});
    vehiclesAPI.getAll({ status: 'approved', ordering: '-rating', page_size: 2 }).then(({ data }) => setFeatured((data.results || data || []).slice(0, 2))).catch(() => {});
    // Retour Stripe/PayPal : message puis nettoyage de l'URL
    if (topupResult && topupResult !== 'orange') {
      const timer = setTimeout(() => setSearchParams({}, { replace: true }), 8000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [topupResult, setSearchParams]);

  useEffect(() => {
    const reference = searchParams.get('ref');
    if (topupResult !== 'orange' || !reference) return;
    walletAPI.status(reference).then(({ data }) => {
      if (data.status === 'completed') loadWallet();
      setSearchParams({ topup: data.status === 'completed' ? 'success' : 'pending' }, { replace: true });
    }).catch(() => setSearchParams({ topup: 'error' }, { replace: true }));
  }, [topupResult, searchParams, setSearchParams]);

  const upcoming = useMemo(() => bookings
    .filter((b) => ['confirmed', 'active', 'pending'].includes(b.status))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0], [bookings]);

  const monthly = useMemo(() => {
    const months = [];
    const cursor = new Date(); cursor.setDate(1);
    for (let i = 3; i >= 0; i -= 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const total = bookings.filter((b) => b.status !== 'cancelled').filter((b) => {
        const start = new Date(b.start_date);
        return `${start.getFullYear()}-${start.getMonth()}` === key;
      }).reduce((sum, b) => sum + Number(b.subtotal || 0), 0);
      months.push({ label: formatDate(date, { month: 'short' }), total });
    }
    return months;
  }, [bookings]);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.total));

  const balance = Number(wallet?.balance ?? user?.balance ?? 0);
  const held = Number(wallet?.held_deposit || 0);
  const kycStatus = user?.kyc_status || 'none';
  const transactions = (wallet?.transactions || []).slice(0, 4);

  const quickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ type: quick.type, start: quick.start });
    if (quick.city) params.set('city', quick.city);
    navigate(`/catalog?${params}`);
  };

  return (
    <DashboardLayout title={t('Tableau de bord')}>
      <div className="flex flex-col gap-8">
        {topupResult && TOPUP_BANNERS[topupResult] && (
          <div className={`rounded-xl px-4 py-3 flex items-center gap-2 font-label-lg text-label-lg ${TOPUP_BANNERS[topupResult].cls}`}><Icon name={TOPUP_BANNERS[topupResult].icon} />{t(TOPUP_BANNERS[topupResult].text)}</div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="page-title">{t('Bonjour, {{name}}', { name: user?.firstName || '' })} 👋</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{t('Compte actif')}</span>
            </div>
            <p className="page-subtitle mt-1">{t('Ravi de vous revoir sur votre espace AutoLink Pro.')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/client/search')} className="btn-primary py-2.5 px-4"><Icon name="directions_car" size={20} />{t('Rechercher un véhicule')}</button>
            <button onClick={() => setShowTopUp(true)} className="btn-secondary py-2.5 px-4"><Icon name="add_card" size={20} className="text-primary" />{t('Recharger mon portefeuille')}</button>
            <button onClick={() => navigate('/client/bookings')} className="btn-secondary py-2.5 px-4"><Icon name="download" size={20} className="text-secondary" />{t('Factures')}</button>
          </div>
        </div>

        {(kycStatus !== 'approved' || upcoming?.status === 'confirmed') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kycStatus !== 'approved' && (
              <div className={`flex items-start justify-between gap-4 p-4 rounded-xl shadow-sm ${kycStatus === 'pending' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                <div className="flex items-start gap-2">
                  <Icon name={kycStatus === 'pending' ? 'hourglass_top' : 'warning'} className={kycStatus === 'pending' ? '' : 'text-error'} />
                  <div>
                    <div className={`font-label-md text-label-md uppercase tracking-wider font-bold ${kycStatus === 'pending' ? '' : 'text-error'}`}>{kycStatus === 'pending' ? t('Documents en vérification') : t('Pièce justificative requise')}</div>
                    <p className="font-body-md text-body-md">{kycStatus === 'pending' ? t('Notre équipe vérifie vos documents. Vous serez notifié dès leur validation.') : kycStatus === 'rejected' ? (user?.kyc_note || t('Vos documents ont été refusés. Déposez de nouvelles pièces.')) : t("Déposez votre pièce d'identité et votre permis pour accélérer vos prochaines réservations.")}</p>
                  </div>
                </div>
                {kycStatus !== 'pending' && <Link to="/profile" className="shrink-0 px-4 py-1.5 rounded-lg bg-surface-container-lowest text-error font-label-md text-label-md shadow-sm">{t('Mettre à jour')}</Link>}
              </div>
            )}
            {upcoming?.status === 'confirmed' && (
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
                <div className="flex items-start gap-2">
                  <Icon name="assignment_turned_in" className="text-tertiary" />
                  <div>
                    <div className="font-label-md text-label-md uppercase tracking-wider font-bold text-tertiary">{t('Prochaine prise en charge')}</div>
                    <p className="font-body-md text-body-md">{t('{{vehicle}} le {{date}}. Préparez vos documents pour l’état des lieux.', { vehicle: upcoming.vehicle_name, date: formatDate(upcoming.start_date) })}</p>
                  </div>
                </div>
                <Link to={`/client/bookings/${upcoming.id}`} className="shrink-0 px-4 py-1.5 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md">{t('Ouvrir')}</Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 card-dark flex flex-col justify-between gap-6">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2 font-label-lg text-label-lg uppercase tracking-wide text-surface-variant"><Icon name="account_balance_wallet" className="text-primary-fixed-dim" />{t('Portefeuille mobilité sécurisé')}</span>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="font-label-md text-label-md text-surface-variant">{t('Solde disponible')}</span>
                <div className={`${String(Math.round(balance)).length > 8 ? 'font-headline-lg text-headline-lg-mobile' : 'font-headline-xl text-headline-xl'} text-surface-bright tracking-tight leading-none mt-1 break-words`}>{wallet ? formatNumber(balance) : '—'} <span className="font-label-lg text-label-lg text-primary-fixed-dim">FCFA</span></div>
                <span className="font-body-sm text-body-sm text-surface-variant/80">{t('Immédiatement utilisable pour vos trajets')}</span>
              </div>
              <div className="sm:pl-4 sm:border-l sm:border-surface-variant/20">
                <span className="flex items-center gap-1 font-label-md text-label-md text-surface-variant">{t('Caution séquestrée bloquée')}<Icon name="lock" size={16} className="text-tertiary-fixed-dim" /></span>
                <div className="font-headline-lg text-headline-lg text-surface-bright mt-1">{formatNumber(held)} <span className="font-label-lg text-label-lg text-surface-variant">FCFA</span></div>
                <span className="font-body-sm text-body-sm text-surface-variant/80">{t('Débloquée automatiquement à la fin de la location sans litige.')}</span>
              </div>
            </div>
            <div className="relative pt-4 border-t border-surface-variant/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[['bg-primary-fixed', 'MTN MoMo'], ['bg-tertiary-fixed-dim', 'Orange Money']].map(([dot, label]) => <span key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest/20 font-label-sm text-label-sm text-surface-bright"><span className={`w-2.5 h-2.5 rounded-full ${dot}`} />{label}</span>)}
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-highest/20 font-label-sm text-label-sm text-surface-bright"><Icon name="credit_card" size={14} />{t('Carte bancaire')}</span>
              </div>
              <button onClick={() => setShowTopUp(true)} className="btn-primary py-2.5">{t('Recharger via MoMo / OM / Carte')}</button>
            </div>
          </div>

          <div className="lg:col-span-5 card flex flex-col gap-5">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Activité mobilité')}</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: stats.bookings_total, label: 'Locations', sub: t('{{n}} véhicule(s)', { n: stats.distinct_vehicles }) },
                { value: `${formatNumber(Number(stats.total_spent || 0))}`, label: 'FCFA dépensés', sub: t('au total') },
                { value: Number(stats.average_rating || 0).toFixed(1), label: 'Note donnée', sub: t('{{n}} avis', { n: stats.rated_count || 0 }) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-3 text-center">
                  <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white truncate">{item.value}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{t(item.label)}</div>
                  <div className="text-[10px] text-outline">{item.sub}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between font-label-md text-label-md text-on-surface-variant mb-2"><span>{t('Dépenses mensuelles de mobilité')}</span><span>{formatNumber(monthly.reduce((s, m) => s + m.total, 0))} FCFA</span></div>
              <div className="flex items-end gap-3 h-28">
                {monthly.map((month, index) => (
                  <div key={month.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div title={`${formatNumber(month.total)} FCFA`} className={`w-full rounded-t-lg ${index === monthly.length - 1 ? 'bg-primary' : 'bg-secondary-container'}`} style={{ height: `${Math.max(6, (month.total / maxMonth) * 100)}%` }} />
                    <span className={`font-label-sm text-label-sm ${index === monthly.length - 1 ? 'text-primary' : 'text-on-surface-variant'}`}>{month.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={quickSearch} className="card flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Icon name="bolt" className="text-primary" />
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t("Besoin d'un véhicule rapidement ?")}</h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Réservation confirmée dès le paiement')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low dark:bg-slate-900"><Icon name="location_on" className="text-primary" />
              <span className="flex flex-col flex-1"><span className="overline">{t('Ville')}</span><input value={quick.city} onChange={(e) => setQuick({ ...quick, city: e.target.value })} placeholder={t('Douala, Yaoundé…')} className="bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white" /></span></label>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low dark:bg-slate-900"><Icon name="calendar_today" className="text-primary" />
              <span className="flex flex-col flex-1"><span className="overline">{t('Date de début')}</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={quick.start} onChange={(e) => setQuick({ ...quick, start: e.target.value })} className="bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white" /></span></label>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low dark:bg-slate-900"><Icon name="schedule" className="text-primary" />
              <span className="flex flex-col flex-1"><span className="overline">{t('Formule')}</span><select value={quick.type} onChange={(e) => setQuick({ ...quick, type: e.target.value })} className="bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">{RENTAL_TYPES.map((type) => <option key={type.id} value={type.id}>{t(type.label)}</option>)}</select></span></label>
            <button type="submit" className="btn-primary"><Icon name="search" size={20} />{t('Trouver un véhicule')}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {RENTAL_TYPES.map((type) => (
              <button type="button" key={type.id} onClick={() => navigate(`/client/search?type=${type.id}${type.id === 'long_haul' ? '&days=4' : ''}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container dark:bg-slate-900 font-label-md text-label-md text-on-surface-variant dark:text-slate-300">
                <Icon name={FORMULA_ICONS[type.id]} size={16} className="text-primary" />{t(type.label)}
              </button>
            ))}
          </div>
        </form>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white flex items-center gap-2"><Icon name="event_upcoming" />{t('Réservation à venir')}</h3>
            {upcoming && <span className={STATUS[upcoming.status]?.cls}>{t(STATUS[upcoming.status]?.label)}</span>}
          </div>
          {upcoming ? (
            <div className="card grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
              <div className="relative rounded-xl overflow-hidden bg-surface-container h-56 md:h-full min-h-[14rem]">
                {upcoming.vehicle_image && <img src={upcoming.vehicle_image} alt="" className="w-full h-full object-cover" />}
                <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-inverse-surface/90 text-surface-bright font-headline-sm text-headline-sm">{formatNumber(upcoming.daily_rate)} <span className="text-[11px]">FCFA / jour</span></span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="overline text-primary">{upcoming.vehicle_city} · BK-{String(upcoming.id).padStart(4, '0')}</span>
                <h4 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{upcoming.vehicle_name}</h4>
                <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><Icon name="schedule" className="text-on-surface-variant" />
                    <div><div className="overline">{t('Période réservée')}</div><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{formatDate(upcoming.start_date)} → {formatDate(upcoming.end_date)} ({t('{{n}} j', { n: upcoming.days })})</div></div>
                  </div>
                  {upcoming.driver_name && <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-lowest dark:bg-slate-800 font-label-md text-label-md"><Icon name="badge" size={18} />{t('Chauffeur : {{name}}', { name: upcoming.driver_name })}</span>}
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <Link to={`/client/bookings/${upcoming.id}`} className="btn-primary py-2.5 px-4"><Icon name="receipt_long" size={18} />{t('Détail & état des lieux')}</Link>
                  <Link to={`/messages?booking=${upcoming.id}`} className="btn-secondary py-2.5 px-4"><Icon name="chat" size={18} />{t('Contacter le propriétaire')}</Link>
                  {upcoming.driver_phone && <a href={`tel:${upcoming.driver_phone}`} className="btn-secondary py-2.5 px-4"><Icon name="call" size={18} />{t('Chauffeur ({{phone}})', { phone: upcoming.driver_phone })}</a>}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-10">
              <Icon name="event_available" size={40} className="text-outline" />
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">{t('Aucune réservation à venir.')}</p>
              <button onClick={() => navigate('/client/search')} className="btn-primary mt-4">{t('Réserver un véhicule')}</button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="receipt_long" />{t('Dernières transactions portefeuille')}</h3>
              <Link to="/client/wallet" className="font-label-md text-label-md text-primary">{t('Voir tout le relevé')}</Link>
            </div>
            {!transactions.length && <p className="font-body-md text-body-md text-on-surface-variant py-4">{t('Aucune transaction pour le moment.')}</p>}
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${txSign(tx) === '+' ? 'bg-primary-fixed/50 text-primary' : 'bg-tertiary-fixed text-tertiary'}`}><Icon name={txIcon(tx)} /></span>
                  <div className="min-w-0"><div className="font-label-lg text-label-lg text-on-surface dark:text-white truncate">{tx.note || tx.reference}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(tx.created_at)} · {tx.reference}</div></div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-label-lg text-label-lg ${txSign(tx) === '+' ? 'text-primary' : 'text-on-surface dark:text-white'}`}>{txSign(tx)}{formatNumber(tx.amount)} FCFA</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{tx.status === 'completed' ? t('Réussi') : tx.status === 'failed' ? t('Échoué') : t('En attente')}</div>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-outline-variant/30">
              <div className="overline mb-2">{t('Réservations récentes')}</div>
              {bookings.slice(0, 3).map((b) => (
                <Link key={b.id} to={`/client/bookings/${b.id}`} className="flex items-center justify-between py-2 hover:text-primary">
                  <span className="font-label-md text-label-md">{b.vehicle_name} · {formatDate(b.start_date)}</span>
                  <span className={STATUS[b.status]?.cls}>{t(STATUS[b.status]?.label || b.status)}</span>
                </Link>
              ))}
              {!bookings.length && <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Aucune réservation pour le moment.')}</p>}
            </div>
          </section>

          <section className="lg:col-span-5 card flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="auto_awesome" className="text-tertiary" />{t('Recommandations')}</h3>
            {featured.map((vehicle) => (
              <div key={vehicle.id} className="flex gap-3 p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                <img src={vehicleImage(vehicle)} alt="" className="w-28 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="flex justify-between font-label-sm text-label-sm"><span className="text-primary">{vehicle.city}</span><span className="flex items-center"><Icon name="star" size={14} fill className="text-tertiary-container" />{Number(vehicle.rating || 0).toFixed(1)}</span></span>
                  <span className="font-label-lg text-label-lg text-on-surface dark:text-white truncate">{vehicleName(vehicle)}</span>
                  <span className="flex items-end justify-between mt-auto"><span className="font-headline-sm text-headline-sm text-primary">{formatNumber(vehicleRate(vehicle))} <span className="text-[11px]">FCFA/j</span></span>
                    <Link to={`/client/search?vehicle=${vehicle.id}`} className="font-label-md text-label-md text-primary underline">{t('Réserver')}</Link></span>
                </div>
              </div>
            ))}
            {!featured.length && <p className="font-body-md text-body-md text-on-surface-variant">{t('Aucun véhicule à recommander pour le moment.')}</p>}
            <Link to="/client/favorites" className="flex items-center gap-2 p-3 rounded-xl bg-secondary-fixed/40 dark:bg-slate-900 font-body-sm text-body-sm text-on-secondary-fixed-variant dark:text-slate-300"><Icon name="favorite" size={18} />{t('Retrouvez vos véhicules favoris')}</Link>
          </section>
        </div>
      </div>
      {showTopUp && <TopUpModal onClose={() => { setShowTopUp(false); loadWallet(); }} onDone={loadWallet} />}
    </DashboardLayout>
  );
}
