import React, { useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Camera, AlertTriangle, Plus, X, Car, User, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';

const INSPECTION_ITEMS = {
  exterior: {
    label: 'Extérieur',
    items: ['Carrosserie avant', 'Carrosserie arrière', 'Côté gauche', 'Côté droit', 'Toit', 'Pare-brise avant', 'Pare-brise arrière', 'Jantes et pneus', 'Rétroviseurs', 'Feux avant', 'Feux arrière', 'Plaque immatriculation'],
  },
  interior: {
    label: 'Intérieur',
    items: ['Tableau de bord', 'Sièges avant', 'Sièges arrière', 'Tapis de sol', 'Volant', 'Ceintures de sécurité', 'Climatisation', 'Autoradio / GPS', 'Rétroviseur intérieur', 'Coffre'],
  },
  mechanical: {
    label: 'Mécanique',
    items: ['Niveau huile moteur', 'Liquide refroidissement', 'Liquide frein', 'Batterie', 'Freins avant', 'Freins arrière', 'Suspension', 'Direction', 'Boîte de vitesses', 'Pot d\'échappement'],
  },
  documents: {
    label: 'Documents',
    items: ['Carte grise', 'Assurance à jour', 'Visite technique', 'Kit sécurité (triangle + gilet)', 'Extincteur', 'Roue de secours'],
  },
};

const PENDING_INSPECTIONS = [
  { id: 'INS001', type: 'entry', vehicle: 'Toyota Corolla 2022', plate: 'LT-4523-A', client: 'Marie Ngo Bell', bookingId: 'BK089', date: '2025-08-26', owner: 'Jean Fotso', km: 45230, fuel: 80 },
  { id: 'INS002', type: 'exit', vehicle: 'Hyundai Tucson 2023', plate: 'CE-8810-K', client: 'Yves Kamga', bookingId: 'BK085', date: '2025-08-26', owner: 'Moussa Etoundi', km: 62180, fuel: 45 },
  { id: 'INS003', type: 'entry', vehicle: 'BMW Série 5 2022', plate: 'LT-2210-G', client: 'Awa Mbarga', bookingId: 'BK090', date: '2025-08-27', owner: 'Isabelle Nkomo', km: 28900, fuel: 95 },
];

const COMPLETED = [
  { id: 'INS099', type: 'exit', vehicle: 'Ford Ranger 2021', plate: 'SW-3345-P', client: 'Paul Biya', date: '2025-08-25', score: 91, issues: 0, controller: 'Contrôleur AutoLink' },
  { id: 'INS098', type: 'entry', vehicle: 'Kia Sportage 2023', plate: 'LT-7789-M', client: 'Fatou Abena', date: '2025-08-24', score: 88, issues: 1, controller: 'Contrôleur AutoLink' },
];

function InspectionForm({ inspection, onClose }) {
  const [checks, setChecks] = useState(() => {
    const init = {};
    Object.values(INSPECTION_ITEMS).forEach(cat => cat.items.forEach(item => { init[item] = null; }));
    return init;
  });
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState('');
  const [km, setKm] = useState(String(inspection.km));
  const [fuel, setFuel] = useState(inspection.fuel);
  const [submitted, setSubmitted] = useState(false);

  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(v => v === 'ok').length;
  const failed = Object.values(checks).filter(v => v === 'nok').length;
  const score = Math.round((passed / total) * 100);

  const addIssue = () => { if (newIssue.trim()) { setIssues(i => [...i, { text: newIssue.trim(), severity: 'minor' }]); setNewIssue(''); } };

  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <ClipboardList size={56} className="text-primary-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Fiche d'inspection enregistrée !</h3>
        <div className={`text-3xl font-black mb-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}/100</div>
        <p className="text-slate-500 text-sm mb-5">{passed} OK · {failed} problème(s) · {issues.length} remarque(s)</p>
        <button onClick={onClose} className="btn-primary w-full">Fermer</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-5 flex items-center justify-between z-10">
            <div>
              <h3 className="font-bold text-slate-900">Fiche d'inspection — {inspection.type === 'entry' ? 'ENTRÉE' : 'SORTIE'}</h3>
              <p className="text-sm text-slate-500">{inspection.vehicle} ({inspection.plate}) · Client : {inspection.client} · {inspection.date}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Vehicle info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kilométrage actuel</label>
                <input type="number" className="input-field" value={km} onChange={e => setKm(e.target.value)} />
              </div>
              <div>
                <label className="label">Niveau carburant (%)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={fuel} onChange={e => setFuel(Number(e.target.value))} className="flex-1 accent-primary-600" />
                  <span className="font-bold text-primary-600 w-12 text-right">{fuel}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${fuel > 50 ? 'bg-emerald-500' : fuel > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${fuel}%` }} />
                </div>
              </div>
            </div>

            {/* Score progress */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
              <div className={`text-3xl font-black ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}</div>
              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{passed} conforme(s)</span><span>{total - passed - failed} à vérifier</span><span>{failed} problème(s)</span>
                </div>
              </div>
            </div>

            {/* Checklist by category */}
            {Object.entries(INSPECTION_ITEMS).map(([key, cat]) => (
              <div key={key}>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-xs font-bold">
                    {cat.items.filter(i => checks[i] === 'ok').length}/{cat.items.length}
                  </span>
                  {cat.label}
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {cat.items.map(item => (
                    <div key={item} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${checks[item] === 'ok' ? 'border-emerald-300 bg-emerald-50' : checks[item] === 'nok' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
                      <span className="text-sm flex-1 text-slate-700">{item}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setChecks(c => ({ ...c, [item]: c[item] === 'ok' ? null : 'ok' }))}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${checks[item] === 'ok' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100'}`}>
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => setChecks(c => ({ ...c, [item]: c[item] === 'nok' ? null : 'nok' }))}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${checks[item] === 'nok' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-100'}`}>
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Photo upload */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Photos de l'état du véhicule</h4>
              <div className="grid grid-cols-4 gap-3">
                {['Avant', 'Arrière', 'Côté G.', 'Côté D.', 'Intérieur', 'Coffre', 'KM', 'Carburant'].map(label => (
                  <div key={label} className="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors p-2">
                    <Camera size={20} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-400 text-center">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3">Remarques et dommages constatés</h4>
              <div className="flex gap-2 mb-3">
                <input type="text" className="input-field flex-1" placeholder="Décrivez un problème constaté..." value={newIssue} onChange={e => setNewIssue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIssue()} />
                <button onClick={addIssue} className="btn-accent px-4 py-2 text-sm flex items-center gap-1"><Plus size={14} /> Ajouter</button>
              </div>
              {issues.length > 0 && (
                <div className="space-y-2">
                  {issues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                      <span className="text-sm text-red-800 flex-1">{issue.text}</span>
                      <button onClick={() => setIssues(is => is.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 flex gap-3 rounded-b-2xl">
            <button onClick={onClose} className="btn-outline flex-1 py-3">Annuler</button>
            <button onClick={() => setSubmitted(true)} className="btn-primary flex-1 py-3">
              Valider la fiche d'inspection ({score}/100)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleInspection() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('pending');

  return (
    <AdminLayout title="Inspections et Audits Techniques" subtitle="Checklists hub & homologation">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="card bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Système de fiches d'entrée/sortie</h3>
              <p className="text-primary-200 text-sm">Chaque véhicule doit être inspecté <strong>avant et après</strong> chaque location. Les fiches sont horodatées, photographiées et archivées sur la plateforme pour résolution de litiges.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm inline-flex items-center gap-1 px-2">
          {[['pending', `À inspecter (${PENDING_INSPECTIONS.length})`], ['completed', `Complétées (${COMPLETED.length})`]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`relative px-4 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === val ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {label}
              {tab === val && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {tab === 'pending' && (
          <div className="space-y-4">
            {PENDING_INSPECTIONS.map(ins => (
              <div key={ins.id} className="bg-white rounded-2xl border-2 border-slate-100 hover:border-primary-200 shadow-sm p-5 transition-all">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0"><Car size={26} className="text-primary-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900">{ins.vehicle}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ins.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {ins.type === 'entry' ? 'FICHE ENTRÉE' : 'FICHE SORTIE'}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Car size={13} /> {ins.plate}</span>
                      <span className="inline-flex items-center gap-1"><User size={13} /> Client : {ins.client}</span>
                      <span className="inline-flex items-center gap-1"><Calendar size={13} /> {ins.date}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      Réservation : {ins.bookingId} · Propriétaire : {ins.owner} · {ins.km.toLocaleString()} km · Carburant : {ins.fuel}%
                    </div>
                  </div>
                  <button onClick={() => setSelected(ins)} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
                    <ClipboardList size={15} /> Inspecter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'completed' && (
          <div className="space-y-4">
            {COMPLETED.map(ins => (
              <div key={ins.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0"><Car size={26} className="text-slate-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900">{ins.vehicle}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ins.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {ins.type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                      </span>
                      {ins.issues > 0 && <span className="badge-warning">{ins.issues} problème(s)</span>}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Car size={13} /> {ins.plate}</span> ·
                      <span className="inline-flex items-center gap-1"><Calendar size={13} /> {ins.date}</span> ·
                      Contrôleur : {ins.controller}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${ins.score >= 80 ? 'text-emerald-600' : ins.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{ins.score}/100</div>
                    <div className="text-xs text-slate-400">Score inspection</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <InspectionForm inspection={selected} onClose={() => setSelected(null)} />}
    </AdminLayout>
  );
}
