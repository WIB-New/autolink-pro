import React, { useState } from 'react';
import {
  ArrowRight, CheckCircle, CarFront, ShieldCheck, Banknote, X,
  Loader, User, Phone, Mail, MapPin, CalendarDays, Upload, Contact, ChevronLeft,
} from 'lucide-react';
import { driversAPI } from '../../services/api';

const AVAILABILITIES = [
  { value: 'full', label: 'Temps plein' },
  { value: 'part', label: 'Temps partiel' },
  { value: 'weekend', label: 'Week-ends uniquement' },
];

const GUARANTEES = [
  { value: 'caution', label: 'Caution en espèces (séquestre)' },
  { value: 'garant', label: 'Garant physique' },
  { value: 'assurance', label: 'Assurance professionnelle' },
  { value: 'none', label: 'Aucune pour le moment' },
];

const PRO_STATUS = ['Indépendant', 'Salarié', 'Étudiant', 'En recherche d\'emploi', 'Retraité'];
const LICENSE_TYPES = ['A', 'B', 'C', 'D', 'E'];

const STEPS = [
  { t: 'Identité', icon: User, h: 'Qui êtes-vous ?', s: 'Vos coordonnées pour vous recontacter.' },
  { t: 'Permis', icon: Contact, h: 'Votre permis de conduire', s: 'Type, ancienneté et justificatif.' },
  { t: 'Disponibilité', icon: CalendarDays, h: 'Votre organisation', s: 'Horaires, statut et garanties.' },
  { t: 'Conformité', icon: ShieldCheck, h: 'Vérifications finales', s: 'Véhicule, assurance et casier.' },
];

const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all';
const labelCls = 'block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5';

const EMPTY = {
  full_name: '', email: '', phone: '', city: '',
  experience_years: '', license_type: 'B', license_number: '',
  license_obtained_at: '', license_expiry: '', has_valid_license: true,
  availability: 'full', guarantee_type: '', references: '',
  has_vehicle: false, vehicle_description: '', has_insurance: false,
  professional_status: '', has_clean_criminal_record: false, message: '',
};

function DriverApplyModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [licenseFile, setLicenseFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* Validation par étape avant d'avancer */
  const stepValid = () => {
    if (step === 1) return form.full_name.trim() && form.email.trim() && form.phone.trim() && form.city.trim();
    if (step === 2) return String(form.experience_years).trim() !== '';
    return true;
  };
  const next = () => { setError(''); stepValid() ? setStep(s => s + 1) : setError('Complétez les champs obligatoires (*) avant de continuer.'); };

  const submit = async (e) => {
    e.preventDefault();
    if (!stepValid()) { setError('Complétez les champs obligatoires (*).'); return; }
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
      if (licenseFile) fd.append('license_document', licenseFile);
      await driversAPI.apply(fd);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      const first = data && typeof data === 'object' ? Object.values(data)[0] : null;
      setError(Array.isArray(first) ? first[0] : (first || 'Envoi impossible — réessayez plus tard.'));
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-teal-600" />
          </div>
          <h3 className="font-black text-slate-900 text-lg mb-2">Candidature envoyée !</h3>
          <p className="text-sm text-slate-500 mb-6">Notre équipe étudie votre dossier et vous recontacte sous 72h pour un test de conduite.</p>
          <button onClick={onClose} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="relative px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="text-center">
            <h3 className="font-black text-slate-900 text-sm">Candidature chauffeur</h3>
            {/* <p className="text-[10px] text-slate-400 mt-0.5">Étude du dossier sous 72h — gratuit.</p> */}
          </div>
          <button onClick={onClose} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>

        {/* Stepper + progression */}
        <div className="px-6 pt-5 shrink-0">
          <div className="flex items-center max-w-md mx-auto">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const active = n === step, past = n < step;
              return (
                <React.Fragment key={s.t}>
                  <div className="flex flex-col items-center gap-1.5 w-16">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-colors ${past ? 'bg-teal-600 border-teal-600 text-white' : active ? 'border-teal-600 text-teal-600 bg-teal-50' : 'border-slate-200 text-slate-400 bg-slate-50'}`}>
                      {past ? <CheckCircle size={14} /> : <s.icon size={13} />}
                    </span>
                    <span className={`text-[8.5px] font-black uppercase tracking-wide ${active ? 'text-teal-600' : 'text-slate-400'}`}>{s.t}</span>
                  </div>
                  {n < STEPS.length && <div className={`flex-1 h-0.5 mb-5 rounded-full ${past ? 'bg-teal-600' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
          <div className="text-center mt-8 mb-1">
            {/* <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">Étape {step} sur {STEPS.length}</span> */}
            <h4 className="font-black  uppercase text-start mx-[63px] text-slate-600 text-sm mt-2">{STEPS[step - 1].h}</h4>
            {/* <p className="text-[11px] text-slate-400">{STEPS[step - 1].s}</p> */}
          </div>
        </div>

        <form onSubmit={submit} className="overflow-y-auto px-6 py-4 flex-1">
          {/* Hauteur fixe identique à toutes les étapes — la modale ne change jamais de taille */}
          <div className="h-[46vh]">
          {/* Étape 1 — Identité & contact */}
          {step === 1 && (
            <div>
              <div className="max-w-md mx-auto space-y-4">
                <div><label className={labelCls}>Nom complet *</label><input className={inputCls} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jean Kamdem" /></div>
                <div><label className={labelCls}>Téléphone *</label><div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputCls} pl-9`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+237 6XX XX XX XX" /></div></div>
                <div><label className={labelCls}>Email *</label><div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" className={`${inputCls} pl-9`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@mail.com" /></div></div>
                <div><label className={labelCls}>Ville / Quartier *</label><div className="relative"><MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${inputCls} pl-9`} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Douala — Akwa" /></div></div>
              </div>
            </div>
          )}

          {/* Étape 2 — Permis & expérience */}
          {step === 2 && (
            <div>
              <div className="max-w-md mx-auto space-y-4">
                <div><label className={labelCls}>Années de conduite *</label><input type="number" min="0" max="60" className={inputCls} value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="ex. 5" /></div>
                <div><label className={labelCls}>Type de permis *</label>
                  <select className={inputCls} value={form.license_type} onChange={e => set('license_type', e.target.value)}>
                    {LICENSE_TYPES.map(t => <option key={t} value={t}>Permis {t}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>N° du permis</label><input className={inputCls} value={form.license_number} onChange={e => set('license_number', e.target.value)} placeholder="B-2345-6789" /></div>
                <div><label className={labelCls}>Date d'obtention</label><input type="date" className={inputCls} value={form.license_obtained_at} onChange={e => set('license_obtained_at', e.target.value)} /></div>
                <div><label className={labelCls}>Date de validité</label><input type="date" className={inputCls} value={form.license_expiry} onChange={e => set('license_expiry', e.target.value)} /></div>
                <div>
                  <label className={labelCls}>Photo du permis (recto)</label>
                  <button type="button" onClick={() => document.getElementById('lic-file').click()}
                    className={`w-full border-2 border-dashed rounded-xl px-3.5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${licenseFile ? 'border-teal-400 text-teal-600 bg-teal-50/50' : 'border-slate-200 hover:border-teal-400 text-slate-500'}`}>
                    <Upload size={14} /> {licenseFile ? licenseFile.name : 'Téléverser'}
                  </button>
                  <input id="lic-file" type="file" accept="image/*,.pdf" className="hidden" onChange={e => setLicenseFile(e.target.files[0] || null)} />
                </div>
              </div>
              <label className="flex items-center mx-[63px] gap-2.5 mt-3 text-sm font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.has_valid_license} onChange={e => set('has_valid_license', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                Je certifie que mon permis est en cours de validité
              </label>
            </div>
          )}

          {/* Étape 3 — Disponibilité & garanties */}
          {step === 3 && (
            <div>
              <div className="max-w-md mx-auto space-y-4">
                <div><label className={labelCls}>Disponibilité *</label>
                  <select className={inputCls} value={form.availability} onChange={e => set('availability', e.target.value)}>
                    {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Statut professionnel</label>
                  <select className={inputCls} value={form.professional_status} onChange={e => set('professional_status', e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {PRO_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div ><label className={labelCls}>Garantie proposée</label>
                  <select className={inputCls} value={form.guarantee_type} onChange={e => set('guarantee_type', e.target.value)}>
                    <option value="">Sélectionner…</option>
                    {GUARANTEES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div >
                  <label className={labelCls}>Témoins / références (2 contacts min.)</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} value={form.references} onChange={e => set('references', e.target.value)}
                    placeholder="Nom, lien, téléphone — ex. : Paul Ndi, employeur, +237 6XX…" />
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 — Véhicule & conformité */}
          {step === 4 && (
            <div>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.has_vehicle} onChange={e => set('has_vehicle', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  Je possède un véhicule personnel
                </label>
                {form.has_vehicle && (
                  <input className={inputCls} value={form.vehicle_description} onChange={e => set('vehicle_description', e.target.value)} placeholder="Marque / modèle / année — ex. Toyota Corolla 2018" />
                )}
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.has_insurance} onChange={e => set('has_insurance', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  J'ai une assurance en cours de validité
                </label>
                <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.has_clean_criminal_record} onChange={e => set('has_clean_criminal_record', e.target.checked)} className="w-4 h-4 accent-teal-600" />
                  Mon casier judiciaire est vierge
                </label>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Message (facultatif)</label>
                <textarea rows={3} className={`${inputCls} resize-none`} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Présentez-vous en quelques lignes…" />
              </div>
            </div>
          )}

            {error && <div className="max-w-md mx-auto mt-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl text-center">{error}</div>}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
          {step > 1 && (
            <button type="button" onClick={() => { setStep(s => s - 1); setError(''); }}
              className="w-32 flex items-center justify-center gap-1.5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={15} /> Retour
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length ? (
            <button type="button" onClick={next} disabled={!stepValid()}
              className="w-32 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              Continuer <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={submit} disabled={busy}
              className="w-32 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {busy && <Loader size={15} className="animate-spin" />}
              {busy ? 'Envoi…' : 'Envoyer la candidature'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Section « Devenez chauffeur AutoLink » — présentation du métier + Postuler. */
export default function DriverCta() {
  const [open, setOpen] = useState(false);

  return (
    <section id="chauffeurs" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl px-8 py-14 lg:px-16 grid lg:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-teal-600/20 rounded-full blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-teal-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-black text-black mb-4 leading-tight">
              Devenez chauffeur partenaire<br />
              <span className="text-teal-500">et gagnez en conduisant.</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6 max-w-lg">
              AutoLink recrute des chauffeurs professionnels certifiés pour
              accompagner les locations longue durée et les trajets VIP.
              Vous choisissez vos horaires, nous fournissons les clients.
            </p>
            <ul className="space-y-2.5 mb-8">
              {['Rémunération attractive + primes de ponctualité', 'Horaires flexibles : temps plein ou week-end', 'Formation et certification AutoLink offertes'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-500">
                  <CheckCircle size={16} className="text-teal-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-lg text-sm">
              Postuler <ArrowRight size={16} />
            </button>
          </div>
          <div className="relative hidden lg:flex flex-col gap-4">
            {[
              { icon: CarFront,    t: 'Conduite sécurisée',   s: 'Permis vérifié + test de conduite' },
              { icon: ShieldCheck, t: 'Cadre professionnel',  s: 'Assurance et contrat de partenariat' },
              { icon: Banknote,    t: 'Paiement fiable',      s: 'Reversement sous 72h après chaque course' },
            ].map((c, i) => (
              <div key={c.t}
                className={`bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 ${i === 1 ? 'lg:ml-10' : ''}`}>
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <c.icon size={18} className="text-teal-600" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold text-sm">{c.t}</div>
                  <div className="text-slate-400 text-xs">{c.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && <DriverApplyModal onClose={() => setOpen(false)} />}
    </section>
  );
}
