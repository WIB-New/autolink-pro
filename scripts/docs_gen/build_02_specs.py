# -*- coding: utf-8 -*-
"""Spécifications : 06 SFD · 07 User stories · 08 Cas d'utilisation ·
09 Règles de gestion · 10 UX/UI."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa
from project_facts import user_roles, commission_rate

COM = f'{commission_rate() * 100:g}' if commission_rate() is not None else '50'
ROLES = ' · '.join(v for _, v, _ in user_roles()) or 'CLIENT · OWNER · INTERMEDIARY · CONTROLLER · ADMIN'

def sfd():
    doc = new_doc()
    cover(doc, 'ALP-SFD-006', 'SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES', 'Modules applicatifs — version en production')

    h1(doc, '1. Authentification & utilisateurs')
    table(doc, ['Fonction', 'Description', 'Statut'], [
        ['Inscription', 'Email + mot de passe + téléphone ; rôle CLIENT par défaut', 'Fait'],
        ['Connexion classique', 'POST /api/users/login/ → JWT access + refresh', 'Fait'],
        ['Google OAuth', 'POST /api/users/google/ — création de compte si absent', 'Fait'],
        ['Login sans mot de passe', 'Code OTP 6 chiffres par email (smtp Gmail) — /users/otp/request + verify', 'Fait'],
        ['Profil', 'GET/PATCH /api/users/me — nom, téléphone, photo', 'Fait'],
        ['Gestion des rôles', f'{ROLES} — attribués par l\u2019admin', 'Fait'],
        ['Suspension', 'PATCH /api/users/{id} (admin) — activer/suspendre', 'Fait'],
    ], widths=[3.8, 9.2, 2])

    h1(doc, '2. Catalogue de véhicules')
    table(doc, ['Fonction', 'Description', 'Statut'], [
        ['Recherche', 'GET /api/vehicles + filtres : gamme (tier), ville, type de location', 'Fait'],
        ['Gammes tarifaires', 'Basic < 25 000 · Standard 25–55 000 · Premium 55–90 000 · Gold > 90 000 F/j', 'Fait'],
        ['Types de location', '3 h courses · 8 h demi-journée · 24 h · interurbain Douala ↔ Yaoundé', 'Fait'],
        ['Fiche véhicule', 'Photos, tarif calculé, caution, km inclus, assurance, sièges, carburant', 'Fait'],
        ['Publication propriétaire', 'POST /api/vehicles — modes « confié » / « domicile » — statut pending puis approved', 'Fait'],
        ['Modération', 'PATCH /api/vehicles/{id} — approuver/suspendre (admin)', 'Fait'],
        ['Disponibilités', 'GET /api/vehicles/{id}/availability — périodes bloquées', 'Fait'],
    ], widths=[3.8, 9.2, 2])

    h1(doc, '3. Réservation & tarification')
    table(doc, ['Fonction', 'Description', 'Statut'], [
        ['Création', 'POST /api/bookings — dates, adresses, driver_type (none/internal)', 'Fait'],
        ['Tarif auto', 'Base propriétaire + ancienneté (+5 000 F ≤ 2 ans, +2 000 F ≤ 5 ans) + assurance premium (+2 000 F) + bonus état (jusqu\u2019à +5 000 F)', 'Fait'],
        ['Répartition', f'commission_amount (COMMISSION_RATE, {COM} %) · owner_amount · caution deposit_amount', 'Fait'],
        ['Statuts', 'pending → confirmed → active → completed · cancelled', 'Fait'],
        ['Annulation', 'Client : annuler · Admin : tous statuts · remboursement caution si escrow', 'Fait'],
        ['Litige', 'POST /bookings/{id}/dispute + resolve-dispute (admin)', 'Fait'],
        ['Notation', 'client_rating + review 1–5 après location', 'Fait'],
        ['Remise en dispo', 'Véhicule redevient « approved » dès fin de location', 'Fait'],
    ], widths=[3.8, 9.2, 2])

    h1(doc, '4. Paiements & portefeuille')
    table(doc, ['Fonction', 'Description', 'Statut'], [
        ['Solde AutoLink', 'GET /api/payments/wallet — solde + 50 dernières transactions', 'Fait'],
        ['Recharge mobile', 'MTN MoMo, Orange Money, SenBid, PayBid — crédit direct (APIs opérateurs à brancher)', 'Fait*'],
        ['Recharge carte', 'Stripe Checkout + PayPal — retour serveur + webhook Stripe', 'Fait'],
        ['Escrow caution', 'HELD → RELEASED/REFUNDED — caution restituée après état des lieux', 'Fait'],
        ['Payouts', 'GET /api/payments/payouts — versements propriétaires/intermédiaires', 'Fait'],
        ['Paiement réservation', 'POST /api/payments/payments — débit solde ou externe', 'Fait'],
    ], widths=[3.8, 9.2, 2])
    para(doc, '* Crédit direct côté applicatif en attendant les credentials opérateurs.', italic=True, size=9)

    h1(doc, '5. États des lieux (check-in / check-out)')
    bullets(doc, [
        'Fiche d\u2019inspection entrée/sortie par contrôleur : photos, score d\u2019état 0–100, remarques',
        'GET/POST /api/inspections — rôle CONTROLLER + ADMIN',
        'Le score d\u2019état alimente le bonus tarifaire et les litiges caution',
    ])

    h1(doc, '6. Notifications & messagerie')
    bullets(doc, [
        'Notifications métier : réservation, paiement, litige — polling 30 s, badge non lus',
        'Messagerie interne : /api/users/messages (threads, contacts, support)',
        'Emails transactionnels : OTP, confirmations (SMTP Gmail configurable)',
    ])

    h1(doc, '7. Back-office (ADMIN)')
    bullets(doc, [
        'Utilisateurs : liste, rôles, suspension · Véhicules : modération · Finance : commissions, CA',
        'Chauffeurs : service_requests propriétaires · Agents affiliés : referral_code',
        'Maintenance : tickets · Inspections · Paramètres plateforme (commission, contacts)',
    ])
    status_block(doc, 92, 'Brancher les APIs Mobile Money · préciser règles pénalités de retard non encore implémentées.')
    return doc

def user_stories():
    doc = new_doc()
    cover(doc, 'ALP-USB-007', 'USER STORIES & BACKLOG PRODUIT', 'Critères d\u2019acceptation par rôle')
    h1(doc, '1. Client')
    table(doc, ['ID', 'User story', 'Critère d\u2019acceptation', 'Priorité', 'Statut'], [
        ['US-C01', 'En tant que client, je m\u2019inscris avec mon email', 'Compte créé, rôle CLIENT, connexion immédiate', 'Must', 'Fait'],
        ['US-C02', '…je me connecte sans mot de passe via code email', 'OTP 6 chiffres reçu < 2 min, session ouverte', 'Must', 'Fait'],
        ['US-C03', '…je cherche un véhicule par gamme et type de location', 'Liste filtrée < 2 s, prix affichés', 'Must', 'Fait'],
        ['US-C04', '…je réserve avec dates et adresses', 'Réservation pending, montant détaillé', 'Must', 'Fait'],
        ['US-C05', '…je recharge mon solde en mobile money ou carte', 'Solde crédité, transaction tracée', 'Must', 'Fait'],
        ['US-C06', '…je consulte mes stats de dépenses', 'Page /client/stats : KPIs + graphiques réels', 'Should', 'Fait'],
        ['US-C07', '…j\u2019échange avec le support en messagerie', 'Messages reçus/envoyés, badge non lu', 'Should', 'Fait'],
        ['US-C08', '…je note ma location après retour', 'Note 1–5 + avis enregistrés', 'Could', 'Fait'],
    ], widths=[1.6, 5.8, 5.8, 1.7, 1.6])
    h1(doc, '2. Propriétaire')
    table(doc, ['ID', 'User story', 'Critère d\u2019acceptation', 'Priorité', 'Statut'], [
        ['US-O01', 'En tant que propriétaire, je publie mon véhicule', 'Formulaire complet, statut pending → approved', 'Must', 'Fait'],
        ['US-O02', '…je choisis le mode confié ou domicile', 'Mode enregistré, tarif calculé affiché', 'Must', 'Fait'],
        ['US-O03', '…je suis mes revenus (75→50 % selon commission)', 'Dashboard revenus, payouts listés', 'Must', 'Fait'],
        ['US-O04', '…je demande un chauffeur de service', 'Ticket créé (driver service-requests)', 'Should', 'Fait'],
        ['US-O05', '…je déclare une maintenance', 'Ticket maintenance, suivi statut', 'Should', 'Fait'],
    ], widths=[1.6, 5.8, 5.8, 1.7, 1.6])
    h1(doc, '3. Admin, contrôleur, intermédiaire')
    table(doc, ['ID', 'User story', 'Critère d\u2019acceptation', 'Priorité', 'Statut'], [
        ['US-A01', 'En tant qu\u2019admin, je gère utilisateurs et rôles', 'PATCH rôle/suspension effectif immédiat', 'Must', 'Fait'],
        ['US-A02', '…je pilote la finance', 'Commissions, CA, payouts visibles', 'Must', 'Fait'],
        ['US-A03', '…je paramètre la plateforme', 'Commission, contacts modifiables', 'Should', 'Fait'],
        ['US-K01', 'En tant que contrôleur, je remplis l\u2019état des lieux', 'Fiche + photos + score enregistrés', 'Must', 'Fait'],
        ['US-I01', 'En tant qu\u2019intermédiaire, je parraine des clients', 'Commission calculée sur leurs locations', 'Should', 'Fait'],
    ], widths=[1.6, 5.8, 5.8, 1.7, 1.6])
    status_block(doc, 90, 'Poker planning pour chiffrer les stories Could/Won\u2019t restantes · validation PO.')
    return doc

def cas_utilisation():
    doc = new_doc()
    cover(doc, 'ALP-UC-008', 'CAS D\u2019UTILISATION · PERSONAS · PARCOURS', 'Diagramme UML + profils type')
    img(doc, 'usecase.png', width_cm=16, caption='Diagramme de cas d\u2019utilisation — 5 acteurs')
    h1(doc, '1. Personas')
    table(doc, ['Persona', 'Profil', 'Objectif', 'Frustration résolue'], [
        ['Mariam, 34 ans', 'Commerçante à Douala, Android, Orange Money', 'Louer un SUV le week-end', 'Pas de carte bancaire, peur des arnaques'],
        ['Steve, 41 ans', 'Propriétaire de 3 véhicules', 'Revenus passifs, véhicule gardé', 'Véhicule abîmé sans recours → inspections'],
        ['Franck, 28 ans', 'Apporteur d\u2019affaires', 'Commission sur ses clients', 'Suivi informel → code de parrainage'],
        ['Aïcha, 45 ans', 'Cadre, diaspora', 'Réserver pour sa famille depuis l\u2019étranger', 'PayPal accepté, état des lieux photo'],
    ], widths=[3, 5, 4.2, 4.3])
    h1(doc, '2. Parcours utilisateur — réservation type')
    numbered(doc, [
        'Landing → inscription OTP (2 min)',
        'Dashboard → recherche gamme « Standard » + type « 24 heures »',
        'Fiche véhicule → dates → adresses → récapitulatif tarifaire',
        'Paiement : solde si suffisant, sinon recharge MTN/Stripe',
        'Confirmation + notification propriétaire → état des lieux contrôleur',
        'Retour : check-out, caution libérée, notation',
    ])
    status_block(doc, 88, 'Ajouter des photos de profils réels après entretiens utilisateurs.')
    return doc

def regles_gestion():
    doc = new_doc()
    cover(doc, 'ALP-RG-009', 'RÈGLES DE GESTION MÉTIER', 'Tarification, commission, caution, éligibilité')
    h1(doc, '1. Tarification')
    table(doc, ['Règle', 'Formule / valeur'], [
        ['Tarif de base', 'daily_rate défini par le propriétaire'],
        ['Bonus ancienneté', '≤ 2 ans : +5 000 F/j · ≤ 5 ans : +2 000 F/j'],
        ['Bonus assurance', 'Premium ou Tous risques : +2 000 F/j'],
        ['Bonus état', 'Jusqu\u2019à +5 000 F/j selon condition_score (0–100)'],
        ['Gammes', 'Basic < 25 000 · Standard 25–55 000 · Premium 55–90 000 · Gold > 90 000'],
        ['Commission AutoLink', f'COMMISSION_RATE × subtotal — actuellement {COM} % (env var)'],
        ['Part propriétaire', 'owner_amount = subtotal − commission'],
        ['Commission intermédiaire', 'intermediary_commission sur les clients parrainés'],
        ['Caution', 'deposit_amount par véhicule — séquestrée (escrow HELD)'],
    ], widths=[5, 11.5])
    h1(doc, '2. Éligibilité & contraintes')
    bullets(doc, [
        'Inscription : email unique vérifié · rôle par défaut CLIENT',
        'Réservation : dates cohérentes (end > start), véhicule « approved » et disponible',
        'Paiement : montant ≥ 500 FCFA par recharge · conversion PayPal 600 F/USD (FCFA_PER_USD)',
        'Litige : dispute_reason obligatoire · arbitrage admin',
        'Notation : entier 1–5, une fois par location terminée',
    ])
    h1(doc, '3. Cycle de vie réservation')
    para(doc, 'pending → confirmed (paiement reçu) → active (remise des clés / état d\u2019entrée) '
              '→ completed (retour + état de sortie). Annulable tant que pending par le client ; '
              'tout statut par l\u2019admin.', center=True, italic=True)
    callout(doc, 'Kilométrage inclus par jour (km_included_per_day) et franchise caution stockés par véhicule ; '
                 'les pénalités de retard ne sont pas encore automatisées — traitées manuellement via litige.',
            bold_prefix='À SAVOIR')
    status_block(doc, 85, 'Automatiser pénalités retard · plafonds kilométriques facturés · validation métier des taux.')
    return doc

def ux():
    doc = new_doc()
    cover(doc, 'ALP-UX-010', 'CONCEPTION UX/UI', 'Arborescence, wireframes, design system')
    h1(doc, '1. Arborescence')
    img(doc, 'arborescence.png', width_cm=16, caption='Arborescence des écrans — espace client et routes par rôle')
    h1(doc, '2. Design system')
    table(doc, ['Élément', 'Choix'], [
        ['Couleurs', 'Primary teal #0D9488 · accent orange #F97316 · navy #0F172A · variantes par rôle (sky, emerald, amber, purple, violet)'],
        ['Typographie', 'Inter Variable (embarquée @fontsource — plus de dépendance Google Fonts) · graisses 300–900'],
        ['Composants', 'Cards arrondies 2xl, badges de statut, sidebar par rôle, carrousel marketing, modales'],
        ['Thème', 'Clair/sombre (ThemeContext, toggle header)'],
        ['Iconographie', 'Lucide-react'],
        ['Graphiques', 'Recharts (barres, donuts, lignes)'],
        ['Responsive', 'Mobile-first Tailwind · breakpoints sm/md/lg · sidebar drawer mobile'],
    ], widths=[3.5, 13])
    h1(doc, '3. Principes UX')
    bullets(doc, [
        'Tunnel de réservation < 5 écrans · CTA primaires toujours visibles',
        'Feedback immédiat : badges de statut, bannières de retour paiement, loaders',
        'Identité visuelle par rôle : sidebar colorée distincte (sky=client, emerald=owner…)',
        'Accessibilité : contrastes AA, focus visibles, libellés en français',
    ])
    status_block(doc, 80, 'Insérer les exports Figma (maquettes HD) · lien prototype cliquable à ajouter.')
    return doc

def build():
    out = DOCS_DIR
    docs = [
        ('06_Specifications_fonctionnelles.docx', sfd),
        ('07_User_stories_backlog.docx', user_stories),
        ('08_Cas_utilisation_personas.docx', cas_utilisation),
        ('09_Regles_de_gestion.docx', regles_gestion),
        ('10_UX_Design_system.docx', ux),
    ]
    for name, fn in docs:
        fn().save(os.path.join(out, name))
        print('OK', name)

if __name__ == '__main__':
    build()
