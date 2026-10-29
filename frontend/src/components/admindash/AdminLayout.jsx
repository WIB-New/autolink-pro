import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import {
  LayoutDashboard, CalendarCheck, Car, Building2, Users, UserCheck,
  Landmark, AlertTriangle, Wrench, MessageSquare, Settings,UserIcon,
  LogOut, Search, Bell, Menu, X, Siren, Radio,
} from 'lucide-react';

const ITEMS = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord',  badge: null },
  { to: '/admin/reservations', icon: CalendarCheck,  label: 'Réservations',     badge: 'reservations' },
  { to: '/admin/catalog',     icon: Car,             label: 'Véhicules',        badge: 'vehicles' },
  { to: '/admin/partenaires', icon: Building2,       label: 'Propriétaires',    badge: 'owners' },
  { to: '/admin/clients',     icon: Users,           label: 'Clients',          badge: 'clients' },
  { to: '/admin/drivers',     icon: UserCheck,       label: 'Chauffeurs',       badge: null },
  { to: '/admin/finance',     icon: Landmark,        label: 'Finances',         badge: 'finances' },
  { to: '/admin/litiges',     icon: AlertTriangle,   label: 'Litiges',          badge: 'disputes' },
  { to: '/admin/inspections', icon: Wrench,          label: 'Maintenance',      badge: null },
  { to: '/admin/agents',      icon: UserIcon,   label: 'Agents',         badge: 'messages' },
  { to: '/admin/settings',    icon: Settings,        label: 'Paramètres',       badge: null },
];

/* Layout « Console Ops » — sidebar sombre + topbar plateforme (maquette admin). */
export default function AdminLayout({ title, subtitle, children, badges = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  const sidebar = (
    <div className="flex flex-col h-full bg-slate-900 w-60">
      {/* Logo */}
      <div className="px-4 pt-2 pb-3 border-b border-slate-800 flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <AutoLinkLogo size="xs" />
        </Link>
        <span className="text-[9px] font-black text-teal-400 tracking-widest uppercase mt-1">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {ITEMS.map(item => {
          const active = pathname === item.to;
          const count = item.badge ? badges[item.badge] : null;
          return (
            <button key={item.label} onClick={() => { navigate(item.to); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                active ? 'bg-teal-600/15 text-teal-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <item.icon size={17} />
              <span className="flex-1 text-left">{item.label}</span>
              {count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Utilisateur + déconnexion */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-black text-white truncate">{user?.first_name} {user?.last_name?.[0]}.</div>
            <div className="text-[10px] text-slate-400">Super Admin</div>
          </div>
        </div>
        <button onClick={logout}
          className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors">
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-40">{sidebar}</aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
          <div className="px-4 sm:px-6 h-16 flex items-center gap-1">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={20} /></button>

            {/* <span className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              <Radio size={12} className="text-teal-600" /> Console Ops
            </span>
            <span className="hidden md:block bg-teal-50 text-teal-700 text-[11px] font-bold px-3 py-1.5 rounded-full">
              Plateforme CEMAC
            </span> */}

            {/* Recherche */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Rechercher un MoMo, VIN, Dossier…"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div className="flex-1 md:hidden" />

            {/* <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> CEMAC Hub En ligne
            </span> */}
            {/* Groupe d'actions — toujours à l'extrémité droite du header */}
            <div className="ml-auto flex items-center gap-2">
              <button className="relative p-2 text-slate-500 hover:text-teal-600 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="hidden sm:flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 text-[11px] font-bold px-3 py-2 rounded-full transition-colors">
                <Siren size={13} />
              </button>
              <button onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-[11px] font-black">
                {initials}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-slate-500">
                {mobileOpen ? <X size={18} /> : null}
              </button>
            </div>
          </div>
        </header>

        {/* En-tête page */}
        <div className="px-4 sm:px-6 pt-6">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <main className="px-4 sm:px-6 py-5">{children}</main>
      </div>
    </div>
  );
}
