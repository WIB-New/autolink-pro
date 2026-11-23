import React from 'react';
import {
  Eye, BadgeCheck, Users, GitBranch, Gauge,
  UserCheck, Fuel, MapPin, FileCheck, Pencil,
  ShieldCheck, ClipboardCheck, Camera, Phone, FileWarning,
} from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const ROADMAP = [
  { n: 1, t: 'Vérification administrative', d: 'Contrôle légal de la carte grise, de la validité de l\'assurance et de la conformité fiscale par nos juristes à Douala Akwa.', eta: 'Est. 4h', on: true },
  { n: 2, t: 'Inspection physique au Hub', d: 'Rendez-vous programmé au hub de remise : audit mécanique de 45 points et installation du boîtier télématique GPS sécurisé anti-vol.', eta: 'Jour J+1', on: true },
  { n: 3, t: 'Publication & Réservations', d: 'Votre véhicule devient instantanément visible pour nos clients certifiés : diaspora et voyageurs d\'affaires avec règlements hebdomadaires garantis.', eta: 'Actif', on: true },
];

const DOCS = [
  { key: 'doc_registration', t: 'Carte Grise Cameroun (CEMAC)' },
  { key: 'doc_insurance',    t: "Attestation d'Assurance Tous Risques" },
  { key: 'doc_technical',    t: 'Certificat de Visite Technique Automobile' },
];

/* Étape 6 — « Récapitulatif & Envoi » (aperçu public + certification CEMAC). */
export default function StepRecap({ form, photos, certify, setCertify, preview, config, onEdit }) {
  const name = `${form.brand || '—'} ${form.model || ''} ${form.year ? `(${form.year})` : ''}`.trim();
  const cover = photos?.front34?.url || fleetImage({ model: form.model, brand: form.brand, category: form.category });
  const rate = Number(form.dailyRate || preview?.computed_rate || 0);
  const photoCount = Object.keys(photos || {}).filter(k => photos[k]).length;
  const hubs = config?.addresses || [];
  const driverFee = Number(config?.driver_daily_fee || 0);
  const deliveryFee = Number(config?.delivery_fee || 0);
  const discountRules = (config?.discount_rules || [])
    .filter(r => Number(r.min_days) > 0 && Number(r.percent) > 0)
    .sort((a, b) => Number(a.min_days) - Number(b.min_days));
  const discountText = discountRules.map(r => `−${Number(r.percent)} % dès ${r.min_days} j`).join(' · ');
  const docCount = DOCS.filter(d => form[d.key]).length;
  const phone = (config?.phones || [])[0] || '';

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
              <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[9px] font-black px-2.5 py-1 rounded-md">Gamme {preview?.tier_label || '—'}</span>
              <span className="absolute top-3 right-3 bg-teal-600 text-white text-[9px] font-black px-2.5 py-1 rounded-md flex items-center gap-1"><BadgeCheck size={10} /> Partenaire Vérifié</span>
              <span className="absolute bottom-3 left-3 bg-slate-900/70 text-white text-[9px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><Camera size={10} /> {photoCount} photo{photoCount > 1 ? 's' : ''} fournie{photoCount > 1 ? 's' : ''}</span>
              <span className="absolute bottom-3 right-3 bg-white text-slate-900 text-sm font-black px-3.5 py-1.5 rounded-xl shadow">{fmt(rate)} <span className="text-[9px] text-teal-600">FCFA / jour</span></span>
            </div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <h4 className="font-black text-slate-900">{name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {form.city || '—'}{form.pickupHub ? `, ${form.pickupHub}` : ''}</p>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400">Note publique</div>
                <div className="text-xs font-black text-slate-500">Nouveau véhicule — pas encore noté</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { i: Fuel, t: form.fuel || '—' },
                { i: Users, t: `${form.seats || '—'} Places` },
                { i: GitBranch, t: `Boîte ${form.gear || '—'}` },
                { i: Gauge, t: `${fmt(preview?.km_included)} km/j inclus` },
              ].map((c, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <c.i size={14} className="text-teal-600 mx-auto mb-1" />
                  <div className="text-[9px] font-bold text-slate-600 leading-tight">{c.t}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mb-4">
              {form.driverPro !== false && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><UserCheck size={10} className="text-teal-600" /> Option Chauffeur AutoLink disponible (+{fmt(driverFee)} FCFA/j)</span>
              )}
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><Fuel size={10} className="text-teal-600" /> {form.fuel || '—'}</span>
              {form.mileage && <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"><Gauge size={10} className="text-teal-600" /> {fmt(form.mileage)} km au compteur</span>}
            </div>
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Conditions tarifaires &amp; Caution — Sécurisation Orange Money / MTN MoMo</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'Tarif journalier de base', v: `${fmt(rate)} FCFA`, s: discountText || 'Aucune remise longue durée' },
                  { l: 'Caution séquestre', v: `${fmt(preview?.deposit)} FCFA`, s: 'Définie par la grille de la gamme — libérée après restitution' },
                  { l: 'Points de remise', v: `${hubs.length} Hub${hubs.length > 1 ? 's' : ''}`, s: `Hub gratuit · Livraison +${fmt(deliveryFee)} F` },
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
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-md ${docCount === DOCS.length ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                {docCount}/{DOCS.length} Documents {docCount === DOCS.length ? '— Dossier complet' : '— Incomplet'}
              </span>
            </div>
            <div className="space-y-2.5">
              {DOCS.map(d => {
                const f = form[d.key];
                return (
                  <div key={d.t} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3.5">
                    {f ? <FileCheck size={15} className="text-teal-600 shrink-0" /> : <FileWarning size={15} className="text-amber-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-slate-800">{d.t}</div>
                      <div className="text-[9px] text-slate-400">{f ? f.name : 'Aucun fichier joint'}</div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md flex items-center gap-1 ${f ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                      {f ? <><BadgeCheck size={9} /> Joint</> : 'Manquant'}
                    </span>
                  </div>
                );
              })}
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
            <button onClick={onEdit}
              className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 py-2.5 rounded-xl transition-colors"><Pencil size={11} /> Modifier l'annonce</button>
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
            {phone && (
              <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                <div className="text-[9px] text-slate-500"><strong className="text-slate-700 block">Assistance Propriétaire AutoLink</strong>{phone}</div>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-[9px] font-black bg-teal-600 text-white px-3 py-2 rounded-lg"><Phone size={9} /> Contacter</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
