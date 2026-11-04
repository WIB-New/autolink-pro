import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DesignShell from './DesignShell';
import { bookingsAPI, vehiclesAPI, walletAPI } from '../services/api';

const fmt = (value) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value) || 0);
const dateLabel = (date, time) => `${new Date(`${date}T${time}`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}, ${time}`;
const apiError = (error) => {
  const data = error.response?.data;
  return data?.detail || (data && Object.values(data).flat().join(' ')) || 'La demande a échoué. Veuillez réessayer.';
};
const Icon = ({ children }) => <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{children}</span>;
const panel = 'bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md';
const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30';

export default function C2TunnelEtape2PaiementSoldeSuffisant() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.toString();
  const vid = params.get('vehicle');
  const start = params.get('start');
  const end = params.get('end');
  const stime = params.get('stime') || '08:30';
  const etime = params.get('etime') || '08:30';
  const payload = useMemo(() => ({
    vehicle: Number(vid), start_date: start, end_date: end,
    start_time: stime, end_time: etime,
    driver_type: params.get('driver') === '1' || params.get('driver') === 'internal' ? 'internal' : 'none',
    delivery_requested: params.get('delivery') === '1',
  }), [vid, start, end, stime, etime, params]);
  const hours = (new Date(`${end}T${etime}`) - new Date(`${start}T${stime}`)) / 36e5;
  const valid = Boolean(vid && start && end && Number.isFinite(hours) && hours >= 0);
  const [vehicle, setVehicle] = useState(null);
  const [quote, setQuote] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [rechargeMessage, setRechargeMessage] = useState('');
  const [rechargeError, setRechargeError] = useState('');
  const paying = useRef(false);
  const rechargeRequest = useRef(false);
  const paymentButton = useRef(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const refreshQuote = useCallback(async () => {
    if (!valid) return null;
    const { data } = await bookingsAPI.quote(payload);
    if (alive.current) setQuote(data);
    return data;
  }, [payload, valid]);

  useEffect(() => {
    let active = true;
    setQuote(null); setVehicle(null); setErr(''); setAccepted(false); setAuthorized(false);
    if (!valid) return undefined;
    Promise.all([vehiclesAPI.detail(vid), bookingsAPI.quote(payload)])
      .then(([v, q]) => { if (active) { setVehicle(v.data); setQuote(q.data); } })
      .catch((error) => { if (active) setErr(apiError(error)); });
    return () => { active = false; };
  }, [vid, payload, valid]);

  useEffect(() => {
    if (!rechargeOpen) return undefined;
    let active = true;
    const check = async () => {
      try {
        const data = await refreshQuote();
        if (active && data && Number(data.shortfall) === 0) {
          setRechargeOpen(false);
          setRechargeMessage('Votre portefeuille couvre maintenant la réservation et la caution. Vous pouvez confirmer le paiement.');
          requestAnimationFrame(() => {
            paymentButton.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            paymentButton.current?.focus();
          });
        }
      } catch (error) {
        if (active) setRechargeError(apiError(error));
      }
    };
    const interval = setInterval(check, 5000);
    window.addEventListener('focus', check);
    return () => { active = false; clearInterval(interval); window.removeEventListener('focus', check); };
  }, [rechargeOpen, refreshQuote]);

  const recharge = async (event) => {
    event.preventDefault();
    if (rechargeRequest.current) return;
    if (!Number.isInteger(Number(amount)) || Number(amount) < 500) {
      setRechargeError('Indiquez un montant entier d’au moins 500 FCFA.'); return;
    }
    if (!phone.replace(/\D/g, '')) { setRechargeError('Indiquez le numéro Mobile Money à débiter.'); return; }
    rechargeRequest.current = true; setRecharging(true); setRechargeError('');
    try {
      const { data } = await walletAPI.topup(Number(amount), method, phone.replace(/\D/g, ''));
      setRechargeMessage(data.status === 'completed' ? 'Recharge créditée.' : 'Demande envoyée. Validez sur votre téléphone ; le solde sera actualisé après confirmation.');
      const q = await refreshQuote();
      if (q && Number(q.shortfall) === 0) {
        setRechargeOpen(false);
        requestAnimationFrame(() => { paymentButton.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); paymentButton.current?.focus(); });
      }
    } catch (error) {
      setRechargeError(apiError(error));
    } finally { rechargeRequest.current = false; setRecharging(false); }
  };

  const pay = async () => {
    if (paying.current || !quote || !accepted || !authorized || Number(quote.shortfall) > 0) return;
    paying.current = true; setBusy(true); setErr('');
    try {
      const latest = await refreshQuote();
      if (Number(latest.shortfall) > 0) throw new Error('Le solde a changé. Rechargez votre portefeuille avant de payer.');
      const { data } = await bookingsAPI.create({
        ...payload, payment_method: 'wallet', terms_accepted: accepted, debit_authorized: authorized,
        notes: localStorage.getItem('alp_booking_notes') || '',
        pickup_address: `${vehicle.city} - Prise en charge à convenir`,
      });
      localStorage.removeItem('alp_booking_notes');
      navigate(`/client/booking/confirmation?booking=${data.id}`);
    } catch (error) {
      setErr(error.response ? apiError(error) : error.message);
      refreshQuote().catch(() => {});
    } finally { paying.current = false; if (alive.current) setBusy(false); }
  };

  const total = Number(quote?.subtotal || 0);
  const deposit = Number(quote?.deposit_amount || 0);
  const required = Number(quote?.required_balance || 0);
  const enough = quote && Number(quote.shortfall) === 0;
  const name = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : '';
  const recap = `/client/booking/recap?${query}`;

  return <DesignShell role="client">
    <div className="pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 pb-16">
      {/* Progress Stepper Header */}
      <div className="bg-surface-container-low px-4 py-3 mb-8">
        {/* Progress Steps */}
        <nav aria-label="Progression du tunnel de réservation" className="flex items-center gap-2 flex-wrap font-label-sm text-label-sm">
          {/* Step 1: Completed */}
          <Link to={recap} className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface">1 Récapitulatif &amp; Documents</Link>
          <Icon>chevron_right</Icon>
          {/* Step 2: Active */}
          <span aria-current="step" className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold">2 Paiement Portefeuille</span>
          <Icon>chevron_right</Icon>
          {/* Step 3: Upcoming */}
          <span className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant">3 Confirmation &amp; Check-in</span>
        </nav>
        {/* Trust Mini Pill */}
      </div>
      {!valid && <p role="alert" className="p-4 rounded-xl bg-error-container text-on-error-container">Les dates ou le véhicule sont manquants ou invalides. <Link to="/client/search" className="underline">Retourner au catalogue</Link></p>}
      {err && <p role="alert" className="mb-4 p-4 rounded-xl bg-error-container text-on-error-container">{err}</p>}
      {valid && !quote && !err && <p role="status">Chargement du devis et du portefeuille…</p>}
      {/* Main Booking Funnel Content */}
      {quote && vehicle && <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* LEFT COLUMN: Wallet Debit & Escrow (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
          {/* Payment Header */}
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Paiement sécurisé par Portefeuille AutoLink</h1>
          {/* Balance Status Card (Solde Suffisant) */}
          <section className={panel}>
            {/* Positive Eligibility Indicator */}
            <p role="status" className={`p-4 rounded-lg font-bold flex items-center gap-2 ${enough ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}`}><Icon>{enough ? 'check_circle' : 'info'}</Icon>{enough ? 'Solde suffisant pour régler la réservation et bloquer la caution' : `Solde insuffisant : ${fmt(quote.shortfall)} FCFA à recharger`}</p>
            {/* Financial Flow Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[['account_balance_wallet', 'Solde actuel disponible', quote.balance], ['remove_circle_outline', 'Montant mobilisé (location + caution)', required], ['savings', 'Solde restant projeté', quote.remaining_balance]].map(([icon, label, value]) => <div key={icon} className="p-4 rounded-lg bg-surface-container-low"><span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm"><Icon>{icon}</Icon>{label}</span><p className="mt-2 font-bold text-headline-sm text-on-surface">{fmt(value)} <small className="text-label-sm">FCFA</small></p></div>)}
            </div>
            {!enough && <button type="button" className="px-4 py-3 bg-primary text-on-primary rounded-xl font-bold" onClick={() => { setAmount(String(Math.max(500, Math.ceil(Number(quote.shortfall))))); setRechargeError(''); setRechargeMessage(''); setRechargeOpen(true); }}>Recharger mon portefeuille</button>}
            {rechargeMessage && !rechargeOpen && <p role="status" className="text-primary">{rechargeMessage}</p>}
          </section>
          {/* Escrow / Deposit Management */}
          <section className={panel}>
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-2"><Icon>gavel</Icon>Gestion de la Caution sous Séquestre</h2>
            {/* Escrow Method Selector */}
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Mode de provisionnement du séquestre</span>
            <div className="p-4 rounded-lg border border-primary flex items-center justify-between"><span className="flex items-center gap-2"><Icon>account_balance_wallet</Icon>Portefeuille AutoLink lié</span><Icon>lock</Icon></div>
          </section>
          {/* Legal & Contract Acceptance */}
          <section className={panel}>
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-2"><Icon>verified</Icon>Engagements Contractuels</h2>
            {/* Checkbox 1 */}
            <div className="flex items-start gap-3"><input id="accept-terms" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-5 h-5 accent-primary"/><label htmlFor="accept-terms">J’accepte les </label><button type="button" onClick={() => setTermsOpen(true)} className="text-primary underline text-left">Conditions Générales de Location AutoLink Pro</button></div>
            {/* Checkbox 2 */}
            <label className="flex items-start gap-3"><input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-1 w-5 h-5 accent-primary"/><span>J’autorise le débit de <strong>{fmt(total)} FCFA</strong> pour la réservation et le blocage de <strong>{fmt(deposit)} FCFA</strong> de caution sur mon portefeuille, soit <strong>{fmt(required)} FCFA</strong> mobilisés au total.</span></label>
          </section>
          {/* Main Action CTA */}
          <button ref={paymentButton} type="button" disabled={!enough || !accepted || !authorized || busy} onClick={pay} className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Icon>lock</Icon>{busy ? 'Paiement en cours…' : `Confirmer et Payer ${fmt(total)} FCFA`}</button>
          {(!accepted || !authorized) && <p className="text-on-surface-variant text-label-sm">Cochez les deux engagements pour autoriser le paiement.</p>}
          {/* Return / Back link */}
          <Link to={recap} className="flex items-center gap-2 text-on-surface-variant hover:text-primary"><Icon>arrow_back</Icon>Revenir à l’étape 1 (Modifier les options de location)</Link>
        </div>
        {/* RIGHT COLUMN: Sticky Summary Card (4 cols) */}
        <aside className={`lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 ${panel}`}>
          {/* Card Header & Badge */}
          <h2 className="font-headline-sm text-headline-sm">Récapitulatif financier</h2>
          {/* Vehicle Thumbnail Card */}
          <img src={vehicle.photos?.[0]?.image || vehicle.image_url || ''} alt={name} className="w-full h-40 rounded-lg object-cover"/>
          <div><p className="font-bold">{name}</p><p className="text-on-surface-variant text-label-sm">{vehicle.category} · {vehicle.year} · {vehicle.city} · {vehicle.plate}</p></div>
          {/* Rental Window Details */}
          <div className="bg-surface-container-low p-4 rounded-lg space-y-2 text-label-sm">
            <p className="flex justify-between gap-2"><span>Prise en charge</span><strong>{dateLabel(start, stime)}</strong></p>
            <p className="flex justify-between gap-2"><span>Restitution</span><strong>{dateLabel(end, etime)}</strong></p>
            <p>{vehicle.city} — Prise en charge à convenir</p><p className="text-primary">Durée : {hours} heures · {quote.days} jour(s) facturé(s)</p>
          </div>
          {/* Itemized Breakdown */}
          <div className="space-y-3 text-label-md">
            <p className="flex justify-between gap-2"><span>Location ({fmt(quote.daily_rate)} F × {quote.days} j)</span><strong>{fmt(quote.rental_amount)} FCFA</strong></p>
            {Number(quote.driver_fee) > 0 && <p className="flex justify-between gap-2"><span>Chauffeur AutoLink ({quote.days} j)</span><strong>{fmt(quote.driver_fee)} FCFA</strong></p>}
            {Number(quote.delivery_fee) > 0 && <p className="flex justify-between gap-2"><span>Livraison du véhicule</span><strong>{fmt(quote.delivery_fee)} FCFA</strong></p>}
            <p className="flex justify-between gap-2"><span>Assurance &amp; frais de service</span><strong className="text-primary">Inclus</strong></p>
            {/* Divider via bg container */}<div className="h-px bg-surface-container-high"/>
            {/* Subtotal */}<p className="flex justify-between gap-2 font-bold"><span>Sous-total à débiter</span><span className="text-primary">{fmt(total)} FCFA</span></p>
            {/* Caution Escrow Reminder */}<p className="flex justify-between gap-2 p-3 rounded-lg bg-surface-container-low"><span>Caution bloquée</span><strong>{fmt(deposit)} FCFA</strong></p>
          </div>
        </aside>
      </div>}
      {termsOpen && <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="rental-terms-title"><section className="bg-surface-container-lowest text-on-surface rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
        <h2 id="rental-terms-title" className="font-bold text-headline-md">Conditions Générales de Location — version location-v1</h2>
        <p>La réservation porte sur le véhicule, les dates, les heures et les options présentés dans le récapitulatif. Vérifiez ces informations avant de payer.</p>
        <h3 className="font-bold">Durée et prix</h3><p>Toute tranche de 24 heures commencée est facturée comme une journée, avec un minimum d’un jour. Le chauffeur AutoLink sélectionné coûte 10 000 FCFA par jour facturé. La livraison sélectionnée coûte 5 000 FCFA par réservation. L’assurance et les frais de service affichés comme inclus ne sont pas facturés en supplément.</p>
        <h3 className="font-bold">Paiement et caution</h3><p>Le portefeuille doit couvrir la location, les options et la caution. La location est débitée et la caution est bloquée séparément. Le blocage de la caution réduit votre solde disponible ; il ne constitue pas une seconde facturation de la location. Tout remboursement ou traitement de la caution dépend du suivi de la réservation et des éventuels litiges.</p>
        <h3 className="font-bold">Remise et restitution</h3><p>Présentez une pièce d’identité et, si vous conduisez, un permis valide. Le conducteur doit être habilité et respecter le code de la route. Signalez les dommages et incidents à AutoLink. La prise en charge et la restitution donnent lieu à une vérification du véhicule.</p>
        <h3 className="font-bold">Modification, annulation et assistance</h3><p>Effectuez les demandes de modification, d’annulation ou de litige depuis votre réservation. Leur résultat et les éventuels remboursements sont enregistrés dans votre dossier. Les instructions de prise en charge sont enregistrées avec la réservation et accessibles aux intervenants autorisés. Contactez l’assistance depuis votre espace client en cas de difficulté.</p>
        <button type="button" onClick={() => setTermsOpen(false)} className="px-4 py-2 bg-primary text-on-primary rounded-lg">Fermer</button>
      </section></div>}
      {rechargeOpen && <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="recharge-title"><form onSubmit={recharge} className="bg-surface-container-lowest text-on-surface rounded-xl p-6 max-w-lg w-full space-y-4">
        <h2 id="recharge-title" className="font-bold text-headline-md">Recharger mon portefeuille</h2>
        <p>Montant manquant pour la réservation et la caution : <strong>{fmt(quote?.shortfall)} FCFA</strong>.</p>
        <label className="block">Moyen de recharge<select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}><option value="mtn">MTN MoMo</option><option value="orange">Orange Money</option></select></label>
        <label className="block">Numéro Mobile Money<input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass}/></label>
        <label className="block">Montant (FCFA)<input type="number" required min="500" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass}/></label>
        {rechargeError && <p role="alert" className="text-error">{rechargeError}</p>}
        {rechargeMessage && <p role="status" className="text-primary">{rechargeMessage}</p>}
        <div className="flex gap-3"><button type="button" onClick={() => setRechargeOpen(false)} className="px-4 py-2 rounded-lg bg-surface-container">Fermer</button><button type="submit" disabled={recharging} className="px-4 py-2 rounded-lg bg-primary text-on-primary disabled:opacity-50">{recharging ? 'Envoi…' : 'Recharger'}</button></div>
      </form></div>}
    </div>
  </DesignShell>;
}
