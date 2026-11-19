import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Loader, Eye, Pencil, Copy, Link2, ToggleLeft,
  ToggleRight, Wallet, MessageCircle, Trash2, CheckCircle, XCircle,
  Tag, Users, TrendingUp, DollarSign, ChevronUp, ChevronDown,
} from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import { affiliatesAPI, messagingAPI } from '../../services/api';

const fmt = (v) => Number(v || 0).toLocaleString(localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR');
const dFmt = (d) => d ? new Date(d).toLocaleDateString(localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR') : '—';
const dtFmt = (d) => d ? new Date(d).toLocaleString(localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const TYPE_COLORS = {
  'Influenceur': 'bg-purple-100 text-purple-700',
  'Commercial': 'bg-blue-100 text-blue-700',
  'Hôtel partenaire': 'bg-teal-100 text-teal-700',
  'Chauffeur partenaire': 'bg-orange-100 text-orange-700',
};

const AGENT_TYPES = ['Influenceur', 'Commercial', 'Hôtel partenaire', 'Chauffeur partenaire'];
const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Buea', 'Garoua', 'Kribi', 'Maroua'];

/* Page détail d'un agent apporteur d'affaires — filleuls + versements en tableaux. */
export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  /* Filleuls */
  const [referrals, setReferrals] = useState({ results: [], count: 0 });
  const [refSearch, setRefSearch] = useState('');
  const [refFilter, setRefFilter] = useState('all'); // all | active (a loué) | inactive
  const [refLoading, setRefLoading] = useState(false);

  /* Versements */
  const [payouts, setPayouts] = useState({ results: [], count: 0 });
  const [paySearch, setPaySearch] = useState('');
  const [paySort, setPaySort] = useState('-paid_at');
  const [payLoading, setPayLoading] = useState(false);

  /* Modales */
  const [paying, setPaying] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', note: '' });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewPayout, setViewPayout] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAgent = useCallback(() => {
    setLoading(true);
    affiliatesAPI.agent(id)
      .then(res => setAgent(res.data))
      .catch(() => setAgent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const loadReferrals = useCallback(() => {
    setRefLoading(true);
    affiliatesAPI.agentReferrals(id, { q: refSearch || undefined, page_size: 100 })
      .then(res => setReferrals(res.data.results ? res.data : { results: res.data, count: res.data.length }))
      .catch(() => setReferrals({ results: [], count: 0 }))
      .finally(() => setRefLoading(false));
  }, [id, refSearch]);

  const loadPayouts = useCallback(() => {
    setPayLoading(true);
    affiliatesAPI.payouts({ agent: id, search: paySearch || undefined, ordering: paySort, page_size: 100 })
      .then(res => setPayouts(res.data.results ? res.data : { results: res.data, count: res.data.length }))
      .catch(() => setPayouts({ results: [], count: 0 }))
      .finally(() => setPayLoading(false));
  }, [id, paySearch, paySort]);

  useEffect(() => { loadAgent(); }, [loadAgent]);
  useEffect(() => { const t = setTimeout(loadReferrals, 300); return () => clearTimeout(t); }, [loadReferrals]);
  useEffect(() => { const t = setTimeout(loadPayouts, 300); return () => clearTimeout(t); }, [loadPayouts]);

  const filteredReferrals = useMemo(() => {
    const rows = referrals.results || [];
    if (refFilter === 'active') return rows.filter(r => r.completed_bookings > 0);
    if (refFilter === 'inactive') return rows.filter(r => r.completed_bookings === 0);
    return rows;
  }, [referrals, refFilter]);

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
  };

  const contactFilleul = async (r) => {
    try { await messagingAPI.open({ user: r.user_id }); navigate('/admin/messages'); }
    catch (_) { setError('Impossible d’ouvrir la conversation.'); }
  };

  const toggleAgent = async () => {
    try {
      await affiliatesAPI.updateAgent(agent.id, { is_active: !agent.is_active });
      setAgent(a => ({ ...a, is_active: !a.is_active }));
    } catch (_) {}
  };

  const saveEdit = async () => {
    setBusy(true); setError('');
    try {
      await affiliatesAPI.updateAgent(agent.id, {
        name: editForm.name,
        agent_type: editForm.agent_type,
        phone: editForm.phone,
        city: editForm.city,
        commission_rate: (Number(editForm.rate) / 100).toFixed(4),
      });
      setEditing(false); loadAgent();
    } catch (e) {
      setError(e.response?.data?.detail || 'Échec de la modification.');
    } finally { setBusy(false); }
  };

  const submitPayout = async () => {
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) return;
    setBusy(true); setError('');
    try {
      await affiliatesAPI.createPayout({ agent: agent.id, amount, note: payForm.note });
      setPaying(false); setPayForm({ amount: '', note: '' });
      loadAgent(); loadPayouts();
    } catch (e) {
      setError(e.response?.data?.amount?.[0] || e.response?.data?.detail || 'Échec du versement.');
    } finally { setBusy(false); }
  };

  const deletePayout = async (p) => {
    setBusy(true); setError('');
    try {
      await affiliatesAPI.deletePayout(p.id);
      setConfirmDelete(null);
      loadAgent(); loadPayouts();
    } catch (_) { setError('Échec de l’annulation du versement.'); }
    finally { setBusy(false); }
  };

  const sortBtn = (field) => {
    const active = paySort === field || paySort === `-${field}`;
    const asc = paySort === field;
    return (
      <button onClick={() => setPaySort(asc ? `-${field}` : field)}
        className="inline-flex items-center gap-1 hover:text-teal-700">
        {active ? (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
      </button>
    );
  };

  const due = Number(agent?.commission_due || 0);
  const registerLink = `${window.location.origin}/register?ref=${agent?.code}`;

  return (
    <AdminLayout title={agent ? `Agent ${agent.code}` : 'Agent'} subtitle="Détail de l'apporteur d'affaires">
      <button onClick={() => navigate('/admin/agents')}
        className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-teal-700 bg-white border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors mb-5">
        <ArrowLeft size={13} /> Retour aux agents
      </button>

      {loading && <div className="text-center py-16 text-slate-400 text-xs"><Loader size={20} className="animate-spin mx-auto mb-2" />Chargement…</div>}
      {!loading && !agent && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">Agent introuvable.</div>}
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{error}</div>}

      {!loading && agent && (
        <div className="space-y-5">
          {/* ═══ En-tête agent ═══ */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg font-black">
                  {(agent.name || 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-800">{agent.name}</h2>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${TYPE_COLORS[agent.agent_type] || 'bg-slate-100 text-slate-600'}`}>{agent.agent_type}</span>
                    {agent.is_active
                      ? <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Actif</span>
                      : <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-600">Inactif</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg">{agent.code}</code>
                    <span className="text-[11px] text-slate-500">{agent.city} · {agent.phone}</span>
                    <span className="text-[11px] text-slate-400">· taux {(Number(agent.commission_rate) * 100).toFixed(1)}% · créé le {dFmt(agent.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => copy(agent.code, 'code')} title="Copier le code"
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                  {copied === 'code' ? <CheckCircle size={15} className="text-emerald-500" /> : <Copy size={15} />}
                </button>
                <button onClick={() => copy(registerLink, 'link')} title="Copier le lien d'inscription"
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                  {copied === 'link' ? <CheckCircle size={15} className="text-emerald-500" /> : <Link2 size={15} />}
                </button>
                <button onClick={() => { setEditForm({ name: agent.name, agent_type: agent.agent_type, phone: agent.phone, city: agent.city, rate: (Number(agent.commission_rate) * 100).toFixed(1) }); setEditing(true); setError(''); }}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Modifier">
                  <Pencil size={15} />
                </button>
                <button onClick={toggleAgent} title={agent.is_active ? 'Désactiver' : 'Activer'}
                  className={`p-2.5 rounded-xl transition-colors ${agent.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:text-red-500' : 'bg-red-50 text-red-500 hover:bg-emerald-50 hover:text-emerald-600'}`}>
                  {agent.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                </button>
                <button onClick={() => { setPayForm({ amount: due > 0 ? String(Math.round(due)) : '', note: '' }); setPaying(true); setError(''); }}
                  disabled={due <= 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-colors ${due > 0 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  <Wallet size={14} /> Verser {due > 0 ? `(${fmt(due)} F)` : ''}
                </button>
              </div>
            </div>
          </div>

          {/* ═══ KPIs ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Conversions" value={fmt(agent.conversions)} />
            <StatCard icon={TrendingUp} label="CA filleuls" value={`${fmt(agent.generated_revenue)} F`} />
            <StatCard icon={Tag} label="Commission due" value={`${fmt(agent.commission_due)} F`} />
            <StatCard icon={DollarSign} label="Déjà versé" value={`${fmt(agent.commission_paid)} F`} />
          </div>
          <p className="text-[10px] text-slate-400 -mt-2">Commission = taux × montant des locations terminées par les filleuls de l'agent.</p>

          {/* ═══ Tableau filleuls ═══ */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Users size={15} className="text-teal-600" /> Filleuls ({filteredReferrals.length})</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={refSearch} onChange={e => setRefSearch(e.target.value)} placeholder="Nom, email…"
                    className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                </div>
                <select value={refFilter} onChange={e => setRefFilter(e.target.value)}
                  className="py-2 px-3 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                  <option value="all">Tous</option>
                  <option value="active">Avec locations</option>
                  <option value="inactive">Sans location</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Filleul</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Inscrit le</th>
                    <th className="px-5 py-3 text-center">Locations terminées</th>
                    <th className="px-5 py-3 text-right">CA généré</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {refLoading && <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400"><Loader size={16} className="animate-spin inline mr-2" />Chargement…</td></tr>}
                  {!refLoading && filteredReferrals.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">Aucun filleul{refSearch ? ' pour cette recherche' : ''}.</td></tr>}
                  {!refLoading && filteredReferrals.map(r => (
                    <tr key={r.user_id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-[10px] font-black">
                            {(r.name || 'C').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[11px] text-slate-600">{r.email}</div>
                        <div className="text-[10px] text-slate-400">{r.phone || '—'}{r.city ? ` · ${r.city}` : ''}</div>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-500">{dFmt(r.since)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${r.completed_bookings > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {r.completed_bookings}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-black text-slate-800">{fmt(r.generated_revenue)} F</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/clients/${r.user_id}`} title="Voir le dossier client"
                            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                            <Eye size={14} />
                          </Link>
                          <button onClick={() => contactFilleul(r)} title="Contacter par messagerie"
                            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══ Tableau versements ═══ */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Wallet size={15} className="text-teal-600" /> Versements ({payouts.count})</h3>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={paySearch} onChange={e => setPaySearch(e.target.value)} placeholder="Note, référence, payé par…"
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3"><span className="inline-flex items-center gap-1">Date {sortBtn('paid_at')}</span></th>
                    <th className="px-5 py-3 text-right"><span className="inline-flex items-center gap-1">Montant {sortBtn('amount')}</span></th>
                    <th className="px-5 py-3">Note / Référence</th>
                    <th className="px-5 py-3">Versé par</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400"><Loader size={16} className="animate-spin inline mr-2" />Chargement…</td></tr>}
                  {!payLoading && payouts.results.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-400">Aucun versement{paySearch ? ' pour cette recherche' : ''}.</td></tr>}
                  {!payLoading && payouts.results.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 text-[11px] text-slate-600 font-bold">{dtFmt(p.paid_at)}</td>
                      <td className="px-5 py-3 text-right text-xs font-black text-slate-800">{fmt(p.amount)} F</td>
                      <td className="px-5 py-3 text-[11px] text-slate-500 max-w-[220px] truncate">{p.note || '—'}</td>
                      <td className="px-5 py-3 text-[11px] text-slate-500">{p.paid_by_name || '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewPayout(p)} title="Voir le détail"
                            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} title="Annuler le versement"
                            className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modale versement ═══ */}
      {paying && agent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPaying(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-800 mb-1">Versement — {agent.code}</h3>
            <p className="text-[11px] text-slate-500 mb-4">Commission due : <span className="font-black text-teal-700">{fmt(due)} F</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Montant (F)</label>
                <div className="flex gap-2">
                  <input type="number" min="1" max={due} value={payForm.amount}
                    onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                  <button onClick={() => setPayForm(f => ({ ...f, amount: String(Math.round(due)) }))}
                    className="px-3 py-2.5 text-[10px] font-black bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100">Tout verser</button>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Note / Référence du virement</label>
                <input value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Ex. Virement MoMo 690123456"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setPaying(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black">Annuler</button>
              <button onClick={submitPayout} disabled={busy || !payForm.amount || Number(payForm.amount) <= 0 || Number(payForm.amount) > due}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-black hover:bg-teal-700 disabled:opacity-40">
                {busy ? 'Envoi…' : 'Enregistrer le versement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modale édition ═══ */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-800 mb-4">Modifier — <code className="text-teal-700">{agent.code}</code></h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                <select value={editForm.agent_type} onChange={e => setEditForm(f => ({ ...f, agent_type: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                  {AGENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ville</label>
                  <select value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Taux (%)</label>
                  <input type="number" min="0" max="100" step="0.5" value={editForm.rate} onChange={e => setEditForm(f => ({ ...f, rate: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black">Annuler</button>
              <button onClick={saveEdit} disabled={busy || !editForm.name || !editForm.phone}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-black hover:bg-teal-700 disabled:opacity-40">
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modale détail versement ═══ */}
      {viewPayout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewPayout(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-slate-800 mb-4">Versement #{viewPayout.id}</h3>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-slate-400 font-bold">Montant</dt><dd className="font-black text-slate-800">{fmt(viewPayout.amount)} F</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400 font-bold">Date</dt><dd className="font-bold text-slate-700">{dtFmt(viewPayout.paid_at)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400 font-bold">Agent</dt><dd className="font-bold text-teal-700">{viewPayout.agent_code || agent?.code}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400 font-bold">Versé par</dt><dd className="font-bold text-slate-700">{viewPayout.paid_by_name || '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-400 font-bold shrink-0">Note</dt><dd className="font-bold text-slate-700 text-right">{viewPayout.note || '—'}</dd></div>
            </dl>
            <button onClick={() => setViewPayout(null)} className="w-full mt-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black">Fermer</button>
          </div>
        </div>
      )}

      {/* ═══ Modale confirmation annulation ═══ */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><XCircle size={20} /></div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Annuler ce versement ?</h3>
                <p className="text-[11px] text-slate-500">{fmt(confirmDelete.amount)} F du {dFmt(confirmDelete.paid_at)}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Le montant sera rajouté aux commissions dues de l'agent. À n'utiliser qu'en cas de versement enregistré par erreur — le virement externe réel n'est pas rappelé.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-black">Conserver</button>
              <button onClick={() => deletePayout(confirmDelete)} disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 disabled:opacity-40">
                {busy ? 'Annulation…' : 'Annuler le versement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
