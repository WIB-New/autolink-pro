import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { GAMMES } from './data';

/* Gamme mise en avant (active) : change cette valeur pour en activer une autre */
const ACTIVE_TIER = 'basic';

/* Section « Comparez nos 4 gammes de mobilité » — grille tarifaire. */
export default function GammesGrid() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Notre catalogue</p> */}
            <h2 className="text-3xl md:text-4xl font-black text-teal-600">
              Comparez nos <span className="text-teal-600">4 gammes de mobilité</span>
            </h2>
          </div>
          <p className="text-sm text-slate-400 font-medium">Prix par jour — dégressifs dès 3 jours</p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
          {GAMMES.map(g => {
            const active =
              String(g.tier).toLowerCase() === ACTIVE_TIER ||
              String(g.id).toLowerCase() === ACTIVE_TIER;

            return (
              <div key={g.id}
                className={`relative bg-white rounded-3xl border-2 p-7 transition-all hover:-translate-y-1 ${active ? 'border-teal-500 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-lg'}`}>
                {active && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap">
                    Basic
                  </span>
                )}
                <div className="flex items-center justify-between mb-5">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-teal-600' : 'bg-slate-100'}`}>
                    <g.icon size={20} className={active ? 'text-white' : 'text-slate-600'} />
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${active ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'}`}>
                    {g.tier}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1.5">{g.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-5 min-h-[2.5rem]">{g.desc}</p>
                <div className="mb-5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">À partir de</span>
                  <div className="font-black text-teal-600 text-3xl">
                    {g.price} <span className="text-sm font-bold text-teal-600">FCFA/j</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {g.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check size={14} className="text-teal-600 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate(`/catalogue?tier=${g.id}`)}
                  className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-colors ${active ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700'}`}>
                  Choisir la gamme {g.tier} <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}