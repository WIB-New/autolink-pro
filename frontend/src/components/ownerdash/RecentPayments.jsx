import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowDownLeft, Clock, ArrowRight } from 'lucide-react';
import { ownerNet } from '../../utils/commission';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const timeOf = iso => { try { return new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }); } catch (_) { return '—'; } };

/* « Transactions » — liste compacte des derniers encaissements (maquette). */
export default function RecentPayments({ bookings = [] }) {
  const navigate = useNavigate();
  const rows = useMemo(() => bookings
    .filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
    .slice(0, 7)
    .map(b => ({
      id: b.id,
      done: b.status === 'completed',
      title: `BK-${String(b.id).padStart(4, '0')} · ${b.client_name || 'Client'}`,
      sub: timeOf(b.end_date || b.created_at),
      amount: ownerNet(b),
    })), [bookings]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className=" text-slate-500 text-sm flex items-center gap-2">
          <Wallet size={15} className="text-teal-600" /> Transactions
        </h3>
        <button onClick={() => navigate('/owner/revenue')}
          className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700">
          Tout voir <ArrowRight size={11} />
        </button>
      </div>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.id} className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {r.done ? <ArrowDownLeft size={15} /> : <Clock size={15} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold text-slate-800 truncate">{r.title}</div>
              <div className="text-[10px] text-slate-400">{r.sub} · {r.done ? 'Versé' : 'En cours'}</div>
            </div>
            <span className={`text-[11px] font-black shrink-0 ${r.done ? 'text-emerald-600' : 'text-amber-600'}`}>
              +{fmt(r.amount)}
            </span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune transaction.</p>}
      </div>
    </div>
  );
}
