import React from 'react';
import { MapPin, Phone, UserCheck } from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';
import { ownerNet } from '../../utils/commission';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };

export const STATUS = {
  pending:   { label: 'En attente de paiement', cls: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Confirmée',              cls: 'bg-teal-50 text-teal-700' },
  active:    { label: 'En cours',               cls: 'bg-sky-50 text-sky-700' },
  completed: { label: 'Terminée',               cls: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulée',                cls: 'bg-red-50 text-red-500' },
  disputed:  { label: 'Litige en arbitrage',    cls: 'bg-red-50 text-red-600' },
};

export const DRIVER_LABEL = { none: 'Sans chauffeur', internal: 'Chauffeur AutoLink', owner: 'Votre chauffeur' };

const initials = n => (n || 'C').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

/* Carte réservation — uniquement des données réelles de l'API. */
export default function RequestCard({ b, selected, onSelect }) {
  const st = STATUS[b.status] || STATUS.pending;

  return (
    <div onClick={() => onSelect?.(b)}
      className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${selected ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg' : 'border-slate-100 shadow-sm hover:border-teal-200 hover:shadow-md'}`}>
      {/* Client */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-slate-800 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">{initials(b.client_name)}</div>
          <div className="min-w-0">
            <h4 className="font-black text-slate-900 text-sm truncate">{b.client_name || 'Client'}</h4>
            {b.client_phone && (
              <a href={`tel:${b.client_phone}`} onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-teal-600 mt-0.5">
                <Phone size={10} /> {b.client_phone}
              </a>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 ${st.cls}`}>{st.label}</span>
      </div>

      {/* Véhicule */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-4">
        <img src={fleetImage({ model: b.vehicle_name, brand: b.vehicle_name })} alt="" className="w-16 h-12 object-cover rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900 text-xs truncate">{b.vehicle_name || 'Véhicule'}</span>
            {b.vehicle_plate && <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded tracking-widest">{b.vehicle_plate}</span>}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><UserCheck size={10} /> {DRIVER_LABEL[b.driver_type] || DRIVER_LABEL.none}</p>
        </div>
        {b.pickup_address && (
          <div className="text-right shrink-0 max-w-[40%]">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prise en charge</div>
            <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1 justify-end truncate"><MapPin size={9} /> {b.pickup_address}</div>
          </div>
        )}
      </div>

      {/* Détails */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Période', v1: fmtDate(b.start_date), v2: `→ ${fmtDate(b.end_date)} · ${b.days || '—'} j` },
          { label: 'Restitution', v1: b.dropoff_address || 'Lieu de prise en charge', v2: '' },
          { label: 'Caution client', v1: `${fmt(b.deposit_amount)} FCFA`, v2: b.deposit_status === 'held' ? 'Bloquée' : b.deposit_status === 'released' ? 'Restituée' : b.deposit_status === 'forfeited' ? 'Versée au propriétaire' : '' },
        ].map(c => (
          <div key={c.label} className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.label}</div>
            <div className="text-[11px] font-black text-slate-800 truncate">{c.v1}</div>
            {c.v2 && <div className="text-[10px] text-slate-400 truncate">{c.v2}</div>}
          </div>
        ))}
      </div>

      {/* Gain */}
      <div className="pt-3 border-t border-slate-50">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gain net propriétaire</div>
        <div className="text-xl font-black text-slate-900">
          {fmt(ownerNet(b))} <span className="text-xs text-slate-400">FCFA</span>
          <span className="ml-2 text-[10px] text-slate-400 font-semibold">sur {fmt(b.subtotal)} FCFA payés</span>
        </div>
      </div>
    </div>
  );
}
