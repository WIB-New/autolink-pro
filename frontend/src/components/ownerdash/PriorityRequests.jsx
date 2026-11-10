import React, { useState, useEffect } from 'react';
import { Timer, Star, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { getVehicleImage } from '../../utils/carImages';

const carImg = (b) => b.vehicle_image || getVehicleImage('default');

const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }); } catch (_) { return d; } };

/* Compte à rebours « Expire dans … » — délai de réponse de 8 h après création. */
const useCountdown = (createdAt) => {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const end = new Date(createdAt).getTime() + 8 * 3600 * 1000;
      const d = Math.max(0, end - Date.now());
      const h = String(Math.floor(d / 3600000)).padStart(2, '0');
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
      setLeft(`${h}h ${m}m`);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [createdAt]);
  return left;
};

function RequestCard({ b, onDecide, busy }) {
  const left = useCountdown(b.created_at);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3.5">
      <img src={carImg(b)} alt={b.vehicle_name} className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4 className="font-black text-slate-900 text-sm truncate">{b.vehicle_name || 'Véhicule'}</h4>
          <div className="text-right shrink-0">
            <div className="font-black text-slate-900 text-sm">{Number(b.total_price || 0).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} <span className="text-[10px] text-teal-600">FCFA</span></div>
            <div className="text-[10px] text-slate-400 font-medium">{fmtDate(b.start_date)} → {fmtDate(b.end_date)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[8px] font-black">
            {(b.client_name || 'C').split(' ').map(x => x[0]).join('').slice(0, 2)}
          </span>
          <span className="text-[11px] font-semibold text-slate-700">{b.client_name || 'Client'}</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400"><Star size={10} className="text-amber-400 fill-amber-400" /> 4,8</span>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500">
            <Timer size={12} /> {left}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onDecide(b.id, 'cancelled')} disabled={busy === b.id}
              className="border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-600 text-[11px] font-bold px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              Refuser
            </button>
            <button onClick={() => onDecide(b.id, 'confirmed')} disabled={busy === b.id}
              className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {busy === b.id ? <Loader size={12} className="animate-spin" /> : null} Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Demandes en attente — bandeau compact, masqué s'il n'y a rien à traiter. */
export default function PriorityRequests({ bookings, onChanged }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const pending = bookings.filter(b => b.status === 'pending');
  if (pending.length === 0) return null;

  const decide = async (id, status) => {
    setBusy(id);
    try { await bookingsAPI.updateStatus(id, status); } catch (_) {}
    setBusy(null);
    onChanged?.();
  };

  return (
    <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Demandes en attente
          <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">{pending.length}</span>
        </h3>
        <button onClick={() => navigate('/owner/requests')} className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">Tout voir <ArrowRight size={11} /></button>
      </div>
      <div className="grid xl:grid-cols-2 gap-3.5">
        {pending.map(b => <RequestCard key={b.id} b={b} onDecide={decide} busy={busy} />)}
      </div>
    </section>
  );
}
