import React from 'react';
import { Building2, Camera } from 'lucide-react';
import { getVehicleImage } from '../../utils/carImages';

/* Rapport Hub Physique — score inspecteur + photos contradictoires. */
export default function HubReport({ vehicle: v }) {
  const score = v.condition_score || 95;
  const img = v.image_url || getVehicleImage(v.category);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Building2 size={15} className="text-teal-600" /> Rapport Hub Physique
        </h3>
        <span className="text-2xl font-black text-teal-600">{score}<span className="text-xs text-slate-400 font-bold">/100</span></span>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">Centre technique {v.city === 'Yaoundé' ? 'Bastos' : 'Akwa'}, Étalab</p>

      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-4">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xs font-black">GM</div>
        <div>
          <div className="text-[12px] font-black text-slate-900">Guy M.</div>
          <div className="text-[10px] text-slate-400">Inspecteur Certifié Flotte {v.city || 'Douala'}</div>
        </div>
        <span className="ml-auto text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-md">Audit validé le 24/10</span>
      </div>

      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Photos contradictoires de l'agent Hub (2)</div>
      <div className="grid grid-cols-2 gap-2.5">
        {[img, getVehicleImage(v.category)].map((src, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden h-20 bg-slate-100">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
              <Camera size={8} /> {i === 0 ? 'Bloc Moteur/Hybride' : 'Balise GPS & Câblage'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
