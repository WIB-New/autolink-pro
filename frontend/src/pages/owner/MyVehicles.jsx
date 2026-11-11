import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, SlidersHorizontal, Car, RefreshCw } from 'lucide-react';
import { OwnerLayout } from '../../components/ownerdash';
import { FleetKpis, FleetToolbar, FleetCard, filterByTab } from '../../components/ownerfleet';
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
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('revenue');
  const [grid, setGrid] = useState(false);

  const load = useCallback(async () => {
    try {
      const [v, b] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 50 }),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
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
            <button className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
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
        />

        {/* Liste */}
        {vehicles.length === 0 ? (
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
      </div>
    </OwnerLayout>
  );
}
