import React from 'react';
import { Phone, MessageCircle, UserCheck, ShieldCheck, FileText, Thermometer, Star } from 'lucide-react';
import { getVehicleImage } from '../../utils/carImages';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const initialsOf = name => (name || 'C').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* Parties prenantes du dossier : locataire / véhicule / propriétaire. */
export default function PartiesPanel({ booking: b, vehicle: v }) {
  const img = v ? (v.image_url || getVehicleImage(v.category)) : getVehicleImage('default');
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm">Parties Prenantes au Dossier</h3>
        <span className="text-[9px] font-bold text-slate-400">3 Profils audités &amp; synchronisés</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Locataire */}
        <div className="border border-slate-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-11 h-11 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-black">
                {initialsOf(b.client_name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="text-[13px] font-black text-slate-900">{b.client_name || 'Client'}</div>
              <div className="text-[9px] font-bold text-teal-600 uppercase tracking-wide">Locataire (Vérifié)</div>
            </div>
            <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-slate-700">
              <Star size={10} className="text-amber-400 fill-amber-400" /> 4,95 <span className="text-slate-400 font-medium">(12 trajets)</span>
            </span>
          </div>
          <div className="space-y-1.5 text-[10px] text-slate-500 mb-3">
            <div className="flex items-center gap-1.5"><Phone size={10} className="text-slate-400" /> +237 6·· ·· ·· 90</div>
            <div className="flex items-center gap-1.5"><UserCheck size={10} className="text-slate-400" /> CNI biométrique · Exp. 2028</div>
            <div className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-slate-400" /> Permis catégorie B — Confirmé</div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-teal-700 border border-teal-200 bg-teal-50 hover:bg-teal-100 py-2 rounded-xl transition-colors">
              <Phone size={11} /> Appeler
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 py-2 rounded-xl transition-colors">
              <MessageCircle size={11} /> WhatsApp
            </button>
          </div>
        </div>

        {/* Véhicule */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <div className="relative h-24">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <span className="absolute top-2 right-2 bg-teal-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md">TRANSIT AWD</span>
          </div>
          <div className="p-3.5">
            <div className="text-[12px] font-black text-slate-900">{b.vehicle_name || `${v?.brand || ''} ${v?.model || ''}`}</div>
            <div className="text-[9px] text-slate-400 mb-3">{v?.plate || '—'} · {v?.category || 'SUV'} · {v?.fuel || 'Essence'}</div>
            <div className="grid grid-cols-2 gap-2 text-[9px] mb-3">
              <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400 block">Compteur</span><strong className="text-slate-800">{fmt(v?.mileage || 42350)} km</strong></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400 block">Boîte GPS</span><strong className="text-teal-700">Active (Bat. 98%)</strong></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-black text-slate-600 border border-slate-200 py-1.5 rounded-lg hover:border-teal-400 transition-colors"><FileText size={10} /> Fiche</button>
              <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-black text-slate-600 border border-slate-200 py-1.5 rounded-lg hover:border-teal-400 transition-colors"><Thermometer size={10} /> Télémétrie</button>
            </div>
          </div>
        </div>

        {/* Propriétaire */}
        <div className="border border-slate-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center text-white text-sm font-black">
              {initialsOf(v?.owner_name)}
            </div>
            <div>
              <div className="text-[13px] font-black text-slate-900">{v?.owner_name || 'Propriétaire'}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Partenaire Pro Certifié</div>
            </div>
            <span className="ml-auto text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Niveau signé</span>
          </div>
          <div className="space-y-1.5 text-[10px] text-slate-500 mb-3">
            <div className="flex items-center gap-1.5"><Phone size={10} className="text-slate-400" /> MTN MoMo : 6·· ·· ·· 90</div>
            <div className="flex items-center gap-1.5"><ShieldCheck size={10} className="text-slate-400" /> Rib UBA ···· 0033 — Vérifié</div>
            <div className="flex items-center gap-1.5"><UserCheck size={10} className="text-slate-400" /> Délai acceptation moy. : 18 minutes</div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-teal-700 border border-teal-200 bg-teal-50 hover:bg-teal-100 py-2 rounded-xl transition-colors">
              <Phone size={11} /> Appeler
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-600 border border-slate-200 py-2 rounded-xl hover:border-teal-400 transition-colors">
              <MessageCircle size={11} /> Alerter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
