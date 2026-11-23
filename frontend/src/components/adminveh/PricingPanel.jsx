import React, { useState } from 'react';
import { Tag, ShieldCheck } from 'lucide-react';
import useCommissionRate from '../../utils/useCommissionRate';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* Gamme & tarification — arbitrage tarifaire réel.
   `tier` et `deposit_amount` sont recalculés côté serveur (lecture seule). */
export default function PricingPanel({ vehicle: v, onSave }) {
  const [rate, setRate] = useState(Number(v.daily_rate) || 0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const commissionRate = useCommissionRate();
  const pct = Math.round(commissionRate * 100);
  const commission = Math.round(rate * commissionRate);
  const net = rate - commission;
  const min = Number(v.price_min), max = Number(v.price_max);
  const outOfRange = min && max && (rate < min || rate > max);

  const save = async () => {
    setError('');
    try {
      if (onSave) await onSave({ daily_rate: rate });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      const d = e?.response?.data;
      setError(d?.daily_rate?.[0] || 'Enregistrement refusé.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
        <Tag size={15} className="text-teal-600" /> Gamme &amp; Tarification
      </h3>
      <p className="text-[10px] text-slate-400 mb-4">Arbitrage tarifaire et vérification de commission.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gamme (calculée)</div>
          <div className="text-sm font-black text-slate-800 mt-1">{v.tier_label || v.tier || '—'}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tarif indicatif grille</div>
          <div className="text-sm font-black text-teal-700 mt-1">{v.computed_rate ? `${fmt(v.computed_rate)} F` : '—'}</div>
        </div>
      </div>

      {min && max ? (
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-3.5 py-2.5 mb-4 text-[10px] font-bold text-teal-700">
          Plage autorisée : {fmt(min)} – {fmt(max)} FCFA/jour
        </div>
      ) : null}

      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Prix de location validé (par jour)</label>
      <div className={`flex items-center gap-2 bg-teal-50 border rounded-xl px-4 py-3 mb-4 ${outOfRange ? 'border-red-300' : 'border-teal-200'}`}>
        <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))}
          className="flex-1 bg-transparent text-lg font-black text-slate-900 focus:outline-none" />
        <span className="text-[10px] font-bold text-slate-400">FCFA / jour</span>
      </div>

      <div className="space-y-1.5 text-[11px] mb-4">
        <div className="flex justify-between"><span className="text-slate-500">Net Propriétaire ({100 - pct} %)</span><span className="font-black text-teal-700">{fmt(net)} FCFA</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Commission AutoLink ({pct} %)</span><span className="font-black text-slate-900">{fmt(commission)} FCFA</span></div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
          <ShieldCheck size={10} className="text-teal-600" /> Caution séquestre (grille)
        </span>
        <span className="text-sm font-black text-slate-800">{v.deposit_amount ? `${fmt(v.deposit_amount)} F` : '—'}</span>
      </div>

      {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold px-3 py-2 rounded-xl">{error}</div>}

      <button onClick={save} disabled={outOfRange}
        className={`w-full text-[11px] font-black py-3 rounded-xl transition-colors disabled:opacity-50 ${saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
        {saved ? 'Tarification enregistrée' : 'Valider la tarification'}
      </button>
    </div>
  );
}
