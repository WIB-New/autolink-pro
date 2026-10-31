import React from 'react';
import { Star } from 'lucide-react';
import { TEMOIGNAGES } from './data';

/* « Ce que disent nos clients » — témoignages */
export default function Testimonials() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl  text-slate-700 mb-3">
            Ce que disent nos clients
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Plus de 3 400 locations réussies à Douala et Yaoundé.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TEMOIGNAGES.map(t => (
            <div key={t.name}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                « {t.text} »
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-teal-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.city}, Cameroun</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
