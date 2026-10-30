import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data';

/* « Foire Aux Questions » — accordéon */
export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl text-slate-700 mb-3">
            Foire Aux Questions
          </h2>
          <p className="text-slate-500">
            Tout ce qu'il faut savoir avant de réserver votre véhicule.
          </p>
        </div>

        {/* Accordéon */}
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q}
              className={`bg-white rounded-2xl border transition-all ${open === i ? 'border-teal-200 shadow-md' : 'border-slate-100'}`}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-4">
                <span className="font-bold text-slate-900 text-sm md:text-base">{f.q}</span>
                <ChevronDown size={17}
                  className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180 text-teal-600' : ''}`} />
              </button>
              {open === i && (
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/aide" className="text-teal-600 hover:text-teal-700 font-bold text-sm transition-colors">
            Consulter le centre d'aide complet →
          </Link>
        </div>
      </div>
    </section>
  );
}