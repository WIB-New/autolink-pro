import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { vehicleImage, vehicleName, vehicleRate } from '../../utils/vehicles';
import { formatNumber, uiText, vehicleLabel } from '../../i18n';

const t = (text, options) => uiText('pages.client.VehicleDetailClient', text, options);

const EQUIPMENT_ICONS = {
  'Climatisation': 'ac_unit',
  'Bluetooth': 'bluetooth',
  'GPS': 'navigation',
  'USB': 'usb',
  'Camera': 'camera_alt',
  'Régulateur': 'speed',
  'Sièges chauffants': 'hot_tub',
  'Toit ouvrant': 'wb_sunny',
};

// Données d'exemple pour le véhicule (Emmanuel Ndedi)
const MOCK_VEHICLE = {
  id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2016,
  category: 'Berline',
  tier: 'standard',
  seats: 5,
  fuel: 'Essence',
  gear: 'Automatique',
  mileage: 45000,
  city: 'Douala',
  area: 'Akwa',
  rating: 4.5,
  rating_count: 8,
  status: 'approved',
  daily_rate: 20000,
  deposit_amount: 50000,
  description: 'Toyota Corolla 2016 en excellent état, très bien entretenue. Parfait pour vos déplacements en ville et trajets interurbains. Climatisation fonctionnelle, consommation économique et confort optimal.',
  equipments: ['Climatisation', 'Bluetooth', 'USB', 'Régulateur de vitesse'],
  image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
};

export default function VehicleDetailClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Utiliser les données d'exemple au lieu de l'API
    setTimeout(() => {
      setVehicle(MOCK_VEHICLE);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title={t('Chargement...')}>
        <div className="text-center py-20">
          <Icon name="hourglass_top" size={48} className="text-outline animate-spin" />
          <p className="mt-4 text-on-surface-variant">{t('Chargement du véhicule...')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title={t('Erreur')}>
        <div className="text-center py-20">
          <Icon name="error" size={48} className="text-error" />
          <p className="mt-4 text-on-surface-variant">{t('Véhicule introuvable')}</p>
          <Link to="/client/search" className="btn-primary mt-6 inline-block">{t('Retour au catalogue')}</Link>
        </div>
      </DashboardLayout>
    );
  }

  const available = vehicle.status === 'approved';
  const features = [
    { icon: 'airline_seat_recline_normal', label: t('Places'), value: vehicle.seats || 5 },
    { icon: 'local_gas_station', label: t('Carburant'), value: vehicle.fuel || 'Essence' },
    { icon: 'ac_unit', label: t('Climatisation'), value: 'Oui' },
    { icon: 'calendar_today', label: t('Année'), value: vehicle.year },
    { icon: 'speed', label: t('Boîte'), value: vehicle.gear || 'Automatique' },
    { icon: 'straighten', label: t('Kilométrage'), value: `${formatNumber(vehicle.mileage || 0)} km` },
  ];

  return (
    <DashboardLayout title={vehicleName(vehicle)}>
      <div className="flex flex-col gap-6">
        {/* Bouton retour */}
        <button onClick={() => navigate(-1)} className="w-fit flex items-center gap-2 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface">
          <Icon name="arrow_back" />{t('Retour')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-surface-container min-h-[300px]">
            <img src={vehicleImage(vehicle)} alt={vehicleName(vehicle)} className="w-full h-full object-cover" />
            {!available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-error text-on-error px-4 py-2 rounded-lg font-bold">{t('Indisponible')}</span>
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface dark:text-white">{vehicleName(vehicle)}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <Icon name="location_on" size={16} />{vehicle.city}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Icon name="star" size={16} fill />{Number(vehicle.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900">
              <div className="font-headline-xl text-headline-xl text-primary">{formatNumber(vehicleRate(vehicle))} <span className="font-label-lg text-label-lg">FCFA / jour</span></div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t('Caution : {{amount}} FCFA', { amount: formatNumber(vehicle.deposit_amount || 0) })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low dark:bg-slate-900">
                  <Icon name={feature.icon} className="text-primary" size={20} />
                  <div>
                    <div className="text-[11px] text-on-surface-variant">{feature.label}</div>
                    <div className="font-label-md text-label-md text-on-surface dark:text-white">{feature.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col gap-3 mt-auto">
              <button
                onClick={() => navigate(`/client/booking/recap?vehicle=${vehicle.id}`)}
                disabled={!available}
                className="btn-primary py-3"
              >
                <Icon name="directions_car" size={20} />{t('Réserver ce véhicule')}
              </button>
              <Link to="/client/search" className="btn-secondary py-3 text-center">
                <Icon name="list" size={20} />{t('Retour au catalogue')}
              </Link>
              <Link to={`/client/favorites`} className="btn-secondary py-3 text-center">
                <Icon name="favorite" size={20} />{t('Voir mes favoris')}
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-3">{t('Description')}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {vehicle.description || t('Aucune description disponible pour ce véhicule.')}
          </p>
        </div>

        {/* Équipements */}
        {vehicle.equipments && vehicle.equipments.length > 0 && (
          <div className="card">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-3">{t('Équipements')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicle.equipments.map((eq) => (
                <div key={eq} className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low dark:bg-slate-900">
                  <Icon name={EQUIPMENT_ICONS[eq] || 'check_circle'} className="text-primary" size={18} />
                  <span className="font-body-sm text-body-sm text-on-surface dark:text-white">{eq}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        <div className="card">
          <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-3">{t('Conditions de location')}</h3>
          <ul className="space-y-2 font-body-md text-body-md text-on-surface-variant">
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="text-primary shrink-0 mt-0.5" size={18} />
              <span>{t('Annulation gratuite jusqu\'à 24h avant le départ')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="text-primary shrink-0 mt-0.5" size={18} />
              <span>{t('Caution bloquée et restituée après retour conforme')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="text-primary shrink-0 mt-0.5" size={18} />
              <span>{t('200 km inclus par jour, supplément 100 FCFA/km')}</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="text-primary shrink-0 mt-0.5" size={18} />
              <span>{t('Véhicule livré avec le plein, à restituer au même niveau')}</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
