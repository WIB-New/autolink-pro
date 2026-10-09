# -*- coding: utf-8 -*-
"""19 Manuel utilisateur · 20 Guide administrateur · 21 Documents légaux ·
22 Plan de projet & risques · 23 PV de recette & livraison."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa

def manuel():
    doc = new_doc()
    cover(doc, 'ALP-MU-019', 'MANUEL UTILISATEUR', 'Guides pas-à-pas par rôle')
    h1(doc, '1. Client')
    numbered(doc, [
        'Créer un compte : /register (email + mot de passe) ou connexion par code email / Google.',
        'Recharger le solde : sidebar « Recharger » → montant → MTN MoMo, Orange, SenBid, PayBid, PayPal ou Stripe.',
        'Réserver : /client/search → filtrer par gamme/type → fiche véhicule → dates + adresses → confirmer.',
        'Suivre : « Mes réservations » (statuts), « Statistiques » (dépenses), « Mon portefeuille » (transactions).',
        'Contacter le support : menu Messages → conversation « Support ».',
        'Après la location : noter le véhicule (1–5 étoiles).',
    ])
    h1(doc, '2. Propriétaire')
    numbered(doc, [
        'Publier : « Ajouter un véhicule » → caractéristiques, tarif, caution, assurance, photos → validation admin.',
        'Choisir le mode : « confié » (flotte AutoLink) ou « domicile ».',
        'Suivre revenus : dashboard → montants nets après commission.',
        'Demander un chauffeur ou déclarer une maintenance : menus dédiés.',
    ])
    h1(doc, '3. Intermédiaire / contrôleur')
    bullets(doc, [
        'Intermédiaire : partager son code de parrainage → commission sur les locations des filleuls.',
        'Contrôleur : fiches d\u2019inspection entrée/sortie avec photos et score d\u2019état.',
    ])
    status_block(doc, 88, 'Ajouter captures d\u2019écran annotées de chaque écran · version PDF pour diffusion.')
    return doc

def guide_admin():
    doc = new_doc()
    cover(doc, 'ALP-GA-020', 'GUIDE ADMINISTRATEUR', 'Pilotage de la plateforme')
    h1(doc, '1. Accès')
    bullets(doc, [
        'Back-office web : /admin/dashboard (rôle ADMIN)',
        'Django admin : https://api-autolink-pro…/admin — compte créé via ADMIN_USERNAME/EMAIL/PASSWORD au démarrage',
    ])
    h1(doc, '2. Opérations courantes')
    table(doc, ['Action', 'Où', 'Comment'], [
        ['Attribuer un rôle', 'Utilisateurs', 'PATCH user → OWNER/CONTROLLER/INTERMEDIARY/ADMIN'],
        ['Suspendre un compte', 'Utilisateurs', 'Bascule actif/suspendu'],
        ['Approuver un véhicule', 'Véhicules', 'pending → approved (visible catalogue)'],
        ['Traiter un litige', 'Réservations', 'resolve-dispute → remboursement/caution'],
        ['Valider un payout', 'Finance', 'Marquer le versement propriétaire/agent'],
        ['Paramétrer', 'Paramètres', 'Commission, contacts, textes plateforme'],
        ['Recruter chauffeurs', 'Chauffeurs', 'Candidatures + service_requests'],
        ['Maintenance', 'Maintenance', 'Tickets véhicules — statuts'],
    ], widths=[4.5, 3.5, 8.5])
    h1(doc, '3. Sécurité admin')
    bullets(doc, [
        'Mot de passe admin fort unique · ne pas partager · rotation trimestrielle',
        'ADMIN_PASSWORD changé → redéployer pour re-seed (seed_demo met à jour le compte)',
        'Toute modification critique = action journalisée — vérifier après chaque opération',
    ])
    status_block(doc, 85, 'Former l\u2019équipe admin · définir la procédure de suspension d\u2019urgence.')
    return doc

def legaux():
    doc = new_doc()
    cover(doc, 'ALP-LEG-021', 'DOCUMENTS LÉGAUX (MODÈLES)', 'CGU · politique de confidentialité · contrat de location')
    h1(doc, '1. CGU — Conditions Générales d\u2019Utilisation (extrait modèle)')
    bullets(doc, [
        'AutoLink Pro est une plateforme de mise en relation — non propriétaire des véhicules.',
        'Le client s\u2019engage à restituer le véhicule dans l\u2019état constaté à la prise en charge.',
        'La caution est séquestrée pendant la location et libérée après état de sortie.',
        'Litiges arbitrés par AutoLink ; responsabilités selon la législation camerounaise.',
        'Commission prélevée sur chaque location (taux affiché dans les paramètres).',
    ])
    h1(doc, '2. Politique de confidentialité (extrait modèle)')
    bullets(doc, [
        'Données collectées : identité, email, téléphone, historique de locations — jamais de données bancaires.',
        'Finalités : fourniture du service, paiement, sécurité, statistiques anonymisées.',
        'Conservation : durée du compte + obligations légales · droits d\u2019accès/suppression via profil.',
        'Sous-traitants : Stripe, PayPal (paiement), OVH (hébergement), Google (auth optionnelle).',
    ])
    h1(doc, '3. Modèle de contrat de location (trame)')
    bullets(doc, [
        'Parties, véhicule (marque/modèle/plaque), période, tarif/jour, caution, km inclus',
        'État des lieux entrée/sortie (fiches contrôleur avec photos)',
        'Pénalités retard, annulation, responsabilité en cas de dommage, assurances',
    ])
    callout(doc, 'Ces trames ne remplacent pas une rédaction juridique — faire valider par un avocat '
                 'camerounais avant publication des pages légales sur le site.', bold_prefix='AVERTISSEMENT', fill='FEF3C7')
    status_block(doc, 55, 'Rédaction juridique complète par un professionnel · publication des pages /cgu /confidentialite sur le site.')
    return doc

def plan_projet():
    doc = new_doc()
    cover(doc, 'ALP-PP-022', 'PLAN DE PROJET & RISQUES', 'Méthodologie, conventions, risques')
    h1(doc, '1. Méthodologie')
    bullets(doc, [
        'Kanban itératif + jalons J1→J5 · démos client à chaque jalon',
        'Workflow Git : master = prod historique · feature/refonte-v2-panels = branche déployée · commits en français, message « pourquoi »',
        'CI/CD : push → webhook → build Dokploy → déploy auto · rollback par tag',
    ])
    h1(doc, '2. Conventions de code')
    bullets(doc, [
        'Front : composants fonctionnels React, Tailwind, lucide-react · noms en anglais, UI en français',
        'Back : apps Django par domaine (users/vehicles/bookings/payments/drivers/inspections) · DRF viewsets + permissions par rôle',
        'Pas de secrets dans le code · variables d\u2019environnement uniquement',
    ])
    h1(doc, '3. Registre des risques')
    table(doc, ['Risque', 'Proba', 'Impact', 'Mitigation'], [
        ['APIs Mobile Money non contractuelles', 'Haute', 'Moyen', 'Crédit direct en attendant + Stripe/PayPal live'],
        ['SQLite saturée en charge', 'Moyenne', 'Élevé', 'DATABASE_URL PostgreSQL prêt + volume sauvegardé'],
        ['VPS indisponible', 'Faible', 'Élevé', 'Restart auto + healthcheck + snapshot VPS'],
        ['Fraudes locations', 'Moyenne', 'Élevé', 'Escrow caution + inspections photo + litiges'],
        ['Fuite de secrets', 'Faible', 'Critique', 'Secrets en env uniquement, rotation, 404 chemins sensibles'],
        ['Retard périmètre', 'Moyenne', 'Moyen', 'MVP priorisé, scope Could/Won\u2019t reporté'],
    ], widths=[5.5, 2, 2, 7])
    status_block(doc, 85, 'Ajouter comptes rendus de réunion réels · tenir le registre à jour en continu.')
    return doc

def pv():
    doc = new_doc()
    cover(doc, 'ALP-PV-023', 'PV DE RECETTE & PV DE LIVRAISON (MODÈLES)', 'Documents à signer')
    h1(doc, '1. Procès-verbal de recette')
    table(doc, ['Champ', 'Valeur'], [
        ['Projet', 'AutoLink Pro — plateforme de location de véhicules'],
        ['Date de recette', '____ / ____ / 2026'],
        ['Cahier de recette', 'Réf. ALP-CRT-016 — ~40 cas exécutés'],
        ['Résultat', 'OK : ____   KO : ____   N/A : ____   Taux : ____ %'],
        ['Bloquants (■)', '0 KO requis'],
        ['Décision', '☐ Recette acceptée    ☐ Acceptée avec réserves : ____________    ☐ Refusée'],
    ], widths=[5, 11.5])
    para(doc, '\nLe client : ____________________          Le prestataire : ____________________', center=True)
    doc.add_page_break()
    h1(doc, '2. Procès-verbal de livraison')
    table(doc, ['Livrable', 'Remis'], [
        ['Code source (dépôts GitHub)', '☐'],
        ['Application en production (URLs vérifiées)', '☐'],
        ['Documentation complète (documentation/)', '☐'],
        ['Accès : Dokploy, DNS, Stripe, PayPal, SMTP, admin Django', '☐'],
        ['Comptes et mots de passe transmis (coffre)', '☐'],
        ['Certificat de cession de droits', '☐'],
    ], widths=[12.5, 4])
    para(doc, '\nFait à Douala, le ____ / ____ / 2026\n\n'
              'Le client : ____________________          Le prestataire : ____________________', center=True)
    status_block(doc, 60, 'À dater et signer en présence des parties après exécution du cahier de recette.')
    return doc

def build():
    manuel().save(os.path.join(DOCS_DIR, '19_Manuel_utilisateur.docx'))
    guide_admin().save(os.path.join(DOCS_DIR, '20_Guide_administrateur.docx'))
    legaux().save(os.path.join(DOCS_DIR, '21_Documents_legaux.docx'))
    plan_projet().save(os.path.join(DOCS_DIR, '22_Plan_projet_risques.docx'))
    pv().save(os.path.join(DOCS_DIR, '23_PV_recette_livraison.docx'))
    print('OK docs 19-23')

if __name__ == '__main__':
    build()
