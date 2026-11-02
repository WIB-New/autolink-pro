import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

/* « Rapports » — barres groupées revenu net / locations par mois (maquette). */
export default function RevenueChart({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className=" text-slate-500 text-sm flex items-center gap-2">
          <TrendingUp size={15} className="text-teal-600" /> Rapports
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-600 rounded-full" /> Revenu net</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Locations</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -18, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="rev" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
            tickFormatter={v => `${Math.round(v / 1000)}k`} />
          <YAxis yAxisId="cnt" orientation="right" hide />
          <Tooltip
            formatter={(v, name) => name === 'revenue' ? [`${Math.round(v).toLocaleString('fr-FR')} FCFA`, 'Revenu net'] : [v, 'Locations']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700 }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar yAxisId="rev" dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={10} />
          <Bar yAxisId="cnt" dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
