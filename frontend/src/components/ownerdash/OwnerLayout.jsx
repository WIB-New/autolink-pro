import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import i18next from '../../i18n';
import {
  LayoutDashboard, Car, FileText, Wallet,
  Settings, LogOut, Menu, X, PlusSquare,
  ChevronDown, User, Moon, MessageSquare, Bell, Globe,
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Tableau de bord',      path: '/owner/dashboard' },
  { icon: Car,             label: 'Mes véhicules',        path: '/owner/vehicles' },
  { icon: PlusSquare,      label: 'Ajouter un véhicule',  path: '/owner/add-vehicle' },
  { icon: FileText,        label: 'Réservations',         path: '/owner/requests', badge: 'demandes' },
  { icon: Wallet,          label: 'Revenus & Finances',   path: '/owner/revenue' },
  { icon: MessageSquare,   label: 'Messagerie',           path: '/owner/messages', badge: 'msg' },
  { icon: Bell,            label: 'Notifications',        path: '/owner/notifications', badge: 'notif' },
  { icon: User,            label: 'Profil & Documents',   path: '/profile' },
  { icon: Settings,        label: 'Paramètres',           path: '/settings' },
];

/* Layout de l'espace propriétaire — sidebar claire auto-repliable (survol) + topbar. */
export default function OwnerLayout({ children, badges = {}, balance = null }) {
  const { user, logout, refreshUser } = useAuth();
  // Nom tolérant aux deux schémas du user stocké (firstName ou first_name).
  const firstName = user?.firstName || user?.first_name || '';
  const lastName = user?.lastName || user?.last_name || '';
  const nameRetried = useRef(false);
  useEffect(() => {
    if (user && !firstName && !nameRetried.current) {
      nameRetried.current = true;
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = (v) => {
    setDark(v);
    document.documentElement.classList.toggle('dark', v);
    localStorage.setItem('autolink_theme', v ? 'dark' : 'light');
  };
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  useEffect(() => {
    if (!user) return undefined;
    let alive = true;
    import('../../services/api').then(({ notificationsAPI, messagingAPI }) => {
      notificationsAPI.list().then((r) => {
        const items = r.data?.results || r.data || [];
        if (alive) setUnreadNotif(items.filter((n) => !n.is_read).length);
      }).catch(() => {});
      messagingAPI.unread().then((r) => {
        if (alive) setUnreadMsg(r.data?.unread ?? r.data?.count ?? 0);
      }).catch(() => {});
    });
    return () => { alive = false; };
  }, [user]);
  const setLang = (l) => {
    i18next.changeLanguage(l);
    import('../../services/api').then(({ usersAPI }) => usersAPI.updateMe({ language: l }).catch(() => {}));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mini }) => (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 text-on-surface border-r border-outline-variant/30 transition-[width] duration-300 w-72 ${mini ? 'lg:w-[76px]' : 'lg:w-72'} overflow-hidden`}>
      <div className={`h-20 px-4 flex items-center shrink-0 border-b border-outline-variant/30 dark:border-slate-800 ${mini ? 'justify-between lg:justify-center' : 'justify-between'}`}>
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <AutoLinkLogo size="sm" className={`max-w-[180px] ${mini ? 'lg:hidden' : ''}`} />
          <AutoLinkLogo size="xs" className={`hidden max-w-[40px] ${mini ? 'lg:block' : ''}`} />
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-1 opacity-70" aria-label="Fermer le menu"><X size={20} /></button>
      </div>

      {!mini && (
        <div className="px-5 pt-4 pb-1 lg:hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Espace Propriétaire</span>
        </div>
      )}

      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-1 ${mini ? 'lg:px-3' : ''}`}>
        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const count = badge === 'msg' ? unreadMsg : badge === 'notif' ? unreadNotif : badge ? badges[badge] || 0 : 0;
          const active = pathname === path || (path !== '/owner/dashboard' && pathname.startsWith(path + '/'));
          return (
            <Link key={label} to={path} onClick={() => { setOpen(false); setCollapsed(true); }} title={mini ? label : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-label-lg text-label-lg ${active ? 'bg-primary text-white font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface dark:hover:bg-slate-800 dark:hover:text-slate-100'} ${mini ? 'lg:justify-center lg:px-0' : ''}`}>
              <Icon size={20} className="shrink-0" />
              <span className={`truncate flex-1 ${mini ? 'lg:hidden' : ''}`}>{label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold ${mini ? 'lg:hidden' : ''}`}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t border-outline-variant/30 dark:border-slate-800 shrink-0 ${mini ? 'lg:px-3' : ''}`}>
        <button onClick={handleLogout} title={mini ? 'Déconnexion' : undefined}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-md text-label-md text-error hover:bg-error-container dark:hover:bg-red-950/40 transition-all ${mini ? 'lg:justify-center lg:px-0' : ''}`}>
          <LogOut size={18} className="shrink-0" />
          <span className={mini ? 'lg:hidden' : ''}>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar desktop — s'ouvre au survol, se referme à la sortie */}
      <div className="hidden lg:block shrink-0"
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}>
        <Sidebar mini={collapsed} />
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="h-full max-w-[85vw] shadow-2xl"><Sidebar mini={false} /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar — même ergonomie que l'espace client */}
        <header className="h-16 lg:h-20 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Menu">
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/owner/messages')} title="Messages"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MessageSquare size={20} />
              {unreadMsg > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{unreadMsg}</span>}
            </button>
            <button onClick={() => navigate('/owner/notifications')} title="Notifications"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={20} />
              {unreadNotif > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadNotif}</span>}
            </button>

            {/* Pill profil + dropdown — style client */}
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
                <span className="hidden md:block text-left leading-tight">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{firstName} {lastName.charAt(0)}{lastName ? '.' : ''}</span>
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-2 z-20">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Espace Propriétaire</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{firstName} {lastName}</div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"><Moon size={15} />Thème</span>
                      <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <button onClick={() => toggleDark(false)} className={`px-2.5 py-1 text-[11px] font-semibold ${!dark ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>Clair</button>
                        <button onClick={() => toggleDark(true)} className={`px-2.5 py-1 text-[11px] font-semibold ${dark ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>Sombre</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"><Globe size={15} />Langue</span>
                      <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setLang('fr')} className={`px-2.5 py-1 text-[11px] font-semibold ${i18next.language === 'fr' ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>FR</button>
                        <button onClick={() => setLang('en')} className={`px-2.5 py-1 text-[11px] font-semibold ${i18next.language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>EN</button>
                      </div>
                    </div>
                    <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <User size={14} className="text-teal-600" /> Profil
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
