import React from 'react';
import { Wallet } from 'lucide-react';
import { WALLET_FEATURES } from './data';

/* Satellites répartis sur l'orbite via décalage d'animation (90° d'écart). */

/* Section « Le Portefeuille AutoLink Pro » — orbite : les fonctionnalités tournent autour du cercle central. */
export default function WalletSection() {
  return (
    <section className="py-24 bg-teal-50/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl font-black text-teal-600 mb-3">
            Le Portefeuille AutoLink Pro : Comment ça fonctionne ?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Un compte intégré qui centralise paiements, cautions et remboursements.
          </p>
        </div>

        {/* Orbite — rayon réduit (--orbit-r piloté en responsive) */}
        <div className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] mx-auto [--orbit-r:130px] sm:[--orbit-r:180px]">
          {/* Anneaux décoratifs */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-teal-300/60" />
          <div className="absolute inset-6 rounded-full border border-teal-200/50" />
          <div className="absolute inset-0 rounded-full bg-teal-100/30 scale-90 -z-10" />

          {/* Cercle central — agrandi */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-44 sm:w-56 sm:h-56 bg-teal-600 rounded-full shadow-2xl shadow-teal-600/30 flex flex-col items-center justify-center text-center text-white ring-8 ring-teal-100">
              <Wallet size={36} className="mb-2" />
              <span className="text-sm sm:text-base font-black leading-tight px-4">Portefeuille<br />AutoLink Pro</span>
            </div>
          </div>

          {/* Satellites — orbitent autour du cercle teal SANS tourner sur eux-mêmes */}
          {WALLET_FEATURES.map((f, i) => (
            <div key={f.title}
              className="absolute top-1/2 left-1/2 animate-[orbit-rotate_40s_linear_infinite] hover:[animation-play-state:paused]"
              style={{ animationDelay: `${i * -10}s` }}>
              <div className="bg-white rounded-full border border-teal-100 shadow-xl px-4 py-2.5 flex items-center gap-2 whitespace-nowrap">
                <span className="text-teal-600 font-black text-sm leading-none">0{i + 1}</span>
                <span className="text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-wide">{f.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Légende descriptive — espace généreux sous l'orbite */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-24">
          {WALLET_FEATURES.map((f, i) => (
            <div key={f.title} className="relative text-center lg:text-left">
              <div className="relative inline-flex items-center justify-center w-14 h-14 bg-teal-600/15 border border-teal-500/30 rounded-2xl mb-5">
                {f.icon ? (
                  <f.icon size={24} className="text-teal-400" />
                ) : (
                  <span className="text-teal-400 font-bold text-sm">{i + 1}</span>
                )}
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 text-white text-[11px] font-black rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              {/* {i < WALLET_FEATURES.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-16 right-0 h-px border-t border-dashed border-slate-700" />
              )} */}
              <h3 className="font-black text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
