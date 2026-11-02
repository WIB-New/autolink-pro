import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, AlertTriangle, Shield, X, UserCheck } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';

const CRITERIA = [
  { id: 'license', label: 'Permis de conduire valide (catégorie B min.)', required: true },
  { id: 'criminal', label: 'Extrait de casier judiciaire vierge (< 3 mois)', required: true },
  { id: 'medical', label: 'Certificat médical aptitude physique', required: true },
  { id: 'experience', label: 'Minimum 2 ans d\'expérience de conduite', required: true },
  { id: 'driving_test', label: 'Test de conduite sur circuit AutoLink', required: true },
  { id: 'training', label: 'Formation protocole AutoLink (4h)', required: true },
  { id: 'age', label: 'Âge entre 23 et 55 ans', required: true },
  { id: 'photo', label: 'Photo d\'identité récente', required: true },
  { id: 'id_card', label: 'CNI ou passeport en cours de validité', required: true },
  { id: 'references', label: 'Références professionnelles (optionnel)', required: false },
];

const CANDIDATES = [
  { id: 1, name: 'Kofi Boateng', age: 34, phone: '+225 07 11 22 33', email: 'kofi@mail.com', experience: 6, applied: '2025-08-23', status: 'pending', checks: { license: true, criminal: true, medical: false, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: true, references: true } },
  { id: 2, name: 'Sadia Touré', age: 29, phone: '+225 05 44 55 66', email: 'sadia@mail.com', experience: 3, applied: '2025-08-21', status: 'review', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: true, training: false, age: true, photo: true, id_card: true, references: false } },
  { id: 3, name: 'Brice Nguessan', age: 41, phone: '+225 07 77 88 99', email: 'brice@mail.com', experience: 12, applied: '2025-08-19', status: 'approved', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: true, training: true, age: true, photo: true, id_card: true, references: true } },
  { id: 4, name: 'Amara Coulibaly', age: 27, phone: '+225 05 12 34 56', email: 'amara@mail.com', experience: 2, applied: '2025-08-17', status: 'rejected', checks: { license: false, criminal: false, medical: false, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: false, references: false } },
  { id: 5, name: 'Estelle Kouakou', age: 32, phone: '+225 07 55 66 77', email: 'estelle@mail.com', experience: 5, applied: '2025-08-25', status: 'pending', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: true, references: false } },
];

const STATUS_CONFIG = {
  pending:  { label: 'En attente',        cls: 'bg-amber-100 text-amber-700' },
  review:   { label: 'En cours d\'examen', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approuvé',          cls: 'bg-teal-100 text-teal-700' },
  rejected: { label: 'Refusé',            cls: 'bg-red-100 text-red-600' },
};

const scoreOf = c => Math.round((Object.values(c.checks).filter(Boolean).length / CRITERIA.length) * 100);

function CandidateModal({ candidate, onClose }) {
  const [checks, setChecks] = useState({ ...candidate.checks });
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState(null);

  const mandatoryPassed = CRITERIA.filter(c => c.required).every(c => checks[c.id]);
  const score = Math.round((Object.values(checks).filter(Boolean).length / CRITERIA.length) * 100);

  if (decision) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        {decision === 'approved'
          ? <CheckCircle size={52} className="text-emerald-500 mx-auto mb-3" />
          : <XCircle size={52} className="text-red-500 mx-auto mb-3" />}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{decision === 'approved' ? 'Candidature approuvée !' : 'Candidature refusée'}</h3>
        <p className="text-slate-500 mb-5">{candidate.name} {decision === 'approved' ? 'peut maintenant rejoindre AutoLink.' : 'a été informé(e) du refus.'}</p>
        <button onClick={onClose} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">Fermer</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{candidate.name}</h3>
            <p className="text-sm text-slate-500">{candidate.age} ans · {candidate.experience} ans d'expérience · Postulé le {candidate.applied}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Score */}
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-sm text-slate-500 mt-1">Score de conformité</p>
            </div>
            {!mandatoryPassed && <div className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle size={14} /> Critères obligatoires manquants</div>}
          </div>

          {/* Checklist */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Critères de recrutement</h4>
            <div className="space-y-2">
              {CRITERIA.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checks[c.id] ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={checks[c.id]} onChange={e => setChecks(ch => ({ ...ch, [c.id]: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                  <div className="flex-1 text-sm font-medium text-slate-800">{c.label}</div>
                  {c.required && <span className="text-xs text-red-500 font-semibold">Obligatoire</span>}
                  {checks[c.id] ? <CheckCircle size={16} className="text-emerald-500 shrink-0" /> : <XCircle size={16} className="text-slate-300 shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes d'évaluation (interne)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Observations sur le candidat, points forts, points faibles..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={() => setDecision('rejected')} className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 rounded-xl transition-colors">
            <XCircle size={16} /> Refuser
          </button>
          <button disabled={!mandatoryPassed} onClick={() => setDecision('approved')}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
            <CheckCircle size={16} /> Approuver
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DriverRecruitment() {
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = CANDIDATES.filter(c => tab === 'all' || c.status === tab);
  const counts = { all: CANDIDATES.length, pending: CANDIDATES.filter(c => c.status === 'pending').length, review: CANDIDATES.filter(c => c.status === 'review').length, approved: CANDIDATES.filter(c => c.status === 'approved').length, rejected: CANDIDATES.filter(c => c.status === 'rejected').length };

  return (
    <AdminLayout title="Recrutement et Onboarding Chauffeurs" subtitle="Candidats & certification">
      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={User} iconCls="bg-blue-50 text-blue-600" value={CANDIDATES.length} label="Candidatures" />
        <StatCard icon={Clock} iconCls="bg-amber-50 text-amber-600" value={counts.pending + counts.review} label="À examiner" />
        <StatCard icon={UserCheck} iconCls="bg-emerald-50 text-emerald-600" value={counts.approved} label="Approuvés" />
        <StatCard icon={Shield} iconCls="bg-violet-50 text-violet-600" value={CRITERIA.filter(c => c.required).length} label="Critères obligatoires" />
      </div>

      {/* Onglets + table — carte unique */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
          {[['all', 'Tous'], ['pending', 'En attente'], ['review', 'En examen'], ['approved', 'Approuvés'], ['rejected', 'Refusés']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === val ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {label}
              {counts[val] > 0 && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === val ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{counts[val]}</span>}
              {tab === val && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        <DataTable
          title={`Candidats (${filtered.length})`}
          loading={false} emptyText="Aucun candidat dans cette catégorie."
          rows={filtered}
          onRowClick={c => setSelected(c)}
          columns={[
            { label: 'Candidat', render: c => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">{c.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">{c.name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{c.age} ans · {c.experience} ans d'exp.</div>
                </div>
              </div>
            )},
            { label: 'Contact', render: c => (
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-700">{c.phone}</div>
                <div className="text-[9px] text-slate-400 truncate">{c.email}</div>
              </div>
            )},
            { label: 'Postulé', render: c => <span className="text-[10px] font-semibold text-slate-500">{c.applied}</span> },
            { label: 'Conformité', render: c => {
              const score = scoreOf(c);
              return (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">{score}%</span>
                </div>
              );
            }},
            { label: 'Statut', render: c => <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${STATUS_CONFIG[c.status].cls}`}>{STATUS_CONFIG[c.status].label}</span> },
            { label: 'Action', align: 'right', render: c => (
              <button onClick={e => { e.stopPropagation(); setSelected(c); }}
                className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
                <Eye size={10} /> Détails
              </button>
            )},
          ]}
        />
      </div>

      {selected && <CandidateModal candidate={selected} onClose={() => setSelected(null)} />}
    </AdminLayout>
  );
}
