import React from 'react';
import { Receipt, CheckCircle2, Clock } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const fmtDT = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); } catch (_) { return '—'; } };

const KIND = {
  topup:  { label: 'Crédit',        verb: 'via' },
  debit:  { label: 'Débit',         verb: 'via' },
  refund: { label: 'Remboursement', verb: 'via' },
};

/* « Mouvements du solde » — transactions wallet réelles. */
export default function WithdrawHistory({ transactions = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="mb-5">
        <h3 className=" text-slate-500">Mouvements du solde</h3>
        {/* <p className="text-[11px] text-slate-400 mt-0.5">Traçabilité complète des virements exécutés vers vos comptes certifiés.</p> */}
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
                <div className="text-[10px] text-slate-400 mt-1">{t.note || k.label} {k.verb} <strong className="text-slate-600">{t.method === 'mtn_momo' ? 'MTN MoMo' : t.method === 'orange_money' ? 'Orange Money' : t.method || 'Wallet'}</strong></div>
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400">Réf : {t.reference || `TX-${t.id}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
