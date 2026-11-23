import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { mediaUrl } from '../../utils/media';
import FilePreview from '../FilePreview';

const POSITION_LABEL = { exterior: 'Extérieur', interior: 'Intérieur', other: 'Autre' };

/* Photos téléversées par le propriétaire — aperçu en grand au clic. */
export default function PhotoChecklist({ vehicle: v }) {
  const [preview, setPreview] = useState(null);
  const photos = v.photos || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <ImageIcon size={15} className="text-teal-600" /> Photos du véhicule
        </h3>
        <span className={`text-[9px] font-black px-2 py-1 rounded-md ${photos.length >= 6 ? 'bg-teal-600 text-white' : photos.length ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
          {photos.length} fourni{photos.length > 1 ? 's' : ''}{photos.length >= 6 ? ' — complet' : photos.length ? ' / 6 requis' : ''}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">Clichés transmis par le bailleur — clic pour ouvrir l'aperçu.</p>

      {photos.length === 0 ? (
        <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl p-4 text-center">Aucune photo téléversée pour ce véhicule.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.id || i} className="relative rounded-xl overflow-hidden h-24 bg-slate-100">
              <button type="button" onClick={() => setPreview({ url: mediaUrl(p.image), title: p.caption || `Photo ${i + 1}` })} className="w-full h-full block" title="Voir en grand">
                <img src={mediaUrl(p.image)} alt={p.caption || ''} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
              </button>
              <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                {i + 1}. {POSITION_LABEL[p.position] || p.position}
              </span>
            </div>
          ))}
        </div>
      )}

      {preview && <FilePreview url={preview.url} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
}
