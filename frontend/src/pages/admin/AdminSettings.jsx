import React, { useState } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import {
  Percent, Smartphone, Tag, MapPin, UserCog,
  CheckCircle2, Save, Plus, ShieldCheck, User,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const GAMMES = [
  { tier: 'Économique', name: 'Citadine Agile', ex: 'Toyota Yaris, Kia Picanto, Hyundai i10', min: 20000, max: 35000, caution: 80000 },
  { tier: 'Standard', name: 'SUV Urbain & Berline', ex: 'Toyota RAV4, Hyundai Tucson, Kia Sportage', min: 35000, max: 65000, caution: 150000 },
  { tier: 'Premium', name: 'SUV Prestige & 4×4 Baroudeur', ex: 'Toyota Land Cruiser, Ford Everest, Mercedes GLC', min: 70000, max: 140000, caution: 300000 },
  { tier: 'Gold / Util', name: 'Pick-up Pro Chantier / Mission', ex: 'Toyota Hilux, Mitsubishi L200, Ford Ranger 4×4', min: 90000, max: 110000, caution: 250000 },
  { tier: 'Van / Mini', name: 'Minibus & Convoi Exécutif', ex: 'Toyota HiAce 14 pl, Hyundai H-1 VIP Executive', min: 85000, max: 160000, caution: 350000 },
];

const GATEWAYS = [
  { name: 'MTN Mobile Money', d: 'Agrégateur certifié — Escrow 100 %', on: true, dot: 'bg-yellow-400' },
  { name: 'Orange Money', d: 'Passerelle WebPay / 3D-Secure', on: true, dot: 'bg-orange-500' },
  { name: 'Carte Visa / Mastercard', d: '3D-Secure V2 — en validation', on: false, dot: 'bg-slate-700' },
  { name: 'Virement UBA', d: 'Frais de transfert : 0,5 %', on: true, dot: 'bg-red-500' },
];

const HUBS = [
  { code: 'DLA', name: 'Douala Métropole', zone: 'Akwa · Bonanjo · Aéroport', status: 'Actif', nb: 840, ok: true },
  { code: 'YAO', name: 'Yaoundé Capitale', zone: 'Bastos · Nlongkak · Nsimalen', status: 'Actif', nb: 512, ok: true },
  { code: 'KBI', name: 'Kribi Port & Littoral', zone: 'Déploiement pilote', status: 'Bientôt', nb: 0, ok: false },
];

const TEAM = [
  { name: 'Alexandre N.', email: 'alexandre.n@autolink.pro', role: 'Super Admin', badge: 'bg-teal-100 text-teal-700' },
  { name: 'Guy M.', email: 'guy.m@autolink.pro', role: 'Inspecteur Hub', badge: 'bg-blue-100 text-blue-700' },
  { name: 'Sandrine E.', email: 'sandrine.e@autolink.pro', role: 'Comptable', badge: 'bg-amber-100 text-amber-700' },
];

export default function AdminSettings() {
  const [commission, setCommission] = useState(15);
  const [fixedFee, setFixedFee] = useState(250);
  const [litigation, setLitigation] = useState(true);
  const [gates, setGates] = useState(() => GATEWAYS.map(g => g.on));
  const [minWithdraw, setMinWithdraw] = useState(5000);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const inputCls = 'bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 w-24 text-center focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <AdminLayout
      title="Paramètres de la plateforme"
      subtitle="Commissions, passerelles, tarifs & équipe"
    >
      {/* Action sauvegarde */}
      <div className="flex items-center justify-end mb-5">
        <button onClick={save}
          className={`flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-xl transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
          {saved ? <><CheckCircle2 size={13} /> Sauvegardé</> : <><Save size={13} /> Sauvegarder</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Commissions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Percent size={15} className="text-teal-600" /> Commissions &amp; Frais
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Commission (%)</label>
              <input type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Frais fixes (FCFA)</label>
              <input type="number" value={fixedFee} onChange={e => setFixedFee(Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 cursor-pointer">
            <span className="text-[11px] font-bold text-teal-800 flex items-center gap-2"><ShieldCheck size={13} /> Garantie litige active</span>
            <span onClick={() => setLitigation(!litigation)} className={`w-10 h-5 rounded-full relative transition-colors ${litigation ? 'bg-teal-600' : 'bg-slate-300'}`}>
              <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${litigation ? 'left-6' : 'left-1'}`} />
            </span>
          </label>
        </div>

        {/* Passerelles */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Smartphone size={15} className="text-teal-600" /> Passerelles de paiement
          </h3>
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Montant min. retrait</div>
            <div className="flex items-center gap-1.5 mt-1">
              <input type="number" value={minWithdraw} onChange={e => setMinWithdraw(Number(e.target.value))} className="bg-transparent text-sm font-black text-slate-900 w-24 focus:outline-none" />
              <span className="text-[9px] text-slate-400 font-bold">FCFA</span>
            </div>
          </div>
          <div className="space-y-2">
            {GATEWAYS.map((g, i) => (
              <label key={g.name} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-teal-200 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{g.name}</div>
                  <div className="text-[9px] text-slate-400">{g.d}</div>
                </div>
                <span onClick={e => { e.preventDefault(); setGates(s => s.map((x, j) => j === i ? !x : x)); }}
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${gates[i] ? 'bg-teal-600' : 'bg-slate-300'}`}>
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${gates[i] ? 'left-5' : 'left-1'}`} />
                </span>
              </label>
            ))}
          </div>
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
                <th className="py-2.5 pr-4">Exemples</th>
                <th className="py-2.5 pr-4">Min / jour</th>
                <th className="py-2.5 pr-4">Max / jour</th>
                <th className="py-2.5 text-right">Caution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {GAMMES.map(g => (
                <tr key={g.tier} className="hover:bg-slate-50/60">
                  <td className="py-3 pr-4"><span className="text-[11px] font-black text-teal-700">{g.tier}</span><br /><span className="text-[10px] text-slate-500">{g.name}</span></td>
                  <td className="py-3 pr-4 text-[10px] text-slate-500">{g.ex}</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.min)} F</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.max)} F</td>
                  <td className="py-3 text-right text-[11px] font-black text-slate-900">{fmt(g.caution)} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Hubs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><MapPin size={15} className="text-teal-600" /> Hubs opérationnels</h3>
            <button className="flex items-center gap-1 text-[10px] font-black text-teal-600"><Plus size={11} /> Nouveau</button>
          </div>
          <div className="space-y-2.5">
            {HUBS.map(h => (
              <div key={h.code} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0">{h.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{h.name} <span className={`ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-md ${h.ok ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>{h.status}</span></div>
                  <div className="text-[9px] text-slate-400">{h.zone}</div>
                </div>
                <span className="text-[10px] font-black text-slate-700 whitespace-nowrap">{h.nb ? `${h.nb} véhicules` : '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><UserCog size={15} className="text-teal-600" /> Équipe administrative</h3>
            <button className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors"><Plus size={11} /> Ajouter</button>
          </div>
          <div className="space-y-2.5">
            {TEAM.map(m => (
              <div key={m.name} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0"><User size={13} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{m.name} <span className={`ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-md ${m.badge}`}>{m.role}</span></div>
                  <div className="text-[9px] text-slate-400">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
