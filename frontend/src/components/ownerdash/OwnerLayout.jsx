import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import {
  LayoutDashboard, Car, FileText, Wallet, MessageSquare, Bell,
  Settings, LogOut, MapPin, BadgeCheck, Menu, X, ArrowRightLeft, Banknote, PlusSquare,
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Tableau de bord',      path: '/owner/dashboard' },
  { icon: Car,             label: 'Mes véhicules',        path: '/owner/vehicles' },
  { icon: PlusSquare,      label: 'Ajouter un véhicule',  path: '/owner/add-vehicle' },
  { icon: FileText,        label: 'Demandes de location', path: '/owner/requests', badge: 'demandes' },
  { icon: Wallet,          label: 'Revenus & Finances',   path: '/owner/revenue' },
  { icon: MessageSquare,   label: 'Messagerie',           path: '/owner/dashboard', badge: 'messages', passive: true },
  { icon: Bell,            label: 'Notifications',        path: '/owner/dashboard', passive: true },
  { icon: Settings,        label: 'Profil & Paramètres',  path: '/settings' },
];

/* Layout de l'espace propriétaire — sidebar claire + topbar avec solde (maquette). */
export default function OwnerLayout({ children, badges = {}, balance = null }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 w-60">
      <div className="px-4 pt-2 pb-3 flex items-center border-b border-slate-50">
        <Link to="/" className="flex items-center">
          <AutoLinkLogo size="sm" />
        </Link>
      </div>

      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Espace Propriétaire</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path, badge, passive }) => {
          const count = badge ? badges[badge] || 0 : 0;
          const active = !passive && (pathname === path || (path !== '/owner/dashboard' && pathname.startsWith(path + '/')));
          return (
            <Link key={label} to={path} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'}`}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button onClick={() => navigate('/catalogue')}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-teal-50 hover:text-teal-700 w-full transition-colors">
          <ArrowRightLeft size={17} /> Basculer en Mode Client
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors">
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="hidden lg:block shrink-0"><Sidebar /></div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Menu Propriétaire</span>
              <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400"><X size={20} /></button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"><Menu size={20} /></button>
            {/* <button className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl hover:border-teal-300 transition-colors">
              <MapPin size={13} className="text-teal-600" /> Douala &amp; Yaoundé
            </button> */}
            <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-2 rounded-xl">
              <BadgeCheck size={13} /> Partenaire certifié
            </span>
          </div>
          <div className="flex items-center gap-3">
            {balance !== null && (
              <span className="hidden md:flex items-center gap-1.5 bg-slate-900 text-white text-xs font-black px-3.5 py-2 rounded-xl">
                {Math.round(balance).toLocaleString('fr-FR')} <span className="text-teal-400">FCFA</span>
              </span>
            )}
            {/* <button className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors">
              <Banknote size={13} /> Retirer
            </button> */}
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={18} />
              {badges.demandes > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-2.5">
              <span className="hidden sm:block text-right leading-tight">
                <span className="block text-xs font-bold text-slate-800">{user?.firstName} {user?.lastName?.charAt(0)}.</span>
                <span className="block text-[10px] text-slate-400">Partenaire depuis 2024</span>
              </span>
              <span className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
