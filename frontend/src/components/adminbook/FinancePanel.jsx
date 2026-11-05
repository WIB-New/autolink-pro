import React from 'react';
import { Wallet, ShieldCheck, Smartphone } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* Décomposition financière — total client, commission, net bailleur, caution. */
export default function FinancePanel({ booking: b }) {
  const days = b.days || Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000));
  const daily = b.daily_rate || Math.round(Number(b.subtotal || 0) / days);
  const commission = Number(b.commission_amount || 0) || Math.round(Number(b.subtotal || 0) * 0.15);
  const net = Number(b.owner_amount || 0) || Number(b.subtotal || 0) - commission;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Wallet size={15} className="text-teal-600" /> Décomposition Financière
        </h3>
        <span className="bg-teal-50 text-teal-700 text-[9px] font-black px-2 py-1 rounded-md flex items-center gap-1">
          <Smartphone size={9} /> Sécurisé MoMo
        </span>
      </div>

      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Transaction Client</div>
      <div className="text-3xl font-black text-slate-900 leading-none mb-4">
        {fmt(b.subtotal)} <span className="text-sm font-bold text-slate-400">FCFA</span>
      </div>

      <div className="space-y-2 text-[11px] border-t border-slate-100 pt-3 mb-4">
        <div className="flex justify-between"><span className="text-slate-500">Tarif journalier : {fmt(daily)} FCFA</span><span className="font-bold text-slate-700">Durée : {days} jours</span></div>
        <div className="flex justify-between bg-amber-50 -mx-2 px-2 py-1.5 rounded-lg">
          <span className="text-slate-600">Commission AutoLink (15 %)</span>
          <span className="font-black text-slate-900">{fmt(commission)} FCFA</span>
        </div>
        <div className="flex justify-between bg-teal-50 -mx-2 px-2 py-1.5 rounded-lg">
          <span className="text-teal-800 font-bold">Net Bailleur Propriétaire (85 %)</span>
          <span className="font-black text-teal-700">{fmt(net)} FCFA</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-3.5 mb-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-white mb-1">
          <ShieldCheck size={12} className="text-teal-400" /> Caution Séquestre : {fmt(b.deposit_amount)} FCFA
        </div>
        <p className="text-[9px] text-slate-400 leading-relaxed">
          Bloquée sur le compte séquestre CEMAC. Restitution sous 24 h post-retour. Statut :
          <strong className="text-teal-300"> {b.escrow_status === 'held' ? 'Bloquée (Escrow)' : b.escrow_status === 'released' ? 'Versée au propriétaire' : b.escrow_status === 'refunded' ? 'Remboursée client' : 'En attente'}</strong>
        </p>
        <div className="text-[8px] text-slate-500 mt-2">Opérateur : MTN Cameroun MoMo · Référence : #TX-ALP-{String(b.id).padStart(4, '0')} · Passerelle : commission 1%</div>
      </div>
    </div>
  );
}
