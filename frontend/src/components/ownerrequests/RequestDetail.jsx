import React, { useState } from 'react';
import { Phone, Mail, MapPin, StickyNote, UserCheck, CheckCircle2, AlertTriangle, Clock, Star, Send } from 'lucide-react';
import { STATUS, DRIVER_LABEL } from './RequestCard';
import { COMMISSION_LABEL, ownerNet } from '../../utils/commission';
import { bookingsAPI } from '../../services/api';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const Row = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2.5 text-[11px] text-slate-600">
    <Icon size={13} className="text-teal-600 shrink-0 mt-0.5" />
    <div className="min-w-0 break-words">{children}</div>
  </div>
);

/* Note propriétaire -> client, sur les locations terminées. */
function RateClient({ b, onDone }) {
  const [val, setVal] = useState(0);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!val) return;
    setSaving(true); setErr('');
    try {
      await bookingsAPI.rateClient(b.id, val, text);
      setVal(0); setText('');
      onDone?.();
    } catch (e) {
      setErr(e.response?.data?.detail || e.response?.data?.rating?.[0] || 'Notation impossible.');
    }
    setSaving(false);
  };

  return (
    <div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Évaluer le locataire</span>
      <div className="mt-2.5 space-y-2">
        {b.owner_rating ? (
          <>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} size={18} className={n <= b.owner_rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />)}
            </div>
            {b.owner_review && <p className="text-[11px] text-slate-500 italic">« {b.owner_review} »</p>}
          </>
        ) : (
          <>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setVal(n)} className="hover:scale-110 transition-transform">
                  <Star size={22} className={n <= val ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />
                </button>
              ))}
            </div>
            <textarea rows={2} value={text} onChange={e => setText(e.target.value)}
              placeholder="Ponctualité, état du véhicule, respect… (optionnel)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            {err && <p className="text-[10px] text-red-500 font-bold">{err}</p>}
            <button onClick={submit} disabled={saving || !val}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-40">
              <Send size={12} /> Publier la note
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* Panneau droit — dossier de la réservation, décomposition financière et
   seule action propriétaire autorisée par le backend : confirmer la restitution. */
export default function RequestDetail({ b, onComplete, busy, onRefresh }) {
  if (!b) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm sticky top-4">
      Sélectionnez une réservation pour consulter le dossier.
    </div>
  );

  const st = STATUS[b.status] || STATUS.pending;
  const net = ownerNet(b);
  const gross = Number(b.subtotal || 0);
  const commission = Number(b.commission_amount ?? gross - net);
  const started = new Date(b.start_date) <= new Date();
  const canComplete = ['confirmed', 'active'].includes(b.status) && started;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 sticky top-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-slate-400 tracking-widest">BK-{String(b.id).padStart(4, '0')}</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
        </div>
        <h3 className="font-black text-slate-900 text-lg">{b.client_name || 'Client'}</h3>
      </div>

      {/* Contact & logistique */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact &amp; remise du véhicule</span>
        {b.client_phone && <Row icon={Phone}><a href={`tel:${b.client_phone}`} className="font-bold hover:text-teal-600">{b.client_phone}</a></Row>}
        {b.client_email && <Row icon={Mail}>{b.client_email}</Row>}
        <Row icon={MapPin}>
          <strong>Départ :</strong> {b.pickup_address || 'non précisé'}<br />
          <strong>Retour :</strong> {b.dropoff_address || 'identique au départ'}
        </Row>
        <Row icon={UserCheck}>
          {DRIVER_LABEL[b.driver_type] || DRIVER_LABEL.none}
          {b.driver_type === 'internal' && b.driver_name && ` — ${b.driver_name}${b.driver_phone ? ` (${b.driver_phone})` : ''}`}
        </Row>
        {b.notes && <Row icon={StickyNote}>{b.notes}</Row>}
      </div>

      {b.status === 'disputed' && (
        <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-[11px] text-red-700">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div><strong>Litige ouvert par le client.</strong> {b.dispute_reason || ''} Les fonds restent bloqués jusqu'à l'arbitrage AutoLink.</div>
        </div>
      )}
      {b.status === 'pending' && (
        <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700">
          <Clock size={14} className="shrink-0 mt-0.5" />
          <div>Le client n'a pas encore finalisé son paiement. La réservation sera confirmée automatiquement dès réception.</div>
        </div>
      )}

      {/* Décomposition financière */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Décomposition financière</span>
        <div className="mt-2.5 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-slate-600"><span>Location ({fmt(b.daily_rate)} FCFA × {b.days || '—'} j)</span><strong>{fmt(gross)} FCFA</strong></div>
          {Number(b.discount_percent) > 0 && <div className="flex justify-between text-emerald-600"><span>Remise longue durée −{b.discount_percent} %</span><strong>incluse</strong></div>}
          <div className="flex justify-between text-slate-600"><span>Commission AutoLink ({COMMISSION_LABEL})</span><strong className="text-red-500">− {fmt(commission)} FCFA</strong></div>
          <div className="flex justify-between pt-2 border-t border-slate-100 font-black text-slate-900 text-sm"><span>Net propriétaire</span><span className="text-teal-600">{fmt(net)} FCFA</span></div>
          <p className="text-[10px] text-slate-400 pt-1">Versé sur votre solde à la clôture de la location.</p>
        </div>
      </div>

      {b.status === 'completed' && <RateClient key={b.id} b={b} onDone={onRefresh} />}

      {canComplete && (
        <button onClick={() => onComplete(b.id)} disabled={busy === b.id}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50">
          <CheckCircle2 size={15} /> Véhicule restitué — clôturer
        </button>
      )}
    </div>
  );
}
