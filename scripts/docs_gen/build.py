# -*- coding: utf-8 -*-
"""Régénère TOUTE la documentation Word à partir du code source actuel.

Usage :  python scripts/docs_gen/build.py

À exécuter après chaque évolution du projet (nouvelle route API, modèle,
rôle, variable d'env, page frontend…) pour que documentation/ reste
synchronisée avec le code réel. Les données volatiles (endpoints, rôles,
modèles, commission, env vars) sont extraites automatiquement par
project_facts.py — seuls les textes rédactionnels restent manuels.
"""
import os, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

STEPS = [
    'diagrams.py',
    'build_00_index.py',
    'build_01_cadrage.py',
    'build_02_specs.py',
    'build_03_tech.py',
    'build_04_tests.py',
    'build_05_deploy.py',
    'build_06_livraison.py',
]

def main():
    failed = []
    for step in STEPS:
        print(f'\n===== {step} =====')
        r = subprocess.run([sys.executable, os.path.join(HERE, step)])
        if r.returncode != 0:
            failed.append(step)
    print('\n' + '=' * 40)
    if failed:
        print('ÉCHEC :', ', '.join(failed))
        sys.exit(1)
    print('Documentation regeneree -> documentation/')

if __name__ == '__main__':
    main()
