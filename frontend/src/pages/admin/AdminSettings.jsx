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
  const patchPricing = (key, sub, value) => { setForm((f) => ({ ...f, pricing: { ...f.pricing, [key]: { ...(f.pricing?.[key] || {}), [sub]: Number(value) } } })); setSaved(false); };
  const patchKm = (tier, idx, value) => { setForm((f) => {
    const km = [...(f.pricing?.tier_km?.[tier] || [0, 0])];
    km[idx] = Number(value);
    return { ...f, pricing: { ...f.pricing, tier_km: { ...(f.pricing?.tier_km || {}), [tier]: km } } };
  }); setSaved(false); };
  const patchScalar = (key, value) => { setForm((f) => ({ ...f, pricing: { ...f.pricing, [key]: Number(value) } })); setSaved(false); };
  const dirty = form && initial && JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true); setError('');
    const { tiers, pricing_overrides, updated_at: _u, ...payload } = form;
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
          <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-3">
            {[
              ['min_withdrawal_amount', 'Montant min. retrait'],
              ['max_withdrawal_amount', 'Montant max. par retrait'],
              ['withdrawal_daily_cap', 'Plafond cumulé par jour (0 = illimité)'],
            ].map(([key, label]) => (
              <div key={key}>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <input type="number" min={0} step={500} value={Math.round(Number(form[key] || 0))}
                    onChange={(e) => set(key)(e.target.value)} className="bg-transparent text-sm font-black text-slate-900 w-24 focus:outline-none" />
                  <span className="text-[9px] text-slate-400 font-bold">FCFA</span>
                </div>
              </div>
            ))}
            <label className="flex items-center justify-between gap-3 pt-1 border-t border-slate-200 cursor-pointer">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Retraits instantanés</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Sans validation admin dans les limites ci-dessus</div>
              </div>
              <input type="checkbox" checked={!!form.withdrawal_auto_approve} onChange={(e) => set('withdrawal_auto_approve')(e.target.checked)}
                className="w-4 h-4 accent-teal-600" />
            </label>
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
          <span className="text-[9px] text-slate-400 font-bold">Prix indicatif, caution et forfait km modifiables</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="py-2.5 pr-4">Gamme</th>
                <th className="py-2.5 pr-4">Indicatif / jour</th>
                <th className="py-2.5 pr-4">Plage propriétaire</th>
                <th className="py-2.5 pr-4">Km inclus</th>
                <th className="py-2.5 pr-4">Km supplémentaire</th>
                <th className="py-2.5 pr-4">Véhicules</th>
                <th className="py-2.5 text-right">Caution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tiers.map((g) => {
                const base = Number(form.pricing?.tier_base?.[g.tier] ?? g.base_rate ?? 0);
                const km = form.pricing?.tier_km?.[g.tier] || [g.km_included, g.extra_km_rate];
                const dep = Number(form.pricing?.tier_deposit?.[g.tier] ?? g.deposit ?? 0);
                const margin = Number(form.pricing?.price_margin ?? 0.2);
                return (
                <tr key={g.tier} className="hover:bg-slate-50/60">
                  <td className="py-3 pr-4"><span className="text-[11px] font-black text-teal-700">{g.label || g.tier}</span><br /><span className="text-[10px] text-slate-500">{g.tier}</span></td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1">
                      <input type="number" min={1000} step={500} value={base}
                        onChange={(e) => patchPricing('tier_base', g.tier, e.target.value)} className={`${inputCls} !w-24`} />
                      <span className="text-[9px] text-slate-400 font-bold">F</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[10px] text-slate-500 font-bold whitespace-nowrap">{fmt(Math.round(base * (1 - margin)))} – {fmt(Math.round(base * (1 + margin)))} F</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1">
                      <input type="number" min={0} step={10} value={km[0]}
                        onChange={(e) => patchKm(g.tier, 0, e.target.value)} className={`${inputCls} !w-16`} />
                      <span className="text-[9px] text-slate-400 font-bold">km</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1">
                      <input type="number" min={0} step={10} value={km[1]}
                        onChange={(e) => patchKm(g.tier, 1, e.target.value)} className={`${inputCls} !w-16`} />
                      <span className="text-[9px] text-slate-400 font-bold">F</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{g.vehicles}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      <input type="number" min={0} step={5000} value={dep}
                        onChange={(e) => patchPricing('tier_deposit', g.tier, e.target.value)} className={`${inputCls} !w-24`} />
                      <span className="text-[9px] text-slate-400 font-bold">F</span>
                    </span>
                  </td>
                </tr>
                );
              })}
              {!tiers.length && <tr><td colSpan="7" className="py-8 text-center text-[11px] text-slate-400">Aucune gamme configurée.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Marge de réglage propriétaire</div>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" min={0} max={50} step={1} value={Math.round(Number(form.pricing?.price_margin ?? 0.2) * 100)}
                onChange={(e) => patchScalar('price_margin', Math.min(50, Math.max(0, Number(e.target.value))) / 100)}
                className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none" />
              <span className="text-[9px] text-slate-400 font-bold">% autour du prix indicatif</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Taux valeur marchande</div>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" min={0} max={2} step={0.01} value={Number((form.pricing?.market_value_rate ?? 0.0015) * 100).toFixed(2)}
                onChange={(e) => patchScalar('market_value_rate', Math.min(2, Math.max(0, Number(e.target.value))) / 100)}
                className="bg-transparent text-sm font-black text-slate-900 w-16 focus:outline-none" />
              <span className="text-[9px] text-slate-400 font-bold">% de la valeur du véhicule / jour</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Coefficients ville</div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {Object.entries(form.pricing?.city_coef || {}).map(([city, coef]) => (
              <label key={city} className="inline-flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-bold capitalize w-20 truncate">{city}</span>
                <input type="number" min={0.5} max={1.5} step={0.05} value={coef}
                  onChange={(e) => patchPricing('city_coef', city, e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-black text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </label>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2">Multiplicateur du prix indicatif selon la ville (défaut 0,90 pour les villes non listées).</p>
        </div>

        <p className="text-[9px] text-slate-400 mt-4 flex items-start gap-1.5">
          <CheckCircle2 size={11} className="shrink-0 mt-0.5 text-teal-600" />
          La nouvelle grille s'applique au recalcul des tarifs conseillés : nouveaux véhicules et prochaines sauvegardes. Les tarifs affichés existants sont bornés, jamais écrasés.
        </p>
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
