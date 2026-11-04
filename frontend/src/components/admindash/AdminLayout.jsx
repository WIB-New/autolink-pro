import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import {
  LayoutDashboard, CalendarCheck, Car, Building2, Users, UserCheck,
  Landmark, AlertTriangle, Wrench, Settings, UserIcon,
  LogOut, Search, Bell, Menu, X, Siren,
  ChevronDown, ArrowRightLeft,
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

/* Layout « Console Ops » — sidebar claire auto-repliable (ouverture au survol) + topbar. */
export default function AdminLayout({ title, subtitle, children, badges = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  const renderSidebar = (mini) => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-100 ${mini ? 'w-20' : 'w-60'} transition-all duration-300`}>
      {/* Logo */}
      <div className={`pt-3 pb-3 border-b border-slate-100 flex items-center ${mini ? 'justify-center px-2' : 'px-4 gap-2'}`}>
        <Link to="/" className="flex items-center">
          <AutoLinkLogo size={mini ? 'xs' : 'xxs'} />
        </Link>
        {!mini && <span className="text-[9px] font-black text-teal-600 tracking-widest uppercase mt-1">Admin Panel</span>}
      </div>

      <nav className={`flex-1 py-4 space-y-3 overflow-y-auto ${mini ? 'px-2' : 'px-3'}`}>
        {ITEMS.map(item => {
          const active = pathname === item.to;
          const count = item.badge ? badges[item.badge] : null;
          return (
            <button key={item.label} onClick={() => { navigate(item.to); setMobileOpen(false); setCollapsed(true); }}
              title={mini ? item.label : undefined}
              className={`relative w-full flex items-center rounded-xl text-[13px] font-semibold transition-colors ${mini ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'} ${
                active ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              <item.icon size={17} />
              {!mini && <span className="flex-1 text-left">{item.label}</span>}
              {!mini && count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
              {mini && count > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          );
        })}
      </nav>

      {/* Carte assistance */}
      {/* {!mini && (
        <div className="px-3 pb-2">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="w-9 h-9 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-2.5">
              <LifeBuoy size={16} />
            </span>
            <div className="text-[12px] font-black text-slate-900">Support Ops 24/7</div>
            <button onClick={() => navigate('/admin/settings')}
              className="mt-2 flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 transition-colors">
              Centre d'aide <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
      {mini && (
        <div className="px-2 pb-2">
          <button onClick={() => navigate('/admin/settings')} title="Support Ops"
            className="w-full flex justify-center py-3 rounded-xl bg-slate-50 border border-slate-100 text-teal-600 hover:bg-teal-50 transition-colors">
            <LifeBuoy size={16} />
          </button>
        </div>
      )} */}

      {/* Utilisateur */}
      <div className={`border-t border-slate-100 ${mini ? 'p-2' : 'p-3'}`}>
        {mini ? (
          <div className="flex justify-center">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-black" title={`${user?.first_name} ${user?.last_name || ''}`}>
              {initials}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-black text-slate-900 truncate">{user?.first_name} {user?.last_name?.[0]}.</div>
              <div className="text-[10px] text-slate-400">Super Admin</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop — s'ouvre au survol, se referme à la sortie */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40"
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}>
        {renderSidebar(collapsed)}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 shadow-2xl">{renderSidebar(false)}</aside>
        </div>
      )}

      <div className={`${collapsed ? 'lg:pl-20' : 'lg:pl-60'} transition-all duration-300`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
          <div className="px-4 sm:px-6 h-16 flex items-center gap-1">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={20} /></button>

            {/* Recherche */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Rechercher un MoMo, VIN, Dossier…"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div className="flex-1 md:hidden" />

            {/* Groupe d'actions — toujours à l'extrémité droite du header */}
            <div className="ml-auto flex items-center gap-2 mr-1 sm:mr-3">
              <button className="relative p-2 text-slate-500 hover:text-teal-600 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="hidden sm:flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 text-[11px] font-bold px-3 py-2 rounded-full transition-colors">
                <Siren size={13} />
              </button>

              {/* Avatar + dropdown profil */}
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-50 transition-colors">
                  <span className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-[11px] font-black">
                    {initials}
                  </span>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-lg py-2 z-20">
                      <button onClick={() => { navigate('/Nos-vehicules'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <ArrowRightLeft size={14} className="text-teal-600" /> Mode Client
                      </button>
                      <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <UserIcon size={14} className="text-teal-600" /> Profil
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button onClick={() => { setMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 text-slate-500">
                {mobileOpen ? <X size={18} /> : null}
              </button>
            </div>
          </div>
        </header>

        {/* En-tête page + contenu centrés */}
        <div className="px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>

        <main className="px-4 sm:px-6 py-5 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
