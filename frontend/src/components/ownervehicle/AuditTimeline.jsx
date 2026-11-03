import React from 'react';
import { CheckCircle2, AlertTriangle, Camera } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Soumission', desc: 'Dossier reçu le 12 Oct' },
  { n: 2, label: 'Audit documentaire', desc: 'Carte grise & CEMAC vérifiés' },
  { n: 3, label: 'Contrôle Hub Douala', desc: '45 points vérifiés (98/100)' },
  { n: 4, label: 'En Ligne (Actif)', desc: 'Badge Or conditionnel' },
];

/* « Audit technique & Certifications AutoLink » — étapes + action requise. */
export default function AuditTimeline({ score = 95 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">Processus d'homologation · Statut : Actif</span>
          <h3 className="font-black text-slate-900 text-lg">Audit technique &amp; Certifications AutoLink</h3>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-slate-400 uppercase">Score de conformité</div>
          <div className="text-2xl font-black text-teal-600">{score}<span className="text-sm text-slate-400">/100</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {STEPS.map(s => (
          <div key={s.n} className="border border-teal-100 bg-teal-50/50 rounded-2xl p-3.5">
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center text-white mb-2">
              <CheckCircle2 size={13} />
            </div>
            <div className="text-[11px] font-black text-slate-800">{s.n}. {s.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-start sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-wrap">
        <AlertTriangle size={17} className="text-amber-500 shrink-0" />
        <p className="flex-1 text-[11px] text-amber-800 leading-relaxed min-w-[220px]">
          <strong>Action requise — Remarque contrôle qualité Hub Douala.</strong> « La photo n°5 (tableau de bord)
          présente un léger contre-jour. Veuillez téléverser un cliché plus net avec le contact allumé pour conserver
          le badge "Véhicule Vérifié Or". »
        </p>
        <button className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-4 py-2.5 rounded-xl transition-colors shrink-0">
          <Camera size={12} /> Corriger la photo requise
        </button>
      </div>
    </div>
  );
}
