import React from 'react';
import { Search, Headphones } from 'lucide-react';
import { QUICK_CHIPS } from './data';

/* Image d'assistance : lien externe */
// const HELP_BG = "https://images.unsplash.com/photo-1615890932417-89da415105d2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";


/* Image d'assistance : lien externe (largeur 1920 pour éviter le flou dû à l'agrandissement) */
const HELP_BG = "https://images.unsplash.com/photo-1615890932417-89da415105d2?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";

/* Point de focus : change cette valeur pour recentrer l'image */
const BG_POSITION = 'object-[50%_30%]';

/* Hero du centre d'aide — image d'assistance floutée + titre (fond navy en secours). */
export default function HelpHero({ query, setQuery }) {
  return (
    <section className="relative overflow-hidden flex items-center min-h-[60vh] lg:min-h-[80vh] pt-28 lg:pt-36 pb-20 bg-slate-900">
      {/* Image de fond légèrement floutée */}
      <div className="absolute inset-0">
        <img
          src={HELP_BG}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${BG_POSITION} blur-[2px] scale-105`}
          onError={e => { e.target.style.display = 'none'; }}
        />
        {/* Overlay pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-slate-900/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/20 to-slate-900/80" />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* <span className="inline-block bg-teal-600/30 backdrop-blur-sm text-teal-300 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          Centre d'aide &amp; accompagnement
        </span> */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 drop-shadow-lg">
          Comment pouvons-nous <span className="text-teal-400">vous aider ?</span>
        </h1>
        <p className="text-slate-100 text-lg max-w-2xl mx-auto mb-9 drop-shadow">
          Trouvez une réponse immédiate : réservations, caution, Mobile Money,
          documents — ou contactez notre équipe locale à Douala &amp; Yaoundé.
        </p>

        {/* Recherche */}
        {/* <div className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-2xl mx-auto">
          <Search size={18} className="text-slate-400 ml-3 shrink-0" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Ex : Comment réserver une voiture, payer ou Orange Money…"
            className="flex-1 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          />
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shrink-0">
            Rechercher
          </button>
        </div> */}

        {/* Accès rapides */}
        {/* <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-1 flex items-center gap-1">
            <Headphones size={11} /> Accès rapides :
          </span>
          {QUICK_CHIPS.map(c => (
            <button key={c} onClick={() => setQuery(c)}
              className="text-[11px] font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-colors">
              {c}
            </button>
          ))}
        </div> */}
      </div>
    </section>
  );
}