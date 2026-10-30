import React from 'react';
import { Link } from 'react-router-dom';
import AutoLinkLogo from '../AutoLinkLogo';
import { ArrowLeft } from 'lucide-react';

/* Layout partagé des écrans d'authentification (login, register, OTP) —
   page centré sans navigation : logo → retour accueil, fond clair ou dégradé. */
export default function AuthLayout({ children, gradient = false, maxW = 'max-w-xl' }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${gradient ? 'bg-gradient-to-br from-teal-100 via-sky-100 to-indigo-200' : 'bg-slate-50'}`}>
      <div className={`w-full ${maxW}`}>
        {/* Lien de retour à l'accueil aligné avec le conteneur du formulaire */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link>
        
        {/* Contenu de la page (Formulaire, OTP, etc.) */}
        {children}
      </div>
    </div>
  );
}
