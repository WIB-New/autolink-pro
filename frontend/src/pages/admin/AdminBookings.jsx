import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import { getVehicleImage } from '../../utils/carImages';
import {
  Search, ChevronLeft, ChevronRight, Filter,
  CheckCircle2, XCircle, CalendarRange, Car, Wifi, WifiOff, RefreshCw,
  FileSpreadsheet, Siren, Wallet, Lock, MapPin, ArrowUpDown,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';

const POLL_INTERVAL = 15000;
const PAGE_SIZE = 10;

const STATUS_STYLE = {
  pending:   { label: 'En attente',    cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  active:    { label: 'En cours',      cls: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Terminée',      cls: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
  disputed:  { label: 'Litige',        cls: 'bg-red-500 text-white' },
};

const TABS = [
  { id: 'all',       label: 'Toutes' },
  { id: 'pending',   label: 'À transmettre au bailleur' },
  { id: 'confirmed', label: 'Confirmées & En attente départ' },
  { id: 'active',    label: 'En cours / Sur route' },
  { id: 'disputed',  label: 'Litiges' },
  { id: 'completed', label: 'Terminées' },
];

const DRIVER_LABEL = { internal: 'Chauffeur AutoLink', owner: 'Chauffeur proprio', none: 'Sans chauffeur' };

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const shortDate = iso => iso ? new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }) : '—';
const hubOf = b => /yaound|yde/i.test(b.pickup_address || '') ? 'Yaoundé' : 'Douala';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [hub, setHub] = useState('all');
  const [tier, setTier] = useState('all');
  const [mode, setMode] = useState('all');
  const [sort, setSort] = useState('depart');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [b, v] = await Promise.all([
        bookingsAPI.list({ page_size: 200 }),
        vehiclesAPI.list({ page_size: 200 }),
      ]);
      setBookings(b.data.results || b.data);
      setVehicles(v.data.results || v.data);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchAll]);

  const vehicleById = useMemo(() => {
    const m = {};
    vehicles.forEach(v => { m[v.id] = v; });
    return m;
  }, [vehicles]);

  const setStatus = async (b, status) => {
    setBusy(b.id);
    try { await bookingsAPI.updateStatus(b.id, status); await fetchAll(); } catch (_) {}
    setBusy(null);
  };

  const counts = useMemo(() => {
    const c = { all: bookings.length };
    TABS.forEach(t => { if (t.id !== 'all') c[t.id] = bookings.filter(b => b.status === t.id).length; });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    let list = bookings.filter(b =>
      (tab === 'all' || b.status === tab) &&
      (hub === 'all' || hubOf(b) === hub) &&
      (mode === 'all' || (b.driver_type || 'none') === mode) &&
      (tier === 'all' || (vehicleById[b.vehicle]?.tier || 'standard') === tier) &&
      (!query || `${b.id} ${b.client_name || ''} ${b.vehicle_name || ''}`.toLowerCase().includes(query.toLowerCase()))
    );
    if (sort === 'depart')  list = [...list].sort((a, b2) => new Date(a.start_date) - new Date(b2.start_date));
    if (sort === 'montant') list = [...list].sort((a, b2) => Number(b2.subtotal) - Number(a.subtotal));
    if (sort === 'recent')  list = [...list].sort((a, b2) => new Date(b2.created_at) - new Date(a.created_at));
    return list;
  }, [bookings, tab, hub, mode, tier, query, sort, vehicleById]);

  useEffect(() => { setPage(1); }, [tab, hub, mode, tier, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const gross = bookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const escrowed = bookings.filter(b => b.escrow_status === 'held').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const urgent = counts.pending || 0;
  const monthCount = bookings.filter(b => { const d = new Date(b.created_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length;


  return (
    <AdminLayout
      title={
        <span className="flex items-center justify-between gap-3 flex-wrap">
          <span>Gestion des Réservations</span>
          <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors">
            <FileSpreadsheet size={13} className="text-teal-600" /> Export Excel / CSV
          </button>
        </span>
      }
      subtitle=""
      badges={{ reservations: urgent }}
    >

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={CalendarRange} iconCls="bg-blue-50 text-blue-600" value={monthCount} unit="réservations" label="Ce mois-ci" />
        <StatCard icon={Siren} iconCls="bg-red-50 text-red-600" value={urgent} unit="à traiter" label="Action requise" />
        <StatCard icon={Wallet} iconCls="bg-emerald-50 text-emerald-600" value={fmt(gross)} unit="FCFA" label="Volume brut" />
        <StatCard icon={Lock} iconCls="bg-amber-50 text-amber-600" value={fmt(escrowed)} unit="FCFA" label="Cautions séquestrées" />
      </div>

      {/* Onglets + filtres — carte unique style pro */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
        <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-teal-600 text-white' : t.id === 'disputed' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {counts[t.id] || 0}
              </span>
              {tab === t.id && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          ))}
        </div>
        <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <FilterField label="Recherche" icon={Search} value={query} onChange={setQuery}
            placeholder="N° dossier, client, véhicule…" />
          <FilterField label="Hub" icon={MapPin} type="select" value={hub} onChange={setHub}
            options={[{ value: 'all', label: 'Tous' }, 'Douala', 'Yaoundé']} />
          <FilterField label="Gamme" icon={Car} type="select" value={tier} onChange={setTier}
            options={[
              { value: 'all', label: 'Toutes' },
              { value: 'basic', label: 'Économique' },
              { value: 'standard', label: 'Standard' },
              { value: 'premium', label: 'Premium' },
              { value: 'gold', label: 'Gold' },
              { value: 'collection', label: 'Collection' },
            ]} />
          <FilterField label="Mode" icon={Filter} type="select" value={mode} onChange={setMode}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'internal', label: 'Chauffeur AutoLink' },
              { value: 'owner', label: 'Chauffeur proprio' },
              { value: 'none', label: 'Sans chauffeur' },
            ]} />
          <FilterField label="Tri" icon={ArrowUpDown} type="select" value={sort} onChange={setSort}
            options={[
              { value: 'depart', label: 'Urgence départ' },
              { value: 'recent', label: 'Plus récentes' },
              { value: 'montant', label: 'Montant décroissant' },
            ]} />
        </div>
      </div>

      {/* Table des réservations */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[980px]">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="pl-5 pr-3 py-3"><input type="checkbox" className="accent-teal-600" /></th>
                <th className="px-3 py-3">N° Dossier &amp; Date</th>
                <th className="px-3 py-3">Client Locataire</th>
                <th className="px-3 py-3">Véhicule &amp; Immat</th>
                <th className="px-3 py-3">Propriétaire / Flotte</th>
                <th className="px-3 py-3">Dates &amp; Durée</th>
                <th className="px-3 py-3">Montant &amp; Caution séquestre</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pageItems.map(b => {
                const v = vehicleById[b.vehicle];
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                const img = v ? (v.image_url || getVehicleImage(v.category)) : getVehicleImage('default');
                const days = b.days || Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000));
                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="pl-5 pr-3 py-3.5"><input type="checkbox" className="accent-teal-600" /></td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <Link to={`/admin/reservations/${b.id}`} className="text-[12px] font-black text-slate-900 hover:text-teal-600 transition-colors">
                        #ALP-{String(b.id).padStart(4, '0')}
                      </Link>
                      <div className="text-[9px] text-slate-400">Créé {shortDate(b.created_at)} · {hubOf(b)}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="text-[11px] font-bold text-slate-800 truncate max-w-[130px]">{b.client_name || 'Client'}</div>
                      <div className="text-[9px] text-slate-400">{DRIVER_LABEL[b.driver_type] || DRIVER_LABEL.none}</div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <img src={img} alt="" className="w-11 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-slate-800 leading-tight max-w-[140px] truncate">{b.vehicle_name || `${v?.brand || ''} ${v?.model || ''}`}</div>
                          <div className="text-[9px] text-slate-400">{v?.plate || '—'} · {v?.tier || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{v?.owner_name || 'Flotte AutoLink'}</div>
                      <div className="text-[9px] text-slate-400">Particulier · {v?.city || 'Douala'}</div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="text-[11px] font-bold text-slate-800">{shortDate(b.start_date)} → {shortDate(b.end_date)}</div>
                      <div className="text-[9px] text-slate-400">Départ dans {Math.max(0, Math.ceil((new Date(b.start_date) - Date.now()) / 86400000))} j · Durée {days} j</div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="text-[12px] font-black text-slate-900">{fmt(b.subtotal)} <span className="text-[9px] font-bold text-slate-400">FCFA</span></div>
                      <div className="text-[9px] text-slate-400">Caution : {fmt(b.deposit_amount)} F
                        {b.escrow_status && ` · ${b.escrow_status === 'held' ? 'bloquée' : b.escrow_status === 'released' ? 'versée' : 'remboursée'}`}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-3.5 pr-5 text-right whitespace-nowrap">
                      {b.status === 'pending' && (
                        <div className="flex justify-end gap-1.5">
                          <button disabled={busy === b.id} onClick={() => setStatus(b, 'confirmed')} title="Confirmer"
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"><CheckCircle2 size={13} /></button>
                          <button disabled={busy === b.id} onClick={() => setStatus(b, 'cancelled')} title="Annuler"
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"><XCircle size={13} /></button>
                        </div>
                      )}
                      {b.status === 'disputed' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-600"><Siren size={11} /> Arbitrage requis</span>
                      )}
                      {b.status === 'confirmed' && (
                        <button disabled={busy === b.id} onClick={() => setStatus(b, 'active')} title="Démarrer"
                          className="text-[9px] font-black px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50">Démarrer</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-14 text-center text-xs text-slate-400">
                  <Car size={22} className="mx-auto mb-2 text-slate-300" /> Aucune réservation ne correspond aux filtres.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400 font-semibold">
            Affichage de {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} réservations
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronLeft size={14} /></button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = page <= 3 ? i + 1 : Math.min(page - 2 + i, totalPages - 4 + i);
                return p > 0 && p <= totalPages && (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-[11px] font-bold ${p === page ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Bande protocole */}
      {/* <div className="bg-slate-900 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={17} className="text-teal-400" />
          </span>
          <div className="text-[10px] text-slate-300 leading-relaxed">
            <strong className="text-white">Protocole Garantie AutoLink Pro · CEMAC Hubs</strong><br />
            Toutes les réservations bénéficient du numéro certifié, séquestre Mobile Money (MTN MoMo / Orange Money) et traçage GPS actif.
          </div>
        </div>
        <span className="text-[10px] font-black text-teal-400 whitespace-nowrap">Passerelle MoMo / OM : 100 % opérationnelle</span>
      </div> */}

      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
        <span className="flex items-center gap-1.5">
          {online ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className="text-red-500" />}
          {online ? `Connecté — synchro auto ${POLL_INTERVAL / 1000}s` : 'API injoignable'}
        </span>
        <button onClick={fetchAll} className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
          <RefreshCw size={11} /> Actualiser
        </button>
      </div>
    </AdminLayout>
  );
}
