import React from 'react';
import { Building2, Camera, UserCheck } from 'lucide-react';
import { mediaUrl } from '../../utils/media';

const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };
const TYPE_LABEL = { pickup: 'Inspection départ', return: 'Inspection retour', audit: 'Audit hub', initial: 'Inspection initiale' };

/* Rapport Hub Physique — dernière inspection réelle du véhicule + photos de l'agent. */
export default function HubReport({ vehicle: v, inspections = [] }) {
  const last = inspections[0];
  const score = v.last_inspection_score ?? (last ? last.condition_score : null);
  const inspPhotos = (last?.photos || []).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Building2 size={15} className="text-teal-600" /> Rapport Hub Physique
        </h3>
        {score != null && (
          <span className="text-2xl font-black text-teal-600">{score}<span className="text-xs text-slate-400 font-bold">/100</span></span>
        )}
      </div>

      {last ? (
        <>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-4">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xs font-black">
              <UserCheck size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-black text-slate-900">{last.controller_name || 'Contrôleur AutoLink'}</div>
              <div className="text-[10px] text-slate-400">{TYPE_LABEL[last.inspection_type] || last.inspection_type} · {v.city || '—'}</div>
            </div>
            <span className="ml-auto text-[9px] font-black text-teal-700 bg-teal-50 px-2 py-1 rounded-md whitespace-nowrap">
              {fmtDate(last.inspection_date)}
            </span>
          </div>
          {last.notes && <p className="text-[10px] text-slate-500 leading-relaxed mb-4 bg-slate-50 rounded-xl p-3">{last.notes}</p>}
          {inspPhotos.length > 0 && (
            <>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Photos de l'agent ({last.photos.length})</div>
              <div className="grid grid-cols-2 gap-2.5">
                {inspPhotos.map(p => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden h-20 bg-slate-100">
                    <img src={mediaUrl(p.image)} alt="" className="w-full h-full object-cover" />
                    {p.caption && (
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                        <Camera size={8} /> {p.caption}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl p-4 text-center">Aucune inspection physique enregistrée pour ce véhicule.</p>
      )}
    </div>
  );
}
