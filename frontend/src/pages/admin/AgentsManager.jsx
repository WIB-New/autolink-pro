import React, { useState } from 'react';
import { Tag, Plus, CheckCircle, XCircle, TrendingUp, DollarSign, Users, Copy, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';

const MOCK_AGENTS = [
  { id: 1, code: 'AGT-DBL-001', name: 'Moise Kamga',    type: 'Influenceur',  phone: '+237 6 77 11 22 33', conversions: 28, totalAmount: 4340000, commission: 217000, rate: 5, active: true,  joined: '2025-01-15' },
  { id: 2, code: 'AGT-YDE-002', name: 'Rachel Biyong',  type: 'Commercial',   phone: '+237 6 88 44 55 66', conversions: 14, totalAmount: 1890000, commission: 94500,  rate: 5, active: true,  joined: '2025-02-03' },
  { id: 3, code: 'AGT-DBL-003', name: 'Serge Ndoumbe',  type: 'Hôtel partenaire', phone: '+237 2 33 10 20 30', conversions: 42, totalAmount: 7980000, commission: 399000, rate: 5, active: true,  joined: '2025-01-08' },
  { id: 4, code: 'AGT-YDE-004', name: 'Grace Ottou',    type: 'Influenceur',  phone: '+237 6 99 00 11 22', conversions: 6,  totalAmount: 540000,  commission: 27000,  rate: 5, active: false, joined: '2025-03-20' },
  { id: 5, code: 'AGT-DBL-005', name: 'Junior Manga',   type: 'Chauffeur partenaire', phone: '+237 6 55 66 77 88', conversions: 19, totalAmount: 2660000, commission: 133000, rate: 5, active: true,  joined: '2025-02-28' },
];

const TYPE_COLORS = {
  'Influenceur': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Commercial': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Hôtel partenaire': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Chauffeur partenaire': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function AgentsManager() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', type: 'Influenceur', phone: '', rate: 5 });
  const [copied, setCopied] = useState(null);

  const toggleAgent = (id) => setAgents(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalConversions = agents.filter(a => a.active).reduce((s, a) => s + a.conversions, 0);
  const totalCommissions = agents.filter(a => a.active).reduce((s, a) => s + a.commission, 0);
  const totalAmount      = agents.filter(a => a.active).reduce((s, a) => s + a.totalAmount, 0);

  return (
    <AdminLayout title="Agents et Parrainage" subtitle="Parrainage & commissions">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} iconCls="bg-blue-50 text-blue-600" value={agents.filter(a=>a.active).length} label="Agents actifs" />
          <StatCard icon={TrendingUp} iconCls="bg-emerald-50 text-emerald-600" value={totalConversions} label="Conversions" />
          <StatCard icon={DollarSign} iconCls="bg-violet-50 text-violet-600" value={`${(totalAmount/1000).toFixed(0)} K`} unit="FCFA" label="CA généré" />
          <StatCard icon={Tag} iconCls="bg-amber-50 text-amber-600" value={totalCommissions.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} unit="F" label="Commissions dues" />
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-52">
            <FilterField label="Recherche" icon={Search} value={search} onChange={setSearch} placeholder="Agent ou code…" />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus size={18} /> Créer un code agent
          </button>
        </div>

        {/* Agents table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {['Code','Agent','Type','Conversions','CA généré','Commission due','Taux','Statut','Actions'].map(h => (
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
                        <button onClick={() => copyCode(a.code)} className="text-slate-400 hover:text-primary-600 transition-colors">
                          {copied === a.code ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{a.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] || 'bg-slate-100 text-slate-600'}`}>{a.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white">{a.conversions}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {a.totalAmount.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-orange-600">{a.commission.toLocaleString()} F</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{a.rate} %</td>
                    <td className="px-4 py-3">
                      {a.active
                        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle size={13} /> Actif</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> Inactif</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAgent(a.id)} title={a.active ? 'Désactiver' : 'Activer'}
                          className="text-slate-400 hover:text-primary-600 transition-colors">
                          {a.active ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                        </button>
                        <button className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                          Verser
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
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
                <div>
                  <label className="label">Type d'agent</label>
                  <select className="input-field" value={newAgent.type} onChange={e => setNewAgent(f => ({ ...f, type: e.target.value }))}>
                    {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Numéro de téléphone (+237)</label>
                  <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                    value={newAgent.phone} onChange={e => setNewAgent(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Taux de commission (%)</label>
                  <input type="number" className="input-field" min={1} max={15} value={newAgent.rate}
                    onChange={e => setNewAgent(f => ({ ...f, rate: Number(e.target.value) }))} />
                  <p className="text-xs text-slate-500 mt-1">Prélevé sur la part AutoLink — transparent pour le gestionnaire</p>
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={() => {
                  if (newAgent.name && newAgent.phone) {
                    const prefix = newAgent.type === 'Influenceur' ? 'INF' : 'AGT';
                    setAgents(prev => [...prev, {
                      id: Date.now(), code: `AGT-DBL-00${prev.length+1}`,
                      ...newAgent, conversions: 0, totalAmount: 0, commission: 0, active: true,
                      joined: new Date().toISOString().split('T')[0]
                    }]);
                    setShowCreate(false); setNewAgent({ name: '', type: 'Influenceur', phone: '', rate: 5 });
                  }
                }} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Plus size={16} /> Créer le code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
