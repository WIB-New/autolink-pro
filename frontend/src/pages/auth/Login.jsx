import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Lock, Eye, EyeOff, AlertCircle, ArrowRight,
  KeyRound, MessageSquare, Mail, Loader,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import AuthLayout from '../../components/auth/AuthLayout';
import OtpPanel from '../../components/auth/OtpPanel';
import AutoLinkLogo from '../../components/AutoLinkLogo';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, otpVerify, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Méthode : 'password' | 'code' (connexion par code email/SMS) — ?otp=1
  const [method, setMethod] = useState(params.get('otp') === '1' ? 'code' : 'password');
  const [otpStep, setOtpStep] = useState(1); // 1 = identité, 2 = saisie du code
  const [otp, setOtp] = useState({ firstName: '', lastName: '', email: '', code: '' });
  const [sent, setSent] = useState(false);

  // ?next=/chemin : après authentification on revient terminer
  // l'action initiée (ex. réservation depuis le catalogue public)
  const next = params.get('next');

  const afterAuth = (role) => navigate(next || getDashboardPath(role));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) {
      afterAuth(result.user.role);
    } else {
      setError(result.error);
    }
  };

  const sendCode = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.otpRequest({
        email: otp.email.trim(),
        first_name: otp.firstName.trim(),
        last_name: otp.lastName.trim(),
      });
      setSent(true);
      setOtpStep(2);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? (Object.values(d)[0]) : 'Envoi impossible — vérifiez votre connexion.');
    }
    setLoading(false);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await otpVerify(otp.email.trim(), otp.code.trim());
    setLoading(false);
    if (result.success) {
      afterAuth(result.user.role);
    } else {
      setError(result.error);
    }
  };

  // Étape 2 du mode « code » : écran de vérification (maquette 3)
  if (method === 'code' && otpStep === 2) {
    return (
      <AuthLayout gradient maxW="max-w-lg">
        <OtpPanel
          email={otp.email} code={otp.code}
          onCodeChange={v => setOtp(o => ({ ...o, code: v }))}
          onSubmit={verifyCode} onResend={sendCode}
          onBack={() => { setOtpStep(1); setError(''); }}
          loading={loading} error={error}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout maxW="max-w-2xl">
      {/* Bandeau confiance */}
      {/* <div className="flex items-center justify-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-3.5 mb-6">
        <span className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
          <Lock size={16} className="text-teal-600" />
        </span>
        <div>
          <div className="text-xs font-bold text-slate-800">Connexion sécurisée AutoLink Pro</div>
          <div className="text-[11px] text-slate-400">Vos choix sont sauvegardés</div>
        </div>
      </div> */}

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sm:p-10">
        <div className="text-center mb-7">
           <Link to="/" className="flex items-center justify-center mb-8">
          <AutoLinkLogo size="sm" />
        </Link> 
          <h1 className="text-3xl font-black text-teal-600 mb-1">Bon retour</h1>
          <p className="text-sm text-slate-500">
            {next ? 'Connectez-vous pour continuer votre réservation' : 'Connectez-vous à votre espace personnel AutoLink Pro'}
          </p>
        </div>

        {/* Onglets méthode */}
        {/* <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl mb-6">
          <button type="button" onClick={() => { setMethod('password'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${method === 'password' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <KeyRound size={14} /> Mot de passe
          </button>
          <button type="button" onClick={() => { setMethod('code'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${method === 'code' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <MessageSquare size={14} /> Code SMS / Email
          </button>
        </div> */}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* {/* 
{method === 'code' ? (
         // Connexion sans mot de passe : identité puis envoi du code 
         <form onSubmit={sendCode} className="space-y-5">
           <div className="grid grid-cols-2 gap-3">
             <input type="text" className="input-field" placeholder="Prénom"
               value={otp.firstName} onChange={e => setOtp(o => ({ ...o, firstName: e.target.value }))} />
             <input type="text" className="input-field" placeholder="Nom"
               value={otp.lastName} onChange={e => setOtp(o => ({ ...o, lastName: e.target.value }))} />
           </div>
           <div>
             <label className="label">Adresse email</label>
             <div className="relative">
               <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="email" required autoComplete="email" className="input-field pl-10"
                 placeholder="votre@email.com"
                 value={otp.email} onChange={e => setOtp(o => ({ ...o, email: e.target.value }))} />
             </div>
           </div>
           <button type="submit" disabled={loading}
             className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
             {loading ? <Loader size={17} className="animate-spin" /> : <>Recevoir mon code <ArrowRight size={16} /></>}
           </button>
           {sent && <p className="text-xs text-emerald-600 text-center font-medium">Un code vient d'être envoyé.</p>}
           <div className="flex items-center gap-3 pt-1">
             <div className="flex-1 h-px bg-slate-200" />
             <span className="text-xs text-slate-400 font-medium">ou</span>
             <div className="flex-1 h-px bg-slate-200" />
           </div>
           <GoogleAuthButton />
         </form>
        ) : (
         // Connexion classique (maquette 2) 
         <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="label">Adresse email ou téléphone</label>
             <div className="relative">
               <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                 type="email" required autoComplete="email"
                 className="input-field pl-10"
                 placeholder="votre@email.com"
                 value={form.email}
                 onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
               />
             </div>
           </div>
           <div>
             <div className="flex justify-between items-center mb-1">
               <label className="label mb-0">Mot de passe</label>
               <a href="#" className="text-xs text-teal-600 font-semibold hover:underline">Mot de passe oublié ?</a>
             </div>
             <div className="relative">
               <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                 type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                 className="input-field pl-10 pr-12"
                 placeholder="••••••••••"
                 value={form.password}
                 onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
               />
               <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                 {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
               </button>
             </div>
           </div>
           <label className="flex items-center gap-2.5 cursor-pointer select-none">
             <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
               className="w-4 h-4 accent-teal-600 rounded" />
             <span className="text-sm text-slate-600 font-medium">Se souvenir de moi</span>
           </label>
           <button type="submit" disabled={loading}
             className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
             {loading ? <Loader size={17} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
           </button>
           <div className="flex items-center gap-3 pt-1">
             <div className="flex-1 h-px bg-slate-200" />
             <span className="text-xs text-slate-400 font-medium">ou</span>
             <div className="flex-1 h-px bg-slate-200" />
           </div>
           <GoogleAuthButton />
         </form>
        )}
*/} 

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Adresse email ou téléphone</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required autoComplete="email"
                  className="input-field pl-10"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Mot de passe</label>
                <a href="#" className="text-xs text-teal-600 font-semibold hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  className="input-field pl-10 pr-12"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded" />
              <span className="text-sm text-slate-600 font-medium">Se souvenir de moi</span>
            </label>
            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader size={17} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
            </button>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <GoogleAuthButton />
          </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to={next ? `/register?next=${encodeURIComponent(next)}` : '/register'} className="text-teal-600 font-bold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
