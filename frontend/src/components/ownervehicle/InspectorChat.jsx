import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

const THREAD = [
  {
    me: false, name: 'Guy M. (Hub Akwa)', time: 'Hier, 14:15',
    text: "Bonjour Marc, la révision des 40 000 km a été saisie avec succès dans le carnet digital. Avec le sommet CEMAC prévu le mois prochain à Yaoundé et les délégations transitant par Douala, ce RAV4 Hybride sera très demandé. Je vous recommande d'augmenter le tarif journalier à 70 000 FCFA pour la période du 10 au 20 novembre.",
  },
  {
    me: true, name: 'Marc T.', time: 'Hier, 15:42 · Vu',
    text: "Parfait Guy ! Bonne suggestion. J'ai également vu la note sur le cliché du tableau de bord. Je passe au hub demain matin avant le départ de 08h30 pour refaire la photo nette, contact allumé.",
  },
];

/* Fil de discussion propriétaire ↔ inspecteur Hub. */
export default function InspectorChat() {
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState(THREAD);

  const send = () => {
    if (!msg.trim()) return;
    setMsgs(m => [...m, { me: true, name: 'Vous', time: "À l'instant", text: msg.trim() }]);
    setMsg('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-black">GM</div>
          <div>
            <div className="font-black text-slate-900 text-sm">Guy M. <span className="text-[9px] font-bold text-slate-400">— Inspecteur Référent Hub Akwa</span></div>
            <div className="text-[9px] text-teal-600 font-bold">En ligne · Il y a 10 min</div>
          </div>
        </div>
        <span className="text-[9px] font-bold text-slate-400">Sujet actif : Révision 40 000 km &amp; Tarif Sommet CEMAC</span>
      </div>

      <div className="space-y-3 mb-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-3.5 ${m.me ? 'bg-teal-600 text-white rounded-br-md' : 'bg-slate-50 text-slate-700 rounded-bl-md'}`}>
              <div className={`text-[9px] font-bold mb-1 ${m.me ? 'text-teal-200' : 'text-slate-400'}`}>{m.name} · {m.time}</div>
              <p className="text-[11px] leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
        <Paperclip size={14} className="text-slate-400" />
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Répondre à Guy M. ou joindre un justificatif…"
          className="flex-1 bg-transparent text-xs focus:outline-none" />
        <button onClick={send} className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors">
          Envoyer <Send size={11} />
        </button>
      </div>
    </div>
  );
}
