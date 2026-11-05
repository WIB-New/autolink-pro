import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';
import { COMMISSION_LABEL, ownerNet } from '../../utils/commission';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };
const PAGE = 4;

/* « Détail par location & Décomposition des revenus » — table paginée. */
export default function RevenueTable({ bookings }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const rows = bookings
    .filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
    .filter(b => !q || `${b.client_name} ${b.vehicle_name}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-50 flex-wrap">
        <div>
          <h3 className=" text-slate-500">Détail par location &amp; Décomposition des revenus</h3>
          {/* <p className="text-[11px] text-slate-400 mt-0.5">Transparence totale sur commissions, assurances et montants nets crédités.</p> */}
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Rechercher un client ou un véhicule…"
            className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs w-56 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[680px]">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-6 py-3">Date &amp; n° dossier</th>
              <th className="px-4 py-3">Véhicule loué</th>
              <th className="px-4 py-3">Locataire</th>
              <th className="px-4 py-3">Montant brut</th>
              <th className="px-4 py-3">Commission ({COMMISSION_LABEL})</th>
              <th className="px-6 py-3 text-right">Net propriétaire</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">Aucune location comptabilisée pour le moment.</td></tr>
            )}
            {slice.map(b => (
              <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-6 py-4">
                  <div className="text-[11px] font-black text-slate-800">{fmtDate(b.start_date)}</div>
                  <div className="text-[9px] text-slate-400">BKP-{String(b.id).padStart(4, '0')}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2.5">
                    <img src={fleetImage({ model: b.vehicle_name, brand: b.vehicle_name })} alt="" className="w-12 h-9 object-cover rounded-lg" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-800 truncate max-w-[140px]">{b.vehicle_name || 'Véhicule'}</div>
                      <div className="text-[9px] text-slate-400">{b.vehicle_plate || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-[11px] font-bold text-slate-800">{b.client_name || 'Client'}</div>
                  <div className="text-[9px] text-slate-400">{b.days || '—'} jours · {b.driver_type === 'none' ? 'Autonome' : 'Chauffeur'}</div>
                </td>
                <td className="px-4 py-4 text-[11px] font-bold text-slate-800">{fmt(b.subtotal)} FCFA</td>
                <td className="px-4 py-4 text-[11px] font-bold text-red-500">− {fmt(b.commission_amount)} FCFA</td>
                <td className="px-6 py-4 text-right text-[12px] font-black text-teal-700">{fmt(ownerNet(b))} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 text-[10px] text-slate-400">
        <span>Affichage de {slice.length} location(s) sur {rows.length}.</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40" disabled={page === 1}>Précédent</button>
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded-lg text-[10px] font-black ${page === i + 1 ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold disabled:opacity-40" disabled={page === pages}>Suivant</button>
        </div>
      </div>
    </div>
  );
}
