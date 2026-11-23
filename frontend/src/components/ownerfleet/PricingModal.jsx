import React, { useMemo, useState } from 'react';
import { X, SlidersHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { vehiclesAPI } from '../../services/api';

const fmt = (n) => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* Tarification dynamique : réaligne les tarifs journaliers de la flotte sur le
   tarif conseillé AutoLink (computed_rate), avec un ajustement ±20 %. */
export default function PricingModal({ vehicles, onClose, onApplied }) {
  const [delta, setDelta] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const rows = useMemo(() => vehicles.map(v => {
    const base = Number(v.computed_rate || v.daily_rate || 0);
    const current = Number(v.daily_rate || 0);
    const target = Math.round(base * (1 + delta / 100));
    return { id: v.id, label: `${v.brand} ${v.model} ${v.year}`, plate: v.plate, current, base, target };
  }), [vehicles, delta]);

  const apply = async () => {
    setBusy(true);
    setError('');
    try {
      await vehiclesAPI.bulkPricing({ delta_pct: delta });
      onApplied();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.delta_pct?.[0] || e?.response?.data?.detail || 'La mise à jour a échoué.');
    } finally {
      setBusy(false);
    }
  };

  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-teal-600" />
            <h3 className="font-black text-slate-900">Tarification dynamique</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            AutoLink calcule un <strong>tarif conseillé</strong> pour chaque véhicule (gamme, valeur,
            année, état, ville). Choisissez un ajustement par rapport à ce tarif — limité à ±20 % —
            il sera appliqué à toute votre flotte.
          </p>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600">Ajustement global</span>
              <span className={`inline-flex items-center gap-1 text-sm font-black ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                <DeltaIcon size={14} /> {delta > 0 ? '+' : ''}{delta} %
              </span>
            </div>
            <input type="range" min={-20} max={20} step={1} value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full accent-teal-600" />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>-20 %</span><span>Tarif conseillé</span><span>+20 %</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span>Véhicule</span><span className="text-right">Actuel</span>
              <span className="text-right">Conseillé</span><span className="text-right">Nouveau</span>
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
              {rows.map(r => (
                <div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 py-2 text-xs items-center">
                  <span className="font-bold text-slate-700 truncate">{r.label} <span className="text-slate-400 font-normal">· {r.plate}</span></span>
                  <span className="text-right text-slate-500">{fmt(r.current)}</span>
                  <span className="text-right text-slate-400">{fmt(r.base)}</span>
                  <span className={`text-right font-black ${r.target > r.current ? 'text-emerald-600' : r.target < r.current ? 'text-amber-600' : 'text-slate-600'}`}>{fmt(r.target)}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
          <button onClick={onClose} className="text-xs font-bold text-slate-500 px-4 py-2.5 rounded-xl hover:bg-slate-100">Annuler</button>
          <button disabled={busy} onClick={apply}
            className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-5 py-2.5 rounded-xl">
            {busy ? 'Application…' : `Appliquer à ${rows.length} véhicule${rows.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
