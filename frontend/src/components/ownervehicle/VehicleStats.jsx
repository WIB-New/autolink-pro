import React from 'react';
import { Banknote, CalendarRange, Star, CheckCircle2 } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* 4 KPI de la fiche véhicule : revenus, occupation, note, missions. */
export default function VehicleStats({ earned = 0, occupancy = 0, rating = 4.9, missions = 0 }) {
  const items = [
    { icon: Banknote,      label: 'Revenus cumulés',       value: <>{fmt(earned)} <span className="text-xs text-slate-400">FCFA</span></>, sub: '+24 % vs le mois dernier' },
    { icon: CalendarRange, label: "Taux d'occupation",     value: <>{Math.round(occupancy)}<span className="text-sm text-slate-400">%</span></>, sub: '24 / 31 jours réservés' },
    { icon: Star,          label: 'Note moyenne locataire', value: <>{rating.toFixed(2).replace('.', ',')} <span className="text-xs text-slate-400">/5</span></>, sub: 'basée sur 24 avis certifiés' },
    { icon: CheckCircle2,  label: 'Missions réalisées',     value: <>{missions} <span className="text-xs text-slate-400">locations</span></>, sub: '100 % sans incident majeur' },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map(k => (
        <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{k.label}</span>
            <k.icon size={14} className="text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{k.value}</div>
          <div className="text-[10px] text-teal-600 font-bold mt-1">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
