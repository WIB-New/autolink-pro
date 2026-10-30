import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ETAPES } from './data';

/* « 4 étapes pour prendre le volant » — section sombre */
export default function Steps() {
  const navigate = useNavigate();

  return (
    <section id="etapes" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl  font-black text-white mb-3">
            4 étapes pour prendre le volant
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            De la recherche à la prise en charge, tout se fait depuis votre téléphone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ETAPES.map((s, i) => (
            <div key={s.title} className="relative text-center lg:text-left">
              <div className="relative inline-flex items-center justify-center w-14 h-14 bg-teal-600/15 border border-teal-500/30 rounded-2xl mb-5">
                <s.icon size={24} className="text-teal-400" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 text-white text-[11px] font-black rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              {i < ETAPES.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-16 right-0 h-px border-t border-dashed border-slate-700" />
              )}
              <h3 className="font-black text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Barre d'info */}
        <div className="flex flex-col items-center justify-center text-center gap-5 w-full max-w-2xl mx-auto px-4">
          <p className="text-slate-300 text-sm md:text-base font-medium">
            Modification gratuite jusqu'à 15 minutes avant le départ.
          </p>
          <button
            onClick={() => navigate('/catalogue')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-colors text-sm md:text-base shadow-lg shadow-teal-900/30"
          >
            Réserver maintenant
          </button>
        </div>
      </div>
    </section>
  );
}