import React from 'react';
import {
  CalendarDays, Clock, Zap, MapPin, ShieldCheck, Gauge,
  Calculator, TrendingUp, Smartphone, Building2, Check,
} from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const OWNER_SHARE = 0.5; // part propriétaire définie par le backend (COMMISSION_RATE)

const Toggle = ({ on, onChange }) => (
  <button type="button" onClick={() => onChange(!on)}
    className={`w-10 h-[22px] rounded-full relative transition-colors ${on ? 'bg-teal-600' : 'bg-slate-200'}`}>
    <span className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${on ? 'left-[20px]' : 'left-0.5'}`} />
  </button>
);

const Block = ({ icon: Icon, title, sub, children }) => (
  <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center"><Icon size={16} className="text-teal-600" /></span>
      <div>
        <h3 className="font-black text-slate-900 text-sm">{title}</h3>
        <p className="text-[10px] text-slate-400">{sub}</p>
      </div>
    </div>
    {children}
  </section>
);

/* Étape 5 — « Disponibilités & Tarification » + calculateur de revenus nets. */
export default function StepAvailability({ form, set, v }) {
  const rate = Number(form.dailyRate || 0);
  const net = rate * OWNER_SHARE;
  const monthly = net * 15; // 15 jours loués estimés
  const enabledDays = form.availDays || { Lun: 1, Mar: 1, Mer: 1, Jeu: 1, Ven: 1, Sam: 1, Dim: 0 };

  const vehicleName = v || `${form.brand} ${form.model} ${form.year}`.trim() || 'Votre véhicule';

  return (
    <div className="grid lg:grid-cols-[1fr_330px] gap-6 items-start">
      <div className="space-y-5">
        {/* Bandeau garantie */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-teal-600" />
            <p className="text-[11px] text-teal-800"><strong>Protocole Garantie AutoLink Pro &amp; Assureur partenaire.</strong> Tous les trajets incluent un contrat sécurisé : caution bloquée par Orange Money / MTN MoMo et une protection tous risques.</p>
          </div>
          <button className="text-[10px] font-black text-teal-700 whitespace-nowrap">Audit Détails →</button>
        </div>

        {/* Jours & horaires */}
        <Block icon={CalendarDays} title="Jours & Horaires de mise à disposition" sub="Sélectionnez les journées ouvrables à la réservation">
          <div className="flex gap-2 flex-wrap mb-4">
            {DAYS.map(d => {
              const on = enabledDays[d];
              return (
                <button key={d} type="button" onClick={() => set('availDays', { ...enabledDays, [d]: on ? 0 : 1 })}
                  className={`w-12 py-2.5 rounded-xl text-[11px] font-black transition-all ${on ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Heure de dépôt du plus tôt</label>
              <select value={form.dropTime || '07:30'} onChange={e => set('dropTime', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                {['06:00', '07:00', '07:30', '08:00', '09:00'].map(h => <option key={h}>{h}{h === '07:30' ? ' (Recommandé)' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Heure limite de restitution</label>
              <select value={form.returnTime || '20:00'} onChange={e => set('returnTime', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                {['18:00', '19:00', '20:00', '21:00'].map(h => <option key={h}>{h}{h === '20:00' ? ' (Heure de pointe)' : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Zap size={13} className="text-teal-600" />
                <div><div className="text-[11px] font-black text-slate-800">Réservation instantanée</div><div className="text-[9px] text-slate-400">Confirmer automatiquement les clients vérifiés (CNI/Passeport)</div></div>
              </div>
              <Toggle on={form.instantBooking !== false} onChange={v => set('instantBooking', v)} />
            </div>
            <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Clock size={13} className="text-teal-600" />
                <div><div className="text-[11px] font-black text-slate-800">Préavis minimum de réservation</div><div className="text-[9px] text-slate-400">Délai de réactivation avant de louer en charge — 12 heures requises</div></div>
              </div>
              <select value={form.noticeHours || '12'} onChange={e => set('noticeHours', e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-600">
                {['6', '12', '24', '48'].map(h => <option key={h} value={h}>{h} heures</option>)}
              </select>
            </div>
          </div>
        </Block>

        {/* Lieux de remise */}
        <Block icon={MapPin} title="Lieux de remise et restitution" sub="Définissez vos points de contact à Douala">
          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Point de rencontre principal (Hub fixe)</label>
              <select value={form.pickupHub || 'akwa'} onChange={e => set('pickupHub', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none">
                <option value="akwa">Douala — Hub Central Akwa (Boulevard de la Liberté)</option>
                <option value="bonanjo">Douala — Agence Bonanjo</option>
                <option value="bastos">Yaoundé — Hub Bastos</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Précision de l'adresse ou repère local</label>
              <input value={form.pickupAddress || ''} onChange={e => set('pickupAddress', e.target.value)}
                placeholder="En face de l'Hôtel Akwa Palace, Boulevard de la Liberté"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { k: 'deliveryAirport', t: 'Aéroport International DLA', d: 'Accès aire de dépose privatisée', p: '+5 000 FCFA' },
                { k: 'deliveryHotel',   t: 'Livraison Hôtel / Résidence', d: 'Restitution sur zone urbaine', p: '+10 000 FCFA' },
              ].map(o => (
                <button key={o.k} type="button" onClick={() => set(o.k, !form[o.k])}
                  className={`text-left border rounded-2xl p-4 transition-all ${form[o.k] ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center ${form[o.k] ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                      {form[o.k] && <Check size={11} className="text-white" />}
                    </span>
                    <span className="text-[9px] font-black text-teal-600">{o.p}</span>
                  </div>
                  <div className="text-[11px] font-black text-slate-800 mt-2">{o.t}</div>
                  <div className="text-[9px] text-slate-400">{o.d}</div>
                </button>
              ))}
            </div>
          </div>
        </Block>

        {/* Kilométrage & conditions */}
        <Block icon={Gauge} title="Kilométrage & Conditions de conduite" sub="Définissez vos contrats kilométriques et de sécurité">
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Forfait journalier standard</div>
              <div className="text-lg font-black text-slate-900 mt-1"><input type="number" value={form.kmPerDay || 250} onChange={e => set('kmPerDay', e.target.value)} className="w-20 bg-transparent font-black focus:outline-none" /> km <span className="text-xs text-slate-400">/ jour inclus</span></div>
              <div className="text-[9px] text-slate-400 mt-1">Idéal pour les trajets Douala — Yaoundé ou zones limites du pays.</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Caution de garantie</div>
              <div className="text-lg font-black text-slate-900 mt-1"><input type="number" value={form.depositAmount || 150000} onChange={e => set('depositAmount', e.target.value)} className="w-28 bg-transparent font-black focus:outline-none" /> <span className="text-xs text-slate-400">FCFA</span></div>
              <div className="text-[9px] text-slate-400 mt-1">Montant conservé en séquestre (jamais débité, sauf incident).</div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={13} className="text-teal-600" />
              <div>
                <div className="text-[11px] font-black text-slate-800">Autoriser l'option Chauffeur Professionnel AutoLink <span className="text-teal-600">+15 % revenu</span></div>
                <div className="text-[9px] text-slate-400">Votre véhicule à disposition des cadres expatriés et délégations internationales, un chauffeur agréé</div>
              </div>
            </div>
            <Toggle on={form.driverPro !== false} onChange={v => set('driverPro', v)} />
          </div>
        </Block>

        {/* Tarification */}
        <Block icon={Calculator} title="Tarification par type de location" sub="Ajustez votre prix journalier de base">
          <div className="grid sm:grid-cols-[1fr_200px] gap-4 items-center mb-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Prix journalier de référence</div>
              <p className="text-[9px] text-slate-400">Montant facturé avant remises sur la durée</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <input type="number" value={form.dailyRate || 60000} onChange={e => set('dailyRate', e.target.value)}
                className="w-full bg-transparent text-sm font-black text-slate-900 focus:outline-none" />
              <span className="text-[9px] font-bold text-slate-400">FCFA/j</span>
            </div>
          </div>
          <input type="range" min={30000} max={150000} step={5000} value={form.dailyRate || 60000}
            onChange={e => set('dailyRate', e.target.value)} className="w-full accent-teal-600 mb-1" />
          <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-4">
            <span>30 000 FCFA</span><span>Conseillé : 55 000 – 65 000 FCFA</span><span>150 000 FCFA</span>
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Réductions automatiques (longue durée)</div>
          <div className="flex gap-3 flex-wrap">
            {[
              { k: 'discount3', t: 'Dès 3 jours (−10 %)', d: '54 000 FCFA / jour' },
              { k: 'discount7', t: 'Dès 7 jours (−20 %)', d: '48 000 FCFA / jour' },
            ].map(r => (
              <div key={r.k} className="flex-1 min-w-[200px] flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div><div className="text-[11px] font-black text-slate-800">{r.t}</div><div className="text-[9px] text-slate-400">{r.d}</div></div>
                <Toggle on={form[r.k] !== false} onChange={v => set(r.k, v)} />
              </div>
            ))}
          </div>
        </Block>
      </div>

      {/* Sidebar — véhicule + calculateur */}
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <img src={fleetImage({ model: form.model, brand: form.brand, category: form.category })} alt="" className="w-14 h-14 object-cover rounded-xl" />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">{vehicleName}</div>
            <div className="text-[9px] text-slate-400 truncate">{form.category || 'SUV'} · {form.city || 'Douala'}, {form.pickupHub === 'bastos' ? 'Bastos' : 'Akwa'} · {form.fuel || 'Hybride'} · {form.gear || 'Automatique'}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator size={14} className="text-teal-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simulateur propriétaire</span>
            </div>
            <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-md">NET GARANTI</span>
          </div>
          <h4 className="font-black text-slate-900 text-sm mb-4">Calculateur de Revenus Nets</h4>
          <div className="space-y-2.5 text-[11px] mb-4">
            <div className="flex justify-between text-slate-600"><span>Tarif public facturé</span><strong>{fmt(rate)} FCFA/j</strong></div>
            <div className="flex justify-between text-slate-600"><span>Commission AutoLink Pro (50 %)</span><strong className="text-red-500">− {fmt(rate - net)} FCFA</strong></div>
            <div className="flex justify-between pt-2 border-t border-slate-100 font-black"><span className="text-slate-700">Votre gain net garanti<br /><span className="text-[9px] font-semibold text-slate-400">Viré chaque lundi sur MTN MoMo</span></span><span className="text-teal-600 text-lg">{fmt(net)}<br /><span className="text-[9px] text-slate-400 font-semibold">FCFA / jour</span></span></div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-4 text-white mb-3">
            <div className="text-[8px] font-black uppercase tracking-widest text-teal-300 mb-1">Protection Mensuelle Estimée</div>
            <div className="text-3xl font-black">{fmt(monthly)} <span className="text-xs text-slate-400">FCFA / mois</span></div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">Montant net transférable directement sur votre compte MTN MoMo, Orange Money ou versement direct First Bank.</p>
          </div>
          <p className="text-[9px] text-slate-400 leading-relaxed mb-3">Facturation recommandée pour Douala : la fourchette de prix conseillée par AutoLink est ajustée selon la gamme et la saison CEMAC.</p>
          <div className="flex gap-2 items-center">
            <span className="text-[9px] font-bold text-slate-400">Paiement accepté :</span>
            {[{ i: Smartphone, l: 'MTN' }, { i: Smartphone, l: 'Orange' }, { i: Building2, l: 'Virement' }].map((m, i) => (
              <span key={i} className="flex items-center gap-1 text-[8px] font-black bg-slate-50 border border-slate-100 text-slate-500 px-2 py-1 rounded-md"><m.i size={8} /> {m.l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
