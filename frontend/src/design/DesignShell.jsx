import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import AutoLinkLogo from '../components/AutoLinkLogo';
import dict from '../i18n/design-dict.json';
import i18next from '../i18n';

const NAVS = {
  client: [
    { icon: 'dashboard', label: 'Tableau de bord', path: '/client/dashboard' },
    { icon: 'directions_car', label: 'Mes Réservations', path: '/client/bookings' },
    { icon: 'account_balance_wallet', label: 'Portefeuille & Caution', path: '/client/wallet' },
    { icon: 'search', label: 'Catalogue', path: '/client/search' },
    { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notif' },
    { icon: 'favorite', label: 'Favoris', path: '/client/favorites' },
    { icon: 'chat', label: 'Messagerie', path: '/messages', badge: 'msg' },
    { icon: 'badge', label: 'Profil & Paramètres', path: '/profile' },
    { icon: 'loyalty', label: 'Parrainage & Réductions', path: '/client/referrals' },
    { icon: 'settings', label: 'Paramètres', path: '/settings' },
    { icon: 'help', label: 'Aide', path: '/client/help' },
  ],
  driver: [
    { icon: 'dashboard', label: 'Tableau de bord', path: '/driver/dashboard' },
    { icon: 'payments', label: 'Revenus & Retraits', path: '/driver/revenue' },
    { icon: 'chat', label: 'Messages', path: '/driver/messages', badge: 'msg' },
    { icon: 'notifications', label: 'Notifications', path: '/driver/notifications', badge: 'notif' },
    { icon: 'badge', label: 'Profil & Documents', path: '/driver/profile' },
    { icon: 'settings', label: 'Paramètres', path: '/driver/settings' },
  ],
};

const USERS = {
  client: { init: 'EN', name: 'Emmanuel Ndedi', short: 'Emmanuel N.', role: 'Client', email: 'emmanuel@autolink.cm', space: 'Espace Client' },
  driver: { init: 'JM', name: 'Jean-Pierre Mbida', short: 'Jean-Pierre M.', role: 'Chauffeur', email: 'jp.mbida@autolink.cm', space: 'Espace Chauffeur' },
  owner: { init: 'AY', name: 'ANANGUE Yves', short: 'ANANGUE Y.', role: 'Propriétaire', email: 'anague@autolink.cm', space: 'Espace Propriétaire' },
};

const tr = (fr) => {
  if (i18next.language !== 'en') return fr;
  return i18next.exists(`ui.common|${fr}`) ? i18next.t(`ui.common|${fr}`) : (dict[fr] || fr);
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
  const { i18n } = useTranslation();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = (v) => { setDark(v); document.documentElement.classList.toggle('dark', v); localStorage.setItem('autolink_theme', v ? 'dark' : 'light'); };
  const [open, setOpen] = useState(false);
  const { user: meUser } = useAuth();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  useEffect(() => {
    if (!meUser) return undefined;
    let alive = true;
    import('../services/api').then(({ notificationsAPI, messagingAPI }) => {
      notificationsAPI.list().then((r) => {
        const items = r.data?.results || r.data || [];
        if (alive) setUnreadNotif(items.filter((n) => !n.is_read).length);
      }).catch(() => {});
      messagingAPI.unread().then((r) => {
        if (alive) setUnreadMsg(r.data?.unread ?? r.data?.count ?? 0);
      }).catch(() => {});
    });
    return () => { alive = false; };
  }, [meUser]);
  const [navExpanded, setNavExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const realUser = authUser ? {
    ...user,
    init: `${(authUser.first_name || authUser.username || 'U')[0]}${(authUser.last_name || ' ')[0] || ''}`.toUpperCase(),
    name: `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.username,
    short: authUser.first_name ? `${authUser.first_name} ${(authUser.last_name || '')[0] || ''}.` : authUser.username,
    email: authUser.email || user.email,
  } : user;
  const displayUser = realUser;
  const doLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);
  const sidebar = (
    <div
      onMouseEnter={() => setNavExpanded(true)}
      onMouseLeave={() => setNavExpanded(false)}
      className={`flex flex-col h-full bg-white text-on-surface border-r border-outline-variant/30 transition-[width] duration-300 w-72 ${navExpanded ? 'lg:w-72' : 'lg:w-[76px]'} overflow-hidden`}
    >
      <div className={`h-20 px-4 flex items-center shrink-0 border-b border-outline-variant/30 ${navExpanded ? 'justify-between' : 'justify-between lg:justify-center'}`}>
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <AutoLinkLogo size="sm" className={`max-w-[180px] ${navExpanded ? '' : 'lg:hidden'}`} />
          <AutoLinkLogo size="xs" className={`hidden max-w-[40px] ${navExpanded ? '' : 'lg:block'}`} />
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 opacity-70" aria-label="Fermer le menu"><Icon name="close" /></button>
      </div>
      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-1 ${navExpanded ? '' : 'lg:px-3'}`}>
        {NAV.map(({ icon, label, path, badge }) => (
          <NavLink key={path + label} to={path} onClick={() => setOpen(false)} title={label}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-label-lg text-label-lg ${isActive ? 'bg-primary text-white font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'} ${navExpanded ? '' : 'lg:justify-center lg:px-0'}`}>
            <Icon name={icon} size={20} />
            <span className={`truncate flex-1 ${navExpanded ? '' : 'lg:hidden'}`}>{tr(label)}</span>
            {badge && (badge === 'notif' ? unreadNotif : badge === 'msg' ? unreadMsg : Number(badge)) > 0 && (
              <span className={`px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold ${navExpanded ? '' : 'lg:hidden'}`}>{badge === 'notif' ? unreadNotif : badge === 'msg' ? unreadMsg : badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className={`p-4 border-t border-outline-variant/30 shrink-0 ${navExpanded ? '' : 'lg:px-3'}`}>
        <button onClick={doLogout} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-md text-label-md text-error hover:bg-error-container transition-all ${navExpanded ? '' : 'lg:justify-center lg:px-0'}`}>
          <Icon name="logout" size={18} />
          <span className={navExpanded ? '' : 'lg:hidden'}>{tr('Déconnexion')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className="hidden lg:flex shrink-0 z-30">{sidebar}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="h-full max-w-[85vw] shadow-2xl">{sidebar}</div>
          <div className="flex-1 bg-inverse-surface/60" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 lg:h-20 shrink-0 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" aria-label="Menu">
              <Icon name="menu" />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate(role === 'driver' ? '/driver/messages' : '/messages')} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" title="Messages">
              <Icon name="chat_bubble" size={22} />
              {unreadMsg > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">{unreadMsg}</span>}
            </button>
            <button onClick={() => navigate(notifPath)} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high" title="Notifications">
              <Icon name="notifications" size={22} />
              {unreadNotif > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">{unreadNotif}</span>}
            </button>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">{displayUser.init}</span>
                <span className="hidden md:block text-left leading-tight">
                  <span className="block font-label-md text-label-md text-on-surface">{displayUser.short}</span>
                </span>
                <Icon name="expand_more" size={18} className="text-on-surface-variant" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-elevation-3 border border-outline-variant/30 py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/30">
                    <div className="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide">{displayUser.space}</div>
                    <div className="font-label-lg text-label-lg text-on-surface">{displayUser.name}</div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant"><Icon name="dark_mode" size={18} />Thème</span>
                    <div className="flex rounded-lg overflow-hidden border border-outline-variant/40">
                      <button onClick={() => toggleDark(false)} className={`px-2.5 py-1 font-label-sm text-label-sm ${!dark ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant'}`}>Clair</button>
                      <button onClick={() => toggleDark(true)} className={`px-2.5 py-1 font-label-sm text-label-sm ${dark ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant'}`}>Sombre</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant"><Icon name="language" size={18} />Langue</span>
                    <div className="flex rounded-lg overflow-hidden border border-outline-variant/40">
                      <button onClick={() => { i18n.changeLanguage('fr'); import('../services/api').then(({ usersAPI }) => usersAPI.updateMe({ language: 'fr' }).catch(() => {})); }} className={`px-2.5 py-1 font-label-sm text-label-sm ${i18n.language === 'fr' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant'}`}>FR</button>
                      <button onClick={() => { i18n.changeLanguage('en'); import('../services/api').then(({ usersAPI }) => usersAPI.updateMe({ language: 'en' }).catch(() => {})); }} className={`px-2.5 py-1 font-label-sm text-label-sm ${i18n.language === 'en' ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant'}`}>EN</button>
                    </div>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                    className="flex items-center gap-2 px-4 py-2 font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-low w-full">
                    <Icon name="badge" size={18} />Profil
                  </button>
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
        <main className="flex-1 overflow-y-auto app-scroll bg-surface">{children}</main>
      </div>
    </div>
  );
}
