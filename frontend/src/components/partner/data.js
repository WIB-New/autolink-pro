import {
  Wallet, ShieldCheck, LayoutDashboard, ClipboardCheck,
  PenLine, SearchCheck, Globe, Banknote,
} from 'lucide-react';

/* ── Pourquoi confier son véhicule ───────────────────── */
export const BENEFITS = [
  { icon: Wallet,           title: 'Revenu jusqu\'à 900 000 FCFA/mois', desc: 'Un véhicule Premium bien placé génère en moyenne 15 à 20 jours de location par mois à Douala.' },
  { icon: ShieldCheck,      title: 'Protection assurance tous risques', desc: 'Chaque location est couverte par notre assurance partenaire — votre véhicule est protégé, pas vous.' },
  { icon: LayoutDashboard,  title: 'Tableau de bord 24/7',              desc: 'Suivez vos locations, revenus et l\'état de votre véhicule en temps réel depuis votre espace.' },
  { icon: ClipboardCheck,   title: 'Zéro charge administrative',        desc: 'Contrats, états des lieux, paiements, cautions : nous gérons tout, vous encaissez.' },
];

/* ── Simulateur de revenus ───────────────────────────── */
export const SIM_GAMMES = [
  { id: 'basic',    label: 'Citadine — Basic',    dayPrice: 25000 },
  { id: 'standard', label: 'Berline — Standard',  dayPrice: 35000 },
  { id: 'premium',  label: 'SUV — Premium',       dayPrice: 55000 },
  { id: 'gold',     label: 'Prestige — Gold',     dayPrice: 95000 },
];
export { OWNER_SHARE } from '../../utils/commission';

/* ── 4 étapes partenaire ─────────────────────────────── */
export const PARTNER_STEPS = [
  { icon: PenLine,     title: 'Inscription en ligne',        desc: 'Créez votre compte propriétaire et décrivez votre véhicule en 5 minutes — photos incluses.' },
  { icon: SearchCheck, title: 'Audit & inspection du véhicule', desc: 'Nos contrôleurs vérifient l\'état mécanique, les documents et l\'habillage photo en agence.' },
  { icon: Globe,       title: 'Validation & mise en ligne',  desc: 'Votre annonce est publiée dans le catalogue sous 48 h avec tarification optimisée.' },
  { icon: Banknote,    title: 'Revenus versés chaque semaine', desc: 'Encaissez 85 % de chaque location par Mobile Money, chaque lundi — relevé détaillé à l\'appui.' },
];

/* ── Éligibilité + commission ────────────────────────── */
export const ELIGIBILITY = [
  { ok: true,  text: 'Véhicule de moins de 12 ans ou 150 000 km' },
  { ok: true,  text: 'Carte grise et assurance à jour' },
  { ok: true,  text: 'Visite technique valide de moins de 6 mois' },
  { ok: true,  text: 'Climatisation et équipements de sécurité fonctionnels' },
  { ok: false, text: 'Véhicules accidentés non réparés — refusés' },
];

export const COMMISSION_POINTS = [
  'Aucune mise de fonds ni frais d\'inscription',
  'Commission prélevée uniquement sur les locations réalisées',
  'Photos pro, annonce et tarification optimisées offertes',
  'Bonus fidélité : −2 % de commission dès 20 jours loués/mois',
];

/* ── FAQ propriétaire ────────────────────────────────── */
export const FAQS_OWNER = [
  {
    q: 'Que se passe-t-il en cas d\'accident pendant une location ?',
    a: 'Chaque location est couverte par notre assurance tous risques. La caution du locataire couvre la franchise. Un gestionnaire dédié suit le dossier jusqu\'à réparation complète.',
  },
  {
    q: 'Qu\'est-ce qui change si mon véhicule a un conducteur dédié ?',
    a: 'En autoconduite, le locataire conduit ; avec chauffeur AutoLink Pro, notre chauffeur certifié conduit votre véhicule — usure réduite et revenus majorés d\'environ 15 %.',
  },
  {
    q: 'Puis-je retirer mon véhicule de la plateforme à tout moment ?',
    a: 'Oui, sans pénalité. Vous pouvez aussi bloquer des périodes d\'indisponibilité depuis votre espace quand vous avez besoin du véhicule.',
  },
  {
    q: 'Comment sont fixés les tarifs de location de mon véhicule ?',
    a: 'Nous recommandons un tarif optimal selon la gamme, l\'état et la demande locale. Vous gardez le dernier mot : le prix reste ajustable dans une fourchette validée.',
  },
];
