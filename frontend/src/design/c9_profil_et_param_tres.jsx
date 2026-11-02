import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full">
<!-- Page Header -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
<div class="flex flex-col gap-1 max-w-3xl">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Mon Profil & Paramètres de Compte</h1>
<p class="font-body-md text-on-surface-variant">Gérez vos informations personnelles, le statut légal de vos pièces justificatives CEMAC et la sécurité de votre compte.</p>
</div>
</div>
</div>
</div>
</div>
<!-- Section 1: Informations Personnelles (Summary Banner) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg relative overflow-hidden">
<div class="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
<!-- Profile Info -->
<div class="flex items-start sm:items-center gap-space-md">
<div class="relative shrink-0">
<div class="w-20 h-20 rounded-2xl bg-primary text-on-primary font-headline-lg flex items-center justify-center font-black shadow-md">
            EK
          </div>
<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</div>
<div class="flex flex-col">
<div class="flex flex-wrap items-center gap-space-xs">
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">Emmanuel Kouam</h2>
<span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">shield</span>
              Identité vérifiée
            </span>
</div>
<div class="flex flex-wrap items-center gap-y-1 gap-x-space-md mt-1 text-on-surface-variant font-body-sm text-body-sm">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-outline">mail</span>
              emmanuel.k@gmail.com
            </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-outline">call</span>
              +237 670 42 18 90
            </span>
<span class="px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-label-sm text-primary font-bold">
              MTN MoMo lié
            </span>
</div>
</div>
</div>
<!-- Trust Score & Rank Widget -->

<details class="relative shrink-0">
<summary class="list-none cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all"><span class="material-symbols-outlined text-[18px]">edit</span>Modifier mon profil</summary>
<div class="absolute right-0 top-full mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-elevation-3 border border-outline-variant/30 py-2 z-50">
<button class="flex items-center gap-2 px-4 py-2.5 w-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">Informations personnelles</button>
<button class="flex items-center gap-2 px-4 py-2.5 w-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">Pièces d'identité & Documents 1 à renouveler</button>
<button class="flex items-center gap-2 px-4 py-2.5 w-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">Sécurité & Authentification (2FA)</button>
<button class="flex items-center gap-2 px-4 py-2.5 w-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">Préférences & Notifications</button>
<button class="flex items-center gap-2 px-4 py-2.5 w-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors">Données personnelles & RGPD/CEMAC</button>
</div>
</details>
</div>
<!-- Section 2: Pièces d'identité & Justificatifs Réglementaires -->
<div class="flex flex-col gap-space-md mb-space-lg">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
<div>
<h3 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Pièces d'identité & Documents Requis</h3>
<p class="font-body-md text-on-surface-variant">Conformité avec les directives des transports terrestres de la république du Cameroun & CEMAC.</p>
</div>
<button class="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors shadow-sm">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
        Ajouter un document
      </button>
</div>
<!-- Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
<!-- Card 1: CNI Validée -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">badge</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Pièce d'Identité Officielle</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">CNI ou Passeport Biométrique CEMAC</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shrink-0">
<span class="w-2 h-2 rounded-full bg-primary"></span>
              VALIDÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Numéro :</span>
<span class="font-mono font-semibold">102938472 (Douala)</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Validité :</span>
<span class="font-semibold text-primary">Jusqu'au 14 Août 2028</span>
</div>
<div class="flex items-center gap-1.5 text-primary font-label-sm text-label-sm pt-1">
<span class="material-symbols-outlined text-[16px]">face_retouching_natural</span>
              Vérification faciale biométrique confirmée
            </div>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="flex-1 py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">visibility</span>
            Voir le document
          </button>
<button class="py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">
            Remplacer
          </button>
</div>
</div>
<!-- Card 2: Permis à renouveler -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
<div class="absolute top-0 right-0 w-2 h-full bg-blue-100"></div>
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">drive_eta</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Permis de Conduire (Cat. B)</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Indispensable pour auto-partage sans chauffeur</span>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-label-sm text-label-sm font-bold flex items-center gap-1 shrink-0">
<span class="w-2 h-2 rounded-full bg-blue-100 animate-pulse"></span>
              À RENOUVELER (15j)
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Réf. Permis :</span>
<span class="font-mono font-semibold">CM-LT-88219</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Date d'expiration :</span>
<span class="font-semibold text-blue-700">12 Novembre 2025</span>
</div>
<p class="text-blue-700 font-label-sm text-label-sm font-semibold pt-1">
              Important : passée cette date, les clés ne pourront pas vous être transmises sans chauffeur.
            </p>
</div>
</div>
<div class="flex flex-col gap-2 pt-2">
<button class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary transition-all font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-[20px]">upload_file</span>
            Téléverser le nouveau permis recto/verso
          </button>
</div>
</div>
<!-- Card 3: Justificatif Domicile -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">home_pin</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Justificatif de Domicile</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Facture certifiée ou Attestation d'hébergement</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shrink-0">
<span class="w-2 h-2 rounded-full bg-primary"></span>
              VALIDÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Émetteur & Zone :</span>
<span class="font-semibold">Facture Eneo · Douala (Akwa Nord)</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Date d'audit :</span>
<span class="font-semibold text-primary">Vérifié le 15 Septembre 2025</span>
</div>
<div class="text-outline-variant text-[12px] pt-1">
              Valable pour une période d'un an sur le réseau AutoLink Pro.
            </div>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">visibility</span>
            Voir le document
          </button>
</div>
</div>
<!-- Card 4: Assurance Complémentaire (Refusé) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
<div class="absolute top-0 right-0 w-2 h-full bg-error"></div>
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">health_and_safety</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Assurance Complémentaire</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Couverture personnelle responsabilité civile</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-1 shrink-0">
<span class="w-2 h-2 rounded-full bg-error"></span>
              REFUSÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-error-container/30 rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface">
<span class="font-label-sm text-label-sm text-error font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">report_problem</span>
              Motif du rejet :
            </span>
<p class="text-on-surface-variant text-[13px] leading-relaxed">
              Document illisible ou tronqué sur les bords lors de la capture. Merci de soumettre un scan PDF haute résolution délivré par votre assureur.
            </p>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="w-full py-2.5 px-4 rounded-xl bg-surface-container text-error hover:bg-error-container transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">replay</span>
            Soumettre à nouveau
          </button>
</div>
</div>
</div>
<!-- Security & Legal Guarantee Callout -->
<div class="rounded-2xl bg-surface-container-low p-space-md flex items-center gap-space-md">

<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Protection et Chiffrement Bancaire</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">
          Vos documents sont chiffrés AES-256 et sécurisés conformément aux normes de l'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) et de la commission bancaire CEMAC. Aucun document n'est transmis à des tiers sans votre consentement explicite.
        </p>
</div>
</div>
</div>
<!-- Bento Section: Split Security & Preferences -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-space-lg">
<!-- Section 3: Sécurité & Paramètres (Col 7) -->
<div class="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-lg">
<div class="flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]">security</span>
</div>
<div>
<h3 class="font-headline-md text-headline-md text-on-surface font-bold">Sécurité & Authentification</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Gestion des accès et sessions sécurisées</p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold">Très Fort</span>
</div>
<div class="flex flex-col gap-3">
<!-- 2FA Item -->
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary text-[24px]">phonelink_lock</span>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Double Facteur (2FA via SMS & WhatsApp)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Actif sur le +237 670 42 18 90</span>
</div>
</div>
<button class="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
              Gérer
            </button>
</div>
<!-- Password Item -->
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-outline text-[24px]">password</span>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Mot de passe du compte</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Dernière modification il y a 3 mois</span>
</div>
</div>
<button class="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
              Mettre à jour
            </button>
</div>
<!-- Active Sessions -->
<div class="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-2">
<span class="font-label-sm text-label-sm text-outline uppercase font-bold tracking-wider">Session active détectée</span>
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary text-[22px]">laptop_mac</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface font-semibold">Chrome sur macOS · Douala, Cameroun</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Adresse IP locale (Camtel WAN) · En ligne</span>
</div>
</div>
<span class="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">Session actuelle</span>
</div>
</div>
</div>
</div>
<div class="flex items-center justify-between pt-2">
<span class="font-body-sm text-body-sm text-on-surface-variant">Déconnecter tous les autres appareils connectés</span>
<button class="text-error font-label-md text-label-md hover:underline font-semibold">Tout déconnecter</button>
</div>
</div>
<!-- Section 4: Préférences & Données Personnelles (Col 5) -->
<div class="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-lg">
<div class="flex flex-col gap-space-md">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]">tune</span>
</div>
<div>
<h3 class="font-headline-md text-headline-md text-on-surface font-bold">Préférences Régionales</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Affichage et gestion des données</p>
</div>
</div>
<div class="flex flex-col gap-space-sm font-body-sm text-body-sm">
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
<span class="text-on-surface font-medium">Langue de l'interface</span>
<span class="font-label-md text-label-md text-primary font-bold">Français (Cameroun)</span>
</div>
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
<span class="text-on-surface font-medium">Devise de transaction</span>
<span class="font-label-md text-label-md text-on-surface font-bold">FCFA (XAF)</span>
</div>
<div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
<div class="flex flex-col">
<span class="text-on-surface font-medium">Facturation numérique directe</span>
<span class="text-outline text-[12px]">Reçu envoyé par email après restitution</span>
</div>
<div class="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
<div class="w-4 h-4 bg-surface rounded-full absolute right-1 top-1"></div>
</div>
</div>
</div>
<div class="flex flex-col gap-2 pt-2">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">Exportation de données CEMAC</span>
<div class="grid grid-cols-2 gap-2">
<button class="py-2 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">download</span>
              Format PDF
            </button>
<button class="py-2 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[18px]">data_object</span>
              Format JSON
            </button>
</div>
</div>
</div>
<div class="pt-4 border-t-0 flex items-center justify-between">
<button class="text-error font-label-sm text-label-sm hover:underline font-semibold">
          Supprimer mon compte définitivement
        </button>

</div>
</div>
</div>
`;
const LINKS = {
  'Mettre à jour': '/settings',
  'Tout déconnecter': '/login',
  'Supprimer mon compte définitivement': '/settings',
};

export default function c9profiletparamtres({ role = 'client' }) {
  return <DesignPage html={HTML} links={LINKS} role={role} />;
}

export { HTML, LINKS };
