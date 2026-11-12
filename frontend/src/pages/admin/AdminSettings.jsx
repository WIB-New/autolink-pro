import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { platformAPI, usersAPI, walletAPI } from '../../services/api';
import {
  Percent, Smartphone, Tag, MapPin, UserCog,
  CheckCircle2, Save, User,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const GATEWAYS = [
  { id: 'mtn', name: 'MTN Mobile Money', d: 'Agrégateur certifié — Escrow 100 %', dot: 'bg-yellow-400' },
  { id: 'orange', name: 'Orange Money', d: 'Passerelle WebPay / 3D-Secure', dot: 'bg-orange-500' },
  { id: 'stripe', name: 'Carte Visa / Mastercard', d: '3D-Secure V2 — en validation', dot: 'bg-slate-700' },
  { id: 'paypal', name: 'PayPal', d: 'Commandes PayPal', dot: 'bg-blue-700' },
];

const inputCls = 'bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 w-full text-center focus:outline-none focus:ring-2 focus:ring-teal-500';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState(null);
  const [configured, setConfigured] = useState([]);
  const [team, setTeam] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    platformAPI.get().then(({ data }) => { setForm(data); setInitial(data); })
      .catch(() => setError('API injoignable — paramètres indisponibles.'));
    walletAPI.methods().then(({ data }) => setConfigured(data.configured_methods || [])).catch(() => {});
    Promise.all([usersAPI.list({ role: 'ADMIN', page_size: 50 }), usersAPI.list({ role: 'CONTROLLER', page_size: 50 })])
      .then(([a, c]) => setTeam([...(a.data.results || a.data || []), ...(c.data.results || c.data || [])])).catch(() => {});
  }, []);

  const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setSaved(false); };
  const dirty = form && initial && JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true); setError('');
    const { tiers, updated_at: _u, ...payload } = form;
    try {
      const { data } = await platformAPI.update(payload);
      setForm(data); setInitial(data); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(Object.values(e.response?.data || {}).flat()[0] || 'Enregistrement impossible.');
    }
    setSaving(false);
  };

  if (!form) {
    return (
      <AdminLayout title="Paramètres de la plateforme" subtitle="Commissions, passerelles, tarifs & équipe">
        <p className="text-slate-400 text-sm">{error || 'Chargement…'}</p>
      </AdminLayout>
    );
  }

  const commissionPct = Math.round(Number(form.commission_rate) * 100);
  const hubs = String(form.addresses || '').split('|').map((s) => s.trim()).filter(Boolean);
  const tiers = Array.isArray(form.tiers) ? form.tiers : [];

  return (
    <AdminLayout title="Paramètres de la plateforme" subtitle="Commissions, passerelles, tarifs & équipe">
      {/* Action sauvegarde */}
      <div className="flex items-center justify-end gap-3 mb-5">
        {error && <span className="text-[11px] font-bold text-red-500">{error}</span>}
        <button onClick={save} disabled={!dirty || saving}
          className={`flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-40 ${saved ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
          {saved ? <><CheckCircle2 size={13} /> Sauvegardé</> : <><Save size={13} /> {saving ? 'Enregistrement…' : 'Sauvegarder'}</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Commissions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Percent size={15} className="text-teal-600" /> Commissions &amp; Frais
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Commission AutoLink (%)</label>
              <input type="number" min={0} max={100} value={commissionPct}
                onChange={(e) => set('commission_rate')((Math.min(100, Math.max(0, Number(e.target.value))) / 100).toFixed(2))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Rémunération chauffeur (FCFA / jour)</label>
              <input type="number" min={0} step={500} value={Math.round(Number(form.driver_daily_fee || 0))}
                onChange={(e) => set('driver_daily_fee')(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Frais livraison (FCFA)</label>
              <input type="number" min={0} step={500} value={Math.round(Number(form.delivery_fee || 0))}
                onChange={(e) => set('delivery_fee')(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Caution remboursée — annulation client (%)</label>
              <input type="number" min={0} max={100} value={100 - Math.round(Number(form.cancel_deposit_keep_percent || 0))}
                onChange={(e) => set('cancel_deposit_keep_percent')(100 - Math.min(100, Math.max(0, Number(e.target.value))))} className={inputCls} />
            </div>
            <div className="flex items-end pb-2">
              <p className="text-[10px] text-slate-400 font-semibold leading-snug">
                Le client récupère ce % de sa caution s'il annule avant le début ; AutoLink conserve le reste ({Math.round(Number(form.cancel_deposit_keep_percent || 0))} %).
              </p>
            </div>
          </div>
          <div className="mt-4 bg-slate-50 rounded-xl p-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Répartition — location de 100 000 F (hors frais)</div>
            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Commission AutoLink ({commissionPct} %)</span><strong className="text-slate-900">{fmt(1000 * commissionPct)} F</strong></div>
            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Part propriétaire (auto : {100 - commissionPct} %)</span><strong className="text-teal-700">{fmt(100000 - 1000 * commissionPct)} F</strong></div>
            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Chauffeur (par jour de location)</span><strong className="text-slate-900">{fmt(form.driver_daily_fee)} F/j</strong></div>
            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Livraison (→ plateforme)</span><strong className="text-slate-900">{fmt(form.delivery_fee)} F</strong></div>
          </div>
        </div>

        {/* Passerelles */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Smartphone size={15} className="text-teal-600" /> Passerelles de paiement
          </h3>
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Montant min. retrait</div>
            <div className="flex items-center gap-1.5 mt-1">
              <input type="number" min={0} step={500} value={Math.round(Number(form.min_withdrawal_amount || 0))}
                onChange={(e) => set('min_withdrawal_amount')(e.target.value)} className="bg-transparent text-sm font-black text-slate-900 w-24 focus:outline-none" />
              <span className="text-[9px] text-slate-400 font-bold">FCFA</span>
            </div>
          </div>
          <div className="space-y-2">
            {GATEWAYS.map((g) => {
              const on = configured.includes(g.id);
              return (
                <div key={g.id} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-slate-800">{g.name}</div>
                    <div className="text-[9px] text-slate-400">{g.d}</div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${on ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                    {on ? 'Actif' : 'Non configuré'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-slate-400 mt-3">État lu depuis la configuration serveur (variables d'environnement).</p>
        </div>
      </div>

      {/* Grille tarifaire */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Tag size={15} className="text-teal-600" /> Grille tarifaire &amp; cautions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="py-2.5 pr-4">Gamme</th>
                <th className="py-2.5 pr-4">Min / jour</th>
                <th className="py-2.5 pr-4">Indicatif</th>
                <th className="py-2.5 pr-4">Max / jour</th>
                <th className="py-2.5 pr-4">Km inclus</th>
                <th className="py-2.5 pr-4">Véhicules</th>
                <th className="py-2.5 text-right">Caution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tiers.map((g) => (
                <tr key={g.tier} className="hover:bg-slate-50/60">
                  <td className="py-3 pr-4"><span className="text-[11px] font-black text-teal-700">{g.label || g.tier}</span><br /><span className="text-[10px] text-slate-500">{g.tier}</span></td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.min_rate)} F</td>
                  <td className="py-3 pr-4 text-[11px] text-slate-500">{fmt(g.base_rate)} F</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.max_rate)} F</td>
                  <td className="py-3 pr-4 text-[10px] text-slate-500">{fmt(g.km_included)} km/j · {fmt(g.extra_km_rate)} F/km sup.</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{g.vehicles}</td>
                  <td className="py-3 text-right text-[11px] font-black text-slate-900">{fmt(g.deposit)} F</td>
                </tr>
              ))}
              {!tiers.length && <tr><td colSpan="7" className="py-8 text-center text-[11px] text-slate-400">Aucune gamme configurée.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Agences */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><MapPin size={15} className="text-teal-600" /> Agences &amp; points de retrait</h3>
          </div>
          <div className="space-y-2.5 mb-4">
            {hubs.map((h, i) => (
              <div key={i} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0"><MapPin size={14} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{h.split(',')[0]}</div>
                  <div className="text-[9px] text-slate-400 truncate">{h}</div>
                </div>
              </div>
            ))}
            {!hubs.length && <p className="text-[11px] text-slate-400">Aucune adresse configurée.</p>}
          </div>
          <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Adresses (séparées par |)</label>
          <textarea rows={2} value={form.addresses || ''} onChange={(e) => set('addresses')(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {/* Équipe */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><UserCog size={15} className="text-teal-600" /> Équipe administrative</h3>
          </div>
          <div className="space-y-2.5">
            {team.map((m) => (
              <div key={m.id} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0"><User size={13} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{m.first_name} {m.last_name} <span className="ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-700">{m.role === 'CONTROLLER' ? 'Contrôleur' : 'Admin'}</span></div>
                  <div className="text-[9px] text-slate-400">{m.email}</div>
                </div>
              </div>
            ))}
            {!team.length && <p className="text-[11px] text-slate-400">Aucun autre administrateur enregistré.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
