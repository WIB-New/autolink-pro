import React, { useState, useEffect } from 'react';
import { CheckCircle, Smartphone } from 'lucide-react';
import { HERO_SLIDES, VEHICLE_IMAGES } from '../../utils/carImages';
import SearchWidget from './SearchWidget';

/* Visuels du carrousel — slides dédiés + photos de la flotte */
const SLIDES = [
  ...HERO_SLIDES.map(s => s.image),
  VEHICLE_IMAGES.suv,
  VEHICLE_IMAGES.luxe,
];
const SLIDE_MS = 8000; // changement de visuel toutes les 8 s

/* Hero de la landing : image en fond pleine section + carrousel de véhicules */
export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="accueil" className="relative pt-28 lg:pt-36 pb-10">
      {/* Carrousel plein écran — couvre toute la hauteur et largeur de la section */}
      <div className="absolute inset-0">
        {SLIDES.map((src, i) => (
          <img key={src} src={src} alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/70 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-[72vh]">
        <div className="grid lg:grid-cols-2 gap-10 items-center flex-1">
          {/* Texte — titre sur 2 lignes maximum */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-teal-400 rounded-full" />
              N°1 de la location vérifiée au Cameroun
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-tight mb-6">
              Louez un véhicule <span className="text-teal-400">vérifié</span><br />
              à Douala &amp; Yaoundé
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed mb-8 max-w-xl">
              Berlines, SUV et véhicules de luxe inspectés, avec chauffeur certifié
              ou en autoconduite. Paiement sécurisé par Mobile Money, assistance 24/7 — en toute sérénité.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-200 mb-8">
              {['Annulation gratuite 24h avant', 'Chauffeurs certifiés', 'Assurance incluse'].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-teal-400" />
                  {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="https://github.com/WIB-New/autolink-pro/releases/download/v3.1-apk/autolink-pro-v3.1.apk"
                className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-400/40">
                <Smartphone size={22} />
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wider opacity-80">Application Android</span>
                  <span className="block text-base">Télécharger l'APK v3.1</span>
                </span>
              </a>
              <span className="text-xs text-slate-300">Gratuite · Installation directe<br />Android 8.0+</span>
            </div>
          </div>

          {/* Cartes flottantes + indicateurs du carrousel */}
          <div className="relative hidden lg:block min-h-[300px]">
            {/* Points du carrousel */}
            <div className="absolute bottom-4 right-0 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Visuel ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/50 hover:bg-white'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Barre de recherche — chevauche le bord inférieur du hero */}
        <div className="relative z-10 mt-12 -mb-14">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
