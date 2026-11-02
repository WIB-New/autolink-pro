import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Banknote, ArrowUpRight } from 'lucide-react';

/* Carte accent « Solde disponible » — sparkline + montant + CTA retrait (maquette). */
export default function BalanceCard({ available = 0, pending = 0, total = 0, spark = [] }) {
  const navigate = useNavigate();
  const fmt = n => Math.round(n).toLocaleString('fr-FR');
  return (
    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-sm p-5 text-white flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-teal-100">Solde disponible</span>
        <span className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center"><Banknote size={14} /></span>
      </div>
      <div className="h-[95px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#balGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-2xl font-black mt-1 leading-none">
        {fmt(available)} <span className="text-[11px] font-bold text-teal-100">FCFA</span>
      </div>
      <div className="text-[10px] font-semibold text-teal-100 mt-1.5 mb-4">
        En attente : {fmt(pending)} F · Cumul : {fmt(total)} F
      </div>
      <button onClick={() => navigate('/owner/revenue')}
        className="mt-auto w-full flex items-center justify-center gap-1.5 bg-white text-teal-700 hover:bg-teal-50 text-[11px] font-black py-2.5 rounded-xl transition-colors">
        Retirer mes revenus <ArrowUpRight size={13} />
      </button>
    </div>
  );
}
