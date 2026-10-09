# -*- coding: utf-8 -*-
"""00 Index maître : liste des livrables + marge de réalisation + actions pour 100 %."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import *  # noqa

DOCS = [
    ('01', 'Cahier des charges', 'Cadrage', 95, 'Validation client signée'),
    ('02', 'Note de cadrage / proposition', 'Cadrage', 85, 'Coordonnées commerciales + validation'),
    ('03', 'Étude de l\u2019existant & benchmark', 'Cadrage', 90, 'Captures comparatives + chiffres sourcés'),
    ('04', 'Devis & planning prévisionnel', 'Cadrage', 80, 'Chiffrage validé + devis signé'),
    ('05', 'Contrat de prestation & NDA (modèle)', 'Cadrage', 60, 'Relecture juriste + signatures'),
    ('06', 'Spécifications fonctionnelles (SFD)', 'Specs', 92, 'APIs MoMo réelles + règles pénalités'),
    ('07', 'User stories & backlog', 'Specs', 90, 'Chiffrage stories restantes'),
    ('08', 'Cas d\u2019utilisation + personas', 'Specs', 88, 'Photos profils réels après entretiens'),
    ('09', 'Règles de gestion métier', 'Specs', 85, 'Automatisation pénalités + validation taux'),
    ('10', 'UX/UI : arborescence + design system', 'Conception', 80, 'Exports Figma + lien prototype'),
    ('11', 'Architecture technique (DAT)', 'Technique', 92, 'Procédure bascule PostgreSQL détaillée'),
    ('12', 'Modèle de données (MCD + dictionnaire)', 'Technique', 90, 'MLD SQL complet si migration Postgres'),
    ('13', 'Documentation API', 'Technique', 95, 'Collection Postman / OpenAPI export'),
    ('14', 'Diagrammes de séquence', 'Technique', 95, 'Ajouter litige/escrow + payout'),
    ('15', 'Sécurité & non fonctionnel', 'Technique', 85, 'Audit OWASP + tests de charge'),
    ('16', 'Cahier de recette / plan de test', 'Qualité', 95, 'Exécuter + remplir résultats'),
    ('17', 'Déploiement & hébergement (VPS/ports)', 'Exploitation', 92, 'Runbook incident + secrets en coffre'),
    ('18', 'Sauvegarde · supervision · maintenance', 'Exploitation', 82, 'Alerting actif + script backup auto + SLA'),
    ('19', 'Manuel utilisateur', 'Livraison', 88, 'Captures d\u2019écran annotées'),
    ('20', 'Guide administrateur', 'Livraison', 85, 'Formation équipe + procédure urgence'),
    ('21', 'Documents légaux (modèles)', 'Livraison', 55, 'Rédaction juridique + publication /cgu'),
    ('22', 'Plan de projet & risques', 'Gestion', 85, 'CR réunions réels + registre tenu'),
    ('23', 'PV de recette & livraison', 'Livraison', 60, 'Signature après recette'),
]

def index():
    doc = new_doc()
    cover(doc, 'ALP-IDX-000', 'INDEX DES LIVRABLES — AUTOLINK PRO',
          '23 documents · marge de réalisation · chemin vers 100 %')
    para(doc, 'Dossier : documentation/ — chaque document est autonome. '
              'La colonne « Avancement » indique le niveau de complétude ; la dernière colonne liste '
              'ce qu\u2019il reste à faire pour atteindre 100 %. Les documents indispensables '
              '(CDC, SFD, DAT, API, recette, PV) sont marqués ●.', italic=True)
    h1(doc, 'Tableau de suivi')
    rows = [[n, ('● ' if n in ('01', '06', '11', '13', '16', '23') else '') + t, ph, f'{p} %', r]
            for n, t, ph, p, r in DOCS]
    table(doc, ['Réf.', 'Document', 'Phase', 'Avancement', 'Pour 100 %'],
          rows, widths=[1.3, 6.2, 2.2, 2.2, 5.6], size=8.5)
    avg = sum(p for _, _, _, p, _ in DOCS) / len(DOCS)
    callout(doc, f'Avancement global du dossier documentaire : {avg:.0f} %. '
                 'Priorités pour 100 % : (1) signatures juridiques et PV, (2) exécution du cahier de recette, '
                 '(3) captures Figma/écrans, (4) alerting & backups automatisés.', bold_prefix='SYNTHÈSE')
    h1(doc, 'Schémas inclus')
    bullets(doc, [
        'assets/architecture.png — architecture production (VPS, nginx, gunicorn, services)',
        'assets/usecase.png — cas d\u2019utilisation par acteur',
        'assets/mcd.png — modèle conceptuel de données',
        'assets/seq_reservation.png / seq_paiement.png — flux critiques',
        'assets/gantt.png — planning · assets/arborescence.png — écrans · assets/deploiement.png — CI/CD',
    ])
    return doc

if __name__ == '__main__':
    index().save(os.path.join(DOCS_DIR, '00_Index_livrables.docx'))
    print('OK 00_Index_livrables.docx')
