import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Car, KeyRound, Briefcase, Eye, EyeOff, AlertCircle, ArrowRight,
  User, Mail, Lock, Loader, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import AuthLayout from '../../components/auth/AuthLayout';
import OtpPanel from '../../components/auth/OtpPanel';
import AutoLinkLogo from '../../components/AutoLinkLogo';

const ROLES = [
  { value: 'CLIENT', label: 'Je suis client', icon: Car },
  { value: 'OWNER', label: 'Je suis proprietaire', icon: KeyRound },
  // { value: 'DRIVER', label: 'Je veux etre chauffeur', icon: KeyRound },
];

// Force du mot de passe → barres 0-4 + libellé
const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s;
};
const STRENGTH_LABEL = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
const STRENGTH_CLS = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-teal-500', 'bg-emerald-500'];

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, otpVerify, getDashboardPath } = useAuth();
  // ?next=/chemin : reprendre l'action initiée (ex. réservation) après inscription
  const next = params.get('next');
  const presetRole = { client: 'CLIENT', owner: 'OWNER', driver: 'DRIVER' }[(params.get('role') || '').toLowerCase()] || 'CLIENT';
  const [step, setStep] = useState(1); // 1 = formulaire, 2 = vérification OTP
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: presetRole, referral: '',
  });
  const [emailSent, setEmailSent] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const strength = pwStrength(form.password);

  const sendCode = async () => {
    try {
      const parts = form.fullName.trim().split(/\s+/);
      await authAPI.otpRequest({
        email: form.email.trim(),
        first_name: parts[0] || '',
        last_name: parts.slice(1).join(' ') || '',
      });
      return true;
    } catch (_) { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) { setError('Veuillez accepter les Conditions Générales pour continuer.'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError('');
    setLoading(true);
    const parts = form.fullName.trim().split(/\s+/);
    const digits = form.phone.replace(/\D/g, '');
    const result = await register({
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || parts[0] || '',
      email: form.email.trim(),
      phone: digits ? `+237${digits.slice(-9)}` : '',
      password: form.password,
      role: form.role,
    });
    if (!result.success) { setLoading(false); setError(result.error); return; }
    // Compte créé → on envoie le code de validation (étape 2, maquette 3)
    setEmailSent(await sendCode());
    setLoading(false);
    setStep(2);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) { setError('Entrez le code à 6 chiffres reçu par email.'); return; }
    setError('');
    setLoading(true);
    const result = await otpVerify(form.email.trim(), code.trim());
    setLoading(false);
    if (result.success) navigate(next || getDashboardPath(result.user.role));
    else setError(result.error);
  };

  const handleResend = async () => {
    setError('');
    const ok = await sendCode();
    setEmailSent(ok);
    if (!ok) setError("Le code n'a pas pu être renvoyé — réessayez dans une minute.");
  };

  // Étape 2 : écran de vérification (maquette 3 — fond dégradé)
  if (step === 2) {
    return (
      <AuthLayout gradient maxW="max-w-lg">
        <OtpPanel
          email={form.email} phone={form.phone} code={code}
          onCodeChange={setCode}
          onSubmit={handleVerify} onResend={handleResend}
          onBack={() => { setStep(1); setError(''); setCode(''); }}
          loading={loading}
          error={error || (emailSent ? '' : "Votre compte est créé mais l'email n'a pas pu être envoyé — utilisez « Renvoyer ».")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout maxW="max-w-2xl">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sm:p-10 relative">
        
        {/* Lien de retour à l'accueil */}
        {/* <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link> */}

        <Link to="/" className="flex items-center justify-center mb-8">
          <AutoLinkLogo size="sm" />
        </Link>

        <div className="text-center mb-7">
          <h1 className="text-3xl font-black text-teal-600 mb-1.5">Créer un compte</h1>
          <p className="text-sm text-slate-500">
            {next ? 'Créez votre compte pour finaliser votre réservation' : 'Rejoignez AutoLink Pro en quelques instants'}
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Onglets rôle — dans le formulaire */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6">
          {ROLES.map(({ value, label, icon: RoleIcon }) => (
            <button key={value} type="button" onClick={() => set('role', value)}
              className={`flex flex-row sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${form.role === value ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <RoleIcon size={15} className={form.role === value ? 'text-teal-600' : ''} /> {label}
            </button>
          ))}
        </div>

        {form.role === 'DRIVER' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 text-xs text-amber-800">
            <strong>Note :</strong> les chauffeurs passent par notre processus de recrutement — votre demande sera examinée par notre équipe.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nom complet <span className="text-red-500">*</span></label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" required className="input-field pl-10" placeholder="Emmanuel Ndedi"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Adresse e-mail <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" required autoComplete="email" className="input-field pl-10" placeholder="emmanuel.ndedi@exemple.cm"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Numéro de téléphone <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="tel" required inputMode="tel" className="input-field" placeholder="6XX XX XX XX"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} required autoComplete="new-password"
                  className="input-field pl-10 pr-12" placeholder="Au moins 8 caractères"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirmer <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw2 ? 'text' : 'password'} required autoComplete="new-password"
                  className="input-field pl-10 pr-12" placeholder="Répétez le mot de passe"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                <button type="button" onClick={() => setShowPw2(!showPw2)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw2 ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            {/* Force du mot de passe + correspondance — pleine largeur */}
            <div className="sm:col-span-2 -mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium shrink-0">Force du mot de passe</span>
                <div className="flex-1 flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? STRENGTH_CLS[strength] : 'bg-slate-200'}`} />
                  ))}
                </div>
                <span className={`text-[10px] font-bold shrink-0 ${strength >= 3 ? 'text-teal-600' : 'text-slate-400'}`}>
                  {form.password ? STRENGTH_LABEL[strength] : ''}
                </span>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Les mots de passe ne correspondent pas.</p>
              )}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-teal-600 rounded" />
            <span className="text-xs text-slate-500 leading-relaxed">
              J'accepte les <a href="#" className="text-teal-600 font-semibold hover:underline">Conditions Générales</a> et la{' '}
              <a href="#" className="text-teal-600 font-semibold hover:underline">Politique de confidentialité</a> conforme à la
              loi 2010/012 régissant les données numériques au Cameroun.
            </span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {loading ? <Loader size={17} className="animate-spin" /> : <>Créer mon compte <ArrowRight size={16} /></>}
          </button>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <GoogleAuthButton label="S'inscrire avec Google" />
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Déjà inscrit ?{' '}
          <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-teal-600 font-bold hover:underline">Se connecter</Link>
        </p>
      </div>
    </AuthLayout>
  );
}