# -*- coding: utf-8 -*-
"""AutoLink Pro — génération des schémas (PNG) embarqués dans les documents Word."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Ellipse, Rectangle

ASSETS = os.path.join(os.path.dirname(__file__), '..', '..', 'documentation', 'assets')
os.makedirs(ASSETS, exist_ok=True)

NAVY = '#0F172A'; TEAL = '#0D9488'; SKY = '#0EA5E9'; ORA = '#F97316'
GRN = '#10B981'; GREY = '#64748B'; LIGHT = '#F1F5F9'; RED = '#EF4444'
AMBER = '#F59E0B'; VIOLET = '#8B5CF6'

def _box(ax, x, y, w, h, text, fc=TEAL, tc='white', fs=9, ec='none', bold=True, sub=None):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.06,rounding_size=0.12',
                 fc=fc, ec=ec, lw=1.2))
    weight = 'bold' if bold else 'normal'
    if sub:
        ax.text(x + w / 2, y + h * 0.62, text, ha='center', va='center',
                fontsize=fs, color=tc, weight=weight)
        ax.text(x + w / 2, y + h * 0.30, sub, ha='center', va='center',
                fontsize=fs - 1.5, color=tc, alpha=.85)
    else:
        ax.text(x + w / 2, y + h / 2, text, ha='center', va='center',
                fontsize=fs, color=tc, weight=weight)

def _arrow(ax, x1, y1, x2, y2, label=None, color=GREY, style='-|>', dashed=False, fs=7.5, lx=0, ly=0.12):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style,
                 mutation_scale=13, color=color, lw=1.4,
                 linestyle='--' if dashed else '-'))
    if label:
        ax.text((x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, label,
                ha='center', fontsize=fs, color=color, style='italic')

def _canvas(w=13, h=8):
    fig, ax = plt.subplots(figsize=(w, h), dpi=150)
    ax.set_xlim(0, 100); ax.set_ylim(0, 100)
    ax.axis('off')
    return fig, ax

def _save(fig, name):
    fig.savefig(os.path.join(ASSETS, name), bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)

# ─────────────────────────────────────────────────────────────────────────────
def architecture():
    fig, ax = _canvas(13, 8.2)
    ax.text(50, 97, 'Architecture AutoLink Pro — production', ha='center',
            fontsize=13, weight='bold', color=NAVY)

    # Clients
    _box(ax, 2, 76, 16, 12, 'Navigateur web', fc=SKY, sub='SPA React 18')
    _box(ax, 2, 58, 16, 12, 'App mobile', fc=SKY, sub='Expo / React Native')

    # VPS boundary
    ax.add_patch(Rectangle((24, 8), 52, 84, fc='none', ec=GREY, lw=1.4, linestyle='--'))
    ax.text(50, 88.5, 'VPS OVH — Ubuntu 22.04 · 51.195.109.156', ha='center',
            fontsize=8.5, color=GREY, style='italic')

    _box(ax, 28, 66, 20, 12, 'Nginx', fc=NAVY, sub='port 80 · TLS 443')
    _box(ax, 56, 66, 16, 12, 'Gunicorn', fc=TEAL, sub='Django 4.2 · :8000')
    _box(ax, 56, 44, 16, 10, 'SQLite', fc=GREY, sub='/app/data')

    _box(ax, 28, 44, 20, 10, 'Static / media', fc='#334155', sub='React build · photos')
    _box(ax, 28, 24, 20, 10, 'CORS + JWT', fc=VIOLET, sub='SimpleJWT · rôles')
    _box(ax, 56, 24, 16, 10, 'Admin', fc=AMBER, sub='/admin')

    # External services
    _box(ax, 82, 66, 16, 12, 'Paiements', fc=ORA, sub='Stripe · PayPal · MoMo')
    _box(ax, 82, 44, 16, 10, 'SMTP Gmail', fc=RED, sub='OTP · notifications')
    _box(ax, 82, 24, 16, 10, 'GitHub', fc=NAVY, sub='webhook → Dokploy')

    _arrow(ax, 18, 79, 28, 73, 'HTTPS')
    _arrow(ax, 18, 63, 28, 69)
    _arrow(ax, 48, 72, 56, 72, 'proxy /api')
    _arrow(ax, 64, 66, 64, 54, 'ORM')
    _arrow(ax, 72, 72, 82, 72, 'checkout', dashed=True)
    _arrow(ax, 72, 68, 82, 55, 'webhook', dashed=True)
    _arrow(ax, 72, 50, 82, 50, 'mail OTP', dashed=True)
    _arrow(ax, 38, 66, 38, 54)
    _arrow(ax, 48, 60, 56, 30, dashed=True)
    _arrow(ax, 84, 24, 60, 12, 'push → build', color=NAVY, dashed=True)
    _box(ax, 40, 8, 18, 8, 'Dokploy', fc=NAVY, sub='CI/CD docker')
    ax.text(50, 2, 'Domaines : autolink-pro.…business → nginx :80  |  api-autolink-pro.…business → gunicorn :8000',
            ha='center', fontsize=7.5, color=GREY, style='italic')
    _save(fig, 'architecture.png')

# ─────────────────────────────────────────────────────────────────────────────
def usecase():
    fig, ax = _canvas(13, 8.5)
    ax.text(50, 97, 'Diagramme de cas d\u2019utilisation', ha='center',
            fontsize=13, weight='bold', color=NAVY)
    ax.add_patch(Rectangle((22, 4), 56, 88, fc='#F8FAFC', ec=GREY, lw=1.2))
    ax.text(50, 89, 'AutoLink Pro', ha='center', fontsize=9, color=GREY, style='italic')

    actors = [
        (8, 80, 'CLIENT'), (8, 50, 'PROPRIÉTAIRE'), (8, 20, 'INTERMÉDIAIRE'),
        (92, 66, 'CONTRÔLEUR'), (92, 30, 'ADMIN'),
    ]
    for x, y, name in actors:
        ax.plot([x, x], [y - 4, y - 10], color=NAVY, lw=1.6)
        ax.plot([x - 2.4, x + 2.4], [y - 6.5, y - 6.5], color=NAVY, lw=1.6)
        ax.plot([x, x - 2.2], [y - 10, y - 15], color=NAVY, lw=1.6)
        ax.plot([x, x + 2.2], [y - 10, y - 15], color=NAVY, lw=1.6)
        ax.add_patch(plt.Circle((x, y - 2), 2, fc='white', ec=NAVY, lw=1.6))
        ax.text(x, y - 18, name, ha='center', fontsize=8, weight='bold', color=NAVY)

    cases = [
        (40, 82, 'S\u2019inscrire / se connecter', 'L'), (40, 72, 'Rechercher un véhicule', 'L'),
        (40, 62, 'Réserver & payer', 'L'), (40, 52, 'Recharger son solde', 'L'),
        (40, 42, 'Messagerie', 'ALL'), (40, 32, 'Noter la location', 'L'),
        (62, 72, 'Publier un véhicule', 'O'), (62, 62, 'Suivre ses revenus', 'O'),
        (62, 52, 'Service chauffeur', 'O'), (62, 42, 'Tickets maintenance', 'O'),
        (62, 22, 'Parrainer un client', 'I'),
        (50, 12, 'États des lieux', 'C'), (62, 32, 'Modérer & administrer', 'A'),
    ]
    for x, y, label, who in cases:
        col = {'L': TEAL, 'O': GRN, 'I': VIOLET, 'C': AMBER, 'A': RED, 'ALL': SKY}[who]
        ax.add_patch(Ellipse((x, y), 21, 6.4, fc='white', ec=col, lw=1.6))
        ax.text(x, y, label, ha='center', va='center', fontsize=7.6, color=NAVY)

    def link(ax_, ay_, cx_, cy_):
        ax.add_line(plt.Line2D([ax_, cx_], [ay_, cy_], color='#CBD5E1', lw=1, zorder=0))
    for cx, cy in [(40, 82), (40, 72), (40, 62), (40, 52), (40, 42), (40, 32)]:
        link(10.5, 68, cx - 11, cy)
    for cx, cy in [(62, 72), (62, 62), (62, 52), (62, 42), (40, 42)]:
        link(11, 38, cx - 10, cy)
    link(11, 8, 51, 22)
    link(89.5, 54, 60.5, 13)
    for cx, cy in [(62, 32), (40, 42)]:
        link(89.5, 18, cx + 10, cy)
    _save(fig, 'usecase.png')

# ─────────────────────────────────────────────────────────────────────────────
def mcd():
    fig, ax = _canvas(13, 8.5)
    ax.text(50, 97, 'Modèle conceptuel de données (extrait)', ha='center',
            fontsize=13, weight='bold', color=NAVY)

    def entity(x, y, w, name, fields, fc=NAVY):
        hh = 6; fh = 4.6
        ax.add_patch(Rectangle((x, y - fh * len(fields) - hh), w, hh + fh * len(fields),
                     fc='white', ec=GREY, lw=1))
        ax.add_patch(Rectangle((x, y - hh), w, hh, fc=fc, ec='none'))
        ax.text(x + w / 2, y - hh / 2, name, ha='center', va='center',
                fontsize=9, weight='bold', color='white')
        for i, f in enumerate(fields):
            ax.text(x + 0.8, y - hh - fh * i - fh / 2, f, fontsize=7.2, color=NAVY)

    entity(4, 92, 26, 'USER', ['id · email · rôle', 'first_name, last_name', 'balance (FCFA)',
                               'phone · referral_code'], fc=TEAL)
    entity(38, 92, 26, 'VEHICLE', ['owner → USER', 'brand, model, year, plate',
                                  'tier · daily_rate · deposit', 'status · condition_score'], fc=SKY)
    entity(72, 92, 24, 'BOOKING', ['client → USER · vehicle', 'start/end · days · subtotal',
                                   'commission · owner_amount', 'status · driver_type'], fc=ORA)
    entity(4, 46, 26, 'PAYMENT', ['booking → BOOKING', 'amount · method · status',
                                  'escrow_status · deposit'], fc=GRN)
    entity(38, 46, 26, 'WALLET_TRANSACTION', ['user → USER', 'kind (topup/debit/refund)',
                                             'amount · balance_after', 'status · reference'], fc=VIOLET)
    entity(72, 46, 24, 'VEHICLE_INSPECTION', ['vehicle → VEHICLE', 'controller → USER',
                                             'score · photos · litige'], fc=AMBER)
    entity(20, 8, 26, 'MESSAGE', ['sender/recipient → USER', 'body · is_read'], fc=GREY)
    entity(56, 8, 26, 'MAINTENANCE_REQUEST', ['vehicle → VEHICLE', 'status · description'], fc=RED)

    def link(x1, y1, x2, y2, card):
        ax.add_line(plt.Line2D([x1, x2], [y1, y2], color=GREY, lw=1.2))
        ax.text((x1 + x2) / 2 + 1.2, (y1 + y2) / 2 + 0.6, card, fontsize=7,
                color=GREY, style='italic')
    link(30, 78, 38, 78, '1,n possède')
    link(64, 84, 72, 84, '1,n concerne')
    link(38, 80, 20, 78, 'n,1 réserve')
    link(30, 60, 38, 60, 'n,1')
    link(84, 68.5, 84, 64, '1,n paie')
    link(17, 40, 17, 29, '1,n')
    link(51, 46, 60, 24, '')
    link(72, 46, 55, 24, 'n,1')
    _save(fig, 'mcd.png')

# ─────────────────────────────────────────────────────────────────────────────
def _sequence(filename, title, actors, steps):
    fig, ax = _canvas(13, 0.62 * len(steps) + 2.4)
    n = len(actors); top = 96; step_h = 88 / max(len(steps), 1)
    xs = [8 + i * (84 / (n - 1)) for i in range(n)]
    ax.text(50, 99.5, title, ha='center', fontsize=13, weight='bold', color=NAVY)
    for x, name in zip(xs, actors):
        _box(ax, x - 8.5, top - 3, 17, 5.4, name, fc=NAVY, fs=8.5)
        ax.plot([x, x], [top - 3.2, 4], color=GREY, lw=1, linestyle='--')
    for i, (src, dst, label, ret) in enumerate(steps):
        y = top - 8 - i * step_h
        x1, x2 = xs[src], xs[dst]
        _arrow(ax, x1, y, x2, y - 0.3, None,
               color=TEAL if not ret else GREY,
               dashed=ret, style='-|>' if not ret else '->')
        ax.text((x1 + x2) / 2, y + 1.6, f'{i + 1}. {label}', ha='center',
                fontsize=7.6, color=NAVY)
    _save(fig, filename)

def sequences():
    _sequence('seq_reservation.png', 'Séquence — réservation d\u2019un véhicule',
              ['Client', 'Front React', 'API Django', 'PostgreSQL/SQLite', 'Propriétaire'],
              [
                  (0, 1, 'Choisit véhicule + dates', False),
                  (1, 2, 'POST /api/bookings/', False),
                  (2, 3, 'Vérifie dispo + calcule tarif', False),
                  (3, 2, 'Booking pending + montants', True),
                  (2, 1, '201 : réservation créée', True),
                  (1, 0, 'Récapitulatif + paiement', True),
                  (0, 1, 'Paie (solde / Stripe / PayPal)', False),
                  (2, 4, 'Notification « nouvelle réservation »', False),
                  (2, 3, 'status → confirmed', False),
              ])
    _sequence('seq_paiement.png', 'Séquence — recharge du solde (Stripe)',
              ['Client', 'Front React', 'API Django', 'Stripe', 'Webhook'],
              [
                  (0, 1, 'Montant + moyen', False),
                  (1, 2, 'POST /payments/wallet/topup/', False),
                  (2, 3, 'Checkout Session', False),
                  (3, 2, 'payment_url', True),
                  (2, 1, '202 + url', True),
                  (1, 3, 'Redirection paiement', False),
                  (3, 2, 'Retour /stripe-return/', False),
                  (2, 3, 'Vérifie payment_status=paid', False),
                  (4, 2, 'checkout.session.completed', False),
                  (2, 0, 'Solde crédité + redirect', True),
              ])

# ─────────────────────────────────────────────────────────────────────────────
def gantt():
    fig, ax = plt.subplots(figsize=(12.5, 5.6), dpi=150)
    phases = [
        ('Cadrage & CDC',                0, 1,  TEAL),
        ('Maquettes UX/UI',              1, 1.5, SKY),
        ('Backend (API + auth)',         2, 3,  NAVY),
        ('Frontend web',                 3, 3,  TEAL),
        ('Paiements & portefeuille',     4.5, 1.5, ORA),
        ('Refonte v2 + messagerie',      6, 1.5, VIOLET),
        ('Tests & recette',              7.5, 1, GRN),
        ('Déploiement production',       8.5, 0.8, RED),
        ('Documentation & livraison',    8.8, 1.2, GREY),
    ]
    for i, (name, start, dur, color) in enumerate(phases):
        ax.barh(len(phases) - i, dur, left=start, height=0.62, color=color, alpha=.9)
        ax.text(start + dur / 2, len(phases) - i, name, ha='center', va='center',
                fontsize=8, color='white', weight='bold')
    ax.set_yticks([]); ax.set_xlabel('Semaines', fontsize=9)
    ax.set_xlim(0, 10.5)
    ax.spines[['top', 'right', 'left']].set_visible(False)
    ax.set_title('Planning prévisionnel — ~10 semaines', fontsize=12, weight='bold', color=NAVY)
    ax.grid(axis='x', color='#E2E8F0', lw=0.7)
    fig.tight_layout()
    _save(fig, 'gantt.png')

# ─────────────────────────────────────────────────────────────────────────────
def arborescence():
    fig, ax = _canvas(13, 8)
    ax.text(50, 97, 'Arborescence des écrans — espace client', ha='center',
            fontsize=13, weight='bold', color=NAVY)
    _box(ax, 42, 86, 16, 7, 'Landing /', fc=NAVY)
    _box(ax, 14, 70, 18, 7, 'Login / Register', fc=SKY)
    _box(ax, 41, 70, 18, 7, 'Tableau de bord', fc=TEAL, sub='/client/dashboard')
    _box(ax, 68, 70, 18, 7, 'Profil / Settings', fc=GREY)
    lvl2 = [
        (6, 'Recherche', '/client/search'), (26, 'Réservations', '/client/bookings'),
        (46, 'Messages', '/messages'), (64, 'Statistiques', '/client/stats'),
        (82, 'Portefeuille', '/client/wallet'),
    ]
    for x, label, path in lvl2:
        _box(ax, x, 52, 16, 7, label, fc='#334155', sub=path, fs=8.5)
        _arrow(ax, 50, 70, x + 8, 59.5, color='#CBD5E1')
    _arrow(ax, 50, 86, 50, 77.4, color='#CBD5E1')
    _arrow(ax, 42, 89, 32, 74, color='#CBD5E1')
    _arrow(ax, 58, 89, 68, 77.4, color='#CBD5E1')
    lvl3 = [(16, 'Fiche véhicule + réservation'), (46, 'Détail réservation · litige'),
            (74, 'Fil de discussion')]
    for x, label in lvl3:
        _box(ax, x, 34, 20, 6, label, fc='white', tc=NAVY, ec=GREY, fs=8, bold=False)
    _arrow(ax, 14, 52, 26, 40.4, color='#CBD5E1')
    _arrow(ax, 34, 52, 36, 40.4, color='#CBD5E1')
    _arrow(ax, 54, 52, 84, 40.4, color='#CBD5E1')
    para_axes = [
        ('OWNER : /owner/dashboard · /vehicles · /add-vehicle · /driver-service · /maintenance', 22),
        ('ADMIN : /admin/dashboard · users · finance · drivers · agents · maintenance · settings', 16),
        ('INTERMÉDIAIRE : /intermediary/dashboard   ·   CONTRÔLEUR : /controller/dashboard', 10),
    ]
    for text, y in para_axes:
        ax.text(50, y, text, ha='center', fontsize=7.6, color=GREY, style='italic')
    _save(fig, 'arborescence.png')

# ─────────────────────────────────────────────────────────────────────────────
def deploy():
    fig, ax = _canvas(13, 5.4)
    ax.text(50, 97, 'Chaîne de déploiement continu', ha='center',
            fontsize=13, weight='bold', color=NAVY)
    steps = [
        (3,  'Dev local', 'npm start · runserver', SKY),
        (24, 'GitHub', 'WIB-New/autolink-pro\nfeature/refonte-v2-panels', NAVY),
        (45, 'Webhook', 'push → Dokploy', VIOLET),
        (63, 'Docker build', 'Dockerfile x2\n(front nginx / api gunicorn)', ORA),
        (84, 'VPS OVH', '51.195.109.156\nports 80/443', TEAL),
    ]
    for x, name, sub, col in steps:
        _box(ax, x, 60, 15, 16, name, fc=col, sub=sub, fs=9)
    for x in (18, 39, 58, 78):
        _arrow(ax, x + 1, 68, x + 6, 68, color=GREY)
    _box(ax, 24, 26, 24, 10, 'Volume /app/data', fc=GREY, sub='SQLite persistant')
    _box(ax, 60, 26, 28, 10, 'HTTPS Traefik/Let\u2019s Encrypt', fc=GRN,
         sub='autolink-pro.…business · api-…business')
    _arrow(ax, 84, 60, 80, 36.6, color=GREY, dashed=True)
    _arrow(ax, 63, 60, 48, 36.6, color=GREY, dashed=True)
    ax.text(50, 12, 'Rollback : Dokploy → redeploy du tag précédent · sauvegarde db.sqlite3 quotidienne',
            ha='center', fontsize=8, color=GREY, style='italic')
    _save(fig, 'deploiement.png')

if __name__ == '__main__':
    architecture(); usecase(); mcd(); sequences(); gantt(); arborescence(); deploy()
    print('Diagrammes générés dans', ASSETS)
