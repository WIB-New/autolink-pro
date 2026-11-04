import React, { useState, useEffect } from 'react';
import { Smartphone, Landmark, ShieldCheck, Zap, Lock, CheckCircle2, X, Banknote, Loader, ChevronLeft } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const METHODS = [
  { id: 'mtn',    icon: Smartphone, name: 'MTN MoMo',       sub: '+237 670 ·· ·· 90 — Marc T.', badge: 'Compte vérifié' },
  { id: 'orange', icon: Smartphone, name: 'Orange Money',   sub: '+237 699 ·· ·· 34 — Marc T.', badge: 'Actif (Tier 2)' },
  { id: 'uba',    icon: Landmark,   name: 'UBA Cameroun',   sub: 'RIB 0400 1300 1304 — MARC T.', badge: 'Virement 24 h' },
];

const STEPS = ['Méthode', 'Montant', 'Confirmation'];

/* Modal « Demander un retrait » — parcours en 3 étapes. */
export default function WithdrawPanel({ open, onClose, balance = 0 }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('mtn');
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1); setSent(false); setBusy(false); setMethod('mtn');
      setAmount(balance ? Math.min(balance, 500000) : 0);
    }
  }, [open, balance]);

  if (!open) return null;

  const selected = METHODS.find(m => m.id === method);
  const valid = amount > 0 && amount <= balance;

  const confirm = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); setSent(true); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* En-tête modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
              <Banknote size={17} className="text-teal-600" />
            </span>
            <div>
              <div className="font-black text-slate-900 text-sm">Retrait de fonds</div>
              <div className="text-[10px] text-slate-400">{fmt(balance)} FCFA disponibles</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={17} />
          </button>
        </div>

        {sent ? (
          /* Écran succès */
          <div className="px-6 py-10 text-center">
            <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="font-black text-slate-900">Demande enregistrée</h3>
            <p className="text-xs text-slate-400 mt-1.5 mb-6">
              {fmt(amount)} FCFA vers {selected.name} — créditation sous 15 min.
            </p>
            <button onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-xl transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center px-8 pt-5">
              {STEPS.map((l, i) => (
                <React.Fragment key={l}>
                  <div className="flex flex-col items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i + 1 < step ? 'bg-teal-600 text-white' : i + 1 === step ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-slate-200 text-slate-400'}`}>
                      {i + 1 < step ? <CheckCircle2 size={12} /> : i + 1}
                    </span>
                    <span className={`text-[9px] font-bold mt-1 ${i + 1 === step ? 'text-teal-700' : 'text-slate-400'}`}>{l}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-[2px] rounded-full mx-2 mb-4 ${i + 1 < step ? 'bg-teal-600' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="px-6 py-5">
              {/* Étape 1 — compte bénéficiaire */}
              {step === 1 && (
                <div className="space-y-2.5">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center gap-3.5 border rounded-2xl p-3.5 text-left transition-all ${method === m.id ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${method === m.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                        <m.icon size={17} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-black text-slate-800">{m.name}</span>
                        <span className="block text-[10px] text-slate-400 truncate">{m.sub}</span>
                      </span>
                      <span className="text-[9px] font-bold text-teal-700 flex items-center gap-1 shrink-0"><CheckCircle2 size={10} /> {m.badge}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Étape 2 — montant */}
              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Montant (FCFA)</span>
                    <span className="text-[10px] font-bold text-teal-600">Max : {fmt(balance)} F</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-3">
                    <span className="text-[10px] font-black text-slate-400">XAF</span>
                    <input type="number" value={amount} min={1000} max={balance} onChange={e => setAmount(Number(e.target.value))}
                      className="flex-1 bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
                    <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {[100000, 250000, 500000].map(v => (
                      <button key={v} onClick={() => setAmount(Math.min(v, balance))}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-colors ${amount === v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-500 hover:border-teal-400'}`}>
                        + {fmt(v)} F
                      </button>
                    ))}
                    <button onClick={() => setAmount(balance)}
                      className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                      Tout retirer
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Zap size={12} className="text-teal-600" /> Créditation ~15 min
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Frais : 0 FCFA</span>
                  </div>
                </div>
              )}

              {/* Étape 3 — récapitulatif */}
              {step === 3 && (
                <div>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 mb-4">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Bénéficiaire</span>
                      <span className="font-black text-slate-800">{selected.name}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Compte</span>
                      <span className="font-bold text-slate-600">{selected.sub}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Frais</span>
                      <span className="font-bold text-slate-600">0 FCFA</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2.5 flex justify-between">
                      <span className="text-[11px] font-black text-slate-700">Montant total</span>
                      <span className="font-black text-slate-900">{fmt(amount)} FCFA</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-xl p-3 mb-1">
                    <ShieldCheck size={15} className="text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-teal-800 leading-relaxed">Un code OTP sera envoyé par SMS sur votre numéro certifié pour valider le virement.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pied modal */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl transition-colors">
                <ChevronLeft size={13} /> {step === 1 ? 'Annuler' : 'Retour'}
              </button>
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} disabled={step === 2 && !valid}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-[11px] px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40">
                  Continuer
                </button>
              ) : (
                <button onClick={confirm} disabled={busy}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {busy ? <Loader size={13} className="animate-spin" /> : <Lock size={13} />}
                  Confirmer {fmt(amount)} F
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
