import React from 'react';
import { Search, LayoutGrid, List, MapPin, ArrowUpDown } from 'lucide-react';
import FilterField from '../FilterField';

export const TABS = [
  { id: 'all',         label: 'Tous les véhicules' },
  { id: 'approved',    label: 'En ligne / Actifs' },
  { id: 'rented',      label: 'En location en ce moment' },
  { id: 'pending',     label: 'En attente de validation' },
  { id: 'maintenance', label: 'En maintenance' },
];

const matchTab = (v, tab) =>
  tab === 'all' ? true
  : tab === 'maintenance' ? ['maintenance', 'suspended'].includes(v.status)
  : v.status === tab;
export const filterByTab = (vehicles, tab) => vehicles.filter(v => matchTab(v, tab));

/* Barre d'outils flotte — carte unique : onglets soulignés en haut, filtres en dessous. */
export default function FleetToolbar({ vehicles, tab, setTab, search, setSearch, city, setCity, cities, sort, setSort, grid, setGrid }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      {/* Onglets + toggle vue */}
      <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
        {TABS.map(t => {
          const count = filterByTab(vehicles, t.id).length;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${active ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
              {active && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          );
        })}
        <div className="ml-auto pl-3 shrink-0 flex border border-slate-200 rounded-xl overflow-hidden mb-1.5">
          <button onClick={() => setGrid(false)} title="Vue liste"
            className={`p-2 ${!grid ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={14} /></button>
          <button onClick={() => setGrid(true)} title="Vue grille"
            className={`p-2 ${grid ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={14} /></button>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-[1fr_190px_200px] gap-3.5 items-end">
        <FilterField label="Recherche" icon={Search} value={search} onChange={setSearch}
          placeholder="Modèle, marque, immatriculation…" />
        <FilterField label="Ville" icon={MapPin} type="select" value={city} onChange={setCity}
          options={[{ value: '', label: 'Toutes les villes' }, ...cities.map(c => ({ value: c, label: c }))]} />
        <FilterField label="Tri" icon={ArrowUpDown} type="select" value={sort} onChange={setSort}
          options={[
            { value: 'revenue', label: 'Revenus générés' },
            { value: 'rate', label: 'Tarif journalier' },
            { value: 'score', label: 'Score qualité' },
            { value: 'recent', label: 'Plus récents' },
          ]} />
      </div>
    </div>
  );
}
