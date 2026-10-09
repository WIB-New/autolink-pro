# -*- coding: utf-8 -*-
"""17 Déploiement & hébergement · 18 Exploitation (sauvegarde, supervision, maintenance)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa

def deploiement():
    doc = new_doc()
    cover(doc, 'ALP-DEP-017', 'DÉPLOIEMENT & HÉBERGEMENT', 'VPS, DNS, ports, procédure pas-à-pas')

    h1(doc, '1. Serveur')
    table(doc, ['Caractéristique', 'Valeur'], [
        ['Type', 'VPS (serveur privé virtuel) — hébergeur OVH'],
        ['IP publique', '51.195.109.156'],
        ['OS', 'Ubuntu 22.04 LTS + Docker + Dokploy'],
        ['Dimensionnement recommandé', '2 vCPU · 4 Go RAM · 40 Go SSD (VPS confort) — minimum 1 vCPU/2 Go'],
        ['Bande passante', 'illimitée OVH · pics images catalogue'],
        ['Montée en charge', 'Passage à PostgreSQL + VPS supérieur quand > ~10 k req/min'],
    ], widths=[5.5, 11])

    h1(doc, '2. Adresses et ports')
    table(doc, ['Service', 'URL / port', 'Rôle'], [
        ['Site web', 'https://autolink-pro.worldwide-international.business (443)', 'Frontend React via nginx'],
        ['API', 'https://api-autolink-pro.worldwide-international.business (443)', 'API REST Django'],
        ['Admin', 'https://api-autolink-pro…business/admin', 'Back-office Django'],
        ['Healthcheck', '/api/health/', 'Monitoring : {"status":"ok"}'],
        ['DNS A', '51.195.109.156', '2 enregistrements : autolink-pro.… et api-autolink-pro.…'],
        ['Ports publics', '80 (redirect→443) · 443 (HTTPS)', 'Seuls ports exposés'],
        ['Ports internes', 'conteneur front :80 · api :8000', 'Non exposés'],
        ['SMTP sortant', 'smtp.gmail.com:587 TLS', 'Emails OTP'],
    ], widths=[4, 7, 5.5])

    h1(doc, '3. Procédure d\u2019hébergement (zéro → production)')
    numbered(doc, [
        'Louer le VPS OVH, installer Ubuntu 22.04 + Docker + Dokploy (script officiel).',
        'DNS : créer les enregistrements A « autolink-pro » et « api-autolink-pro » → 51.195.109.156 (propagation 5–60 min).',
        'Dokploy → projet AutoLink → 2 services Docker depuis GitHub (WIB-New/autolink-pro, branche feature/refonte-v2-panels) :',
        '   · Service web : Dockerfile racine, build arg REACT_APP_API_URL=https://api-autolink-pro…business/api, domaine autolink-pro…, port 80.',
        '   · Service api : backend/Dockerfile, contexte backend, domaine api-autolink-pro…, port 8000.',
        'Variables d\u2019environnement du service api (voir doc 11 §5) : SECRET_KEY, ALLOWED_HOSTS, CORS, DATABASE_URL, COMMISSION_RATE, FRONTEND_URL, Stripe/PayPal, EMAIL_*, ADMIN_*.',
        'Volume persistant /app/data sur le service api (conserve db.sqlite3).',
        'Deploy → le conteneur migre la base, seed le super admin et la flotte, lance gunicorn.',
        'Activer le déploiement auto : webhook GitHub → Dokploy redeploy à chaque push sur la branche.',
        'Vérifier : https://api-…/api/health/ = ok → front → créer un compte → tester une recharge.',
    ])
    img(doc, 'deploiement.png', width_cm=16, caption='Pipeline CI/CD : push GitHub → Dokploy → VPS')

    h1(doc, '4. Anti-bug / bonnes pratiques')
    bullets(doc, [
        'Jamais DEBUG=True ni SECRET_KEY par défaut en prod.',
        'CORS strict : uniquement le domaine front — sinon 403 navigateur.',
        'ALLOWED_HOSTS = domaine API uniquement.',
        'Stripe : webhook pointé vers /api/payments/stripe-webhook/ avec STRIPE_WEBHOOK_SECRET — sinon solde non crédité si le client ferme l\u2019onglet.',
        'FCFA_PER_USD=600 — PayPal convertit en USD ; ajuster au taux du jour.',
        'Ne jamais supprimer le volume /app/data (SQLite = toute la base).',
        'Après un push : surveiller le build Dokploy ; en cas d\u2019échec → rollback au tag précédent.',
        'Ordre de démarrage : api d\u2019abord (le front dépend de l\u2019API au runtime).',
    ])
    status_block(doc, 92, 'Documenter les identifiants Dokploy (hors doc, coffre à secrets) · runbook incident à formaliser.')
    return doc

def exploitation():
    doc = new_doc()
    cover(doc, 'ALP-EXP-018', 'EXPLOITATION : SAUVEGARDE · SUPERVISION · MAINTENANCE', 'Procédures d\u2019exploitation')
    h1(doc, '1. Sauvegarde / restauration')
    table(doc, ['Élément', 'Procédure', 'Fréquence'], [
        ['Base SQLite', 'cp /app/data/db.sqlite3 vers backup horodaté (cron Dokploy/hôte)', 'Quotidienne'],
        ['Media (photos)', 'sync du dossier media vers stockage externe', 'Quotidienne'],
        ['Configuration', 'Variables env Dokploy exportées (hors secrets)', 'À chaque changement'],
        ['Restauration', 'Stopper api → remplacer db.sqlite3 → redeploy → vérifier /api/health/', 'À la demande'],
        ['Test de restauration', 'Restaurer sur environnement de staging, vérifier login', 'Mensuelle'],
    ], widths=[3.6, 9.4, 3.5])
    h1(doc, '2. Supervision')
    bullets(doc, [
        'Healthcheck : GET /api/health/ toutes les 5 min (UptimeRobot ou cron Dokploy) → alerte email',
        'Logs : docker logs autolink-api / autolink-web via Dokploy · erreurs 5xx surveillées',
        'Disque : alerte > 80 % (SQLite + media) · Mémoire/CPU : dashboard Dokploy',
        'Certificats : renouvellement auto Traefik/Let\u2019s Encrypt — vérifier mensuellement',
    ])
    h1(doc, '3. Plan de maintenance')
    table(doc, ['Type', 'Contenu', 'Cadence'], [
        ['Corrective', 'Bugs remontés (cahier recette KO, tickets support) — garantie 3 mois', 'À l\u2019incident'],
        ['Évolutive', 'APIs Mobile Money réelles, pénalités de retard, multi-ville', 'Trimestrielle'],
        ['Sécurité', 'Mises à jour Django/React/Docker image de base', 'Mensuelle'],
        ['Contenu', 'Bannières carrousel, gammes, textes légaux', 'À la demande'],
    ], widths=[3.6, 9.4, 3.5])
    status_block(doc, 82, 'Mettre en place l\u2019alerting (UptimeRobot) · automatiser le script de backup · SLA à définir.')
    return doc

def build():
    deploiement().save(os.path.join(DOCS_DIR, '17_Deploiement_hebergement.docx'))
    exploitation().save(os.path.join(DOCS_DIR, '18_Exploitation_maintenance.docx'))
    print('OK docs 17-18')

if __name__ == '__main__':
    build()
