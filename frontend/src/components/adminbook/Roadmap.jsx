import React from 'react';
import { CheckCircle2, Circle, Timer, PhoneCall, Car, LifeBuoy } from 'lucide-react';

/* Feuille de route dossier — 5 étapes selon le statut de la réservation. */
const STAGE_BY_STATUS = { pending: 3, confirmed: 4, active: 4, completed: 5, disputed: 3, cancelled: 3 };

export default function Roadmap({ booking: b, onTransmit }) {
  const stage = STAGE_BY_STATUS[b.status] || 3;
  const steps = [
    { n: 1, t: 'Demande Reçue & Caution Bloquée', d: 'API MoMo validée le ' + new Date(b.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) },
    { n: 2, t: 'Vérification KYC & Solvabilité', d: 'Pièces CNI + permis validées' },
    { n: 3, t: 'Transmission au Propriétaire', d: 'Délai d\'acceptation automatique : 02h45m restantes', cta: 'Relancer SMS Bailleur' },
    { n: 4, t: 'Confirmation & Remise des Clés', d: 'Prévu ' + new Date(b.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) },
    { n: 5, t: 'Inspection Retour & Déblocage Caution', d: 'Prévu ' + new Date(b.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Timer size={15} className="text-teal-600" /> Feuille de Route Dossier
        </h3>
        <span className="text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-md">Étape {Math.min(stage, 3)} sur 5</span>
      </div>

      <div className="space-y-0">
        {steps.map((s, i) => {
          const done = s.n < stage;
          const current = s.n === stage;
          return (
            <div key={s.n} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                  done ? 'bg-teal-600 text-white' : current ? 'bg-amber-400 text-white ring-4 ring-amber-100' : 'bg-slate-100 text-slate-400'}`}>
                  {done ? <CheckCircle2 size={14} /> : s.n}
                </span>
                {i < steps.length - 1 && <span className={`w-0.5 flex-1 my-1 ${done ? 'bg-teal-500' : 'bg-slate-100'}`} />}
              </div>
              <div className={`pb-5 ${s.n === steps.length ? '' : ''}`}>
                <div className={`text-[12px] font-black ${current ? 'text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}`}>
                  {s.t}
                  {current && <span className="ml-2 bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-md align-middle">EN COURS</span>}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.d}</div>
                {current && s.cta && (
                  <button onClick={onTransmit}
                    className="mt-2 flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-[10px] font-black px-3.5 py-2 rounded-xl transition-colors">
                    <PhoneCall size={11} /> {s.cta}
                  </button>
                )}
                {!done && !current && <Circle size={0} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Support Ops */}
      <div className="mt-2 bg-slate-50 rounded-2xl p-4">
        <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 mb-1">
          <LifeBuoy size={12} className="text-teal-600" /> Support Ops &amp; Réassignation
        </h4>
        <p className="text-[9px] text-slate-400 mb-3">En cas de refus du propriétaire ou d'imprévu mécanique au départ :</p>
        <button className="w-full flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-left hover:border-teal-400 transition-colors mb-2">
          <span className="w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center"><PhoneCall size={12} className="text-teal-600" /></span>
          <span className="text-[10px] font-bold text-slate-700">Astridelle Hub Akwa Douala<br /><span className="text-slate-400 font-medium">+237 6·· ·· ·· 23 (24h/7)</span></span>
        </button>
        <button className="w-full flex items-center gap-2 border border-slate-200 bg-white rounded-xl px-3 py-2.5 text-left hover:border-teal-400 transition-colors">
          <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center"><Car size={12} className="text-slate-500" /></span>
          <span className="text-[10px] font-bold text-slate-700">Réassigner Véhicule Similaire</span>
        </button>
      </div>
    </div>
  );
}
