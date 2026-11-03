import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { OwnerLayout } from '../../components/ownerdash';
import {
  WizardSteps, WizardFooter, StepInfos, StepSpecs, StepPhotos,
  StepDocuments, StepAvailability, StepRecap, CONDITION_ITEMS,
} from '../../components/addvehicle';
import { vehiclesAPI } from '../../services/api';

const EMPTY = {
  name: '', brand: '', model: '', year: '', plate: '', category: '', gear: '',
  fuel: '', seats: '', color: '', dailyRate: '', mode: '', description: '',
  insurance: '', insuranceExpiry: '', technicalControl: '',
  mileage: '', marketValue: '', city: 'Douala', driverAvailable: true,
  conditionChecks: [],
  // Étape 5 — disponibilités & tarification
  availDays: { Lun: 1, Mar: 1, Mer: 1, Jeu: 1, Ven: 1, Sam: 1, Dim: 0 },
  dropTime: '07:30', returnTime: '20:00', instantBooking: true, noticeHours: '12',
  pickupHub: 'akwa', pickupAddress: '', deliveryAirport: false, deliveryHotel: false,
  kmPerDay: 250, depositAmount: 150000, driverPro: true, discount3: true, discount7: true,
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState({});
  const [certify, setCertify] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setApiError(null);
    try {
      const res = await vehiclesAPI.create({
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        plate: form.plate.toUpperCase(),
        category: form.category,
        fuel: form.fuel,
        seats: Number(form.seats) || 5,
        color: form.color || 'Non précisé',
        description: form.description,
        mode: form.mode,
        driver_available: form.driverAvailable,
        daily_rate: Number(form.dailyRate) || 0,
        mileage: Number(form.mileage) || 0,
        market_value: Number(form.marketValue) || null,
        city: form.city,
        insurance_type: form.insurance,
        insurance_expiry: form.insuranceExpiry || null,
        technical_control_date: form.technicalControl || null,
        condition_score: Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100),
      });
      setCreated(res.data);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      const first = data && typeof data === 'object' ? Object.values(data)[0] : null;
      setApiError(Array.isArray(first) ? first[0] : first || 'Erreur lors de la soumission — vérifiez les champs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setBusy(false);
  };

  if (submitted) return (
    <OwnerLayout>
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle2 size={72} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Véhicule soumis avec succès !</h2>
        {created && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4 text-sm">
            <div className="font-bold text-teal-800">Gamme attribuée automatiquement : {created.tier_label || created.tier}</div>
            <div className="text-slate-600 mt-1">
              Prix indicatif : {Number(created.computed_rate || 0).toLocaleString()} F/jour ·
              Votre tarif : {Number(created.daily_rate || 0).toLocaleString()} F/jour<br />
              Caution client : {Number(created.deposit_amount || 0).toLocaleString()} F ·
              {created.km_included_per_day} km/j inclus · {created.extra_km_rate} F/km supp.
            </div>
          </div>
        )}
        <p className="text-slate-500 mb-2">Votre véhicule est en attente de validation par notre équipe de contrôle.</p>
        <p className="text-sm text-slate-400 mb-8">Délai de traitement : 24 à 48 heures ouvrables.</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/owner/vehicles')} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">Voir mes véhicules</button>
          <button onClick={() => { setSubmitted(false); setCreated(null); setStep(1); setForm(EMPTY); setPhotos({}); setCertify(false); }}
            className="w-full border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:border-teal-400 transition-colors">Ajouter un autre véhicule</button>
        </div>
      </div>
    </OwnerLayout>
  );

  const subtitles = {
    1: "Ajout d'un véhicule à la flotte",
    2: 'Caractéristiques techniques',
    3: 'Photos du véhicule',
    4: 'Documents & conformité',
    5: 'Disponibilités & Tarification',
    6: 'Récapitulatif & Envoi',
  };

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <WizardSteps step={step} subtitle={subtitles[step]} />

        {step === 1 && <StepInfos form={form} set={set} />}
        {step === 2 && <StepSpecs form={form} set={set} />}
        {step === 3 && <StepPhotos photos={photos} setPhotos={setPhotos} />}
        {step === 4 && <StepDocuments form={form} set={set} />}
        {step === 5 && <StepAvailability form={form} set={set} />}
        {step === 6 && <StepRecap form={form} photos={photos} certify={certify} setCertify={setCertify} />}

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{apiError}</div>
        )}

        <WizardFooter
          step={step} setStep={setStep} busy={busy}
          onSubmit={submit}
          submitDisabled={!certify}
          submitLabel={certify ? 'Soumettre mon véhicule pour audit →' : 'Cochez la certification pour soumettre'}
        />
      </div>
    </OwnerLayout>
  );
}
