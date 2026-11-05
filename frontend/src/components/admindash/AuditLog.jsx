import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Wallet, ShieldCheck, Car, ArrowRight, MoreHorizontal } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }); } catch (_) { return d || '—'; } };

const STATUS = {
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmée',  cls: 'bg-teal-100 text-teal-700' },
  active:    { label: 'En cours',   cls: 'bg-sky-100 text-sky-700' },
  completed: { label: 'Terminée',   cls: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulée',    cls: 'bg-red-100 text-red-600' },
  disputed:  { label: 'Litige',     cls: 'bg-red-100 text-red-600' },
};

const timeOf = iso => new Date(iso).toLocaleTimeString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { hour: '2-digit', minute: '2-digit' });

/* « Réservations récentes » — tableau style Recent Orders (maquette). */
export function RecentBookings({ bookings = [] }) {
  const navigate = useNavigate();
  const rows = bookings.slice(0, 6);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-sm">Réservations récentes</h3>
        <button onClick={() => navigate('/admin/reservations')}
          className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700">
          Tout voir <ArrowRight size={11} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-y border-slate-50">
              <th className="px-5 py-2.5">Client</th>
              <th className="px-4 py-2.5">Véhicule</th>
              <th className="px-4 py-2.5">Période</th>
              <th className="px-4 py-2.5">Montant</th>
              <th className="px-4 py-2.5">Statut</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(b => {
              const st = STATUS[b.status] || STATUS.pending;
              return (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0">
                        {(b.client_name || 'C').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12px] font-bold text-slate-800 truncate">{b.client_name || 'Client'}</div>
                        <div className="text-[9px] text-slate-400">BK-{String(b.id).padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-semibold text-slate-600 truncate max-w-[120px]">{b.vehicle_name || '—'}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">{fmtDate(b.start_date)} → {fmtDate(b.end_date)}</td>
                  <td className="px-4 py-3 text-[12px] font-black text-slate-900 whitespace-nowrap">{fmt(b.subtotal)} <span className="text-[9px] text-slate-400 font-bold">F</span></td>
                  <td className="px-4 py-3"><span className={`text-[9px] font-black px-2 py-1 rounded-md ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => navigate(`/admin/reservations`)} className="p-1 text-slate-300 hover:text-teal-600 transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">Aucune réservation.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* « Activité » — liste compacte style Transactions (maquette). */
export default function AuditLog({ bookings = [], vehicles = [] }) {
  const events = useMemo(() => {
    const evts = [];
    bookings.slice(0, 6).forEach(b => {
      const held = b.deposit_amount > 0 || b.escrow_status === 'held';
      evts.push({
        at: b.created_at,
        icon: held ? Wallet : ShieldCheck,
        iconCls: held ? 'bg-amber-50 text-amber-600' : 'bg-teal-50 text-teal-600',
        title: held ? 'Caution séquestre' : 'Réservation validée',
        sub: `BK-${String(b.id).padStart(4, '0')} · ${b.client_name || 'Client'}`,
        amount: `+${fmt(b.deposit_amount || b.subtotal)}`,
      });
    });
    vehicles.filter(v => v.status === 'pending').slice(0, 3).forEach(v => {
      evts.push({
        at: v.created_at || new Date().toISOString(),
        icon: Car, iconCls: 'bg-blue-50 text-blue-600',
        title: 'Véhicule soumis',
        sub: `${v.brand} ${v.model} · ${v.plate || ''}`,
        amount: null,
      });
    });
    return evts.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7);
  }, [bookings, vehicles]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <ScrollText size={15} className="text-teal-600" /> Activité
        </h3>
      </div>
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${e.iconCls}`}>
              <e.icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-slate-800 truncate">{e.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{e.sub} · {timeOf(e.at)}</div>
            </div>
            {e.amount && <span className="text-[11px] font-black text-emerald-600 shrink-0">{e.amount}</span>}
          </div>
        ))}
        {events.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucun événement.</p>}
      </div>
    </div>
  );
}
