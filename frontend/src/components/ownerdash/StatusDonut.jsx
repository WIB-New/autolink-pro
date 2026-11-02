import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const STATUS = {
  confirmed: { name: 'Confirmées', color: '#0d9488' },
  active:    { name: 'En cours',   color: '#38bdf8' },
  pending:   { name: 'En attente', color: '#f59e0b' },
  completed: { name: 'Terminées',  color: '#94a3b8' },
  cancelled: { name: 'Annulées',   color: '#f87171' },
  disputed:  { name: 'Litiges',    color: '#dc2626' },
};

/* Donut « Réservations » — répartition par statut avec total au centre (maquette). */
export default function StatusDonut({ bookings = [] }) {
  const data = useMemo(() => {
    const c = {};
    bookings.forEach(b => { const s = b.status || 'pending'; c[s] = (c[s] || 0) + 1; });
    return Object.entries(c).map(([s, n]) => ({
      s, n,
      name: STATUS[s]?.name || s,
      color: STATUS[s]?.color || '#94a3b8',
    })).sort((a, b) => b.n - a.n);
  }, [bookings]);
  const total = bookings.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className=" text-slate-500 text-sm flex items-center gap-2 mb-4">
        <PieIcon size={15} className="text-teal-600" /> Réservations
      </h3>
      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="n" nameKey="name" innerRadius={48} outerRadius={68}
              paddingAngle={3} strokeWidth={0}>
              {data.map(r => <Cell key={r.s} fill={r.color} />)}
            </Pie>
            <Tooltip formatter={(v, name) => [`${v} réservation${v > 1 ? 's' : ''}`, name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">locations</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map(r => (
          <div key={r.s} className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
            <span className="flex-1 font-semibold text-slate-600 truncate">{r.name}</span>
            <span className="font-black text-slate-900">{r.n}</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Aucune donnée.</p>}
      </div>
    </div>
  );
}
