import React from 'react';
import { ANSWERS } from './data';

/* Section « Une réponse claire et structurée à chaque étape » — 3 cartes réassurance. */
export default function AnswersSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Une réponse claire et structurée à chaque étape
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Vous n'êtes jamais seul : humains, données et flexibilité à chaque instant.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ANSWERS.map(a => (
            <div key={a.title} className="bg-slate-50 rounded-2xl border border-slate-100 p-7 hover:bg-white hover:shadow-lg transition-all">
              <span className="w-11 h-11 bg-white border border-slate-100 rounded-xl flex items-center justify-center mb-5">
                <a.icon size={20} className="text-teal-600" />
              </span>
              <h3 className="text-slate-900 mb-2">{a.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
