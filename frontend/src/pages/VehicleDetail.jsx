import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, MapPin, Star, Loader, Car } from 'lucide-react';
import { PublicNavbar, Footer } from '../components/landing';
import {
  VehicleGallery, VehicleSpecs, VehicleCertifications,
  RentalConditions, VehicleReviews, SimilarVehicles, BookingSidebar,
} from '../components/vehicle';
import { CATALOG_VEHICLES, getVehicleImage } from '../utils/carImages';
import { mediaUrl, vehicleCover } from '../utils/media';
import { normalizeVehicle } from '../utils/vehicleMeta';
import { vehiclesAPI } from '../services/api';

/* Mappe un véhicule API vers la fiche */
const mapApiVehicle = (v) => normalizeVehicle({
  id: v.id,
  name: `${v.brand} ${v.model} ${v.year}`,
  category: v.category,
  tier: v.tier || 'standard',
  image: vehicleCover(v) || v.image_url || getVehicleImage(v.category),
  gallery: (v.photos || []).map(p => mediaUrl(p.image)),
  price: Number(v.daily_rate || v.computed_rate) || 25000,
  kmIncluded: v.km_included_per_day || 200,
  kmRate: v.extra_km_rate || 150,
  deposit: Number(v.deposit_amount) || 0,
  city: v.city,
  rating: Number(v.rating) || 4.7,
  reviews: v.rating_count || 0,
  available: v.status === 'approved',
  plate: v.plate,
  seats: v.seats || 5,
  fuel: v.fuel || 'Essence',
  year: v.year,
  fromApi: true,
});

export default function VehicleDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const [vehicle, setVehicle] = useState(location.state?.vehicle || null);
  const [loading, setLoading] = useState(!location.state?.vehicle);

  useEffect(() => {
    setVehicle(location.state?.vehicle || null);
    // Véhicule du catalogue local passé en state → affichage immédiat
    const local = CATALOG_VEHICLES.find(v => String(v.id) === String(id));
    if (location.state?.vehicle) { setLoading(false); return; }
    if (params.get('src') === 'cat') {
      setVehicle(local ? normalizeVehicle(local) : null);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    vehiclesAPI.detail(id)
      .then(res => { if (mounted) { setVehicle(mapApiVehicle(res.data)); setLoading(false); } })
      .catch(() => {
        if (!mounted) return;
        setVehicle(local ? normalizeVehicle(local) : null);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="pt-28 lg:pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-5 flex-wrap">
            <Link to="/" className="hover:text-teal-600 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link to="/catalogue" className="hover:text-teal-600 transition-colors">Catalogue</Link>
            <ChevronRight size={12} />
            <span className="hover:text-teal-600 transition-colors">Véhicules disponibles</span>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-semibold">{vehicle?.name || '…'}</span>
          </nav>

          {loading ? (
            <div className="text-center py-32 text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader size={18} className="animate-spin" /> Chargement du véhicule…
            </div>
          ) : !vehicle ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Car size={28} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Véhicule introuvable</h3>
              <p className="text-slate-500 text-sm mb-5">Ce véhicule n'est plus dans notre catalogue.</p>
              <Link to="/catalogue" className="text-sm font-bold text-teal-600 hover:text-teal-700">
                ← Retour au catalogue
              </Link>
            </div>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900">{vehicle.name}</h1>
                <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md">
                  {vehicle.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-md ${
                  vehicle.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                }`}>
                  {vehicle.available ? 'Disponible' : 'Indisponible'}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={13} className="text-teal-600" /> {vehicle.city}, {vehicle.area}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <Star size={13} className="text-amber-400 fill-amber-400" /> {vehicle.rating} ({vehicle.reviews} avis)
                </span>
              </div>

              {/* Galerie */}
              <div className="mb-6">
                <VehicleGallery vehicle={vehicle} />
              </div>

              {/* Contenu + sidebar réservation */}
              <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
                <div className="space-y-5 min-w-0">
                  <VehicleSpecs vehicle={vehicle} />
                  <VehicleCertifications vehicle={vehicle} />
                  <RentalConditions vehicle={vehicle} />
                  <VehicleReviews vehicle={vehicle} />
                  <SimilarVehicles vehicle={vehicle} />
                </div>
                <BookingSidebar vehicle={vehicle} />
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
