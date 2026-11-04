import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATALOG_VEHICLES } from '../../utils/carImages';
import { ownerNet } from '../../utils/commission';

const carImg = (name = '') => {
  const found = CATALOG_VEHICLES.find(v => name.toLowerCase().includes((v.model || '').toLowerCase()) && v.model);
  return found?.image || CATALOG_VEHICLES[0].image;
};

const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch (_) { return d; } };

/* Réservations en attente de paiement — la confirmation est automatique dès que
   le client a payé ; le propriétaire n'a rien à valider, il est simplement informé.
   Bandeau masqué s'il n'y a rien en attente. */
export default function PriorityRequests({ bookings }) {
  const navigate = useNavigate();
  const pending = bookings.filter(b => b.status === 'pending');
  if (pending.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Clock size={14} className="text-amber-500" />
          En attente de paiement client
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">{pending.length}</span>
        </h3>
        <button onClick={() => navigate('/owner/requests')} className="text-[11px] text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">Tout voir <ArrowRight size={11} /></button>
      </div>
      <div className="grid xl:grid-cols-2 gap-3">
        {pending.map(b => (
          <div key={b.id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
            <img src={carImg(b.vehicle_name)} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-black text-slate-900 text-[13px] truncate">{b.vehicle_name || 'Véhicule'}</div>
              <div className="text-[11px] text-slate-500 truncate">{b.client_name || 'Client'} · {fmtDate(b.start_date)} → {fmtDate(b.end_date)}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-slate-900 text-[13px]">{Math.round(ownerNet(b)).toLocaleString('fr-FR')} <span className="text-[10px] text-teal-600">F net</span></div>
              <div className="text-[10px] text-amber-600 font-bold">Confirmée au paiement</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
