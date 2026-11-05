import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { vehiclesAPI } from '../../services/api';
import { vehicleCover, mediaUrl } from '../../utils/media';
import { getVehicleImage } from '../../utils/carImages';
import { normalizeVehicle } from '../../utils/vehicleMeta';
import VehicleCard from './VehicleCard';

/* « Véhicules prêts à partir » — vraie flotte approuvée (max 4 cartes). */
export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehiclesAPI.getAll({ page_size: 4 })
      .then(res => {
        const list = (res.data.results || res.data || []).slice(0, 4);
        setVehicles(list.map(v => normalizeVehicle({
          id: v.id,
          name: `${v.brand} ${v.model} ${v.year}`,
          category: v.category,
          tier: v.tier || 'standard',
          image: vehicleCover(v) || v.image_url || getVehicleImage(v.category),
          gallery: (v.photos || []).map(p => mediaUrl(p.image)),
          price: Number(v.daily_rate || v.computed_rate) || 25000,
          city: v.city, rating: Number(v.rating) || 4.7, reviews: v.rating_count || 0,
          available: v.status === 'approved', seats: v.seats || 5,
          fuel: v.fuel || 'Essence', year: v.year, fromApi: true,
        })));
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="vehicules" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Véhicules prêts à partir
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Une sélection de véhicules inspectés et disponibles dès aujourd'hui
            à Douala et Yaoundé.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vehicles.map(v => <VehicleCard key={v.id} v={v} />)}
        </div>
        {!loading && !vehicles.length && (
          <p className="text-center text-slate-400 text-sm">Aucun véhicule disponible pour le moment.</p>
        )}

        <div className="text-center mt-10">
          <Link to="/Nos-vehicules"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md text-sm">
            Voir tout le catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
