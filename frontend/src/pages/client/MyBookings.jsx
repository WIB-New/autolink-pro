import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import Icon from '../../components/Icon';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI, paymentsAPI } from '../../services/api';
import { formatDate, formatNumber, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.client.MyBookings', text, options);

const STATUS = {
  completed: { label: 'Terminée', cls: 'badge-neutral', icon: 'task_alt' },
  pending: { label: 'Attente paiement', cls: 'badge-warning', icon: 'hourglass_top' },
  confirmed: { label: 'Confirmée', cls: 'badge-info', icon: 'event_available' },
  active: { label: 'En cours', cls: 'badge-success', icon: 'directions_car' },
  cancelled: { label: 'Annulée', cls: 'badge-neutral', icon: 'block' },
  disputed: { label: 'Litige en cours', cls: 'badge-error', icon: 'gavel' },
};

const TABS = [['all', 'Toutes'], ['confirmed', 'À venir'], ['active', 'En cours'], ['completed', 'Terminées'], ['cancelled', 'Annulées'], ['disputed', 'Litiges']];

const PAY_LABEL = { mtn: 'MTN MoMo', orange: 'Orange Money', senbid: 'SenBid', paybid: 'PayBid', paypal: 'PayPal', stripe: 'Carte (Stripe)', wallet: 'Portefeuille AutoLink' };

const driverLabel = (b) => b.driver_name || (b.driver_type === 'internal' ? t('Attribution automatique…') : b.driver_type === 'owner' ? t('Chauffeur du propriétaire') : t('Sans chauffeur'));

function Modal({ title, icon, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 bg-inverse-surface/60 flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-elevation-3 w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/30 dark:border-slate-700">
          <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white flex items-center gap-2"><Icon name={icon} />{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-surface-container-low flex items-center justify-center" aria-label={t('Fermer')}><Icon name="close" /></button>
        </div>
        <div className="p-5 flex flex-col gap-4">{children}</div>
        {footer && <div className="p-5 border-t border-outline-variant/30 dark:border-slate-700 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function RatingModal({ booking, onClose, onDone }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setSending(true); setError('');
    try {
      await bookingsAPI.rate(booking.id, stars, comment);
      setSubmitted(true);
      onDone();
    } catch (e) { setError(e.response?.data?.detail || e.response?.data?.rating?.[0] || t('Envoi impossible — réessayez.')); }
    setSending(false);
  };

  if (submitted) {
    return (
      <Modal title={t('Merci pour votre avis !')} icon="star" onClose={onClose} footer={<button onClick={onClose} className="btn-primary w-full">{t('Fermer')}</button>}>
        <p className="font-body-md text-body-md text-on-surface-variant text-center">{t('Votre notation aide la communauté AutoLink et le propriétaire.')}</p>
      </Modal>
    );
  }
  return (
    <Modal title={t('Évaluer la location')} icon="star" onClose={onClose}
      footer={<><button onClick={onClose} className="btn-secondary flex-1">{t('Annuler')}</button><button onClick={submit} disabled={sending} className="btn-primary flex-1">{sending ? t('Envoi…') : t("Envoyer l'avis")}</button></>}>
      <div className="text-center"><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{booking.vehicle_name}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t('Chauffeur :')} {driverLabel(booking)}</div></div>
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setStars(n)} aria-label={`${n}/5`} className="transition-transform hover:scale-110">
            <Icon name="star" size={36} fill={n <= stars} className={n <= stars ? 'text-tertiary-container' : 'text-outline-variant'} />
          </button>
        ))}
      </div>
      <label><span className="label">{t('Commentaire (optionnel)')}</span><textarea className="input-field resize-none" rows={3} placeholder={t('Partagez votre expérience...')} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      {error && <p className="rounded-xl px-3 py-2 bg-error-container text-on-error-container font-body-sm text-body-sm">{error}</p>}
    </Modal>
  );
}

function DisputeModal({ booking, onClose, onDone }) {
  const confirm = useConfirm();
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    const confirmed = await confirm({
      title: t('Ouvrir un litige ?'),
      message: t('Un administrateur AutoLink examinera le problème et arbitrera la réservation.'),
      confirmLabel: t('Ouvrir le litige'),
      danger: true,
    });
    if (!confirmed) return;
    setSending(true); setError('');
    try {
      await bookingsAPI.dispute(booking.id, reason);
      onDone();
    } catch (_) { setError(t("Impossible d'envoyer le litige — vérifiez votre connexion.")); }
    setSending(false);
  };
  return (
    <Modal title={t('Signaler un problème')} icon="report" onClose={onClose}
      footer={<><button onClick={onClose} className="btn-secondary flex-1">{t('Annuler')}</button><button onClick={submit} disabled={!reason.trim() || sending} className="btn-danger flex-1">{sending ? t('Envoi…') : t('Ouvrir le litige')}</button></>}>
      <p className="font-body-md text-body-md text-on-surface-variant">{t('Véhicule :')} <strong>{booking.vehicle_name}</strong>. {t('En cas de panne ou de problème imputable au véhicule, la caution reste gelée et un administrateur AutoLink arbitre votre dossier.')}</p>
      <label><span className="label">{t('Décrivez le problème')}</span><textarea className="input-field resize-none" rows={3} placeholder={t('Ex : panne moteur, climatisation HS, véhicule non conforme…')} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      {error && <p className="rounded-xl px-3 py-2 bg-error-container text-on-error-container font-body-sm text-body-sm">{error}</p>}
    </Modal>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [ratingBooking, setRatingBooking] = useState(null);
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [payBanner, setPayBanner] = useState(null);
  const [actionError, setActionError] = useState('');

  // Retour d'un paiement externe (Stripe / PayPal / Orange) sur une réservation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('payment');
    if (params.get('orange') === 'return' && params.get('ref')) {
      paymentsAPI.bookingStatus(params.get('ref')).then(({ data }) => {
        window.location.replace(`/client/bookings?payment=${data.status === 'completed' ? 'success' : 'pending'}`);
      }).catch(() => window.location.replace('/client/bookings?payment=error'));
      return;
    }
    if (q) {
      setPayBanner(q);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortField}`;
      const res = await bookingsAPI.getAll({ search: search.trim(), ordering, page_size: 50, ...(tab === 'all' ? {} : { status: tab }) });
      setBookings(res.data.results || res.data || []);
      setOffline(false);
    } catch { setOffline(true); } finally { setLoading(false); }
  }, [search, sortField, sortOrder, tab]);

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => {
    bookingsAPI.getAll({ page_size: 200 }).then(({ data }) => {
      const list = data.results || data || [];
      setCounts(list.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1, all: (acc.all || 0) + 1 }), {}));
    }).catch(() => {});
  }, [bookings.length]);

  const cancelBooking = async (id) => {
    const confirmed = await confirm({
      title: t('Annuler cette réservation ?'),
      message: t('Cette action annulera la réservation et recréditera la location et la caution sur votre portefeuille.'),
      confirmLabel: t('Annuler la réservation'),
      danger: true,
    });
    if (!confirmed) return;
    setCancelling(id);
    try {
      await bookingsAPI.updateStatus(id, 'cancelled');
      setBookings((list) => list.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (e) { setActionError(e.response?.data?.status || t('Annulation impossible — vérifiez votre connexion puis réessayez.')); }
    setCancelling(null);
  };

  const upcomingCount = (counts.confirmed || 0) + (counts.pending || 0);

  return (
    <DashboardLayout title={t('Mes réservations')} subtitle={t('Suivez vos locations, cautions, reçus et litiges.')}
      actions={<button onClick={() => navigate('/client/search')} className="btn-primary"><Icon name="add" size={20} />{t('Nouvelle réservation')}</button>}>
      <div className="flex flex-col gap-6">
        {payBanner === 'success' && <div className="rounded-xl px-4 py-3 bg-primary-fixed/40 text-on-primary-fixed-variant font-label-lg text-label-lg flex items-center gap-2"><Icon name="check_circle" />{t('Paiement confirmé — votre réservation est validée. Le propriétaire a été notifié.')}</div>}
        {payBanner === 'pending' && <div className="rounded-xl px-4 py-3 bg-secondary-fixed text-on-secondary-fixed-variant font-label-lg text-label-lg flex items-center gap-2"><Icon name="hourglass_top" />{t('Paiement en cours de traitement — la réservation sera confirmée automatiquement.')}</div>}
        {(payBanner === 'canceled' || payBanner === 'error') && (
          <div className="rounded-xl px-4 py-3 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-lg text-label-lg flex items-center gap-2"><Icon name="info" />
            {payBanner === 'canceled' ? t("Paiement annulé — la réservation reste en attente et aucun montant n'a été débité.") : t("Le paiement n'a pas abouti — la réservation reste en attente.")}
          </div>
        )}
        {actionError && (
          <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg flex justify-between items-center">{actionError}<button onClick={() => setActionError('')}><Icon name="close" size={18} /></button></div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Réservations', value: counts.all || 0, icon: 'calendar_month' },
            { label: 'À venir', value: upcomingCount, icon: 'event_upcoming' },
            { label: 'En cours', value: counts.active || 0, icon: 'directions_car' },
            { label: 'Litiges ouverts', value: counts.disputed || 0, icon: 'gavel', alert: counts.disputed > 0 },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-xl p-4 flex items-center gap-3 ${kpi.alert ? 'bg-error-container/60' : 'bg-surface-container-lowest dark:bg-slate-800 shadow-sm'}`}>
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.alert ? 'bg-error text-on-error' : 'bg-primary-fixed/40 text-primary'}`}><Icon name={kpi.icon} /></span>
              <div><div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{kpi.value}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t(kpi.label)}</div></div>
            </div>
          ))}
        </div>

        <div className="card p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(([value, label]) => (
              <button key={value} onClick={() => setTab(value)} className={`shrink-0 px-4 py-2 rounded-lg font-label-lg text-label-lg ${tab === value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low dark:text-slate-300'}`}>
                {t(label)}{value !== 'all' && counts[value] ? <span className="ml-1.5 px-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px]">{counts[value]}</span> : null}
              </button>
            ))}
          </div>
          <ListToolbar className="lg:w-[460px]" search={search} onSearchChange={setSearch} sortField={sortField} onSortFieldChange={setSortField} sortOrder={sortOrder} onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: 'created_at', label: t('Date de création') }, { value: 'start_date', label: t('Date de début') },
              { value: 'end_date', label: t('Date de fin') }, { value: 'subtotal', label: t('Montant') }, { value: 'status', label: t('Statut') },
            ]}
            placeholder={t('Rechercher une réservation ou un véhicule')} />
        </div>

        <div className="flex flex-col gap-4">
          {bookings.map((b) => {
            const status = STATUS[b.status] || STATUS.pending;
            return (
              <article key={b.id} className={`card p-0 overflow-hidden ${b.status === 'disputed' ? 'ring-1 ring-error/40' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-5 p-5">
                  <Link to={`/client/bookings/${b.id}`} className="relative h-40 md:h-full min-h-[8rem] rounded-xl overflow-hidden bg-surface-container">
                    {b.vehicle_image ? <img src={b.vehicle_image} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-outline"><Icon name="directions_car" size={40} /></span>}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/95 font-mono text-[11px]">BK-{String(b.id).padStart(4, '0')}</span>
                  </Link>
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/client/bookings/${b.id}`} className="font-headline-sm text-headline-sm text-on-surface dark:text-white hover:text-primary">{b.vehicle_name}</Link>
                      <span className={status.cls}><Icon name={status.icon} size={14} />{t(status.label)}</span>
                      {b.owner_response === 'pending' && ['pending', 'confirmed'].includes(b.status) && <span className="badge-warning"><Icon name="schedule" size={14} />{t('Réponse propriétaire en attente')}</span>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body-md text-body-md text-on-surface-variant dark:text-slate-400">
                      <span className="flex items-center gap-1.5"><Icon name="calendar_today" size={18} />{formatDate(b.start_date)} → {formatDate(b.end_date)} ({t('{{n}} j', { n: b.days })})</span>
                      <span className="flex items-center gap-1.5"><Icon name="location_on" size={18} />{b.pickup_address || b.vehicle_city || '—'}</span>
                      <span className="flex items-center gap-1.5"><Icon name="badge" size={18} />{driverLabel(b)}</span>
                      <span className="flex items-center gap-1.5"><Icon name="credit_card" size={18} />{t(PAY_LABEL[b.payment_method] || '—')}</span>
                    </div>
                    {b.escrow_status === 'held' && <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-primary"><Icon name="lock" size={16} />{t("Paiement sécurisé — caution bloquée jusqu'à la fin de la location")}</p>}
                    {b.escrow_status === 'disputed' && <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-error"><Icon name="gavel" size={16} />{t("Litige en cours — la caution est gelée en attendant l'arbitrage AutoLink")}</p>}
                    {b.client_rating && <div className="flex">{Array.from({ length: b.client_rating }).map((_, i) => <Icon key={i} name="star" fill size={16} className="text-tertiary-container" />)}</div>}
                  </div>
                  <div className="md:text-right flex md:flex-col justify-between gap-1">
                    <div>
                      <div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{formatNumber(b.subtotal)} <span className="font-label-sm text-label-sm text-on-surface-variant">FCFA</span></div>
                      {Number(b.discount_percent) > 0 && <div className="font-body-sm text-body-sm text-primary">{t('-{{p}} % longue durée appliqué', { p: b.discount_percent })}</div>}
                      {Number(b.deposit_amount) > 0 && <div className="font-body-sm text-body-sm text-tertiary">{t('Caution {{n}} F', { n: formatNumber(b.deposit_amount) })} {b.deposit_status === 'released' ? t('· restituée') : b.deposit_status === 'held' ? t('· bloquée') : b.deposit_status === 'forfeited' ? t('· retenue') : ''}</div>}
                    </div>
                  </div>
                </div>
                {b.status !== 'cancelled' && (
                  <div className="px-5 py-3 bg-surface-container-low/60 dark:bg-slate-900/60 flex flex-wrap gap-2">
                    <Link to={`/client/bookings/${b.id}`} className="btn-secondary py-1.5 px-3"><Icon name="receipt_long" size={16} />{t('Détail & reçu')}</Link>
                    {['pending', 'confirmed'].includes(b.status) && b.start_date > new Date().toISOString().slice(0, 10) && (
                      <Link to={`/client/bookings/${b.id}/edit`} className="btn-primary py-1.5 px-3"><Icon name="edit" size={16} />{t('Modifier')}</Link>
                    )}
                    <Link to={`/messages?booking=${b.id}`} className="btn-secondary py-1.5 px-3"><Icon name="chat" size={16} />{t('Messagerie')}</Link>
                    {b.driver_phone && <a href={`tel:${b.driver_phone}`} className="btn-secondary py-1.5 px-3"><Icon name="call" size={16} />{t('Appeler chauffeur')}</a>}
                    {b.status === 'completed' && !b.client_rating && <button onClick={() => setRatingBooking(b)} className="btn-secondary py-1.5 px-3 text-tertiary"><Icon name="star" size={16} />{t('Évaluer')}</button>}
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={() => cancelBooking(b.id)} disabled={cancelling === b.id} className="btn-secondary py-1.5 px-3 text-error"><Icon name="cancel" size={16} />{cancelling === b.id ? t('Annulation...') : t('Annuler (remboursé)')}</button>
                    )}
                    {['confirmed', 'active'].includes(b.status) && <button onClick={() => setDisputeBooking(b)} className="btn-secondary py-1.5 px-3 text-error"><Icon name="report" size={16} />{t('Signaler un problème')}</button>}
                  </div>
                )}
              </article>
            );
          })}

          {bookings.length === 0 && !loading && (
            <div className="card text-center py-16">
              <Icon name={offline ? 'cloud_off' : 'event_note'} size={44} className="text-outline" />
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mt-2">{offline ? t('Serveur injoignable') : t('Aucune réservation')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{offline ? t('Impossible de contacter le serveur — vérifiez votre connexion puis rechargez la page.') : t("Vous n'avez pas encore de réservation dans cette catégorie.")}</p>
            </div>
          )}
          {loading && !bookings.length && <div className="h-48 rounded-xl bg-surface-container animate-pulse" />}
        </div>
      </div>
      {ratingBooking && <RatingModal booking={ratingBooking} onClose={() => setRatingBooking(null)} onDone={load} />}
      {disputeBooking && <DisputeModal booking={disputeBooking} onClose={() => setDisputeBooking(null)} onDone={() => { setDisputeBooking(null); load(); }} />}
    </DashboardLayout>
  );
}
