import React from 'react';
import { Receipt, CheckCircle2, Clock, FileDown } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const fmtDT = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } catch (_) { return '—'; } };

const KIND = {
  topup:  { label: 'Rechargement solde', verb: 'vers' },
  debit:  { label: 'Débit portefeuille', verb: 'depuis' },
  refund: { label: 'Remboursement',      verb: 'vers' },
};

/* « Historique des retraits & Reçus télécom » — transactions wallet réelles. */
export default function WithdrawHistory({ transactions = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className=" text-slate-500">Historique des retraits &amp; Reçus télécom</h3>
          {/* <p className="text-[11px] text-slate-400 mt-0.5">Traçabilité complète des virements exécutés vers vos comptes certifiés.</p> */}
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors">
          <FileDown size={11} /> Registre d'audit vérifié BEAC
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center text-slate-400">
          <Receipt size={30} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold text-slate-500 text-sm">Aucune transaction pour le moment</p>
          <p className="text-[11px] mt-1">Vos retraits et rechargements apparaîtront ici avec leurs références opérateur.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map(t => {
            const k = KIND[t.kind] || KIND.topup;
            return (
              <div key={t.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400">{fmtDT(t.created_at)}</span>
                  <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md ${t.status === 'completed' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                    {t.status === 'completed' ? <CheckCircle2 size={9} /> : <Clock size={9} />} {t.status === 'completed' ? 'Succès' : 'En cours'}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900">{fmt(t.amount)} <span className="text-xs text-slate-400">FCFA</span></div>
                <div className="text-[10px] text-slate-400 mt-1">{k.label} {k.verb} <strong className="text-slate-600">{t.method === 'mtn_momo' ? 'MTN MoMo' : t.method === 'orange_money' ? 'Orange Money' : t.method || 'Wallet'}</strong></div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400">Réf : {t.reference || `TX-${t.id}`}</span>
                  <button className="flex items-center gap-1 text-[9px] font-black text-teal-600 hover:text-teal-700"><FileDown size={9} /> Reçu</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
