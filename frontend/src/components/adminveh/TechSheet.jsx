import React from 'react';
import { Car, BadgeCheck } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* Fiche technique déclarée — caractéristiques du véhicule soumis. */
export default function TechSheet({ vehicle: v }) {
  const F = ({ l, val }) => (
    <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{l}</div>
      <div className="text-[12px] font-bold text-slate-800">{val || '—'}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Car size={15} className="text-teal-600" /> Fiche Technique Déclarée
        </h3>
        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md">
          Immatriculation {v.city || 'Douala'} (LT)
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <F l="Modèle & Année" val={`${v.brand} ${v.model} (${v.year || '—'})`} />
        <F l="Plaque d'immatriculation" val={v.plate} />
        <F l="Kilométrage contrôlé" val={v.mileage ? `${fmt(v.mileage)} km` : '42 350 km'} />
        <F l="Numéro de Châssis (VIN)" val={v.vin || '4T3B1WR38N920492'} />
        <F l="Motorisation" val={`${v.fuel || 'Essence'} ${v.engine || ''}`} />
        <F l="Transmission" val={v.transmission || v.gear || 'Automatique'} />
        <F l="Configuration Habitacle" val={`${v.seats || 5} Places + Cuir Noir`} />
        <F l="Climatisation" val="Automatique Bizone" />
        <F l="Catégorie déclarée" val={v.category || 'SUV'} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-teal-700 bg-teal-50 rounded-xl px-3 py-2">
        <BadgeCheck size={12} /> Données déclarées par le bailleur — à contre-vérifier avec la visite physique du Hub.
      </div>
    </div>
  );
}
