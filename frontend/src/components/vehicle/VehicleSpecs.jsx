import React from 'react';
import { Users, Cog, Fuel, Calendar, Palette, Gauge, Check } from 'lucide-react';
import { vehicleColor, vehicleKm, vehicleEquipmentsFull } from '../../utils/vehicleDetails';

/* Caractéristiques techniques + description + équipements */
export default function VehicleSpecs({ vehicle: v }) {
  const specs = [
    { icon: Users,    label: 'Places',      value: `${v.seats} passagers` },
    { icon: Cog,      label: 'Boîte',       value: v.gear },
    { icon: Fuel,     label: 'Carburant',   value: v.fuel },
    { icon: Calendar, label: 'Année',       value: v.year },
    { icon: Palette,  label: 'Couleur',     value: vehicleColor(v) },
    { icon: Gauge,    label: 'Kilométrage', value: `${vehicleKm(v).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} km` },
  ];

  return (
    <>
      {/* Caractéristiques techniques */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5 flex items-center gap-2">
          <Cog size={18} className="text-teal-600" /> Caractéristiques techniques
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {specs.map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3.5 text-center">
              <s.icon size={18} className="text-teal-600 mx-auto mb-2" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-3">Description et recommandations</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {v.name} entretenu avec soin, inspecté par nos experts terrain et prêt pour vos
          déplacements urbains ou interurbains. Véhicule de la gamme {v.tier} AutoLink :
          intérieur impeccable, mécanique vérifiée et documents en règle.
          Idéal pour les trajets professionnels, les événements ou les longues distances
          au départ de {v.city}.
        </p>
      </section>

      {/* Équipements */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5 flex items-center gap-2">
          <Check size={18} className="text-teal-600" /> Équipements et commodités inclus
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {vehicleEquipmentsFull(v).map(e => (
            <div key={e} className="flex items-center gap-2.5 text-sm text-slate-600">
              <span className="w-5 h-5 bg-teal-50 rounded-md flex items-center justify-center shrink-0">
                <Check size={12} className="text-teal-600" />
              </span>
              {e}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
