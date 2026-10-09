# -*- coding: utf-8 -*-
"""16 Cahier de recette / plan de test — destiné à un testeur tiers."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa

def cahier_recette():
    doc = new_doc(landscape=True)
    cover(doc, 'ALP-CRT-016', 'CAHIER DE RECETTE / PLAN DE TEST',
          'Procédure complète pour un testeur tiers — sait-on que ça passe ?')

    h1(doc, '1. Objet')
    para(doc, 'Ce document permet à une personne tierce, sans connaissance du projet, de vérifier '
              'que l\u2019application AutoLink Pro fonctionne correctement. Chaque test possède un '
              'identifiant, des étapes, un résultat attendu et une colonne à remplir.')

    h1(doc, '2. Environnement de test')
    table(doc, ['Élément', 'Valeur'], [
        ['Site web', 'https://autolink-pro.worldwide-international.business'],
        ['API', 'https://api-autolink-pro.worldwide-international.business/api'],
        ['Admin Django', 'https://api-autolink-pro.worldwide-international.business/admin'],
        ['Navigateurs', 'Chrome ou Firefox à jour · mode desktop + mobile (F12 → device toolbar)'],
        ['Comptes nécessaires', '1 compte client à créer soi-même (inscription réelle) · comptes admin/propriétaire fournis par l\u2019équipe'],
        ['Moyens de test', 'Petites recharges réelles possibles (≥ 500 FCFA) — Stripe en mode test si carte 4242 4242 4242 4242 configurée'],
    ], widths=[4, 20])

    h1(doc, '3. Mode d\u2019emploi du testeur')
    numbered(doc, [
        'Exécuter les tests dans l\u2019ordre ; noter « OK », « KO » ou « N/A » dans la colonne Statut.',
        'Pour chaque KO : capture d\u2019écran + message d\u2019erreur + console navigateur (F12) copiée dans la colonne « Résultat obtenu ».',
        'Ne pas utiliser de vraies données personnelles sensibles ; emails de test type testeur+xxx@gmail.com acceptés.',
        'Critère de recette : 0 KO bloquant (tests marqués ■) et ≥ 95 % de réussite globale → PV de recette signé.',
    ])
    callout(doc, 'En cas de site inaccessible : vérifier https://api-autolink-pro.worldwide-international.business/api/health/ '
                 '(doit répondre {"status":"ok"}). Si l\u2019API est KO, tout le reste est bloqué — le signaler immédiatement.',
            bold_prefix='BLOQUANT', fill='FEE2E2')

    def tests_table(title, rows):
        h1(doc, title)
        table(doc, ['ID', 'Scénario / étapes', 'Résultat attendu', 'Résultat obtenu', 'Statut'],
              rows, widths=[1.6, 11.5, 7.5, 3.4, 1.6], size=8.5)

    tests_table('4. Accès & page d\u2019accueil', [
        ['■ T-01', 'Ouvrir https://autolink-pro.worldwide-international.business', 'Landing affichée, HTTPS (cadenas), titre « AutoLink Pro »', '', ''],
        ['T-02', 'Scroller la landing : sections, gammes, footer', 'Contenu complet, images chargées, liens valides', '', ''],
        ['T-03', 'Pop-up promo à l\u2019ouverture', 'Visible, titre lisible non tronqué, se ferme', '', ''],
        ['T-04', 'Tester http://… (sans s)', 'Redirection HTTPS automatique', '', ''],
    ])

    tests_table('5. Inscription & connexion', [
        ['■ T-10', 'S\u2019inscrire : /register — email valide + mot de passe', 'Compte créé, rôle CLIENT, redirection dashboard', '', ''],
        ['T-11', 'Email déjà utilisé ou invalide', 'Message d\u2019erreur clair, pas de crash', '', ''],
        ['■ T-12', 'Se connecter : /login — email + mot de passe', 'Dashboard affiché, prénom affiché', '', ''],
        ['T-13', 'Mauvais mot de passe', 'Erreur explicite, pas de boucle', '', ''],
        ['T-14', 'Connexion par code email (OTP)', 'Code 6 chiffres reçu < 2 min → connexion', '', ''],
        ['T-15', 'Bouton Google', 'Fenêtre Google, compte créé/ouvert', '', ''],
        ['T-16', 'Se déconnecter puis revenir sur /client/dashboard', 'Redirection vers /login', '', ''],
    ])

    tests_table('6. Dashboard client', [
        ['T-20', 'Ouvrir /client/dashboard', 'Bannière bienvenue + carrousel + stats + réservations', '', ''],
        ['■ T-21', 'Vérifier la sidebar gauche', 'Carte « Mon solde AutoLink » en haut + menu complet', '', ''],
        ['T-22', 'Observer le carrousel marketing', '6 slides avec images, défilement auto ~2,5 s, pause au survol', '', ''],
        ['T-23', 'Menu : Statistiques puis Mon portefeuille', 'Pages /client/stats et /client/wallet chargées avec données', '', ''],
        ['T-24', 'Basculer thème sombre/clair (icône lune)', 'Thème appliqué sans rechargement', '', ''],
        ['T-25', 'Cloche notifications', 'Panneau s\u2019ouvre, liste ou état vide', '', ''],
    ])

    tests_table('7. Recherche & réservation', [
        ['■ T-30', 'Chercher un véhicule : /client/search', 'Catalogue affiché, photos, prix/jour', '', ''],
        ['T-31', 'Filtrer par gamme (Basic → Gold)', 'Liste filtrée correcte', '', ''],
        ['T-32', 'Choisir type de location (3 h / 24 h / interurbain)', 'Filtre appliqué depuis dashboard ou page recherche', '', ''],
        ['■ T-33', 'Réserver : dates + adresses → confirmer', 'Réservation créée, statut pending, montant détaillé', '', ''],
        ['T-34', 'Dates incohérentes (fin < début)', 'Blocage + message', '', ''],
        ['T-35', 'Annuler une réservation pending', 'Statut cancelled', '', ''],
    ])

    tests_table('8. Portefeuille & paiements', [
        ['■ T-40', 'Ouvrir « Recharger » depuis la sidebar', 'Modale : montants rapides + 6 moyens de paiement', '', ''],
        ['T-41', 'Recharge MTN MoMo 1 000 F (compte test)', 'Solde +1 000 F, transaction en historique', '', ''],
        ['T-42', 'Recharge Stripe (carte test si configurée)', 'Redirection Stripe → retour → solde crédité, bannière succès', '', ''],
        ['T-43', 'Annuler le paiement Stripe', 'Retour bannière « annulé », solde inchangé', '', ''],
        ['T-44', 'Page Mon portefeuille', 'Solde + totaux crédité/débité + historique horodaté', '', ''],
        ['T-45', 'Tentative recharge < 500 F', 'Bloqué (montant minimum)', '', ''],
    ])

    tests_table('9. Messagerie & notifications', [
        ['T-50', 'Ouvrir /messages, contacter le support', 'Message envoyé, conversation créée', '', ''],
        ['T-51', 'Recevoir une notification (ex. après réservation)', 'Badge rouge, contenu lisible, marquer lu', '', ''],
    ])

    tests_table('10. Rôle propriétaire (compte fourni)', [
        ['T-60', 'Connexion OWNER → /owner/dashboard', 'Revenus, véhicules listés', '', ''],
        ['T-61', 'Ajouter un véhicule (formulaire complet)', 'Véhicule pending, pas visible catalogue avant approbation', '', ''],
        ['T-62', 'Service chauffeur + ticket maintenance', 'Demandes créées et listées', '', ''],
    ])

    tests_table('11. Rôle admin (compte fourni)', [
        ['■ T-70', 'Connexion ADMIN → /admin/dashboard', 'KPIs globaux affichés', '', ''],
        ['T-71', 'Approuver le véhicule du test T-61', 'Statut approved → visible catalogue', '', ''],
        ['T-72', 'Suspendre/réactiver un utilisateur test', 'Compte bloqué puis réactivé', '', ''],
        ['T-73', 'Page Finance', 'Commissions et montants affichés', '', ''],
        ['T-74', 'Paramètres plateforme', 'Modification persistée', '', ''],
    ])

    tests_table('12. API, sécurité & robustesse', [
        ['■ T-80', 'GET /api/health/', '{"status":"ok"}', '', ''],
        ['T-81', 'GET /api/users/ sans token (curl/navigateur)', '401 non autorisé — pas de données', '', ''],
        ['T-82', 'GET /api/vehicles/ sans token', '200 — catalogue public lisible', '', ''],
        ['T-83', 'Accéder à /admin sans compte staff', 'Redirection login admin', '', ''],
        ['T-84', 'Tester un token JWT falsifié', '401 — requête rejetée', '', ''],
        ['T-85', 'Vérifier /.env ou /.git', '404 — chemins sensibles bloqués (nginx)', '', ''],
    ])

    tests_table('13. Responsive & multi-device', [
        ['T-90', 'F12 → mode mobile 390 px : dashboard + recherche', 'Menu burger, sidebar drawer, lisibilité', '', ''],
        ['T-91', 'Répéter T-01, T-12, T-30 sur smartphone réel', 'Même comportement', '', ''],
    ])

    h1(doc, '14. Synthèse de recette')
    table(doc, ['Total tests', 'OK', 'KO', 'N/A', 'Taux', 'Verdict'], [
        ['~40', '', '', '', '', ''],
    ], widths=[3, 2, 2, 2, 3, 5])
    para(doc, 'Verdict attendu : 0 KO bloquant (■) et taux ≥ 95 % → recette acceptée (PV doc 19).')
    status_block(doc, 95, 'À remplir lors de la session de recette · prévoir comptes OWNER/ADMIN/CONTROLLER de test.')
    return doc

def build():
    cahier_recette().save(os.path.join(DOCS_DIR, '16_Cahier_de_recette.docx'))
    print('OK 16_Cahier_de_recette.docx')

if __name__ == '__main__':
    build()
