import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { platformAPI, usersAPI, walletAPI } from '../../services/api';
import { formatDateTime, formatNumber, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.admin.PlatformSettings', text, options);

const SECTIONS = [
  { id: 'commissions', label: 'Commissions & frais' },
  { id: 'tiers', label: 'Grille & gammes' },
  { id: 'gateways', label: 'Paiements & seuils' },
  { id: 'rules', label: 'Délais & disponibilité' },
  { id: 'contact', label: 'Coordonnées' },
  { id: 'legal', label: 'Textes légaux' },
  { id: 'team', label: 'Équipe' },
];

const GATEWAYS = [
  { id: 'mtn', label: 'MTN Mobile Money', detail: 'API Collection (push USSD)', tile: 'bg-yellow-400 text-yellow-950', short: 'MoMo' },
  { id: 'orange', label: 'Orange Money', detail: 'Web Payment', tile: 'bg-orange-500 text-white', short: 'OM' },
  { id: 'stripe', label: 'Carte Visa / Mastercard', detail: 'Stripe Checkout 3-D Secure', tile: 'bg-secondary text-on-secondary', short: 'CB' },
  { id: 'paypal', label: 'PayPal', detail: 'Commandes PayPal', tile: 'bg-blue-700 text-white', short: 'PP' },
];

const TIER_STYLES = { basic: 'badge-neutral', standard: 'badge-success', premium: 'badge-info', gold: 'badge-warning', collection: 'badge bg-purple-100 text-purple-800' };

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-outline-variant'}`}>
      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function Section({ id, index, icon, title, subtitle, children, aside }) {
  return (
    <section id={id} className="card scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center shrink-0"><Icon name={icon} /></span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{index}. {t(title)}</h3>
            {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant">{t(subtitle)}</p>}
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function PlatformSettings() {
  const [form, setForm] = useState(null);
  const [initial, setInitial] = useState(null);
  const [configured, setConfigured] = useState([]);
  const [team, setTeam] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    platformAPI.get().then(({ data }) => { setForm(data); setInitial(data); })
      .catch(() => setMessage({ error: true, text: t('API injoignable — paramètres indisponibles.') }));
    walletAPI.methods().then(({ data }) => setConfigured(data.configured_methods || [])).catch(() => {});
    Promise.all([usersAPI.list({ role: 'ADMIN', page_size: 50 }), usersAPI.list({ role: 'CONTROLLER', page_size: 50 })])
      .then(([a, c]) => setTeam([...(a.data.results || []), ...(c.data.results || [])])).catch(() => {});
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = form && initial && JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true); setMessage(null);
    const { tiers, updated_at: _updated, ...payload } = form;
    try {
      const { data } = await platformAPI.update(payload);
      setForm(data); setInitial(data);
      setMessage({ text: t('Paramètres enregistrés. Les nouvelles réservations utilisent désormais ces règles.') });
    } catch (e) {
      const data = e.response?.data || {};
      setMessage({ error: true, text: Object.values(data).flat()[0] || t('Enregistrement impossible.') });
    }
    setSaving(false);
  };

  if (!form) {
    return <DashboardLayout title={t('Paramètres plateforme')}>{message ? <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container">{message.text}</div> : <p className="text-on-surface-variant">{t('Chargement…')}</p>}</DashboardLayout>;
  }

  const commissionPercent = Math.round(Number(form.commission_rate) * 100);

  return (
    <DashboardLayout title={t('Paramètres généraux & règles métier')}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <span className="overline text-primary">{t('Console ops · Configuration globale plateforme')}</span>
            <h2 className="page-title mt-1">{t('Paramètres généraux & règles métier')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low dark:bg-slate-900 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="cloud_done" size={18} />{t('Dernière mise à jour : {{date}}', { date: formatDateTime(form.updated_at) })}
            </span>
            <button onClick={save} disabled={!dirty || saving} className="btn-primary"><Icon name="save" size={20} />{saving ? t('Enregistrement…') : t('Sauvegarder les modifications')}</button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`} className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container dark:bg-slate-900 font-label-md text-label-md text-on-surface-variant">{t(s.label)}</a>)}
        </nav>

        {message && <div className={`rounded-xl px-4 py-3 font-label-lg text-label-lg ${message.error ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed/40 text-on-primary-fixed-variant'}`}>{message.text}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
          <Section id="commissions" index={1} icon="payments" title="Commissions & frais de service" subtitle="Répartition financière appliquée à chaque nouvelle réservation (FCFA / XAF).">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t('Commission AutoLink')}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Prélevée sur le montant de la location, le reste revient au propriétaire.')}</span>
                <span className="flex items-center gap-2 px-3 rounded-lg bg-surface-container-lowest dark:bg-slate-800">
                  <input type="number" min={0} max={100} value={commissionPercent}
                    onChange={(e) => set('commission_rate')((Math.min(100, Math.max(0, Number(e.target.value))) / 100).toFixed(2))}
                    className="w-full bg-transparent py-2 font-headline-md text-headline-md focus:outline-none dark:text-white" />
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant">%</span>
                </span>
              </label>
              <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t('Exemple sur 100 000 FCFA')}</span>
                <div className="flex justify-between font-body-md text-body-md"><span>{t('Commission AutoLink')}</span><strong>{formatNumber(1000 * commissionPercent)} F</strong></div>
                <div className="flex justify-between font-body-md text-body-md"><span>{t('Part propriétaire')}</span><strong className="text-primary">{formatNumber(100000 - 1000 * commissionPercent)} F</strong></div>
                <div className="flex justify-between font-body-md text-body-md"><span>{t('Chauffeur')}</span><strong>{formatNumber(form.driver_daily_fee || 0)} F/j</strong></div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Le chauffeur reçoit le forfait journalier complet, versé sur son solde à la clôture.')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <label className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t('Tarif chauffeur / jour')}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Facturé au client pour l\'option « Chauffeur AutoLink ».')}</span>
                <span className="flex items-center gap-2 px-3 rounded-lg bg-surface-container-lowest dark:bg-slate-800">
                  <input type="number" min={0} step={500} value={Math.round(Number(form.driver_daily_fee || 0))}
                    onChange={(e) => set('driver_daily_fee')(e.target.value)}
                    className="w-full bg-transparent py-2 font-headline-md text-headline-md focus:outline-none dark:text-white" />
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant">FCFA</span>
                </span>
              </label>
              <label className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
                <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t('Frais de livraison')}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Facturés au client pour la remise du véhicule à domicile.')}</span>
                <span className="flex items-center gap-2 px-3 rounded-lg bg-surface-container-lowest dark:bg-slate-800">
                  <input type="number" min={0} step={500} value={Math.round(Number(form.delivery_fee || 0))}
                    onChange={(e) => set('delivery_fee')(e.target.value)}
                    className="w-full bg-transparent py-2 font-headline-md text-headline-md focus:outline-none dark:text-white" />
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant">FCFA</span>
                </span>
              </label>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-secondary-fixed/40 dark:bg-slate-900 flex items-start gap-2 font-body-sm text-body-sm text-on-secondary-fixed-variant dark:text-slate-300">
              <Icon name="info" size={18} />{t('Les réservations existantes conservent la commission calculée lors de leur création.')}
            </div>
          </Section>

          <Section id="gateways" index={3} icon="account_balance_wallet" title="Passerelles & seuils" subtitle="État de configuration des moyens de paiement (variables d'environnement serveur).">
            <label className="p-4 mb-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-1">
              <span className="overline">{t('Retrait bailleur minimum')}</span>
              <span className="flex items-center gap-2">
                <input type="number" min={0} step={500} value={Math.round(Number(form.min_withdrawal_amount))} onChange={(e) => set('min_withdrawal_amount')(e.target.value)}
                  className="w-full bg-transparent font-headline-md text-headline-md focus:outline-none dark:text-white" />
                <span className="font-label-md text-label-md text-on-surface-variant">FCFA</span>
              </span>
            </label>
            <div className="flex flex-col gap-2">
              {GATEWAYS.map((g) => {
                const enabled = configured.includes(g.id);
                return (
                  <div key={g.id} className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-sm text-label-sm font-black ${g.tile}`}>{g.short}</span>
                    <span className="flex-1 min-w-0"><span className="block font-label-lg text-label-lg text-on-surface dark:text-white">{t(g.label)}</span><span className="block font-body-sm text-body-sm text-on-surface-variant">{t(g.detail)}</span></span>
                    <span className={enabled ? 'badge-success' : 'badge-neutral'}>{enabled ? t('Actif') : t('Non configuré')}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <Section id="tiers" index={2} icon="tune" title="Grille tarifaire par gamme & caution" subtitle="Barème de classification automatique : prix indicatif, marge propriétaire ±20 % et caution par défaut.">
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30 dark:border-slate-700">
            <table className="w-full min-w-[760px]">
              <thead className="table-head"><tr>{['Gamme', 'Prix plancher / jour', 'Prix indicatif', 'Prix plafond / jour', 'Caution séquestrée', 'Forfait km', 'Véhicules'].map((h) => <th key={h} className="px-4 py-3">{t(h)}</th>)}</tr></thead>
              <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                {(form.tiers || []).map((tier) => (
                  <tr key={tier.tier}>
                    <td className="px-4 py-3"><span className={TIER_STYLES[tier.tier] || 'badge-neutral'}>{t(tier.label)}</span></td>
                    <td className="px-4 py-3"><span className="px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 font-label-md text-label-md">{formatNumber(tier.min_rate)} FCFA</span></td>
                    <td className="px-4 py-3 font-label-lg text-label-lg">{formatNumber(tier.base_rate)} FCFA</td>
                    <td className="px-4 py-3"><span className="px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900 font-label-md text-label-md">{formatNumber(tier.max_rate)} FCFA</span></td>
                    <td className="px-4 py-3"><span className="px-3 py-1.5 rounded-lg bg-secondary-fixed/50 text-on-secondary-fixed-variant font-label-lg text-label-lg">{formatNumber(tier.deposit)} FCFA</span></td>
                    <td className="px-4 py-3 font-body-sm text-body-sm">{t('{{km}} km/j · {{rate}} F/km sup.', { km: tier.km_included, rate: formatNumber(tier.extra_km_rate) })}</td>
                    <td className="px-4 py-3 font-label-lg text-label-lg">{tier.vehicles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Section id="rules" index={4} icon="timer" title="Délais & disponibilité" subtitle="Règles d'engagement des propriétaires et ouverture du service.">
            <label className="p-4 mb-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col gap-2">
              <span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t("Délai limite d'acceptation propriétaire")}</span>
              <span className="flex items-center gap-3">
                <input type="number" min={1} max={168} value={form.owner_response_hours} onChange={(e) => set('owner_response_hours')(Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-lg bg-surface-container-lowest dark:bg-slate-800 font-headline-md text-headline-md focus:outline-none dark:text-white" />
                <span className="font-body-md text-body-md text-on-surface-variant">{t('heures après la demande')}</span>
              </span>
            </label>
            {[
              { key: 'bookings_enabled', title: 'Réservations ouvertes', text: 'Désactivez pour suspendre temporairement les nouvelles réservations.' },
              { key: 'maintenance_mode', title: 'Mode maintenance', text: 'Affiche un bandeau de maintenance aux utilisateurs.' },
            ].map((item) => (
              <div key={item.key} className="p-4 mb-2 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center justify-between gap-3">
                <div><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(item.title)}</div><p className="font-body-sm text-body-sm text-on-surface-variant">{t(item.text)}</p></div>
                <Toggle checked={Boolean(form[item.key])} onChange={set(item.key)} label={t(item.title)} />
              </div>
            ))}
          </Section>

          <Section id="contact" index={5} icon="hub" title="Coordonnées & pôles opérationnels" subtitle="Informations publiées sur le site (contact, aide, reçus).">
            <div className="flex flex-col gap-3">
              <label><span className="label">{t('Email de contact')}</span><input type="email" value={form.contact_email || ''} onChange={(e) => set('contact_email')(e.target.value)} className="input-field" placeholder="contact@autolink.cm" /></label>
              <label><span className="label">{t('Téléphones (séparés par des virgules)')}</span><input value={form.phones || ''} onChange={(e) => set('phones')(e.target.value)} className="input-field" /></label>
              <label><span className="label">{t('Adresses des agences (séparées par |)')}</span><textarea rows={3} value={form.addresses || ''} onChange={(e) => set('addresses')(e.target.value)} className="input-field" /></label>
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-6">
          <Section id="legal" index={6} icon="gavel" title="Textes légaux & conformité" subtitle="Documents publiés sur la plateforme.">
            <div className="flex flex-col gap-2">
              {[
                { to: '/terms', icon: 'description', label: "Conditions générales d'utilisation" },
                { to: '/privacy', icon: 'shield_person', label: 'Politique de confidentialité' },
                { to: '/cookies', icon: 'cookie', label: 'Politique cookies' },
              ].map((doc) => (
                <Link key={doc.to} to={doc.to} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container dark:bg-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface dark:text-white"><Icon name={doc.icon} className="text-on-surface-variant" />{t(doc.label)}</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-lowest dark:bg-slate-800 font-label-md text-label-md">{t('Consulter')}</span>
                </Link>
              ))}
            </div>
          </Section>

          <Section id="team" index={7} icon="admin_panel_settings" title="Équipe administrative & rôles console" subtitle="Comptes disposant d'un accès console."
            aside={<Link to="/admin/users" className="btn-primary py-2 px-3"><Icon name="person_add" size={18} />{t('Gérer')}</Link>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="table-head"><tr>{['Utilisateur & email', 'Rôle système', 'Statut'].map((h) => <th key={h} className="px-4 py-3">{t(h)}</th>)}</tr></thead>
                <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                  {team.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-full bg-inverse-surface text-inverse-on-surface flex items-center justify-center font-label-sm text-label-sm">{`${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase() || 'A'}</span><span><span className="block font-label-md text-label-md text-on-surface dark:text-white">{member.first_name} {member.last_name}</span><span className="block text-[11px] text-on-surface-variant">{member.email}</span></span></div></td>
                      <td className="px-4 py-3"><span className={member.role === 'ADMIN' ? 'badge-info' : 'badge-warning'}>{member.role === 'ADMIN' ? t('Super-admin') : t('Contrôleur flotte')}</span></td>
                      <td className="px-4 py-3"><span className={member.is_active ? 'badge-success' : 'badge-neutral'}>{member.is_active ? t('Actif') : t('Suspendu')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </DashboardLayout>
  );
}
