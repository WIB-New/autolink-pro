import React from 'react';
import { FileCheck, Upload, FileText, ShieldCheck, ClipboardCheck } from 'lucide-react';

const input = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';
const INSURANCE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'all_risk', label: 'Tous risques' },
];

const DOCS = [
  { icon: FileText,       t: 'Carte Grise Cameroun (CEMAC)',                s: 'Recto-verso lisible, titulaire correspondant' },
  { icon: ShieldCheck,    t: "Attestation d'Assurance Tous Risques",        s: 'Police active — vignette + attestation vertes' },
  { icon: ClipboardCheck, t: 'Certificat de Visite Technique Automobile',   s: 'Centre agréé — validité ≥ 3 mois' },
];

/* Étape 4 — Documents légaux & conformité. */
export default function StepDocuments({ form, set }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center"><FileCheck size={16} className="text-teal-600" /></span>
          <div>
            <h2 className="font-black text-slate-900">Étape 4 : Documents &amp; Conformité</h2>
            <p className="text-[10px] text-slate-400">Pièces requises pour l'audit administratif CEMAC &amp; OHADA.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {DOCS.map(d => (
            <div key={d.t} className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-5 text-center cursor-pointer transition-colors group">
              <d.icon size={20} className="text-slate-300 group-hover:text-teal-500 mx-auto mb-2" />
              <div className="text-[11px] font-black text-slate-800 leading-tight">{d.t}</div>
              <div className="text-[9px] text-slate-400 mt-1">{d.s}</div>
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-teal-600 mt-2.5"><Upload size={9} /> Téléverser</span>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Type d'assurance</label>
            <select className={input} value={form.insurance} onChange={e => set('insurance', e.target.value)}>
              <option value="">Choisir…</option>
              {INSURANCE_TYPES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Expiration de l'assurance</label>
            <input type="date" className={input} value={form.insuranceExpiry} onChange={e => set('insuranceExpiry', e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Date de visite technique</label>
            <input type="date" className={input} value={form.technicalControl} onChange={e => set('technicalControl', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
