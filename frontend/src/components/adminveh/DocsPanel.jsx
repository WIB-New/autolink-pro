import React from 'react';
import { FileText, Eye } from 'lucide-react';

/* Documents réglementaires CEMAC — cartes de conformité. */
export default function DocsPanel({ vehicle: v }) {
  const docs = [
    { name: 'Carte Grise Camerounaise', ref: `N° ${v.plate || 'LT-····'} · Titulaire ${v.owner_name || 'Propriétaire'}`, status: 'Conforme', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    { name: 'Assurance Tous Risques Flotte', ref: `Police ACT-CMR-${v.id || '····'} · Échéance ${v.insurance_expiry || '14 Déc. 2026'}`, status: 'Valide', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    { name: 'Certificat de Visite Technique', ref: `Centre Agréé ${v.city === 'Yaoundé' ? 'Bastos' : 'Bonabéri'} · Validité ${v.inspection_expiry || '18 Août 2026'}`, status: 'Valide', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <FileText size={15} className="text-teal-600" /> Documents Réglementaires CEMAC
        </h3>
        <span className="bg-teal-50 text-teal-700 text-[9px] font-black px-2 py-1 rounded-md">3 / 3 Authentifiés</span>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">Certificats originaux scannés et concordances de l'état civil du propriétaire.</p>

      <div className="space-y-2.5">
        {docs.map(d => (
          <div key={d.name} className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${d.cls.replace('text-', 'border-').split(' ')[2] || 'border-slate-100'} border-slate-100`}>
            <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={15} className="text-slate-500" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-black text-slate-800 flex items-center gap-2">
                {d.name}
                <span className="bg-teal-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">{d.status}</span>
              </div>
              <div className="text-[9px] text-slate-400 truncate">{d.ref}</div>
            </div>
            <button className="flex items-center gap-1 text-[9px] font-black text-slate-500 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:border-teal-400 shrink-0">
              <Eye size={10} /> Aperçu PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
