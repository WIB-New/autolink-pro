import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* Bandeau teal « Chauffeur Certifié AutoLink » en bas de la page flotte. */
export default function DriverUpsell() {
  const navigate = useNavigate();
  return (
    <div className="bg-teal-700 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 text-white">
      <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
        <Lightbulb size={22} className="text-teal-100" />
      </div>
      <div className="flex-1">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-200 mb-1">Opportunité AutoLink Pro — Fidèle partenaire VIP</div>
        <h3 className="font-black text-lg mb-1.5">Boostez vos revenus : activez l'option Chauffeur Certifié AutoLink</h3>
        <p className="text-xs text-teal-100/90 leading-relaxed max-w-2xl">
          Les clients professionnels et délégations à Douala et Yaoundé privilégient les véhicules avec
          chauffeur vérifié. Nos partenaires enregistrent une augmentation moyenne de <strong>35 %</strong> de
          leur taux d'occupation mensuel.
        </p>
      </div>
      <div className="flex gap-3 shrink-0 flex-wrap">
        <button onClick={() => navigate('/comment-ca-marche')}
          className="text-xs font-bold text-teal-100 hover:text-white border border-teal-400/50 hover:border-teal-200 px-4 py-2.5 rounded-xl transition-colors">
          En savoir plus
        </button>
        <button onClick={() => navigate('/owner/add-vehicle')}
          className="flex items-center gap-1.5 text-xs font-black bg-white text-teal-800 hover:bg-teal-50 px-4 py-2.5 rounded-xl transition-colors">
          Activer sur ma flotte <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
