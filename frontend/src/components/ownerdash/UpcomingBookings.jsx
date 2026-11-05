import React from 'react';
import { CalendarRange } from 'lucide-react';
import { CATALOG_VEHICLES } from '../../utils/carImages';
import { ownerNet } from '../../utils/commission';

const carImg = (name = '') => {
  const found = CATALOG_VEHICLES.find(v => name.toLowerCase().includes((v.model || '').toLowerCase()) && v.model);
  return found?.image || CATALOG_VEHICLES[0].image;
};

const STATUS = {
  confirmed: { label: 'Départ prêt',   cls: 'bg-teal-100 text-teal-700' },
  active:    { label: 'En cours',      cls: 'bg-sky-100 text-sky-700' },
  pending:   { label: 'À confirmer',   cls: 'bg-amber-100 text-amber-700' },
};

const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch (_) { return d || '—'; } };

/* « Prochaines locations » — table compacte style Recent Orders (maquette). */
export default function UpcomingBookings({ bookings }) {
  const rows = bookings
    .filter(b => ['confirmed', 'active'].includes(b.status))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className=" text-slate-500 text-sm">Prochaines locations</h3>
        <span className="text-[11px] font-bold text-teal-600 flex items-center gap-1.5"><CalendarRange size={13} /> {rows.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[540px]">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-y border-slate-50">
              <th className="px-5 py-2.5">Véhicule</th>
              <th className="px-4 py-2.5">Locataire</th>
              <th className="px-4 py-2.5">Période</th>
              <th className="px-4 py-2.5">Net propriétaire</th>
              <th className="px-4 py-2.5">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">Aucune location confirmée.</td></tr>
            )}
            {rows.map(b => {
              const st = STATUS[b.status] || STATUS.pending;
              return (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={carImg(b.vehicle_name)} alt="" className="w-11 h-8 object-cover rounded-lg" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-[12px] truncate max-w-[130px]">{b.vehicle_name || 'Véhicule'}</div>
                        <div className="text-[9px] text-slate-400">#{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-semibold text-slate-700">{b.client_name || 'Client'}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">{fmtDate(b.start_date)} → {fmtDate(b.end_date)}</td>
                  <td className="px-4 py-3 text-[12px] font-black text-slate-900 whitespace-nowrap">
                    {Math.round(ownerNet(b)).toLocaleString('fr-FR')} <span className="text-[9px] text-slate-400 font-bold">F</span>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-black px-2 py-1 rounded-md ${st.cls}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
