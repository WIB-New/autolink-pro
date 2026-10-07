import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsAPI, walletAPI } from '../services/api';
import TopUpModal from './TopUpModal';
import {
  Car, LogOut, Menu, X, Bell, User, ChevronDown, Sun, Moon, CheckCheck,
  LayoutDashboard, Search, FileText, Settings,
  Users, DollarSign, UserCheck, ClipboardList, PlusCircle, Tag,
  MessageSquare, Wrench, SlidersHorizontal, BarChart3, Wallet, Plus
} from 'lucide-react';

const NAV_ITEMS = {
  CLIENT: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/client/dashboard' },
    { icon: Search, label: 'Chercher un véhicule', path: '/client/search' },
    { icon: FileText, label: 'Mes réservations', path: '/client/bookings' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: BarChart3, label: 'Statistiques', path: '/client/stats' },
    { icon: Wallet, label: 'Mon portefeuille', path: '/client/wallet' },
  ],
  OWNER: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/owner/dashboard' },
    { icon: Car, label: 'Mes véhicules', path: '/owner/vehicles' },
    { icon: PlusCircle, label: 'Ajouter un véhicule', path: '/owner/add-vehicle' },
    { icon: UserCheck, label: 'Service chauffeur', path: '/owner/driver-service' },
    { icon: Wrench, label: 'Maintenance', path: '/owner/maintenance' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ],
  INTERMEDIARY: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/intermediary/dashboard' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Car, label: 'Véhicules', path: '/admin/inspections' },
    { icon: UserCheck, label: 'Chauffeurs', path: '/admin/drivers' },
    { icon: DollarSign, label: 'Finance', path: '/admin/finance' },
    { icon: Tag, label: 'Agents affiliés', path: '/admin/agents' },
    { icon: ClipboardList, label: 'Inspections', path: '/admin/inspections' },
    { icon: Wrench, label: 'Maintenance', path: '/admin/maintenance' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: SlidersHorizontal, label: 'Paramètres', path: '/admin/platform-settings' },
  ],
  CONTROLLER: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/controller/dashboard' },
    { icon: ClipboardList, label: 'Inspections', path: '/admin/inspections' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
  ],
};

// Identité visuelle par rôle : palette distincte (sidebar, accent actif, avatar)
const ROLE_THEME = {
  CLIENT:       { sidebar: 'bg-sky-950',    border: 'border-sky-800',    active: 'bg-sky-600',      avatar: 'from-sky-400 to-sky-600' },
  OWNER:        { sidebar: 'bg-emerald-950', border: 'border-emerald-800', active: 'bg-emerald-600',  avatar: 'from-emerald-400 to-emerald-600' },
  ADMIN:        { sidebar: 'bg-slate-950',  border: 'border-amber-800/50', active: 'bg-amber-600',    avatar: 'from-amber-400 to-amber-600' },
  CONTROLLER:   { sidebar: 'bg-purple-950', border: 'border-purple-800', active: 'bg-purple-600',   avatar: 'from-purple-400 to-purple-600' },
  INTERMEDIARY: { sidebar: 'bg-violet-950', border: 'border-violet-800', active: 'bg-violet-600',   avatar: 'from-violet-400 to-violet-600' },
  DRIVER:       { sidebar: 'bg-slate-900',  border: 'border-slate-800',  active: 'bg-primary-600',  avatar: 'from-primary-500 to-primary-700' },
};
const DEFAULT_THEME = ROLE_THEME.DRIVER;

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
      return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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

// ─── Carte solde AutoLink dans la sidebar (clients) ───────────────────────────
function WalletSidebarCard() {
  const [balance, setBalance] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);

  useEffect(() => {
    walletAPI.get()
      .then(res => setBalance(Number(res.data.balance)))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 shadow-lg">
        <p className="text-primary-200 text-[11px] font-medium">Mon solde AutoLink</p>
        <p className="text-2xl font-black text-white leading-snug">
          {balance === null ? '—' : `${Number(balance).toLocaleString()} F`}
        </p>
        <button onClick={() => setShowTopUp(true)}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-white text-primary-800 font-bold py-2 rounded-lg hover:bg-primary-50 transition-all text-xs shadow">
          <Plus size={14} /> Recharger
        </button>
        <p className="text-primary-200/70 text-[9px] mt-2 leading-snug">MTN MoMo · Orange Money · SenBid · PayBid · PayPal · Stripe</p>
      </div>
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onDone={(b) => setBalance(Number(b))} />}
    </>
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

  const navItems = NAV_ITEMS[user?.role] || [];
  const theme = ROLE_THEME[user?.role] || DEFAULT_THEME;

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
    <div className={`flex flex-col h-full ${theme.sidebar} ${mobile ? 'w-full' : 'w-64'}`}>
      {user?.role === 'CLIENT' && <WalletSidebarCard />}

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path} to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? `${theme.active} text-white shadow-lg` : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${theme.border}`}>
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
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title={isDark ? 'Mode clair' : 'Mode sombre'}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NotificationsBell />
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className={`w-8 h-8 bg-gradient-to-br ${theme.avatar} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
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
