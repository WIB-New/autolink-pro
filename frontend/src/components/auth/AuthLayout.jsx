import React from 'react';
import { Link } from 'react-router-dom';
import AutoLinkLogo from '../AutoLinkLogo';

/* Layout partagé des écrans d'authentification (login, register, OTP) —
   page centré sans navigation : logo → retour accueil, fond clair ou dégradé. */
export default function AuthLayout({ children, gradient = false, maxW = 'max-w-xl' }) {
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${gradient ? 'bg-gradient-to-br from-teal-100 via-sky-100 to-indigo-200' : 'bg-slate-50'}`}>
      <div className={`w-full ${maxW}`}>
        {/* <Link to="/" className="flex items-center justify-center mb-8">
          <AutoLinkLogo size="md" />
        </Link> */}
        {children}
      </div>
    </div>
  );
}
