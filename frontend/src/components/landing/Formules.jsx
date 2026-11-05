import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { FORMULES } from './data';

/* « Des formules adaptées à votre rythme » — grille tarifaire */
export default function Formules() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
            Des formules adaptées à votre rythme
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            De la course express à la location longue durée — choisissez la durée,
            nous nous occupons du reste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FORMULES.map(f => (
            <div key={f.name}
              className={`relative bg-white rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                f.popular ? 'border-teal-500 shadow-lg shadow-teal-100' : 'border-slate-100 shadow-sm'
              }`}>
              {f.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Le plus demandé
                </span>
              )}
              <h3 className="font-black text-slate-900 text-lg">{f.name}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">{f.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-black text-teal-600">{f.price}</span>
                <span className="text-slate-400 text-sm ml-1">{f.unit}</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {f.feats.map(ft => (
                  <li key={ft} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={15} className="text-teal-600 mt-0.5 shrink-0" />
                    {ft}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/catalogue')}
                className={`w-full font-bold py-2.5 rounded-xl text-sm transition-colors ${
                  f.popular
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'border-2 border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-600'
                }`}>
                Choisir
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate('/tarifs')}
            className="text-teal-600 hover:text-teal-700 font-bold text-sm transition-colors">
            Voir toutes nos gammes et le détail des tarifs →
          </button>
        </div>
      </div>
    </section>
  );
}
