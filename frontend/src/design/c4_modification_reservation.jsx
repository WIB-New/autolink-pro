import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DesignPage from './DesignPage';
import useApiData from '../utils/useApiData';
import { bookingsAPI } from '../services/api';

const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const dmy = (d) => (d ? new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: 'numeric', month: 'short', year: 'numeric' }) : '');


const HTML = `<div class="w-full max-w-6xl mx-auto py-8 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
<div class="flex flex-col">
<div class="mb-6">
<h1 class="font-headline-xl text-headline-xl text-on-surface">Modifier la réservation</h1>
<p class="text-body-md text-body-md text-on-surface-variant">Mettez à jour les détails de votre réservation.</p>
</div>

<div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
<div class="mb-6 p-4 bg-surface-container rounded-lg">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-primary text-[24px]">directions_car</span>
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Toyota RAV4 AWD Hybrid 2022</h2>
<p class="text-body-sm text-body-sm text-on-surface-variant">Réf. #ALP-2025-DLA-8924</p>
</div>
</div>
<div class="grid grid-cols-2 gap-4 text-sm text-on-surface-variant">
<div><span class="block">Date actuelle :</span><span class="font-label-md text-label-md text-on-surface">29 Oct 2025 08:30</span></div>
<div><span class="block">Lieu départ :</span><span class="font-label-md text-label-md text-on-surface">Douala - Hub Akwa</span></div>
<div><span class="block">Lieu arrivée :</span><span class="font-label-md text-label-md text-on-surface">Aéroport DLA</span></div>
</div>
</div>

<form class="space-y-6">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Nouvelle date de départ</label>
<input id="edit-start" type="datetime-local" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" value="2025-10-29T08:30" />
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Nouvelle date de fin</label>
<input id="edit-end" type="datetime-local" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" value="2025-10-30T08:30" />
</div>
</div>

<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Lieu de prise en charge</label>
<input id="edit-pickup" type="text" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Douala - Bonanjo, Rue 123" value="Douala - Hub Akwa" />
</div>

<div>
<label class="block font-label-md text-label-md text-on-surface mb-2">Lieu de restitution</label>
<input id="edit-dropoff" type="text" class="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Aéroport International de Douala" value="Aéroport DLA" />
<label class="flex items-center gap-3 mt-4 cursor-pointer">
<input id="edit-driver" type="checkbox" class="w-5 h-5 accent-[#00a86b]" />
<span class="font-label-md text-label-md text-on-surface">Avec chauffeur AutoLink (+10 000 FCFA / jour)</span>
</label>
</div>

<div class="p-4 rounded-xl bg-tertiary-fixed/10 text-tertiary text-body-sm text-body-sm">
<div class="flex items-start gap-2">
<span class="material-symbols-outlined text-[20px]">info</span>
<p>Les modifications de date et de lieu sont soumises à validation par le propriétaire. Vous recevrez une notification une fois la modification acceptée.</p>
</div>
</div>

<div class="flex gap-4 pt-4">
<button type="button" class="flex-1 py-3 px-6 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-sm">
Enregistrer les modifications
</button>
<button type="button" class="flex-1 py-3 px-6 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors">
Annuler
</button>
</div>
</form>
</div>
</div>
<aside class="mt-6 lg:mt-0 lg:sticky lg:top-24 h-fit p-5 rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/30 flex flex-col gap-3">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Récapitulatif de la modification</h3>
<div class="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span>Durée</span><strong class="text-on-surface" id="p-days">—</strong></div>
<div class="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span>Actuel</span><strong class="text-on-surface" id="p-old">—</strong></div>
<div class="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span>Nouveau</span><strong class="text-on-surface" id="p-new">—</strong></div>
<div id="p-delta" class="p-3 rounded-lg font-label-md font-bold text-center bg-surface-container text-on-surface-variant">—</div>
<p class="font-body-sm text-body-sm text-[11px] text-on-surface-variant leading-snug" id="p-note">Caution inchangée. La modification s'applique après validation du propriétaire ; refus = ancienne réservation conservée.</p>
</aside>
</div>`;

const LINKS = {
  'Annuler': '/client/bookings',
};

export default function C4ModificationReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: b } = useApiData(() => bookingsAPI.detail(id), [id]);
  const [confirm, setConfirm] = useState(null); // {days,total,delta,prevExtra,net,saving,done,err}
  const fr = (x) => `${Math.round(Number(x) || 0).toLocaleString('fr-FR')} FCFA`;
  const submitEdit = () => {
    const v = (eid) => document.getElementById(eid)?.value || '';
    setConfirm((d) => ({ ...d, saving: true, err: '' }));
    bookingsAPI.update(id, {
      ...(v('edit-start') ? { start_date: v('edit-start').slice(0, 10), start_time: v('edit-start').slice(11, 16) } : {}),
      ...(v('edit-end') ? { end_date: v('edit-end').slice(0, 10), end_time: v('edit-end').slice(11, 16) } : {}),
      pickup_address: v('edit-pickup'),
      dropoff_address: v('edit-dropoff'),
      driver_type: document.getElementById('edit-driver')?.checked ? 'internal' : 'none',
    })
      .then(() => setConfirm((d) => ({ ...d, saving: false, done: true })))
      .catch((err) => setConfirm((d) => ({ ...d, saving: false, err: [err?.response?.data?.detail, err?.response?.data?.amount, err?.response?.data?.balance].flat().filter(Boolean)[0] || 'La modification a échoué.' })));
  };
  useEffect(() => {
    if (!b) return undefined;
    const fr = (x) => `${Math.round(x).toLocaleString('fr-FR')} F`;
    const set = (i, v) => { const el = document.getElementById(i); if (el) el.textContent = v; };
    const upd = () => {
      const s = document.getElementById('edit-start')?.value;
      const e = document.getElementById('edit-end')?.value;
      const drv = document.getElementById('edit-driver')?.checked;
      if (!s || !e) return;
      const days = Math.max(1, Math.ceil((new Date(e) - new Date(s)) / 36e5 / 24));
      const total = Number(b.daily_rate || 0) * days + (drv ? 10000 * days : 0) + Number(b.delivery_fee || 0);
      const delta = total - Number(b.subtotal || 0);
      set('p-days', `${days} jour(s)`);
      set('p-old', fr(b.subtotal));
      set('p-new', fr(total));
      const dEl = document.getElementById('p-delta');
      if (dEl) {
        dEl.textContent = delta > 0 ? `+${fr(delta)} à régler (débit immédiat)` : delta < 0 ? `−${fr(-delta)} remboursés après validation` : 'Aucun écart de prix';
        dEl.className = `p-3 rounded-lg font-label-md font-bold text-center ${delta > 0 ? 'bg-error-container text-on-error-container' : delta < 0 ? 'bg-primary-container/40 text-primary' : 'bg-surface-container text-on-surface-variant'}`;
      }
      set('p-note', `Caution ${fr(b.deposit_amount || 0)} — inchangée. La modification s'applique après validation du propriétaire ; refus = ancienne réservation conservée.`);
    };
    const t = setInterval(upd, 800);
    upd();
    return () => clearInterval(t);
  }, [b]);

  useEffect(() => {
    if (!b) return undefined;
    const setV = (eid, v) => { const el = document.getElementById(eid); if (el && !el.dataset.filled) { el.dataset.filled = '1'; el.value = v; } };
    setV('edit-start', `${b.start_date}T${(b.start_time || '08:30').slice(0, 5)}`);
    setV('edit-end', `${b.end_date}T${(b.end_time || '08:30').slice(0, 5)}`);
    setV('edit-pickup', b.pickup_address || '');
    setV('edit-dropoff', b.dropoff_address || b.pickup_address || '');
    const drv = document.getElementById('edit-driver');
    if (drv && !drv.dataset.filled) { drv.dataset.filled = '1'; drv.checked = b.driver_type === 'internal'; }
    const click = (e) => {
      const el = e.target.closest('button, a');
      if (!el || !el.textContent.includes('Enregistrer les modifications')) return;
      e.preventDefault();
      const v = (eid) => document.getElementById(eid)?.value || '';
      // Recalcule le delta pour la confirmation explicite
      const s = v('edit-start'), en = v('edit-end');
      const drv = document.getElementById('edit-driver')?.checked;
      const days = Math.max(1, Math.ceil((new Date(en) - new Date(s)) / 36e5 / 24));
      const total = Number(b.daily_rate || 0) * days + (drv ? 10000 * days : 0) + Number(b.delivery_fee || 0);
      const delta = total - Number(b.subtotal || 0);
      const prevExtra = b.modification?.delta_paid ? Number(b.modification.delta || 0) : 0;
      const net = Math.max(0, delta) - prevExtra;
      setConfirm({ days, total, delta, prevExtra, net, drv, saving: false, done: false, err: '' });
    };
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, [b, id, navigate]);

  const html = useMemo(() => {
    if (!b) return HTML;
    return HTML
      .replace(/Toyota RAV4 AWD Hybrid 2022/g, esc(b.vehicle_name || 'Véhicule'))
      .replace('#ALP-2025-DLA-8924', `#${esc(b.reference || `BK-${String(b.id).padStart(4, '0')}`)}`)
      .replace('29 Oct 2025 08:30', `${dmy(b.start_date)} ${(b.start_time || '').slice(0, 5)} → ${dmy(b.end_date)} ${(b.end_time || '').slice(0, 5)}`)
      .replace('Douala - Hub Akwa', esc(b.pickup_address || b.vehicle_city || ''))
      .replace(/value="Douala - Hub Akwa"/, `value="${esc(b.pickup_address || b.vehicle_city || '')}"`)
      .replace(/value="Aéroport DLA"/, `value="${esc(b.dropoff_address || b.pickup_address || b.vehicle_city || '')}"`)
      .replace('Aéroport DLA', esc(b.dropoff_address || b.pickup_address || b.vehicle_city || ''));
  }, [b]);

  const deltaText = confirm && (confirm.net > 0
    ? `À débiter maintenant de votre portefeuille AutoLink : ${fr(confirm.net)}. Si le propriétaire refuse, ce montant vous sera recrédité.`
    : confirm.net < 0
      ? `À recréditer maintenant : ${fr(-confirm.net)} — votre nouvelle proposition remplace la précédente, dont le supplément déjà prélevé est annulé.`
      : confirm.delta < 0
        ? `À rembourser sur votre portefeuille AutoLink après validation du propriétaire : ${fr(-confirm.delta)}.`
        : 'Aucun écart de prix — modification sans impact financier.');
  return (
    <>
      <DesignPage html={html} links={LINKS} role="client" />
      {confirm && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget && !confirm.saving) setConfirm(null); }}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl">
            {confirm.done ? (
              <>
                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Modification envoyée</h2></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Votre demande a été transmise au propriétaire pour validation. Votre réservation actuelle reste inchangée tant qu'il n'a pas répondu — en cas de refus, elle reste d'actualité.</p>
                <button type="button" onClick={() => { setConfirm(null); navigate(`/client/bookings/${id}`); }}
                  className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold">Voir ma réservation</button>
              </>
            ) : (
              <>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Confirmer la modification ?</h2>
                <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm">
                  <div className="flex justify-between"><span className="text-on-surface-variant">Nouveau total</span><strong className="text-on-surface">{fr(confirm.total)}</strong></div>
                  <div className="text-[11px] text-on-surface-variant">{confirm.days} jour(s) × {fr(b.daily_rate)}{confirm.drv ? ` + chauffeur ${fr(10000 * confirm.days)}` : ''}{Number(b.delivery_fee) ? ` + livraison ${fr(b.delivery_fee)}` : ''}</div>
                  <div className="flex justify-between mt-1"><span className="text-on-surface-variant">Total actuel payé</span><strong>{fr(b.subtotal)}</strong></div>
                  <div className="flex justify-between"><span className="text-on-surface-variant">Écart</span><strong className={confirm.delta > 0 ? 'text-error' : confirm.delta < 0 ? 'text-primary' : ''}>{confirm.delta > 0 ? '+' : confirm.delta < 0 ? '−' : ''}{fr(Math.abs(confirm.delta))}</strong></div>
                  {confirm.prevExtra > 0 && (
                    <>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Supplément déjà prélevé</span><strong>−{fr(confirm.prevExtra)}</strong></div>
                      <div className="text-[11px] text-on-surface-variant">Montant déjà retenu sur votre portefeuille pour votre précédente demande de modification (non encore validée).</div>
                    </>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{deltaText}</p>
                <p className="font-body-sm text-body-sm text-[11px] text-on-surface-variant leading-snug">Votre réservation actuelle reste inchangée tant que le propriétaire n'a pas validé — en cas de refus, elle reste d'actualité.</p>
                {confirm.err && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{confirm.err}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirm(null)} disabled={confirm.saving}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Revenir à la modification</button>
                  <button type="button" onClick={submitEdit} disabled={confirm.saving}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{confirm.saving ? 'Envoi…' : 'Confirmer'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
