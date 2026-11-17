import { SPECIFIC_CARS, getVehicleImage } from './carImages';
import { mediaUrl, vehicleCover } from './media';

const MODEL_IMAGES = [
  ['corolla', 'corolla'], ['tucson', 'tucson'], ['serie', 'bmw5'], ['série', 'bmw5'], ['gle', 'mercedesGLE'],
  ['sportage', 'sportage'], ['evoque', 'rangeRover'], ['sprinter', 'sprinter'], ['hiace', 'hiace'],
];

/** Image principale d'un véhicule API : photo uploadée (même logique de cover
   que la fiche détail), image_url du modèle, puis illustration par
   modèle/catégorie en dernier recours. */
export function vehicleImage(vehicle) {
  if (!vehicle) return getVehicleImage();
  const cover = vehicleCover(vehicle);
  if (cover) return cover;
  if (vehicle.image_url) return vehicle.image_url;
  const photo = vehicle.photos?.find((item) => item.kind === 'image')?.image;
  if (photo) return mediaUrl(photo);
  const model = (vehicle.model || '').toLowerCase();
  const match = MODEL_IMAGES.find(([key]) => model.includes(key));
  return match ? SPECIFIC_CARS[match[1]] : getVehicleImage(vehicle.category);
}

export const vehicleName = (vehicle) => [vehicle?.brand, vehicle?.model, vehicle?.year].filter(Boolean).join(' ');

export const vehicleRate = (vehicle) => Number(vehicle?.daily_rate || vehicle?.computed_rate || 0);

/** Chemin de réservation : le tunnel de réservation vit dans l'espace client. */
export function reservePath(vehicleId, user, extra = '') {
  const target = `/client/search?vehicle=${vehicleId}${extra}`;
  if (!user) return `/login?next=${encodeURIComponent(target)}`;
  return user.role === 'CLIENT' ? target : null;
}

export const TIER_BADGES = {
  basic: 'bg-surface-container-highest text-on-surface-variant',
  standard: 'bg-primary-fixed text-on-primary-fixed-variant',
  premium: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  gold: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  collection: 'bg-purple-100 text-purple-800',
};
