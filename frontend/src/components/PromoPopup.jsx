import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Car, Shield, Zap, KeyRound, ChevronRight } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';
import { Link } from 'react-router-dom';
import AutoLinkLogo from '../components/AutoLinkLogo';

// Popup d'accueil — campagne de conversion : pousse à la réservation.
// Affiché une fois par session, ~1,2 s après le chargement de la page.
export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('autolink_promo_seen')) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem('autolink_promo_seen', '1');
    setShow(false);
  };

  const go = (path) => { close(); navigate(path); };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={close}>
      <div className="relative w-full max-w-md bg-gradient-to-b from-primary-950 to-slate-900 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Bandeau visuel : Ajout de h-full, flex, items-center et justify-center */}
        <div className="relative h-40 bg-gradient-to-br from-primary-600 via-primary-800 to-slate-900 flex items-center justify-center">
          <Link to="/" className="flex items-center justify-center mb-0">
            <AutoLinkLogo size="sm" />
          </Link> 
          <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-primary-950 to-transparent pointer-events-none" />
          <span className="absolute top-4 left-4 bg-accent-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Offre de lancement
          </span>
          <button onClick={close} aria-label="Fermer"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-7 pb-7 mt-4">
          <h2 className="text-2xl font-black text-white leading-normal">
            Votre véhicule vous attend.<br />
            <span className="text-accent-400">Réservation en 2 minutes.</span>
          </h2>
          <p className="text-primary-200 text-sm mt-2">
            Berlines, 4×4, vans — avec ou sans chauffeur, partout au Cameroun.
          </p>

          {/* Connexion express */}
          <div className="mt-5 space-y-2.5">
            <button onClick={() => go('/catalogue')}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-1 font-bold">
              Réserver vers vehicule <ChevronRight size={18} />
            </button>
            <button onClick={close} className="w-full text-center text-xs text-primary-300 hover:text-white py-1 transition">
              Continuer sans compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
