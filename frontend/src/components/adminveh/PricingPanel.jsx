import React, { useState } from 'react';
import { Tag, ShieldCheck } from 'lucide-react';
import { TIERS } from '../../utils/carImages';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* Gamme & tarification — arbitrage tarifaire et répartition commission. */
export default function PricingPanel({ vehicle: v, onSave }) {
  const [tier, setTier] = useState(v.tier || 'standard');
  const [rate, setRate] = useState(Number(v.daily_rate) || 60000);
  const [deposit, setDeposit] = useState(Number(v.deposit_amount) || 150000);
  const [saved, setSaved] = useState(false);
  const commission = Math.round(rate * 0.15);
  const net = rate - commission;

  const save = async () => {
    if (onSave) await onSave({ tier, daily_rate: rate, deposit_amount: deposit });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
        <Tag size={15} className="text-teal-600" /> Gamme &amp; Tarification
      </h3>
      <p className="text-[10px] text-slate-400 mb-4">Arbitrage tarifaire et vérification de commission.</p>

      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Gamme de classification</label>
      <select value={tier} onChange={e => setTier(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[12px] font-bold text-slate-800 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500">
        {TIERS.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Souhait du bailleur</div>
          <div className="text-sm font-black text-slate-800 mt-1">{fmt(v.daily_rate || 60000)} FCFA / j</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fourchette IA {v.city || 'Douala'} Hub</div>
          <div className="text-sm font-black text-teal-700 mt-1">55 000 - 85 000 FCFA</div>
        </div>
      </div>

      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Prix de location validé (par jour)</label>
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4">
        <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))}
          className="flex-1 bg-transparent text-lg font-black text-slate-900 focus:outline-none" />
        <span className="text-[10px] font-bold text-slate-400">FCFA / jour</span>
      </div>

      <div className="space-y-1.5 text-[11px] mb-4">
        <div className="flex justify-between"><span className="text-slate-500">Net Propriétaire (85 %)</span><span className="font-black text-teal-700">{fmt(net)} FCFA</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Commission AutoLink (15 %)</span><span className="font-black text-slate-900">{fmt(commission)} FCFA</span></div>
      </div>

      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        <ShieldCheck size={10} className="inline text-teal-600 mr-1" />Caution Sécurisée Fixe
      </label>
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
        <input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value))}
          className="flex-1 bg-transparent text-sm font-black text-slate-900 focus:outline-none" />
        <span className="text-[10px] font-bold text-slate-400">FCFA</span>
      </div>

      <button onClick={save}
        className={`w-full text-[11px] font-black py-3 rounded-xl transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
        {saved ? 'Tarification enregistrée' : 'Valider la tarification'}
      </button>
    </div>
  );
}
