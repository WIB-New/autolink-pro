import React from 'react';
import { X, ExternalLink, FileText, Download } from 'lucide-react';
import { isImage } from '../utils/media';

/* Frame de prévisualisation générique : le navigateur tente de rendre le
   fichier (PDF, txt, html…). Si le format n'est pas lisible en ligne,
   l'utilisateur voit toujours le bouton Télécharger. */
function PreviewFrame({ url, title }) {
  return (
    <div className="w-full h-[75vh] relative">
      <iframe src={url} title={title || 'Aperçu'} className="w-full h-full border-0" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        <a href={url} download
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-[10px] font-black px-3.5 py-2 rounded-xl shadow-lg transition-colors backdrop-blur">
          <Download size={11} /> Télécharger
        </a>
      </div>
    </div>
  );
}

/* Lightbox de prévisualisation — image inline, PDF en iframe, reste sur la page. */
export default function FilePreview({ url, title, onClose }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <h3 className="font-black text-slate-900 text-sm truncate flex items-center gap-2">
            <FileText size={14} className="text-teal-600 shrink-0" /> {title || 'Aperçu du document'}
          </h3>
          <div className="flex items-center gap-1.5">
            <a href={url} target="_blank" rel="noopener noreferrer" title="Ouvrir dans un nouvel onglet"
              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <ExternalLink size={15} />
            </a>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center min-h-[50vh]">
          {isImage(url) ? (
            <img src={url} alt={title || 'Document'} className="max-w-full max-h-[75vh] object-contain" />
          ) : (
            <PreviewFrame url={url} title={title} />
          )}
        </div>
      </div>
    </div>
  );
}
