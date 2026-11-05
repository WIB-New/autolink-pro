import React, { useRef } from 'react';
import { Camera, CheckCircle2, Eye, Trash2, Plus, ImagePlus, Lightbulb, ShieldCheck, UserCheck } from 'lucide-react';

export const SLOTS = [
  { id: 'front34',   label: 'Vue 3/4 avant gauche',              sub: 'Photo de couverture — angle valorisant', required: true,  cover: true },
  { id: 'front',     label: 'Vue avant directe (Calandre)',      sub: 'Face avant — phares et calandre',       required: true },
  { id: 'side',      label: 'Profil latéral droit',              sub: 'Vue complète du côté passager',         required: true },
  { id: 'rear34',    label: 'Vue 3/4 arrière droit',             sub: 'Arrière — coffre et optiques',          required: true },
  { id: 'interior',  label: 'Poste de conduite & Tableau de bord', sub: 'Angle large : volant + console centrale', required: true },
  { id: 'rear',      label: 'Banquette arrière & Coffre',        sub: 'Propreté des sièges et volume du coffre', required: true },
];

const TIPS = [
  { t: 'Véhicule propre et lavé', d: 'Carrosserie dépoussiérée et habitacle impeccable avant la prise de vue.' },
  { t: 'Lumière du jour naturelle', d: 'Privilégiez les heures matinales (7h–10h) ou de fin d\'après-midi. Évitez les flashs nocturnes.' },
  { t: 'Résolution min. 1920×1080px', d: 'Images nettes, non floues et sans filigrane externe.' },
  { t: "Plaque d'immatriculation visible", d: 'Obligatoire pour la conformité CEMAC et l\'inspection documentaire interne AutoLink.' },
];

/* Étape 3 — grille de slots photos + sidebar conseils (maquette). */
export default function StepPhotos({ photos, setPhotos }) {
  const inputRef = useRef(null);
  const [activeSlot, setActiveSlot] = React.useState(null);
  const done = SLOTS.filter(s => photos[s.id]).length;
  const pct = Math.round((done / SLOTS.length) * 100);

  const pick = slotId => { setActiveSlot(slotId); inputRef.current?.click(); };
  const onFile = e => {
    const f = e.target.files?.[0];
    if (f && activeSlot) setPhotos(p => ({ ...p, [activeSlot]: { file: f, url: URL.createObjectURL(f), name: f.name } }));
    e.target.value = '';
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <div>
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-900">Étape 3 : Photos de votre véhicule</h2>
          <p className="text-xs text-slate-500 mt-1">Téléversez des photos nettes et lumineuses. Un minimum de 6 photos sous des angles spécifiques est requis pour certifier votre annonce sur le réseau AutoLink Cameroun.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SLOTS.map((s, i) => {
            const p = photos[s.id];
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {p ? (
                  <div className="relative h-44">
                    <img src={p.url} alt={s.label} className="w-full h-full object-cover" />
                    <span className={`absolute top-2.5 left-2.5 text-[9px] font-black px-2 py-1 rounded-md ${s.cover ? 'bg-amber-400 text-slate-900' : 'bg-teal-600 text-white'}`}>
                      {s.cover ? '★ PHOTO DE COUVERTURE' : '✓ Validé'}
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 bg-slate-900/70 text-white text-[9px] font-bold px-2 py-1 rounded-md">Slot {i + 1} · Obligatoire</span>
                  </div>
                ) : (
                  <button onClick={() => pick(s.id)}
                    className="w-full h-44 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-teal-50/60 border-2 border-dashed border-slate-200 hover:border-teal-300 transition-colors">
                    <div className="w-11 h-11 bg-teal-600 rounded-2xl flex items-center justify-center"><Camera size={18} className="text-white" /></div>
                    <span className="text-[11px] font-bold text-slate-600">Glissez-déposez l'image ici<br />ou cliquez pour Parcourir</span>
                    <span className="text-[9px] text-slate-400">{s.sub}</span>
                  </button>
                )}
                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800 truncate">{s.label}</div>
                      <div className="text-[9px] text-slate-400 truncate">{p ? p.name : s.required ? 'Slot requis' : 'Optionnel'}</div>
                    </div>
                    {p ? (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => pick(s.id)} className="p-1.5 text-slate-400 hover:text-teal-600 border border-slate-200 rounded-lg"><Eye size={11} /></button>
                        <button onClick={() => setPhotos(pp => { const n = { ...pp }; delete n[s.id]; return n; })} className="p-1.5 text-slate-400 hover:text-red-500 border border-slate-200 rounded-lg"><Trash2 size={11} /></button>
                      </div>
                    ) : (
                      <span className={`text-[8px] font-black px-2 py-1 rounded-md shrink-0 ${i < 4 ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>
                        {i < 4 ? `Slot ${i + 1} · Requis` : `Slot ${i + 1} · ${s.required ? 'Requis' : 'Non téléversé'}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Photos complémentaires */}
        <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ImagePlus size={18} className="text-teal-600" />
            <div>
              <div className="text-xs font-black text-slate-800 flex items-center gap-2">Photos complémentaires <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">OPTIONNEL</span></div>
              <p className="text-[10px] text-slate-400 mt-0.5">Ajoutez des détails valorisants : jantes alliage, toit panoramique, système multimédia, état des pneumatiques.</p>
            </div>
          </div>
          <button onClick={() => pick('extra')} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 border border-slate-200 bg-white hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={12} /> Ajouter d'autres clichés
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Complétion obligatoire</span>
            <span className="text-xl font-black text-teal-600">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-teal-600">{done} sur 6 angles validés</span>
            <span className="text-red-500">{SLOTS.length - done} angles restants</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">L'étape 4 sera débloquée dès l'ajout des photos du poste de conduite et de la banquette arrière.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h4 className="text-xs font-black text-slate-900 mb-3">Conseils pour des photos qui louent</h4>
          <p className="text-[10px] text-slate-500 mb-3">Les véhicules dotés de photos certifiées enregistrent jusqu'à <strong>3,8× plus de réservations</strong> sur Douala et Yaoundé.</p>
          <div className="space-y-3">
            {TIPS.map(t => (
              <div key={t.t} className="flex gap-2.5">
                <CheckCircle2 size={13} className="text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black text-slate-800">{t.t}</div>
                  <div className="text-[9px] text-slate-400 leading-snug">{t.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
          <div className="text-[9px] font-black uppercase tracking-widest text-teal-700 mb-1.5">Protection des données</div>
          <p className="text-[10px] text-slate-500 leading-relaxed">Les visuels de vos passagers doivent être floutés publiquement à votre demande après validation par notre service d'audit.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center"><UserCheck size={15} className="text-teal-600" /></div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-slate-800">Besoin d'un photographe ?</div>
            <div className="text-[9px] text-slate-400">Service-conseil disponible à Douala &amp; Yaoundé</div>
          </div>
          <button className="text-[10px] font-black bg-slate-900 text-white px-3 py-2 rounded-lg">Réserver</button>
        </div>
      </div>
    </div>
  );
}
