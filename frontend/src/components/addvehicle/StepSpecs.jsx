import React from 'react';
import { Settings2, CheckCircle2 } from 'lucide-react';

const FUEL_TYPES = [
  { value: 'essence', label: 'Essence' }, { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybride' }, { value: 'electric', label: 'Électrique' },
];
const GEARS = ['Automatique', 'Manuelle'];

export const CONDITION_ITEMS = [
  'Carrosserie sans rayures', 'Vitres intactes', 'Intérieur propre', 'Climatisation fonctionnelle',
  'Freins vérifiés', 'Pneus en bon état', 'Feux tous fonctionnels', 'GPS / Radio fonctionnel',
];

const F = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
    {children}
  </div>
);
const input = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';

/* Étape 2 — Caractéristiques techniques + mode de gestion + état. */
export default function StepSpecs({ form, set }) {
  const toggleCondition = item => set('conditionChecks',
    form.conditionChecks.includes(item) ? form.conditionChecks.filter(c => c !== item) : [...form.conditionChecks, item]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center"><Settings2 size={16} className="text-teal-600" /></span>
          <div>
            <h2 className="font-black text-slate-900">Étape 2 : Caractéristiques du véhicule</h2>
            <p className="text-[10px] text-slate-400">Fiche technique affichée aux locataires.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Carburant">
            <select className={input} value={form.fuel} onChange={e => set('fuel', e.target.value)}>
              <option value="">Choisir…</option>
              {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </F>
          <F label="Boîte de vitesses">
            <select className={input} value={form.gear || ''} onChange={e => set('gear', e.target.value)}>
              <option value="">Choisir…</option>
              {GEARS.map(g => <option key={g}>{g}</option>)}
            </select>
          </F>
          <F label="Nombre de places"><input type="number" className={input} placeholder="5" min={2} max={20} value={form.seats} onChange={e => set('seats', e.target.value)} /></F>
          <F label="Couleur"><input className={input} placeholder="Blanc, Gris…" value={form.color} onChange={e => set('color', e.target.value)} /></F>
          <F label="Kilométrage compteur (km)"><input type="number" className={input} placeholder="45000" min={0} value={form.mileage} onChange={e => set('mileage', e.target.value)} /></F>
          <F label="Valeur marchande estimée (FCFA)"><input type="number" className={input} placeholder="12000000" min={0} value={form.marketValue} onChange={e => set('marketValue', e.target.value)} /></F>
        </div>
      </div>

      {/* Mode de gestion */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-sm mb-4">Mode de gestion du véhicule</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          {[
            { value: 'platform', title: 'Confier à AutoLink', desc: 'Vous nous confiez le véhicule. Nous le gérons et le mettons à disposition 24h/24. Revenus stables garantis.' },
            { value: 'home', title: 'Garder chez moi (à la demande)', desc: 'Le véhicule reste chez vous. Vous le mettez à disposition quand vous le confirmez.' },
          ].map(m => (
            <button key={m.value} type="button" onClick={() => set('mode', m.value)}
              className={`text-left border-2 rounded-2xl p-5 transition-all ${form.mode === m.value ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300'}`}>
              <div className="font-black text-slate-900 text-sm mb-1">{m.title}</div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
        <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.driverAvailable ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200'}`}>
          <input type="checkbox" className="w-4 h-4 accent-teal-600" checked={form.driverAvailable} onChange={e => set('driverAvailable', e.target.checked)} />
          <div>
            <div className="font-bold text-xs text-slate-900">Je peux fournir mon propre chauffeur</div>
            <div className="text-[10px] text-slate-500">Si un client demande « chauffeur du propriétaire », vous devrez vous présenter avec votre chauffeur.</div>
          </div>
        </label>
      </div>

      {/* État */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-sm mb-4">État du véhicule (cochez tout ce qui s'applique)</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {CONDITION_ITEMS.map(item => (
            <label key={item} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-xs font-semibold ${form.conditionChecks.includes(item) ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <input type="checkbox" className="sr-only" checked={form.conditionChecks.includes(item)} onChange={() => toggleCondition(item)} />
              <CheckCircle2 size={14} className={form.conditionChecks.includes(item) ? 'text-teal-600' : 'text-slate-300'} />
              {item}
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(form.conditionChecks.length / CONDITION_ITEMS.length) * 100}%` }} />
          </div>
          <span className="text-sm font-black text-teal-600">{Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100)}/100</span>
        </div>
      </div>
    </div>
  );
}
