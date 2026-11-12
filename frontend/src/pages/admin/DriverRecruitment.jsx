import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, Shield, X, UserCheck, MapPin, Phone, Mail, FileText, Car } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { driversAPI, usersAPI } from '../../services/api';

const STATUS_CONFIG = {
  pending:  { label: 'En attente',         cls: 'bg-amber-100 text-amber-700' },
  review:   { label: 'En cours d\'examen', cls: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approuvé',           cls: 'bg-teal-100 text-teal-700' },
  rejected: { label: 'Refusé',             cls: 'bg-red-100 text-red-600' },
};

const AVAIL = { full: 'Temps plein', part: 'Temps partiel', weekend: 'Week-ends' };
const shortDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const bool = v => v ? <CheckCircle size={14} className="text-emerald-500 inline" /> : <XCircle size={14} className="text-slate-300 inline" />;

/* Modale de détail : affiche la candidature réelle + actions admin. */
function ApplicationModal({ app, onClose, onDecision, onToggleActive, onSaveNotes, busy }) {
  const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
  const decided = ['approved', 'rejected'].includes(app.status);
  const isApproved = app.status === 'approved';
  const checks = app.compliance_checks || [];
  const checksOk = checks.filter(c => c.ok).length;
  const [notes, setNotes] = useState(app.reviewer_notes || '');
  const stats = app.driver_stats;
  const rows = [
    ['Téléphone', app.phone || '—'],
    ['Email', app.email || '—'],
    ['Ville', app.city || '—'],
    ['Expérience', `${app.experience_years ?? 0} an(s)`],
    ['Permis', `${app.license_type || '—'} · N° ${app.license_number || '—'}`],
    ['Obtention / Validité', `${shortDate(app.license_obtained_at)} → ${shortDate(app.license_expiry)}`],
    ['Disponibilité', AVAIL[app.availability] || '—'],
    ['Garantie', app.guarantee_type || '—'],
    ['Statut pro.', app.professional_status || '—'],
    ['Véhicule', app.has_vehicle ? (app.vehicle_description || 'Oui') : 'Non'],
    ['Références', app.references || '—'],
    ['Message', app.message || '—'],
  ];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {app.applicant_avatar
              ? <img src={app.applicant_avatar} alt="" className="w-11 h-11 rounded-xl object-cover" />
              : <div className="w-11 h-11 bg-teal-700 rounded-xl flex items-center justify-center text-white font-black">{(app.applicant_name || app.full_name || '?').charAt(0)}</div>}
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{app.applicant_name || app.full_name}</h3>
              <p className="text-sm text-slate-500">Postulé le {shortDate(app.applied_at)} · <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${st.cls}`}>{st.label}</span>
                {app.driver_rating != null && <span className="ml-2 text-amber-600 font-black">★ {Number(app.driver_rating).toFixed(1)} ({app.driver_rating_count} avis)</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${app.compliance_score >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>{app.compliance_score ?? 0}%</div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${app.compliance_score >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${app.compliance_score ?? 0}%` }} />
              </div>
              <p className="text-sm text-slate-500 mt-1">Score de conformité — <strong>{checksOk}/{checks.length || 9} critères validés</strong> (chaque critère vaut ~11 %)</p>
            </div>
          </div>
          {checks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {checks.map(c => (
                <div key={c.key} className={`rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 ${c.ok ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  {bool(c.ok)}
                  <span className={`text-[9px] font-black ${c.ok ? 'text-emerald-700' : 'text-slate-400'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          {stats && (
            <div className="bg-slate-50 rounded-xl p-3.5">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Activité chauffeur</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {[
                  ['Courses', stats.total_trips ?? 0],
                  ['Gains cumulés', `${Math.round(stats.total_earned || 0).toLocaleString('fr-FR')} F`],
                  ['Acceptation', stats.acceptance_rate != null ? `${stats.acceptance_rate} %` : '—'],
                  ['Ponctualité', stats.on_time_rate != null ? `${stats.on_time_rate} %` : '—'],
                  ['Solde wallet', `${Math.round(stats.balance || 0).toLocaleString('fr-FR')} F`],
                  ['Statut', stats.is_online ? 'En ligne' : 'Hors ligne'],
                  ['Certifié le', stats.certified_at ? shortDate(stats.certified_at) : '—'],
                  ['Compte', stats.is_active ? 'Actif' : 'Suspendu'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-white rounded-lg py-2 px-1">
                    <div className="text-[12px] font-black text-slate-800 truncate">{v}</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">{l}</div>
                  </div>
                ))}
              </div>
              {stats.assigned_vehicle && <div className="text-[10px] text-slate-500 mt-2">Véhicule assigné : <strong>{stats.assigned_vehicle}</strong></div>}
            </div>
          )}
          <div className="space-y-2">
            {rows.map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 text-[12px] border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold shrink-0">{l}</span>
                <span className="font-bold text-slate-800 text-right">{v}</span>
              </div>
            ))}
          </div>
          {app.driving_test_score != null && (
            <div className="text-[11px] font-bold text-slate-600">Score au test de conduite : <strong>{app.driving_test_score}/100</strong></div>
          )}
          <div className="bg-slate-50 rounded-xl p-3.5">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Assurance déclarée : {app.has_insurance ? 'Oui' : 'Non'} · Garantie : {app.guarantee_type || '—'}</div>
          </div>
          <div className="space-y-2">
            {[
              ['Permis de conduire', app.license_document],
              ['Casier judiciaire', app.criminal_record_document],
              ['Certificat médical', app.medical_certificate_document],
            ].map(([label, url]) => url ? (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold text-teal-700 bg-teal-50 rounded-xl px-3.5 py-2.5 hover:bg-teal-100 transition-colors">
                <FileText size={13} /> Voir — {label}
              </a>
            ) : (
              <div key={label} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-xl px-3.5 py-2.5">
                <FileText size={13} /> {label} — non déposé
              </div>
            ))}
          </div>
          <div className="pt-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Notes d'examen (visibles par l'équipe seulement)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Observations sur le dossier, pièces à demander…"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
            {notes !== (app.reviewer_notes || '') && (
              <button disabled={busy} onClick={() => onSaveNotes(notes)}
                className="mt-1.5 text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2 rounded-xl disabled:opacity-50">
                Enregistrer les notes
              </button>)}
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          {isApproved ? (
            <button disabled={busy} onClick={onToggleActive}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              <UserCheck size={16} /> {app.driver_active === false ? 'Réactiver le compte' : 'Désactiver le compte'}
            </button>
          ) : decided ? (
            <p className="flex-1 text-center text-[11px] font-bold text-slate-400 py-3">Candidature déjà tranchée — {st.label.toLowerCase()}.</p>
          ) : (
            <>
              <button disabled={busy} onClick={() => onDecision('rejected')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-semibold py-3 rounded-xl transition-colors">
                <XCircle size={16} /> Refuser
              </button>
              <button disabled={busy} onClick={() => onDecision('approved')}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
                <CheckCircle size={16} /> Approuver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DriverRecruitment() {
  const [tab, setTab] = useState('all');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [driverActive, setDriverActive] = useState(null);

  /* État du compte chauffeur quand la candidature est approuvée. */
  useEffect(() => {
    setDriverActive(null);
    if (selected?.status === 'approved' && selected.applicant) {
      usersAPI.get(selected.applicant)
        .then(({ data }) => setDriverActive(data.is_active !== false))
        .catch(() => setDriverActive(true));
    }
  }, [selected]);

  const load = useCallback(async () => {
    try {
      const res = await driversAPI.list({ page_size: 100 });
      setApps(res.data.results || res.data);
    } catch (_) { setApps([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (status) => {
    setBusy(true);
    try {
      // 'status' est read-only → actions dédiées approve/reject côté backend
      if (status === 'approved') await driversAPI.approve(selected.id);
      else await driversAPI.reject(selected.id);
      await load();
      setSelected(null);
    } catch (_) { setBusy(false); }
    setBusy(false);
  };

  const saveNotes = async (reviewer_notes) => {
    setBusy(true);
    try {
      await driversAPI.update(selected.id, { reviewer_notes });
      await load();
      setSelected(s => ({ ...s, reviewer_notes }));
    } catch (_) {}
    setBusy(false);
  };

  const toggleActive = async () => {
    if (!selected?.applicant) return;
    setBusy(true);
    try {
      await driversAPI.toggleDriverActive(selected.applicant);
      setDriverActive(a => !(a !== false));
      await load();
    } catch (_) {}
    setBusy(false);
  };

  const filtered = apps.filter(c => tab === 'all' || c.status === tab);
  const count = s => apps.filter(c => c.status === s).length;
  const counts = { all: apps.length, pending: count('pending'), review: count('review'), approved: count('approved'), rejected: count('rejected') };

  return (
    <AdminLayout title="Recrutement et Onboarding Chauffeurs" subtitle="Candidats & certification">
      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={User} iconCls="bg-blue-50 text-blue-600" value={apps.length} label="Candidatures" />
        <StatCard icon={Clock} iconCls="bg-amber-50 text-amber-600" value={counts.pending + counts.review} label="À examiner" />
        <StatCard icon={UserCheck} iconCls="bg-emerald-50 text-emerald-600" value={counts.approved} label="Approuvés" />
        <StatCard icon={Shield} iconCls="bg-violet-50 text-violet-600" value={counts.rejected} label="Refusés" />
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
          loading={loading} emptyText="Aucun candidat dans cette catégorie."
          rows={filtered}
          onRowClick={c => setSelected(c)}
          columns={[
            { label: 'Candidat', render: c => (
              <div className="flex items-center gap-2.5">
                {c.applicant_avatar
                  ? <img src={c.applicant_avatar} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  : <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">{(c.applicant_name || c.full_name || '?').charAt(0)}</div>}
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-slate-900 truncate">{c.applicant_name || c.full_name}</div>
                  <div className="text-[9px] text-slate-400 truncate flex items-center gap-1"><MapPin size={8} />{c.city || '—'} · {c.experience_years ?? 0} ans d'exp.</div>
                </div>
              </div>
            )},
            { label: 'Contact', render: c => (
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-slate-700 flex items-center gap-1"><Phone size={9} />{c.phone || '—'}</div>
                <div className="text-[9px] text-slate-400 truncate flex items-center gap-1"><Mail size={9} />{c.email || '—'}</div>
              </div>
            )},
            { label: 'Permis', render: c => (
              <div className="text-[10px] font-semibold text-slate-700 flex items-center gap-1"><Car size={10} className="text-slate-400" />{c.license_type || '—'}</div>
            )},
            { label: 'Postulé', render: c => <span className="text-[10px] font-semibold text-slate-500">{shortDate(c.applied_at)}</span> },
            { label: 'Conformité', render: c => {
              const score = c.compliance_score ?? 0;
              return (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">{score}%</span>
                </div>
              );
            }},
            { label: 'Statut', render: c => <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${STATUS_CONFIG[c.status]?.cls || 'bg-slate-100 text-slate-500'}`}>{STATUS_CONFIG[c.status]?.label || c.status}</span> },
            { label: 'Action', align: 'right', render: c => (
              <button onClick={e => { e.stopPropagation(); setSelected(c); }}
                className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
                <Eye size={10} /> Détails
              </button>
            )},
          ]}
        />
      </div>

      {selected && <ApplicationModal app={{ ...selected, driver_active: driverActive }} onClose={() => setSelected(null)} onDecision={decide} onToggleActive={toggleActive} onSaveNotes={saveNotes} busy={busy} />}
    </AdminLayout>
  );
}
