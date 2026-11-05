// Données de détail déterministes par véhicule (fiche publique /vehicule/:id)
// — galerie, specs complémentaires, avis, scores de certification.

const BASE = 'https://images.unsplash.com';

const EXTRA_SHOTS = [
  `${BASE}/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=700&q=80`,  // conduite
  `${BASE}/photo-1493238792000-8113da705763?auto=format&fit=crop&w=700&q=80`,  // volant
  `${BASE}/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=700&q=80`,  // intérieur
  `${BASE}/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=700&q=80`,     // vue arrière
  `${BASE}/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80`,  // extérieur
  `${BASE}/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=700&q=80`,     // détail
];

/* Galerie : photos réelles uploadées (wizard étape 3) si dispo,
   sinon photo principale du véhicule + 5 clichés génériques. */
export const galleryFor = (v) => {
  if (v.gallery?.length) return v.gallery;
  const shots = [...EXTRA_SHOTS.slice(v.id % EXTRA_SHOTS.length), ...EXTRA_SHOTS.slice(0, v.id % EXTRA_SHOTS.length)];
  return [v.image, ...shots.slice(0, 5)];
};

const COLORS = ['Gris métal', 'Noir', 'Blanc perle', 'Gris titane', 'Bleu nuit', 'Rouge', 'Argent'];

export const vehicleColor = (v) => COLORS[v.id % COLORS.length];

export const vehicleKm = (v) => 15000 + ((v.id * 3700) % 85000);

const EQUIP_EXTRA = {
  basic:      ['Régulateur de vitesse', 'Verrouillage central'],
  standard:   ['Régulateur de vitesse', 'Caméra de recul', 'Sièges enfants sur demande', 'USB / Recharge'],
  premium:    ['Sièges cuir', 'Toit ouvrant', 'Caméra 360°', 'Régulateur adaptatif', 'Démarrage sans clé'],
  gold:       ['Sièges cuir ventilés', 'Toit panoramique', 'Caméra 360°', 'Suspension adaptative', 'Démarrage sans clé', 'Audio premium'],
  collection: ['Sièges cuir ventilés', 'Toit panoramique', 'Caméra 360°', 'Suspension adaptative', 'Démarrage sans clé', 'Audio premium'],
};

export const vehicleEquipmentsFull = (v) => {
  const base = ['Climatisation automatique', 'Bluetooth & Audio'];
  return [...new Set([...base, ...(EQUIP_EXTRA[v.tier] || EQUIP_EXTRA.standard)])].slice(0, 8);
};

/* Scores de certification — dérivés du score qualité du véhicule */
export const certificationScores = (v) => {
  const s = v.score || 90;
  return {
    global: Math.min(99, s + 4),
    items: [
      { label: 'Contrôle technique',       value: Math.min(100, s + 2),  note: 'Visite à jour' },
      { label: 'Assurance & documents',    value: Math.min(100, s + 6),  note: 'Carte grise vérifiée' },
      { label: 'Entretien & historique',   value: Math.max(60, s - 8),   note: 'Carnet complet' },
      { label: 'Chauffeur / propriétaire', value: Math.min(100, s + 1),  note: 'Identité contrôlée' },
    ],
  };
};

const REVIEWERS = [
  { name: 'Jean-Marie F.', city: 'Douala',  text: 'Véhicule impeccable, climatisation au top et chauffeur très professionnel. Prise en charge à l\'heure à Bonanjo.' },
  { name: 'Aïcha B.',      city: 'Yaoundé', text: 'Réservation simple et rapide. Le véhicule correspondait exactement aux photos, je recommande.' },
  { name: 'Patrick N.',    city: 'Douala',  text: 'Utilisé pour un trajet Douala–Yaoundé : confortable et sécurisé. Le suivi par SMS est rassurant.' },
  { name: 'Vanessa M.',    city: 'Yaoundé', text: 'Très bonne expérience pour un mariage. Voiture propre, chauffeur discret et ponctuel.' },
];

/* 3 avis certifiés déterministes par véhicule */
export const vehicleReviews = (v) =>
  [0, 1, 2].map(i => {
    const r = REVIEWERS[(v.id + i) % REVIEWERS.length];
    return {
      ...r,
      initials: r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      stars: v.rating >= 4.7 ? 5 : (v.rating >= 4.4 ? 4 : 5),
      date: `${String(((v.id * 7 + i * 9) % 28) + 1).padStart(2, '0')}/10/2025`,
    };
  });
