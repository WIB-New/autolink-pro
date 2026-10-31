// import React, { useState } from 'react';
// import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
// import { SIM_GAMMES, OWNER_SHARE } from './data';

// /* Section « Estimez le revenu mensuel net de votre véhicule » — simulateur interactif. */
// export default function IncomeCalculator() {
//   const [gamme, setGamme] = useState('premium');
//   const [days, setDays] = useState(15);

//   const g = SIM_GAMMES.find(x => x.id === gamme);
//   const gross = g.dayPrice * days;
//   const net = Math.round(gross * OWNER_SHARE / 1000) * 1000;
//   const fmt = n => n.toLocaleString('fr-FR');

//   return (
//     <section id="simulateur" className="py-20 bg-slate-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           {/* <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Simulateur de revenus</p> */}
//           <h2 className="text-3xl md:text-4xl font-black text-teal-600 mb-3">
//             Estimez le <span className="text-teal-600">revenu mensuel net</span> de votre véhicule
//           </h2>
//           <p className="text-slate-500 max-w-2xl mx-auto">
//             Ajustez la gamme et le nombre de jours loués — le revenu estimé se calcule instantanément.
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
//           {/* Réglages */}
//           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
//             <div className="flex items-center gap-2.5 mb-6">
//               <Calculator size={18} className="text-teal-600" />
//               <h3 className="font-black text-slate-900">Votre situation</h3>
//             </div>

//             <label className="label">Gamme de votre véhicule</label>
//             <div className="grid grid-cols-2 gap-2.5 mb-7">
//               {SIM_GAMMES.map(x => (
//                 <button key={x.id} type="button" onClick={() => setGamme(x.id)}
//                   className={`py-3 px-3 rounded-xl border-2 text-xs font-bold transition-all ${gamme === x.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
//                   {x.label}
//                   <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{fmt(x.dayPrice)} FCFA/j</span>
//                 </button>
//               ))}
//             </div>

//             <div className="flex items-center justify-between mb-2">
//               <label className="label mb-0">Jours de location par mois</label>
//               <span className="bg-teal-600 text-white text-xs font-black px-3 py-1 rounded-lg">{days} jours</span>
//             </div>
//             <input type="range" min="4" max="30" value={days} onChange={e => setDays(+e.target.value)}
//               className="w-full accent-teal-600 mb-2" />
//             <div className="flex justify-between text-[10px] text-slate-400 font-medium">
//               <span>4 j — tranquille</span><span>15 j — bon rythme</span><span>30 j — full time</span>
//             </div>
//           </div>

//           {/* Résultat */}
//           <div className="bg-white border border-slate-100 rounded-3xl p-7 lg:p-9 flex flex-col justify-between">
//             <div>
//               <div className="flex items-center justify-between mb-6">
//                 <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Revenu net estimé</span>
//                 <span className="bg-teal-600/20 text-teal-600 text-[10px] font-bold px-2.5 py-1 rounded-full">85 % pour vous</span>
//               </div>
//               <div className="font-black text-slate-600 text-5xl mb-2">
//                 {fmt(net)} <span className="text-lg text-teal-600">FCFA</span>
//               </div>
//               <p className="text-sm text-slate-400 mb-7">
//                 par mois, pour un véhicule <strong className="text-slate-200">{g.label}</strong> loué {days} jours.
//               </p>
//               <ul className="space-y-2.5 text-xs text-slate-400">
//                 <li className="flex justify-between border-b border-white/10 pb-2.5">
//                   <span>Revenu brut ({days} j × {fmt(g.dayPrice)})</span>
//                   <span className="text-slate-400 font-bold">{fmt(gross)} FCFA</span>
//                 </li>
//                 <li className="flex justify-between border-b border-white/10 pb-2.5">
//                   <span>Commission AutoLink Pro (15 %)</span>
//                   <span className="text-slate-400 font-bold">−{fmt(gross - net)} FCFA</span>
//                 </li>
//               </ul>
//             </div>
//             <button onClick={() => document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth' })}
//               className="mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition-colors">
//               Commencer votre aventure <ArrowRight size={16} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, ArrowRight, Image as ImageIcon } from 'lucide-react';

const MAX_FILES = 10;
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo par fichier
const ACCEPT = 'image/*,.pdf,.doc,.docx';
const isAllowed = (f) => f.type.startsWith('image/') || /\.(pdf|docx?)$/i.test(f.name);
const fmtSize = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} Ko` : `${(b / 1024 / 1024).toFixed(1)} Mo`);

/* Section « Téléversez les photos et documents de votre véhicule » — envoi à gauche, aperçu à droite. */
export default function IncomeCalculator() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  /* Libère les aperçus à la fermeture du composant */
  const itemsRef = useRef([]);
  itemsRef.current = items;
  useEffect(() => () => {
    itemsRef.current.forEach(i => i.preview && URL.revokeObjectURL(i.preview));
  }, []);

  const addFiles = (list) => {
    const errors = [];
    const accepted = [];

    Array.from(list).forEach(f => {
      const id = `${f.name}-${f.size}-${f.lastModified}`;
      if (!isAllowed(f)) errors.push(`${f.name} : format non accepté`);
      else if (f.size > MAX_SIZE) errors.push(`${f.name} : dépasse 5 Mo`);
      else if (items.some(i => i.id === id) || accepted.some(i => i.id === id)) return;
      else {
        const isImage = f.type.startsWith('image/');
        accepted.push({
          id, file: f, name: f.name, size: f.size, isImage,
          preview: isImage ? URL.createObjectURL(f) : null,
        });
      }
    });

    const room = MAX_FILES - items.length;
    if (accepted.length > room) {
      accepted.slice(room).forEach(i => i.preview && URL.revokeObjectURL(i.preview));
      errors.push(`Maximum ${MAX_FILES} fichiers`);
    }

    setItems(prev => [...prev, ...accepted.slice(0, room)]);
    setError(errors.join(' · '));
  };

  const removeItem = (id) => {
    setItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter(i => i.id !== id);
    });
    setError('');
  };

  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = ''; // permet de re-sélectionner le même fichier
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <section id="simulateur" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-teal-600 mb-3">
            Ajoutez les <span className="text-teal-600">photos et documents</span> de votre véhicule
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Carte grise, assurance, photos du véhicule : téléversez-les ici et vérifiez-les avant d'envoyer votre candidature.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Gauche : téléversement */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
            <div className="flex items-center gap-2.5 mb-6">
              <UploadCloud size={18} className="text-teal-600" />
              <h3 className="font-black text-slate-900">Téléverser vos fichiers</h3>
            </div>

            <input ref={inputRef} type="file" multiple accept={ACCEPT}
              onChange={onInputChange} className="hidden" />

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${dragging ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-400 bg-slate-50/50'}`}>
              <span className="mx-auto w-14 h-14 rounded-2xl bg-teal-600/10 flex items-center justify-center mb-4">
                <UploadCloud size={26} className="text-teal-600" />
              </span>
              <p className="text-sm font-bold text-slate-900 mb-1">Glissez-déposez vos fichiers ici</p>
              <p className="text-xs text-slate-400 mb-5">ou</p>
              <button type="button" onClick={() => inputRef.current?.click()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
                Parcourir mes fichiers
              </button>
            </div>

            <ul className="mt-5 space-y-1 text-[11px] text-slate-400 font-medium">
              <li>Formats : images (JPG, PNG, WebP), PDF, Word</li>
              <li>{MAX_FILES} fichiers maximum, 5 Mo chacun</li>
            </ul>

            {error && (
              <p role="alert" className="mt-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>

          {/* Droite : fichiers téléversés */}
          <div className="bg-white border border-slate-100 rounded-3xl p-7 lg:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Vos fichiers</span>
                <span className="bg-teal-600/10 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {items.length} / {MAX_FILES}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-14 text-center">
                  <ImageIcon size={28} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-400">Les fichiers que vous téléversez s'afficheront ici.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map(i => (
                    <li key={i.id} className="relative group rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                      {i.isImage ? (
                        <img src={i.preview} alt={i.name} className="w-full h-24 object-cover" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center bg-teal-50">
                          <FileText size={30} className="text-teal-600" />
                        </div>
                      )}
                      <div className="px-2.5 py-2">
                        <p className="text-[11px] font-bold text-slate-700 truncate" title={i.name}>{i.name}</p>
                        <p className="text-[10px] text-slate-400">{fmtSize(i.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(i.id)} aria-label={`Retirer ${i.name}`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors">
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={() => document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition-colors">
              Commencer votre aventure <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}