import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import i18next from '../../i18n';
import {
  LayoutDashboard, CalendarCheck, Car, Building2, Users, UserCheck,
  Landmark, AlertTriangle, Wrench, Settings, UserIcon,
  LogOut, Search, Bell, Menu, X,
  ChevronDown, Moon, MessageSquare, FileSearch, Globe,
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
  { to: '/admin/messages',    icon: MessageSquare, label: 'Messagerie',  badge: 'msg' },
  { to: '/admin/notifications', icon: Bell,        label: 'Notifications', badge: 'notif' },
  { to: '/admin/agents',      icon: UserIcon,   label: 'Agents',         badge: 'messages' },
  { to: '/admin/settings',    icon: Settings,        label: 'Paramètres',       badge: null },
];

/* Layout « Console Ops » — sidebar claire auto-repliable (ouverture au survol) + topbar. */
export default function AdminLayout({ title, subtitle, children, badges = {}, fluid = false }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  /* Recherche globale : réservations + véhicules + utilisateurs (endpoints ?search=). */
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState({ bookings: [], vehicles: [], users: [] });
  const searchRef = useRef(null);
  useEffect(() => {
    const close = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSearchOpen(false); setResults({ bookings: [], vehicles: [], users: [] }); return undefined; }
    setSearchOpen(true); setSearching(true);
    const t = setTimeout(() => {
      import('../../services/api').then(({ bookingsAPI, adminVehiclesAPI, usersAPI }) => {
        Promise.allSettled([
          bookingsAPI.list({ search: q, page_size: 4 }),
          adminVehiclesAPI.list({ search: q, page_size: 4 }),
          usersAPI.list({ search: q, page_size: 4 }),
        ]).then(([b, v, u]) => {
          const arr = (r) => (r.status === 'fulfilled' ? (r.value?.data?.results || r.value?.data || []) : []);
          setResults({ bookings: arr(b).slice(0, 4), vehicles: arr(v).slice(0, 4), users: arr(u).slice(0, 4) });
          setSearching(false);
        });
      });
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'A';

  const renderSidebar = (mini) => (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 text-on-surface border-r border-outline-variant/30 transition-[width] duration-300 w-72 ${mini ? 'lg:w-[76px]' : 'lg:w-72'} overflow-hidden`}>
      {/* Logo */}
      <div className={`h-20 px-4 flex items-center shrink-0 border-b border-outline-variant/30 dark:border-slate-800 ${mini ? 'justify-between lg:justify-center' : 'justify-between'}`}>
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <AutoLinkLogo size="sm" className={`max-w-[160px] ${mini ? 'lg:hidden' : ''}`} />
          <AutoLinkLogo size="xs" className={`hidden max-w-[40px] ${mini ? 'lg:block' : ''}`} />
          <span className={`text-[9px] font-black text-teal-600 tracking-widest uppercase ${mini ? 'lg:hidden' : ''}`}>Admin Panel</span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 opacity-70" aria-label="Fermer le menu"><X size={20} /></button>
      </div>

      <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-1 ${mini ? 'lg:px-3' : ''}`}>
        {ITEMS.map(item => {
          const active = pathname === item.to;
          const count = item.badge === 'msg' ? unreadMsg : item.badge === 'notif' ? unreadNotif : item.badge ? badges[item.badge] : null;
          return (
            <button key={item.label} onClick={() => { navigate(item.to); setMobileOpen(false); setCollapsed(true); }}
              title={mini ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-label-lg text-label-lg ${mini ? 'lg:justify-center lg:px-0' : ''} ${
                active ? 'bg-primary text-white font-semibold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}>
              <item.icon size={20} className="shrink-0" />
              <span className={`truncate flex-1 text-left ${mini ? 'lg:hidden' : ''}`}>{item.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm font-bold ${mini ? 'lg:hidden' : ''}`}>
                  {count}
                </span>
              )}
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
      <div className={`p-4 border-t border-outline-variant/30 dark:border-slate-800 shrink-0 ${mini ? 'lg:px-3' : ''}`}>
        <div className={`flex items-center gap-3 ${mini ? 'lg:justify-center' : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3'}`}>
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0" title={`${user?.first_name} ${user?.last_name || ''}`}>
            {initials}
          </div>
          <div className={`min-w-0 flex-1 ${mini ? 'lg:hidden' : ''}`}>
            <div className="text-[12px] font-black text-slate-900 dark:text-slate-100 truncate">{user?.first_name} {user?.last_name?.[0]}.</div>
            <div className="text-[10px] text-slate-400">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
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

      <div className={`${collapsed ? 'lg:pl-[76px]' : 'lg:pl-72'} transition-all duration-300 ${fluid ? 'h-screen flex flex-col overflow-hidden' : ''}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-slate-600"><Menu size={20} /></button>

            {/* Recherche globale — réservations, véhicules, utilisateurs */}
            <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setSearchOpen(true)}
                placeholder="Rechercher une réservation, plaque, client…"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                  {searching && <div className="px-4 py-3 text-[11px] text-slate-400">Recherche…</div>}
                  {!searching && results.bookings.length + results.vehicles.length + results.users.length === 0 && (
                    <div className="px-4 py-3 text-[11px] text-slate-400">Aucun résultat pour « {query.trim()} »</div>
                  )}
                  {results.bookings.length > 0 && (
                    <div>
                      <div className="px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Réservations</div>
                      {results.bookings.map((b) => (
                        <button key={b.id} onClick={() => { setSearchOpen(false); setQuery(''); navigate(`/admin/reservations/${b.id}`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                          <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><FileSearch size={14} /></span>
                          <span className="min-w-0">
                            <span className="block text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">BK-{String(b.id).padStart(4, '0')} · {b.client_name || '—'}</span>
                            <span className="block text-[10px] text-slate-400 truncate">{b.vehicle_name || ''} · {b.status}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.vehicles.length > 0 && (
                    <div className="border-t border-slate-50 dark:border-slate-800">
                      <div className="px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Véhicules</div>
                      {results.vehicles.map((v) => (
                        <button key={v.id} onClick={() => { setSearchOpen(false); setQuery(''); navigate(`/admin/vehicles/${v.id}`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                          <span className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><Car size={14} /></span>
                          <span className="min-w-0">
                            <span className="block text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">{v.brand} {v.model} {v.year || ''}</span>
                            <span className="block text-[10px] text-slate-400 truncate">{v.plate} · {v.status}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.users.length > 0 && (
                    <div className="border-t border-slate-50 dark:border-slate-800">
                      <div className="px-4 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Utilisateurs</div>
                      {results.users.map((u) => {
                        const dest = u.role === 'OWNER' ? `/admin/partenaires/${u.id}` : u.role === 'CLIENT' ? `/admin/clients/${u.id}` : '/admin/users';
                        return (
                          <button key={u.id} onClick={() => { setSearchOpen(false); setQuery(''); navigate(dest); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                            <span className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><UserIcon size={14} /></span>
                            <span className="min-w-0">
                              <span className="block text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">{u.first_name} {u.last_name}</span>
                              <span className="block text-[10px] text-slate-400 truncate">{u.email} · {u.role}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="h-2" />
                </div>
              )}
            </div>

            <div className="flex-1 md:hidden" />

            {/* Groupe d'actions — style espace client */}
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button onClick={() => navigate('/admin/messages')} title="Messagerie"
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MessageSquare size={20} />
                {unreadMsg > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">{unreadMsg}</span>}
              </button>
              <button onClick={() => navigate('/admin/notifications')} title="Notifications"
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={20} />
                {unreadNotif > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadNotif}</span>}
              </button>

              {/* Pill profil + dropdown — style client */}
              <div className="relative">
                <button onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-[11px] font-black">
                    {initials}
                  </span>
                  <span className="hidden md:block text-left leading-tight">
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{user?.first_name} {user?.last_name?.[0]}.</span>
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-2 z-20">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Espace Admin</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.first_name} {user?.last_name}</div>
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
                        <UserIcon size={14} className="text-teal-600" /> Profil
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button onClick={() => { setMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <LogOut size={14} /> Déconnexion
                        </button>
                      </div>
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
        {title && (
          <div className="px-4 sm:px-6 pt-6 max-w-7xl mx-auto w-full">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}

        {fluid ? (
          <main className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 py-5">{children}</main>
        ) : (
          <main className="px-4 sm:px-6 py-5 max-w-7xl mx-auto">{children}</main>
        )}
      </div>
    </div>
  );
}
