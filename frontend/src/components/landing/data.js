import {
  Search, Car, CreditCard, Route, ShieldCheck, BadgeCheck,
  Wallet, Headphones, Timer, FileCheck, Award,
} from 'lucide-react';
import { CATALOG_VEHICLES } from '../../utils/carImages';
import { normalizeVehicle } from '../../utils/vehicleMeta';

/* ────────────────────────────────────────────────
   IMAGES — Unsplash (libres, haute résolution)
──────────────────────────────────────────────── */
export const IMG = {
  hero:         'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=90',
  standConfort: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=600&q=80',
  standBusiness:'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
  standPremium: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80',
  standLuxe:    'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
};

/* ────────────────────────────────────────────────
   DONNÉES DE LA LANDING
──────────────────────────────────────────────── */
export const NAV_LINKS = [
  { label: 'Accueil',             href: '#accueil' },
  { label: 'Catalogue',           href: '/catalogue' },
  { label: 'Comment ça marche',   href: '/comment-ca-marche' },
  { label: 'Tarifs',              href: '/tarifs' },
  // { label: 'Devenir propriétaire',href: '/devenir-proprietaire' },
  { label: 'Aide',                href: '/aide' },
];

export const STANDINGS = [
  { img: IMG.standConfort,  name: 'Confort',  price: '25 000', desc: 'Berlines et citadines fiables pour vos trajets quotidiens.' },
  { img: IMG.standBusiness, name: 'Business', price: '35 000', desc: 'Véhicules récents et élégants pour vos rendez-vous pro.' },
  { img: IMG.standPremium,  name: 'Premium',  price: '55 000', desc: 'SUV et berlines haut de gamme, confort supérieur.' },
  { img: IMG.standLuxe,     name: 'Luxe',     price: '75 000', desc: 'Véhicules d\'exception pour vos événements marquants.' },
];

// Sélection mise en avant sur l'accueil (ids issus de CATALOG_VEHICLES)
const FEATURED_IDS = [25, 31, 57, 69, 34, 76, 51, 30];
export const FLEET = FEATURED_IDS
  .map(id => CATALOG_VEHICLES.find(v => v.id === id))
  .filter(Boolean)
  .map(normalizeVehicle);

export const FORMULES = [
  {
    name: '3H Express', price: '15 000', unit: 'FCFA',
    desc: 'Courses rapides en ville',
    feats: ['3 heures de location', 'Chauffeur inclus', 'Carburant urbain inclus', 'Idéal rendez-vous & courses'],
  },
  {
    name: '8H Journée', price: '25 000', unit: 'FCFA', popular: true,
    desc: 'Une journée complète de liberté',
    feats: ['8 heures de location', 'Chauffeur inclus', 'Déplacements illimités en ville', 'Le plus demandé'],
  },
  {
    name: '24H+ Libre', price: '30 000', unit: 'FCFA',
    desc: 'Une à plusieurs journées',
    feats: ['Par jour de location', 'Urbain & interurbain', 'Kilométrage adapté', 'Tarif dégressif dès 3 jours'],
  },
  {
    name: 'Week-end', price: '50 000', unit: 'FCFA',
    desc: 'Du vendredi au dimanche',
    feats: ['2 à 3 jours inclus', 'Idéal escapades & événements', 'Assistance 24/7', 'Assurance tous risques'],
  },
];

export const ETAPES = [
  { icon: Search,     title: 'Recherchez', desc: 'Indiquez vos dates et votre trajet, comparez les véhicules vérifiés disponibles.' },
  { icon: Car,        title: 'Choisissez', desc: 'Sélectionnez le véhicule et la formule adaptés à votre besoin et votre budget.' },
  { icon: CreditCard, title: 'Payez',      desc: 'Réglez en toute sécurité via MTN Mobile Money ou Orange Money.' },
  { icon: Route,      title: 'Roulez',     desc: 'Votre chauffeur certifié vous prend en charge à l\'heure et au lieu convenus.' },
];

export const AVANTAGES = [
  { icon: ShieldCheck, title: 'Véhicules vérifiés',     desc: 'Chaque véhicule passe une inspection complète avant d\'entrer dans le catalogue.' },
  { icon: BadgeCheck,  title: 'Chauffeurs certifiés',   desc: 'Des chauffeurs professionnels, formés et évalués après chaque course.' },
  { icon: CreditCard,  title: 'Paiement 100% sécurisé', desc: 'Mobile Money, Orange Money ou carte — fonds conservés jusqu\'au trajet.' },
  { icon: Wallet,      title: 'Prix transparents',      desc: 'Tarifs affichés dès le départ, sans frais cachés ni mauvaise surprise.' },
  { icon: Headphones,  title: 'Assistance 24/7',        desc: 'Une équipe locale disponible jour et nuit pour vous accompagner.' },
  { icon: Timer,       title: 'Flexibilité totale',     desc: 'De 3 heures à plusieurs semaines, la formule s\'adapte à vous.' },
  { icon: FileCheck,   title: 'Assurance incluse',      desc: 'Toutes nos locations couvrent passagers et véhicule pendant le trajet.' },
  { icon: Award,       title: 'Qualité garantie',       desc: 'Note moyenne de 4,9/5 sur plus de 3 400 locations réussies.' },
];

export const TEMOIGNAGES = [
  {
    name: 'Marlyse N.', city: 'Douala', initials: 'MN',
    text: 'Réservation faite en 5 minutes pour un mariage à Bonapriso. Chauffeur ponctuel, voiture impeccable. Je recommande vivement.',
  },
  {
    name: 'Jean-Paul E.', city: 'Yaoundé', initials: 'JP',
    text: 'J\'utilise AutoLink Pro pour tous mes déplacements professionnels. Le paiement par Orange Money est un vrai plus, tout est simple.',
  },
  {
    name: 'Sandrine K.', city: 'Douala', initials: 'SK',
    text: 'Trajet Douala–Yaoundé parfait : véhicule confortable, chauffeur prudent et prix connu à l\'avance. Une première au Cameroun.',
  },
];

export const FAQS = [
  {
    q: 'Comment fonctionne la location avec chauffeur ?',
    a: 'Vous choisissez votre véhicule, vos dates et votre trajet. Un chauffeur certifié AutoLink Pro vous prend en charge à l\'heure convenue. Le carburant urbain et le chauffeur sont inclus dans le tarif affiché.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Nous acceptons MTN Mobile Money, Orange Money et les cartes bancaires. Le paiement est sécurisé et les fonds sont conservés par AutoLink Pro jusqu\'à la confirmation de votre trajet.',
  },
  {
    q: 'Puis-je louer un véhicule sans chauffeur ?',
    a: 'Oui, l\'autoconduite est disponible sur certains véhicules pour les locations de 3 jours et plus, moyennant un dépôt de garantie et une vérification d\'identité renforcée.',
  },
  {
    q: 'Que se passe-t-il en cas de retard ou d\'imprévu ?',
    a: 'La modification est gratuite jusqu\'à 15 minutes avant le départ. En cas de retard de votre part, les 30 premières minutes d\'attente sont offertes. Notre assistance reste joignable 24h/24.',
  },
  {
    q: 'Que couvre l\'assurance incluse ?',
    a: 'Toutes nos locations incluent une assurance responsabilité civile et passagers. Les locations longue durée bénéficient d\'une couverture tous risques.',
  },
  {
    q: 'Comment devenir partenaire AutoLink Pro ?',
    a: 'Propriétaire d\'un véhicule en bon état ? Inscrivez-vous comme partenaire, notre équipe contrôle votre véhicule puis le met en location. Vous êtes payé après chaque course.',
  },
];
