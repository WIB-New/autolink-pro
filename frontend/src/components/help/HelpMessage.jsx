import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle, Clock } from 'lucide-react';

/* Section « Envoyez-nous un message » — carte agence + formulaire de contact. */
export default function HelpMessage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'Réservation', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Écrivez-nous</p> */}
          <h2 className="text-3xl md:text-4xl text-center font-black text-teal-600">
            Envoyez-nous <span className="text-teal-600">un message</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-start">
          {/* Agence + infos */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Carte stylisée (placeholder carte de Douala) */}
              <div className="h-44 bg-gradient-to-br from-teal-100 via-sky-50 to-teal-50 relative">
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, #94a3b8 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #94a3b8 25px)' }} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <MapPin size={30} className="text-teal-600 drop-shadow-md" />
                  <span className="bg-white text-teal-700 text-[10px] font-black px-2.5 py-1 rounded-lg shadow mt-1">Douala — Bonanjo</span>
                </span>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-teal-600 mt-0.5 shrink-0" />
                  <span className="text-slate-600">Av. de Gaulle, Bonanjo — Douala &amp; Rue 1.739, Bastos — Yaoundé</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-teal-600 shrink-0" />
                  <span className="text-slate-600">+237 656 789 000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-teal-600 shrink-0" />
                  <span className="text-slate-600">support@autolinkpro.cm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-teal-600 shrink-0" />
                  <span className="text-slate-600">Lun–Sam : 8h–18h · Urgences 24/7</span>
                </div>
              </div>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-xs text-teal-800 leading-relaxed">
              <strong>Réponse sous 24 h ouvrées.</strong> Pour une urgence route ou un retard,
              privilégiez le standard téléphonique — il décroche jour et nuit.
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
            {sent ? (
              <div className="text-center py-14">
                <CheckCircle size={44} className="text-teal-600 mx-auto mb-4" />
                <h3 className="font-black text-slate-900 text-xl mb-2">Message envoyé !</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Merci {form.name.split(' ')[0]} — un conseiller AutoLink Pro vous répondra
                  sous 24 h à l'adresse <strong>{form.email}</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nom complet <span className="text-red-500">*</span></label>
                    <input type="text" required className="input-field" placeholder="Emmanuel Ndedi"
                      value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Numéro de téléphone <span className="text-red-500">*</span></label>
                    <input type="tel" required className="input-field" placeholder="+237 6XX XX XX XX"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Adresse e-mail <span className="text-red-500">*</span></label>
                    <input type="email" required className="input-field" placeholder="votre@email.com"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Sujet de la demande <span className="text-red-500">*</span></label>
                    <select className="input-field" value={form.subject} onChange={e => set('subject', e.target.value)}>
                      {['Réservation', 'Paiement & Caution', 'Documents', 'Incident / Réclamation', 'Partenariat', 'Autre'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Votre message <span className="text-red-500">*</span></label>
                  <textarea required rows={5} className="input-field resize-none"
                    placeholder="Décrivez votre demande ou votre problème en quelques lignes…"
                    value={form.message} onChange={e => set('message', e.target.value)} />
                </div>
                <button type="submit"
                  className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors ml-auto">
                  Envoyer le message <Send size={15} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
