import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Car, ShieldCheck, Gift, Crown,
  Wallet, Navigation, Sparkles,
} from 'lucide-react';

const SLIDES = [
  {
    badge: 'OFFRE WEEK-END',
    title: '-20% sur les SUV',
    text: 'RAV4, Tucson, Sportage — partez en famille dès vendredi.',
    cta: 'Réserver',
    path: '/client/search?tier=standard',
    gradient: 'from-teal-700/95 via-emerald-800/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1400&q=80',
    Icon: Car,
  },
  {
    badge: 'SERVICE PREMIUM',
    title: 'Voyagez avec chauffeur',
    text: 'Un professionnel au volant, vous profitez du trajet.',
    cta: 'Découvrir',
    path: '/client/search',
    gradient: 'from-indigo-700/95 via-violet-800/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80',
    Icon: ShieldCheck,
  },
  {
    badge: 'PARRAINAGE',
    title: '10 000 F offerts',
    text: 'Invitez un proche : il roule, vous êtes crédité.',
    cta: 'Mon portefeuille',
    path: '/client/wallet',
    gradient: 'from-amber-600/95 via-orange-700/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80',
    Icon: Gift,
  },
  {
    badge: 'GAMME GOLD',
    title: 'Le prestige au quotidien',
    text: 'Classe S, G63, Range Rover — l’excellence dès 90 000 F/j.',
    cta: 'Voir la gamme',
    path: '/client/search?tier=gold',
    gradient: 'from-yellow-700/95 via-amber-800/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=80',
    Icon: Crown,
  },
  {
    badge: 'PAIEMENT FLEXIBLE',
    title: 'Rechargez en 30 secondes',
    text: 'MTN MoMo, Orange Money, PayPal ou carte bancaire.',
    cta: 'Recharger',
    path: '/client/wallet',
    gradient: 'from-sky-700/95 via-blue-800/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    Icon: Wallet,
  },
  {
    badge: 'INTERURBAIN',
    title: 'Douala ↔ Yaoundé',
    text: 'Départs quotidiens, véhicules inspectés et confortables.',
    cta: 'Réserver un trajet',
    path: '/client/search?type=intercity',
    gradient: 'from-rose-700/95 via-red-800/80 to-slate-900/40',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80',
    Icon: Navigation,
  },
];

export default function PromoCarousel() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 2500);
    return () => clearInterval(t);
  }, [paused]);

  const go = (i) => setIdx(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {SLIDES.map(({ badge, title, text, cta, path, gradient, img, Icon }) => (
          <div key={title} className="w-full shrink-0 relative overflow-hidden bg-slate-900">
            <img
              src={img}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
            {/* Décor */}
            <div className="absolute -right-8 -top-10 w-44 h-44 rounded-full bg-white/10" />
            <div className="absolute right-16 -bottom-14 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative h-40 sm:h-44 flex items-center justify-between px-6 sm:px-8">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white/90 bg-white/15 rounded-full px-2.5 py-1">
                  <Sparkles size={10} /> {badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2 leading-snug drop-shadow-md">{title}</h3>
                <p className="text-white/85 text-xs sm:text-sm mt-1 max-w-md leading-snug">{text}</p>
                <button
                  onClick={() => navigate(path)}
                  className="mt-3 inline-flex items-center gap-1.5 bg-white text-slate-900 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl hover:bg-slate-100 transition-all shadow"
                >
                  {cta} <ChevronRight size={14} />
                </button>
              </div>
              <div className="hidden sm:flex w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm items-center justify-center shrink-0 ml-4">
                <Icon size={40} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Flèches */}
      <button onClick={() => go(idx - 1)} aria-label="Slide précédent"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all">
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => go(idx + 1)} aria-label="Slide suivant"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all">
        <ChevronRight size={18} />
      </button>

      {/* Points */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Aller au slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
        ))}
      </div>
    </div>
  );
}
