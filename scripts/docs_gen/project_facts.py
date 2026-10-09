# -*- coding: utf-8 -*-
"""Extraction automatique des faits projet depuis le code source.
Relancée à chaque génération, les documents reflètent toujours l'état réel
du code — sans édition manuelle."""
import os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
BACK = os.path.join(ROOT, 'backend')
FRONT = os.path.join(ROOT, 'frontend', 'src')

def _read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

# ── Endpoints API (depuis les urls.py) ───────────────────────────────────────
HTTP = {'get': 'GET', 'post': 'POST', 'put': 'PUT', 'patch': 'PATCH', 'delete': 'DELETE'}

def api_endpoints():
    """Retourne une liste de dicts {prefix, path, kind} ordonnée par app."""
    eps = []
    cfg = _read(os.path.join(BACK, 'config', 'urls.py'))
    apps = re.findall(r"path\('api/([\w-]+)/',\s*include\('apps\.(\w+)\.urls'\)", cfg)
    for prefix, app in apps:
        urls = _read(os.path.join(BACK, 'apps', app, 'urls.py'))
        for m in re.finditer(r"router\.register\(r'([\w\-/]*)'.*?basename='([\w-]+)'", urls):
            eps.append(dict(app=prefix, path=f"{prefix}/{m.group(1)}".rstrip('/') + '/', kind='viewset'))
        for m in re.finditer(r"path\('([^']+)',\s*(\w+)", urls):
            p, view = m.groups()
            if 'include' in view: continue
            eps.append(dict(app=prefix, path=f'{prefix}/{p}', kind=view))
    for m in re.finditer(r"path\('api/([^']+)',\s*(\w+)", cfg):
        if 'include' in m.group(2): continue
        eps.append(dict(app='core', path=m.group(1), kind=m.group(2)))
    return eps

# ── Rôles ─────────────────────────────────────────────────────────────────────
def user_roles():
    src = _read(os.path.join(BACK, 'apps', 'users', 'models.py'))
    m = re.search(r'class Role\(models\.TextChoices\):(.*?)(?=\n    class |\nclass |\Z)', src, re.S)
    return re.findall(r"(\w+)\s*=\s*'(\w+)',\s*'([^']+)'", m.group(1)) if m else []

# ── Réglages (settings.py) ────────────────────────────────────────────────────
def env_settings():
    src = _read(os.path.join(BACK, 'config', 'settings.py'))
    return re.findall(r"^(\w+)\s*=\s*config\('(\w+)'[^d]*?default=([^,)]+)", src, re.M)

def commission_rate():
    src = _read(os.path.join(BACK, 'config', 'settings.py'))
    m = re.search(r"COMMISSION_RATE\s*=\s*config\([^,]+,\s*default=([\d.]+)", src)
    return float(m.group(1)) if m else None

# ── Méthodes de paiement ──────────────────────────────────────────────────────
def topup_methods():
    src = _read(os.path.join(BACK, 'apps', 'payments', 'serializers.py'))
    m = re.search(r"TOPUP_METHODS\s*=\s*\[([^\]]+)\]", src)
    return re.findall(r"'(\w+)'", m.group(1)) if m else []

# ── Modèles (champs par entité) ───────────────────────────────────────────────
def models_summary():
    out = {}
    for app in ('users', 'vehicles', 'bookings', 'payments', 'drivers', 'inspections'):
        p = os.path.join(BACK, 'apps', app, 'models.py')
        if not os.path.exists(p): continue
        src = _read(p)
        for m in re.finditer(r'class (\w+)\(models\.Model\):(.*?)(?=\nclass |\Z)', src, re.S):
            fields = re.findall(r'^\s{4}(\w+)\s*=\s*models\.(\w+)', m.group(2), re.M)
            out[f'{app}.{m.group(1)}'] = fields
    return out

# ── Frontend : routes & navigation ────────────────────────────────────────────
def frontend_routes():
    src = _read(os.path.join(FRONT, 'App.jsx'))
    return re.findall(r'path="([^"]+)"\s+element=\{<Guard[^>]*>(?:<(\w+)\s*/>)?', src)

def nav_items():
    src = _read(os.path.join(FRONT, 'components', 'DashboardLayout.jsx'))
    out = {}
    for m in re.finditer(r"(\w+):\s*\[((?:\s*\{[^}]+\},?)+)\s*\]", src):
        out[m.group(1)] = re.findall(r"label:\s*'([^']+)',\s*path:\s*'([^']+)'", m.group(2))
    return out

if __name__ == '__main__':
    print('ENDPOINTS:', len(api_endpoints()))
    for e in api_endpoints(): print('  ', e['path'], '·', e['kind'])
    print('ROLES:', user_roles())
    print('COMMISSION:', commission_rate())
    print('TOPUP:', topup_methods())
    print('ROUTES:', len(frontend_routes()))
    print('NAV:', {k: len(v) for k, v in nav_items().items()})
    print('MODELS:', {k: len(v) for k, v in models_summary().items()})
