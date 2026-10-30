import React from 'react';
import { AVANTAGES } from './data';

/* « Pourquoi choisir AutoLink Pro ? » — grille d'avantages */
export default function Why() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Pourquoi choisir AutoLink Pro ?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            La première plateforme camerounaise qui vérifie chaque véhicule
            et certifie chaque chauffeur.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AVANTAGES.map(a => (
            <div key={a.title}
              className="bg-slate-50 hover:bg-teal-50 rounded-2xl p-6 transition-colors duration-300 group">
              <div className="w-11 h-11 bg-white group-hover:bg-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-colors">
                <a.icon size={20} className="text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-black text-slate-900 text-sm mb-2">{a.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
