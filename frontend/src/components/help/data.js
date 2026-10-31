import {
  ShieldCheck, CalendarCheck, FileText,
  MessageCircle, Phone, Building2,
} from 'lucide-react';

/* ── Thématiques de la FAQ ───────────────────────────── */
export const HELP_CATS = [
  { id: 'all',        label: 'Toutes les catégories' },
  { id: 'resa',       label: 'Réservation & Véhicules' },
  { id: 'paiement',   label: 'Paiement, Portefeuille & Caution' },
  { id: 'docs',       label: 'Conditions & Documents' },
  { id: 'assistance', label: 'Assistance & Services' },
];

export const CAT_LABEL = {
  resa:       'Réservation & Véhicules',
  paiement:   'Paiement & Facturation',
  docs:       'Conditions & Documents',
  assistance: 'Assistance & Services',
};

export const HELP_FAQS = [
  { cat: 'docs',       q: 'Quel est le délai minimum pour réserver un véhicule ?', a: 'Vous pouvez réserver jusqu\'à 2 heures avant le départ en ligne. Pour les gammes Gold et les événements, nous recommandons 48 h d\'anticipation.' },
  { cat: 'resa',       q: 'Est-ce que le prix affiché varie entre Douala et Yaoundé ?', a: 'Les tarifs de base sont identiques dans les deux villes. Seuls les suppléments de zone (aéroport, interurbain) peuvent varier selon le trajet.' },
  { cat: 'paiement',   q: 'Comment fonctionne l\'option avec chauffeur certifié ?', a: 'Le chauffeur est ajouté comme option à la réservation (+10 000 FCFA/j). Il est certifié AutoLink Pro, évalué après chaque course et joignable via l\'application.' },
  { cat: 'paiement',   q: 'Comment recharger mon portefeuille avec MTN/Orange Money ?', a: 'Depuis votre espace client : Portefeuille → Recharger → choisissez MTN MoMo ou Orange Money, validez sur votre téléphone. Le crédit est instantané.' },
  { cat: 'paiement',   q: 'Quand ma caution est-elle débloquée après la location ?', a: 'Dès que l\'état de sortie est validé conforme à l\'état d\'entrée, la pré-autorisation est levée immédiatement — visible sous 24 h selon votre opérateur.' },
  { cat: 'docs',       q: 'Quels documents dois-je fournir pour débloquer mon compte ?', a: 'Une pièce d\'identité valide (CNI ou passeport) suffit pour louer avec chauffeur. Pour l\'autoconduite, ajoutez votre permis de conduire.' },
  { cat: 'assistance', q: 'Que faire si mon véhicule tombe en panne pendant la location ?', a: 'Contactez l\'assistance 24/7 depuis l\'application ou au +237 656 789 000. Un véhicule de remplacement est dépêché sous 2 h en zone urbaine.' },
  { cat: 'assistance', q: 'Puis-je modifier ou annuler ma réservation gratuitement ?', a: 'Oui : modification gratuite jusqu\'à 15 min avant le départ, annulation remboursée à 100 % jusqu\'à 24 h avant, 80 % ensuite.' },
  { cat: 'resa',       q: 'Les véhicules sont-ils équipés pour les trajets interurbains ?', a: 'Les gammes Premium et Gold sont optimisées pour l\'interurbain (Douala ↔ Yaoundé, Kribi, Bafoussam). Le kilométrage inclus est adapté au trajet.' },
  { cat: 'docs',       q: 'Qu\'est-ce que la garantie « Caution Sécurisée » ?', a: 'Votre caution est pré-autorisée sur un compte séquestre AutoLink Pro — jamais versée au propriétaire. Elle est libérée automatiquement si l\'état des lieux est conforme.' },
];

/* ── Cartes latérales (méthodes d'aide) ──────────────── */
export const HELP_HIGHLIGHTS = [
  { icon: ShieldCheck,  title: 'Garantie & Caution sécurisée', desc: 'Comprendre le séquestre, l\'état des lieux photo et le déblocage automatique.', tag: 'Sécurité' },
  { icon: CalendarCheck, title: 'Réservation en 15 minutes',   desc: 'Du choix du véhicule à la confirmation : le parcours complet expliqué pas à pas.', tag: 'Guide' },
  { icon: FileText,     title: 'Service Client & Litiges',     desc: 'Déposer une réclamation, suivre un dossier, demander une médiation AutoLink Pro.', tag: 'Support' },
];

/* ── Assistance immédiate ────────────────────────────── */
export const HELP_CONTACTS = [
  {
    icon: Phone, title: 'Appeler le standard — 24h/24 & 7j/7',
    desc: 'Pour les urgences route, pannes et retards : une équipe décroche jour et nuit.',
    btn: '+237 656 789 000', lines: ['+237 699 456 123', '+237 233 478 900'],
  },
   {
    icon: MessageCircle, title: 'Échangez en direct avec un conseiller AutoLink',
    desc: 'WhatsApp Business — réponse moyenne en moins de 10 minutes, 7j/7 de 7h à 22h.',
    btn: 'Démarrer sur WhatsApp (+237 655 090 909)', green: true,
  },
  {
    icon: Building2, title: 'Nos agences & bureaux d\'inspection',
    desc: 'Retrait des véhicules, états des lieux et accueil client sur rendez-vous.',
    lines: ['Douala — Bonanjo, Av. de Gaulle', 'Yaoundé — Bastos, Rue 1.739', 'Lun–Sam : 8h–18h'],
  },
];

/* ── Catégories rapides sous la recherche ────────────── */
export const QUICK_CHIPS = ['Paiement & Mobile Money', 'Caution sécurisée', 'Modifier une réservation', 'Documents requis', 'Chauffeur certifié', 'Assistance'];


