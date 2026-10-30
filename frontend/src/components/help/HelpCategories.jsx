import React, { useState } from 'react';
import { ChevronDown, BadgeCheck, SearchX } from 'lucide-react';
import { HELP_CATS, CAT_LABEL, HELP_FAQS, HELP_HIGHLIGHTS } from './data';

/* Section « Questions fréquentes par thématique » —
   sidebar de guides + onglets catégories + accordéon filtrable. */
export default function HelpCategories({ query, cat, setCat }) {
  const [open, setOpen] = useState(null);

  const filtered = HELP_FAQS.filter(f =>
    (cat === 'all' || f.cat === cat) &&
    (!query || (f.q + ' ' + f.a).toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Base de connaissances</p> */}
          <h2 className="text-3xl md:text-4xl font-black text-slate-700">
            Questions fréquentes <span className="text-slate-700">par thématique</span>
          </h2>
        </div>

        {/* Onglets catégories */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {HELP_CATS.map(c => (
            <button key={c.id} onClick={() => { setCat(c.id); setOpen(null); }}
              className={`text-xs font-bold px-4 py-2.5 rounded-full transition-all ${cat === c.id ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-400 hover:text-teal-700'}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
          {/* Sidebar guides */}
          <div className="space-y-4">
            {HELP_HIGHLIGHTS.map(h => (
              <div key={h.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <h.icon size={18} className="text-teal-600" />
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{h.tag}</span>
                </div>
                <h3 className="font-black text-slate-900 text-sm mb-1.5">{h.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
            {/* <div className="bg-teal-600 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-2xl">99,4 %</span>
                <BadgeCheck size={18} className="text-teal-200" />
              </div>
              <p className="text-xs text-teal-100">de questions résolues en autonomie par nos clients.</p>
            </div> */}
          </div>

          {/* Accordéon questions */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <SearchX size={26} className="text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-sm">Aucune réponse pour « {query} »</p>
                <p className="text-xs text-slate-400 mt-1">Essayez un autre terme ou contactez-nous via le formulaire en bas de page.</p>
              </div>
            )}
            {filtered.map((f, i) => (
              <div key={f.q} className={`bg-white rounded-2xl border transition-all ${open === i ? 'border-teal-200 shadow-md' : 'border-slate-100'}`}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-4">
                  <div>
                    {/* <span className="block text-[9px] font-black uppercase tracking-widest text-teal-600 mb-1">
                      {CAT_LABEL[f.cat]}
                    </span> */}
                    <span className="font-bold text-slate-900 text-sm">{f.q}</span>
                  </div>
                  <ChevronDown size={17} className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180 text-teal-600' : ''}`} />
                </button>
                {open === i && (
                  <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
