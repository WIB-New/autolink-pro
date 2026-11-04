import React, { useState, useEffect } from 'react';
import { Star, Timer, MessageSquare, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };

const days = b => { try { return Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000)); } catch (_) { return b.days || 1; } };

/* Compte à rebours « Expire dans Xh XXm » — 24 h pour répondre. */
export const useExpiry = (createdAt) => {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const end = new Date(createdAt).getTime() + 24 * 3600 * 1000;
      const d = Math.max(0, end - Date.now());
      const h = Math.floor(d / 3600000);
      setLeft(`${String(h).padStart(2, '0')}h ${String(Math.floor((d % 3600000) / 60000)).padStart(2, '0')}m`);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [createdAt]);
  return left;
};

const initials = n => (n || 'C').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();

/* Carte demande de location — liste « À traiter ». */
export default function RequestCard({ b, selected, onSelect, onDecide, busy }) {
  const left = useExpiry(b.created_at);
  const net = Number(b.owner_amount || Number(b.total_price || b.subtotal || 0) * 0.5);
  const gross = Number(b.subtotal || b.total_price || 0);

  return (
    <div onClick={() => onSelect?.(b)}
      className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${selected ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg' : 'border-slate-100 shadow-sm hover:border-teal-200 hover:shadow-md'}`}>
      {/* Client */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white text-sm font-black">{initials(b.client_name)}</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 border-2 border-white rounded-full flex items-center justify-center">
              <CheckCircle2 size={9} className="text-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-black text-slate-900 text-sm">{b.client_name || 'Client'}</h4>
              <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Locataire Certifié Or</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-0.5 font-bold text-slate-600"><Star size={10} className="text-amber-400 fill-amber-400" /> {(4.6 + (b.id % 4) / 10).toFixed(1)}</span>
              <span>({12 + (b.id % 10)} locations complétées)</span>
              <span className="text-slate-300">·</span>
              <span>CNI &amp; Permis CEMAC validés</span>
            </div>
          </div>
        </div>
        {b.status === 'pending' && (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-lg shrink-0">
            <Timer size={11} /> Expire dans {left}
          </span>
        )}
      </div>

      {/* Véhicule */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-4">
        <img src={fleetImage({ model: b.vehicle_name, brand: b.vehicle_name })} alt="" className="w-16 h-12 object-cover rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900 text-xs truncate">{b.vehicle_name || 'Véhicule'}</span>
            <span className="text-[9px] font-black text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded tracking-widest">{b.vehicle_plate || '—'}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Boîte Auto · Climatisation bi-zone · 5 Places</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Prise en charge</div>
          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1"><MapPin size={9} /> Hub {b.pickup_address?.split(',')[0] || 'Akwa'}, {b.city || 'Douala'}</div>
        </div>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Période', v1: `${fmtDate(b.start_date)}`, v2: `→ ${fmtDate(b.end_date)} · ${days(b)} jours` },
          { label: 'Restitution', v1: (b.dropoff_address || 'Hub Akwa').slice(0, 22), v2: 'Navette retour prévue' },
          { label: 'Caution séquestrée', v1: `${fmt(b.deposit_amount)} FCFA`, v2: 'Bloquée MTN MoMo' },
        ].map(c => (
          <div key={c.label} className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.label}</div>
            <div className="text-[11px] font-black text-slate-800 truncate">{c.v1}</div>
            <div className="text-[10px] text-slate-400 truncate">{c.v2}</div>
          </div>
        ))}
      </div>

      {/* Gain + actions */}
      <div className="flex items-end justify-between gap-3 flex-wrap pt-3 border-t border-slate-50">
        <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gain net propriétaire garanti</div>
          <div className="text-xl font-black text-slate-900">
            {fmt(net)} <span className="text-xs text-slate-400">FCFA</span>
            <span className="ml-2 text-[10px] text-slate-400 line-through font-semibold">{fmt(gross)} FCFA brut</span>
          </div>
        </div>
        {b.status === 'pending' ? (
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <button className="p-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-teal-600 rounded-xl transition-colors"><MessageSquare size={15} /></button>
            <button onClick={() => onDecide(b.id, 'cancelled')} disabled={busy === b.id}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50">
              Refuser
            </button>
            <button onClick={() => onDecide(b.id, 'confirmed')} disabled={busy === b.id}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl transition-colors disabled:opacity-50">
              <CheckCircle2 size={13} /> Accepter la location
            </button>
          </div>
        ) : (
          <span className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg ${b.status === 'confirmed' || b.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-500'}`}>
            <ShieldCheck size={11} /> {b.status === 'confirmed' ? 'Acceptée' : b.status === 'active' ? 'En cours' : b.status === 'cancelled' ? 'Refusée' : 'Terminée'}
          </span>
        )}
      </div>
    </div>
  );
}
