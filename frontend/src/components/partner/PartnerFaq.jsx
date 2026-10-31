import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS_OWNER } from './data';

/* FAQ propriétaire — accordéon. */
export default function PartnerFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Questions propriétaires</p> */}
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Tout ce que vous devez savoir avant de <span className="text-teal-600">confier votre voiture</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS_OWNER.map((f, i) => (
            <div key={f.q} className={`bg-white rounded-2xl border transition-all ${open === i ? 'border-teal-200 shadow-md' : 'border-slate-200'}`}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-4">
                <span className="font-bold text-slate-900 text-sm">{f.q}</span>
                <ChevronDown size={17} className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180 text-teal-600' : ''}`} />
              </button>
              {open === i && (
                <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
