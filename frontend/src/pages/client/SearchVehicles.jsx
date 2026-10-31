import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import DesignShell from '../../design/DesignShell';
import ListToolbar from '../../components/ListToolbar';
import Icon from '../../components/Icon';
import VehicleCard from '../../components/VehicleCard';
import TopUpModal from '../../components/TopUpModal';
import { RENTAL_TYPES, TIERS } from '../../utils/carImages';
import { vehicleImage, vehicleName, vehicleRate, TIER_BADGES } from '../../utils/vehicles';
import { vehiclesAPI, bookingsAPI, paymentsAPI, walletAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import useFavorites from '../../utils/useFavorites';
import { formatDate, formatNumber, uiText, vehicleLabel } from '../../i18n';

const MOCK_VEHICLES = [
  { id: 1, brand: 'Toyota', model: 'RAV4 AWD Hybrid', year: 2022, category: 'SUV', tier: 'Premium', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', driver: true, inspected: true, is_new: true, daily_rate: 45000, rating: 9.7, city: 'Douala — Akwa', status: 'approved', image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', km_included_per_day: 200, extra_km_rate: 150, deposit_amount: 150000 },
  { id: 2, brand: 'Porsche', model: 'Panamera', year: 2023, category: 'Berline', tier: 'Super Luxe', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', driver: true, inspected: true, is_new: true, daily_rate: 250000, rating: 9.8, city: 'Douala — Bonanjo', status: 'approved', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', km_included_per_day: 300, extra_km_rate: 600, deposit_amount: 800000 },
  { id: 3, brand: 'Toyota', model: 'Corolla', year: 2021, category: 'Berline', tier: 'Économique', seats: 5, fuel: 'Essence', gearbox: 'Manuelle', driver: true, inspected: true, is_new: false, daily_rate: 22000, rating: 9.2, city: 'Yaoundé — Bastos', status: 'approved', image_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', km_included_per_day: 200, extra_km_rate: 120, deposit_amount: 80000 },
  { id: 4, brand: 'Mercedes', model: 'Classe S 500', year: 2023, category: 'Berline', tier: 'Luxe', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', driver: true, inspected: true, is_new: true, daily_rate: 151200, rating: 9.8, city: 'Douala — Bonapriso', status: 'approved', image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', km_included_per_day: 250, extra_km_rate: 400, deposit_amount: 500000 },
  { id: 5, brand: 'Toyota', model: 'Land Cruiser Prado', year: 2022, category: 'SUV', tier: 'Premium', seats: 7, fuel: 'Diesel', gearbox: 'Automatique', driver: true, inspected: true, is_new: false, daily_rate: 75000, rating: 9.6, city: 'Douala — Bonabéri', status: 'approved', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', km_included_per_day: 300, extra_km_rate: 250, deposit_amount: 300000 },
  { id: 6, brand: 'BMW', model: 'X7', year: 2023, category: 'SUV', tier: 'Luxe', seats: 7, fuel: 'Essence', gearbox: 'Automatique', driver: true, inspected: true, is_new: false, daily_rate: 130000, rating: 9.6, city: 'Yaoundé — Nkolbisson', status: 'approved', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', km_included_per_day: 250, extra_km_rate: 350, deposit_amount: 450000 },
  { id: 7, brand: 'Dacia', model: 'Duster', year: 2021, category: 'SUV', tier: 'Économique', seats: 5, fuel: 'Diesel', gearbox: 'Manuelle', driver: true, inspected: true, is_new: false, daily_rate: 28000, rating: 8.8, city: 'Douala — Deïdo', status: 'approved', image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', km_included_per_day: 200, extra_km_rate: 100, deposit_amount: 100000 },
  { id: 8, brand: 'Kia', model: 'Sorento', year: 2021, category: 'SUV', tier: 'Intermédiaire', seats: 7, fuel: 'Essence', gearbox: 'Automatique', driver: true, inspected: true, is_new: false, daily_rate: 48000, rating: 9.0, city: 'Douala — Bonanjo', status: 'approved', image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', km_included_per_day: 250, extra_km_rate: 180, deposit_amount: 180000 },
];

const t = (text, options) => uiText('pages.client.SearchVehicles', text, options);

// Véhicule API → données utilisées par le tunnel de réservation
const mapApiVehicle = (v) => ({
  ...v,
  name: vehicleName(v),
  image: vehicleImage(v),
  price: vehicleRate(v),
  tier: v.tier || 'standard',
  kmIncluded: v.km_included_per_day || 200,
  kmRate: v.extra_km_rate || 150,
  deposit: Number(v.deposit_amount) || 0,
  city: v.city || 'Douala',
  rating: Number(v.rating) || 0,
  available: v.status === 'approved',
});

const PAYMENT_METHODS = [
  { value: 'wallet', label: 'Portefeuille AutoLink', detail: 'Débit immédiat de votre solde', tile: 'bg-primary text-on-primary', icon: 'account_balance_wallet' },
  { value: 'mtn', label: 'MTN Mobile Money', detail: 'Validation par push USSD', tile: 'bg-yellow-400 text-yellow-950', short: 'MoMo' },
  { value: 'orange', label: 'Orange Money', detail: 'Paiement Web Orange', tile: 'bg-orange-500 text-white', short: 'OM' },
  { value: 'stripe', label: 'Carte bancaire (Stripe)', detail: 'Visa / Mastercard 3-D Secure', tile: 'bg-secondary text-on-secondary', icon: 'credit_card' },
  { value: 'paypal', label: 'PayPal', detail: 'Compte PayPal', tile: 'bg-blue-700 text-white', short: 'PP' },
];

const DRIVER_OPTIONS = [
  { value: 'none', label: 'Sans chauffeur', sub: 'Vous conduisez vous-même', icon: 'person' },
  { value: 'internal', label: 'Chauffeur AutoLink', sub: 'Assigné automatiquement', icon: 'badge' },
  { value: 'owner', label: 'Chauffeur du propriétaire', sub: 'Fourni avec le véhicule', icon: 'key' },
];

const chargeDiscount = (days) => (days >= 30 ? 10 : days > 3 ? 5 : 0);
const chargedAmount = (rate, days) => Math.round(rate * days * (100 - chargeDiscount(days)) / 100);

const STEP_LABELS = ['Documents & options', 'Paiement', 'Confirmation'];

function BookingFunnel({ vehicle, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = new URLSearchParams(window.location.search);
  const requestedType = query.get('type');
  const requestedDays = Number(query.get('days')) || 4;
  const [step, setStep] = useState(1);
  const [rentalType, setRentalType] = useState(() => RENTAL_TYPES.find((item) => item.id === requestedType) || RENTAL_TYPES[2]);
  const [form, setForm] = useState({
    date: query.get('start') || '', time: '08:00', pickup: '', destination: '', days: Math.max(2, requestedDays),
    driverType: 'none', paymentMethod: 'wallet', phone: user?.phone || '',
  });
  const [configuredMethods, setConfiguredMethods] = useState(['wallet']);
  const [balance, setBalance] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [booking, setBooking] = useState(null);

  const loadBalance = () => walletAPI.get().then(({ data }) => setBalance(Number(data.balance))).catch(() => {});
  useEffect(() => {
    paymentsAPI.methods().then(({ data }) => {
      // booking_methods liste tous les moyens ; seuls le portefeuille et les moyens configurés sont activables
      setConfiguredMethods(['wallet', ...(data.configured_methods || [])]);
    }).catch(() => {});
    loadBalance();
  }, []);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Montant réellement débité par le serveur (Booking.save) : tarif × jours, remise -5 % dès 4 j, -10 % dès 30 j.
  const days = rentalType.id === 'long_haul' ? form.days : 1;
  const discount = chargeDiscount(days);
  const basePrice = chargedAmount(vehicle.price, days);
  const deposit = vehicle.deposit || 0;
  const total = basePrice + deposit;
  const isWallet = form.paymentMethod === 'wallet';
  const missing = isWallet && balance !== null ? Math.max(0, total - balance) : 0;
  const needsPhone = form.paymentMethod === 'mtn' || form.paymentMethod === 'orange';
  const endDate = () => {
    const end = new Date(form.date);
    end.setDate(end.getDate() + (rentalType.id === 'long_haul' ? form.days : 1));
    return end.toISOString().split('T')[0];
  };

  const submitBooking = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await bookingsAPI.create({
        vehicle: vehicle.id,
        start_date: form.date,
        end_date: endDate(),
        pickup_address: form.pickup,
        dropoff_address: form.destination,
        driver_type: form.driverType,
        payment_method: form.paymentMethod,
        phone: form.phone,
        notes: `Type: ${rentalType.label} | Heure: ${form.time} | Tel: ${form.phone}`,
      });
      setBooking(res.data);
      // Stripe / PayPal / Orange : redirection vers la page de paiement sécurisée ; confirmation au retour vérifié.
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }
      if (form.paymentMethod === 'mtn' && res.data?.payment_reference) {
        setApiError(t('Validez le paiement sur votre téléphone'));
        for (let attempt = 0; attempt < 36; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const { data } = await paymentsAPI.bookingStatus(res.data.payment_reference);
          if (data.status === 'completed') {
            setSaved(true); setStep(3); setApiError(null); setSubmitting(false);
            return;
          }
          if (data.status === 'failed') {
            setApiError(t('Le paiement a échoué.'));
            setSubmitting(false);
            return;
          }
        }
        setApiError(t('Le paiement est toujours en attente. Vérifiez votre téléphone.'));
        setSubmitting(false);
        return;
      }
      setSaved(res.data?.status === 'confirmed');
      setStep(3);
    } catch (err) {
      if (err.response?.status === 401) setApiError(t('Session expirée — reconnectez-vous.'));
      else if (!err.response) setApiError(t('Serveur injoignable — vérifiez votre connexion puis réessayez.'));
      else {
        const data = err.response?.data;
        const message = data?.payment || data?.vehicle || data?.driver_type || data?.detail || data?.phone || data?.start_date;
        setApiError(Array.isArray(message) ? message[0] : (message || t('Erreur lors de la réservation — réessayez.')));
      }
    }
    setSubmitting(false);
  };

  const summary = (
    <aside className="card flex flex-col gap-4 lg:sticky lg:top-6">
      <div className="flex items-center justify-between"><h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Récapitulatif financier')}</h3><span className="badge-info">{t('Tarif vérifié')}</span></div>
      <div className="flex gap-3 p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
        <img src={vehicle.image} alt="" className="w-24 h-20 rounded-lg object-cover" />
        <div className="min-w-0">
          <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[vehicle.tier]}`}>{vehicleLabel(vehicle.tier_label || vehicle.tier, 'tier')}</span>
          <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white truncate mt-1">{vehicle.name}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><Icon name="schedule" size={14} />{t(rentalType.label)}{form.date && ` · ${formatDate(form.date)} ${form.time}`}</div>
        </div>
      </div>
      <dl className="flex flex-col gap-2 font-body-md text-body-md">
        <div className="flex justify-between"><dt>{t('Location ({{rate}} F × {{days}} j)', { rate: formatNumber(vehicle.price), days })}</dt><dd className="font-label-lg text-label-lg">{formatNumber(vehicle.price * days)} FCFA</dd></div>
        {discount > 0 && <div className="flex justify-between text-primary"><dt>{t('Remise longue durée ({{p}} %)', { p: discount })}</dt><dd>−{formatNumber(vehicle.price * days - basePrice)} FCFA</dd></div>}
        <div className="flex justify-between text-on-surface-variant"><dt>{t(DRIVER_OPTIONS.find((d) => d.value === form.driverType).label)}</dt><dd>{t('Inclus')}</dd></div>
        <div className="flex justify-between text-on-surface-variant"><dt>{t('Km inclus')}</dt><dd>{rentalType.kmIncluded} km · {formatNumber(vehicle.kmRate)} F/km sup.</dd></div>
      </dl>
      <div className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center"><span className="font-label-lg text-label-lg uppercase">{t('Sous-total location')}</span><span className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{formatNumber(basePrice)} FCFA</span></div>
        {deposit > 0 && <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span className="flex items-center gap-1"><Icon name="shield" size={16} />{t('Caution sous séquestre (restituée)')}</span><span>{formatNumber(deposit)} FCFA</span></div>}
        <div className="flex justify-between pt-2 border-t border-outline-variant/40"><span className="font-label-lg text-label-lg">{t('Total débité')}</span><span className="font-headline-md text-headline-md text-primary">{formatNumber(total)} FCFA</span></div>
      </div>
      {isWallet && balance !== null && (
        <div className={`rounded-xl p-4 flex flex-col gap-1 font-body-sm text-body-sm ${missing ? 'bg-error-container/60' : 'bg-primary-fixed/30'}`}>
          <div className="flex justify-between"><span>{t('Solde actuel de votre portefeuille')}</span><strong>{formatNumber(balance)} FCFA</strong></div>
          <div className="flex justify-between"><span>{t('Montant à débiter')}</span><strong>{formatNumber(total)} FCFA</strong></div>
          <div className={`flex justify-between font-headline-sm text-headline-sm mt-1 ${missing ? 'text-error' : 'text-primary'}`}>
            <span className="flex items-center gap-1"><Icon name={missing ? 'error' : 'check_circle'} size={20} />{missing ? t('Déficit à combler') : t('Solde suffisant')}</span>
            <span>{missing ? `−${formatNumber(missing)}` : formatNumber(balance - total)} FCFA</span>
          </div>
        </div>
      )}
      <p className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant"><Icon name="event_busy" size={18} />{t('Annulation gratuite avant le début : location et caution intégralement recréditées.')}</p>
    </aside>
  );

  return (
    <div className="fixed inset-0 z-50 bg-surface dark:bg-slate-950 overflow-y-auto" role="dialog" aria-modal="true">
      <header className="sticky top-0 z-10 bg-surface-container-lowest/95 dark:bg-slate-900/95 backdrop-blur shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button onClick={onClose} className="flex items-center gap-1 font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface"><Icon name="arrow_back" />{t('Retour au véhicule')}</button>
          <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low dark:bg-slate-800 font-label-md text-label-md"><Icon name="verified_user" size={18} className="text-primary" />{t('Tunnel de réservation 100 % sécurisé')}</span>
          {balance !== null && <span className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-surface-container-low dark:bg-slate-800 font-label-lg text-label-lg"><Icon name="account_balance_wallet" size={18} className="text-primary" />{formatNumber(balance)} FCFA
            <button onClick={() => setShowTopUp(true)} className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center" title={t('Recharger')}><Icon name="add" size={16} /></button></span>}
        </div>
        <div className="bg-surface-container-low dark:bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto">
            {STEP_LABELS.map((label, index) => {
              const number = index + 1;
              const done = step > number;
              const current = step === number;
              const warn = current && number === 2 && missing > 0;
              return (
                <React.Fragment key={label}>
                  {index > 0 && <Icon name="chevron_right" size={18} className="text-outline shrink-0" />}
                  <span className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full font-label-md text-label-md ${warn ? 'bg-error-container text-error' : current ? 'bg-primary-fixed/40 text-primary' : done ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] ${done ? 'bg-primary text-on-primary' : warn ? 'bg-error text-on-error' : current ? 'bg-primary text-on-primary' : 'bg-surface-container-high'}`}>{done ? <Icon name="check" size={16} /> : number}</span>
                    {number}. {t(label)}{warn && <Icon name="warning" size={16} />}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {step === 3 ? (
          <div className="max-w-2xl mx-auto card text-center flex flex-col items-center gap-4 py-10">
            <span className={`w-20 h-20 rounded-full flex items-center justify-center ${saved ? 'bg-primary-fixed/40 text-primary' : 'bg-tertiary-fixed text-tertiary'}`}><Icon name={saved ? 'check_circle' : 'hourglass_top'} size={48} fill={saved} /></span>
            <span className="overline text-primary">{t('Étape 3 sur 3')}</span>
            <h2 className="page-title">{saved ? t('Réservation confirmée') : t('Réservation enregistrée')}</h2>
            <p className="page-subtitle">{vehicle.name} — {t(rentalType.label)}{booking?.id ? ` · BK-${String(booking.id).padStart(4, '0')}` : ''}</p>
            <dl className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900"><dt className="overline">{t('Prise en charge')}</dt><dd className="font-label-lg text-label-lg">{formatDate(form.date)} · {form.time}</dd></div>
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900"><dt className="overline">{t('Lieu')}</dt><dd className="font-label-lg text-label-lg">{form.pickup || t('Non précisé')}</dd></div>
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900"><dt className="overline">{t('Montant')}</dt><dd className="font-label-lg text-label-lg text-primary">{formatNumber(booking?.subtotal || basePrice)} FCFA</dd></div>
            </dl>
            {form.driverType === 'internal' && <p className="font-body-md text-body-md text-secondary">{t('Un chauffeur AutoLink vous sera assigné automatiquement.')}</p>}
            {form.driverType === 'owner' && <p className="font-body-md text-body-md text-secondary">{t('Le propriétaire se présentera avec son chauffeur.')}</p>}
            <p className="font-body-md text-body-md text-on-surface-variant">
              {saved ? t('Paiement reçu — la caution est bloquée sous séquestre et le propriétaire a été notifié. Il doit encore accepter votre demande.') : t('Enregistrée — en attente de confirmation du paiement.')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {booking?.id && <button onClick={() => navigate(`/client/bookings/${booking.id}`)} className="btn-primary"><Icon name="receipt_long" size={18} />{t('Voir ma réservation')}</button>}
              {booking?.id && <button onClick={() => navigate(`/messages?booking=${booking.id}`)} className="btn-secondary"><Icon name="chat" size={18} />{t('Écrire au propriétaire')}</button>}
              <button onClick={onClose} className="btn-secondary">{t('Retour au catalogue')}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
            <div className="flex flex-col gap-6">
              <div>
                <span className="overline">{t('Étape {{n}} sur 3', { n: step })}</span>
                <h2 className="page-title mt-1">{step === 1 ? t('Détails et options de votre location') : t('Paiement sécurisé de votre réservation')}</h2>
              </div>

              {step === 1 ? (
                <>
                  <section className="card flex flex-col gap-4">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Formule de location')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {RENTAL_TYPES.map((rt) => (
                        <button type="button" key={rt.id} onClick={() => setRentalType(rt)}
                          className={`p-3 rounded-xl border text-left transition-all ${rentalType.id === rt.id ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/40 hover:bg-surface-container-low dark:border-slate-700'}`}>
                          <span className="flex justify-between font-label-lg text-label-lg text-on-surface dark:text-white">{t(rt.label)}<span className="text-primary">{rt.id === 'long_haul' ? t('{{n}} F/jour', { n: formatNumber(vehicle.price) }) : `${formatNumber(vehicle.price)} F`}</span></span>
                          <span className="block font-body-sm text-body-sm text-on-surface-variant">{t(rt.description)} · {rt.kmIncluded} km</span>
                        </button>
                      ))}
                    </div>
                    {rentalType.id === 'long_haul' && (
                      <label><span className="label">{t('Nombre de jours')}</span><input type="number" min={2} max={30} className="input-field" value={form.days} onChange={(e) => set('days', Math.max(2, Number(e.target.value)))} /></label>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <label><span className="label">{t('Date de départ')}</span><input type="date" className="input-field" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
                      <label><span className="label">{t('Heure')}</span><input type="time" className="input-field" value={form.time} onChange={(e) => set('time', e.target.value)} /></label>
                    </div>
                    {form.date && <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Restitution prévue le {{date}}', { date: formatDate(endDate()) })}</p>}
                  </section>
                  <section className="card flex flex-col gap-4">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Lieux & chauffeur')}</h3>
                    <label><span className="label">{t('Adresse de prise en charge')}</span><input className="input-field" placeholder={t('Ex : Bonanjo, Douala')} value={form.pickup} onChange={(e) => set('pickup', e.target.value)} /></label>
                    {(rentalType.id === 'intercity' || rentalType.id === 'long_haul') && (
                      <label><span className="label">{t('Destination')}</span><input className="input-field" placeholder={t('Ex : Yaoundé Centre')} value={form.destination} onChange={(e) => set('destination', e.target.value)} /></label>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {DRIVER_OPTIONS.filter((opt) => opt.value !== 'owner' || vehicle.driver_available !== false).map((opt) => (
                        <button type="button" key={opt.value} onClick={() => set('driverType', opt.value)}
                          className={`p-3 rounded-xl border text-left ${form.driverType === opt.value ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/40 dark:border-slate-700'}`}>
                          <Icon name={opt.icon} className="text-primary" />
                          <span className="block font-label-lg text-label-lg text-on-surface dark:text-white">{t(opt.label)}</span>
                          <span className="block font-body-sm text-body-sm text-on-surface-variant">{t(opt.sub)}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                  {user?.kyc_status !== 'approved' && form.driverType === 'none' && (
                    <div className="rounded-xl p-4 bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-start justify-between gap-3">
                      <span className="flex gap-2 font-body-md text-body-md"><Icon name="badge" />{t('Vous conduisez vous-même : votre permis de conduire sera vérifié à la prise en charge. Déposez-le dès maintenant pour gagner du temps.')}</span>
                      <Link to="/profile" className="shrink-0 font-label-md text-label-md underline">{t('Mes documents')}</Link>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary">{t('Annuler')}</button>
                    <button onClick={() => setStep(2)} disabled={!form.date} className="btn-primary flex-1">{t('Continuer vers le paiement')}<Icon name="arrow_forward" size={18} /></button>
                  </div>
                </>
              ) : (
                <>
                  {isWallet && missing > 0 && (
                    <section className="rounded-xl p-5 bg-error-container text-on-error-container shadow-sm flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-11 h-11 rounded-full bg-error text-on-error flex items-center justify-center shrink-0"><Icon name="account_balance_wallet" /></span>
                        <div>
                          <h3 className="font-headline-md text-headline-md text-error flex flex-wrap items-center gap-2">{t('Solde insuffisant pour confirmer la réservation')}<span className="px-2 py-0.5 rounded bg-error text-on-error font-label-sm text-label-sm uppercase">{t('Recharge requise')}</span></h3>
                          <p className="font-body-md text-body-md">{t('Votre solde disponible est de {{b}} FCFA. Le montant de cette réservation est de {{t}} FCFA.', { b: formatNumber(balance), t: formatNumber(total) })}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-lowest dark:bg-slate-800 text-on-surface dark:text-white">
                        <div><div className="font-body-sm text-body-sm">{t('Solde actuel')}</div><div className="font-headline-sm text-headline-sm">{formatNumber(balance)} FCFA</div></div>
                        <div><div className="font-body-sm text-body-sm">{t('Total réservation')}</div><div className="font-headline-sm text-headline-sm">{formatNumber(total)} FCFA</div></div>
                        <div className="rounded-lg bg-error-container px-2"><div className="font-body-sm text-body-sm text-error">{t('Manquant')}</div><div className="font-headline-md text-headline-md text-error">{formatNumber(missing)} FCFA</div></div>
                      </div>
                      <button onClick={() => setShowTopUp(true)} className="w-full flex items-center justify-between gap-3 p-4 rounded-xl bg-primary text-on-primary">
                        <span className="flex items-center gap-3"><Icon name="bolt" /><span className="text-left"><span className="block font-label-lg text-label-lg">{t('Recharger le montant manquant')}</span><span className="block font-body-sm text-body-sm opacity-80">{t('Ou choisissez un autre moyen de paiement ci-dessous')}</span></span></span>
                        <span className="font-headline-md text-headline-md">+{formatNumber(missing)} FCFA</span>
                      </button>
                    </section>
                  )}
                  {isWallet && balance !== null && !missing && (
                    <div className="rounded-xl p-4 bg-primary-fixed/30 text-on-primary-fixed-variant flex items-center gap-2 font-label-lg text-label-lg"><Icon name="check_circle" fill />{t('Solde suffisant : {{b}} FCFA disponibles, il restera {{r}} FCFA après paiement.', { b: formatNumber(balance), r: formatNumber(balance - total) })}</div>
                  )}
                  <section className="card flex flex-col gap-3">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Choisissez votre moyen de paiement')}</h3>
                    {PAYMENT_METHODS.map((pm) => {
                      const enabled = configuredMethods.includes(pm.value);
                      const selected = form.paymentMethod === pm.value;
                      return (
                        <button type="button" key={pm.value} disabled={!enabled} onClick={() => set('paymentMethod', pm.value)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left ${selected ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/40 bg-surface-container-low dark:bg-slate-900 dark:border-slate-700'} ${enabled ? '' : 'opacity-50 cursor-not-allowed'}`}>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary' : 'border-outline'}`}>{selected && <span className="w-2 h-2 rounded-full bg-primary" />}</span>
                          <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-sm text-label-sm font-black ${pm.tile}`}>{pm.icon ? <Icon name={pm.icon} size={20} /> : pm.short}</span>
                          <span className="flex-1"><span className="block font-label-lg text-label-lg text-on-surface dark:text-white">{t(pm.label)}</span><span className="block font-body-sm text-body-sm text-on-surface-variant">{pm.value === 'wallet' && balance !== null ? t('Solde : {{b}} FCFA', { b: formatNumber(balance) }) : enabled ? t(pm.detail) : t('Non configuré')}</span></span>
                        </button>
                      );
                    })}
                    {needsPhone && (
                      <label><span className="label">{t('Numéro de téléphone pour le paiement')}</span><input type="tel" className="input-field" placeholder="+237 6XX XX XX XX" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
                    )}
                    {apiError && <p role="alert" className={`rounded-xl px-4 py-3 font-body-md text-body-md flex items-center gap-2 ${submitting ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'}`}><Icon name={submitting ? 'hourglass_top' : 'error'} size={18} />{apiError}</p>}
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setStep(1)} disabled={submitting} className="btn-secondary"><Icon name="arrow_back" size={18} />{t('Retour')}</button>
                      <button onClick={submitBooking} disabled={submitting || (needsPhone && !form.phone) || !configuredMethods.includes(form.paymentMethod) || (isWallet && missing > 0)} className="btn-primary flex-1">
                        {submitting ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : <Icon name="lock" size={18} />}
                        {submitting ? t('Traitement en cours…') : t('Confirmer et payer {{n}} FCFA', { n: formatNumber(total) })}
                      </button>
                    </div>
                    {needsPhone && <p className="font-body-sm text-body-sm text-on-surface-variant text-center">{t('Une demande de paiement apparaîtra sur votre téléphone : validez-la avec votre code secret.')}</p>}
                  </section>
                </>
              )}
            </div>
            {summary}
          </div>
        )}
      </div>
      {showTopUp && <TopUpModal initialAmount={Math.max(500, Math.ceil((missing || 25000) / 500) * 500)} onClose={() => { setShowTopUp(false); loadBalance(); }} onDone={loadBalance} />}
    </div>
  );
}

export default function SearchVehicles() {
  const navigate = useNavigate();
  const favorites = useFavorites();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [onlyAvailable, setOnly] = useState(true);
  const [selectedVehicle, setSelected] = useState(null);
  const [selectedType, setType] = useState('');
  const [selectedTier, setTier] = useState('');
  const [availabilityStart, setAvailabilityStart] = useState(() => new URLSearchParams(window.location.search).get('start') || '');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [facets, setFacets] = useState({ brands: [], models: {}, categories: [], fuels: [], max_rate: 200000 });
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuel, setFuel] = useState('');

  useEffect(() => {
    Promise.resolve({ data: { max_rate: 280000, brands: ['Toyota','Porsche','Mercedes','BMW','Dacia','Kia'], models: {'Toyota':['RAV4 AWD Hybrid','Corolla','Land Cruiser Prado'],'Porsche':['Panamera'],'Mercedes':['Classe S 500'],'BMW':['X7'],'Dacia':['Duster'],'Kia':['Sorento']}, categories: ['Berline','SUV','Citadine','Pick-up','Van','Minibus'], fuels: ['Essence','Diesel','Hybride'] } }).then(({ data }) => { setFacets(f => ({ ...f, max_rate: data.max_rate })); setMaxPrice(Number(data.max_rate) || 280000); }).catch(() => {});
    const type = new URLSearchParams(window.location.search).get('type');
    if (type) setType(type);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoadingList(true);
    Promise.resolve({ data: { results: MOCK_VEHICLES } }) /* vehiclesAPI.getAll({
      status: 'approved', page_size: 200,
      ...(onlyAvailable ? { available: 1, ...(availabilityStart ? { start: availabilityStart } : {}), ...(availabilityEnd ? { end: availabilityEnd } : {}) } : {}),
    }) */
      .then((res) => {
        if (!mounted) return;
        const list = (res.data.results || res.data || []).map(mapApiVehicle);
        setVehicles(list);
        setOffline(false);
        const selectedId = Number(new URLSearchParams(window.location.search).get('vehicle'));
        if (selectedId) {
          const vehicle = list.find((item) => item.id === selectedId);
          if (vehicle) setSelected(vehicle);
          else vehiclesAPI.detail(selectedId).then(({ data }) => mounted && setSelected({ ...data, type: 'rental' })).catch(() => {});
        }
        setLoadingList(false);
      })
      .catch(() => { if (mounted) { setOffline(true); setLoadingList(false); } });
    return () => { mounted = false; };
  }, [onlyAvailable, availabilityStart, availabilityEnd]);

  const filtered = vehicles.filter((v) => {
    const query = search.toLowerCase();
    return (!category || v.category === category)
      && (!brand || v.brand === brand)
      && (!model || v.model === model)
      && (!fuel || v.fuel === fuel)
      && (!selectedTier || v.tier === selectedTier)
      && v.price <= maxPrice
      && (!onlyAvailable || v.available)
      && (!query || [v.name, v.category, v.city, v.plate].some((value) => String(value || '').toLowerCase().includes(query)));
  }).sort((a, b) => {
    const left = sortField === 'name' ? a.name : a[sortField];
    const right = sortField === 'name' ? b.name : b[sortField];
    const comparison = typeof left === 'string' ? left.localeCompare(right || '', 'fr') : Number(left || 0) - Number(right || 0);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const closeFunnel = () => {
    setSelected(null);
    const params = new URLSearchParams(window.location.search);
    if (params.get('vehicle')) { params.delete('vehicle'); navigate({ search: params.toString() }, { replace: true }); }
  };

  const maxRate = Math.max(15000, Number(facets.max_rate) || 200000);

  return (
    <DesignShell role="client">
      <div className="pt-4 px-4 sm:px-6 lg:px-8">
        <div className="mb-4"><h1 className="font-headline-lg text-headline-lg text-on-surface">{t('Catalogue de véhicules')}</h1><p className="text-body-md text-on-surface-variant">{t('Choisissez votre véhicule, votre formule et réservez en quelques clics.')}</p></div>
        <div className="flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[{ id: '', label: 'Toutes les formules' }, ...RENTAL_TYPES].map((rt) => (
            <button key={rt.id} onClick={() => setType(rt.id)}
              className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md ${selectedType === rt.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 dark:bg-slate-800 dark:text-slate-300'}`}>{t(rt.label)}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[{ id: '', label: 'Toutes les gammes', desc: 'Économique à Super Luxe' }, ...TIERS].map((tier) => (
            <button key={tier.id} onClick={() => setTier(tier.id)}
              className={`p-3 rounded-xl border text-left ${selectedTier === tier.id ? 'border-primary ring-1 ring-primary bg-primary-fixed/10' : 'border-outline-variant/40 bg-surface-container-lowest dark:bg-slate-800 dark:border-slate-700'}`}>
              <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{tier.id ? vehicleLabel(tier.id, 'tier') : t(tier.label)}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t(tier.desc)}</div>
            </button>
          ))}
        </div>

        <div className="card flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <ListToolbar className="min-w-64 flex-1" search={search} onSearchChange={setSearch}
              sortField={sortField} onSortFieldChange={setSortField} sortOrder={sortOrder} onSortOrderChange={setSortOrder}
              sortOptions={[{ value: 'name', label: t('Nom') }, { value: 'price', label: t('Prix') }, { value: 'year', label: t('Année') }, { value: 'rating', label: t('Note') }]}
              placeholder={t('Rechercher un véhicule, une marque…')} />
            <div className="flex items-center gap-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Prix max :')}</span>
              <input type="range" min={15000} max={maxRate} step={5000} value={Math.min(maxPrice, maxRate)} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-32 accent-primary" />
              <span className="font-label-lg text-label-lg text-primary whitespace-nowrap">{formatNumber(maxPrice)} F</span>
            </div>
            <label className="flex items-center gap-2 font-label-md text-label-md cursor-pointer"><input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnly(e.target.checked)} className="w-4 h-4 accent-primary" />{t('Disponibles uniquement')}</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label><span className="label">{t('Disponible à partir du')}</span><input type="date" className="input-field" value={availabilityStart} min={new Date().toISOString().slice(0, 10)} disabled={!onlyAvailable} onChange={(e) => setAvailabilityStart(e.target.value)} /></label>
            <label><span className="label">{t('Jusqu’au')}</span><input type="date" className="input-field" value={availabilityEnd} min={availabilityStart || new Date().toISOString().slice(0, 10)} disabled={!onlyAvailable} onChange={(e) => setAvailabilityEnd(e.target.value)} /></label>
            <label><span className="label">{t('Marque')}</span><select className="input-field" value={brand} onChange={(e) => { setBrand(e.target.value); setModel(''); }}><option value="">{t('Toutes les marques')}</option>{facets.brands.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="label">{t('Modèle')}</span><select className="input-field" value={model} onChange={(e) => setModel(e.target.value)}><option value="">{t('Tous les modèles')}</option>{(facets.models[brand] || []).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span className="label">{t('Carburant')}</span><select className="input-field" value={fuel} onChange={(e) => setFuel(e.target.value)}><option value="">{t('Tous les carburants')}</option>{facets.fuels.map((value) => <option key={value} value={value}>{vehicleLabel(value, 'fuel')}</option>)}</select></label>
          </div>
          <div className="flex flex-wrap gap-2">
            {['', ...(facets.categories || [])].map((value) => (
              <button key={value || 'all'} onClick={() => setCategory(value)} className={`px-4 py-1.5 rounded-full font-label-md text-label-md ${category === value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant dark:bg-slate-900 dark:text-slate-300'}`}>
                {value ? vehicleLabel(value, 'category') : t('Toutes les catégories')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-label-lg text-label-lg text-on-surface-variant">{t('{{n}} véhicule(s) trouvé(s)', { n: filtered.length })}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><Icon name="verified_user" size={16} className="text-primary" />{t('Caution sous séquestre sur toutes les réservations')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} unavailable={!v.available} onClick={() => navigate(`/vehicles/${v.id}`)}
              favorite={favorites.ids.includes(v.id)} onToggleFavorite={favorites.toggle} />
          ))}
        </div>

        {filtered.length === 0 && !loadingList && (
          <div className="card text-center py-16">
            <Icon name={offline ? 'cloud_off' : 'search_off'} size={44} className="text-outline" />
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mt-2">{offline ? t('Serveur injoignable') : t('Aucun véhicule trouvé')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{offline ? t('Impossible de contacter le serveur — vérifiez votre connexion puis rechargez la page.') : t('Modifiez vos filtres pour élargir la recherche.')}</p>
          </div>
        )}
        {loadingList && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 rounded-xl bg-surface-container animate-pulse" />)}</div>}
        </div>
      </div>
      {selectedVehicle && <BookingFunnel vehicle={selectedVehicle} onClose={closeFunnel} />}
    </DesignShell>
  );
}
