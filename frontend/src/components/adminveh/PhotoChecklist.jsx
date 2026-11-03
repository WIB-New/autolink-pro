import React, { useState } from 'react';
import { ImageIcon, CheckCircle2, X } from 'lucide-react';
import { getVehicleImage } from '../../utils/carImages';
import { mediaUrl } from '../../utils/media';
import FilePreview from '../FilePreview';

const SLOTS = ['3/4 Avant gauche', 'Face Calandre', 'Profil latéral droit', '3/4 Arrière', 'Cockpit & Bord', 'Banquette & Coffre'];

/* Les 6 clichés obligatoires — validation photo par photo. */
export default function PhotoChecklist({ vehicle: v }) {
  const [valid, setValid] = useState([true, true, true, true, false, true]);
  const [preview, setPreview] = useState(null);
  const img = v.image_url || getVehicleImage(v.category);
  // v.photos = [{ id, image, caption }] — fichiers réels uploadés (étape 3 wizard)
  const uploaded = (v.photos || []).map(p => mediaUrl(p.image || p));
  const photos = uploaded.length ? uploaded : SLOTS.map(() => img);
  const done = valid.filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <ImageIcon size={15} className="text-teal-600" /> 6 Clichés Obligatoires Flotte
        </h3>
        <span className={`text-[9px] font-black px-2 py-1 rounded-md ${done === 6 ? 'bg-teal-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
          {done}/6 Fournis
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">Contrôle visuel haute résolution selon le protocole CEMAC.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SLOTS.map((label, i) => (
          <div key={label}>
            <div className={`relative rounded-xl overflow-hidden h-24 bg-slate-100 border-2 ${valid[i] ? 'border-teal-400' : i === 4 ? 'border-amber-300' : 'border-transparent'}`}>
              <button type="button" onClick={() => setPreview({ url: photos[i] || img, title: label })} className="w-full h-full block" title="Voir en grand">
                <img src={photos[i] || img} alt={label} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
              </button>
              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {i + 1}. {label}
              </span>
              {i === 4 && !valid[i] && (
                <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-md text-center">
                  Signalé par bailleur — Léger contre-jour
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5 px-0.5">
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-500 cursor-pointer">
                <input type="checkbox" checked={valid[i]} onChange={() => setValid(s => s.map((x, j) => j === i ? !x : x))}
                  className="accent-teal-600 w-3 h-3" />
                Validée
              </label>
              <div className="flex gap-1">
                {valid[i] && <CheckCircle2 size={12} className="text-teal-600" />}
                <button className="text-slate-300 hover:text-red-500"><X size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && <FilePreview url={preview.url} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
}
