import React from 'react';
import { ClipboardCheck, UserPlus, Camera, CheckCircle2 } from 'lucide-react';

const shortDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* Contrôles techniques & états des lieux numérisés. */
export default function InspectionPanel({ booking: b }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <ClipboardCheck size={15} className="text-teal-600" /> Contrôles Techniques &amp; États des Lieux Numérisés
        </h3>
        <button className="flex items-center gap-1 text-[10px] font-black text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
          <UserPlus size={11} /> Assigner inspecteur
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Inspection départ */}
        <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md">Planifiée</span>
            <span className="text-[9px] font-bold text-slate-400">EDL-DEP-{String(b.id).padStart(4, '0')}</span>
          </div>
          <h4 className="text-[13px] font-black text-slate-900 mb-2">Inspection Départ (Remise Clés)</h4>
          <ul className="space-y-1.5 text-[10px] text-slate-500 mb-4">
            <li>{shortDate(b.start_date)} · 08h00 pile</li>
            <li>Inspecteur assigné : Hub {/yaound/i.test(b.pickup_address || '') ? 'Bastos' : 'Akwa'}</li>
            <li>Lieu : {b.pickup_address || 'Comptoir AutoLink'}</li>
            <li>Protocole : fiche 45 points + 16 photos 360°</li>
          </ul>
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black py-2.5 rounded-xl transition-colors">
            Ouvrir Formulaire
          </button>
        </div>

        {/* Dernier retour */}
        <div className="border border-slate-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-md">Archivé (Réf.)</span>
            <span className="text-[9px] font-bold text-slate-400">EDL-RET-0812</span>
          </div>
          <h4 className="text-[13px] font-black text-slate-900 mb-2">
            Dernier Retour <span className="text-teal-600 text-[11px] font-black ml-1">98/100</span>
          </h4>
          <ul className="space-y-1.5 text-[10px] text-slate-500 mb-4">
            <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-teal-600" /> Propreté habitacle : Grade A+</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-teal-600" /> Carburant plein rendu (oui)</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 size={10} className="text-teal-600" /> 12 taches haute résolution attachées</li>
          </ul>
          <button className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:border-teal-400 text-slate-600 text-[10px] font-black py-2.5 rounded-xl transition-colors">
            <Camera size={11} /> Voir Photos (12)
          </button>
        </div>
      </div>
    </div>
  );
}
