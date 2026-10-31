import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatNumber, formatDate, formatDateTime, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.client.BookingDetail', text, options);

const STATUS = {
  pending: { label: 'En attente de paiement', cls: 'badge-warning' },
  confirmed: { label: 'Confirmée', cls: 'badge-info' },
  active: { label: 'En cours', cls: 'badge-success' },
  completed: { label: 'Terminée', cls: 'badge-neutral' },
  cancelled: { label: 'Annulée', cls: 'badge-neutral' },
  disputed: { label: 'Litige', cls: 'badge-error' },
};
const PAY_LABEL = { mtn: 'MTN MoMo', orange: 'Orange Money', paypal: 'PayPal', stripe: 'Carte (Stripe)', wallet: 'Portefeuille AutoLink', senbid: 'SenBid', paybid: 'PayBid' };
const PAY_STATUS = { pending: 'En attente', completed: 'Confirmé', failed: 'Échoué', refunded: 'Remboursé' };
const ESCROW = { held: 'Part propriétaire sous séquestre', released: 'Part propriétaire versée', refunded: 'Remboursée au client', disputed: 'Gelée (litige)' };
const DEPOSIT = { held: 'Caution bloquée', released: 'Caution restituée', forfeited: 'Caution versée au propriétaire' };
const DRIVER = { none: 'Sans chauffeur', internal: 'Chauffeur AutoLink', owner: 'Chauffeur du propriétaire' };

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => bookingsAPI.detail(id).then(({ data }) => {
    setBooking(data);
    setForm({
      start_date: data.start_date, end_date: data.end_date,
      pickup_address: data.pickup_address || '', dropoff_address: data.dropoff_address || '',
      notes: data.notes || '', driver_type: data.driver_type || 'none',
    });
  }).catch(() => setError(t('Impossible de charger cette réservation.'))), [id]);
  useEffect(() => { load(); }, [load]);

  const role = user?.role;
  const walletPaid = booking?.payment_method === 'wallet';
  const canEdit = role === 'CLIENT' && ['pending', 'confirmed'].includes(booking?.status) && booking?.start_date > new Date().toISOString().slice(0, 10);
  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const run = async (action, success) => {
    setBusy(true); setError('');
    try { await action(); if (success) setNotice(success); await load(); } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || t('Action impossible.'));
    }
    setBusy(false);
  };

  const save = (event) => {
    event.preventDefault();
    run(() => bookingsAPI.update(id, form), t('Les modifications ont été enregistrées. Redirection vers vos réservations...'));
    setTimeout(() => navigate('/client/bookings'), 1500);
  };

  const downloadReceipt = async () => {
    try {
      const { data } = await bookingsAPI.receipt(id);
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url; link.download = `recu-reservation-${id}.pdf`; link.click();
      URL.revokeObjectURL(url);
    } catch (_) { setError(t('Téléchargement du reçu impossible.')); }
  };
  const emailReceipt = () => run(() => bookingsAPI.emailReceipt(id), t('Le reçu PDF a été envoyé par e-mail.'));

  const finish = async () => {
    const ok = await confirm({ title: t('Terminer la location ?'), message: t('Le véhicule sera libéré, la part propriétaire versée et la caution restituée au client.'), confirmLabel: t('Terminer') });
    if (ok) run(() => bookingsAPI.updateStatus(id, 'completed'), t('Location terminée.'));
  };
  const cancel = async () => {
    const ok = await confirm({ title: t('Annuler cette réservation ?'), message: t('La location et la caution seront recréditées sur votre portefeuille.'), confirmLabel: t('Annuler la réservation'), danger: true });
    if (ok) run(() => bookingsAPI.updateStatus(id, 'cancelled'), t('Réservation annulée et remboursée.'));
  };
  const ownerAnswer = async (accept) => {
    const ok = await confirm({
      title: accept ? t('Accepter cette demande ?') : t('Refuser cette demande ?'),
      message: accept ? t('Le client sera informé que son véhicule est réservé.') : t('La réservation sera annulée et le client intégralement remboursé.'),
      confirmLabel: accept ? t('Accepter') : t('Refuser'), danger: !accept,
    });
    if (ok) run(() => (accept ? bookingsAPI.ownerAccept(id) : bookingsAPI.ownerRefuse(id, '')), accept ? t('Demande acceptée.') : t('Demande refusée.'));
  };

  if (!booking) {
    return (
      <DashboardLayout title={t('Détail de la réservation')}>
        {error ? <p role="alert" className="rounded-xl p-4 bg-error-container text-on-error-container">{error}</p> : <div className="h-64 rounded-xl bg-surface-container animate-pulse" />}
      </DashboardLayout>
    );
  }

  const status = STATUS[booking.status] || STATUS.pending;
  const gross = Number(booking.daily_rate) * Number(booking.days);
  const subtotal = Number(booking.subtotal || 0);
  const deposit = Number(booking.deposit_amount || 0);
  const isOwnerView = role === 'OWNER' || role === 'ADMIN';

  const timeline = [
    { label: 'Réservation créée', date: booking.created_at, done: true, icon: 'add_task' },
    { label: 'Paiement & caution bloquée', done: booking.payment_status === 'completed', icon: 'lock', detail: booking.payment_status ? t(PAY_STATUS[booking.payment_status] || booking.payment_status) : t('En attente') },
    { label: 'Réponse du propriétaire', date: booking.owner_responded_at, done: booking.owner_response !== 'pending', icon: 'how_to_reg', detail: booking.owner_response === 'accepted' ? t('Acceptée') : booking.owner_response === 'refused' ? t('Refusée') : t('En attente') },
    { label: 'Prise en charge', date: booking.start_date, done: ['active', 'completed'].includes(booking.status), icon: 'key' },
    { label: booking.status === 'disputed' ? 'Litige en arbitrage' : 'Restitution & caution libérée', date: booking.end_date, done: booking.status === 'completed', icon: booking.status === 'disputed' ? 'gavel' : 'lock_open', alert: booking.status === 'disputed' },
  ];

  return (
    <DashboardLayout title={t('Détail de la réservation')}>
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="w-fit flex items-center gap-1 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface"><Icon name="arrow_back" />{t('Retour')}</button>
        {error && <p role="alert" className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</p>}
        {notice && <p className="rounded-xl px-4 py-3 bg-primary-fixed/40 text-on-primary-fixed-variant font-label-lg text-label-lg">{notice}</p>}

        <section className="card flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 h-48 rounded-xl overflow-hidden bg-surface-container shrink-0">
            {booking.vehicle_image ? <img src={booking.vehicle_image} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-outline"><Icon name="directions_car" size={48} /></span>}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-[12px]">#BK-{String(booking.id).padStart(4, '0')}</span>
              <span className={status.cls}>{t(status.label)}</span>
              {booking.owner_response === 'pending' && ['pending', 'confirmed'].includes(booking.status) && <span className="badge-warning">{t('Réponse propriétaire en attente')}</span>}
            </div>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white">{booking.vehicle_name}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-body-md text-body-md text-on-surface-variant">
              <span className="flex items-center gap-1"><Icon name="pin" size={18} />{booking.vehicle_plate}</span>
              <span className="flex items-center gap-1"><Icon name="calendar_today" size={18} />{formatDate(booking.start_date)} → {formatDate(booking.end_date)} ({t('{{n}} jour(s)', { n: booking.days })})</span>
              <span className="flex items-center gap-1"><Icon name="badge" size={18} />{booking.driver_name || t(DRIVER[booking.driver_type] || '')}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
              <button onClick={downloadReceipt} className="btn-secondary py-2 px-3"><Icon name="download" size={18} />{t('Reçu PDF')}</button>
              {role === 'CLIENT' && <button onClick={emailReceipt} disabled={busy} className="btn-secondary py-2 px-3"><Icon name="mail" size={18} />{t('Envoyer par e-mail')}</button>}
              <Link to={`/messages?booking=${booking.id}`} className="btn-secondary py-2 px-3"><Icon name="chat" size={18} />{t('Messagerie du dossier')}</Link>
              {role === 'CLIENT' && ['pending', 'confirmed'].includes(booking.status) && <button onClick={cancel} disabled={busy} className="btn-secondary py-2 px-3 text-error"><Icon name="cancel" size={18} />{t('Annuler (remboursé)')}</button>}
              {role === 'OWNER' && booking.owner_response === 'pending' && ['pending', 'confirmed'].includes(booking.status) && (
                <>
                  <button onClick={() => ownerAnswer(false)} disabled={busy} className="btn-secondary py-2 px-3">{t('Refuser')}</button>
                  <button onClick={() => ownerAnswer(true)} disabled={busy} className="btn-primary py-2 px-3"><Icon name="check_circle" size={18} />{t('Accepter la location')}</button>
                </>
              )}
              {isOwnerView && ['confirmed', 'active'].includes(booking.status) && <button onClick={finish} disabled={busy} className="btn-primary py-2 px-3"><Icon name="task_alt" size={18} />{t('Véhicule récupéré — terminer')}</button>}
              {role === 'ADMIN' && booking.status === 'disputed' && <Link to="/admin/disputes" className="btn-danger py-2 px-3"><Icon name="gavel" size={18} />{t('Arbitrer le litige')}</Link>}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <section className="card">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-5">{t('Suivi du dossier')}</h3>
              <ol className="flex flex-col gap-4">
                {timeline.map((step) => (
                  <li key={step.label} className="flex gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.alert ? 'bg-error text-on-error' : step.done ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><Icon name={step.done && !step.alert ? 'check' : step.icon} size={20} /></span>
                    <div className="flex-1 pb-2 border-b border-outline-variant/20 last:border-0">
                      <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(step.label)}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{step.date ? (step.date.length > 10 ? formatDateTime(step.date) : formatDate(step.date)) : ''}{step.detail ? `${step.date ? ' · ' : ''}${step.detail}` : ''}</div>
                    </div>
                  </li>
                ))}
              </ol>
              {booking.dispute_reason && (
                <div className="mt-4 p-4 rounded-xl bg-error-container/60 text-on-error-container">
                  <div className="font-label-lg text-label-lg flex items-center gap-1"><Icon name="report" size={18} />{t('Motif du litige')}{booking.dispute_opened_at ? ` · ${formatDateTime(booking.dispute_opened_at)}` : ''}</div>
                  <p className="font-body-md text-body-md mt-1">{booking.dispute_reason}</p>
                </div>
              )}
            </section>

            <section className="card">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-4">{t('Parties & logistique')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: 'person', label: 'Client', value: booking.client_name, sub: [booking.client_phone, booking.client_email].filter(Boolean).join(' · ') },
                  { icon: 'key', label: 'Propriétaire', value: booking.owner_name, sub: role !== 'CLIENT' || ['confirmed', 'active'].includes(booking.status) ? booking.owner_phone : '' },
                  { icon: 'badge', label: 'Chauffeur', value: booking.driver_name || t(DRIVER[booking.driver_type] || ''), sub: booking.driver_phone },
                  { icon: 'location_on', label: 'Prise en charge', value: booking.pickup_address || booking.vehicle_city || '—', sub: booking.dropoff_address ? `${t('Retour :')} ${booking.dropoff_address}` : '' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex gap-3">
                    <Icon name={item.icon} className="text-primary shrink-0" />
                    <div className="min-w-0"><div className="overline">{t(item.label)}</div><div className="font-label-lg text-label-lg text-on-surface dark:text-white truncate">{item.value || '—'}</div>{item.sub && <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{item.sub}</div>}</div>
                  </div>
                ))}
              </div>
              {booking.notes && <p className="mt-3 p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{booking.notes}</p>}
            </section>

            <section className="card">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-4 flex items-center gap-2"><Icon name="fact_check" className="text-primary" />{t('États des lieux du véhicule')}</h3>
              {!booking.inspections?.length ? <p className="font-body-md text-body-md text-on-surface-variant">{t('Aucune inspection enregistrée pour cette réservation.')}</p> : booking.inspections.map((inspection) => (
                <article key={inspection.id} className="py-4 border-t first:border-t-0 border-outline-variant/30 flex flex-col gap-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className={inspection.inspection_type === 'entry' ? 'badge-info' : 'badge-success'}>{inspection.inspection_type === 'entry' ? t('Fiche d’entrée') : t('Fiche de sortie')}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{inspection.inspection_date ? formatDateTime(inspection.inspection_date) : '—'}</span>
                  </div>
                  <p className="font-body-md text-body-md">{t('Inspecteur :')} {inspection.controller_name || '—'} · {t('Score :')} <strong>{inspection.condition_score ?? '—'}/100</strong></p>
                  {inspection.notes && <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{inspection.notes}</p>}
                  {inspection.photos?.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {inspection.photos.map((photo) => (
                        <figure key={photo.id} className="w-28">
                          <a href={photo.image} target="_blank" rel="noreferrer"><img src={photo.image} alt={photo.caption || t('Photo d’inspection')} className="h-20 w-full rounded-lg object-cover" /></a>
                          {photo.caption && <figcaption className="mt-1 text-[11px] text-on-surface-variant">{photo.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </section>

            {canEdit && (
              <form onSubmit={save} className="card flex flex-col gap-4">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Modifier la réservation')}</h3>
                {!walletPaid && <p className="rounded-xl p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant font-body-sm text-body-sm">{t('Le paiement n’a pas été effectué avec le portefeuille : pour changer les dates, annulez puis réservez à nouveau.')}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <label><span className="label">{t('Date de début')}</span><input className="input-field" type="date" name="start_date" value={form.start_date || ''} onChange={setField} disabled={!walletPaid} /></label>
                  <label><span className="label">{t('Date de fin')}</span><input className="input-field" type="date" name="end_date" value={form.end_date || ''} onChange={setField} disabled={!walletPaid} /></label>
                  <label><span className="label">{t('Lieu de prise en charge')}</span><input className="input-field" name="pickup_address" value={form.pickup_address || ''} onChange={setField} /></label>
                  <label><span className="label">{t('Lieu de retour')}</span><input className="input-field" name="dropoff_address" value={form.dropoff_address || ''} onChange={setField} /></label>
                  <label><span className="label">{t('Chauffeur')}</span><select className="input-field" name="driver_type" value={form.driver_type || 'none'} onChange={setField} disabled={!walletPaid}>{Object.entries(DRIVER).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}</select></label>
                  <label className="sm:col-span-2"><span className="label">{t('Notes')}</span><textarea className="input-field" rows="3" name="notes" value={form.notes || ''} onChange={setField} /></label>
                </div>
                <button className="btn-primary w-fit" disabled={busy}><Icon name="save" size={18} />{t('Enregistrer')}</button>
              </form>
            )}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-0">
            <section className="card flex flex-col gap-3">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Décomposition financière')}</h3>
              <dl className="flex flex-col gap-2 font-body-md text-body-md">
                <div className="flex justify-between"><dt>{t('{{rate}} FCFA × {{days}} j', { rate: formatNumber(booking.daily_rate), days: booking.days })}</dt><dd>{formatNumber(gross)} FCFA</dd></div>
                {Number(booking.discount_percent) > 0 && <div className="flex justify-between text-primary"><dt>{t('Remise longue durée ({{p}} %)', { p: booking.discount_percent })}</dt><dd>−{formatNumber(gross - subtotal)} FCFA</dd></div>}
                <div className="flex justify-between pt-2 border-t border-outline-variant/40 font-label-lg text-label-lg"><dt>{t('Montant de la location')}</dt><dd>{formatNumber(subtotal)} FCFA</dd></div>
                {isOwnerView && <div className="flex justify-between text-on-surface-variant"><dt>{t('Commission AutoLink')}</dt><dd>−{formatNumber(booking.commission_amount)} FCFA</dd></div>}
                {isOwnerView && <div className="flex justify-between font-headline-sm text-headline-sm text-primary"><dt>{t('Net propriétaire')}</dt><dd>{formatNumber(booking.owner_amount)} FCFA</dd></div>}
              </dl>
              <div className="p-3 rounded-xl bg-secondary-fixed/50 text-on-secondary-fixed-variant flex justify-between items-center font-label-lg text-label-lg">
                <span className="flex items-center gap-1"><Icon name="lock" size={18} />{t('Caution')}</span><span>{formatNumber(deposit)} FCFA</span>
              </div>
              {booking.deposit_status && <span className={booking.deposit_status === 'released' ? 'badge-success' : booking.deposit_status === 'forfeited' ? 'badge-error' : 'badge-warning'}>{t(DEPOSIT[booking.deposit_status] || booking.deposit_status)}</span>}
            </section>
            <section className="card flex flex-col gap-2 font-body-md text-body-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Paiement')}</h3>
              <div className="flex justify-between"><span className="text-on-surface-variant">{t('Moyen')}</span><strong>{t(PAY_LABEL[booking.payment_method] || '—')}</strong></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">{t('Statut')}</span><strong>{t(PAY_STATUS[booking.payment_status] || 'En attente')}</strong></div>
              {booking.escrow_status && <div className="flex justify-between"><span className="text-on-surface-variant">{t('Séquestre')}</span><strong>{t(ESCROW[booking.escrow_status] || booking.escrow_status)}</strong></div>}
              <div className="flex justify-between"><span className="text-on-surface-variant">{t('Créée le')}</span><span>{formatDateTime(booking.created_at)}</span></div>
            </section>
            {booking.client_rating && (
              <section className="card">
                <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Avis du client')}</h3>
                <div className="flex mt-1">{Array.from({ length: booking.client_rating }).map((_, i) => <Icon key={i} name="star" fill className="text-tertiary-container" />)}</div>
                {booking.client_review && <p className="font-body-md text-body-md text-on-surface-variant mt-2 italic">« {booking.client_review} »</p>}
              </section>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
