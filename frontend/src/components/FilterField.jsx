import React from 'react';
import { ChevronDown, Search } from 'lucide-react';

/* Champ de filtre standard — style repris du SearchWidget :
   label au-dessus, icône dans le champ, chevron sur les selects.
   Utilisable sur tous les écrans (grille parente en grid). */
export default function FilterField({ label, icon: Icon = Search, type = 'text', value, onChange, options = [], placeholder, id }) {
  const inputClass =
    'w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';
  const fid = id || `ff-${label}`;

  return (
    <div className="min-w-0">
      <label htmlFor={fid} className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {type === 'select' ? (
          <>
            <select id={fid} value={value} onChange={e => onChange(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}>
              {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </>
        ) : (
          <input id={fid} type={type} value={value} placeholder={placeholder}
            onChange={e => onChange(e.target.value)} className={inputClass} />
        )}
      </div>
    </div>
  );
}
