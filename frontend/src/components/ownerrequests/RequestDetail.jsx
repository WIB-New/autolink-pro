import React from 'react';
import {
  ShieldCheck, Star, BadgeCheck, Clock, CreditCard, MapPin,
  Route, Gauge, CheckCircle2, XCircle, ExternalLink,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* Panneau droit — dossier locataire, itinéraire et décomposition financière. */
export default function RequestDetail({ b, onDecide, busy }) {
  if (!b) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm sticky top-4">
      Sélectionnez une demande pour consulter le dossier locataire.
    </div>
  );

  const net = Number(b.owner_amount || Number(b.total_price || b.subtotal || 0) * 0.5);
  const gross = Number(b.subtotal || b.total_price || 0);
  const commission = Number(b.commission_amount || gross - net);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 sticky top-4">
      {/* En-tête dossier */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-slate-400 tracking-widest">#BKM-{String(b.id).padStart(4, '0')}-DLA</span>
            <span className="text-[9px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md">{b.status === 'pending' ? 'Action requise' : 'Traité'}</span>
          </div>
          <h3 className="font-black text-slate-900 text-lg">Dossier {b.client_name || 'Client'}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Statut : {b.status === 'pending' ? 'En attente de validation propriétaire' : b.status}
          </p>
        </div>
        <button className="p-2 text-slate-400 hover:text-teal-600"><ExternalLink size={15} /></button>
      </div>

      {/* Profil & réputation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profil &amp; réputation AutoLink</span>
          <span className="text-[10px] text-slate-400">Membre depuis Jan 2023</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: BadgeCheck, t: 'Identité CNI', s: 'Vérifiée CEMAC' },
            { icon: ShieldCheck, t: 'Permis B', s: 'Validé (7 ans exp.)' },
            { icon: Clock, t: 'Retour ponctuel', s: "100 % à l'heure" },
            { icon: CreditCard, t: 'Paiement retour', s: '5,0 / 5,0' },
          ].map(r => (
            <div key={r.t} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
              <r.icon size={14} className="text-teal-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-black text-slate-800 truncate">{r.t}</div>
                <div className="text-[9px] text-slate-400 truncate">{r.s}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-slate-700">Serge M. (Hub Yaoundé)</span>
            <span className="flex text-amber-400 gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={9} className="fill-amber-400" />)}</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            « Locataire exemplaire. Véhicule rendu parfaitement propre, plein de carburant fait, et
            communication très fluide sur WhatsApp lors du retour. »
          </p>
        </div>
      </div>

      {/* Itinéraire */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Itinéraire déclaré &amp; utilisation</span>
        <div className="mt-2.5 space-y-2.5">
          <div className="flex gap-2.5 bg-slate-50 rounded-xl p-3">
            <Route size={14} className="text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <strong>Déplacement professionnel {b.city || 'Douala'}.</strong>{' '}
              {b.notes || 'Visite de chantier puis rendez-vous d\'affaires. Retour via l\'autoroute.'}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="flex-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2">
              <Gauge size={10} /> Chauffeur {b.driver_type === 'none' ? 'non requis' : 'dédié'}
            </span>
            <span className="flex-1 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 bg-slate-50 rounded-lg px-2.5 py-2">
              <MapPin size={10} /> Forfait 300 km/jour inclus
            </span>
          </div>
          <div className="h-20 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
            <span className="text-[10px] font-bold text-teal-700 flex items-center gap-1.5">
              <MapPin size={11} /> Axe {b.pickup_address?.split(',')[0] || 'Douala'} → {b.dropoff_address?.split(',')[0] || 'Retour hub'} (route bitumée)
            </span>
          </div>
        </div>
      </div>

      {/* Décomposition financière */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Décomposition financière propriétaire</span>
        <div className="mt-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-600"><span>Prix brut ({fmt(b.daily_rate)} FCFA × {b.days || '—'})</span><strong>{fmt(gross)} FCFA</strong></div>
          {Number(b.discount_percent) > 0 && <div className="flex justify-between text-emerald-600"><span>Remise longue durée −{b.discount_percent} %</span><strong>incluse</strong></div>}
          <div className="flex justify-between text-slate-600"><span>Commission AutoLink Pro</span><strong className="text-red-500">− {fmt(commission)} FCFA</strong></div>
          <div className="flex justify-between pt-2 border-t border-slate-100 font-black text-slate-900 text-sm"><span>Net garanti propriétaire</span><span className="text-teal-600">{fmt(net)} FCFA</span></div>
        </div>
      </div>

      {b.status === 'pending' && (
        <div className="space-y-2 pt-1">
          <button onClick={() => onDecide(b.id, 'confirmed')} disabled={busy === b.id}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50">
            <CheckCircle2 size={15} /> Valider et bloquer le calendrier
          </button>
          <button onClick={() => onDecide(b.id, 'cancelled')} disabled={busy === b.id}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-500 font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50">
            <XCircle size={13} /> Décliner la demande avec motif
          </button>
        </div>
      )}
    </div>
  );
}
