import React, { useState } from 'react';
import { FileText, Eye, AlertTriangle, FileImage } from 'lucide-react';
import { mediaUrl, isImage } from '../../utils/media';
import FilePreview from '../FilePreview';

/* Documents réglementaires — aperçu en modale des fichiers téléversés. */
export default function DocsPanel({ vehicle: v }) {
  const [preview, setPreview] = useState(null);
  const docs = [
    { name: 'Carte Grise Camerounaise', url: mediaUrl(v.registration_doc),
      ref: `N° ${v.plate || '—'} · Titulaire ${v.owner_name || 'Propriétaire'}` },
    { name: "Attestation d'Assurance", url: mediaUrl(v.insurance_doc),
      ref: `Échéance ${v.insurance_expiry || '—'} · ${v.get_insurance_type_display || v.insurance_type || '—'}` },
    { name: 'Certificat de Visite Technique', url: mediaUrl(v.technical_control_doc),
      ref: `Visite du ${v.technical_control_date || '—'} · ${v.city || ''}` },
  ];
  const provided = docs.filter(d => d.url).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <FileText size={15} className="text-teal-600" /> Documents Réglementaires
        </h3>
        <span className={`text-[9px] font-black px-2 py-1 rounded-md ${provided === 3 ? 'bg-teal-50 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
          {provided} / 3 Fournis
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">Pièces téléversées par le propriétaire — clic pour ouvrir l'aperçu.</p>

      <div className="space-y-2.5">
        {docs.map(d => (
          <div key={d.name} className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${d.url ? 'border-slate-100' : 'border-dashed border-slate-200'}`}>
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${d.url ? 'bg-teal-50' : 'bg-slate-100'}`}>
              {d.url && isImage(d.url)
                ? <FileImage size={15} className="text-teal-600" />
                : <FileText size={15} className={d.url ? 'text-teal-600' : 'text-slate-400'} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-black text-slate-800 flex items-center gap-2">
                {d.name}
                {d.url
                  ? <span className="bg-teal-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">Fourni</span>
                  : <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><AlertTriangle size={8} /> Manquant</span>}
              </div>
              <div className="text-[9px] text-slate-400 truncate">{d.ref}</div>
            </div>
            {d.url && (
              <button onClick={() => setPreview({ url: d.url, title: d.name })}
                className="flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors">
                <Eye size={10} /> {isImage(d.url) ? 'Aperçu image' : 'Aperçu'}
              </button>
            )}
          </div>
        ))}
      </div>

      {preview && <FilePreview url={preview.url} title={preview.title} onClose={() => setPreview(null)} />}
    </div>
  );
}
