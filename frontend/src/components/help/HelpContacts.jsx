import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { HELP_CONTACTS } from './data';

/* Section « Assistance immédiate » — WhatsApp, standard 24/7, agences. */
export default function HelpContacts() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Une équipe dédiée</p> */}
          <h2 className="text-3xl md:text-4xl font-black text-teal-600 mb-3">
            Besoin d'une assistance immédiate ?<br />
            <span className="text-teal-600">Notre équipe locale est à votre écoute</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Choisissez le canal qui vous convient : réponse garantie en moins de 10 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HELP_CONTACTS.map(c => (
            <div key={c.title}
              className={`rounded-3xl p-7 flex flex-col ${c.green ? 'bg-teal-600 text-white' : 'bg-slate-50 border border-slate-100'}`}>
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${c.green ? 'bg-white/15' : 'bg-white border border-slate-100'}`}>
                <c.icon size={22} className={c.green ? 'text-white' : 'text-teal-600'} />
              </span>
              <h3 className={`font-black mb-2 ${c.green ? 'text-white' : 'text-slate-600'}`}>{c.title}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${c.green ? 'text-teal-100' : 'text-slate-500'}`}>{c.desc}</p>

              {c.lines && (
                <ul className={`space-y-2 mb-5 text-xs font-semibold ${c.green ? 'text-teal-100' : 'text-slate-600'}`}>
                  {c.lines.map(l => (
                    <li key={l} className="flex items-center gap-2">
                      {/Douala|Yaoundé/.test(l) ? <MapPin size={12} className="text-teal-500" /> : <Clock size={12} className="text-teal-500" />}
                      {l}
                    </li>
                  ))}
                </ul>
              )}

              {c.btn && (
                <button className={`mt-auto w-full font-bold text-sm py-3 rounded-xl transition-colors ${c.green ? 'bg-white text-teal-700 hover:bg-teal-50' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                  {c.btn}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
