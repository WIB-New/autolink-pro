import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { useConfirm } from '../../contexts/ConfirmContext';
import { adminVehiclesAPI, messagingAPI, usersAPI, withdrawalsAPI } from '../../services/api';
import { formatDate, formatNumber, formatTime, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.admin.AdminOwners', text, options);

const FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'verified', label: 'KYC validé' },
  { value: 'review', label: 'En revue' },
  { value: 'withdrawal', label: 'Retrait en attente' },
];

const VEHICLE_STATUS = {
  approved: { label: 'En ligne (dispo)', cls: 'badge-success' },
  rented: { label: 'En location', cls: 'badge-info' },
  pending: { label: 'En validation', cls: 'badge-warning' },
  maintenance: { label: 'En maintenance', cls: 'badge-error' },
  suspended: { label: 'Suspendu', cls: 'badge-neutral' },
};

const KYC = {
  approved: { label: 'Documents validés', cls: 'badge-success', icon: 'verified' },
  pending: { label: 'KYC en revue', cls: 'badge-warning', icon: 'pending' },
  rejected: { label: 'KYC refusé', cls: 'badge-error', icon: 'gpp_bad' },
  none: { label: 'Aucun document', cls: 'badge-neutral', icon: 'help' },
};

const initialsOf = (u) => `${u?.first_name?.[0] || ''}${u?.last_name?.[0] || ''}`.toUpperCase() || 'P';
const fullName = (u) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || u?.username;

export default function AdminOwners() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [owners, setOwners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [fleet, setFleet] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [ownersRes, withdrawalsRes] = await Promise.all([
        usersAPI.list({ role: 'OWNER', page_size: 200, ordering: '-created_at' }),
        withdrawalsAPI.list({ status: 'pending', page_size: 200, ordering: 'created_at' }),
      ]);
      setOwners(ownersRes.data.results || ownersRes.data || []);
      setWithdrawals(withdrawalsRes.data.results || withdrawalsRes.data || []);
      setError('');
    } catch (_) { setError(t('API injoignable — propriétaires indisponibles.')); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingByUser = useMemo(() => withdrawals.reduce((acc, w) => ({ ...acc, [w.user]: [...(acc[w.user] || []), w] }), {}), [withdrawals]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return owners.filter((o) => {
      if (filter === 'verified' && o.kyc_status !== 'approved') return false;
      if (filter === 'review' && o.kyc_status !== 'pending') return false;
      if (filter === 'withdrawal' && !pendingByUser[o.id]) return false;
      return !query || [fullName(o), o.email, o.phone, o.city].some((v) => String(v || '').toLowerCase().includes(query));
    });
  }, [owners, filter, search, pendingByUser]);

  const selected = owners.find((o) => o.id === selectedId) || visible[0];

  useEffect(() => {
    if (!selected) return;
    adminVehiclesAPI.list({ owner: selected.id, page_size: 100 }).then(({ data }) => setFleet(data.results || data || [])).catch(() => setFleet([]));
    withdrawalsAPI.list({ user: selected.id, page_size: 20 }).then(({ data }) => setHistory(data.results || data || [])).catch(() => setHistory([]));
  }, [selected]);

  const process = async (withdrawal, approve) => {
    const ok = await confirm({
      title: approve ? t('Autoriser le virement') : t('Refuser le retrait'),
      message: approve
        ? t('Confirmez que {{amount}} FCFA ont été virés vers {{phone}}.', { amount: formatNumber(withdrawal.amount), phone: withdrawal.phone })
        : t('Le montant de {{amount}} FCFA sera recrédité sur le solde du propriétaire.', { amount: formatNumber(withdrawal.amount) }),
      confirmLabel: approve ? t('Autoriser') : t('Refuser'),
      danger: !approve,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await (approve ? withdrawalsAPI.approve(withdrawal.id, note) : withdrawalsAPI.reject(withdrawal.id, note));
      setNote('');
      await load();
      if (selected) withdrawalsAPI.list({ user: selected.id }).then(({ data }) => setHistory(data.results || []));
    } catch (e) { setError(e.response?.data?.detail || t('Action impossible.')); }
    setBusy(false);
  };

  const toggleSuspend = async () => {
    const ok = await confirm({
      title: selected.is_active ? t('Suspendre ce propriétaire') : t('Réactiver ce propriétaire'),
      message: t('Le compte de {{name}} sera {{state}}.', { name: fullName(selected), state: selected.is_active ? t('suspendu') : t('réactivé') }),
      danger: selected.is_active,
    });
    if (!ok) return;
    try { await usersAPI.update(selected.id, { is_active: !selected.is_active }); load(); } catch (e) { setError(e.response?.data?.is_active?.[0] || t('Action impossible.')); }
  };

  const openConversation = async () => {
    try { await messagingAPI.open({ user: selected.id }); navigate('/messages'); } catch (_) { setError(t('Impossible d’ouvrir la conversation.')); }
  };

  const pendingTotal = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  const kpis = [
    { label: 'Bailleurs actifs', value: owners.filter((o) => o.is_active).length, icon: 'key', sub: t('{{n}} KYC validés · {{m}} en revue', { n: owners.filter((o) => o.kyc_status === 'approved').length, m: owners.filter((o) => o.kyc_status === 'pending').length }) },
    { label: 'Flotte sous contrat', value: owners.reduce((sum, o) => sum + (o.vehicles_count || 0), 0), icon: 'directions_car', sub: t('véhicules répertoriés') },
    { label: 'Solde cumulé bailleurs', value: `${formatNumber(owners.reduce((s, o) => s + Number(o.balance || 0), 0))} F`, icon: 'account_balance', sub: t('Disponible au retrait') },
    { label: 'File retraits urgents', value: `${formatNumber(pendingTotal)} F`, icon: 'payments', sub: t('{{n}} demande(s) en attente', { n: withdrawals.length }), urgent: withdrawals.length > 0 },
  ];

  const pendingForSelected = selected ? pendingByUser[selected.id] || [] : [];
  const kyc = KYC[selected?.kyc_status] || KYC.none;

  return (
    <DashboardLayout title={t('Propriétaires & Retraits')}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`overline ${kpi.urgent ? 'text-error' : ''}`}>{t(kpi.label)}</span>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.urgent ? 'bg-error-container text-error' : 'bg-surface-container-low text-primary'}`}><Icon name={kpi.icon} /></span>
              </div>
              <div className="font-headline-xl text-headline-xl text-on-surface dark:text-white">{kpi.value}</div>
              <div className={`font-body-sm text-body-sm ${kpi.urgent ? 'text-error' : 'text-on-surface-variant'}`}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}

        {withdrawals.length > 0 && (
          <section className="card">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2 mb-4"><Icon name="output" className="text-error" />{t('File des retraits à traiter')}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{formatNumber(w.amount)} FCFA · {w.user_name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{w.method === 'mtn' ? 'MTN MoMo' : 'Orange Money'} {w.phone} · {w.reference} · {formatDate(w.created_at)} {formatTime(w.created_at)}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button disabled={busy} onClick={() => process(w, false)} className="btn-secondary py-2 px-3">{t('Refuser')}</button>
                    <button disabled={busy} onClick={() => process(w, true)} className="btn-primary py-2 px-3"><Icon name="check_circle" size={18} />{t('Autoriser')}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">
          <aside className="card p-4 flex flex-col gap-3">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Partenaires ({{n}})', { n: owners.length })}</h3>
            <label className="flex items-center gap-2 px-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
              <Icon name="search" size={20} className="text-outline" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Nom, email, téléphone…')} className="w-full bg-transparent py-2.5 font-body-md text-body-md focus:outline-none dark:text-white" />
            </label>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)} className={`px-3 py-1 rounded-full font-label-md text-label-md ${filter === f.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant dark:bg-slate-900'}`}>{t(f.label)}</button>
              ))}
            </div>
            <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto">
              {visible.map((owner) => {
                const active = selected?.id === owner.id;
                return (
                  <button key={owner.id} onClick={() => setSelectedId(owner.id)}
                    className={`text-left p-3 rounded-xl border-l-4 transition-all ${active ? 'border-primary bg-surface-container-low shadow-sm dark:bg-slate-900' : 'border-transparent hover:bg-surface-container-low/60 dark:hover:bg-slate-900/60'}`}>
                    <div className="flex items-center gap-3">
                      {owner.avatar
                        ? <img src={owner.avatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                        : <span className="w-11 h-11 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-label-lg text-label-lg shrink-0">{initialsOf(owner)}</span>}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-label-lg text-label-lg text-on-surface dark:text-white truncate">{fullName(owner)}</span>
                          {pendingByUser[owner.id] && <span className="px-1.5 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold">{t('Retrait')}</span>}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{owner.city || owner.email}</div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-on-surface-variant">
                          <span className="flex items-center gap-1"><Icon name="directions_car" size={14} />{owner.vehicles_count || 0}</span>
                          <span>{t('Solde')} {formatNumber(owner.balance)} F</span>
                          {!owner.is_active && <span className="text-error">{t('Suspendu')}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!visible.length && <p className="text-center py-6 font-body-md text-body-md text-on-surface-variant">{t('Aucun propriétaire.')}</p>}
            </div>
          </aside>

          {selected && (
            <div className="flex flex-col gap-6">
              <section className="card flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {selected.avatar
                      ? <img src={selected.avatar} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      : <span className="w-16 h-16 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-lg text-headline-lg">{initialsOf(selected)}</span>}
                    <div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{fullName(selected)}</h3>
                      <span className={kyc.cls}><Icon name={kyc.icon} size={14} />{t(kyc.label)}</span>
                      <div className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1"><Icon name="event" size={14} />{t('Partenaire depuis le {{date}}', { date: formatDate(selected.created_at) })}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.phone && <a href={`tel:${selected.phone}`} className="btn-secondary py-2 px-3"><Icon name="call" size={18} />{t('Appeler')}</a>}
                    <button onClick={openConversation} className="btn-secondary py-2 px-3"><Icon name="mail" size={18} />{t('Message')}</button>
                    <button onClick={toggleSuspend} className={selected.is_active ? 'btn-danger py-2 px-3' : 'btn-primary py-2 px-3'}><Icon name={selected.is_active ? 'block' : 'lock_open'} size={18} />{selected.is_active ? t('Suspendre') : t('Réactiver')}</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: 'smartphone', label: 'Ligne Mobile Money', value: selected.phone || '—' },
                    { icon: 'alternate_email', label: 'Email', value: selected.email },
                    { icon: 'location_on', label: 'Ville', value: selected.city || '—' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center gap-3 min-w-0">
                      <Icon name={item.icon} className="text-on-surface-variant" />
                      <div className="min-w-0"><div className="overline">{t(item.label)}</div><div className="font-label-md text-label-md text-on-surface dark:text-white truncate">{item.value}</div></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mb-4">{t('Indicateurs de performance')}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900"><div className="overline">{t('Véhicules')}</div><div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{selected.vehicles_count || 0}</div></div>
                  <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900"><div className="overline">{t('Réservations reçues')}</div><div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{fleet.reduce((s, v) => s + (v.total_bookings || 0), 0)}</div></div>
                  <div className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900"><div className="overline">{t('Volume réalisé')}</div><div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{formatNumber(fleet.reduce((s, v) => s + Number(v.total_earned || 0), 0))} F</div></div>
                  <div className="p-4 rounded-xl bg-primary text-on-primary"><div className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed">{t('Solde disponible')}</div><div className="font-headline-lg text-headline-lg">{formatNumber(selected.balance)} FCFA</div></div>
                </div>
              </section>

              <section className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="shield" className="text-primary" />{t('Conformité & dossier KYC')}</h3>
                  <button onClick={() => navigate('/admin/users')} className="font-label-md text-label-md text-primary flex items-center gap-1">{t('Gérer le KYC')}<Icon name="arrow_forward" size={16} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "Pièce d'identité", file: selected.id_document, ok: selected.id_document_verified },
                    { label: 'Permis de conduire', file: selected.driving_license, ok: selected.kyc_status === 'approved' },
                  ].map((doc) => (
                    <div key={doc.label} className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2"><Icon name="description" className="text-on-surface-variant" /><span className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(doc.label)}</span></span>
                      {doc.file
                        ? <a href={doc.file} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-label-md text-label-md text-primary">{doc.ok && <Icon name="check_circle" size={18} fill />}{t('Consulter')}</a>
                        : <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Non fourni')}</span>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="card p-0 overflow-hidden">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white p-5 pb-3 flex items-center gap-2"><Icon name="directions_car" />{t('Flotte rattachée ({{n}} véhicules)', { n: fleet.length })}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="table-head"><tr>{['Véhicule', 'Immatriculation', 'Catégorie', 'Tarif / jour', 'Statut'].map((h) => <th key={h} className="px-5 py-3">{t(h)}</th>)}</tr></thead>
                    <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                      {fleet.map((v) => (
                        <tr key={v.id}>
                          <td className="px-5 py-3"><div className="flex items-center gap-2">{(v.photos?.[0]?.image || v.image_url) ? <img src={v.photos?.[0]?.image || v.image_url} alt="" className="w-12 h-9 rounded object-cover" /> : <Icon name="directions_car" className="text-outline" />}<span className="font-label-md text-label-md text-on-surface dark:text-white">{v.brand} {v.model} {v.year}</span></div></td>
                          <td className="px-5 py-3 font-mono text-[12px]">{v.plate}</td>
                          <td className="px-5 py-3"><span className="badge-info">{v.tier_label || v.category}</span></td>
                          <td className="px-5 py-3 font-label-lg text-label-lg text-primary">{formatNumber(v.daily_rate || v.computed_rate)} FCFA</td>
                          <td className="px-5 py-3"><span className={(VEHICLE_STATUS[v.status] || VEHICLE_STATUS.pending).cls}>{t((VEHICLE_STATUS[v.status] || VEHICLE_STATUS.pending).label)}</span></td>
                        </tr>
                      ))}
                      {!fleet.length && <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">{t('Aucun véhicule rattaché.')}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="output" className="text-error" />{t('Demandes de retrait du bailleur')}</h3>
                  {pendingForSelected.length > 0 && <span className="badge-error">{t('Priorité élevée')}</span>}
                </div>
                {pendingForSelected.map((w) => (
                  <div key={w.id} className="p-4 mb-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="font-display-lg text-headline-xl text-on-surface dark:text-white">{formatNumber(w.amount)} <span className="font-label-md text-label-md">FCFA</span></div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Virement demandé vers {{method}} ({{phone}})', { method: w.method === 'mtn' ? 'MTN MoMo' : 'Orange Money', phone: w.phone })}</div>
                      <div className="font-mono text-[11px] text-on-surface-variant mt-1">{w.reference} · {formatDate(w.created_at)} {formatTime(w.created_at)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => process(w, false)} className="btn-secondary py-2 px-4">{t('Refuser')}</button>
                      <button disabled={busy} onClick={() => process(w, true)} className="btn-primary py-2 px-4"><Icon name="check_circle" size={18} />{t('Autoriser le virement')}</button>
                    </div>
                  </div>
                ))}
                {pendingForSelected.length > 0 && (
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="input-field mb-4" placeholder={t('Note interne / référence du virement (optionnel)')} />
                )}
                <div className="overline mb-2">{t('Historique')}</div>
                <div className="flex flex-col divide-y divide-outline-variant/20">
                  {history.filter((w) => w.status !== 'pending').map((w) => (
                    <div key={w.id} className="py-2 flex items-center justify-between font-body-md text-body-md">
                      <span>{formatDate(w.created_at)} · {w.reference}</span>
                      <span className="flex items-center gap-2"><strong>{formatNumber(w.amount)} F</strong><span className={w.status === 'paid' ? 'badge-success' : 'badge-error'}>{w.status === 'paid' ? t('Viré') : t('Refusé')}</span></span>
                    </div>
                  ))}
                  {!history.filter((w) => w.status !== 'pending').length && <p className="py-3 font-body-sm text-body-sm text-on-surface-variant">{t('Aucun retrait traité.')}</p>}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
