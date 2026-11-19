import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardList, CheckCircle, XCircle, Camera, AlertTriangle, Plus, X, Car, User, Calendar } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { inspectionsAPI } from '../../services/api';
import { mediaUrl } from '../../utils/media';
import { formatDate } from '../../i18n';

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

const PHOTO_SLOTS = ['Avant', 'Arrière', 'Côté G.', 'Côté D.', 'Intérieur', 'Coffre', 'KM', 'Carburant'];

function InspectionForm({ inspection, onClose, onSaved }) {
  const [checks, setChecks] = useState(() => {
    const init = {};
    Object.values(INSPECTION_ITEMS).forEach(cat => cat.items.forEach(item => { init[item] = null; }));
    return init;
  });
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState('');
  const [km, setKm] = useState(String(inspection.mileage ?? ''));
  const [fuel, setFuel] = useState(inspection.fuel_level ?? 50);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState(() => Object.fromEntries(PHOTO_SLOTS.map(s => [s, null])));
  const [previews, setPreviews] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRefs = useRef({});

  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(v => v === 'ok').length;
  const failed = Object.values(checks).filter(v => v === 'nok').length;
  const score = Math.round((passed / total) * 100);

  const addIssue = () => { if (newIssue.trim()) { setIssues(i => [...i, { text: newIssue.trim(), severity: 'minor' }]); setNewIssue(''); } };

  const pickPhoto = (slot, file) => {
    if (!file) return;
    setPhotos(p => ({ ...p, [slot]: file }));
    setPreviews(p => ({ ...p, [slot]: URL.createObjectURL(file) }));
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('booking', inspection.id);
      fd.append('vehicle', inspection.vehicle_id);
      fd.append('inspection_type', inspection.inspection_type);
      fd.append('mileage_at_inspection', parseInt(km, 10) || 0);
      fd.append('fuel_level', fuel);
      fd.append('condition_score', score);
      fd.append('checklist', JSON.stringify(checks));
      fd.append('issues', JSON.stringify(issues));
      fd.append('notes', notes);
      PHOTO_SLOTS.forEach(slot => { if (photos[slot]) fd.append('uploaded_photos', photos[slot], `${slot}.jpg`); });
      await inspectionsAPI.create(fd);
      setSubmitted(true);
    } catch (err) {
      const d = err?.response?.data;
      setError(typeof d === 'string' ? d : (d?.detail || Object.values(d || {}).flat()[0] || 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <ClipboardList size={56} className="text-primary-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Fiche d'inspection enregistrée !</h3>
        <div className={`text-3xl font-black mb-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}/100</div>
        <p className="text-slate-500 text-sm mb-5">{passed} OK · {failed} problème(s) · {issues.length} remarque(s)</p>
        <button onClick={() => { onSaved(); onClose(); }} className="btn-primary w-full">Fermer</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
          <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-5 flex items-center justify-between z-10">
            <div>
              <h3 className="font-bold text-slate-900">Fiche d'inspection — {inspection.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}</h3>
              <p className="text-sm text-slate-500">{inspection.vehicle} ({inspection.plate}) · Client : {inspection.client} · {formatDate(inspection.start_date)}</p>
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
                {PHOTO_SLOTS.map(label => (
                  <div key={label}
                    onClick={() => fileRefs.current[label]?.click()}
                    className={`border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors p-2 overflow-hidden ${photos[label] ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-400'}`}>
                    {previews[label]
                      ? <img src={previews[label]} alt={label} className="w-full h-full object-cover rounded-lg" />
                      : <><Camera size={20} className="text-slate-400 mb-1" /><span className="text-xs text-slate-400 text-center">{label}</span></>}
                    <input ref={el => { fileRefs.current[label] = el; }} type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={e => pickPhoto(label, e.target.files?.[0])} />
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

            {/* Notes */}
            <div>
              <label className="label">Notes du contrôleur</label>
              <textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observations générales..." />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 flex gap-3 rounded-b-2xl">
            <button onClick={onClose} className="btn-outline flex-1 py-3">Annuler</button>
            <button onClick={submit} disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {saving ? 'Enregistrement…' : `Valider la fiche d'inspection (${score}/100)`}
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
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [entry, exit, done] = await Promise.all([
        inspectionsAPI.queue({ type: 'entry' }),
        inspectionsAPI.queue({ type: 'exit' }),
        inspectionsAPI.list({ ordering: '-inspection_date' }),
      ]);
      const rows = r => r.data.results ?? r.data;
      setPending([...rows(entry), ...rows(exit)]);
      setCompleted(rows(done));
    } catch (e) {
      console.error('Inspections:', e);
      setPending([]);
      setCompleted([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const issuesCount = (ins) => Array.isArray(ins.issues) ? ins.issues.length : 0;

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
          {[['pending', `À inspecter (${pending.length})`], ['completed', `Complétées (${completed.length})`]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`relative px-4 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === val ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {label}
              {tab === val && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-slate-400 text-center py-8">Chargement…</p>}

        {!loading && tab === 'pending' && (
          pending.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">Aucune inspection en attente — toutes les locations couvertes sont inspectées.</p>
            : <div className="space-y-4">
                {pending.map(ins => (
                  <div key={`${ins.inspection_type}-${ins.id}`} className="bg-white rounded-2xl border-2 border-slate-100 hover:border-primary-200 shadow-sm p-5 transition-all">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0"><Car size={26} className="text-primary-600" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-bold text-slate-900">{ins.vehicle}</h3>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ins.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {ins.inspection_type === 'entry' ? 'FICHE ENTRÉE' : 'FICHE SORTIE'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Car size={13} /> {ins.plate}</span>
                          <span className="inline-flex items-center gap-1"><User size={13} /> Client : {ins.client}</span>
                          <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatDate(ins.start_date)} → {formatDate(ins.end_date)}</span>
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          Réservation : {ins.booking_reference} · Propriétaire : {ins.owner} · {Number(ins.mileage ?? 0).toLocaleString()} km · Carburant : {ins.fuel_level ?? '—'}%
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

        {!loading && tab === 'completed' && (
          completed.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">Aucune fiche d'inspection enregistrée pour le moment.</p>
            : <div className="space-y-4">
                {completed.map(ins => (
                  <div key={ins.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                        {ins.photos?.[0]?.image
                          ? <img src={mediaUrl(ins.photos[0].image)} alt="" className="w-full h-full object-cover" />
                          : <Car size={26} className="text-slate-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-bold text-slate-900">{ins.vehicle_name}</h3>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ins.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {ins.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                          </span>
                          {issuesCount(ins) > 0 && <span className="badge-warning">{issuesCount(ins)} problème(s)</span>}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1"><Car size={13} /> {ins.vehicle_plate}</span> ·
                          <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatDate(ins.inspection_date)}</span> ·
                          Contrôleur : {ins.controller_name || '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-black ${ins.condition_score >= 80 ? 'text-emerald-600' : ins.condition_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{ins.condition_score}/100</div>
                        <div className="text-xs text-slate-400">Score inspection</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>
      {selected && <InspectionForm inspection={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </AdminLayout>
  );
}
