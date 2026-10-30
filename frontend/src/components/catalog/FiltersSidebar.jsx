import React from 'react';
import { ShieldCheck, RotateCcw, X } from 'lucide-react';
import { vehicleBrand } from '../../utils/vehicleMeta';

export const GAMMES = [
  { id: 'basic',    label: 'Basic' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium',  label: 'Premium' },
  { id: 'gold',     label: 'Gold' },
];

export const FORMULE_OPTS = [
  { id: 'urban_day',  label: '24 heures' },
  { id: 'urban_8h',   label: '8 heures' },
  { id: 'urban_3h',   label: '3 heures' },
  { id: 'intercity',  label: 'Interurbain' },
];

const CATEGORIES = [
  { label: 'Citadine',              match: ['Citadine'] },
  { label: 'Berline',               match: ['Berline'] },
  { label: 'SUV & 4x4',             match: ['SUV', 'Luxe'] },
  { label: 'Pick-up double cabine', match: ['Pickup'] },
  { label: 'Minibus / Van',         match: ['Van', 'Minibus'] },
];

const TRANSMISSIONS = ['Automatique', 'Manuelle'];
const ENERGIES      = ['Diesel', 'Essence', 'Hybride'];
const EQUIPEMENTS   = ['Climatisation tropicalisée', 'Bluetooth & Audio', 'Caméra de recul', 'GPS Navigation'];

export const PRICE_MIN = 20000;
export const PRICE_MAX = 150000;

/* Vrai si un véhicule correspond à l'option catégorie (labels → categories data) */
export const matchCategory = (v, label) =>
  (CATEGORIES.find(c => c.label === label)?.match || [label]).includes(v.category);

function FilterGroup({ title, children }) {
  return (
    <div className="border-t border-slate-100 pt-5 mt-5 first:border-0 first:pt-0 first:mt-0">
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{title}</h4>
      {children}
    </div>
  );
}

function CheckItem({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="flex items-center gap-2.5">
        <input type="checkbox" checked={checked} onChange={onChange}
          className="w-4 h-4 accent-teal-600 rounded cursor-pointer" />
        <span className={`text-sm ${checked ? 'font-semibold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
          {label}
        </span>
      </span>
      {count != null && <span className="text-[11px] text-slate-400 font-medium">{count}</span>}
    </label>
  );
}

/* Sidebar de filtres du catalogue public — onClose replie le panneau */
export default function FiltersSidebar({ vehicles, filters, setFilters, activeCount, onClose }) {
  const toggle = (key, value) => setFilters(f => ({
    ...f,
    [key]: f[key].includes(value) ? f[key].filter(x => x !== value) : [...f[key], value],
  }));

  const countBy = (fn) => vehicles.filter(fn).length;
  const brands = [...new Set(vehicles.map(vehicleBrand))].sort()
    .map(b => ({ name: b, n: countBy(v => vehicleBrand(v) === b) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 7);

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-fit lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          Filtres
          {activeCount > 0 && (
            <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeCount} actifs
            </span>
          )}
        </h3>
        {onClose && (
          <button onClick={onClose} aria-label="Fermer les filtres"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <label className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-xl p-3 cursor-pointer">
        <input type="checkbox" checked={filters.onlyAvailable}
          onChange={e => setFilters(f => ({ ...f, onlyAvailable: e.target.checked }))}
          className="w-4 h-4 mt-0.5 accent-teal-600 rounded" />
        <span className="text-xs text-teal-900 font-medium leading-snug">
          Seulement disponibles sur mes dates sélectionnées
        </span>
      </label>

      <FilterGroup title="Gamme AutoLink">
        {GAMMES.map(g => (
          <CheckItem key={g.id} label={g.label}
            count={countBy(v => v.tier === g.id)}
            checked={filters.gammes.includes(g.id)}
            onChange={() => toggle('gammes', g.id)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Formule">
        <div className="grid grid-cols-2 gap-2">
          {FORMULE_OPTS.map(o => (
            <button key={o.id} onClick={() => setFilters(f => ({ ...f, formule: f.formule === o.id ? '' : o.id }))}
              className={`py-2 px-2 rounded-lg text-xs font-bold transition-colors ${
                filters.formule === o.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Prix journalier">
        <input type="range" min={PRICE_MIN} max={PRICE_MAX} step={5000}
          value={filters.priceMax}
          onChange={e => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))}
          className="w-full accent-teal-600" />
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
          <span>{PRICE_MIN.toLocaleString('fr-FR')} FCFA</span>
          <span className="text-teal-700 font-black">
            {filters.priceMax >= PRICE_MAX ? `${PRICE_MAX.toLocaleString('fr-FR')}+` : filters.priceMax.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </FilterGroup>

      <FilterGroup title="Catégorie">
        {CATEGORIES.map(c => (
          <CheckItem key={c.label} label={c.label}
            count={countBy(v => matchCategory(v, c.label))}
            checked={filters.categories.includes(c.label)}
            onChange={() => toggle('categories', c.label)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Marque">
        {brands.map(b => (
          <CheckItem key={b.name} label={b.name} count={b.n}
            checked={filters.marques.includes(b.name)}
            onChange={() => toggle('marques', b.name)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Transmission & Énergie">
        {TRANSMISSIONS.map(t => (
          <CheckItem key={t} label={t}
            count={countBy(v => v.gear === t)}
            checked={filters.transmissions.includes(t)}
            onChange={() => toggle('transmissions', t)} />
        ))}
        {ENERGIES.map(t => (
          <CheckItem key={t} label={t}
            count={countBy(v => v.fuel === t)}
            checked={filters.energies.includes(t)}
            onChange={() => toggle('energies', t)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Équipements">
        {EQUIPEMENTS.map(e => (
          <CheckItem key={e} label={e}
            count={countBy(v => v.equipments.includes(e))}
            checked={filters.equipements.includes(e)}
            onChange={() => toggle('equipements', e)} />
        ))}
      </FilterGroup>

      <button onClick={() => setFilters(f => ({
          ...f,
          gammes: [], categories: [], marques: [], transmissions: [], energies: [], equipements: [],
          formule: 'urban_day', priceMax: PRICE_MAX, onlyAvailable: true,
        }))}
        className="mt-5 w-full flex items-center justify-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl py-2.5 transition-colors">
        <RotateCcw size={13} /> Réinitialiser tous les filtres
      </button>

      {/* <div className="mt-5 bg-slate-50 rounded-xl p-4">
        <div className="flex items-center gap-2 font-black text-slate-900 text-xs mb-1.5">
          <ShieldCheck size={15} className="text-teal-600" /> Garantie AutoLink
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Inspection unique en 50 points. Contrôle du véhicule avant chaque départ et
          caution sécurisée (Orange Money / MTN MoMo).
        </p>
      </div> */}
    </aside>
  );
}
