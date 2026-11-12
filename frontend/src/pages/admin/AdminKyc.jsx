import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { adminDocsAPI, usersAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import {
  ShieldCheck, FileText, Eye, Check, X, Loader, Search,
  Clock, CheckCircle2, XCircle, UserCheck,
} from 'lucide-react';

const initials = u => `${(u?.first_name || '')[0] || ''}${(u?.last_name || '')[0] || ''}`.toUpperCase() || '?';
const fileUrl = f => f && (f.startsWith('http') ? f : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${f.startsWith('/') ? f : `/media/${f}`}`);
const DOCTYPE = { id: "Pièce d'identité", license: 'Permis de conduire', address: 'Justificatif de domicile', insurance: 'Assurance', other: 'Autre' };
const DOC_STATUS = {
  pending: ['En attente', 'bg-amber-100 text-amber-700'],
  verified: ['Conforme', 'bg-teal-100 text-teal-700'],
  rejected: ['Refusé', 'bg-red-100 text-red-600'],
};
const ROLE = { CLIENT: 'Client', OWNER: 'Propriétaire', DRIVER: 'Chauffeur', ADMIN: 'Admin', CONTROLLER: 'Contrôleur' };
const detailPath = u => (u.role === 'OWNER' ? `/admin/partenaires/${u.id}` : u.role === 'CLIENT' ? `/admin/clients/${u.id}` : u.role === 'DRIVER' ? '/admin/drivers' : '/admin/users');

export default function AdminKyc() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [docs, setDocs] = useState([]);
  const [kycUsers, setKycUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([
        adminDocsAPI.list({ page_size: 100 }),
        usersAPI.list({ kyc_status: 'pending', page_size: 50 }),
      ]);
      setDocs(d.data.results || d.data || []);
      setKycUsers(u.data.results || u.data || []);
    } catch (_) { setError('Impossible de charger les documents.'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => docs.filter(d => {
    if (tab !== 'all' && d.status !== tab) return false;
    if (!q) return true;
    const s = `${d.user_name} ${d.user_email} ${d.name}`.toLowerCase();
    return s.includes(q.toLowerCase());
  }), [docs, tab, q]);

  const counts = useMemo(() => ({
    pending: docs.filter(d => d.status === 'pending').length,
    verified: docs.filter(d => d.status === 'verified').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  }), [docs]);

  const verify = async (doc, status) => {
    const ok = await confirm({
      title: status === 'verified' ? 'Marquer le document conforme' : 'Refuser le document',
      message: `${doc.name} — déposé par ${doc.user_name} (${ROLE[doc.user_role] || doc.user_role}).`,
      confirmLabel: status === 'verified' ? 'Conforme' : 'Refuser',
      danger: status === 'rejected',
    });
    if (!ok) return;
    const note = status === 'rejected' ? (window.prompt('Motif du refus (optionnel) :') || '') : '';
    setBusy(doc.id);
    try {
      await adminDocsAPI.verify(doc.id, status, note);
      setError('');
      load();
    } catch (e) { setError(e.response?.data?.detail || 'Action impossible.'); }
    setBusy(null);
  };

  const decideKyc = async (u, status) => {
    const ok = await confirm({
      title: status === 'approved' ? 'Valider le dossier KYC' : 'Rejeter le dossier KYC',
      message: `${u.first_name} ${u.last_name} (${ROLE[u.role] || u.role}) — le statut KYC global du compte sera mis à jour et l'utilisateur notifié.`,
      confirmLabel: status === 'approved' ? 'Valider' : 'Rejeter',
      danger: status === 'rejected',
    });
    if (!ok) return;
    setBusy(`kyc-${u.id}`);
    try {
      await usersAPI.update(u.id, { kyc_status: status });
      setError('');
      load();
    } catch (e) { setError(e.response?.data?.detail || 'Action impossible.'); }
    setBusy(null);
  };

  const tabs = [
    ['pending', `En attente (${counts.pending})`],
    ['verified', `Conformes (${counts.verified})`],
    ['rejected', `Refusés (${counts.rejected})`],
    ['all', `Tous (${docs.length})`],
  ];

  return (
    <AdminLayout title="KYC & Documents" subtitle="Vérification des pièces de tous les utilisateurs" badges={{}}>
      {error && <div className="mb-4 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { l: 'Documents en attente', v: counts.pending, icon: Clock, cls: 'text-amber-600 bg-amber-50' },
          { l: 'Documents conformes', v: counts.verified, icon: CheckCircle2, cls: 'text-teal-600 bg-teal-50' },
          { l: 'Documents refusés', v: counts.rejected, icon: XCircle, cls: 'text-red-500 bg-red-50' },
          { l: 'Dossiers KYC en attente', v: kycUsers.length, icon: ShieldCheck, cls: 'text-blue-600 bg-blue-50' },
        ].map(s => (
          <div key={s.l} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.cls}`}><s.icon size={18} /></span>
            <div>
              <div className="text-xl font-black text-slate-900">{s.v}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Dossiers KYC en attente */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
          <UserCheck size={15} className="text-teal-600" /> Dossiers KYC utilisateurs en attente ({kycUsers.length})
        </h3>
        {kycUsers.length === 0 && <p className="text-[11px] text-slate-400">Aucun dossier en attente de validation.</p>}
        <div className="space-y-2.5">
          {kycUsers.map(u => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 border border-slate-100 rounded-xl px-4 py-3">
              {u.avatar
                ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                : <span className="w-9 h-9 rounded-xl bg-slate-800 text-white text-[11px] font-black flex items-center justify-center">{initials(u)}</span>}
              <div className="flex-1 min-w-[160px]">
                <button onClick={() => navigate(detailPath(u))} className="text-[12px] font-black text-slate-800 hover:text-teal-700">{u.first_name} {u.last_name}</button>
                <div className="text-[9px] text-slate-400">{u.email} · {ROLE[u.role] || u.role} · déposé le {u.kyc_submitted_at ? new Date(u.kyc_submitted_at).toLocaleDateString('fr-FR') : '—'}</div>
              </div>
              <div className="flex gap-2">
                <button disabled={busy === `kyc-${u.id}`} onClick={() => decideKyc(u, 'rejected')}
                  className="flex items-center gap-1 text-[10px] font-black text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50">
                  <X size={11} /> Rejeter
                </button>
                <button disabled={busy === `kyc-${u.id}`} onClick={() => decideKyc(u, 'approved')}
                  className="flex items-center gap-1 text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-xl disabled:opacity-50">
                  {busy === `kyc-${u.id}` ? <Loader size={11} className="animate-spin" /> : <Check size={11} />} Valider le dossier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents déposés */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><FileText size={15} className="text-teal-600" /> Documents déposés par les utilisateurs</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Utilisateur ou document…"
              className="pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] w-56 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="flex gap-1.5 mb-4">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors ${tab === k ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10 text-slate-400 text-xs"><Loader size={18} className="animate-spin mx-auto mb-2" />Chargement…</div>}
        {!loading && filtered.length === 0 && <p className="text-[11px] text-slate-400 text-center py-8">Aucun document dans cette catégorie.</p>}

        <div className="space-y-2.5">
          {!loading && filtered.map(d => {
            const st = DOC_STATUS[d.status] || DOC_STATUS.pending;
            return (
              <div key={d.id} className="flex flex-wrap items-center gap-3 border border-slate-100 rounded-xl px-4 py-3">
                {d.user_avatar
                  ? <img src={d.user_avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  : <span className="w-9 h-9 rounded-xl bg-slate-800 text-white text-[11px] font-black flex items-center justify-center">{(d.user_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[12px] font-black text-slate-800">{d.name} <span className="text-[9px] font-bold text-slate-400">— {DOCTYPE[d.doc_type] || d.doc_type}</span></div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    {d.user_name} · {ROLE[d.user_role] || d.user_role} · {d.user_email}
                    {d.issued_place ? ` · ${d.issued_place}` : ''}
                    {d.validity ? ` · valable jusqu'au ${new Date(d.validity).toLocaleDateString('fr-FR')}` : ''}
                  </div>
                  {d.verification_note && <div className="text-[9px] text-red-500 mt-0.5">Motif : {d.verification_note}</div>}
                </div>
                <span className="text-[9px] text-slate-400">{d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${st[1]}`}>{st[0]}</span>
                <div className="flex gap-2">
                  {d.file && (
                    <a href={fileUrl(d.file)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl">
                      <Eye size={11} /> Voir
                    </a>)}
                  {d.status !== 'verified' && (
                    <button disabled={busy === d.id} onClick={() => verify(d, 'verified')}
                      className="flex items-center gap-1 text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-xl disabled:opacity-50">
                      {busy === d.id ? <Loader size={11} className="animate-spin" /> : <Check size={11} />} Conforme
                    </button>)}
                  {d.status !== 'rejected' && (
                    <button disabled={busy === d.id} onClick={() => verify(d, 'rejected')}
                      className="flex items-center gap-1 text-[10px] font-black text-red-500 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 disabled:opacity-50">
                      <X size={11} /> Refuser
                    </button>)}
                  {d.status === 'rejected' && (
                    <button disabled={busy === d.id} onClick={() => verify(d, 'pending')}
                      className="text-[10px] font-black text-slate-500 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-50">
                      Remettre en attente
                    </button>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
