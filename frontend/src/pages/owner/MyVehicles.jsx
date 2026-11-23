import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, SlidersHorizontal, Car, RefreshCw, FileEdit, Trash2, Play } from 'lucide-react';
import { OwnerLayout } from '../../components/ownerdash';
import { FleetKpis, FleetToolbar, FleetCard, PricingModal, filterByTab } from '../../components/ownerfleet';
import { vehiclesAPI, bookingsAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';

const SORTERS = {
  revenue: (a, b) => Number(b.total_earned || 0) - Number(a.total_earned || 0),
  rate:    (a, b) => Number(b.daily_rate || 0) - Number(a.daily_rate || 0),
  score:   (a, b) => Number(b.condition_score || 0) - Number(a.condition_score || 0),
  recent:  (a, b) => (b.id || 0) - (a.id || 0),
};

export default function MyVehicles() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('revenue');
  const [grid, setGrid] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [v, b, d] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 50 }),
        vehiclesAPI.draft.list().catch(() => ({ data: { drafts: [] } })),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setDrafts(d.data.drafts || []);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteVehicle = async (v) => {
    if (!(await confirm({
      title: 'Supprimer ce véhicule ?',
      message: `${v.brand} ${v.model} ${v.year} (${v.plate}) sera définitivement retiré du catalogue. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    }))) return;
    try {
      await vehiclesAPI.delete(v.id);
      await load();
    } catch (e) {
      await confirm({
        title: 'Suppression impossible',
        message: e?.response?.data?.detail || 'Le serveur a refusé la suppression.',
        confirmLabel: 'Compris',
      });
    }
  };

  const deleteDraft = async (d) => {
    if (!(await confirm({
      title: 'Supprimer ce brouillon ?',
      message: `Le brouillon « ${d.title} » (étape ${d.step}/6) sera définitivement supprimé.`,
      confirmLabel: 'Supprimer',
      danger: true,
    }))) return;
    try {
      await vehiclesAPI.draft.remove(d.id);
      setDrafts(ds => ds.filter(x => x.id !== d.id));
    } catch (_) { /* silencieux */ }
  };

  const resumeDraft = (d) =>
    navigate(d.vehicle ? `/owner/edit-vehicle/${d.vehicle}` : '/owner/add-vehicle');

  const activeBookingFor = useCallback((v) =>
    bookings.find(b => ['active', 'confirmed'].includes(b.status) && (b.vehicle === v.id || b.vehicle_id === v.id)),
  [bookings]);

  const cities = useMemo(() => [...new Set(vehicles.map(v => v.city).filter(Boolean))], [vehicles]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filterByTab(vehicles, tab)
      .filter(v => !city || v.city === city)
      .filter(v => !q || `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(q))
      .sort(SORTERS[sort] || SORTERS.revenue);
  }, [vehicles, tab, city, search, sort]);

  const rented = vehicles.filter(v => v.status === 'rented').length;
  const activeMissions = bookings.filter(b => ['active', 'confirmed'].includes(b.status)).length;
  const revenue = vehicles.reduce((s, v) => s + Number(v.total_earned || 0), 0);
  const scored = vehicles.filter(v => v.condition_score);
  const avgScore = scored.length ? scored.reduce((s, v) => s + Number(v.condition_score), 0) / scored.length : 0;
  const toOptimize = vehicles.filter(v => v.status === 'pending' || Number(v.condition_score || 0) < 80).length;

  return (
    <OwnerLayout badges={{ demandes: bookings.filter(b => b.status === 'pending').length }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900">Mes véhicules</h1>
            {!online && <button onClick={load} className="inline-flex items-center gap-1 text-[11px] text-red-500 font-bold"><RefreshCw size={11} /> Hors ligne</button>}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={() => setPricingOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
              <SlidersHorizontal size={14} /> Tarification dynamique
            </button>
            <button onClick={() => navigate('/owner/add-vehicle')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-md">
              <PlusCircle size={14} /> Ajouter un véhicule
            </button>
          </div>
        </div>

        {/* KPI */}
        <FleetKpis
          total={vehicles.length}
          rented={rented}
          activeMissions={activeMissions}
          occupancy={vehicles.length ? (activeMissions / vehicles.length) * 100 : 0}
          revenue={revenue}
          avgScore={avgScore}
          toOptimize={toOptimize}
        />

        {/* Filtres */}
        <FleetToolbar
          vehicles={vehicles}
          tab={tab} setTab={setTab}
          search={search} setSearch={setSearch}
          city={city} setCity={setCity} cities={cities}
          sort={sort} setSort={setSort}
          grid={grid} setGrid={setGrid}
          drafts={drafts}
        />

        {/* Liste */}
        {tab === 'drafts' ? (
          drafts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-14 text-slate-400">
              <FileEdit size={40} className="mx-auto mb-4 opacity-40" />
              <p className="font-bold text-slate-500">Aucun brouillon enregistré</p>
              <p className="text-sm mt-1">Les brouillons du wizard « Ajouter un véhicule » apparaîtront ici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map(d => (
                <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <FileEdit size={17} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-sm font-black text-slate-900">{d.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {d.vehicle ? 'Modification d\'un véhicule existant' : 'Création d\'un nouveau véhicule'}
                      {' · '}Étape {d.step}/6
                      {d.updated_at && ` · Modifié le ${new Date(d.updated_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resumeDraft(d)}
                      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-colors">
                      <Play size={12} /> Reprendre
                    </button>
                    <button onClick={() => deleteDraft(d)}
                      className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-500 text-[11px] font-bold px-4 py-2 rounded-xl transition-colors">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-16 text-slate-400">
            <Car size={44} className="mx-auto mb-4 opacity-40" />
            <p className="font-bold text-slate-500">Aucun véhicule enregistré</p>
            <p className="text-sm mt-1">Ajoutez votre premier véhicule pour commencer à gagner.</p>
            <button onClick={() => navigate('/owner/add-vehicle')}
              className="mt-5 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
              <PlusCircle size={15} /> Ajouter un véhicule
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-14 text-slate-400">
            <p className="font-bold text-slate-500">Aucun véhicule ne correspond à ces filtres.</p>
            <button onClick={() => { setTab('all'); setSearch(''); setCity(''); }}
              className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700">Réinitialiser les filtres</button>
          </div>
        ) : (
          <div className={grid ? 'grid xl:grid-cols-2 gap-5' : 'space-y-5'}>
            {visible.map(v => <FleetCard key={v.id} v={v} activeBooking={activeBookingFor(v)} onDelete={deleteVehicle} />)}
          </div>
        )}

        {/* Upsell chauffeur */}
        {/* <DriverUpsell /> */}

        {pricingOpen && (
          <PricingModal vehicles={vehicles} onClose={() => setPricingOpen(false)} onApplied={load} />
        )}
      </div>
    </OwnerLayout>
  );
}
