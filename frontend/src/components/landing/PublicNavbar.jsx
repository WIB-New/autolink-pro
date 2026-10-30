// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { Phone, Menu, X, LayoutDashboard, MapPin, Clock } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';
// import AutoLinkLogo from '../AutoLinkLogo';
// import { NAV_LINKS } from './data';

// const PUBLIC_LINKS = [
//   { label: 'Accuiel',           href: '/' },
//   { label: 'Catalogue',           href: '/catalogue' },
//   { label: 'Comment ça marche',   href: '/comment-ca-marche' },
//   { label: 'Tarifs',              href: '/tarifs' },
//   { label: 'Devenir propriétaire',href: '/devenir-proprietaire' },
//   { label: 'Aide',                href: '/aide' },
// ];

// /* Navbar publique partagée — landing (ancres) & pages publiques (liens router) */
// export default function PublicNavbar() {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const { isAuthenticated, user, getDashboardPath } = useAuth();
//   const [scrolled, setScrolled] = useState(false);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', fn, { passive: true });
//     return () => window.removeEventListener('scroll', fn);
//   }, []);

//   const onHome = pathname === '/';
//   const links = onHome ? NAV_LINKS : PUBLIC_LINKS;
//   const renderLink = (l) => l.href.startsWith('#')
//     ? <a key={l.href} href={l.href}
//         className="text-sm font-medium text-teal-600 hover:text-teal-600 transition-colors">{l.label}</a>
//     : <Link key={l.href} to={l.href}
//         className={`text-sm font-medium transition-colors ${pathname === l.href ? 'text-teal-600 font-bold' : 'text-slate-600 hover:text-teal-600'}`}>
//         {l.label}
//       </Link>;

//   return (
//     <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-slate-100'}`}>
//       {/* Barre d'information supérieure */}
//       <div className="hidden md:block bg-slate-900 text-slate-300">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs">
//           <div className="flex items-center gap-5">
//             <a href="tel:+237656789000" className="flex items-center gap-1.5 hover:text-white transition-colors">
//               <Phone size={12} className="text-teal-400" /> +237 656 789 000
//             </a>
//             <span className="flex items-center gap-1.5">
//               <MapPin size={12} className="text-teal-400" /> Douala &amp; Yaoundé, Cameroun
//             </span>
//           </div>
//           <div className="flex items-center gap-5">
//             <span className="flex items-center gap-1.5">
//               <Clock size={12} className="text-teal-400" /> Assistance 7j/7 — 6h à 22h
//             </span>
//             <Link to="/devenir-proprietaire" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
//               Devenir partenaire →
//             </Link>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16 lg:h-20">
//           {/* Logo */}
//           <Link to="/" className="flex items-center shrink-0">
//             <AutoLinkLogo size="xs" />
//           </Link>

//           {/* Desktop nav links */}
//           <nav className="hidden lg:flex items-center gap-7 ml-12">
//             {links.map(renderLink)}
//           </nav>

//           {/* Desktop CTA */}
//           <div className="hidden lg:flex items-center gap-4">
//             {isAuthenticated ? (
//               <button onClick={() => navigate(getDashboardPath(user?.role))}
//                 className="flex items-center gap-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
//                 <LayoutDashboard size={15} /> Mon espace
//               </button>
//             ) : (
//               <>
//                 <button onClick={() => navigate('/login')}
//                   className="text-sm font-semibold text-slate-700 border hover:bg-teal-600 border-teal-600 rounded-lg hover:text-white px-3 py-2 transition-colors">
//                   Se connecter
//                 </button>
//                 <button onClick={() => navigate('/register')}
//                   className="text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
//                   S'inscrire
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Mobile burger */}
//           <button onClick={() => setOpen(!open)}
//             className="lg:hidden p-2 text-slate-700" aria-label="Menu">
//             {open ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile dropdown */}
//       {open && (
//         <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg px-4 py-4">
//           {links.map(l => (
//             <Link key={l.href} to={l.href.startsWith('#') ? '/' : l.href}
//               onClick={(e) => { if (l.href.startsWith('#')) { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }); } setOpen(false); }}
//               className="block py-3 px-2 text-slate-700 font-medium border-b border-slate-50 hover:text-teal-600 transition-colors text-sm">
//               {l.label}
//             </Link>
//           ))}
//           <div className="flex gap-3 pt-4">
//             {isAuthenticated ? (
//               <button onClick={() => navigate(getDashboardPath(user?.role))}
//                 className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded-lg text-sm">
//                 Mon espace
//               </button>
//             ) : (
//               <>
//                 <button onClick={() => navigate('/login')}
//                   className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg text-sm">
//                   Connexion
//                 </button>
//                 <button onClick={() => navigate('/register')}
//                   className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-lg text-sm">
//                   Inscription
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </header>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, Menu, X, LayoutDashboard, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AutoLinkLogo from '../AutoLinkLogo';
import { NAV_LINKS } from './data';

/* « Devenir propriétaire » n'est plus un lien : c'est un bouton (voir plus bas) */
const PUBLIC_LINKS = [
  { label: 'Accueil',             href: '/' },
  { label: 'Catalogue',           href: '/catalogue' },
  { label: 'Comment ça marche',   href: '/comment-ca-marche' },
  { label: 'Tarifs',              href: '/tarifs' },
  { label: 'Aide',                href: '/aide' },
];

/* Navbar publique partagée — landing (ancres) & pages publiques (liens router) */
export default function PublicNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAuthenticated, user, getDashboardPath } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const onHome = pathname === '/';
  const links = onHome ? NAV_LINKS : PUBLIC_LINKS;
  const renderLink = (l) => l.href.startsWith('#')
    ? <a key={l.href} href={l.href}
        className="text-sm font-medium text-teal-600 hover:text-teal-600 transition-colors">{l.label}</a>
    : <Link key={l.href} to={l.href}
        className={`text-sm font-medium transition-colors ${pathname === l.href ? 'text-teal-600 font-bold' : 'text-slate-600 hover:text-teal-600'}`}>
        {l.label}
      </Link>;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-slate-100'}`}>
      {/* Barre d'information supérieure */}
      <div className="hidden md:block bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <a href="tel:+237656789000" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={12} className="text-teal-400" /> +237 656 789 000
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-teal-400" /> Douala &amp; Yaoundé, Cameroun
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-teal-400" /> Assistance 7j/7 — 6h à 22h
            </span>
            <Link to="/devenir-proprietaire" className="font-semibold text-teal-400 hover:text-teal-300 transition-colors">
              Devenir partenaire →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <AutoLinkLogo size="xs" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7 ml-12">
            {links.map(renderLink)}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <button onClick={() => navigate(getDashboardPath(user?.role))}
                className="flex items-center gap-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                <LayoutDashboard size={15} /> Mon espace
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-slate-700 border hover:bg-teal-600 border-teal-600 rounded-lg hover:text-white px-3 py-2 transition-colors">
                  S'authentifier
                </button>
                {/* <button onClick={() => navigate('/register')}
                  className="text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                  S'inscrire
                </button> */}
              </>
            )}

            {/* Devenir propriétaire — bouton (couleur primaire) */}
            <button onClick={() => navigate('/devenir-proprietaire')}
              className="text-sm font-bold bg-teal-600 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap">
              Devenir propriétaire
            </button>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-slate-700" aria-label="Menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg px-4 py-4">
          {links.map(l => (
            <Link key={l.href} to={l.href.startsWith('#') ? '/' : l.href}
              onClick={(e) => { if (l.href.startsWith('#')) { e.preventDefault(); document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' }); } setOpen(false); }}
              className="block py-3 px-2 text-slate-700 font-medium border-b border-slate-50 hover:text-teal-600 transition-colors text-sm">
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-4">
            {isAuthenticated ? (
              <button onClick={() => navigate(getDashboardPath(user?.role))}
                className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded-lg text-sm">
                Mon espace
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')}
                  className="flex-1 border border-slate-300 text-slate-700 font-semibold py-2.5 rounded-lg text-sm">
                  Connexion
                </button>
                <button onClick={() => navigate('/register')}
                  className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-lg text-sm">
                  Inscription
                </button>
              </>
            )}
          </div>
          <button onClick={() => { navigate('/devenir-proprietaire'); setOpen(false); }}
            className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
            Devenir propriétaire
          </button>
        </div>
      )}
    </header>
  );
}
