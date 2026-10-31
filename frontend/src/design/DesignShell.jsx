import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import AutoLinkLogo from '../components/AutoLinkLogo';

const NAVS = {
  client: [
    { icon: 'dashboard', label: 'Tableau de bord', path: '/client/dashboard' },
    { icon: 'directions_car', label: 'Mes Réservations', path: '/client/bookings' },
    { icon: 'account_balance_wallet', label: 'Portefeuille & Caution', path: '/client/wallet' },
    { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: '3' },
    { icon: 'favorite', label: 'Favoris', path: '/client/favorites' },
    { icon: 'chat', label: 'Messagerie', path: '/messages' },
    { icon: 'badge', label: 'Profil & Paramètres', path: '/profile' },
    { icon: 'loyalty', label: 'Parrainage & Réductions', path: '/client/referrals' },
    { icon: 'settings', label: 'Paramètres', path: '/settings' },
    { icon: 'search', label: 'Catalogue', path: '/client/search' },
    { icon: 'help', label: 'Aide', path: '/help' },
  ],
  driver: [
    { icon: 'dashboard', label: 'Tableau de bord', path: '/driver/dashboard' },
    { icon: 'payments', label: 'Revenus & Retraits', path: '/driver/revenue' },
    { icon: 'chat', label: 'Messages', path: '/driver/messages' },
    { icon: 'notifications', label: 'Notifications', path: '/driver/notifications', badge: '1' },
    { icon: 'badge', label: 'Profil & Documents', path: '/driver/profile' },
    { icon: 'settings', label: 'Paramètres', path: '/driver/settings' },
  ],
};

const USERS = {
  client: { init: 'EN', name: 'Emmanuel Ndedi', short: 'Emmanuel N.', role: 'Client', email: 'emmanuel@autolink.cm', space: 'Espace Client' },
  driver: { init: 'JM', name: 'Jean-Pierre Mbida', short: 'Jean-Pierre M.', role: 'Chauffeur', email: 'jp.mbida@autolink.cm', space: 'Espace Chauffeur' },
  owner: { init: 'AY', name: 'ANANGUE Yves', short: 'ANANGUE Y.', role: 'Propriétaire', email: 'anague@autolink.cm', space: 'Espace Propriétaire' },
};

export default function DesignShell({ children, role = 'client' }) {
  const NAV = role === 'owner' ? [
    { icon: 'dashboard', label: 'Tableau de bord', path: '/owner/dashboard' },
    { icon: 'directions_car', label: 'Mes véhicules', path: '/owner/vehicles' },
    { icon: 'post_add', label: 'Ajouter un véhicule', path: '/owner/add-vehicle' },
    { icon: 'inbox', label: 'Demandes de location', path: '/owner/requests' },
    { icon: 'account_balance_wallet', label: 'Revenus & Finances', path: '/owner/revenue' },
    { icon: 'chat', label: 'Messagerie', path: '/owner/messages' },
    { icon: 'notifications', label: 'Notifications', path: '/owner/notifications' },
    { icon: 'badge', label: 'Profil & Paramètres', path: '/settings' },
  ] : (NAVS[role] || NAVS.client);
  const user = USERS[role] || USERS.client;
  const notifPath = role === 'driver' ? '/driver/notifications' : role === 'owner' ? '/owner/notifications' : '/notifications';
  const walletPath = role === 'driver' ? '/driver/revenue' : role === 'owner' ? '/owner/revenue' : '/client/wallet?recharge=1';
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const doLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);
  const sidebar = (
    <div className="flex flex-col h-full w-72 bg-surface-container-lowest text-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 px-6 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <AutoLinkLogo size="lg" />
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 opacity-70" aria-label="Fermer le menu"><Icon name="close" /></button>
      </div>
      <div className="px-6 pb-2 shrink-0">
        <div className="py-1.5 px-3 rounded-lg flex items-center justify-between bg-surface-container-low">
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">{user.space}</span>
          <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
        </div>
      </div>
      <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-2 flex flex-col gap-1">
        {NAV.map(({ icon, label, path, badge }) => (
          <NavLink key={path + label} to={path} onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-label-lg text-label-lg ${isActive ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>
            <Icon name={icon} size={20} />
            <span className="truncate flex-1">{label}</span>
            {badge && <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold">{badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-outline-variant/30 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shrink-0">{user.init}</div>
          <div className="min-w-0 flex-1">
            <div className="font-label-md text-label-md truncate">{user.name}</div>
            <div className="text-[11px] text-on-surface-variant">{user.role}</div>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-primary-fixed-dim shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />En ligne
          </span>
        </div>
        <button onClick={doLogout} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md text-error hover:bg-error-container transition-all">
          <Icon name="logout" size={18} />Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className="hidden lg:flex shrink-0 z-30">{sidebar}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="shadow-2xl">{sidebar}</div>
          <div className="flex-1 bg-inverse-surface/60" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 lg:h-20 shrink-0 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" aria-label="Menu">
              <Icon name="menu" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-surface-container-low">
              <Icon name="account_balance_wallet" size={18} className="text-primary" />
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{role === 'driver' ? 'Gains' : 'Solde'}</span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface whitespace-nowrap">{role === 'driver' ? '85 000' : '45 000'} <span className="text-primary font-label-sm">FCFA</span></span>
              <button onClick={() => navigate(walletPath)} title="Recharger le portefeuille"
                className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                <Icon name="add" size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex rounded-xl overflow-hidden border border-outline-variant/40">
              <span className="px-2.5 py-1.5 font-label-sm text-label-sm bg-primary text-on-primary">FR</span>
              <span className="px-2.5 py-1.5 font-label-sm text-label-sm bg-surface-container-lowest text-on-surface-variant">EN</span>
            </div>
            <button onClick={() => navigate(role === 'driver' ? '/driver/messages' : '/messages')} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" title="Messages">
              <Icon name="chat_bubble" size={22} />
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">2</span>
            </button>
            <button onClick={() => navigate(notifPath)} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" title="Notifications">
              <Icon name="notifications" size={22} />
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">3</span>
            </button>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">{user.init}</span>
                <span className="hidden md:block text-left leading-tight">
                  <span className="block font-label-md text-label-md text-on-surface">{user.short}</span>
                  <span className="block text-[11px] text-on-surface-variant">{user.role}</span>
                </span>
                <Icon name="expand_more" size={18} className="text-on-surface-variant" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-elevation-3 border border-outline-variant/30 py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/30">
                    <div className="font-label-lg text-label-lg text-on-surface">{user.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</div>
                  </div>
                  {[
                    { icon: 'dashboard', label: 'Tableau de bord', to: role === 'driver' ? '/driver/dashboard' : '/client/dashboard' },
                    { icon: 'badge', label: role === 'driver' ? 'Profil & Documents' : 'Documents & Profil', to: role === 'driver' ? '/driver/profile' : '/profile' },
                    ...(role === 'client' ? [{ icon: 'loyalty', label: 'Parrainage & Réductions', to: '/client/referrals' }] : []),
                    { icon: 'settings', label: 'Paramètres', to: role === 'driver' ? '/driver/settings' : '/settings' },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { setProfileOpen(false); navigate(item.to); }}
                      className="flex items-center gap-2 px-4 py-2 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low w-full">
                      <Icon name={item.icon} size={18} />{item.label}
                    </button>
                  ))}
                  <div className="border-t border-outline-variant/30 mt-1 pt-1">
                    <button onClick={() => doLogout()} className="flex items-center gap-2 px-4 py-2 font-body-md text-body-md text-error hover:bg-error-container/50 w-full">
                      <Icon name="logout" size={18} />Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>
    </div>
  );
}
