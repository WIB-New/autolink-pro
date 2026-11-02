import React, { useState } from 'react';
import { Lock, Send, Bot, ShieldCheck, FilePlus, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ICONS = { note: User, auto: Bot, escrow: ShieldCheck, create: FilePlus };
const tone = { note: 'bg-teal-100 text-teal-700', auto: 'bg-purple-100 text-purple-600', escrow: 'bg-amber-100 text-amber-600', create: 'bg-slate-200 text-slate-600' };

/* Journal d'audit & notes internes confidentielles (local — pas d'endpoint dédié). */
export default function AuditNotes({ booking: b }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [notes, setNotes] = useState(() => [
    { t: 'note', by: `Note interne — ${user?.first_name || 'Admin'} (Super-Admin)`, at: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' 15:00', txt: `Dossier #ALP-${String(b.id).padStart(4, '0')} ouvert — vérifications en cours sur la caution et le KYC locataire.` },
    { t: 'auto', by: 'Contrôle KYC Automatique', at: 'Système', txt: 'Score de risque client : Faible (2/100). Correspondance faciale biométrique 99,4 % avec le permis CEMAC présenté.' },
    { t: 'escrow', by: 'Séquestration Caution MTN Mobile Money', at: 'Passerelle', txt: `Débit de garantie de ${Math.round(b.deposit_amount || 0).toLocaleString('fr-FR')} FCFA passé avec succès via API MoMo Cameroun. TXID : ALP-${String(b.id).padStart(4, '0')}-SEC. Statut COBAC : Protégé.` },
    { t: 'create', by: 'Création de la Demande', at: 'Système', txt: `Réservation initiée sur l'application Web AutoLink Pro. Montant préautorisé : ${Math.round(b.subtotal || 0).toLocaleString('fr-FR')} FCFA.` },
  ]);

  const add = () => {
    if (!text.trim()) return;
    setNotes(n => [{ t: 'note', by: `Note interne — ${user?.first_name || 'Admin'} (Super-Admin)`, at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), txt: text.trim() }, ...n]);
    setText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Lock size={14} className="text-slate-400" /> Journal d'Audit &amp; Notes Internes Confidentielles
        </h3>
        <span className="text-[9px] font-bold text-slate-400">Horodatage GMT+1 (Douala)</span>
      </div>

      {/* Saisie */}
      <div className="bg-slate-50 rounded-2xl p-3 mb-4">
        <div className="text-[9px] font-bold text-slate-400 mb-2 flex items-center justify-between">
          <span>Ajouter une note opérationnelle (invisible pour le client &amp; bailleur)</span>
          <span>Opérateur : {user?.first_name} {user?.last_name?.[0]}.</span>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
          placeholder="Ex : Client atterrit avec vol Camair-Co n°932, prévoir navette aéroport → Hub Akwa si retard…"
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        <button onClick={add}
          className="mt-2 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors ml-auto">
          <Send size={11} /> Enregistrer la note
        </button>
      </div>

      {/* Historique */}
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {notes.map((n, i) => {
          const Icon = ICONS[n.t];
          return (
            <div key={i} className="flex gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${tone[n.t]}`}>
                <Icon size={12} />
              </span>
              <div className="flex-1 bg-slate-50/70 rounded-xl px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-700">{n.by}</span>
                  <span className="text-[9px] text-slate-400 whitespace-nowrap">{n.at}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{n.txt}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
