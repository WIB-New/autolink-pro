import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsAPI } from '../services/api';
import AutoLinkLogo from './AutoLinkLogo';
import {
  Car, LogOut, Menu, X, Bell, User, ChevronDown, Sun, Moon, CheckCheck,
  LayoutDashboard, Search, FileText, Settings,
  Users, DollarSign, UserCheck, ClipboardList, PlusCircle, Image, Tag
} from 'lucide-react';

const NAV_ITEMS = {
  CLIENT: {
    space: 'Espace Client',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/client/dashboard' },
      { icon: 'directions_car', label: 'Mes Réservations', path: '/client/bookings' },
      { icon: 'account_balance_wallet', label: 'Portefeuille & Caution', path: '/client/wallet' },
      { icon: 'favorite', label: 'Favoris', path: '/client/favorites' },
      { icon: 'badge', label: 'Documents & Profil', path: '/profile' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'loyalty', label: 'Parrainage & Réductions', path: '/client/referrals' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
      { icon: 'directions_car', label: 'Catalogue', path: '/client/search' },
      { icon: 'help', label: 'Aide', path: '/help' },
    ],
  },
  OWNER: {
    space: 'Espace Propriétaire',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/owner/dashboard' },
      { icon: 'directions_car', label: 'Mes véhicules', path: '/owner/vehicles' },
      { icon: 'add_circle', label: 'Ajouter un véhicule', path: '/owner/add-vehicle' },
      { icon: 'fact_check', label: 'Demandes de location', path: '/owner/requests', badge: 'requests' },
      { icon: 'account_balance_wallet', label: 'Revenus & Finances', path: '/owner/revenue' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'manage_accounts', label: 'Profil & Documents', path: '/profile' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
  DRIVER: {
    space: 'Espace Chauffeur',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/driver/dashboard' },
      { icon: 'account_balance_wallet', label: 'Revenus & Retraits', path: '/driver/revenue' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'manage_accounts', label: 'Profil & Documents', path: '/profile' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
  ADMIN: {
    space: 'Admin Ops',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/admin/dashboard' },
      { icon: 'calendar_month', label: 'Réservations', path: '/admin/bookings' },
      { icon: 'directions_car', label: 'Véhicules', path: '/admin/catalog', badge: 'vehicles_pending' },
      { icon: 'key', label: 'Propriétaires & Retraits', path: '/admin/owners', badge: 'withdrawals_pending' },
      { icon: 'group', label: 'Clients & KYC', path: '/admin/users', badge: 'kyc_pending' },
      { icon: 'badge', label: 'Chauffeurs', path: '/admin/drivers' },
      { icon: 'payments', label: 'Finance', path: '/admin/finance' },
      { icon: 'gavel', label: 'Litiges', path: '/admin/disputes', badge: 'disputes_open' },
      { icon: 'build', label: 'Inspections', path: '/admin/inspections' },
      { icon: 'sell', label: 'Agents affiliés', path: '/admin/agents' },
      { icon: 'forum', label: 'Messagerie', path: '/messages', badge: 'messages' },
      { icon: 'contact_mail', label: 'Messages de contact', path: '/admin/messages', badge: 'contact_unhandled' },
      { icon: 'mail', label: 'Newsletter', path: '/admin/newsletter' },
      { icon: 'settings', label: 'Paramètres plateforme', path: '/admin/settings' },
    ],
  },
  CONTROLLER: {
    space: 'Espace Contrôleur',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/controller/dashboard' },
      { icon: 'fact_check', label: 'Inspections', path: '/admin/inspections' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
};

const ROLE_COLORS = {
  CLIENT: 'bg-blue-100 text-blue-700',
  OWNER: 'bg-primary-100 text-primary-700',
  DRIVER: 'bg-accent-100 text-accent-700',
  ADMIN: 'bg-red-100 text-red-700',
  CONTROLLER: 'bg-purple-100 text-purple-700',
};
const ROLE_LABELS = { CLIENT: 'Client', OWNER: 'Gestionnaire', DRIVER: 'Chauffeur', ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur' };

// ─── Panneau de notifications (données réelles de l'API) ───────────────────────
function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [offline, setOffline] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.list();
      setNotifs(data.results || []);
      setUnread(data.unread || 0);
      setOffline(false);
    } catch (_) { setOffline(true); }
  }, []);

  // Chargement initial + rafraîchissement automatique toutes les 30 s
  useEffect(() => {
    fetchNotifs();
    const t = setInterval(fetchNotifs, 30000);
    return () => clearInterval(t);
  }, [fetchNotifs]);

  // Fermer le panneau au clic extérieur
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const markAllRead = async () => {
    try { await notificationsAPI.readAll(); } catch (_) {}
    setUnread(0);
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  };

  const markRead = async (id) => {
    try { await notificationsAPI.read(id); } catch (_) {}
    setNotifs(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      const diff = (Date.now() - dt.getTime()) / 60000;
      if (diff < 60) return `il y a ${Math.max(1, Math.round(diff))} min`;
      if (diff < 1440) return `il y a ${Math.round(diff / 60)} h`;
      return dt.toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: 'numeric', month: 'short' });
    } catch (_) { return ''; }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => { setOpen(o => !o); if (!open) fetchNotifs(); }}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700"
        title="Notifications">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <span className="font-bold text-sm text-slate-800 dark:text-white">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline">
                <CheckCheck size={13} /> Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {offline && (
              <p className="text-xs text-slate-400 text-center py-6">API injoignable — notifications indisponibles.</p>
            )}
            {!offline && notifs.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Aucune notification pour le moment.</p>
            )}
            {notifs.map(n => (
              <button key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${n.is_read ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                  <div className={`min-w-0 ${n.is_read ? 'pl-4' : ''}`}>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{fmtDate(n.created_at)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const navConfig = NAV_ITEMS[user?.role] || { space: '', items: [] };
  const navItems = navConfig.items;

  // Fermer le menu profil au clic extérieur
  useEffect(() => {
    if (!profileOpen) return;
    const close = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 ${mobile ? 'w-full' : 'w-64'}`}>
      <div className="px-4 pt-2 pb-3 border-b border-slate-800 flex items-center justify-center">
        <Link to="/">
          <AutoLinkLogo size="md" />
        </Link>
      </div>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon, label, path, badge }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path} to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <span className="material-icons text-lg">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="hidden lg:flex flex-col w-64 shrink-0 shadow-xl">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-72 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
              <span className="text-white font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title={isDark ? 'Mode clair' : 'Mode sombre'}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NotificationsBell />
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-10">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="font-semibold text-slate-800 dark:text-white text-sm">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">
                    <User size={15} /> Mon profil
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">
                    <Settings size={15} /> Paramètres
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
