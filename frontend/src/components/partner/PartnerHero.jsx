import React from 'react';
import { ArrowRight, TrendingUp, Percent, Clock } from 'lucide-react';
import { IMG } from '../landing/data';

/* Photo : signature de contrat + poignée de main avec le responsable RH. */
const PARTNER_BG = 'https://i.pinimg.com/1200x/c3/44/17/c344176223123b1e93288232c4bfdbfd.jpg';

/* Hero « Devenir propriétaire » — promesse + visuel revenus. */
export default function PartnerHero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative overflow-hidden flex items-center min-h-[85vh] pt-28 lg:pt-36 pb-20 bg-slate-900">
      {/* Image de fond pleine section */}
      <div className="absolute inset-0">
        <img
          src={PARTNER_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
          onError={e => { e.target.onerror = null; e.target.src = IMG.standPremium; }}
        />
        {/* Overlay uniforme (contenu centré) + dégradé en bas */}
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/70" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* <span className="inline-block bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          Monétisez votre véhicule
        </span> */}

        {/* Titre sur 2 lignes */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5 drop-shadow-lg">
          <span className="block">Votre voiture dort au garage ?</span>
          <span className="block text-teal-400 lg:whitespace-nowrap">
            Monétisez votre véhicule en toute sécurité.
          </span>
        </h1>

        <p className="text-slate-200 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Confiez votre véhicule à AutoLink Pro : nous gérons locataires, contrats,
          assurances et paiements — vous touchez 85 % de chaque location.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-9">
          <button onClick={() => scrollTo('candidature')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-md">
            Devenir partenaire <ArrowRight size={17} />
          </button>
          <button onClick={() => scrollTo('simulateur')}
            className="border-2 border-white/40 hover:border-teal-400 hover:text-teal-300 text-white font-bold px-6 py-3.5 rounded-xl transition-colors bg-white/10 backdrop-blur-sm">
            Découvrez les avantages
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-200 font-medium">
          <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-teal-400" /> Jusqu'à 20 jours loués/mois</span>
          <span className="flex items-center gap-1.5"><Percent size={14} className="text-teal-400" /> 85 % des revenus pour vous</span>
          <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-400" /> Mise en ligne sous 48 h</span>
        </div>
      </div>
    </section>
  );
}