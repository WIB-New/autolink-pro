import React from 'react';

/* Carte KPI standard — icône en haut, valeur, libellé.
   Disposition verticale : la plus professionnelle pour des cartes compactes,
   identique sur toutes les pages (admin & owner). */
export default function StatCard({ icon: Icon, label, value, unit, iconCls = 'bg-blue-50 text-blue-600', onClick, title }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} title={title}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-6 min-h-[128px] w-full max-w-[300px] mx-auto h-full text-left flex flex-col ${onClick ? 'hover:border-teal-300 transition-colors cursor-pointer' : ''}`}>
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
        <Icon size={19} />
      </span>
      <div className="mt-auto pt-4">
        <div className="text-2xl font-black text-slate-900 leading-none truncate">
          {value}{unit ? <span className="text-[10px] font-bold text-slate-400"> {unit}</span> : null}
        </div>
        <div className="text-[11px] font-semibold text-slate-400 mt-1.5 truncate">{label}</div>
      </div>
    </Comp>
  );
}
