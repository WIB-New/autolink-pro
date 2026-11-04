import React, { useState, useMemo } from 'react';
import {
  Calendar, UserCheck, UserPlus, ArrowRight, ShieldCheck,
  MessageCircle, Phone,
} from 'lucide-react';
import useReserve from '../../hooks/useReserve';
import { RENTAL_TYPES } from '../../utils/carImages';

const DRIVER_FEE = 5000;      // chauffeur AutoLink / jour
const EXTRA_DRIVER_FEE = 2000; // conducteur additionnel (autoconduite)

/* Sidebar « Réserver ce véhicule » — calcul du total + entrée dans
   le flux de réservation (compte requis si non connecté). */
export default function BookingSidebar({ vehicle: v }) {
  const reserve = useReserve();
  const [formule, setFormule] = useState('urban_day');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [driver, setDriver] = useState('internal');
  const [extraDriver, setExtraDriver] = useState(false);

  const rt = RENTAL_TYPES.find(r => r.id === formule) || RENTAL_TYPES[2];

  const days = useMemo(() => {
    if (!debut || !fin) return 1;
    const d = Math.round((new Date(fin) - new Date(debut)) / 86400000);
    return Math.max(1, d);
  }, [debut, fin]);

  const base = useMemo(() => {
    if (formule === 'long_haul') return v.price * days;
    if (rt.baseMultiplier == null) return v.price * days;
    return Math.max(v.price * rt.baseMultiplier * (formule === 'urban_day' ? days : 1), rt.minPrice);
  }, [v, rt, formule, days]);

  const driverFee = driver === 'internal' ? DRIVER_FEE * days : 0;
  const extraFee  = driver === 'none' && extraDriver ? EXTRA_DRIVER_FEE : 0;
  const total     = Math.round(base + driverFee + extraFee);
  const deposit   = v.deposit || Math.round(v.price * 2);

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 lg:sticky lg:top-24">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-black text-slate-900">Réserver ce véhicule</h2>
          <div className="text-[11px] text-slate-400 mt-0.5">{v.plate} · {v.city}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-teal-600">{v.price.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">FCFA / jour</div>
        </div>
      </div>

      {/* Formule */}
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Formule</label>
      <select value={formule} onChange={e => setFormule(e.target.value)}
        className="w-full mb-4 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
        {RENTAL_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Début</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={debut} min={new Date().toISOString().split('T')[0]}
              onChange={e => setDebut(e.target.value)}
              className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fin</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="date" value={fin} min={debut || new Date().toISOString().split('T')[0]}
              onChange={e => setFin(e.target.value)}
              className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      </div>

      {/* Chauffeur */}
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Conduite</label>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { id: 'internal', label: 'Avec chauffeur', icon: UserCheck },
          { id: 'owner',    label: 'Chauffeur prop.', icon: UserCheck },
          { id: 'none',     label: 'Sans chauffeur',  icon: UserPlus },
        ].map(o => (
          <button key={o.id} onClick={() => setDriver(o.id)}
            className={`py-2.5 px-1 rounded-xl border-2 text-[11px] font-bold transition-all ${
              driver === o.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
            <o.icon size={15} className="mx-auto mb-1" />
            {o.label}
          </button>
        ))}
      </div>

      {driver === 'none' && (
        <label className="flex items-center gap-2.5 mb-3 cursor-pointer">
          <input type="checkbox" checked={extraDriver} onChange={e => setExtraDriver(e.target.checked)}
            className="w-4 h-4 accent-teal-600 rounded" />
          <span className="text-xs text-slate-600">
            Conducteur additionnel <span className="font-bold text-slate-800">+{EXTRA_DRIVER_FEE.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F</span>
          </span>
        </label>
      )}

      {/* Décomposition du prix */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>{rt.label} — {v.price.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F × {days} j</span>
          <span className="font-semibold text-slate-800">{Math.round(base).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F</span>
        </div>
        {driverFee > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Chauffeur AutoLink</span>
            <span className="font-semibold text-slate-800">+{driverFee.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F</span>
          </div>
        )}
        {extraFee > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Conducteur additionnel</span>
            <span className="font-semibold text-slate-800">+{extraFee.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F</span>
          </div>
        )}
        <div className="flex justify-between text-slate-500">
          <span>Assurance & assistance 24/7</span>
          <span className="font-semibold text-emerald-600">Inclus</span>
        </div>
        <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-2 text-sm">
          <span>Total TTC</span>
          <span className="text-teal-600">{total.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} FCFA</span>
        </div>
        <div className="flex justify-between text-[11px] text-amber-700">
          <span>Caution (pré-autorisation, non débitée)</span>
          <span className="font-bold">{deposit.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F</span>
        </div>
      </div>

      <button onClick={() => reserve(v)} disabled={!v.available}
        className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-colors text-sm shadow-md ${
          v.available
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}>
        {v.available ? <>Réserver maintenant <ArrowRight size={16} /></> : 'Indisponible à ces dates'}
      </button>

      <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
        Annulation gratuite jusqu'à 24h avant le départ.
        Paiement MTN MoMo, Orange Money ou carte.
      </p>

      {/* Aide */}
      <div className="mt-5 pt-5 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
          <ShieldCheck size={14} className="text-teal-600" /> Besoin d'aide pour ce véhicule ?
        </div>
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+237656789000"
            className="flex items-center justify-center gap-1.5 border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition-colors">
            <Phone size={13} /> Appeler
          </a>
          <a href="https://wa.me/237656789000" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold py-2.5 rounded-xl transition-colors">
            <MessageCircle size={13} /> WhatsApp
          </a>
        </div>
      </div>
    </aside>
  );
}
