import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DesignShell from './DesignShell';
import useApiData from '../utils/useApiData';
import { bookingsAPI, vehiclesAPI, messagingAPI } from '../services/api';
import Icon from '../components/Icon';

const STATUS_META = {
  pending: { label: 'En attente', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  confirmed: { label: 'Confirmée', cls: 'bg-secondary-container text-on-secondary-container' },
  active: { label: 'En cours', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  completed: { label: 'Terminée', cls: 'bg-surface-container-high text-on-surface-variant' },
  cancelled: { label: 'Annulée', cls: 'bg-error-container text-on-error-container' },
  disputed: { label: 'En litige', cls: 'bg-error-container text-on-error-container' },
};
const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
const fd = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const sd = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—');

export default function DriverCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const { data: b } = useApiData(() => bookingsAPI.detail(id), [id]);
  const { data: veh } = useApiData(() => (b?.vehicle ? vehiclesAPI.detail(b.vehicle) : Promise.resolve({ data: null })), [b?.vehicle]);

  const meta = STATUS_META[b?.status] || { label: b?.status || '—', cls: 'bg-surface-container-high text-on-surface-variant' };
  const photo = veh?.image || veh?.photo || veh?.image_url || b?.vehicle_image || null;

  // Étapes du cycle : offre -> acceptation -> depart -> retour -> terminee
  const steps = useMemo(() => {
    if (!b) return [];
    const done = (k) => k <= stepIdx;
    const resp = b.driver_response;
    const stepIdx = b.status === 'completed' ? 4
      : b.status === 'active' ? 3
      : resp === 'accepted' && b.status === 'confirmed' ? 2
      : resp === 'offered' ? 1 : 0;
    return [
      { label: 'Offre reçue', sub: `Course BK-${String(b.id).padStart(4, '0')} attribuée`, icon: 'mail', done: done(0) },
      { label: 'Acceptation chauffeur', sub: resp === 'accepted' ? 'Acceptée — en attente du départ' : resp === 'refused' ? 'Refusée' : 'En attente de votre réponse', icon: 'handshake', done: resp === 'accepted' || stepIdx >= 2 },
      { label: 'Départ & clés', sub: `${sd(b.start_date)}${b.start_time ? ` · ${b.start_time}` : ''}`, icon: 'key', done: stepIdx >= 3 },
      { label: 'Retour & restitution', sub: `${sd(b.end_date)}${b.end_time ? ` · ${b.end_time}` : ''}`, icon: 'assignment_return', done: stepIdx >= 4 },
      { label: 'Finalisation', sub: 'Course clôturée', icon: 'flag', done: stepIdx >= 4 },
    ];
  }, [b]);

  const act = (status, label) => {
    if (!window.confirm(label)) return;
    const call = status === 'accepted' ? bookingsAPI.acceptDriverRide(id)
      : status === 'refused' ? bookingsAPI.refuseDriverRide(id)
      : bookingsAPI.resetDriverRide(id);
    call.then(() => { setNotice('Action enregistrée.'); setTimeout(() => window.location.reload(), 700); })
      .catch((err) => setNotice(err?.response?.data?.detail || 'Action impossible.'));
  };

  if (!b) return <DesignShell role="driver" title="Détail course"><div className="p-8 text-on-surface-variant">Chargement…</div></DesignShell>;

  return (
    <DesignShell role="driver" title={`Course BK-${String(b.id).padStart(4, '0')}`}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button onClick={() => navigate('/driver/dashboard')} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-1"><Icon name="arrow_back" size={16} />Mes courses</button>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-3">
              Course {b.vehicle_name || `BK-${String(b.id).padStart(4, '0')}`}
              <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${meta.cls}`}>{meta.label}</span>
            </h1>
            <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">Référence BK-{String(b.id).padStart(4, '0')} · Créée le {fd(b.created_at)}</p>
          </div>
        </div>
        {notice && <div className="px-4 py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant font-body-sm text-body-sm">{notice}</div>}

        {/* Cycle de vie */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2"><Icon name="route" size={20} className="text-secondary" />Parcours de la course</h2>
          <div className="flex items-start">
            {steps.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center text-center flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center ${s.done ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <Icon name={s.done ? 'check' : s.icon} size={20} />
                  </div>
                  <span className={`mt-2 font-label-sm text-label-sm font-semibold ${s.done ? 'text-primary' : 'text-on-surface-variant'}`}>ÉTAPE {i + 1} · {s.done ? 'RÉALISÉE' : 'PRÉVUE'}</span>
                  <span className="font-label-md text-label-md font-bold text-on-surface mt-0.5">{s.label}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 max-w-[150px]">{s.sub}</span>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 mt-5 rounded ${steps[i + 1].done ? 'bg-primary' : 'bg-outline-variant/40'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Véhicule */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
              {photo ? (
                <img src={photo} alt={b.vehicle_name} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-surface-container flex items-center justify-center"><Icon name="directions_car" size={64} className="text-outline" /></div>
              )}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{b.vehicle_name}</h2>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">{veh ? `${veh.brand} ${veh.model} · ${veh.plate}` : b.vehicle_plate || ''}</p>
                </div>
                <div className="text-right">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">{fmt(b.daily_rate)}</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">/ jour</p>
                </div>
              </div>
            </div>

            {/* Prise en charge / Restitution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['login', 'PRISE EN CHARGE', b.pickup_address, b.start_date, b.start_time, 'bg-primary-fixed text-on-primary-fixed-variant'],
                ['logout', 'RESTITUTION PRÉVUE', b.dropoff_address, b.end_date, b.end_time, 'bg-secondary-container text-on-secondary-container'],
              ].map(([icon, label, addr, date, time, cls]) => (
                <div key={label} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls}`}><Icon name={icon} size={20} /></div>
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">{label}</span>
                    <p className="font-label-md text-label-md font-bold text-on-surface mt-1">{fd(date)}{time ? ` · ${time}` : ''}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{addr || 'Adresse à convenir'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite : finances + client + actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 mb-4"><Icon name="receipt_long" size={19} className="text-secondary" />Détail Financier</h3>
              <dl className="space-y-2.5 font-body-md text-body-md">
                <div className="flex justify-between"><dt className="text-on-surface-variant">Course ({b.days || '?'} jour(s))</dt><dd className="font-semibold">{fmt(b.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Tarif journalier</dt><dd>{fmt(b.daily_rate)}</dd></div>
                {b.discount_percent > 0 && <div className="flex justify-between"><dt className="text-on-surface-variant">Remise client</dt><dd>-{b.discount_percent} %</dd></div>}
              </dl>
              <div className="border-t border-outline-variant/40 mt-4 pt-3 flex justify-between items-baseline">
                <span className="font-label-md text-label-md text-on-surface-variant">Total course</span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{fmt(b.subtotal)}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 mb-4"><Icon name="person" size={19} className="text-secondary" />Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold">{(b.client_name || 'C')[0]}</div>
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface">{b.client_name || 'Client AutoLink'}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{b.client_phone || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={b.client_phone ? `tel:${String(b.client_phone).replace(/\s/g, '')}` : '#'} className="py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold inline-flex items-center justify-center gap-1"><Icon name="call" size={16} />Appeler</a>
                <a href={b.client_phone ? `https://wa.me/${String(b.client_phone).replace(/\D/g, '')}` : '#'} target="_blank" rel="noreferrer" className="py-2.5 rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md font-semibold inline-flex items-center justify-center gap-1"><Icon name="chat" size={16} />WhatsApp</a>
              </div>
            </div>

            {(b.driver_response === 'offered' || b.driver_response === 'accepted' || b.driver_response === 'refused') && (
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 mb-4"><Icon name="task_alt" size={19} className="text-secondary" />Vos actions</h3>
                <div className="flex flex-col gap-2">
                  {b.driver_response === 'offered' && b.status === 'confirmed' && (
                    <>
                      <button onClick={() => act('accepted', 'Accepter cette course ?')} className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold">Accepter la course</button>
                      <button onClick={() => act('refused', 'Refuser cette course ?')} className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface font-label-md text-label-md font-semibold">Refuser</button>
                    </>
                  )}
                  {b.driver_response === 'accepted' && b.status === 'confirmed' && (
                    <button onClick={() => act('refused', 'Vous désister de cette course ?')} className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface font-label-md text-label-md font-semibold">Se désister</button>
                  )}
                  {b.driver_response === 'refused' && (
                    <button onClick={() => act('pending', 'Annuler votre refus ?')} className="w-full py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md font-semibold">Annuler le refus</button>
                  )}
                  <button onClick={() => {
                    messagingAPI.open({ booking: b?.id || id })
                      .then(({ data: conv }) => navigate(`/driver/messages?conv=${conv.id}`))
                      .catch(() => navigate('/driver/messages'));
                  }} className="w-full py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold inline-flex items-center justify-center gap-1"><Icon name="chat" size={16} />Messagerie</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DesignShell>
  );
}
