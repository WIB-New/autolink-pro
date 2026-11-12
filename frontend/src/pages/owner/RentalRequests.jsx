import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { bookingsAPI, siteAPI } from '../../services/api';
import { formatDate, formatNumber, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.owner.RentalRequests', text, options);

const TABS = [
  { value: 'pending', label: 'À traiter' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'refused', label: 'Refusées' },
  { value: 'completed', label: 'Terminées' },
];

const DRIVER_LABELS = { none: 'Sans chauffeur (autonome)', internal: 'Chauffeur AutoLink', owner: 'Votre chauffeur' };

const matchesTab = (booking, tab) => {
  if (tab === 'completed') return booking.status === 'completed';
  if (tab === 'refused') return booking.owner_response === 'refused';
  if (tab === 'accepted') return booking.owner_response === 'accepted' && ['pending', 'confirmed', 'active'].includes(booking.status);
  return booking.owner_response === 'pending' && ['pending', 'confirmed'].includes(booking.status);
};

const initialsOf = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

function Countdown({ booking, hours }) {
  const deadline = new Date(booking.created_at).getTime() + hours * 3600000;
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    return <span className="badge-error"><Icon name="hourglass_bottom" size={14} />{t('Délai de réponse dépassé')}</span>;
  }
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const urgent = remaining < 4 * 3600000;
  return (
    <span className={`badge ${urgent ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-fixed-variant'}`}>
      <Icon name="hourglass_top" size={14} />{t('Expire dans {{h}}h {{m}}min', { h, m: String(m).padStart(2, '0') })}
    </span>
  );
}

export default function RentalRequests() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('pending');
  const [vehicle, setVehicle] = useState('');
  const [sort, setSort] = useState('urgency');
  const [selectedId, setSelectedId] = useState(null);
  const [refusing, setRefusing] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hours, setHours] = useState(24);

  const load = useCallback(async () => {
    try {
      const { data } = await bookingsAPI.list({ page_size: 200, ordering: '-created_at' });
      setBookings(data.results || data || []);
      setError('');
    } catch (_) { setError(t('API injoignable — demandes indisponibles.')); }
  }, []);

  useEffect(() => {
    load();
    siteAPI.config().then(({ data }) => data.owner_response_hours && setHours(data.owner_response_hours)).catch(() => {});
  }, [load]);

  const vehicles = useMemo(() => [...new Map(bookings.map((b) => [b.vehicle, b.vehicle_name])).entries()], [bookings]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((x) => [x.value, bookings.filter((b) => matchesTab(b, x.value)).length])), [bookings]);

  const visible = useMemo(() => {
    const list = bookings.filter((b) => matchesTab(b, tab) && (!vehicle || String(b.vehicle) === vehicle));
    const sorters = {
      urgency: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      start: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      amount: (a, b) => Number(b.owner_amount) - Number(a.owner_amount),
    };
    return list.sort(sorters[sort]);
  }, [bookings, tab, vehicle, sort]);

  const selected = visible.find((b) => b.id === selectedId) || visible[0];

  const accept = async (booking) => {
    setBusy(true);
    try { await bookingsAPI.ownerAccept(booking.id); await load(); } catch (e) { setError(e.response?.data?.detail || t('Action impossible.')); }
    setBusy(false);
  };

  const refuse = async () => {
    setBusy(true);
    try {
      await bookingsAPI.ownerRefuse(refusing.id, reason);
      setRefusing(null); setReason('');
      await load();
    } catch (e) { setError(e.response?.data?.detail || t('Action impossible.')); }
    setBusy(false);
  };

  const [rateVal, setRateVal] = useState(0);
  const [rateText, setRateText] = useState('');
  const selectedKey = selected?.id;
  useEffect(() => { setRateVal(0); setRateText(''); }, [selectedKey]);

  const rateClient = async () => {
    if (!rateVal) return;
    setBusy(true);
    try {
      await bookingsAPI.rateClient(selected.id, rateVal, rateText);
      setRateVal(0); setRateText('');
      await load();
    } catch (e) { setError(e.response?.data?.detail || e.response?.data?.rating?.[0] || t('Notation impossible.')); }
    setBusy(false);
  };

  const Stars = ({ value, onPick }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onPick} onClick={() => onPick?.(n)} className={onPick ? 'hover:scale-110 transition-transform' : 'cursor-default'}>
          <Icon name="star" size={22} className={n <= value ? 'text-amber-500' : 'text-outline'} />
        </button>
      ))}
    </div>
  );

  const gross = (b) => Number(b.daily_rate) * Number(b.days);
  const pending = tab === 'pending';

  return (
    <DashboardLayout title={t('Demandes de location & Réservations')}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <span className="overline text-primary flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />{t('Opérations de flotte')}</span>
            <h2 className="page-title mt-1">{t('Demandes de location & Réservations')}</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {counts.pending > 0 && (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-error-container text-on-error-container font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-error" />{t('{{count}} demande(s) en attente de réponse', { count: counts.pending })}
              </span>
            )}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-sm">
              <span className="w-9 h-9 rounded-lg bg-primary-fixed/50 text-primary flex items-center justify-center"><Icon name="timer" /></span>
              <span className="font-label-md text-label-md text-on-surface-variant">{t('Délai de réponse')}<br /><strong className="text-on-surface dark:text-white">{t('{{h}} heures', { h: hours })}</strong></span>
            </div>
          </div>
        </div>

        <div className="card p-4 flex flex-col gap-3">
          <div className="flex gap-1 p-1 rounded-xl bg-surface-container-low dark:bg-slate-900 w-fit max-w-full overflow-x-auto">
            {TABS.map((item) => (
              <button key={item.value} onClick={() => { setTab(item.value); setSelectedId(null); }}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-label-lg ${tab === item.value ? 'bg-surface-container-lowest text-on-surface shadow-sm dark:bg-slate-700 dark:text-white' : 'text-on-surface-variant'}`}>
                {t(item.label)}
                <span className={`px-1.5 rounded-full text-[11px] ${item.value === 'pending' && counts.pending ? 'bg-error text-on-error' : 'bg-surface-container-high text-on-surface-variant'}`}>{counts[item.value]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 px-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
              <Icon name="directions_car" size={18} className="text-on-surface-variant" />
              <span className="overline">{t('Véhicule')}</span>
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="bg-transparent py-2 font-label-md text-label-md focus:outline-none dark:text-white">
                <option value="">{t('Tous')}</option>
                {vehicles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 px-3 rounded-xl bg-secondary-fixed/50 dark:bg-slate-900">
              <Icon name="sort" size={18} className="text-on-secondary-fixed-variant" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent py-2 font-label-md text-label-md focus:outline-none dark:text-white">
                <option value="urgency">{t("Tri : urgence d'expiration")}</option>
                <option value="start">{t('Tri : date de prise en charge')}</option>
                <option value="amount">{t('Tri : gain net')}</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          <div className="flex flex-col gap-4">
            {!visible.length && (
              <div className="card text-center py-14">
                <Icon name="inbox" size={44} className="text-outline" />
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">{t('Aucune demande dans cet onglet.')}</p>
              </div>
            )}
            {visible.map((booking) => {
              const active = selected?.id === booking.id;
              return (
                <article key={booking.id} onClick={() => setSelectedId(booking.id)}
                  className={`card cursor-pointer flex flex-col gap-4 ${active ? 'ring-2 ring-primary/40 border-primary/40' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-lg text-label-lg">{initialsOf(booking.client_name)}</span>
                      <div>
                        <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{booking.client_name}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{booking.client_phone || booking.client_email}</div>
                      </div>
                    </div>
                    {pending ? <Countdown booking={booking} hours={hours} /> : <span className="badge-neutral">BK-{String(booking.id).padStart(4, '0')}</span>}
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                    {booking.vehicle_image
                      ? <img src={booking.vehicle_image} alt="" className="w-20 h-14 rounded-lg object-cover" />
                      : <span className="w-20 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-outline"><Icon name="directions_car" /></span>}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{booking.vehicle_name}</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-[11px]">{booking.vehicle_plate}</span>
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{t(DRIVER_LABELS[booking.driver_type] || '')}</div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="overline">{t('Prise en charge')}</div>
                      <div className="font-label-md text-label-md text-on-surface dark:text-white max-w-[160px] truncate">{booking.pickup_address || booking.vehicle_city || '—'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                      <div className="overline">{t('Période')}</div>
                      <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{formatDate(booking.start_date)} → {formatDate(booking.end_date)}</div>
                      <div className="font-body-sm text-body-sm text-primary">{t('{{count}} jour(s)', { count: booking.days })}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                      <div className="overline">{t('Restitution')}</div>
                      <div className="font-label-lg text-label-lg text-on-surface dark:text-white truncate">{booking.dropoff_address || t('Même lieu')}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                      <div className="overline">{t('Caution séquestrée')}</div>
                      <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{formatNumber(booking.deposit_amount)} FCFA</div>
                      <div className="font-body-sm text-body-sm text-primary">{booking.payment_status === 'completed' ? t('Bloquée') : t('Paiement en attente')}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <div className="overline">{t('Gain net propriétaire garanti')}</div>
                      <div className="flex items-baseline gap-3">
                        <span className="font-display-lg text-headline-xl text-primary">{formatNumber(booking.owner_amount)} <span className="font-label-md text-label-md">FCFA</span></span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant line-through">{formatNumber(gross(booking))} {t('brut')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/messages?booking=${booking.id}`} title={t('Écrire au locataire')} className="w-11 h-11 rounded-xl bg-secondary-fixed/60 text-on-secondary-fixed-variant flex items-center justify-center"><Icon name="chat" /></Link>
                      {pending ? (
                        <>
                          <button disabled={busy} onClick={() => setRefusing(booking)} className="btn-secondary py-2.5 px-4">{t('Refuser')}</button>
                          <button disabled={busy} onClick={() => accept(booking)} className="btn-primary py-2.5 px-5"><Icon name="check_circle" size={18} />{t('Accepter la location')}</button>
                        </>
                      ) : (
                        <Link to={`/owner/bookings/${booking.id}`} className="btn-secondary py-2.5 px-4"><Icon name="visibility" size={18} />{t('Voir le dossier')}</Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {selected && (
            <aside className="card p-0 overflow-hidden xl:sticky xl:top-0">
              <div className="p-5 bg-surface-container-low dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest font-mono text-[11px]">#BK-{String(selected.id).padStart(4, '0')}</span>
                  {pending && <span className="badge-warning"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />{t('Action requise')}</span>}
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mt-3">{t('Dossier {{name}}', { name: selected.client_name })}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{pending ? t('Statut : en attente de validation propriétaire') : t('Statut : {{status}}', { status: selected.status })}</p>
              </div>
              <div className="p-5 flex flex-col gap-5">
                <div>
                  <div className="overline mb-2">{t('Contact du locataire')}</div>
                  <div className="grid grid-cols-1 gap-2 p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 font-body-md text-body-md">
                    <span className="flex items-center gap-2"><Icon name="mail" size={18} className="text-primary" />{selected.client_email}</span>
                    {selected.client_phone && <span className="flex items-center gap-2"><Icon name="call" size={18} className="text-primary" />{selected.client_phone}</span>}
                    <span className="flex items-center gap-2"><Icon name="verified" size={18} className="text-primary" />{selected.payment_status === 'completed' ? t('Paiement encaissé sous séquestre') : t('Paiement en attente')}</span>
                  </div>
                </div>
                {selected.notes && (
                  <div>
                    <div className="overline mb-2">{t('Itinéraire déclaré & notes')}</div>
                    <p className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 font-body-md text-body-md">{selected.notes}</p>
                  </div>
                )}
                <div>
                  <div className="overline mb-2">{t('Décomposition financière propriétaire')}</div>
                  <dl className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-4 flex flex-col gap-2 font-body-md text-body-md">
                    <div className="flex justify-between"><dt>{t('Prix brut ({{rate}} FCFA × {{days}} j)', { rate: formatNumber(selected.daily_rate), days: selected.days })}</dt><dd className="font-label-lg text-label-lg">{formatNumber(gross(selected))}</dd></div>
                    {selected.discount_percent > 0 && <div className="flex justify-between text-on-surface-variant"><dt>{t('Remise longue durée ({{p}} %)', { p: selected.discount_percent })}</dt><dd>−{formatNumber(gross(selected) - Number(selected.subtotal))}</dd></div>}
                    <div className="flex justify-between text-on-surface-variant"><dt>{t('Commission AutoLink')}</dt><dd>−{formatNumber(selected.commission_amount)}</dd></div>
                    <div className="flex justify-between pt-2 border-t border-outline-variant/40 font-headline-sm text-headline-sm text-primary"><dt>{t('Gain net')}</dt><dd>{formatNumber(selected.owner_amount)} FCFA</dd></div>
                  </dl>
                </div>
                {selected.status === 'completed' && (
                  <div>
                    <div className="overline mb-2">{t('Évaluer le locataire')}</div>
                    <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                      {selected.owner_rating ? (
                        <>
                          <Stars value={selected.owner_rating} />
                          {selected.owner_review && <p className="font-body-sm text-body-sm text-on-surface-variant italic">« {selected.owner_review} »</p>}
                        </>
                      ) : (
                        <>
                          <Stars value={rateVal} onPick={setRateVal} />
                          <textarea rows={2} value={rateText} onChange={(e) => setRateText(e.target.value)}
                            placeholder={t('Ponctualité, état du véhicule, respect… (optionnel)')} className="input-field" />
                          <button disabled={busy || !rateVal} onClick={rateClient} className="btn-primary self-start disabled:opacity-40">
                            <Icon name="send" size={16} />{t('Publier la note')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {pending && (
                <div className="p-5 border-t border-outline-variant/30 dark:border-slate-700 flex flex-col gap-2">
                  <button disabled={busy} onClick={() => accept(selected)} className="btn-primary w-full"><Icon name="check" size={18} />{t('Valider et bloquer le calendrier')}</button>
                  <button disabled={busy} onClick={() => setRefusing(selected)} className="btn-secondary w-full"><Icon name="cancel" size={18} />{t('Décliner la demande avec motif')}</button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {refusing && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 flex items-center justify-center px-4">
          <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-elevation-3 w-full max-w-md p-6 flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Décliner la demande de {{name}}', { name: refusing.client_name })}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('La réservation sera annulée et le client intégralement remboursé sur son portefeuille.')}</p>
            <label>
              <span className="label">{t('Motif (communiqué au client)')}</span>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className="input-field" placeholder={t('Ex. : véhicule indisponible à ces dates')} />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefusing(null)} className="btn-secondary">{t('Annuler')}</button>
              <button disabled={busy} onClick={refuse} className="btn-danger">{t('Confirmer le refus')}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
