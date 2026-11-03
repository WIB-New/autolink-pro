import React from 'react';
import { TrendingUp, Camera, ShieldCheck, ArrowRight } from 'lucide-react';

const ADVICE = [
  {
    icon: TrendingUp, tag: 'PIC DE DEMANDE', tagCls: 'bg-amber-100 text-amber-700',
    title: 'Douala — forte demande prévue',
    text: 'Zone Bonanjo : +40 % de réservations attendues ce week-end. Pensez à libérer votre SUV pour maximiser vos gains.',
    cta: 'Ajuster la disponibilité',
  },
  {
    icon: Camera, tag: 'QUALITÉ PHOTO', tagCls: 'bg-sky-100 text-sky-700',
    title: 'Améliorez la visibilité de votre flotte',
    text: 'Ajoutez 3 photos haute résolution de l\'habitacle : les véhicules bien photographiés reçoivent 40 % de réservations en plus.',
    cta: 'Ajouter des photos',
  },
];

/* « Conseils d'optimisation » — recommandations automatiques. */
export default function AdvicePanel() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="font-black text-slate-900 mb-5">Conseils d'optimisation</h3>
      <div className="space-y-4">
        {ADVICE.map(a => (
          <div key={a.title} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${a.tagCls}`}>{a.tag}</span>
            <h4 className="font-black text-slate-900 text-sm mt-2.5 mb-1">{a.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{a.text}</p>
            <button className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              {a.cta} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck size={18} className="text-teal-600 shrink-0 mt-0.5" />
        <p className="text-xs text-teal-800 leading-relaxed">
          <strong>Cautionnement garanti</strong> — votre part est bloquée en séquestre à chaque démarrage de course.
        </p>
      </div>
    </div>
  );
}
