import React from 'react';
import { DOCUMENTS } from './data';

/* Section « Documents requis pour valider votre dossier » — 3 cartes + bandeau 100 % en ligne. */
export default function DocumentsSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Documents requis pour valider votre dossier
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Trois pièces suffisent — envoyées depuis votre téléphone, vérifiées en quelques minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {DOCUMENTS.map((d, i) => (
            <div key={d.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between mb-5">
                <span className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
                  <d.icon size={20} className="text-teal-600" />
                </span>
                <span className="text-3xl font-black text-slate-100">{i + 1}</span>
              </div>
              <h3 className=" text-slate-900 mb-2">{d.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
