import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { formatNumber, uiText, vehicleLabel } from '../i18n';
import { TIER_BADGES, vehicleImage, vehicleName, vehicleRate } from '../utils/vehicles';
import { getVehicleImage } from '../utils/carImages';

const t = (text, options) => uiText('components.VehicleCard', text, options);

/** Carte véhicule du design system (catalogue, accueil, favoris, suggestions). */
export default function VehicleCard({ vehicle, onReserve, favorite, onToggleFavorite, compact = false, unavailable = false }) {
  const navigate = useNavigate();
  const name = vehicleName(vehicle);
  const rating = Number(vehicle.rating || 0);
  const score = Number(vehicle.condition_score || 0);
  const blocked = unavailable || !['approved', undefined].includes(vehicle.status);
  return (
    <article className={`group rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-sm border border-outline-variant/30 dark:border-slate-700 overflow-hidden flex flex-col transition-all hover:shadow-elevation-2 ${blocked ? 'opacity-70' : ''}`}>
      <Link to={`/vehicule/${vehicle.id}`} className={`relative block ${compact ? 'h-40' : 'h-48'} overflow-hidden bg-surface-container`}>
        <img src={vehicleImage(vehicle)} alt={name} loading="lazy"
          onError={(e) => { e.currentTarget.src = getVehicleImage(vehicle.category); }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${blocked ? 'grayscale' : ''}`} />
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1">
          <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[vehicle.tier] || TIER_BADGES.standard}`}>{vehicleLabel(vehicle.tier_label || vehicle.tier, 'tier')}</span>
          {score > 0 && <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-lowest/90 text-primary font-label-sm text-label-sm"><Icon name="verified" size={14} />{t('Inspecté {{score}}/10', { score: (score / 10).toFixed(1) })}</span>}
        </span>
        {blocked && <span className="absolute top-3 left-3 mt-12 px-2 py-1 rounded bg-error text-on-error font-label-sm text-label-sm">{t('Indisponible')}</span>}
        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-surface-container-lowest/95 font-label-md text-label-md text-on-surface">
          {formatNumber(vehicleRate(vehicle))} <span className="text-[10px]">FCFA/j</span>
        </span>
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2 font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
          <span className="flex items-center gap-1 truncate"><Icon name="location_on" size={16} />{vehicle.city || 'Douala'}</span>
          <span className="flex items-center gap-1 shrink-0">
            <Icon name="star" size={16} fill className="text-tertiary-container" />
            {rating ? formatNumber(rating, { maximumFractionDigits: 1 }) : t('Nouveau')}{vehicle.rating_count ? ` (${vehicle.rating_count})` : ''}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <Link to={`/vehicule/${vehicle.id}`} className="font-headline-sm text-headline-sm text-on-surface dark:text-white hover:text-primary">{name}</Link>
          {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(vehicle.id)} aria-label={t('Ajouter aux favoris')}
              className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${favorite ? 'bg-error-container text-error' : 'bg-surface-container-low text-on-surface-variant hover:text-error'}`}>
              <Icon name="favorite" size={20} fill={favorite} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
          <span className="flex items-center gap-1"><Icon name="airline_seat_recline_normal" size={16} />{t('{{n}} pl.', { n: vehicle.seats || '—' })}</span>
          <span className="flex items-center gap-1"><Icon name="local_gas_station" size={16} />{vehicleLabel(vehicle.fuel, 'fuel')}</span>
          <span className="flex items-center gap-1"><Icon name="category" size={16} />{vehicleLabel(vehicle.category, 'category')}</span>
          {vehicle.driver_available && <span className="flex items-center gap-1 text-primary"><Icon name="person" size={16} />{t('Chauffeur')}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Total pour 24h')}</div>
            <div className="font-headline-md text-headline-md text-primary">{formatNumber(vehicleRate(vehicle))} <span className="font-label-sm text-label-sm">FCFA</span></div>
          </div>
          {blocked
            ? <Link to={`/vehicule/${vehicle.id}`} className="btn-secondary py-2 px-3"><Icon name="event" size={18} />{t('Voir disponibilités')}</Link>
            : <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onReserve ? onReserve(vehicle) : navigate(`/client/booking/recap?vehicle=${vehicle.id}`); }} className="btn-primary py-2 px-4">{t('Réserver')}<Icon name="arrow_forward" size={18} /></button>}
        </div>
      </div>
    </article>
  );
}
