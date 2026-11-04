import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import { vehicleImage, vehicleName, TIER_BADGES } from '../../utils/vehicles';
import { formatNumber, formatDate, formatDateTime, uiText, vehicleLabel } from '../../i18n';

const t = (text, options) => uiText('pages.owner.VehicleAudit', text, options);

const STATUS = {
  pending: { label: 'En attente de validation', cls: 'badge-warning' },
  approved: { label: 'En ligne (Active)', cls: 'badge-success' },
  rented: { label: 'En location', cls: 'badge-info' },
  maintenance: { label: 'En maintenance', cls: 'badge-neutral' },
  suspended: { label: 'Suspendu', cls: 'badge-error' },
};
const B_STATUS = {
  pending: ['Attente paiement', 'badge-warning'], confirmed: ['Confirmée', 'badge-info'],
  active: ['En cours', 'badge-success'], completed: ['Terminée', 'badge-neutral'],
  cancelled: ['Annulée', 'badge-neutral'], disputed: ['Litige', 'badge-error'],
};

const dayKey = (d) => d.toISOString().slice(0, 10);

export default function VehicleAudit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [vehicle, setVehicle] = useState(null);
  const [media, setMedia] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [blockForm, setBlockForm] = useState({ start: '', end: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    vehiclesAPI.detail(id).then(({ data }) => setVehicle(data)).catch(() => setError(t('Véhicule introuvable.')));
    vehiclesAPI.media(id).then(({ data }) => setMedia(data.results || data || [])).catch(() => {});
    vehiclesAPI.availability(id).then(({ data }) => setBlocked(data.results || data || [])).catch(() => {});
    bookingsAPI.list({ vehicle: id, page_size: 100 }).then(({ data }) => setBookings(data.results || data || [])).catch(() => {});
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const done = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const earned = done.reduce((s, b) => s + Number(b.owner_amount || 0), 0);
  const activeBookings = bookings.filter((b) => ['confirmed', 'active'].includes(b.status));

  // Calendrier : jours loués, jours bloqués, jours disponibles
  const calendar = useMemo(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const firstWeekday = (new Date(year, m, 1).getDay() + 6) % 7; // lundi = 0
    const rentedDays = new Set();
    bookings.filter((b) => ['pending', 'confirmed', 'active'].includes(b.status)).forEach((b) => {
      const s = new Date(b.start_date); const e = new Date(b.end_date);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) rentedDays.add(dayKey(d));
    });
    const blockedDays = new Set();
    blocked.forEach((p) => {
      for (let d = new Date(p.start_date); d <= new Date(p.end_date); d.setDate(d.getDate() + 1)) blockedDays.add(dayKey(d));
    });
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = dayKey(new Date(year, m, day));
      cells.push({ day, key, state: rentedDays.has(key) ? 'rented' : blockedDays.has(key) ? 'blocked' : 'free' });
    }
    return cells;
  }, [month, bookings, blocked]);

  const occupancy = useMemo(() => {
    const now = new Date();
    if (month.getFullYear() !== now.getFullYear() || month.getMonth() !== now.getMonth()) return null;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const rented = calendar.filter((c) => c && c.state === 'rented').length;
    return Math.round((rented / daysInMonth) * 100);
  }, [calendar, month]);

  const block = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await vehiclesAPI.blockDates(id, blockForm.start, blockForm.end, blockForm.reason);
      setBlockForm({ start: '', end: '', reason: '' });
      setNotice(t('Période bloquée enregistrée.'));
      load();
    } catch (err) { setError(err.response?.data?.detail || t('Blocage impossible — vérifiez les dates.')); }
    setBusy(false);
  };

  const pause = async () => {
    const suspend = vehicle.status !== 'maintenance';
    if (!(await confirm({
      title: suspend ? t('Mettre le véhicule en pause ?') : t('Remettre le véhicule en ligne ?'),
      message: suspend ? t('Il disparaîtra du catalogue jusqu’à sa remise en ligne.') : t('Le véhicule redeviendra visible au catalogue.'),
      confirmLabel: suspend ? t('Mettre en pause') : t('Remettre en ligne'), danger: suspend,
    }))) return;
    try {
      await vehiclesAPI.update(id, { status: suspend ? 'maintenance' : 'approved' });
      load();
    } catch (_) { setError(t('Changement de statut impossible.')); }
  };

  if (error && !vehicle) return <DashboardLayout title={t('Détail du véhicule')}><p className="rounded-xl p-4 bg-error-container text-on-error-container">{error}</p></DashboardLayout>;
  if (!vehicle) return <DashboardLayout title={t('Détail du véhicule')}><div className="h-72 rounded-xl bg-surface-container animate-pulse" /></DashboardLayout>;

  const st = STATUS[vehicle.status] || STATUS.pending;
  const auditSteps = [
    { label: 'Soumission', sub: `Dossier reçu · ${formatDate(vehicle.created_at)}`, done: true },
    { label: 'Audit documentaire', sub: 'Carte grise & assurance vérifiées', done: !!vehicle.technical_control_date || vehicle.status !== 'pending' },
    { label: 'Inspection AutoLink', sub: vehicle.last_inspection ? `Contrôle du ${formatDate(vehicle.last_inspection)}` : 'En attente du passage contrôleur', done: vehicle.status !== 'pending' },
    { label: 'En ligne', sub: vehicle.status === 'approved' || vehicle.status === 'rented' ? 'Visible au catalogue' : 'Hors ligne', done: ['approved', 'rented'].includes(vehicle.status) },
  ];
  const today = dayKey(new Date());
  const monthLabel = month.toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout title={vehicleName(vehicle)}
      actions={<div className="flex gap-2">
        <Link to={`/owner/vehicles/${id}/edit`} className="btn-secondary"><Icon name="sell" size={18} />{t('Modifier les tarifs')}</Link>
        {['approved', 'maintenance'].includes(vehicle.status) && <button onClick={pause} className="btn-secondary"><Icon name="pause_circle" size={18} />{vehicle.status === 'maintenance' ? t('Remettre en ligne') : t('Mettre en pause')}</button>}
      </div>}>
      <div className="flex flex-col gap-6">
        {error && <p className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</p>}
        {notice && <p className="rounded-xl px-4 py-3 bg-primary-fixed/40 text-on-primary-fixed-variant font-label-lg text-label-lg">{notice}</p>}

        <section className="card flex flex-col sm:flex-row gap-4 items-start">
          <img src={vehicleImage(vehicle)} alt="" className="w-full sm:w-40 h-28 rounded-xl object-cover bg-surface-container" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{vehicleName(vehicle)}</h2>
              <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[vehicle.tier]}`}>{vehicleLabel(vehicle.tier_label || vehicle.tier, 'tier')}</span>
              <span className={st.cls}>{t(st.label)}</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1"><span className="font-mono">{vehicle.plate}</span> · {vehicle.city} · {formatNumber(vehicle.mileage || 0)} km certifiés</p>
            <p className="font-body-md text-body-md text-on-surface-variant">{vehicleLabel(vehicle.category, 'category')} · {vehicleLabel(vehicle.fuel, 'fuel')} · {vehicle.seats} {t('places')} · {formatNumber(vehicle.daily_rate)} {t('FCFA/jour')} <span className="text-on-surface-variant/70">({t('indicatif')} {formatNumber(vehicle.computed_rate)} F)</span></p>
          </div>
          <Link to="/messages?support=1" className="btn-primary shrink-0"><Icon name="chat" size={18} />{t('Joindre mon inspecteur')}</Link>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Revenus cumulés', value: `${formatNumber(earned)} FCFA`, sub: t('part nette propriétaire'), icon: 'account_balance_wallet' },
            { label: "Taux d'occupation", value: occupancy !== null ? `${occupancy} %` : '—', sub: t('ce mois-ci'), icon: 'calendar_month' },
            { label: 'Note moyenne locataires', value: vehicle.rating ? `${Number(vehicle.rating).toFixed(2)} / 5` : '—', sub: t('{{n}} avis', { n: vehicle.rating_count || 0 }), icon: 'star' },
            { label: 'Missions réalisées', value: `${done.length + activeBookings.length}`, sub: t('locations au total'), icon: 'task_alt' },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card">
              <div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t(kpi.label)}</span><Icon name={kpi.icon} size={20} className="text-primary" /></div>
              <div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{kpi.value}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Audit */}
        <section className="card">
          <div className="flex items-center justify-between mb-4">
            <div><span className="overline">{t("Processus d'homologation")}</span><h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Audit technique & certifications AutoLink')}</h3></div>
            <span className={`px-3 py-1.5 rounded-xl font-headline-sm text-headline-sm ${(vehicle.condition_score || 0) >= 85 ? 'bg-primary-fixed/30 text-primary' : 'bg-tertiary-fixed text-tertiary'}`}>{t('Score {{s}}/100', { s: vehicle.condition_score || '—' })}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {auditSteps.map((step) => (
              <div key={step.label} className={`p-4 rounded-xl flex flex-col gap-2 ${step.done ? 'bg-primary-fixed/20' : 'bg-surface-container-low dark:bg-slate-900'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}><Icon name={step.done ? 'check' : 'hourglass_top'} size={18} /></span>
                <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(step.label)}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t(step.sub)}</span>
              </div>
            ))}
          </div>
          {vehicle.status === 'pending' && (
            <div className="mt-4 p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-start gap-3">
              <Icon name="warning" className="text-tertiary shrink-0" />
              <p className="font-body-md text-body-md">{t('Votre véhicule est en file d’inspection. Un contrôleur AutoLink vous contactera pour planifier le contrôle physique — délai habituel de 24 à 48 h ouvrées.')}</p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
          <section className="card flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><span className="overline">{t('Planning de location')}</span><h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Disponibilités — {{m}}', { m: monthLabel })}</h3></div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="w-9 h-9 rounded-lg hover:bg-surface-container-low flex items-center justify-center" aria-label={t('Mois précédent')}><Icon name="chevron_left" /></button>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="w-9 h-9 rounded-lg hover:bg-surface-container-low flex items-center justify-center" aria-label={t('Mois suivant')}><Icon name="chevron_right" /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 font-body-sm text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" />{t('Occupé / Réservé')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-tertiary-container" />{t('Bloqué propriétaire')}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-surface-container-high" />{t('Disponible')}</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center font-label-sm text-label-sm">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <div key={d} className="py-1 text-on-surface-variant">{t(d)}</div>)}
              {calendar.map((cell, i) => cell === null
                ? <div key={`e${i}`} />
                : <div key={cell.key} className={`py-2 rounded-lg ${cell.state === 'rented' ? 'bg-primary text-on-primary' : cell.state === 'blocked' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-low dark:bg-slate-900'} ${cell.key === today ? 'ring-2 ring-secondary' : ''}`}>{cell.day}</div>)}
            </div>
            <form onSubmit={block} className="rounded-xl p-4 bg-surface-container-low dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.4fr_auto] gap-3 items-end">
              <label><span className="label">{t('Bloquer du')}</span><input type="date" required min={today} className="input-field" value={blockForm.start} onChange={(e) => setBlockForm({ ...blockForm, start: e.target.value })} /></label>
              <label><span className="label">{t('au')}</span><input type="date" required min={blockForm.start || today} className="input-field" value={blockForm.end} onChange={(e) => setBlockForm({ ...blockForm, end: e.target.value })} /></label>
              <label><span className="label">{t('Motif (optionnel)')}</span><input className="input-field" placeholder={t('Usage personnel, entretien…')} value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} /></label>
              <button type="submit" disabled={busy} className="btn-secondary"><Icon name="block" size={18} />{t('Bloquer')}</button>
            </form>
            {blocked.length > 0 && (
              <ul className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                {blocked.map((p) => <li key={p.id} className="flex items-center gap-2"><Icon name="event_busy" size={16} />{formatDate(p.start_date)} → {formatDate(p.end_date)}{p.reason && ` · ${p.reason}`}</li>)}
              </ul>
            )}

            <div className="pt-3 border-t border-outline-variant/30">
              <h4 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mb-3">{t('Locations de ce véhicule')}</h4>
              <div className="flex flex-col gap-2">
                {bookings.slice(0, 8).map((b) => {
                  const [label, cls] = B_STATUS[b.status] || B_STATUS.pending;
                  return (
                    <Link key={b.id} to={`/client/bookings/${b.id}`} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container dark:bg-slate-900">
                      <div className="min-w-0"><div className="font-label-lg text-label-lg">{b.client_name} · BK-{String(b.id).padStart(4, '0')}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(b.start_date)} → {formatDate(b.end_date)} ({t('{{n}} j', { n: b.days })})</div></div>
                      <div className="flex items-center gap-3"><span className="font-headline-sm text-headline-sm text-primary">{formatNumber(b.owner_amount)} F</span><span className={cls}>{t(label)}</span></div>
                    </Link>
                  );
                })}
                {!bookings.length && <p className="font-body-md text-body-md text-on-surface-variant">{t('Aucune location pour ce véhicule.')}</p>}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="card flex flex-col gap-3">
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white flex items-center gap-2"><Icon name="fact_check" className="text-primary" />{t('Dossier technique')}</h3>
              {[
                { label: 'Assurance', value: `${vehicleLabel(vehicle.insurance_type, 'insurance') || '—'} · ${t('expire le')} ${vehicle.insurance_expiry ? formatDate(vehicle.insurance_expiry) : '—'}`, icon: 'shield', warn: vehicle.insurance_expiry && new Date(vehicle.insurance_expiry) < new Date(Date.now() + 90 * 86400000) },
                { label: 'Contrôle technique', value: vehicle.technical_control_date ? formatDate(vehicle.technical_control_date) : t('Non renseigné'), icon: 'build' },
                { label: 'Dernière inspection', value: vehicle.last_inspection || '—', icon: 'fact_check' },
                { label: 'Km inclus / jour', value: `${vehicle.km_included_per_day} km · +${formatNumber(vehicle.extra_km_rate)} F/km`, icon: 'route' },
                { label: 'Caution client', value: `${formatNumber(vehicle.deposit_amount)} FCFA`, icon: 'lock' },
                { label: 'Chauffeur propriétaire', value: vehicle.driver_available ? t('Disponible') : t('Non proposé'), icon: 'badge' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 font-body-md text-body-md">
                  <Icon name={item.icon} size={20} className={item.warn ? 'text-tertiary' : 'text-on-surface-variant'} />
                  <div className="min-w-0"><div className="overline">{t(item.label)}</div><div className="font-label-md text-label-md text-on-surface dark:text-white">{item.value}</div></div>
                </div>
              ))}
            </section>
            {media.length > 0 && (
              <section className="card flex flex-col gap-3">
                <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Photos du dossier')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {media.slice(0, 6).map((m) => (
                    <a key={m.id} href={m.image} target="_blank" rel="noreferrer"><img src={m.image} alt={m.caption || ''} className="w-full h-20 rounded-lg object-cover" /></a>
                  ))}
                </div>
                <Link to={`/owner/vehicles/${id}/edit`} className="btn-secondary py-2">{t('Gérer les photos')}</Link>
              </section>
            )}
            {vehicle.description && (
              <section className="card"><h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mb-2">{t('Description')}</h3><p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{vehicle.description}</p></section>
            )}
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
