import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Timer, Pencil, ArrowRight, MessageCircle, MessageSquare,
  ArrowLeft, HelpCircle, AlertCircle, Loader,
} from 'lucide-react';
import OtpInput from './OtpInput';

const maskEmail = (email = '') => {
  const [u, d] = email.split('@');
  return u ? `${u[0]}***@${d || ''}` : 'votre adresse';
};
const maskPhone = (phone = '') => {
  const d = phone.replace(/\D/g, '');
  return d.length >= 4 ? `+237 ${d.slice(-9, -7) || '6•'}• •• •• ${d.slice(-2)}` : '+237 6•• •• •• ••';
};

/* Panneau « Vérification du code de sécurité » (maquette 3) —
   utilisé après l'inscription et pour la connexion par code. */
export default function OtpPanel({ email, phone, code, onCodeChange, onSubmit, onResend, onBack, loading, error }) {
  const [cooldown, setCooldown] = useState(45);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = (e) => {
    e.preventDefault();
    setCooldown(45);
    onResend?.();
  };

  const mm = String(Math.floor(cooldown / 60)).padStart(2, '0');
  const ss = String(cooldown % 60).padStart(2, '0');

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sm:p-10">
      <div className="text-center mb-7">
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
          <ShieldCheck size={26} className="text-teal-600" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
            <ShieldCheck size={11} className="text-white" />
          </span>
        </div>
        <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          Authentification biométrique &amp; 2FA
        </span>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Vérification du code de sécurité</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Nous venons d'envoyer un code de validation à 6 chiffres par email et SMS
          au numéro <strong className="text-slate-700">{maskPhone(phone)}</strong> et à l'adresse{' '}
          <strong className="text-slate-700">{maskEmail(email)}</strong>.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="mb-5">
        <OtpInput value={code} onChange={onCodeChange} />
      </div>

      <div className="flex items-center justify-between text-xs mb-6">
        {cooldown > 0 ? (
          <span className="flex items-center gap-1.5 text-slate-500">
            <Timer size={13} className="text-teal-600" /> Renvoyer le code dans {mm}:{ss} s
          </span>
        ) : (
          <button type="button" onClick={resend} className="flex items-center gap-1.5 text-teal-600 font-bold hover:underline">
            <Timer size={13} /> Renvoyer le code
          </button>
        )}
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600 font-medium">
          <Pencil size={12} /> Modifier les coordonnées
        </button>
      </div>

      <button type="submit" disabled={loading || code.length !== 6}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mb-6">
        {loading ? <Loader size={17} className="animate-spin" /> : <>Confirmer et continuer <ArrowRight size={16} /></>}
      </button>

      <div className="border-t border-slate-100 pt-6 mb-6">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <HelpCircle size={13} className="text-amber-500" /> Code non reçu ?
          </span>
          <button type="button" className="text-teal-600 font-semibold hover:underline">Besoin d'aide</button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <button type="button" onClick={resend}
            className="flex items-center justify-center gap-1 border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-colors">
            <MessageCircle size={14} className="text-emerald-500" /> Renvoyer par WhatsApp
          </button>
          <button type="button" onClick={resend}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition-colors">
            <MessageSquare size={14} className="text-sky-500" /> Renvoyer par SMS
          </button>
        </div>
      </div>

      <button type="button" onClick={onBack}
        className="w-full text-center text-sm text-slate-500 hover:text-teal-600 font-medium flex items-center justify-center gap-1.5">
        <ArrowLeft size={14} /> Retour à la page de connexion
      </button>
{/* 
      <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-slate-400 font-medium">
        <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-teal-500" /> Protocole CEMAC 256-bit</span>
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
        <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-teal-500" /> Certifié GSMA Mobile Money</span>
      </div> */}
    </form>
  );
}
