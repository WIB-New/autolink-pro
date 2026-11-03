import React from 'react';
import { CheckCircle2, UploadCloud } from 'lucide-react';

export const WIZARD_STEPS = [
  { n: 1, label: 'Infos Générales' },
  { n: 2, label: 'Caractéristiques' },
  { n: 3, label: 'Photos Véhicule' },
  { n: 4, label: 'Documents' },
  { n: 5, label: 'Tarifs & Dispo' },
  { n: 6, label: 'Récapitulatif' },
];

/* Barre d'étapes — numéro au-dessus de la ligne, description en dessous. */
export default function WizardSteps({ step, subtitle = "Ajout d'un véhicule à la flotte" }) {
  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-black text-slate-900">{subtitle}</h1>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <UploadCloud size={12} className="text-teal-500" /> Sauvegarde automatique : Enregistré
        </span>
      </div>
      <div className="flex items-start px-2">
        {WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            {/* Numéro traversé par la ligne */}
            <div className="flex flex-col items-center shrink-0 w-14 sm:w-20">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                s.n < step ? 'bg-teal-600 text-white'
                : s.n === step ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                : 'bg-slate-200 text-slate-400'}`}>
                {s.n < step ? <CheckCircle2 size={14} /> : s.n}
              </span>
              {/* Description sous le numéro */}
              <span className={`mt-2.5 text-[10px] font-black text-center truncate w-full hidden sm:block ${
                s.n === step ? 'text-teal-700' : s.n < step ? 'text-slate-500' : 'text-slate-300'}`}>
                {s.label}
              </span>
            </div>
            {/* Segment de ligne entre deux étapes */}
            {i < WIZARD_STEPS.length - 1 && (
              <div className={`flex-1 h-[3px] rounded-full mt-[13px] mx-1 ${s.n < step ? 'bg-teal-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* Pied de page du wizard — précédent / sauvegarder / continuer. */
export function WizardFooter({ step, setStep, onSubmit, busy, submitLabel, submitDisabled }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
      <button onClick={() => setStep(step - 1)} disabled={step === 1}
        className="text-xs font-bold text-slate-500 border border-slate-200 hover:border-teal-400 disabled:opacity-40 px-5 py-3 rounded-xl transition-colors">
        ← Étape précédente {step === 5 ? '(Documents)' : step === 6 ? '(Tarifs & Dispo)' : ''}
      </button>
      <div className="flex gap-3">
        <button className="text-xs font-bold text-slate-500 border border-slate-200 hover:border-teal-400 px-5 py-3 rounded-xl transition-colors">
          Sauvegarder en brouillon
        </button>
        {step < 6 ? (
          <button onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-colors shadow-md">
            Continuer vers {step === 5 ? 'le récapitulatif final' : `l'étape ${step + 1} (${WIZARD_STEPS[step].label})`} →
          </button>
        ) : (
          <button onClick={onSubmit} disabled={busy || submitDisabled}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-colors shadow-md disabled:opacity-50">
            {busy ? 'Envoi en cours…' : submitLabel || 'Soumettre pour audit'}
          </button>
        )}
      </div>
    </div>
  );
}
