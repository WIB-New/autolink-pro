import React from 'react';
import { CheckCircle2, XCircle, ListChecks, Percent } from 'lucide-react';
import { ELIGIBILITY, COMMISSION_POINTS } from './data';

/* Deux panneaux : éligibilité du véhicule + répartition 85/15. */
export default function EligibilityCommission() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
        {/* Éligibilité */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <ListChecks size={19} className="text-teal-600" />
            </span>
            <h3 className="font-black text-slate-600 text-lg">Votre véhicule est-il éligible ?</h3>
          </div>
          <ul className="space-y-3.5">
            {ELIGIBILITY.map(e => (
              <li key={e.text} className="flex items-start gap-3 text-sm">
                {e.ok
                  ? <CheckCircle2 size={17} className="text-teal-600 shrink-0 mt-0.5" />
                  : <XCircle size={17} className="text-red-400 shrink-0 mt-0.5" />}
                <span className={e.ok ? 'text-slate-600' : 'text-slate-400'}>{e.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Commission */}
        <div className="bg-white border border-slate-100 rounded-3xl p-7 lg:p-9 text-white">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 bg-teal-600/20 rounded-xl flex items-center justify-center">
              <Percent size={19} className="text-teal-400" />
            </span>
            <h3 className="font-black text-lg text-slate-600">Commission claire et équitable</h3>
          </div>
          {/* Barre de répartition */}
          <div className="flex rounded-xl overflow-hidden mb-2 h-12">
            <div className="bg-teal-600 flex items-center justify-center font-black text-sm" style={{ width: '85%' }}>85 % pour Vous</div>
            <div className="bg-slate-700 flex items-center justify-center font-black text-xs text-slate-300" style={{ width: '15%' }}>15 %</div>
          </div>
          <p className="text-[11px] text-slate-400 mb-6">AutoLink Pro ne gagne que lorsque votre véhicule est loué.</p>
          <ul className="space-y-3">
            {COMMISSION_POINTS.map(p => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-slate-400">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
