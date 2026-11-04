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
    <section id="accueil" className="relative pt-24 lg:pt-36 pb-8 lg:pb-24">
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
        {/* Dégradé sombre unifié pour tout l'écran */}
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/70 to-transparent" />
      </div>

      {/* Contenu du hero centré */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center min-h-[42vh] lg:min-h-[60vh] justify-center">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-5 lg:mb-6">
            Louez un véhicule <span className="text-teal-400">vérifié</span>{' '}
            àu cameroun
          </h1>
          <p className="text-base lg:text-lg text-slate-200 leading-relaxed mb-6 lg:mb-8 max-w-2xl mx-auto">
            Fini les mauvaises surprises : chaque véhicule est inspecté avant votre
            départ et chaque chauffeur est certifié. Du trajet professionnel au
            week-end en famille, roulez l'esprit tranquille, avec une équipe à votre écoute à toute heure.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-6 text-xs lg:text-sm text-slate-200">
            {['Chauffeurs certifiés', 'Assurance incluse'].map(t => (
              <span key={t} className="flex items-center gap-1.5 lg:gap-2">
                <CheckCircle size={14} className="text-teal-400" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Indicateurs du carrousel — desktop uniquement (le widget est dans le flux sur mobile) */}
        <div className="absolute bottom-16 hidden lg:flex items-center gap-2">
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

      {/* Barre de recherche : dans le flux sur mobile (sous le contenu),
          chevauchement élégant du bord inférieur sur desktop */}
      <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0 z-20 lg:translate-y-1/2 px-4 mt-10 lg:mt-0">
        <div className="max-w-6xl mx-auto">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}