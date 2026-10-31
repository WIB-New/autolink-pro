import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, CheckCircle, Send } from 'lucide-react';

/* Section finale : CTA navy + formulaire « Proposez votre véhicule ». */
export default function PartnerApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', city: 'Douala', vehicle: '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="candidature" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-stretch">
        {/* CTA */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 bg-teal-600 text-teal-300 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
              <Rocket size={13} /> <span className='text-white'>Rejoignez nos partenaires</span>
            </span>
            <h2 className="text-3xl font-black text-slate-600 leading-tight mb-4">
              Commencez à monétiser votre voiture dès cette semaine.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Déposez votre demande : un conseiller partenaire vous rappelle sous 24 h
              pour planifier l'inspection gratuite de votre véhicule.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-500">
            {['Inspection gratuite en agence', 'Zéro frais d\'inscription', 'Premier versement dès la 1ʳᵉ location'].map(t => (
              <li key={t} className="flex items-center gap-2.5">
                <CheckCircle size={16} className="text-teal-400 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
          {sent ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-14">
              <CheckCircle size={44} className="text-teal-600 mb-4" />
              <h3 className="font-black text-slate-900 text-xl mb-2">Demande bien reçue !</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Un conseiller vous contactera au <strong>{form.phone}</strong> sous 24 h
                pour l'inspection de votre véhicule.
              </p>
              <button onClick={() => navigate('/register?role=owner')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
                Créer mon compte propriétaire →
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h3 className="font-black text-slate-900 text-lg">Proposez votre véhicule</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nom complet <span className="text-red-500">*</span></label>
                  <input type="text" required className="input-field" placeholder="Votre nom"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Téléphone <span className="text-red-500">*</span></label>
                  <input type="tel" required className="input-field" placeholder="+237 6XX XX XX XX"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ville <span className="text-red-500">*</span></label>
                  <select className="input-field" value={form.city} onChange={e => set('city', e.target.value)}>
                    {['Douala', 'Yaoundé', 'Autre'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Véhicule (marque &amp; modèle) <span className="text-red-500">*</span></label>
                  <input type="text" required className="input-field" placeholder="Ex : Toyota RAV4 2019"
                    value={form.vehicle} onChange={e => set('vehicle', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Message (facultatif)</label>
                <textarea rows={4} className="input-field resize-none"
                  placeholder="Kilométrage, état, disponibilités, questions…"
                  value={form.message} onChange={e => set('message', e.target.value)} />
              </div>
              <button type="submit"
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                Déposer ma candidature <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
