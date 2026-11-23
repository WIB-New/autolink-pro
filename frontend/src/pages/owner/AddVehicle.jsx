import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, FileClock } from 'lucide-react';
import { OwnerLayout } from '../../components/ownerdash';
import {
  WizardSteps, WizardFooter, StepInfos, StepSpecs, StepPhotos,
  StepDocuments, StepAvailability, StepRecap, CONDITION_ITEMS,
} from '../../components/addvehicle';
import { vehiclesAPI, siteAPI } from '../../services/api';
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
  pickupHub: '', pickupAddress: '', deliveryAirport: false, deliveryHotel: false,
  driverPro: true,
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editMode = Boolean(id);
  const [step, setStepState] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotosState] = useState({});
  const [certify, setCertifyState] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  // Brouillon persisté côté serveur (VehicleDraft)
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [savedAt, setSavedAt] = useState(null);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftNotice, setDraftNotice] = useState(null);
  const dirty = useRef(false);
  // Paramètres plateforme publics (hubs, frais chauffeur/livraison, remises)
  const [siteCfg, setSiteCfg] = useState(null);
  // Aperçu tarifaire backend (gamme, indicatif, plage, caution, km) — partagé étapes 5 et 6
  const [preview, setPreview] = useState(null);

  const set = (k, v) => { dirty.current = true; setForm(f => ({ ...f, [k]: v })); };
  const setPhotos = (...args) => { dirty.current = true; setPhotosState(...args); };
  const setStep = (...args) => { dirty.current = true; setStepState(...args); };
  const setCertify = (...args) => { dirty.current = true; setCertifyState(...args); };

  useEffect(() => {
    siteAPI.config().then(({ data }) => setSiteCfg(data)).catch(() => {});
  }, []);

  // Charge le véhicule (édition) ou le brouillon existant (création)
  useEffect(() => {
    if (editMode) {
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
          pickupHub: p.pickup_hub || '', pickupAddress: p.pickup_address || '',
          deliveryAirport: !!p.delivery_airport, deliveryHotel: !!p.delivery_hotel,
          driverPro: p.driver_pro !== false,
        }));
        setExistingPhotos(v.photos || []);
        setCertifyState(true);
        // Restaure le brouillon d'édition éventuel par-dessus les données en base
        vehiclesAPI.draft.get(id).then(({ data }) => {
          const d = data?.draft;
          if (d?.data?.form) {
            setForm(f => ({ ...f, ...d.data.form }));
            if (d.step >= 1 && d.step <= 6) setStepState(d.step);
            const when = d.updated_at ? new Date(d.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            setDraftNotice(`Brouillon de modification du ${when} restauré — publiez ou sauvegardez à nouveau.`);
            setSavedAt(new Date(d.updated_at));
            setSaveState('saved');
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      }).catch(() => { setLoading(false); setApiError('Véhicule introuvable ou accès refusé.'); });
      return;
    }
    // Création : restaure le brouillon serveur s'il existe
    vehiclesAPI.draft.get().then(({ data }) => {
      const d = data?.draft;
      if (d?.data?.form) {
        setForm(f => ({ ...f, ...d.data.form }));
        if (d.step >= 1 && d.step <= 6) setStepState(d.step);
        if (typeof d.data.certify === 'boolean') setCertifyState(d.data.certify);
        const when = d.updated_at ? new Date(d.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
        const nFiles = Object.keys(d.data.photo_names || {}).length + Object.keys(d.data.doc_names || {}).length;
        setDraftNotice(`Brouillon du ${when} restauré.${nFiles ? ` ${nFiles} fichier(s) devront être resélectionnés.` : ''}`);
        setSavedAt(new Date(d.updated_at));
        setSaveState('saved');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Présélectionne le premier hub réel une fois la config chargée
  useEffect(() => {
    const hubs = siteCfg?.addresses || [];
    if (hubs.length && !form.pickupHub) setForm(f => ({ ...f, pickupHub: hubs[0] }));
  }, [siteCfg]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = useCallback(async () => {
    setDraftBusy(true);
    setSaveState('saving');
    try {
      const photoNames = Object.fromEntries(
        Object.entries(photos).filter(([, p]) => p?.name).map(([k, p]) => [k, p.name]));
      const docNames = Object.fromEntries(
        ['doc_registration', 'doc_insurance', 'doc_technical']
          .filter(k => form[k]?.name).map(k => [k, form[k].name]));
      const { data } = await vehiclesAPI.draft.save({
        vehicle: editMode ? id : null,
        step,
        data: { form: { ...form, doc_registration: undefined, doc_insurance: undefined, doc_technical: undefined }, certify, photo_names: photoNames, doc_names: docNames },
      });
      setSavedAt(new Date(data.updated_at));
      setSaveState('saved');
      dirty.current = false;
    } catch {
      setSaveState('error');
    }
    setDraftBusy(false);
  }, [form, photos, certify, step, editMode, id]);

  // Sauvegarde automatique débouncée (2,5 s après la dernière modification)
  useEffect(() => {
    if (loading || submitted || !dirty.current) return undefined;
    const t = setTimeout(() => { if (dirty.current) saveDraft(); }, 2500);
    return () => clearTimeout(t);
  }, [form, photos, certify, step, loading, submitted, saveDraft]);

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
        driver_pro: form.driverPro,
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
      vehiclesAPI.draft.clear(editMode ? id : undefined).catch(() => {});
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
            <button onClick={() => { setSubmitted(false); setCreated(null); setStepState(1); setForm(EMPTY); setPhotosState({}); setCertifyState(false); dirty.current = false; }}
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
      <div className="text-center py-32 text-slate-400 text-sm">Chargement…</div>
    </OwnerLayout>
  );

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <WizardSteps step={step} subtitle={editMode ? `Modification : ${subtitles[step]}` : subtitles[step]}
          saveState={saveState} savedAt={savedAt} />

        {draftNotice && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
            <FileClock size={16} className="text-teal-600 shrink-0" />
            <p className="text-[11px] font-semibold text-teal-800">{draftNotice}</p>
            <button onClick={() => setDraftNotice(null)} className="ml-auto text-teal-500 text-xs font-black">✕</button>
          </div>
        )}

        {step === 1 && <StepInfos form={form} set={set} />}
        {step === 2 && <StepSpecs form={form} set={set} />}
        {step === 3 && <StepPhotos photos={photos} setPhotos={setPhotos} existing={existingPhotos} />}
        {step === 4 && <StepDocuments form={form} set={set} />}
        {step === 5 && <StepAvailability form={form} set={set} config={siteCfg} preview={preview} setPreview={setPreview} />}
        {step === 6 && <StepRecap form={form} photos={photos} certify={certify} setCertify={setCertify}
          preview={preview} config={siteCfg} onEdit={() => setStep(1)} />}

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{apiError}</div>
        )}

        <WizardFooter
          step={step} setStep={setStep} busy={busy}
          onSubmit={submit}
          onSaveDraft={saveDraft}
          draftBusy={draftBusy || saveState === 'saving'}
          submitDisabled={!certify}
          submitLabel={!certify ? 'Cochez la certification pour soumettre' : editMode ? 'Enregistrer les modifications →' : 'Soumettre mon véhicule pour audit →'}
        />
      </div>
    </OwnerLayout>
  );
}
