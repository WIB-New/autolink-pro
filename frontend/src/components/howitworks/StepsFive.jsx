import React from 'react';
import { STEPS_5 } from './data';

/* Section « Comment fonctionne votre location » — grille 3 colonnes × 2 lignes, texte seul. */
export default function StepsFive() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-black text-slate-700 mb-3">
            Comment fonctionne votre location en 5 étapes simples
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Un parcours entièrement digitalisé, pensé pour vous faire gagner du temps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {STEPS_5.map(s => (
            <div key={s.num}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl font-black text-teal-100 leading-none">{s.num}</span>
                {/* <span className="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <s.icon size={20} className="text-white" />
                </span> */}
              </div>
              <h3 className="text-lg font-black text-slate-500 mb-2.5">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
