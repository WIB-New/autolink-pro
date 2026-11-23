import React from 'react';
import { Banknote, CalendarRange, Star, CheckCircle2 } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* 4 KPI de la fiche véhicule : revenus, occupation du mois, note réelle, missions. */
export default function VehicleStats({ earned = 0, bookedDays = 0, daysInMonth = 30, rating = null, ratingCount = 0, missions = 0 }) {
  const occupancy = daysInMonth ? (bookedDays / daysInMonth) * 100 : 0;
  const items = [
    { icon: Banknote,      label: 'Revenus cumulés',        value: <>{fmt(earned)} <span className="text-xs text-slate-400">FCFA</span></>, sub: 'total encaissé à ce jour' },
    { icon: CalendarRange, label: "Taux d'occupation",      value: <>{Math.round(occupancy)}<span className="text-sm text-slate-400">%</span></>, sub: `${bookedDays} / ${daysInMonth} jours réservés ce mois` },
    { icon: Star,          label: 'Note moyenne locataire', value: rating != null ? <>{Number(rating).toFixed(1).replace('.', ',')} <span className="text-xs text-slate-400">/5</span></> : <span className="text-base text-slate-400">—</span>, sub: ratingCount ? `basée sur ${ratingCount} avis client${ratingCount > 1 ? 's' : ''}` : 'aucun avis pour le moment' },
    { icon: CheckCircle2,  label: 'Locations réalisées',    value: <>{missions} <span className="text-xs text-slate-400">location{missions > 1 ? 's' : ''}</span></>, sub: 'terminées' },
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
