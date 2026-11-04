import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { CATALOG_VEHICLES } from '../../utils/carImages';
import { normalizeVehicle } from '../../utils/vehicleMeta';

/* « Véhicules similaires recommandés » — même catégorie, autres modèles */
export default function SimilarVehicles({ vehicle }) {
  const similar = CATALOG_VEHICLES
    .filter(v => v.id !== vehicle.id && (v.category === vehicle.category || v.tier === vehicle.tier))
    .sort((a, b) => Math.abs(a.price - vehicle.price) - Math.abs(b.price - vehicle.price))
    .slice(0, 3)
    .map(normalizeVehicle);

  if (!similar.length) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900">Véhicules similaires recommandés</h2>
        <Link to="/Nos-vehicules" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5">
          Voir tout le catalogue <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {similar.map(s => (
          <Link key={s.id} to={`/vehicule/${s.id}?src=cat`}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            <div className="h-40 overflow-hidden bg-slate-100">
              <img src={s.image} alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">{s.city}, {s.area}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Star size={11} className="text-amber-400 fill-amber-400" />{s.rating}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-2">{s.name}</h4>
              <div className="font-black text-teal-700 text-sm">
                {s.price.toLocaleString('fr-FR')} <span className="text-xs text-slate-400 font-medium">FCFA/jour</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
