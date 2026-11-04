import React from 'react';
import {
  Eye, BadgeCheck, Snowflake, Users, GitBranch, Gauge,
  UserCheck, Fuel, MapPin, FileCheck, Send, FileDown, Pencil,
  ShieldCheck, ClipboardCheck, Camera, Globe, Phone,
} from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const ROADMAP = [
  { n: 1, t: 'Vérification administrative', d: 'Contrôle légal de la carte grise, de la validité de l\'assurance et de la conformité fiscale par nos juristes à Douala Akwa.', eta: 'Est. 4h', on: true },
  { n: 2, t: 'Inspection physique au Hub', d: 'Rendez-vous programmé au Hub Central Akwa : audit mécanique de 45 points et installation du boîtier télématique GPS sécurisé anti-vol.', eta: 'Jour J+1', on: true },
  { n: 3, t: 'Publication & Réservations', d: 'Votre véhicule devient instantanément visible pour nos clients certifiés : diaspora et voyageurs d\'affaires avec règlements hebdomadaires garantis.', eta: 'Actif', on: true },
];

/* Étape 6 — « Récapitulatif & Envoi » (aperçu public + certification CEMAC). */
export default function StepRecap({ form, photos, certify, setCertify }) {
  const name = `${form.brand || '—'} ${form.model || ''} ${form.year ? `(${form.year})` : ''}`.trim();
  const cover = photos?.front34?.url || fleetImage({ model: form.model, brand: form.brand, category: form.category });
  const rate = Number(form.dailyRate || 60000);
  const photoCount = Object.keys(photos || {}).filter(k => photos[k]).length;

  return (
    <div className="space-y-5">
      {/* Bannière conformité */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4 flex items-center gap-3">
        <ShieldCheck size={18} className="text-teal-600 shrink-0" />
        <div>
          <div className="text-xs font-black text-teal-800">Vérification de mise en conformité CEMAC &amp; OHADA</div>
          <p className="text-[10px] text-teal-700/80">Votre véhicule sera mis en circulation commerciale sous contrat certifié AutoLink Pro Mobility avec assurance tous risques intégrée.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5">
          {/* Aperçu fiche client */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Eye size={15} className="text-teal-600" /> Aperçu fiche client (Public Preview)</h3>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">Telle que vue par les locataires</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-52 mb-4">
              <img src={cover} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[9px] font-black px-2.5 py-1 rounded-md">Gamme {form.category || 'Premium'}</span>
              <span className="absolute top-3 right-3 bg-teal-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1"><BadgeCheck size={10} /> Partenaire Vérifié</span>
              <span className="absolute bottom-3 left-3 bg-slate-900/70 text-white text-[9px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><Camera size={10} /> {photoCount || 8} photos HD inspectées</span>
              <span className="absolute bottom-3 right-3 bg-white text-slate-900 text-sm font-black px-3.5 py-1.5 rounded-xl shadow">{fmt(rate)} <span className="text-[9px] text-teal-600">FCFA / jour</span></span>
            </div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <h4 className="font-black text-slate-900">{name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {form.city || 'Douala'}, {form.pickupHub === 'bastos' ? 'Bastos' : 'Akwa'} (Prise en charge centrale)</p>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400">Note prévisionnelle</div>
                <div className="text-xs font-black text-teal-600">★ 4,85 (Flotte Pro)</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { i: Snowflake, t: 'Climatisation Bi-zone' },
                { i: Users, t: `${form.seats || 5} Places` },
                { i: GitBranch, t: `Boîte ${form.gear || 'Auto'}` },
                { i: Gauge, t: `${form.kmPerDay || 250} km/j` },
              ].map((c, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <c.i size={14} className="text-teal-600 mx-auto mb-1" />
                  <div className="text-[9px] font-bold text-slate-600 leading-tight">{c.t}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><UserCheck size={10} className="text-teal-600" /> Option Chauffeur Pro Douala disponible (+{fmt(rate * 0.25)} FCFA/j)</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><Fuel size={10} className="text-teal-600" /> {form.fuel || 'Hybride'} (conso faible)</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><MapPin size={10} className="text-teal-600" /> GPS Traceur temps réel</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Conditions tarifaires &amp; Caution — Sécurisation Orange Money / MTN MoMo</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'Tarif journalier de base', v: `${fmt(rate)} FCFA`, s: '−10 % dès 3 jours' },
                  { l: 'Caution séquestre', v: `${fmt(form.depositAmount || 150000)} FCFA`, s: 'Non débitée, libérée à H+2' },
                  { l: 'Points de livraison actifs', v: '2 Hubs', s: 'Akwa (Gratuit) · Aéroport (+5k)' },
                ].map(c => (
                  <div key={c.l}>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">{c.l}</div>
                    <div className="text-sm font-black text-slate-900">{c.v}</div>
                    <div className="text-[8px] text-slate-400">{c.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pièces administratives */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm">Pièces administratives et conformité CEMAC</h3>
              <span className="text-[9px] font-black bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md">3/3 Documents — Conformité OK</span>
            </div>
            <div className="space-y-2.5">
              {[
                { t: 'Carte Grise Cameroun (CEMAC)', s: `N° ${form.plate || '2024-DLA-XXXX'} · Titulaire vérifié` },
                { t: "Attestation d'Assurance Tous Risques", s: `Valide jusqu'au ${form.insuranceExpiry || '—'}` },
                { t: 'Certificat de Visite Technique Automobile', s: `Centre agréé Douala Bonabéri · Valide ${form.technicalControl || '—'}` },
              ].map(d => (
                <div key={d.t} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3.5">
                  <FileCheck size={15} className="text-teal-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-slate-800">{d.t}</div>
                    <div className="text-[9px] text-slate-400">{d.s}</div>
                  </div>
                  <span className="text-[9px] font-black bg-teal-100 text-teal-700 px-2 py-1 rounded-md flex items-center gap-1"><BadgeCheck size={9} /> Validé</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-2"><ClipboardCheck size={15} className="text-teal-600" /> Certification &amp; Envoi officiel</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
              Conformément au droit commercial OHADA et à la charte de qualité AutoLink Pro Mobility, la validation
              finale de votre véhicule requiert votre attestation personnelle.
            </p>
            <label className={`flex gap-3 border rounded-2xl p-4 cursor-pointer transition-all mb-3 ${certify ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200'}`}>
              <input type="checkbox" checked={certify} onChange={e => setCertify(e.target.checked)} className="mt-0.5 accent-teal-600" />
              <span className="text-[10px] text-slate-600 leading-relaxed">
                Je certifie sur l'honneur l'<strong>exactitude des informations fournies</strong>, le bon état de marche
                mécanique du véhicule (clim, freinage, pneus) et l'<strong>authenticité des documents légaux
                CEMAC</strong> déposés.
              </span>
            </label>
            <p className="text-[9px] text-slate-400 flex items-center gap-1.5 mb-4"><ShieldCheck size={11} className="text-teal-600" /> Caution et versements garantis par séquestre bancaire &amp; API Orange / MTN Mobile Money</p>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 py-2.5 rounded-xl transition-colors"><FileDown size={11} /> Exporter PDF</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 py-2.5 rounded-xl transition-colors"><Pencil size={11} /> Modifier l'annonce</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h4 className="font-black text-slate-900 text-sm mb-1">Feuille de route de mise en ligne</h4>
            <p className="text-[9px] text-slate-400 mb-4">Votre dossier passe par 3 étapes rigoureuses avant son apparition sur l'application mobile et le site public.</p>
            <div className="space-y-0">
              {ROADMAP.map((r, i) => (
                <div key={r.n} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{r.n}</span>
                    {i < ROADMAP.length - 1 && <span className="w-0.5 flex-1 bg-teal-100 my-1" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-slate-800">{r.t}</span>
                      <span className="text-[8px] font-black bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">{r.eta}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed mt-0.5">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <div className="text-[9px] text-slate-500"><strong className="text-slate-700 block">Assistance Propriétaire AutoLink</strong>+237 6XX XX XX XX (WhatsApp Pro)</div>
              <button className="flex items-center gap-1 text-[9px] font-black bg-teal-600 text-white px-3 py-2 rounded-lg"><Phone size={9} /> Contacter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
