import React from 'react';
import { ClipboardCheck, Gauge, Fuel, UserCheck } from 'lucide-react';

const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };
const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

const TYPE_LABEL = { pickup: 'Inspection départ', return: 'Inspection retour', audit: 'Audit hub', initial: 'Inspection initiale' };

/* « Homologation Hub » — historique réel des inspections du véhicule. */
export default function InspectionPanel({ v, inspections = [] }) {
  const last = inspections[0];
  const score = v.last_inspection_score ?? (last ? last.condition_score : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Homologation Hub</span>
          <h3 className="font-black text-slate-900">Inspections CEMAC</h3>
        </div>
        {score != null && (
          <span className="text-2xl font-black text-teal-600">{score}<span className="text-sm text-slate-400">/100</span></span>
        )}
      </div>

      {last ? (
        <div className="flex gap-2 mb-5 flex-wrap text-[10px] font-bold">
          <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-slate-500">
            Dernier contrôle : <strong className="text-slate-700">{fmtDate(last.inspection_date)}</strong>
          </span>
          {last.mileage_at_inspection != null && (
            <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-slate-500">
              Relevé : <strong className="text-slate-700">{fmt(last.mileage_at_inspection)} km</strong>
            </span>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 mb-5 text-[10px] text-slate-500 font-bold">
          Aucune inspection enregistrée pour ce véhicule.
        </div>
      )}

      {inspections.length > 0 && (
        <>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Historique ({inspections.length} inspection{inspections.length > 1 ? 's' : ''})
          </div>
          <div className="space-y-2.5">
            {inspections.map(i => (
              <div key={i.id} className="bg-slate-50/70 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <ClipboardCheck size={15} className="text-teal-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-slate-800">
                      {TYPE_LABEL[i.inspection_type] || i.inspection_type} · {fmtDate(i.inspection_date)}
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                      {i.mileage_at_inspection != null && <span className="flex items-center gap-1"><Gauge size={9} /> {fmt(i.mileage_at_inspection)} km</span>}
                      {i.fuel_level != null && <span className="flex items-center gap-1"><Fuel size={9} /> {i.fuel_level} %</span>}
                      {i.controller_name && <span className="flex items-center gap-1"><UserCheck size={9} /> {i.controller_name}</span>}
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded-md bg-teal-50 text-teal-700">{i.condition_score}/100</span>
                </div>
                {i.notes && <p className="text-[10px] text-slate-500 mt-2 leading-relaxed border-t border-slate-100 pt-2">{i.notes}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
