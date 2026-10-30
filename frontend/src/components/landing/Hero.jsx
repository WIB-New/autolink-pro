import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
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
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = '#134e4a';
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/55 to-slate-900/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/70 to-transparent" />
      </div>

      {/* Contenu du hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-[72vh]">
        <div className="grid lg:grid-cols-2 gap-10 items-center flex-1">
          {/* Texte */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-[2.4rem] font-black text-white leading-tight mb-6">
              Louez un véhicule <span className="text-teal-400">vérifié</span>{' '}
              à Douala &amp; Yaoundé
            </h1>
            <p className="text-lg text-slate-200 leading-relaxed mb-8 max-w-xl">
              Fini les mauvaises surprises : chaque véhicule est inspecté avant votre
              départ et chaque chauffeur est certifié. Du trajet professionnel au
              week-end en famille, roulez l'esprit tranquille, avecune équipe à votre écoute à toute heure.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-200">
              {['Annulation gratuite 24h avant', 'Chauffeurs certifiés', 'Assurance incluse'].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-teal-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Indicateurs du carrousel */}
          <div className="relative hidden lg:block min-h-[300px]">
            <div className="absolute bottom-4 right-0 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Visuel ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/50 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche : centrée sur le bord inférieur du hero */}
      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2 px-4">
        <div className="max-w-6xl mx-auto">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}