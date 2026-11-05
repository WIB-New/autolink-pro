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
    <section
      id="accueil"
      className="relative flex flex-col justify-center min-h-[100svh] lg:min-h-[85vh] pt-28 lg:pt-36 pb-16 lg:pb-20"
    >
      {/* Carrousel plein écran */}
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
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/70 to-transparent" />
      </div>

      {/* Contenu : texte à gauche (centré verticalement) + barre de recherche dans le hero */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 lg:gap-12">
        <div className="max-w-2xl text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-5 lg:mb-6">
            Louez un véhicule <span className="text-teal-400">vérifié</span>{' '}
            au Cameroun
          </h1>
          <p className="text-base lg:text-lg text-slate-200 leading-relaxed mb-6 lg:mb-8">
            Fini les mauvaises surprises : chaque véhicule est inspecté avant votre
            départ et chaque chauffeur est certifié. Du trajet professionnel au
            week-end en famille, roulez l'esprit tranquille, avec une équipe à votre écoute à toute heure.
          </p>
          <div className="flex flex-wrap items-center gap-3 lg:gap-6 text-xs lg:text-sm text-slate-200">
            {['Chauffeurs certifiés', 'Assurance incluse'].map(t => (
              <span key={t} className="flex items-center gap-1.5 lg:gap-2">
                <CheckCircle size={14} className="text-teal-400" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Barre de recherche dans le hero */}
        <SearchWidget />
      </div>

      {/* Indicateurs du carrousel — desktop uniquement */}
      <div className="absolute bottom-5 inset-x-0 z-10 hidden lg:flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Visuel ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}