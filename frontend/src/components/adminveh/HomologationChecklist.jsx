import React from 'react';
import { ListChecks, CheckCircle2 } from 'lucide-react';

const CHECKS = [
  { t: 'Freinage & Pneus', d: '4 pneus Michelin neufs (usure < 10 %), étriers avant/arrière vérifiés.' },
  { t: 'Climatisation Tropicale', d: 'Testée en atelier Hub à 38°C — température ambiante descendue à 32°C. Débit optimal.' },
  { t: 'Balise GPS 4G AutoLink', d: 'Dual-SIM MTN/Orange activée. Batterie secours 96%. Télémétrie en ligne.' },
  { t: 'Kit Sécurité CEMAC', d: 'Extincteur révisé validité Octobre 2026, 2 triangles homologués, gilet.' },
];

/* Checklist d'homologation technique — points de contrôle validés par le Hub. */
export default function HomologationChecklist() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
        <ListChecks size={15} className="text-teal-600" /> Checklist d'Homologation Technique
        <span className="text-teal-600">100 % Validé</span>
      </h3>
      <p className="text-[10px] text-slate-400 mb-3">45 points de contrôle physique exécutés au Hub.</p>
      <div className="h-1.5 bg-teal-500 rounded-full mb-5" />
      <div className="grid sm:grid-cols-2 gap-4">
        {CHECKS.map(c => (
          <div key={c.t} className="flex gap-2.5">
            <CheckCircle2 size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-black text-slate-800">{c.t}</div>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{c.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
