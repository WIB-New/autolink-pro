import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const last6Months = () => {
  const map = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    map[`${d.getFullYear()}-${d.getMonth()}`] = { m: MONTHS[d.getMonth()], resa: 0, rev: 0 };
  }
  return map;
};

/* « Rapports » — barres groupées locations / CA par mois (maquette). */
export function RevenueChart({ bookings = [] }) {
  const data = useMemo(() => {
    const map = last6Months();
    bookings.forEach(b => {
      const d = new Date(b.created_at || b.start_date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (map[k]) { map[k].resa += 1; map[k].rev += Number(b.subtotal || 0) / 1000; }
    });
    return Object.values(map);
  }, [bookings]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <TrendingUp size={15} className="text-teal-600" /> Rapports
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-600 rounded-full" /> Locations</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> CA (K FCFA)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -22, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v, name) => name === 'resa' ? `${v} locations` : `${fmt(v * 1000)} FCFA`}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700 }}
            cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="resa" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={10} />
          <Bar dataKey="rev" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Donut « Répartition » — parts de la flotte par gamme (maquette). */
const TIER_COLORS = { basic: '#94a3b8', standard: '#0d9488', premium: '#f59e0b', gold: '#0f766e', collection: '#7c3aed' };
const TIER_NAMES = { basic: 'Citadines', standard: 'Berlines & SUV', premium: 'Prestige', gold: '4x4 Haut de Gamme', collection: 'Collection' };

export function TierRepartition({ vehicles = [] }) {
  const counts = useMemo(() => {
    const c = {};
    vehicles.forEach(v => { const t = v.tier || 'standard'; c[t] = (c[t] || 0) + 1; });
    return Object.entries(c).map(([t, n]) => ({
      t, n,
      name: TIER_NAMES[t] || t, color: TIER_COLORS[t] || '#0d9488',
    })).sort((a, b) => b.n - a.n);
  }, [vehicles]);
  const total = vehicles.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
        <PieIcon size={15} className="text-teal-600" /> Répartition
      </h3>
      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={counts} dataKey="n" nameKey="name" innerRadius={48} outerRadius={68}
              paddingAngle={3} strokeWidth={0}>
              {counts.map(r => <Cell key={r.t} fill={r.color} />)}
            </Pie>
            <Tooltip formatter={(v, name) => [`${v} véhicule${v > 1 ? 's' : ''}`, name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">véhicules</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {counts.map(r => (
          <div key={r.t} className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
            <span className="flex-1 font-semibold text-slate-600 truncate">{r.name}</span>
            <span className="font-black text-slate-900">{r.n}</span>
          </div>
        ))}
        {counts.length === 0 && <p className="text-xs text-slate-400 text-center py-2">Aucune donnée.</p>}
      </div>
    </div>
  );
}

/* Carte accent « Revenus plateforme » — sparkline + commission + CTA (maquette). */
export function PlatformRevenue({ commission = 0, grossRevenue = 0, sparkData = [] }) {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-sm p-5 text-white flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-teal-100">Revenus plateforme</span>
        <span className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><TrendingUp size={14} /></span>
      </div>
      <div className="h-[95px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#commGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-2xl font-black mt-1 leading-none">
        {fmt(commission)} <span className="text-[11px] font-bold text-teal-100">FCFA</span>
      </div>
      <div className="text-[10px] font-semibold text-teal-100 mt-1.5 mb-4">
        15 % prélevés sur {fmt(grossRevenue)} FCFA
      </div>
      <button onClick={() => navigate('/admin/finance')}
        className="mt-auto w-full flex items-center justify-center gap-1.5 bg-white text-teal-700 hover:bg-teal-50 text-[11px] font-black py-2.5 rounded-xl transition-colors">
        Gérer les finances <ArrowUpRight size={13} />
      </button>
    </div>
  );
}
