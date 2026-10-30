import React from 'react';
import { BENEFITS } from './data';

/* Section « Pourquoi confier votre véhicule à AutoLink Pro ? » — 4 avantages. */
export default function WhyPartner() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Avantages partenaires</p> */}
          <h2 className="text-3xl md:text-4xl font-black text-teal-600">
            Pourquoi confier votre véhicule à <span className="text-teal-600">AutoLink Pro ?</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all">
              <span className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                <b.icon size={20} className="text-teal-600" />
              </span>
              <h3 className=" text-slate-800 text-sm mb-2">{b.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
