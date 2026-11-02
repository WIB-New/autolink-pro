import React from 'react';
import { Search, Loader } from 'lucide-react';

/* Table générique réutilisable (style dashboard) :
   - en-tête : titre + chips de filtre + recherche
   - body : colonnes définies par config { label, align, render(row) }
   - clic ligne : onRowClick(row)
   Usage identique sur les pages admin (partenaires, clients, etc.). */
export default function DataTable({
  title, filters = [], filter, setFilter,
  search, setSearch, searchPlaceholder = 'Rechercher…',
  columns, rows = [], loading = false,
  emptyText = 'Aucune donnée trouvée.', onRowClick,
}) {
  const cellPad = (i, align) =>
    `${i === 0 ? 'px-5' : 'px-3'} py-3 ${i === columns.length - 1 ? 'pr-5' : ''} ${align === 'right' ? 'text-right' : ''}`;
  const headPad = (i, align) =>
    `${i === 0 ? 'px-5' : 'px-3'} py-2.5 ${i === columns.length - 1 ? 'pr-5' : ''} ${align === 'right' ? 'text-right' : ''}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-5 pt-4 pb-3">
        <h3 className="font-black text-slate-900 text-sm">{title}</h3>
        {filters.length > 0 && setFilter && (
          <div className="flex gap-1.5">
            {filters.map(([id, l]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`text-[9px] font-black px-2 py-1 rounded-lg transition-colors ${filter === id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recherche */}
      {setSearch && (
        <div className="px-5 pb-3">
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              {columns.map((col, i) => <th key={i} className={headPad(i, col.align)}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={columns.length} className="px-5 py-10 text-center text-slate-400 text-xs">
                <Loader size={16} className="animate-spin mx-auto mb-2" />Chargement…
              </td></tr>
            )}
            {!loading && rows.map((row, ri) => (
              <tr key={row.id ?? ri} onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50/60' : ''}`}>
                {columns.map((col, i) => <td key={i} className={cellPad(i, col.align)}>{col.render(row)}</td>)}
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-xs text-slate-400">{emptyText}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
