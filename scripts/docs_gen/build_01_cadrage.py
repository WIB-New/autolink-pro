# -*- coding: utf-8 -*-
"""Documents de cadrage : 01 CDC · 02 Note de cadrage · 03 Benchmark ·
04 Devis & planning · 05 Contrat/NDA."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa
from project_facts import commission_rate

COM = f'{commission_rate() * 100:g}' if commission_rate() is not None else '50'

# ─────────────────────────────────────────────────────────────────────────────
def cahier_des_charges():
    doc = new_doc()
    cover(doc, 'ALP-CDC-001', 'CAHIER DES CHARGES', 'Plateforme de location de véhicules — marché camerounais')

    h1(doc, '1. Contexte et objectifs')
    para(doc, "AutoLink Pro est une plateforme web et mobile de mise en relation entre propriétaires "
              "de véhicules, clients (locataires) et intermédiaires, opérant sur Douala et Yaoundé. "
              "Le constat : la location de voitures entre particuliers au Cameroun repose encore sur le "
              "bouche-à-oreille et WhatsApp, sans garantie, sans traçabilité ni paiement sécurisé.")
    h3(doc, 'Objectifs')
    bullets(doc, [
        'Digitaliser la location entre particuliers : catalogue consultable, réservation en ligne, paiement sécurisé.',
        'Garantir la confiance : véhicules inspectés (fiches d\u2019état avec photos), caution séquestrée (escrow), litiges tracés.',
        f'Monétiser : commission AutoLink paramétrable (variable COMMISSION_RATE — {COM} % en production, modulable) + commission intermédiaire.',
        'Servir le paiement local : MTN Mobile Money, Orange Money, SenBid, PayBid, et Stripe/PayPal pour la diaspora.',
    ])

    h1(doc, '2. Cible et parties prenantes')
    table(doc, ['Cible', 'Besoin', 'Rôle applicatif'], [
        ['Particuliers / clients', 'Louer un véhicule fiable, prix transparent, paiement mobile', 'CLIENT'],
        ['Propriétaires de véhicules', 'Rentabiliser leur véhicule, revenus suivis, véhicule géré ou à domicile', 'OWNER'],
        ['Intermédiaires / agents', 'Parrainer des clients, toucher une commission', 'INTERMEDIARY'],
        ['Contrôleurs terrain', 'États des lieux entrée/sortie, score d\u2019état, litiges', 'CONTROLLER'],
        ['Équipe AutoLink', 'Modération, finance, recrutement, paramétrage', 'ADMIN'],
    ], widths=[4.5, 8, 4])

    h1(doc, '3. Périmètre fonctionnel')
    h3(doc, 'Inclus (version livrée)')
    bullets(doc, [
        'Inscription/connexion : email + mot de passe, Google OAuth, code OTP par email (sans mot de passe)',
        'Catalogue : recherche, filtres par gamme (Basic/Standard/Premium/Gold), types de location (3 h, 8 h, 24 h, interurbain)',
        'Réservation : dates, tarif calculé automatiquement, caution, litige, notation 1–5',
        'Portefeuille AutoLink : solde, recharge multi-canal, historique des transactions',
        'Paiements live : Stripe Checkout et PayPal (retour serveur + webhook), escrow caution',
        'Back-office : utilisateurs, véhicules, chauffeurs (service interne), finance, agents affiliés, maintenance, paramètres plateforme',
        'Messagerie interne + notifications temps réel (polling 30 s)',
        'Dashboards par rôle, statistiques client, thème clair/sombre, identité visuelle par rôle',
    ])
    h3(doc, 'Exclus / reportés')
    bullets(doc, [
        'APIs opérateurs MTN/Orange en direct (recharges mobiles créditées sans appel opérateur pour l\u2019instant)',
        'Paiement espèces et remise en main propre systématisée',
        'App mobile en production store (APK via EAS build uniquement)',
        'Multi-ville au-delà de Douala/Yaoundé, multi-langue (FR uniquement)',
    ])

    h1(doc, '4. Contraintes')
    table(doc, ['Type', 'Contrainte'], [
        ['Techniques', 'React 18 + Tailwind · Django 4.2 + DRF + JWT · SQLite en prod (volume persistant) · Docker + Dokploy'],
        ['Réglementaires', 'Données personnelles (loi camerounaise 2010/012) · facturation FCFA · contrats de location'],
        ['Budget', 'VPS OVH mutualisé, nom de domaine worldwide-international.business, certificats Let\u2019s Encrypt'],
        ['Délais', 'MVP livré et en production en ~10 semaines'],
        ['Marché', 'Devise XAF (FCFA) · conversion PayPal 600 F/USD paramétrable · mobile-first (Android dominant)'],
    ], widths=[3.5, 13])

    h1(doc, '5. Critères d\u2019acceptation')
    numbered(doc, [
        'Un client peut s\u2019inscrire, se connecter et réserver un véhicule disponible en moins de 5 minutes.',
        'Le solde est crédité après paiement Stripe/PayPal vérifié côté serveur (ou webhook).',
        'Un propriétaire publie un véhicule ; il apparaît après approbation admin.',
        'La commission AutoLink et le montant propriétaire sont calculés automatiquement sur chaque réservation.',
        'Aucune donnée d\u2019un utilisateur n\u2019est visible par un autre rôle sans autorisation (tests API).',
        'Le site est accessible en HTTPS sur autolink-pro.worldwide-international.business, disponibilité ≥ 99 %.',
    ])

    h1(doc, '6. Livrables attendus')
    bullets(doc, [
        'Code source (dépôt GitHub), application web en production, APK Android (EAS)',
        'Ensemble documentaire : CDC, SFD, DAT, doc API, cahier de recette, manuels, légaux',
        'Accès : hébergement, domaine, services tiers (Stripe, PayPal, SMTP)',
    ])
    status_block(doc, 95, 'Validation et signature du client · chiffrage budgétaire final validé en séance.')
    return doc

# ─────────────────────────────────────────────────────────────────────────────
def note_cadrage():
    doc = new_doc()
    cover(doc, 'ALP-NC-002', 'NOTE DE CADRAGE', 'Proposition technique et commerciale')

    h1(doc, '1. Compréhension du besoin')
    para(doc, "Le client souhaite lancer une plateforme de location de véhicules adaptée au marché "
              "camerounais : mise en relation clients/propriétaires, paiement Mobile Money, "
              "contrôle qualité terrain (contrôleurs), gouvernance centralisée (admin).")
    h1(doc, '2. Approche proposée')
    bullets(doc, [
        ('MVP itératif : ', 'socle auth + catalogue + réservation d\u2019abord, puis paiements, puis refonte v2 (messagerie, intermédiaires, maintenance).'),
        ('Monorepo 3 cibles : ', 'frontend React, API Django REST, app Expo React Native — un seul backend.'),
        ('Paiement hybride : ', 'Mobile Money local (MTN/Orange/SenBid/PayBid) + Stripe/PayPal pour cartes et diaspora.'),
        ('Confiance : ', 'caution séquestrée (escrow), inspections avec score 0–100, litiges tracés.'),
        ('Coûts maîtrisés : ', 'SQLite + Docker + Dokploy sur VPS unique ; PostgreSQL prêt via DATABASE_URL.'),
    ])
    h1(doc, '3. Livrables et jalons')
    table(doc, ['Jalon', 'Contenu', 'Statut'], [
        ['J1 — Socle', 'Auth JWT/OTP/Google, rôles, catalogue, réservation', 'Livré'],
        ['J2 — Argent', 'Wallet, recharges, Stripe/PayPal live, escrow, payouts', 'Livré'],
        ['J3 — Refonte v2', 'Messagerie, intermédiaires, maintenance, thèmes par rôle', 'Livré'],
        ['J4 — Production', 'Dokploy, domaines HTTPS, monitoring', 'Livré'],
        ['J5 — Clôture', 'Documentation complète, recette, PV', 'En cours'],
    ], widths=[3.2, 10.2, 3.2])
    h1(doc, '4. Moyens et équipe')
    bullets(doc, [
        '1 développeur fullstack (React/Django) + interventions design/devops',
        'Outils : GitHub (code), Dokploy (CI/CD), Figma (maquettes), Expo/EAS (mobile)',
    ])
    h1(doc, '5. Conditions commerciales')
    para(doc, 'Voir document 04 — Devis & planning. Modalités de paiement : acompte 40 %, '
              'jalons 40 %, solde à la recette. Maintenance : voir plan de maintenance (doc 16).')
    status_block(doc, 85, 'Ajouter les coordonnées commerciales de l\u2019entreprise et faire valider par le client.')
    return doc

# ─────────────────────────────────────────────────────────────────────────────
def benchmark():
    doc = new_doc()
    cover(doc, 'ALP-BEN-003', 'ÉTUDE DE L\u2019EXISTANT & BENCHMARK', 'Turo · Getaround · Hertz · acteurs locaux')
    h1(doc, '1. Méthodologie')
    para(doc, 'Analyse comparative des fonctionnalités, modèles économiques et parcours utilisateurs '
              'des leaders mondiaux de la location entre particuliers et des acteurs locaux '
              '(agences traditionnelles, groupes WhatsApp/Facebook, Yango).')
    h1(doc, '2. Comparatif fonctionnel')
    table(doc, ['Fonctionnalité', 'Turo', 'Getaround', 'Hertz', 'Local (WhatsApp)', 'AutoLink Pro'], [
        ['Réservation en ligne', 'Oui', 'Oui (instantanée)', 'Oui', 'Non (manuel)', 'Oui'],
        ['Paiement mobile money', 'Non', 'Non', 'Non', 'Partiel', 'Oui (4 canaux)'],
        ['Paiement carte/PayPal', 'Oui', 'Oui', 'Oui', 'Rare', 'Oui (Stripe/PayPal)'],
        ['Caution séquestrée', 'Oui', 'Oui', 'Empreinte CB', 'Non', 'Oui (escrow)'],
        ['États des lieux photo', 'Oui', 'Oui', 'Oui', 'Non', 'Oui (contrôleurs dédiés)'],
        ['Commission plateforme', '15–40 %', '~40 %', 'n/a', '0 %', f'Paramétrable ({COM} %)'],
        ['Chauffeur optionnel', 'Non', 'Non', 'Non', 'Parfois', 'Oui (service interne)'],
        ['Intermédiaires/affiliation', 'Non', 'Non', 'Non', 'Informel', 'Oui (rôle dédié)'],
        ['Interurbain structuré', 'Non', 'Non', 'Partiel', 'Informel', 'Oui (Douala ↔ Yaoundé)'],
    ], widths=[4.5, 2.2, 2.6, 2.2, 2.6, 2.5])
    h1(doc, '3. Enseignements et choix retenus')
    bullets(doc, [
        ('Instantanéité : ', 'comme Getaround, la réservation se fait en 2 minutes — d\u2019où le tunnel court et le paiement par solde prépayé.'),
        ('Confiance terrain : ', 'faiblesse des acteurs locaux → contrôleurs physiques + fiches d\u2019état photo, absent chez Turo en Afrique.'),
        ('Paiement hybride : ', 'mobile money indispensable (60 %+ des transactions au Cameroun) + carte pour la diaspora.'),
        ('Service chauffeur : ', 'différenciant fort — location avec chauffeur très demandée localement.'),
        ('Gammes tarifaires claires : ', 'Basic < 25 000 F · Standard 25–55 000 · Premium 55–90 000 · Gold > 90 000 F/jour.'),
    ])
    h1(doc, '4. Positionnement')
    para(doc, 'AutoLink Pro se positionne entre la marketplace Turo (technologie) et la conciergerie '
              'locale (contrôle terrain, chauffeurs, paiement mobile). Avantage : adaptation aux usages '
              'et moyens de paiement camerounais.')
    status_block(doc, 90, 'Ajouter 2–3 captures d\u2019écran comparatives et les chiffres de marché locaux sourcés.')
    return doc

# ─────────────────────────────────────────────────────────────────────────────
def devis_planning():
    doc = new_doc()
    cover(doc, 'ALP-DEV-004', 'DEVIS & PLANNING PRÉVISIONNEL', 'Chiffrage, jalons, diagramme de Gantt')
    h1(doc, '1. Chiffrage indicatif')
    table(doc, ['Lot', 'Contenu', 'Charge (j)', 'Coût indicatif (FCFA)'], [
        ['Cadrage & UX', 'CDC, benchmark, maquettes', '5', '500 000'],
        ['Backend API', 'Auth, rôles, véhicules, réservations, wallet, escrow', '15', '1 500 000'],
        ['Frontend web', 'SPA React, dashboards par rôle, thème sombre', '12', '1 200 000'],
        ['Paiements', 'Stripe, PayPal, mobile money, webhooks', '5', '500 000'],
        ['Refonte v2', 'Messagerie, intermédiaires, maintenance', '8', '800 000'],
        ['Mobile (Expo)', 'App React Native + build APK', '6', '600 000'],
        ['Tests & recette', 'Cahier de recette, corrections', '4', '400 000'],
        ['Déploiement & docs', 'Dokploy, DNS, documentation livrable', '5', '500 000'],
        ['TOTAL', '', '60 j', '≈ 6 000 000'],
    ], widths=[3.4, 7, 2.2, 4])
    para(doc, 'Coûts récurrents : VPS OVH ~15–30 €/mois · domaine ~10 €/an · Stripe ~1,5 % + 0,25 €/tx · '
              'PayPal ~3,4 % · SendGrid/Gmail SMTP gratuit (quota).', italic=True)
    h1(doc, '2. Planning')
    img(doc, 'gantt.png', width_cm=16, caption='Diagramme de Gantt — jalons J1 à J5 sur ~10 semaines')
    h1(doc, '3. Conditions de paiement')
    bullets(doc, [
        '40 % à la commande · 40 % au jalon J3 (refonte) · 20 % à la recette',
        'Pénalités de retard et conditions de réception : voir contrat (doc 05)',
    ])
    status_block(doc, 80, 'Faire valider le chiffrage par le client · ajuster taux journalier réel · formaliser en devis signé.')
    return doc

# ─────────────────────────────────────────────────────────────────────────────
def contrat():
    doc = new_doc()
    cover(doc, 'ALP-CTR-005', 'CONTRAT DE PRESTATION & NDA (MODÈLE)', 'Propriété intellectuelle, paiement, maintenance, recette')
    h1(doc, '1. Parties et objet')
    para(doc, 'Entre le prestataire (développement AutoLink Pro) et le client (exploitant de la '
              'plateforme). Objet : conception, développement, déploiement et documentation de la '
              'plateforme web et mobile de location de véhicules.')
    h1(doc, '2. Clauses principales')
    table(doc, ['Clause', 'Contenu'], [
        ['Propriété intellectuelle', 'Cession des droits au client à réception du solde · composants open source sous leurs licences (MIT/BSD)'],
        ['Paiement', '40 % commande · 40 % jalon J3 · 20 % recette · délai 30 j'],
        ['Maintenance', '3 mois de garantie corrective inclus · TMA au-delà (voir doc 16)'],
        ['Recette', 'Cahier de recette (doc 15) · PV signé = acceptation'],
        ['Confidentialité (NDA)', 'Données clients, secrets API, code — 5 ans'],
        ['Responsabilité', 'Obligation de moyens · plafond = montant du contrat · force majeure'],
        ['Résiliation', 'Préavis 15 j · livraison de l\u2019existant + accès'],
    ], widths=[4.5, 12])
    h1(doc, '3. Signatures')
    para(doc, '\nLe prestataire : ____________________          Le client : ____________________\n\n'
              'Fait à Douala, le ____ / ____ / 2026', center=True)
    status_block(doc, 60, 'Modèle à faire relire par un juriste · compléter noms, RCCM, conditions exactes.')
    return doc

def build():
    out = DOCS_DIR
    docs = [
        ('01_Cahier_des_charges.docx', cahier_des_charges),
        ('02_Note_de_cadrage.docx', note_cadrage),
        ('03_Benchmark.docx', benchmark),
        ('04_Devis_Planning.docx', devis_planning),
        ('05_Contrat_NDA_modele.docx', contrat),
    ]
    for name, fn in docs:
        fn().save(os.path.join(out, name))
        print('OK', name)

if __name__ == '__main__':
    build()
