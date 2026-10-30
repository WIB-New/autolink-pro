import React from 'react';
import { OPTIONS } from './data';

/* Section « Options et suppléments transparents » — 6 cartes de suppléments. */
export default function OptionsGrid() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Personnalisez à la carte</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-700 mb-3">
            Options et <span className="text-slate-700">suppléments transparents</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Chaque option a un prix fixe, affiché avant réservation et jamais modifié après.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPTIONS.map(o => (
            <div key={o.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
                  <o.icon size={20} className="text-teal-600" />
                </span>
                <span className="bg-teal-50 text-teal-700 text-xs font-black px-2.5 py-1 rounded-lg">{o.price}</span>
              </div>
              <h3 className=" text-slate-900 text-sm mb-1.5">{o.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
