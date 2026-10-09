# AutoLink Pro — Guide agent

## Stack
- Frontend : React 18 + TailwindCSS (`frontend/`)
- Backend : Django 4.2 + DRF + SimpleJWT (`backend/`)
- Prod : Dokploy + Docker, branche déployée `feature/refonte-v2-panels`

## Commandes
- Backend : `cd backend && python manage.py runserver`
- Frontend : `cd frontend && npm start` / `npm run build`
- Health : `GET /api/health/`

## Documentation (`documentation/`, 24 fichiers .docx)
**Règle : après TOUTE modification fonctionnelle** (route API, modèle,
rôle, variable d'env, page, tarif, méthode de paiement…), régénérer la
documentation et l'inclure dans le commit :

```
python scripts/docs_gen/build.py
```

Les données volatiles sont extraites du code par
`scripts/docs_gen/project_facts.py` (endpoints, rôles, modèles,
commission, env vars) — les docs restent synchronisés sans édition manuelle.
Les textes rédactionnels restent dans les `build_0*.py` correspondants.

## Production
- Site : https://autolink-pro.worldwide-international.business
- API : https://api-autolink-pro.worldwide-international.business/api
- Push sur `feature/refonte-v2-panels` → Dokploy rebuild auto → vérifier
  le hash du bundle dans la page servie.
