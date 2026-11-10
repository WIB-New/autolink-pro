import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { vehiclesAPI } from '../../services/api';
import { vehicleCover, mediaUrl } from '../../utils/media';
import { getVehicleImage } from '../../utils/carImages';
import { normalizeVehicle } from '../../utils/vehicleMeta';

const mapApi = (v) => normalizeVehicle({
  id: v.id,
  name: `${v.brand} ${v.model} ${v.year}`,
  category: v.category,
  tier: v.tier || 'standard',
  image: vehicleCover(v) || v.image_url || getVehicleImage(v.category),
  gallery: (v.photos || []).map(p => mediaUrl(p.image)),
  price: Number(v.daily_rate || v.computed_rate) || 25000,
  city: v.city,
  rating: Number(v.rating) || 4.7,
  reviews: v.rating_count || 0,
  available: v.status === 'approved',
  seats: v.seats || 5,
  fuel: v.fuel || 'Essence',
  year: v.year,
  fromApi: true,
});

/* « Véhicules similaires recommandés » — 100 % BDD : uniquement les véhicules
   approuvés (disponibles) via GET /vehicles/{id}/similar/. Aucun fallback statique. */
export default function SimilarVehicles({ vehicle }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!vehicle.fromApi || !vehicle.id) { setSimilar([]); return undefined; }
    vehiclesAPI.similar(vehicle.id)
      .then(res => {
        if (!mounted) return;
        const list = (res.data.results || res.data || [])
          .filter(v => v.status === 'approved')
          .slice(0, 3)
          .map(mapApi);
        setSimilar(list);
      })
      .catch(() => { if (mounted) setSimilar([]); });
    return () => { mounted = false; };
  }, [vehicle]);

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
          <Link key={s.id} to={`/vehicule/${s.id}`}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden">
            <div className="h-40 overflow-hidden bg-slate-100">
              <img src={s.image} alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-400">{s.city}{s.area ? `, ${s.area}` : ''}</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Star size={11} className="text-amber-400 fill-amber-400" />{s.rating}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-2">{s.name}</h4>
              <div className="font-black text-teal-700 text-sm">
                {s.price.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} <span className="text-xs text-slate-400 font-medium">FCFA/jour</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
