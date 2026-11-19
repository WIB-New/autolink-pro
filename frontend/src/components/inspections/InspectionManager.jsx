import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardList, CheckCircle, XCircle, Camera, AlertTriangle, Plus, X, Car, Search, ClipboardEdit, Eye, LogIn, LogOut } from 'lucide-react';
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

function InspectionForm({ inspection, editing, onClose, onSaved }) {
  // editing = fiche existante (PATCH) ; sinon élément de la file (POST)
  const [checks, setChecks] = useState(() => {
    const init = {};
    Object.values(INSPECTION_ITEMS).forEach(cat => cat.items.forEach(item => { init[item] = null; }));
    if (editing?.checklist && typeof editing.checklist === 'object') {
      Object.entries(editing.checklist).forEach(([k, v]) => { if (k in init) init[k] = v; });
    }
    return init;
  });
  const [issues, setIssues] = useState(() => Array.isArray(editing?.issues) ? editing.issues : []);
  const [newIssue, setNewIssue] = useState('');
  const [km, setKm] = useState(String(editing ? editing.mileage_at_inspection : (inspection.mileage ?? '')));
  const [fuel, setFuel] = useState(editing ? editing.fuel_level : (inspection.fuel_level ?? 50));
  const [notes, setNotes] = useState(editing?.notes || '');
  const [photos, setPhotos] = useState(() => Object.fromEntries(PHOTO_SLOTS.map(s => [s, null])));
  const [previews, setPreviews] = useState({});
  const [savedPhotos, setSavedPhotos] = useState(() => editing?.photos || []);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRefs = useRef({});

  const norm = s => (s || '').toLowerCase().replace(/[^a-zàâéèêëîïôùûç0-9]/g, '');
  const savedForSlot = (slot) => savedPhotos.find(p => norm(p.caption) === norm(slot));
  const unmatchedSaved = savedPhotos.filter(p => !PHOTO_SLOTS.some(s => norm(s) === norm(p.caption)));

  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(v => v === 'ok').length;
  const failed = Object.values(checks).filter(v => v === 'nok').length;
  const score = Math.round((passed / total) * 100);

  const vehicleLabel = editing ? inspection.vehicle_name : inspection.vehicle;
  const plate = editing ? inspection.vehicle_plate : inspection.plate;
  const clientLabel = editing ? inspection.client_name : inspection.client;

  const addIssue = () => { if (newIssue.trim()) { setIssues(i => [...i, { text: newIssue.trim(), severity: 'minor' }]); setNewIssue(''); } };

  const pickPhoto = (slot, file) => {
    if (!file) return;
    setPhotos(p => ({ ...p, [slot]: file }));
    setPreviews(p => ({ ...p, [slot]: URL.createObjectURL(file) }));
  };

  const clearPicked = (slot, e) => {
    e.stopPropagation();
    setPhotos(p => ({ ...p, [slot]: null }));
    setPreviews(p => ({ ...p, [slot]: null }));
    if (fileRefs.current[slot]) fileRefs.current[slot].value = '';
  };

  const removeSaved = async (photo, e) => {
    e.stopPropagation();
    try {
      await inspectionsAPI.deletePhoto(editing.id, photo.id);
      setSavedPhotos(ps => ps.filter(x => x.id !== photo.id));
    } catch (err) {
      setError('Suppression de la photo impossible.');
    }
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      if (!editing) {
        fd.append('booking', inspection.id);
        fd.append('vehicle', inspection.vehicle_id);
        fd.append('inspection_type', inspection.inspection_type);
      }
      fd.append('mileage_at_inspection', parseInt(km, 10) || 0);
      fd.append('fuel_level', fuel);
      fd.append('condition_score', score);
      fd.append('checklist', JSON.stringify(checks));
      fd.append('issues', JSON.stringify(issues));
      fd.append('notes', notes);
      PHOTO_SLOTS.forEach(slot => { if (photos[slot]) fd.append('uploaded_photos', photos[slot], `${slot}.jpg`); });
      if (editing) await inspectionsAPI.update(editing.id, fd);
      else await inspectionsAPI.create(fd);
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
        <h3 className="text-xl font-bold text-slate-900 mb-2">{editing ? 'Fiche d\'inspection mise à jour !' : 'Fiche d\'inspection enregistrée !'}</h3>
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
              <h3 className="font-bold text-slate-900">
                {editing ? 'Modifier la fiche' : 'Fiche d\'inspection'} — {inspection.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
              </h3>
              <p className="text-sm text-slate-500">
                {vehicleLabel} ({plate}) · Client : {clientLabel}
                {editing && <> · Contrôleur : {inspection.controller_name || '—'} · {formatDate(inspection.inspection_date)}</>}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6">
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

            <div>
              <h4 className="font-bold text-slate-800 mb-3">Photos de l'état du véhicule</h4>
              <div className="grid grid-cols-4 gap-3">
                {PHOTO_SLOTS.map(label => {
                  const saved = savedForSlot(label);
                  const preview = previews[label];
                  const img = preview || (saved ? mediaUrl(saved.image) : null);
                  return (
                    <div key={label}
                      onClick={() => fileRefs.current[label]?.click()}
                      className={`relative border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${img ? 'border-primary-400 bg-primary-50' : 'border-slate-300 hover:border-primary-400'}`}>
                      {img ? (
                        <>
                          <img src={img} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">{label}</span>
                          <button type="button"
                            onClick={preview ? (e) => clearPicked(label, e) : (e) => removeSaved(saved, e)}
                            title={preview ? 'Retirer cette photo' : 'Supprimer la photo enregistrée'}
                            className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow">
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <><Camera size={20} className="text-slate-400 mb-1" /><span className="text-xs text-slate-400 text-center px-1">{label}</span></>
                      )}
                      <input ref={el => { fileRefs.current[label] = el; }} type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={e => pickPhoto(label, e.target.files?.[0])} />
                    </div>
                  );
                })}
              </div>
              {unmatchedSaved.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-2">Autres photos enregistrées</p>
                  <div className="grid grid-cols-4 gap-3">
                    {unmatchedSaved.map(p => (
                      <div key={p.id} className="relative rounded-xl aspect-square overflow-hidden border border-slate-200">
                        <a href={mediaUrl(p.image)} target="_blank" rel="noreferrer">
                          <img src={mediaUrl(p.image)} alt={p.caption} className="w-full h-full object-cover" />
                        </a>
                        <button type="button" onClick={(e) => removeSaved(p, e)} title="Supprimer"
                          className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                      <span className="text-sm text-red-800 flex-1">{issue.text || issue}</span>
                      <button onClick={() => setIssues(is => is.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Notes du contrôleur</label>
              <textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observations générales..." />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5 flex gap-3 rounded-b-2xl">
            <button onClick={onClose} className="btn-outline flex-1 py-3">Annuler</button>
            <button onClick={submit} disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {saving ? 'Enregistrement…' : `${editing ? 'Mettre à jour' : 'Valider'} la fiche d'inspection (${score}/100)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionDetail({ inspection, onClose }) {
  const ok = Object.values(inspection.checklist || {}).filter(v => v === 'ok').length;
  const nok = Object.values(inspection.checklist || {}).filter(v => v === 'nok').length;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto flex items-start justify-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Fiche {inspection.inspection_type === 'entry' ? 'd\'entrée' : 'de sortie'} — {inspection.vehicle_name}</h3>
            <p className="text-sm text-slate-500">{inspection.vehicle_plate} · {inspection.booking_reference} · {formatDate(inspection.inspection_date)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Client</span><p className="font-semibold">{inspection.client_name}</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Contrôleur</span><p className="font-semibold">{inspection.controller_name || '—'}</p>{inspection.edited_by_name && <p className="text-[10px] text-slate-400 mt-0.5">Modifiée par {inspection.edited_by_name}{inspection.edited_at ? ` le ${formatDate(inspection.edited_at)}` : ''}</p>}</div>
            <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Kilométrage</span><p className="font-semibold">{Number(inspection.mileage_at_inspection || 0).toLocaleString()} km</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Carburant</span><p className="font-semibold">{inspection.fuel_level}%</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-black ${inspection.condition_score >= 80 ? 'text-emerald-600' : inspection.condition_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{inspection.condition_score}/100</div>
            <div className="text-slate-500">{ok} conforme(s) · {nok} problème(s)</div>
          </div>
          {Array.isArray(inspection.issues) && inspection.issues.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Dommages constatés</h4>
              {inspection.issues.map((it, i) => (
                <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5 mb-1.5">
                  <AlertTriangle size={13} className="text-red-500 shrink-0" /><span className="text-red-800">{it.text || it}</span>
                </div>
              ))}
            </div>
          )}
          {inspection.notes && <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Notes</span><p>{inspection.notes}</p></div>}
          {inspection.photos?.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {inspection.photos.map(p => (
                <a key={p.id} href={mediaUrl(p.image)} target="_blank" rel="noreferrer" className="rounded-lg aspect-square overflow-hidden border border-slate-200">
                  <img src={mediaUrl(p.image)} alt={p.caption} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-slate-100"><button onClick={onClose} className="btn-outline w-full">Fermer</button></div>
      </div>
    </div>
  );
}

export default function InspectionManager() {
  const [selected, setSelected] = useState(null);   // élément de file → création
  const [editing, setEditing] = useState(null);     // fiche existante → PATCH
  const [detail, setDetail] = useState(null);       // fiche existante → lecture
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = useCallback(async (q = search, type = typeFilter) => {
    setLoading(true);
    try {
      const rows = r => r.data.results ?? r.data;
      const [entry, exit, done] = await Promise.all([
        type === 'exit' ? Promise.resolve({ data: { results: [] } }) : inspectionsAPI.queue({ type: 'entry', search: q || undefined }),
        type === 'entry' ? Promise.resolve({ data: { results: [] } }) : inspectionsAPI.queue({ type: 'exit', search: q || undefined }),
        inspectionsAPI.list({ ordering: '-inspection_date', search: q || undefined, ...(type !== 'all' ? { inspection_type: type } : {}) }),
      ]);
      setPending([...rows(entry), ...rows(exit)]);
      setCompleted(rows(done));
    } catch (e) {
      console.error('Inspections:', e);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { const t = setTimeout(() => load(search, typeFilter), 300); return () => clearTimeout(t); }, [search, typeFilter, load]);

  const issuesCount = (ins) => Array.isArray(ins.issues) ? ins.issues.length : 0;
  const th = 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400';
  const td = 'px-4 py-3.5 text-sm text-slate-700';
  const iconBtn = 'w-8 h-8 rounded-lg flex items-center justify-center transition-colors';

  return (
      <div className="max-w-6xl mx-auto space-y-6">
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

        {/* Recherche + filtres */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Rechercher un véhicule, une plaque, un client…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
            {[['all', 'Tous'], ['entry', 'Entrées'], ['exit', 'Sorties']].map(([val, label]) => (
              <button key={val} onClick={() => setTypeFilter(val)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${typeFilter === val ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {label}
              </button>
            ))}
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
            ? <p className="text-sm text-slate-400 text-center py-8">Aucune inspection en attente{search ? ' pour cette recherche' : ''}.</p>
            : <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className={th}>Véhicule</th>
                      <th className={th}>Type</th>
                      <th className={th}>Client</th>
                      <th className={th}>Réservation</th>
                      <th className={th}>Période</th>
                      <th className={th}>Km / Carburant</th>
                      <th className={`${th} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pending.map(ins => (
                      <tr key={`${ins.inspection_type}-${ins.id}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0"><Car size={16} className="text-primary-600" /></div>
                            <div>
                              <p className="font-semibold text-slate-900">{ins.vehicle}</p>
                              <p className="text-xs text-slate-400">{ins.plate} · {ins.owner}</p>
                            </div>
                          </div>
                        </td>
                        <td className={td}>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${ins.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {ins.inspection_type === 'entry' ? <LogIn size={11} /> : <LogOut size={11} />}
                            {ins.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                          </span>
                        </td>
                        <td className={td}>{ins.client}</td>
                        <td className={td}>{ins.booking_reference}</td>
                        <td className={td}>{formatDate(ins.start_date)} → {formatDate(ins.end_date)}</td>
                        <td className={td}>{Number(ins.mileage ?? 0).toLocaleString()} km · {ins.fuel_level ?? '—'}%</td>
                        <td className={`${td} text-right`}>
                          <div className="inline-flex gap-1.5">
                            <button onClick={() => setSelected(ins)} title="Remplir la fiche d'inspection"
                              className={`${iconBtn} bg-primary-50 text-primary-600 hover:bg-primary-100`}>
                              <ClipboardEdit size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        )}

        {!loading && tab === 'completed' && (
          completed.length === 0
            ? <p className="text-sm text-slate-400 text-center py-8">Aucune fiche enregistrée{search ? ' pour cette recherche' : ''}.</p>
            : <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className={th}>Véhicule</th>
                      <th className={th}>Type</th>
                      <th className={th}>Client</th>
                      <th className={th}>Date</th>
                      <th className={th}>Contrôleur</th>
                      <th className={th}>Score</th>
                      <th className={`${th} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {completed.map(ins => (
                      <tr key={ins.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                              {ins.photos?.[0]?.image
                                ? <img src={mediaUrl(ins.photos[0].image)} alt="" className="w-full h-full object-cover" />
                                : <Car size={16} className="text-slate-500" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{ins.vehicle_name}</p>
                              <p className="text-xs text-slate-400">{ins.vehicle_plate} · {ins.booking_reference}</p>
                            </div>
                          </div>
                        </td>
                        <td className={td}>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${ins.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {ins.inspection_type === 'entry' ? <LogIn size={11} /> : <LogOut size={11} />}
                            {ins.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                          </span>
                          {issuesCount(ins) > 0 && <span className="ml-1.5 text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">{issuesCount(ins)} problème(s)</span>}
                        </td>
                        <td className={td}>{ins.client_name}</td>
                        <td className={td}>{formatDate(ins.inspection_date)}</td>
                        <td className={td}>{ins.controller_name || '—'}</td>
                        <td className={td}>
                          <span className={`font-black ${ins.condition_score >= 80 ? 'text-emerald-600' : ins.condition_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{ins.condition_score}/100</span>
                        </td>
                        <td className={`${td} text-right`}>
                          <div className="inline-flex gap-1.5">
                            <button onClick={() => setDetail(ins)} title="Voir la fiche"
                              className={`${iconBtn} bg-slate-100 text-slate-500 hover:bg-slate-200`}>
                              <Eye size={15} />
                            </button>
                            <button onClick={() => setEditing(ins)} title="Modifier la fiche (nouveau score)"
                              className={`${iconBtn} bg-primary-50 text-primary-600 hover:bg-primary-100`}>
                              <ClipboardEdit size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        )}
      {selected && <InspectionForm inspection={selected} onClose={() => setSelected(null)} onSaved={load} />}
      {editing && <InspectionForm inspection={editing} editing={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {detail && <InspectionDetail inspection={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
