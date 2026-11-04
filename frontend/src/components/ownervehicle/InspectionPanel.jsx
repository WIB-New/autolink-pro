import React from 'react';
import { ShieldCheck, FileDown, CheckCircle2, Disc, Wind, Satellite, AlertTriangle } from 'lucide-react';

const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return '—'; } };

const CHECKS = [
  { icon: Disc,          t: 'Système de freinage & ABS',      s: 'Plaquettes neuves (usure < 10 %)', tag: 'Conforme',   cls: 'bg-teal-50 text-teal-700' },
  { icon: CheckCircle2,  t: 'Pneumatiques Michelin Primacy',  s: '4 pneus neufs + roue de secours vérifiée', tag: '100 % OK', cls: 'bg-teal-50 text-teal-700' },
  { icon: Wind,          t: 'Climatisation Bi-Zone',          s: 'Testée et stérilisée à 18°C au thermomètre', tag: 'Performant', cls: 'bg-teal-50 text-teal-700' },
  { icon: Satellite,     t: 'Tracker GPS & Télématique AutoLink', s: 'Boîtier fixé (réf. M17-WB-08), signal actif', tag: 'En ligne', cls: 'bg-teal-50 text-teal-700' },
  { icon: AlertTriangle, t: 'Kit de Sécurité Réglementaire',  s: 'Extincteur révisé 2025, 2 triangles, gilet jaune', tag: 'Certifié', cls: 'bg-teal-50 text-teal-700' },
];

/* « Homologation Hub — Inspection CEMAC » + points de contrôle. */
export default function InspectionPanel({ v }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Homologation Hub</span>
          <h3 className="font-black text-slate-900">Inspection CEMAC</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-teal-600">{v.condition_score || 98}<span className="text-sm text-slate-400">/100</span></span>
        </div>
      </div>
      <div className="flex gap-2 mb-5 flex-wrap text-[10px] font-bold">
        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-slate-500">Dernier contrôle : <strong className="text-slate-700">{fmtDate(v.last_inspection)}</strong></span>
        <span className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-slate-500">Prochain : <strong className="text-slate-700">Avril 2026</strong></span>
      </div>

      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Points de contrôle certifiés (45/45)</div>
      <div className="space-y-2.5">
        {CHECKS.map(c => (
          <div key={c.t} className="flex items-center gap-3 bg-slate-50/70 rounded-xl p-3">
            <c.icon size={15} className="text-teal-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-black text-slate-800">{c.t}</div>
              <div className="text-[9px] text-slate-400">{c.s}</div>
            </div>
            <span className={`text-[9px] font-black px-2 py-1 rounded-md ${c.cls}`}>{c.tag}</span>
          </div>
        ))}
      </div>

      <button className="mt-5 w-full flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 py-3 rounded-xl transition-colors">
        <FileDown size={13} /> Consulter le rapport d'inspection complet (PDF)
      </button>
    </div>
  );
}
