import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { OwnerLayout } from '../../components/ownerdash';
import {
  WizardSteps, WizardFooter, StepInfos, StepSpecs, StepPhotos,
  StepDocuments, StepAvailability, StepRecap, CONDITION_ITEMS,
} from '../../components/addvehicle';
import { vehiclesAPI } from '../../services/api';
import { SLOTS as PHOTO_SLOTS } from '../../components/addvehicle/StepPhotos';

const PHOTO_SLOT_IDS = PHOTO_SLOTS.map(s => s.id);

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
  const { id } = useParams();
  const editMode = Boolean(id);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(editMode);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState({});
  const [certify, setCertify] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Mode édition : préremplit le wizard avec les données du véhicule
  useEffect(() => {
    if (!editMode) return;
    vehiclesAPI.detail(id).then(({ data: v }) => {
      const p = v.availability_prefs || {};
      setForm(f => ({
        ...f,
        brand: v.brand || '', model: v.model || '', year: v.year || '',
        plate: v.plate || '', category: v.category || '', gear: v.gear || '',
        fuel: v.fuel || '', seats: v.seats || '', color: v.color || '',
        dailyRate: v.daily_rate || '', mode: v.mode || '', description: v.description || '',
        insurance: v.insurance_type || '', insuranceExpiry: v.insurance_expiry || '',
        technicalControl: v.technical_control_date || '', mileage: v.mileage ?? '',
        marketValue: v.market_value ?? '', city: v.city || 'Douala',
        driverAvailable: v.driver_available !== false,
        availDays: p.avail_days || f.availDays,
        dropTime: p.drop_time || f.dropTime, returnTime: p.return_time || f.returnTime,
        instantBooking: p.instant_booking !== false, noticeHours: p.notice_hours ?? f.noticeHours,
        pickupHub: p.pickup_hub || f.pickupHub, pickupAddress: p.pickup_address || '',
        deliveryAirport: !!p.delivery_airport, deliveryHotel: !!p.delivery_hotel,
        kmPerDay: p.km_per_day ?? f.kmPerDay, depositAmount: p.deposit_amount ?? f.depositAmount,
        driverPro: p.driver_pro !== false, discount3: p.discount_3d !== false, discount7: p.discount_7d !== false,
      }));
      setExistingPhotos(v.photos || []);
      setCertify(true);
      setLoading(false);
    }).catch(() => { setLoading(false); setApiError('Véhicule introuvable ou accès refusé.'); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    setBusy(true);
    setApiError(null);
    try {
      // FormData obligatoire — transporte les fichiers (docs étape 4 + photos étape 3)
      const fd = new FormData();
      const fields = {
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
        market_value: Number(form.marketValue) || '',
        city: form.city,
        insurance_type: form.insurance,
        insurance_expiry: form.insuranceExpiry || '',
        technical_control_date: form.technicalControl || '',
        gear: form.gear || '',
        condition_score: Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100),
      };
      // Réglages de disponibilité (étape 5) persistés tels que saisis
      fd.append('availability_prefs', JSON.stringify({
        avail_days: form.availDays,
        drop_time: form.dropTime,
        return_time: form.returnTime,
        instant_booking: form.instantBooking,
        notice_hours: form.noticeHours,
        pickup_hub: form.pickupHub,
        pickup_address: form.pickupAddress,
        delivery_airport: form.deliveryAirport,
        delivery_hotel: form.deliveryHotel,
        km_per_day: form.kmPerDay,
        deposit_amount: form.depositAmount,
        driver_pro: form.driverPro,
        discount_3d: form.discount3,
        discount_7d: form.discount7,
      }));
      // N'envoie pas les champs vides — '' est rejeté par les Decimal/Date côté backend
      Object.entries(fields).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
      // Documents légaux (FileFields du modèle Vehicle)
      if (form.doc_registration) fd.append('registration_doc', form.doc_registration);
      if (form.doc_insurance) fd.append('insurance_doc', form.doc_insurance);
      if (form.doc_technical) fd.append('technical_control_doc', form.doc_technical);
      // Photos dans l'ORDRE des slots (extérieur d'abord) + ids de slot en parallèle
      // → le backend tague chaque photo avec son slot (cover = front34)
      PHOTO_SLOT_IDS.forEach(slotId => {
        const p = (photos || {})[slotId];
        if (p?.file) { fd.append('photos', p.file); fd.append('photo_slots', slotId); }
      });

      const res = editMode
        ? await vehiclesAPI.update(id, fd)
        : await vehiclesAPI.create(fd);
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
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{editMode ? 'Véhicule mis à jour !' : 'Véhicule soumis avec succès !'}</h2>
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
        {!editMode && (
          <>
            <p className="text-slate-500 mb-2">Votre véhicule est en attente de validation par notre équipe de contrôle.</p>
            <p className="text-sm text-slate-400 mb-8">Délai de traitement : 24 à 48 heures ouvrables.</p>
          </>
        )}
        <div className="space-y-3">
          <button onClick={() => navigate('/owner/vehicles')} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">Voir mes véhicules</button>
          {!editMode && (
            <button onClick={() => { setSubmitted(false); setCreated(null); setStep(1); setForm(EMPTY); setPhotos({}); setCertify(false); }}
              className="w-full border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:border-teal-400 transition-colors">Ajouter un autre véhicule</button>
          )}
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

  if (loading) return (
    <OwnerLayout>
      <div className="text-center py-32 text-slate-400 text-sm">Chargement du véhicule…</div>
    </OwnerLayout>
  );

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <WizardSteps step={step} subtitle={editMode ? `Modification : ${subtitles[step]}` : subtitles[step]} />

        {step === 1 && <StepInfos form={form} set={set} />}
        {step === 2 && <StepSpecs form={form} set={set} />}
        {step === 3 && <StepPhotos photos={photos} setPhotos={setPhotos} existing={existingPhotos} />}
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
          submitLabel={!certify ? 'Cochez la certification pour soumettre' : editMode ? 'Enregistrer les modifications →' : 'Soumettre mon véhicule pour audit →'}
        />
      </div>
    </OwnerLayout>
  );
}
