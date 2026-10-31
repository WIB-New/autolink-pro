import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { STANDINGS } from './data';

/* « Choisissez selon votre standing » — 4 gammes tarifaires */
export default function Standings() {
  return (
    <section id="tarifs" className="py-36 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-700 mb-3">
              Choisissez selon votre standing
            </h2>
            <p className="text-slate-500 max-w-xl">
              Quatre catégories de véhicules, un même niveau d'exigence : propreté,
              sécurité et ponctualité garanties.
            </p>
          </div>
          <Link to="/catalogue"
            className="hidden md:inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-700 shrink-0">
            Voir tous les véhicules <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STANDINGS.map(s => (
            <Link key={s.name} to={`/catalogue?gamme=${s.name.toLowerCase()}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="h-44 overflow-hidden">
                <img src={s.img} alt={s.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
              </div>
              <div className="p-5">
                <h3 className=" text-slate-900 text-lg mb-1">{s.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{s.desc}</p>
                <div className="text-sm">
                  <span className="text-slate-400">À partir de </span>
                  <span className="font-black text-teal-600">{s.price} FCFA</span>
                  <span className="text-slate-400">/jour</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
