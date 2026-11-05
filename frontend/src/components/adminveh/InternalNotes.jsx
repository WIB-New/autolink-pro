import React, { useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/* Notes internes confidentielles — visibles admin uniquement (local). */
export default function InternalNotes({ vehicle: v }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([
    { by: 'Guy M. (Inspecteur Hub)', at: '24/10/2025 · 11:36', txt: `Vérifié ${v.brand} ${v.model} : légère oxydation exceptionnelle sur la carrosserie, sans incidence. Comportement moteur hybride conforme.` },
    { by: `${user?.first_name || 'Alexandre'} N. (Super-Admin)`, at: '24/10/2025 · 11:52', txt: 'Balise GPS synchronisée sur la console Douala. Tarif de la carte grise concorde parfaitement avec la raison sociale Mobilité SARL. Prêt pour mise en ligne.' },
  ]);

  const add = () => {
    if (!text.trim()) return;
    setNotes(n => [...n, { by: `${user?.first_name || 'Admin'} — Opérateur`, at: new Date().toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), txt: text.trim() }]);
    setText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Lock size={14} className="text-slate-400" /> Notes Internes Confidentielles
        </h3>
        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-md">Admin Only</span>
      </div>
      <div className="space-y-3 max-h-56 overflow-y-auto mb-4">
        {notes.map((n, i) => (
          <div key={i} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-black text-slate-700">{n.by}</span>
              <span className="text-[9px] text-slate-400 whitespace-nowrap">{n.at}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">{n.txt}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-2xl p-3">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
          placeholder="Ajouter une consigne pour les superviseurs de flotte…"
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        <button onClick={add}
          className="mt-2 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors ml-auto">
          <Send size={11} /> Enregistrer la note
        </button>
      </div>
    </div>
  );
}
