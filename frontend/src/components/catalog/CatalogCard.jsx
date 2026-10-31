import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Users, Cog, Fuel, UserCheck, ArrowRight, CalendarX } from 'lucide-react';
import useReserve from '../../hooks/useReserve';
import { useAuth } from '../../contexts/AuthContext';

const TIER_STYLE = {
  basic:      { label: 'Basic',    cls: 'bg-slate-700' },
  standard:   { label: 'Standard', cls: 'bg-teal-600' },
  premium:    { label: 'Premium',  cls: 'bg-indigo-600' },
  gold:       { label: 'Gold',     cls: 'bg-amber-500' },
  collection: { label: 'Gold+',    cls: 'bg-rose-600' },
};

/* Carte véhicule du catalogue public (maquette 2).
   Réserver → flux de réservation (compte requis si non connecté). */
export default function CatalogCard({ v, formuleLabel = '24h', wide = false }) {
  const reserve = useReserve();
  const { isAuthenticated } = useAuth();
  const tier = TIER_STYLE[v.tier] || TIER_STYLE.standard;
  const detailUrl = isAuthenticated ? `/client/vehicle/${v.id}` : `/vehicule/${v.id}${v.fromApi ? '' : '?src=cat'}`;
  const reserveUrl = isAuthenticated ? `/client/booking?vehicle=${v.id}` : '/login';

  return (
    <div className={`group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${v.available ? 'hover:shadow-xl hover:-translate-y-0.5' : ''}`}>
      {/* Image + badges */}
      <div className={`relative overflow-hidden bg-slate-100 ${wide ? 'h-56' : 'h-44'}`}>
        <Link to={detailUrl} state={{ vehicle: v }} className="block w-full h-full">
          <img src={v.image} alt={v.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${v.available ? 'group-hover:scale-105' : 'grayscale'}`}
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.parentElement.style.background = '#134e4a'; }} />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {v.available ? (
            <>
              <span className={`${tier.cls} text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm`}>
                {tier.label}
              </span>
              {/* <span className="bg-white/95 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <UserCheck size={10} className="text-teal-600" /> {v.inspected}
              </span> */}
            </>
          ) : (
            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md shadow-sm">
              Indisponible à ces dates
            </span>
          )}
        </div>
        <button aria-label="Ajouter aux favoris"
          className="absolute top-3 right-3 w-8 h-8 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors">
          <Heart size={15} className="text-slate-500" />
        </button>
        {/* <span className="absolute bottom-3 left-3 bg-black/55 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
          Formule {formuleLabel}
        </span> */}
      </div>

      {/* Corps */}
      <div className={wide ? 'p-6' : 'p-5'}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-slate-400 font-medium ${wide ? 'text-xs' : 'text-[11px]'}`}>{v.city}, {v.area}</span>
          <span className={`flex items-center gap-1 font-bold text-slate-700 ${wide ? 'text-xs' : 'text-[11px]'}`}>
            <Star size={11} className="text-amber-400 fill-amber-400" />
            {v.rating} <span className="text-slate-400 font-medium">({v.reviews})</span>
          </span>
        </div>
        <Link to={detailUrl} state={{ vehicle: v }}
          className={`block font-black text-slate-900 mb-3 hover:text-teal-700 transition-colors leading-snug ${wide ? 'text-lg' : 'text-base'}`}>
          {v.name}
        </Link>
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 mb-5 ${wide ? 'text-xs' : 'text-[11px]'}`}>
          <span className="flex items-center gap-1.5"><Users size={wide ? 14 : 12} /> {v.seats} pl</span>
          <span className="flex items-center gap-1.5"><Cog size={wide ? 14 : 12} /> {v.gear}</span>
          <span className="flex items-center gap-1.5"><Fuel size={wide ? 14 : 12} /> {v.fuel}</span>
          <span className="flex items-center gap-1.5"><UserCheck size={wide ? 14 : 12} /> Chauffeur</span>
        </div>

        {v.available ? (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 whitespace-nowrap">Total pour {formuleLabel}</div>
              <div className={`font-black text-slate-900 ${wide ? 'text-xl' : 'text-lg'}`}>
                {v.price.toLocaleString('fr-FR')} <span className="text-xs font-bold text-teal-600">FCFA</span>
              </div>
            </div>
            <button onClick={() => reserve(v)}
              className={`flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap ${wide ? 'text-xs px-4 py-2.5' : 'text-[11px] px-3 py-2'}`}>
              Réserver <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold mb-3">
              <CalendarX size={12} /> Réservé jusqu'au 30 Oct
            </div>
            <button disabled
              className="w-full border-2 border-slate-200 text-slate-400 text-xs font-bold py-2.5 rounded-lg cursor-not-allowed">
              Voir disponibilités
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
