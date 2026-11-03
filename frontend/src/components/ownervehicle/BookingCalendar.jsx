import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Ban, Tag } from 'lucide-react';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WD = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

const sameDay = (d, y, m, day) => d.getFullYear() === y && d.getMonth() === m && d.getDate() === day;

/* Statut d'un jour : booked (teal) / pending (amber) / free. */
const dayState = (y, m, day, bookings) => {
  const d = new Date(y, m, day);
  const hit = bookings.find(b => {
    const s = new Date(b.start_date); const e = new Date(b.end_date);
    s.setHours(0, 0, 0, 0); e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  });
  if (!hit) return null;
  return hit.status === 'pending' ? 'pending' : 'booked';
};

function Month({ year, month, bookings }) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysIn = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  return (
    <div>
      <div className="text-xs font-black text-slate-800 text-center mb-3">{MONTHS[month]} {year}</div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WD.map(d => <span key={d} className="text-[8px] font-black text-slate-400 py-1">{d}</span>)}
        {[...Array(offset)].map((_, i) => <span key={`p${i}`} className="text-[10px] text-slate-300 py-1.5">{prevDays - offset + i + 1}</span>)}
        {[...Array(daysIn)].map((_, i) => {
          const day = i + 1;
          const st = dayState(year, month, day, bookings);
          const b = bookings.find(x => ['confirmed', 'active', 'pending'].includes(x.status) && new Date(x.start_date) <= new Date(year, month, day) && new Date(x.end_date) >= new Date(year, month, day));
          return (
            <div key={day} className={`py-1.5 rounded-lg text-[10px] font-bold leading-tight ${st === 'booked' ? 'bg-teal-600 text-white' : st === 'pending' ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              {day}
              <div className={`text-[7px] font-black ${st === 'booked' ? 'text-teal-200' : 'text-slate-400'}`}>
                {b ? `${fmt((b.daily_rate || 60000) / 1000)}k` : `${60 + ((day * 7) % 10)}k`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* « Planning de location — Disponibilités » — 2 mois côte à côte. */
export default function BookingCalendar({ bookings }) {
  const now = new Date();
  const [base, setBase] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const next = { y: new Date(base.y, base.m + 1, 1).getFullYear(), m: new Date(base.y, base.m + 1, 1).getMonth() };
  const shift = dir => { const d = new Date(base.y, base.m + dir, 1); setBase({ y: d.getFullYear(), m: d.getMonth() }); };

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
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-100 border border-slate-200 rounded-sm" /> Disponible (FCFA/j)</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Month year={base.y} month={base.m} bookings={bookings} />
        <Month year={next.y} month={next.m} bookings={bookings} />
      </div>
      <div className="flex gap-3 mt-5 flex-wrap">
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors"><Ban size={12} /> Bloquer des dates</button>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors"><Tag size={12} /> Appliquer un tarif spécial week-end</button>
      </div>
    </div>
  );
}
