# -*- coding: utf-8 -*-
"""Technique : 11 DAT · 12 Modèle de données · 13 Doc API · 14 Séquences ·
15 Sécurité & specs non fonctionnelles."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa
from project_facts import api_endpoints, models_summary, env_settings, commission_rate

def dat():
    doc = new_doc()
    cover(doc, 'ALP-DAT-011', 'DOSSIER D\u2019ARCHITECTURE TECHNIQUE', 'Stack, hébergement, services tiers')
    h1(doc, '1. Vue d\u2019ensemble')
    img(doc, 'architecture.png', width_cm=16.5, caption='Architecture de production')
    h1(doc, '2. Stack technique')
    table(doc, ['Couche', 'Technologie', 'Version'], [
        ['Frontend web', 'React + TailwindCSS + Recharts + React Router', '18 / 3.3'],
        ['Backend', 'Django + Django REST Framework + Gunicorn', '4.2 / 21.2'],
        ['Auth', 'SimpleJWT (access + refresh) + Google OAuth + OTP email', '5.3'],
        ['Base de données', 'SQLite (volume /app/data) — PostgreSQL via DATABASE_URL', '—'],
        ['Mobile', 'Expo React Native · build APK via EAS', 'SDK 51+'],
        ['Conteneurisation', 'Docker — 2 images : front (nginx) + api (gunicorn)', '—'],
        ['CI/CD', 'Dokploy — webhook GitHub → build → déploiement', '—'],
    ], widths=[3.6, 10, 2.8])
    h1(doc, '3. Hébergement')
    table(doc, ['Élément', 'Valeur'], [
        ['Type', 'VPS OVH (virtualisation KVM, Linux Ubuntu 22.04)'],
        ['IP publique', '51.195.109.156'],
        ['Domaine frontend', 'https://autolink-pro.worldwide-international.business → conteneur nginx :80'],
        ['Domaine API', 'https://api-autolink-pro.worldwide-international.business → gunicorn :8000'],
        ['Admin', 'https://api-autolink-pro.worldwide-international.business/admin'],
        ['TLS', 'Let\u2019s Encrypt via Traefik (Dokploy), renouvellement auto'],
        ['Persistance', 'Volume Docker autolink-db → /app/data/db.sqlite3'],
    ], widths=[4.2, 12.3])
    h1(doc, '4. Services tiers')
    table(doc, ['Service', 'Usage', 'Mode'], [
        ['Stripe', 'Checkout recharge + paiement réservation + webhook', 'live (clés env)'],
        ['PayPal', 'Orders + capture + retour', 'live/sandbox selon env'],
        ['SMTP Gmail', 'Codes OTP, notifications email', 'port 587 TLS'],
        ['Unsplash CDN', 'Photos catalogue et marketing', 'public'],
        ['MTN/Orange/SenBid/PayBid', 'Recharges mobiles (crédit direct — APIs opérateurs à brancher)', 'préparé'],
    ], widths=[3.6, 9.2, 3.7])
    h1(doc, '5. Variables d\u2019environnement (backend)')
    para(doc, 'Extraites automatiquement de backend/config/settings.py à la génération.', italic=True, size=9)
    desc = {
        'SECRET_KEY': 'Clé de signature Django', 'DEBUG': 'False en prod',
        'ALLOWED_HOSTS': 'Domaines servis (api-…, 127.0.0.1)', 'CORS_ALLOWED_ORIGINS': 'Domaine frontend autorisé',
        'DATABASE_URL': 'sqlite:////app/data/db.sqlite3 ou postgres://', 'COMMISSION_RATE': 'Commission plateforme (ex. 0.50)',
        'FRONTEND_URL': 'Redirections retour Stripe/PayPal', 'FCFA_PER_USD': 'Taux conversion PayPal (600)',
        'STRIPE_API_KEY': 'Paiements Stripe live', 'STRIPE_WEBHOOK_SECRET': 'Signature webhook Stripe',
        'PAYPAL_CLIENT_ID': 'Paiements PayPal', 'PAYPAL_CLIENT_SECRET': 'Paiements PayPal', 'PAYPAL_MODE': 'live ou sandbox',
        'ADMIN_USERNAME': 'Super admin seedé', 'ADMIN_EMAIL': 'Super admin seedé', 'ADMIN_PASSWORD': 'Super admin seedé',
    }
    env_rows = [[var, desc.get(var, '—')] for _, var, _ in env_settings()]
    email_rows = [['EMAIL_HOST / PORT / USER / PASSWORD / TLS', 'SMTP Gmail pour OTP et notifications']]
    table(doc, ['Variable', 'Rôle'], env_rows + email_rows, widths=[5.8, 10.7], size=8.5)
    status_block(doc, 92, 'Documenter la procédure de bascule PostgreSQL quand le volume le justifiera · schéma réseau détaillé.')
    return doc

def modele_donnees():
    doc = new_doc()
    cover(doc, 'ALP-MDD-012', 'MODÉLISATION DES DONNÉES', 'MCD · dictionnaire de données')
    img(doc, 'mcd.png', width_cm=16.5, caption='Modèle conceptuel de données — entités principales')
    h1(doc, '1. Dictionnaire de données')
    h3(doc, 'users.User')
    table(doc, ['Champ', 'Type', 'Description'], [
        ['email', 'varchar', 'Identifiant unique (login)'],
        ['role', 'enum', 'CLIENT · OWNER · INTERMEDIARY · CONTROLLER · ADMIN'],
        ['balance', 'decimal', 'Solde AutoLink en FCFA'],
        ['phone', 'varchar', 'Téléphone (+237 …)'],
        ['referral_code', 'varchar', 'Code de parrainage (intermédiaires)'],
    ], widths=[4, 2.5, 10])
    h3(doc, 'vehicles.Vehicle')
    table(doc, ['Champ', 'Type', 'Description'], [
        ['owner', 'FK User', 'Propriétaire'],
        ['brand/model/year/plate', '—', 'Identification (plaque unique)'],
        ['tier', 'enum', 'BASIC · STANDARD · PREMIUM · GOLD'],
        ['mode', 'enum', 'confié / domicile'],
        ['status', 'enum', 'pending · approved · suspended · rented'],
        ['daily_rate / computed_rate', 'decimal', 'Tarif base + calculé'],
        ['deposit_amount', 'decimal', 'Caution'],
        ['condition_score', 'int 0–100', 'Score d\u2019inspection → bonus tarifaire'],
        ['insurance_type / expiry', '—', 'Assurance + échéance'],
        ['km_included_per_day', 'int', 'Kilométrage inclus'],
        ['city', 'varchar', 'Douala par défaut'],
    ], widths=[5.5, 2.5, 8.5])
    h3(doc, 'bookings.Booking')
    table(doc, ['Champ', 'Type', 'Description'], [
        ['client / vehicle / driver', 'FK', 'Parties'],
        ['intermediary', 'FK User', 'Parrain éventuel + intermediary_commission'],
        ['start_date / end_date / days', '—', 'Période'],
        ['subtotal', 'decimal', 'Montant HT commission'],
        ['commission_amount / owner_amount', 'decimal', 'Répartition AutoLink / propriétaire'],
        ['deposit_amount', 'decimal', 'Caution séquestrée'],
        ['status', 'enum', 'pending · confirmed · active · completed · cancelled'],
        ['driver_type', 'enum', 'none · internal (service chauffeur)'],
        ['dispute_reason / opened_at', '—', 'Litige'],
        ['client_rating / client_review', '1–5', 'Notation post-location'],
    ], widths=[5.5, 2.5, 8.5])
    h3(doc, 'payments.*')
    table(doc, ['Entité', 'Champs clés'], [
        ['Payment', 'booking · amount · commission · owner_payout · method · status · escrow_status · deposit_status'],
        ['Payout', 'recipient · amount · method · status · processed_at'],
        ['WalletTransaction', 'user · kind (topup/debit/refund) · method · amount · balance_after · reference · status · provider_ref'],
    ], widths=[4, 12.5])
    h3(doc, 'Autres entités')
    bullets(doc, [
        'vehicles.VehiclePhoto / VehicleAvailability — photos uploadées, périodes bloquées',
        'vehicles.MaintenanceRequest — tickets maintenance (statut, description)',
        'inspections.VehicleInspection — fiches contrôleur (score, photos, litige)',
        'users.Message / Notification — messagerie interne, alertes',
        'drivers.DriverApplication / DriverProfile / ServiceRequest — service chauffeur',
        'users.PlatformSettings — paramètres plateforme éditables par l\u2019admin',
    ])
    h1(doc, '2. Inventaire automatique des modèles')
    para(doc, 'Extrait automatiquement de backend/apps/*/models.py à la génération — reflète le code réel.', italic=True, size=9)
    inv = [[name, str(len(fields)), ', '.join(f for f, _ in fields[:12]) + ('…' if len(fields) > 12 else '')]
           for name, fields in models_summary().items()]
    table(doc, ['Modèle', 'Nb champs', 'Champs'], inv, widths=[4.6, 1.6, 10.3], size=8)
    status_block(doc, 90, 'Générer le MLD complet avec types SQL si migration PostgreSQL · export graphique du schéma DB.')
    return doc

def api_doc():
    doc = new_doc(landscape=True)
    cover(doc, 'ALP-API-013', 'DOCUMENTATION DE L\u2019API REST', 'Endpoints, formats, codes — base /api/')
    para(doc, 'Base URL : https://api-autolink-pro.worldwide-international.business/api — '
              'Auth : Bearer JWT (POST /auth/token/ ou /users/login/). '
              'Erreurs : 400 validation · 401 non authentifié · 403 rôle insuffisant · 404 absent · 5xx serveur.',
         italic=True, size=9.5)
    h1(doc, 'Auth & utilisateurs')
    table(doc, ['Méthode', 'Endpoint', 'Rôle', 'Description'], [
        ['POST', '/auth/token/', 'public', 'Login JWT (email + password)'],
        ['POST', '/auth/token/refresh/', 'public', 'Renouveler l\u2019access token'],
        ['POST', '/users/register/', 'public', 'Inscription (rôle CLIENT)'],
        ['POST', '/users/login/', 'public', 'Login → { user, access, refresh }'],
        ['POST', '/users/google/', 'public', 'Connexion/inscription Google'],
        ['POST', '/users/otp/request/', 'public', 'Envoyer le code OTP email'],
        ['POST', '/users/otp/verify/', 'public', 'Vérifier le code → session'],
        ['GET/PATCH', '/users/me/', 'auth', 'Profil courant'],
        ['GET', '/users/', 'ADMIN', 'Tous les comptes'],
        ['PATCH', '/users/{id}/', 'ADMIN', 'Activer / suspendre / rôle'],
        ['GET', '/users/notifications/', 'auth', 'Notifications + compteur non lus'],
        ['POST', '/users/notifications/read/', 'auth', 'Tout marquer lu'],
        ['GET/POST', '/users/messages/', 'auth', 'Messagerie interne (?peer=)'],
        ['GET', '/users/messages/threads/', 'auth', 'Liste des conversations'],
        ['GET', '/users/messages/contacts/', 'auth', 'Contacts autorisés (support)'],
        ['GET/PATCH', '/users/settings/', 'ADMIN', 'Paramètres plateforme'],
        ['GET', '/users/public-config/', 'public', 'Config publique (commission, contacts)'],
    ], widths=[2.2, 6.5, 2.4, 10.5], size=8.5)
    h1(doc, 'Véhicules · réservations · paiements')
    table(doc, ['Méthode', 'Endpoint', 'Rôle', 'Description'], [
        ['GET', '/vehicles/', 'public', 'Catalogue (+ ?tier= ?city= ?type=)'],
        ['POST', '/vehicles/', 'OWNER', 'Publier un véhicule'],
        ['PATCH', '/vehicles/{id}/', 'ADMIN', 'Approuver / suspendre'],
        ['GET', '/vehicles/{id}/availability/', 'public', 'Périodes bloquées'],
        ['GET/POST', '/vehicles/maintenance/', 'OWNER/ADMIN', 'Tickets maintenance'],
        ['GET/POST', '/bookings/', 'auth', 'Réservations filtrées par rôle / créer'],
        ['PATCH', '/bookings/{id}/', 'auth', 'Statut (client : annuler · admin : tout)'],
        ['POST', '/bookings/{id}/dispute/', 'auth', 'Ouvrir un litige'],
        ['POST', '/bookings/{id}/resolve-dispute/', 'ADMIN', 'Trancher le litige'],
        ['GET', '/bookings/stats/', 'ADMIN/CONTROLLER', 'Statistiques globales'],
        ['GET', '/payments/wallet/', 'auth', 'Solde + transactions'],
        ['POST', '/payments/wallet/topup/', 'auth', 'Recharger (mtn/orange/senbid/paybid/paypal/stripe)'],
        ['GET/POST', '/payments/payments/', 'auth', 'Paiements de réservation'],
        ['GET', '/payments/payouts/', 'auth', 'Versements'],
        ['GET', '/payments/stripe-return/', 'Stripe', 'Retour client + crédit/confirm'],
        ['GET', '/payments/paypal-return/', 'PayPal', 'Capture + crédit/confirm'],
        ['POST', '/payments/stripe-webhook/', 'Stripe', 'Confirmation serveur'],
        ['GET/POST', '/drivers/applications/ · /profiles/ · /service-requests/', 'auth', 'Candidatures + service chauffeur'],
        ['GET/POST', '/inspections/', 'CONTROLLER/ADMIN', 'Fiches d\u2019état des lieux'],
        ['GET', '/health/', 'public', '{ "status": "ok" }'],
    ], widths=[2.2, 7.5, 3.2, 8.8], size=8.5)
    h1(doc, 'Inventaire des routes — extrait automatiquement du code')
    eps = api_endpoints()
    table(doc, ['App', 'Route', 'Vue'],
          [[ep['app'].upper(), f"/api/{ep['path']}", ep['kind']] for ep in eps],
          widths=[2.6, 12.2, 6.8], size=8)
    para(doc, f'{len(eps)} routes déclarées dans les urls.py à la génération du document — régénéré à chaque mise à jour.', italic=True, size=8.5)
    h1(doc, 'Exemples')
    h3(doc, 'Login')
    para(doc, 'curl -X POST …/api/users/login/ -d \'{"email":"a@b.cm","password":"…"}\'\n'
              '→ 200 { "user": {…}, "access": "eyJ…", "refresh": "eyJ…" }', size=9)
    h3(doc, 'Recharger le solde')
    para(doc, 'POST /api/payments/wallet/topup/ { "amount": 25000, "method": "mtn", "phone": "+2376…" }\n'
              '→ 201 { "balance": 25000.0, "transaction": { "reference": "TOP-…" } }', size=9)
    status_block(doc, 95, 'Exporter une collection Postman · générer le schéma OpenAPI (drf-spectacular) si besoin formel.')
    return doc

def sequences():
    doc = new_doc()
    cover(doc, 'ALP-SEQ-014', 'DIAGRAMMES DE SÉQUENCE', 'Flux critiques : réservation · paiement')
    h1(doc, '1. Réservation d\u2019un véhicule')
    img(doc, 'seq_reservation.png', width_cm=16)
    h1(doc, '2. Recharge du solde via Stripe')
    img(doc, 'seq_paiement.png', width_cm=16)
    para(doc, 'Le même pattern s\u2019applique à PayPal : create_order → approval_url → '
              '/paypal-return/ → capture → crédit du WalletTransaction pending.', italic=True)
    status_block(doc, 95, 'Ajouter les séquences litige/escrow et payout propriétaire.')
    return doc

def securite_nf():
    doc = new_doc()
    cover(doc, 'ALP-SEC-015', 'SÉCURITÉ & SPÉCIFICATIONS NON FONCTIONNELLES', 'Auth, rôles, données, performance')
    h1(doc, '1. Sécurité applicative')
    table(doc, ['Domaine', 'Mesure'], [
        ['Authentification', 'JWT SimpleJWT (access court + refresh) · OTP email · Google OAuth'],
        ['Autorisation', 'Rôles stricts côté API (permissions par vue) · querysets filtrés par user/rôle'],
        ['Paiements', 'Jamais de PAN en base — Stripe/PayPal hébergent · webhook signé (STRIPE_WEBHOOK_SECRET) · vérification serveur au retour'],
        ['Transport', 'HTTPS obligatoire (Let\u2019s Encrypt) · HSTS via Traefik'],
        ['HTTP', 'Headers sécurité nginx · 404 sur chemins sensibles (.env, .git…)'],
        ['CORS', 'Whitelist stricte : domaine prod + localhost dev'],
        ['Secrets', 'Variables d\u2019environnement Dokploy uniquement — jamais en repo'],
        ['Escrow', 'Caution HELD → libérée/remboursée après état des lieux · transitions atomiques (select_for_update)'],
        ['Injection/XSS', 'ORM Django + DRF serializers · React échappe par défaut'],
    ], widths=[3.8, 12.7])
    h1(doc, '2. Données personnelles')
    bullets(doc, [
        'Collecte minimale : identité, email, téléphone — pas de données bancaires',
        'Droit d\u2019accès/suppression via profil + admin · loi camerounaise 2010/012',
        'Logs sans secrets · backups chiffrés recommandés',
    ])
    h1(doc, '3. Non fonctionnel')
    table(doc, ['Critère', 'Cible', 'Mesuré'], [
        ['Temps de réponse API', '< 300 ms p95', 'à mesurer'],
        ['Disponibilité', '≥ 99 %', 'Dokploy restart + healthcheck /api/health/'],
        ['Capacité', 'SQLite OK < ~10 k req/min — migration PostgreSQL prête', 'DATABASE_URL'],
        ['Compatibilité', 'Chrome/Firefox/Safari récents · Android via Expo Go/APK', 'tests recette'],
        ['Accessibilité', 'Contrastes AA, navigation clavier', 'partiel'],
        ['SEO landing', 'meta description/keywords, FR', 'fait'],
    ], widths=[4.5, 8.5, 3.5])
    status_block(doc, 85, 'Audit OWASP complet · tests de charge (locust/k6) · registre de traitement données formalisé.')
    return doc

def build():
    out = DOCS_DIR
    docs = [
        ('11_Architecture_technique_DAT.docx', dat),
        ('12_Modele_de_donnees.docx', modele_donnees),
        ('13_Documentation_API.docx', api_doc),
        ('14_Diagrammes_sequence.docx', sequences),
        ('15_Securite_non_fonctionnel.docx', securite_nf),
    ]
    for name, fn in docs:
        fn().save(os.path.join(out, name))
        print('OK', name)

if __name__ == '__main__':
    build()
