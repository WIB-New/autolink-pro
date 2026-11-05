// Métadonnées dérivées des véhicules (CATALOG_VEHICLES / API)
// — utilisées par la landing, le catalogue public et les filtres.

export const vehicleBrand = (v) => (v.name || '').split(' ')[0];

export const vehicleGear = (v) =>
  v.gear || (['Pickup', 'Van', 'Minibus'].includes(v.category) ? 'Manuelle' : 'Automatique');

const EQUIP_BY_TIER = {
  basic:      ['Climatisation tropicalisée'],
  standard:   ['Climatisation tropicalisée', 'Bluetooth & Audio', 'Caméra de recul'],
  premium:    ['Climatisation tropicalisée', 'Bluetooth & Audio', 'Caméra de recul', 'GPS Navigation'],
  gold:       ['Climatisation tropicalisée', 'Bluetooth & Audio', 'Caméra de recul', 'GPS Navigation'],
  collection: ['Climatisation tropicalisée', 'Bluetooth & Audio', 'Caméra de recul', 'GPS Navigation'],
};

export const vehicleEquipments = (v) => EQUIP_BY_TIER[v.tier] || EQUIP_BY_TIER.standard;

const QUARTIERS = {
  'Douala':  ['Akwa', 'Bonanjo', 'Deïdo', 'Bonapriso', 'Bali'],
  'Yaoundé': ['Bastos', 'Centre-ville', 'Nlongkak', 'Mvan', 'Essos'],
};

export const vehicleCity = (v) => v.city || (v.id % 2 ? 'Douala' : 'Yaoundé');

export const vehicleArea = (v) => {
  const city = vehicleCity(v);
  const qs = QUARTIERS[city];
  if (!qs || !qs.length) return city; // ville hors table → on affiche la ville elle-même
  return qs[v.id % qs.length];
};

export const vehicleInspection = (v) => `Inspecté le ${String((v.id % 28) + 1).padStart(2, '0')}/10`;

// Forme normalisée utilisée par les cartes publiques et la modale de réservation
export const normalizeVehicle = (v) => ({
  ...v,
  brand:      vehicleBrand(v),
  gear:       vehicleGear(v),
  equipments: vehicleEquipments(v),
  city:       vehicleCity(v),
  area:       vehicleArea(v),
  inspected:  vehicleInspection(v),
});
