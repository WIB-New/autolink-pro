import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, Shield, X, UserCheck, MapPin, Phone, Mail, FileText, Car } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import { driversAPI } from '../../services/api';

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
function ApplicationModal({ app, onClose, onDecision, busy }) {
  const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
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
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{app.applicant_name || app.full_name}</h3>
            <p className="text-sm text-slate-500">Postulé le {shortDate(app.applied_at)} · <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${st.cls}`}>{st.label}</span></p>
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
              <p className="text-sm text-slate-500 mt-1">Score de conformité</p>
            </div>
          </div>
          <div className="space-y-2">
            {rows.map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 text-[12px] border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-semibold shrink-0">{l}</span>
                <span className="font-bold text-slate-800 text-right">{v}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              ['Permis valide', app.has_valid_license],
              ['Casier vierge', app.has_clean_criminal_record],
              ['Certif. médical', app.has_medical_certificate],
              ['Test conduit', app.driving_test_passed],
              ['Formation', app.training_completed],
              ['Assurance', app.has_insurance],
            ].map(([l, v]) => (
              <div key={l} className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                <div className="mb-1">{bool(v)}</div>
                <div className="text-[9px] font-black text-slate-500">{l}</div>
              </div>
            ))}
          </div>
          {app.license_document && (
            <a href={app.license_document} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-bold text-teal-700 bg-teal-50 rounded-xl px-3.5 py-2.5 hover:bg-teal-100 transition-colors">
              <FileText size={13} /> Voir le document du permis
            </a>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button disabled={busy} onClick={() => onDecision('rejected')}
            className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-semibold py-3 rounded-xl transition-colors">
            <XCircle size={16} /> Refuser
          </button>
          <button disabled={busy} onClick={() => onDecision('approved')}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            <CheckCircle size={16} /> Approuver
          </button>
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
                <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">{(c.applicant_name || c.full_name || '?').charAt(0)}</div>
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

      {selected && <ApplicationModal app={selected} onClose={() => setSelected(null)} onDecision={decide} busy={busy} />}
    </AdminLayout>
  );
}
