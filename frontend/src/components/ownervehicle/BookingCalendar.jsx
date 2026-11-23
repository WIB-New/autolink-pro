import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Ban, X } from 'lucide-react';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WD = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const inRange = (d, s, e) => { const a = new Date(s); const b = new Date(e); a.setHours(0,0,0,0); b.setHours(0,0,0,0); return d >= a && d <= b; };

/* Statut d'un jour : booked / pending / blocked / null. */
const dayState = (d, bookings, blocks) => {
  const hit = bookings.find(b => inRange(d, b.start_date, b.end_date));
  if (hit) return hit.status === 'pending' ? 'pending' : 'booked';
  if (blocks.find(b => inRange(d, b.start_date, b.end_date))) return 'blocked';
  return null;
};

function Month({ year, month, bookings, blocks, dailyRate }) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysIn = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const rateK = dailyRate ? `${fmt(dailyRate / 1000)}k` : null;

  return (
    <div>
      <div className="text-xs font-black text-slate-800 text-center mb-3">{MONTHS[month]} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WD.map(d => <span key={d} className="text-[8px] font-black text-slate-400 py-1">{d}</span>)}
        {[...Array(offset)].map((_, i) => <span key={`p${i}`} className="text-[10px] text-slate-300 py-1.5">{prevDays - offset + i + 1}</span>)}
        {[...Array(daysIn)].map((_, i) => {
          const day = i + 1;
          const st = dayState(new Date(year, month, day), bookings, blocks);
          return (
            <div key={day} title={st === 'blocked' ? 'Bloqué par vos soins' : undefined}
              className={`py-1.5 rounded-lg text-[10px] font-bold leading-tight ${
                st === 'booked' ? 'bg-teal-600 text-white'
                : st === 'pending' ? 'bg-amber-100 text-amber-700'
                : st === 'blocked' ? 'bg-slate-200 text-slate-400 line-through'
                : 'text-slate-600 hover:bg-slate-50'}`}>
              {day}
              <div className={`text-[7px] font-black ${st === 'booked' ? 'text-teal-200' : 'text-slate-400'}`}>
                {st === 'booked' ? 'Résa' : st === 'pending' ? 'Attente' : st === 'blocked' ? 'Bloqué' : (rateK || '·')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* « Planning de location — Disponibilités » — réservations + indisponibilités réelles. */
export default function BookingCalendar({ v, bookings, blocks, onBlock, blocking }) {
  const now = new Date();
  const [base, setBase] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [blockOpen, setBlockOpen] = useState(false);
  const [range, setRange] = useState({ start: iso(now), end: iso(now), reason: '' });
  const next = { y: new Date(base.y, base.m + 1, 1).getFullYear(), m: new Date(base.y, base.m + 1, 1).getMonth() };
  const shift = dir => { const d = new Date(base.y, base.m + dir, 1); setBase({ y: d.getFullYear(), m: d.getMonth() }); };

  const submitBlock = async () => {
    if (!range.start || !range.end || range.end < range.start) return;
    const ok = await onBlock(range.start, range.end, range.reason.trim());
    if (ok) setBlockOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Planning de location</span>
          <h3 className="font-black text-slate-900">Disponibilités : {MONTHS[base.m]} &amp; {MONTHS[next.m]} {next.y}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600"><ChevronLeft size={13} /></button>
          <button onClick={() => shift(1)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-teal-600"><ChevronRight size={13} /></button>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap mb-4 text-[9px] font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-teal-600 rounded-sm" /> Occupé / Réservé</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-200 rounded-sm" /> En attente de validation</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm" /> Bloqué</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-white border border-slate-200 rounded-sm" /> Disponible (FCFA/j)</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Month year={base.y} month={base.m} bookings={bookings} blocks={blocks} dailyRate={v.daily_rate} />
        <Month year={next.y} month={next.m} bookings={bookings} blocks={blocks} dailyRate={v.daily_rate} />
      </div>

      {blocks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {blocks.map(b => (
            <span key={b.id} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
              Bloqué : {new Date(b.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(b.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              {b.reason ? ` · ${b.reason}` : ''}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-5 flex-wrap">
        <button onClick={() => setBlockOpen(true)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors">
          <Ban size={12} /> Bloquer des dates
        </button>
      </div>

      {blockOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setBlockOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-slate-900">Bloquer une période</h4>
              <button onClick={() => setBlockOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Le véhicule ne sera pas réservable sur cette plage (maintenance, usage personnel…).</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Du</label>
                <input type="date" value={range.start} min={iso(now)} onChange={e => setRange(r => ({ ...r, start: e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Au</label>
                <input type="date" value={range.end} min={range.start} onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
                  className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-400" />
              </div>
            </div>
            <input value={range.reason} onChange={e => setRange(r => ({ ...r, reason: e.target.value }))}
              placeholder="Motif (optionnel) : maintenance, voyage…" maxLength={200}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs mb-4 focus:outline-none focus:border-teal-400" />
            <button onClick={submitBlock} disabled={blocking || !range.start || !range.end || range.end < range.start}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black py-2.5 rounded-xl transition-colors">
              {blocking ? 'Enregistrement…' : 'Bloquer cette période'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
