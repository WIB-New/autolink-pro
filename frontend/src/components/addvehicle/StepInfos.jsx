import React from 'react';
import { Car, Info } from 'lucide-react';

const CATEGORIES = ['Berline', 'SUV', 'Van', 'Minibus', 'Pick-up', 'Citadine'];
const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Buéa', 'Limbé', 'Kribi', 'Garoua', 'Ngaoundéré', 'Maroua'];

const F = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">{label}</label>
    {children}
  </div>
);
const input = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';

/* Étape 1 — Infos générales du véhicule. */
export default function StepInfos({ form, set }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center"><Car size={16} className="text-teal-600" /></span>
        <div>
          <h2 className="font-black text-slate-900">Étape 1 : Informations générales</h2>
          <p className="text-[10px] text-slate-400">Identité du véhicule telle qu'affichée sur la fiche publique.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <F label="Marque"><input className={input} placeholder="Toyota, Hyundai…" value={form.brand} onChange={e => set('brand', e.target.value)} /></F>
        <F label="Modèle"><input className={input} placeholder="Corolla, Tucson…" value={form.model} onChange={e => set('model', e.target.value)} /></F>
        <F label="Année de mise en circulation"><input type="number" className={input} placeholder="2022" min={2010} max={2026} value={form.year} onChange={e => set('year', e.target.value)} /></F>
        <F label="Immatriculation"><input className={input} placeholder="LT 1234 A" value={form.plate} onChange={e => set('plate', e.target.value)} /></F>
        <F label="Catégorie">
          <select className={input} value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Choisir…</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </F>
        <F label="Ville de mise à disposition">
          <select className={input} value={form.city} onChange={e => set('city', e.target.value)}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </F>
      </div>
      <F label="Description de l'annonce (optionnel)">
        <textarea className={`${input} resize-none`} rows={3} placeholder="Équipements supplémentaires, particularités…" value={form.description} onChange={e => set('description', e.target.value)} />
      </F>
      <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5 flex gap-2.5 text-[10px] text-teal-800">
        <Info size={13} className="shrink-0 mt-0.5" />
        Le tarif de référence est adapté au marché local (Douala = référence). La gamme (Économique → Super Luxe)
        sera attribuée objectivement par AutoLink selon la marque, l'année, le kilométrage et l'état.
      </div>
    </div>
  );
}
