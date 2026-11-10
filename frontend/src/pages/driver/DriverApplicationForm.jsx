import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { driversAPI } from '../../services/api';
import { uiText } from '../../i18n';

const CHECKS = [
  ['has_valid_license', uiText("pages.driver.DriverApplicationForm", "Permis de conduire valide")],
  ['has_clean_criminal_record', uiText("pages.driver.DriverApplicationForm", "Casier judiciaire vierge")],
  ['has_medical_certificate', uiText("pages.driver.DriverApplicationForm", "Certificat médical valide")],
  ['driving_test_passed', uiText("pages.driver.DriverApplicationForm", "Test de conduite réussi")],
  ['training_completed', uiText("pages.driver.DriverApplicationForm", "Formation AutoLink terminée")],
  ['has_insurance', uiText("pages.driver.DriverApplicationForm", "Assurance véhicule souscrite")],
];
const DOCUMENTS = [
  ['license_document', uiText("pages.driver.DriverApplicationForm", "Copie du permis")],
  ['criminal_record_document', uiText("pages.driver.DriverApplicationForm", "Extrait de casier judiciaire")],
  ['medical_certificate_document', uiText("pages.driver.DriverApplicationForm", "Certificat médical")],
];

const initialForm = {
  experience_years: 0, has_valid_license: false, license_number: '',
  license_expiry: '', has_clean_criminal_record: false,
  has_medical_certificate: false, driving_test_passed: false,
  driving_test_score: '', training_completed: false,
};

export default function DriverApplicationForm() {
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.applications({ page_size: 1 });
      const current = (data.results || data)[0];
      if (current) {
        setApplication(current);
        setForm(value => ({ ...value, ...current }));
      }
    } catch (_) {
      setError(uiText("pages.driver.DriverApplicationForm", "Impossible de charger votre candidature."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) payload.append(key, value);
    });
    Object.entries(documents).forEach(([key, file]) => { if (file) payload.append(key, file); });
    try {
      const response = application
        ? await driversAPI.updateApplication(application.id, payload)
        : await driversAPI.createApplication(payload);
      setApplication(response.data);
      setForm(value => ({ ...value, ...response.data }));
      setSuccess(uiText("pages.driver.DriverApplicationForm", "Votre candidature a été enregistrée."));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.driver.DriverApplicationForm", "La candidature n’a pas pu être enregistrée."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={uiText("pages.driver.DriverApplicationForm", "Devenir chauffeur")}>
      <div className="mx-auto max-w-3xl">
        <form onSubmit={submit} className="card space-y-5">
          <div>
            <h2 className="text-xl font-bold">{uiText("pages.driver.DriverApplicationForm", "Candidature chauffeur")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{uiText("pages.driver.DriverApplicationForm", "Renseignez votre expérience, les vérifications effectuées et les documents à examiner.")}</p>
          </div>
          {loading ? <p className="py-8 text-center text-on-surface-variant">{uiText("pages.driver.DriverApplicationForm", "Chargement…")}</p> : (
            <>
              {application && <p className="rounded-xl bg-secondary-fixed/50 p-3 text-sm text-blue-800">{uiText("pages.driver.DriverApplicationForm", "Statut :") + " "}<strong>{application.status}</strong>{application.reviewer_notes && ` — ${application.reviewer_notes}`}</p>}
              <label className="block text-sm">{uiText("pages.driver.DriverApplicationForm", "Années d’expérience") + " "}<input className="input-field mt-1" type="number" min="0" required value={form.experience_years}
                  onChange={event => setForm(value => ({ ...value, experience_years: event.target.value }))} />
              </label>
              <label className="block text-sm">{uiText("pages.driver.DriverApplicationForm", "Numéro du permis") + " "}<input className="input-field mt-1" value={form.license_number || ''}
                  onChange={event => setForm(value => ({ ...value, license_number: event.target.value }))} />
              </label>
              <label className="block text-sm">{uiText("pages.driver.DriverApplicationForm", "Expiration du permis") + " "}<input className="input-field mt-1" type="date" value={form.license_expiry || ''}
                  onChange={event => setForm(value => ({ ...value, license_expiry: event.target.value }))} />
              </label>
              <div className="space-y-2">
                <h3 className="font-semibold">{uiText("pages.driver.DriverApplicationForm", "Éléments de candidature")}</h3>
                {CHECKS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-lg bg-surface-container-low dark:bg-slate-900 p-3 text-sm">
                    <input type="checkbox" checked={Boolean(form[key])}
                      onChange={event => setForm(value => ({ ...value, [key]: event.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">{uiText("pages.driver.DriverApplicationForm", "Documents justificatifs")}</h3>
                {DOCUMENTS.map(([key, label]) => (
                  <label key={key} className="block text-sm">{label}
                    {application?.[key] && <a className="ml-2 text-primary-600 underline" href={application[key]} target="_blank" rel="noreferrer">{uiText("pages.driver.DriverApplicationForm", "Document actuel")}</a>}
                    <input className="input-field mt-1" type="file" accept="image/*" onChange={event => setDocuments(value => ({ ...value, [key]: event.target.files[0] }))} />
                  </label>
                ))}
              </div>
              {error && <p role="alert" className="text-sm text-error">{error}</p>}
              {success && <p className="text-sm text-primary">{success}</p>}
              <button className="btn-primary w-full" disabled={saving}>{saving ? uiText("pages.driver.DriverApplicationForm", "Enregistrement…") : uiText("pages.driver.DriverApplicationForm", "Enregistrer ma candidature")}</button>
            </>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
