import React from 'react';
import { PARTNER_STEPS } from './data';

/* Section « Devenez propriétaire partenaire en 4 étapes ». */
export default function PartnerSteps() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Processus simplifié</p> */}
          <h2 className="text-3xl md:text-4xl font-black text-teal-600">
            Devenez propriétaire partenaire en <span className="text-teal-600">4 étapes</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PARTNER_STEPS.map((s, i) => (
            <div key={s.title} className="relative bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:bg-white hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-5">
                <span className="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <s.icon size={20} className="text-white" />
                </span>
                <span className="text-4xl font-black text-slate-100">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className=" text-slate-800 text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
             
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
