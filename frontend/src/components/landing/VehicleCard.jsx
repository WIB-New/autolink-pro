import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Cog, Star } from 'lucide-react';
import useReserve from '../../hooks/useReserve';

/* Carte véhicule compacte (landing) — image/titre → fiche /vehicule/:id,
   bouton Réserver → flux de réservation (compte requis si non connecté). */
export default function VehicleCard({ v }) {
  const reserve = useReserve();
  const detailUrl = `/vehicule/${v.id}${v.fromApi ? '' : '?src=cat'}`;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={detailUrl} state={{ vehicle: v }} className="block relative h-44 overflow-hidden bg-slate-100">
        <img src={v.image} alt={v.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
        <span className="absolute top-3 left-3 bg-white/95 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {v.category}
        </span>
        <span className="absolute top-3 right-3 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full" /> Disponible
        </span>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Link to={detailUrl} state={{ vehicle: v }}
            className="font-black text-slate-900 text-sm hover:text-teal-700 transition-colors">{v.name}</Link>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <Star size={12} className="text-amber-400 fill-amber-400" /> {v.rating}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Users size={13} /> {v.seats} places</span>
          <span className="flex items-center gap-1"><Cog size={13} /> {v.gear}</span>
          <span className="flex items-center gap-1"><Fuel size={13} /> {v.fuel}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <span className="font-black text-teal-700 text-sm">{v.price.toLocaleString('fr-FR')} FCFA</span>
            <span className="text-slate-400 text-xs">/jour</span>
          </div>
          <button onClick={() => reserve(v)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
