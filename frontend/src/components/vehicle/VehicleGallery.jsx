import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryFor } from '../../utils/vehicleDetails';

/* Mosaïque photos de la fiche véhicule : grande image + flèches + 4 vignettes */
export default function VehicleGallery({ vehicle }) {
  const photos = galleryFor(vehicle);
  const [idx, setIdx] = useState(0);
  const main = photos[Math.min(idx, photos.length - 1)];
  const cur = Math.min(idx, photos.length - 1);
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-3">
      {/* Photo principale */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-72 lg:h-[400px] group">
        <img src={main} alt={vehicle.name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
        {photos.length > 1 && (
          <>
            <button aria-label="Photo précédente" onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={18} className="text-slate-700" />
            </button>
            <button aria-label="Photo suivante" onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} className="text-slate-700" />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/55 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
              {cur + 1}/{photos.length}
            </span>
          </>
        )}
        <button
          className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3.5 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 transition-colors">
          <Camera size={14} /> Voir les {photos.length} photos
        </button>
      </div>

      {/* Vignettes */}
      <div className="hidden lg:grid grid-cols-2 gap-3">
        {photos.slice(1, 5).map((p, i) => (
          <button key={p + i} onClick={() => setIdx(i + 1)}
            className={`relative rounded-xl overflow-hidden bg-slate-100 transition-all ${
              cur === i + 1 ? 'ring-2 ring-teal-500 ring-offset-2' : 'hover:opacity-90'
            }`}>
            <img src={p} alt={`${vehicle.name} — vue ${i + 2}`}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
          </button>
        ))}
      </div>
    </div>
  );
}
