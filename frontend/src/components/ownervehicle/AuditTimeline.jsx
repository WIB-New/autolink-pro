import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); } catch (_) { return null; } };

/* « Homologation AutoLink » — étapes réelles déduites du statut du véhicule
   et de sa dernière inspection (last_inspection_at / last_inspection_score). */
export default function AuditTimeline({ v }) {
  const score = Number(v.condition_score || 0);
  const lastInsp = fmtDate(v.last_inspection_at);
  const steps = [
    { label: 'Soumission', done: true,
      desc: `Dossier reçu${v.created_at ? ` le ${fmtDate(v.created_at)}` : ''}` },
    { label: 'Audit documentaire & contrôle', done: v.status !== 'pending',
      desc: v.status === 'pending' ? 'En cours d\'examen par un contrôleur' : 'Dossier et véhicule vérifiés' },
    { label: 'Inspection hub', done: !!v.last_inspection_at,
      desc: lastInsp ? `Réalisée le ${lastInsp} — score ${v.last_inspection_score ?? score}/100` : 'Pas encore réalisée' },
    { label: 'Publication', done: ['approved', 'rented'].includes(v.status),
      desc: { approved: 'Annonce en ligne', rented: 'En ligne — location en cours',
              suspended: 'Suspendue — contactez AutoLink', maintenance: 'Retirée temporairement (maintenance)',
              pending: 'En attente de validation' }[v.status] || '—' },
  ];
  const failed = v.status === 'suspended';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">Processus d'homologation</span>
          <h3 className="font-black text-slate-900 text-lg">Audit &amp; certifications AutoLink</h3>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold text-slate-400 uppercase">Score d'état (dernière inspection)</div>
          <div className="text-2xl font-black text-teal-600">
            {score || v.last_inspection_score ? `${v.last_inspection_score ?? score}` : '—'}
            {(score || v.last_inspection_score) ? <span className="text-sm text-slate-400">/100</span> : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {steps.map((s, i) => (
          <div key={s.label} className={`border rounded-2xl p-3.5 ${s.done ? 'border-teal-100 bg-teal-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white mb-2 ${s.done ? 'bg-teal-600' : 'bg-slate-300'}`}>
              {s.done ? <CheckCircle2 size={13} /> : (failed && i === 3 ? <XCircle size={13} /> : <Clock size={13} />)}
            </div>
            <div className="text-[11px] font-black text-slate-800">{i + 1}. {s.label}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
