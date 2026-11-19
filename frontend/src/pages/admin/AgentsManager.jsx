import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle, XCircle, TrendingUp, DollarSign, Users, Copy, Link2, ToggleLeft, ToggleRight, Search, Loader, Wallet, Eye, Pencil } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';
import api, { affiliatesAPI } from '../../services/api';

const TYPE_COLORS = {
  'Influenceur': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Commercial': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Hôtel partenaire': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Chauffeur partenaire': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Buea', 'Garoua', 'Kribi', 'Maroua'];

export default function AgentsManager() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', agent_type: 'Influenceur', phone: '', city: 'Douala', rate: 5 });
  const [paying, setPaying] = useState(null);   // agent → modale versement
  const [payForm, setPayForm] = useState({ amount: '', note: '' });
  const [detail, setDetail] = useState(null);   // agent → modale détail
  const [detailData, setDetailData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [editing, setEditing] = useState(null); // agent → modale édition
  const [editForm, setEditForm] = useState({});
  const [copied, setCopied] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    affiliatesAPI.agents()
      .then(res => setAgents(res.data.results || res.data))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleAgent = async (a) => {
    try {
      await affiliatesAPI.updateAgent(a.id, { is_active: !a.is_active });
      setAgents(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x));
    } catch (_) { /* réessaie au prochain clic */ }
  };

  const createAgent = async () => {
    if (!newAgent.name || !newAgent.phone) return;
    setBusy(true); setError('');
    try {
      await affiliatesAPI.createAgent({
        name: newAgent.name,
        agent_type: newAgent.agent_type,
        phone: newAgent.phone,
        city: newAgent.city,
        commission_rate: (Number(newAgent.rate) / 100).toFixed(4),
      });
      load();
      setShowCreate(false);
      setNewAgent({ name: '', agent_type: 'Influenceur', phone: '', city: 'Douala', rate: 5 });
    } catch (err) {
      const d = err?.response?.data;
      setError(typeof d === 'string' ? d : Object.values(d || {}).flat()[0] || 'Création impossible.');
    }
    setBusy(false);
  };

  const openPayout = (a) => { setPaying(a); setPayForm({ amount: '', note: '' }); setError(''); };

  const openDetail = async (a) => {
    setDetail(a); setDetailData(null); setPayouts([]);
    try {
      const [d, p] = await Promise.all([
        api.get(`/affiliates/agents/${a.id}/`),
        affiliatesAPI.payouts({ agent: a.id }),
      ]);
      setDetailData(d.data);
      setPayouts(p.data.results || p.data);
    } catch (_) { setDetailData(a); }
  };

  const openEdit = (a) => {
    setEditing(a); setError('');
    setEditForm({
      name: a.name, agent_type: a.agent_type || 'Influenceur', phone: a.phone || '',
      city: a.city || 'Douala', rate: Math.round(Number(a.commission_rate || 0) * 10000) / 100,
    });
  };

  const saveEdit = async () => {
    setBusy(true); setError('');
    try {
      await affiliatesAPI.updateAgent(editing.id, {
        name: editForm.name, agent_type: editForm.agent_type, phone: editForm.phone,
        city: editForm.city, commission_rate: (Number(editForm.rate) / 100).toFixed(4),
      });
      load(); setEditing(null);
    } catch (err) {
      const d = err?.response?.data;
      setError(typeof d === 'string' ? d : Object.values(d || {}).flat()[0] || 'Mise à jour impossible.');
    }
    setBusy(false);
  };

  const createPayout = async () => {
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) return;
    setBusy(true); setError('');
    try {
      await affiliatesAPI.createPayout({ agent: paying.id, amount: amount.toFixed(2), note: payForm.note });
      load();
      setPaying(null);
    } catch (err) {
      const d = err?.response?.data;
      setError(typeof d === 'string' ? d : Object.values(d || {}).flat()[0] || 'Versement impossible.');
    }
    setBusy(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopied(`link-${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmt = (v) => Number(v || 0).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
  const ratePct = (a) => Math.round(Number(a.commission_rate || 0) * 10000) / 100;

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    (a.agent_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const actifs = agents.filter(a => a.is_active);
  const totalConversions = actifs.reduce((s, a) => s + (a.conversions || 0), 0);
  const totalRevenue     = actifs.reduce((s, a) => s + Number(a.generated_revenue || 0), 0);
  const totalDue         = actifs.reduce((s, a) => s + Number(a.commission_due || 0), 0);

  return (
    <AdminLayout title="Agents et Parrainage" subtitle="Parrainage & commissions">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} iconCls="bg-blue-50 text-blue-600" value={actifs.length} label="Agents actifs" />
          <StatCard icon={TrendingUp} iconCls="bg-emerald-50 text-emerald-600" value={totalConversions} label="Conversions" />
          <StatCard icon={DollarSign} iconCls="bg-violet-50 text-violet-600" value={`${(totalRevenue/1000).toFixed(0)} K`} unit="FCFA" label="CA filleuls" />
          <StatCard icon={Tag} iconCls="bg-amber-50 text-amber-600" value={fmt(totalDue)} unit="F" label="Commissions dues" />
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-52">
            <FilterField label="Recherche" icon={Search} value={search} onChange={setSearch} placeholder="Agent ou code…" />
          </div>
          <button onClick={() => { setShowCreate(true); setError(''); }}
            className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus size={18} /> Créer un code agent
          </button>
        </div>

        {/* Agents table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {loading && <div className="text-center py-10 text-xs text-slate-400"><Loader size={16} className="animate-spin mx-auto mb-2" />Chargement des agents…</div>}
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {['Code','Agent','Type','Conversions','CA filleuls','Commission due','Taux','Statut','Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 px-4 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">{a.code}</code>
                        <button onClick={() => copyCode(a.code)} title="Copier le code" className="text-slate-400 hover:text-primary-600 transition-colors">
                          {copied === a.code ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                        <button onClick={() => copyLink(a.code)} title="Copier le lien d'inscription" className="text-slate-400 hover:text-primary-600 transition-colors">
                          {copied === `link-${a.code}` ? <CheckCircle size={13} className="text-emerald-500" /> : <Link2 size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{a.phone}{a.city ? ` · ${a.city}` : ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[a.agent_type] || 'bg-slate-100 text-slate-600'}`}>{a.agent_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white">{a.conversions ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {fmt(a.generated_revenue)} F
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-orange-600">{fmt(a.commission_due)} F</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{ratePct(a)} %</td>
                    <td className="px-4 py-3">
                      {a.is_active
                        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle size={13} /> Actif</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> Inactif</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openDetail(a)} title="Voir le détail"
                          className="text-slate-400 hover:text-primary-600 transition-colors">
                          <Eye size={17} />
                        </button>
                        <button onClick={() => openEdit(a)} title="Modifier l'agent"
                          className="text-slate-400 hover:text-primary-600 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleAgent(a)} title={a.is_active ? 'Désactiver' : 'Activer'}
                          className="text-slate-400 hover:text-primary-600 transition-colors">
                          {a.is_active ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={() => openPayout(a)} disabled={Number(a.commission_due) <= 0}
                          title={Number(a.commission_due) > 0 ? 'Verser la commission' : 'Aucune commission due'}
                          className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                          <Wallet size={12} /> Verser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Aucun agent trouvé.</div>
          )}
        </div>

        {/* Create agent modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Tag size={18} /> Nouveau code agent</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="label">Nom complet</label>
                  <input type="text" className="input-field" placeholder="Ex: Jean Nkounga"
                    value={newAgent.name} onChange={e => setNewAgent(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Type d'agent</label>
                    <select className="input-field" value={newAgent.agent_type} onChange={e => setNewAgent(f => ({ ...f, agent_type: e.target.value }))}>
                      {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Ville</label>
                    <select className="input-field" value={newAgent.city} onChange={e => setNewAgent(f => ({ ...f, city: e.target.value }))}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Numéro de téléphone (+237)</label>
                  <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                    value={newAgent.phone} onChange={e => setNewAgent(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Taux de commission (%)</label>
                  <input type="number" className="input-field" min={1} max={100} value={newAgent.rate}
                    onChange={e => setNewAgent(f => ({ ...f, rate: Number(e.target.value) }))} />
                  <p className="text-xs text-slate-500 mt-1">Commission = taux × montant des locations terminées par les filleuls de l'agent</p>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={createAgent} disabled={busy || !newAgent.name || !newAgent.phone}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />} Créer le code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout modal */}
        {paying && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Wallet size={18} /> Verser la commission</h3>
                <button onClick={() => setPaying(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                  <p><span className="text-slate-500">Agent :</span> <strong>{paying.name}</strong> ({paying.code})</p>
                  <p><span className="text-slate-500">Commission due :</span> <strong className="text-orange-600">{fmt(paying.commission_due)} F</strong></p>
                  <p><span className="text-slate-500">Déjà versé :</span> {fmt(paying.payouts_total)} F · CA filleuls : {fmt(paying.generated_revenue)} F</p>
                </div>
                <div>
                  <label className="label">Montant à verser (FCFA)</label>
                  <input type="number" className="input-field" min={1} max={Number(paying.commission_due)}
                    value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder={fmt(paying.commission_due)} />
                  <button type="button" onClick={() => setPayForm(f => ({ ...f, amount: String(Math.floor(Number(paying.commission_due))) }))}
                    className="text-xs text-primary-600 font-semibold mt-1 hover:underline">Tout verser ({fmt(paying.commission_due)} F)</button>
                </div>
                <div>
                  <label className="label">Note / référence du virement</label>
                  <input type="text" className="input-field" placeholder="Ex: MTN MoMo +237 6XX…"
                    value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button onClick={() => setPaying(null)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={createPayout} disabled={busy || !Number(payForm.amount) || Number(payForm.amount) <= 0}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy ? <Loader size={16} className="animate-spin" /> : <Wallet size={16} />} Confirmer le versement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail modal */}
        {detail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Tag size={18} /> {detail.name}</h3>
                <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle size={18} /></button>
              </div>
              <div className="p-5 space-y-4 text-sm">
                {!detailData ? <p className="text-center text-slate-400 py-4"><Loader size={16} className="animate-spin mx-auto" /></p> : (<>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                    <p><span className="text-slate-500">Code :</span> <code className="font-bold text-primary-700">{detailData.code}</code></p>
                    <p><span className="text-slate-500">Type :</span> {detailData.agent_type || '—'} · <span className="text-slate-500">Ville :</span> {detailData.city}</p>
                    <p><span className="text-slate-500">Téléphone :</span> {detailData.phone || '—'} · <span className="text-slate-500">Taux :</span> {ratePct(detailData)}%</p>
                    <p><span className="text-slate-500">Statut :</span> {detailData.is_active ? 'Actif' : 'Inactif'} · <span className="text-slate-500">Créé le :</span> {detailData.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3"><span className="text-slate-500">Conversions</span><p className="font-black text-emerald-700 text-lg">{detailData.conversions ?? 0}</p></div>
                    <div className="bg-violet-50 rounded-xl p-3"><span className="text-slate-500">CA filleuls</span><p className="font-black text-violet-700 text-lg">{fmt(detailData.generated_revenue)} F</p></div>
                    <div className="bg-amber-50 rounded-xl p-3"><span className="text-slate-500">Commission due</span><p className="font-black text-amber-700 text-lg">{fmt(detailData.commission_due)} F</p></div>
                    <div className="bg-slate-50 rounded-xl p-3"><span className="text-slate-500">Déjà versé</span><p className="font-black text-slate-700 text-lg">{fmt(detailData.payouts_total)} F</p></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Filleuls ({detailData.referrals_count ?? 0})</h4>
                    {(detailData.referred_clients || []).length === 0
                      ? <p className="text-slate-400 text-xs">Aucun client inscrit avec ce code.</p>
                      : <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {detailData.referred_clients.map(c => (
                            <div key={c.id} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                              <span className="font-medium">{c.name}</span>
                              <span className="text-xs text-slate-400">{c.since?.slice(0, 10)}</span>
                            </div>
                          ))}
                        </div>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Versements ({payouts.length})</h4>
                    {payouts.length === 0
                      ? <p className="text-slate-400 text-xs">Aucun versement enregistré.</p>
                      : <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {payouts.map(p => (
                            <div key={p.id} className="flex justify-between bg-slate-50 rounded-lg px-3 py-2">
                              <span className="font-bold text-orange-600">{fmt(p.amount)} F</span>
                              <span className="text-xs text-slate-400">{p.paid_at?.slice(0, 10)} · {p.note || p.paid_by_name || ''}</span>
                            </div>
                          ))}
                        </div>}
                  </div>
                </>)}
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700"><button onClick={() => setDetail(null)} className="btn-outline w-full">Fermer</button></div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Pencil size={18} /> Modifier {editing.code}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="label">Nom complet</label>
                  <input type="text" className="input-field" value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Type d'agent</label>
                    <select className="input-field" value={editForm.agent_type} onChange={e => setEditForm(f => ({ ...f, agent_type: e.target.value }))}>
                      {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Ville</label>
                    <select className="input-field" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Numéro de téléphone (+237)</label>
                  <input type="tel" className="input-field" value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Taux de commission (%)</label>
                  <input type="number" className="input-field" min={1} max={100} value={editForm.rate}
                    onChange={e => setEditForm(f => ({ ...f, rate: Number(e.target.value) }))} />
                  <p className="text-xs text-slate-500 mt-1">Le code {editing.code} n'est pas modifiable — il est lié aux filleuls existants.</p>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button onClick={() => setEditing(null)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={saveEdit} disabled={busy || !editForm.name}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {busy ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />} Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
