import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import { NotificationsBell } from '../DashboardLayout';
import {
  LayoutDashboard, Car, FileText, Wallet,
  Settings, LogOut, Menu, X, ArrowRightLeft, PlusSquare,
  ChevronDown, User, Sun, Moon,
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Tableau de bord',      path: '/owner/dashboard' },
  { icon: Car,             label: 'Mes véhicules',        path: '/owner/vehicles' },
  { icon: PlusSquare,      label: 'Ajouter un véhicule',  path: '/owner/add-vehicle' },
  { icon: FileText,        label: 'Réservations',         path: '/owner/requests', badge: 'demandes' },
  { icon: Wallet,          label: 'Revenus & Finances',   path: '/owner/revenue' },
  { icon: Settings,        label: 'Profil & Paramètres',  path: '/settings' },
];

/* Layout de l'espace propriétaire — sidebar claire auto-repliable (survol) + topbar. */
export default function OwnerLayout({ children, badges = {}, balance = null }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggleDark = () => {
    const v = !dark;
    setDark(v);
    document.documentElement.classList.toggle('dark', v);
    localStorage.setItem('autolink_theme', v ? 'dark' : 'light');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mini }) => (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 ${mini ? 'w-20' : 'w-60'} transition-all duration-300`}>
      <div className={`pt-3 pb-3 flex items-center border-b border-slate-100 dark:border-slate-800 ${mini ? 'justify-center px-2' : 'px-4'}`}>
        <Link to="/" className="flex items-center">
          <AutoLinkLogo size={mini ? 'xs' : 'xxs'} />
        </Link>
      </div>

      {!mini && (
        <div className="px-5 pt-4 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Espace Propriétaire</span>
        </div>
      )}
      {mini && <div className="pt-3" />}

      <nav className={`flex-1 space-y-3 overflow-y-auto ${mini ? 'px-2' : 'px-3'}`}>
        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const count = badge ? badges[badge] || 0 : 0;
          const active = pathname === path || (path !== '/owner/dashboard' && pathname.startsWith(path + '/'));
          return (
            <Link key={label} to={path} onClick={() => { setOpen(false); setCollapsed(true); }} title={mini ? label : undefined}
              className={`relative flex items-center rounded-xl text-sm font-semibold transition-all ${mini ? 'justify-center px-0 py-3' : 'gap-3 px-3.5 py-2.5'} ${active ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'}`}>
              <Icon size={17} />
              {!mini && <span className="flex-1">{label}</span>}
              {!mini && count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{count}</span>
              )}
              {mini && count > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-slate-100 dark:border-slate-800 space-y-1 ${mini ? 'p-2' : 'p-3'}`}>
        <button onClick={handleLogout} title={mini ? 'Déconnexion' : undefined}
          className={`flex items-center rounded-xl text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 w-full transition-colors ${mini ? 'justify-center px-0 py-2.5' : 'gap-3 px-3.5 py-2.5'}`}>
          <LogOut size={16} /> {!mini && 'Déconnexion'}
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
          <div className="w-64 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Menu Propriétaire</span>
              <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400"><X size={20} /></button>
            </div>
            <Sidebar mini={false} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Menu size={20} /></button>
          </div>
          <div className="flex items-center gap-3 mr-1 sm:mr-3">
            <button onClick={toggleDark} title={dark ? 'Mode clair' : 'Mode sombre'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationsBell />

            {/* Avatar + dropdown profil */}
            <div className="relative">
              <button onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="hidden sm:block text-right leading-tight">
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{user?.firstName} {user?.lastName?.charAt(0)}.</span>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500">Partenaire</span>
                </span>
                <span className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-lg py-2 z-20">
                    <button onClick={() => { navigate('/Nos-vehicules'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <ArrowRightLeft size={14} className="text-teal-600" /> Mode Client
                    </button>
                    <button onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <User size={14} className="text-teal-600" /> Profil
                    </button>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={14} /> Déconnexion
                    </button>
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
