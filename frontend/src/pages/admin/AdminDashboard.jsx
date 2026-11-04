import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { PriorityQueue, KpiCards, RevenueChart, TierRepartition, PlatformRevenue, AuditLog, RecentBookings } from '../../components/admindash';
import { bookingsAPI, usersAPI, vehiclesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const POLL_INTERVAL = 8000;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [busy, setBusy] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, b, u, v] = await Promise.all([
        bookingsAPI.stats(),
        bookingsAPI.list({ page_size: 50 }),
        usersAPI.list({ page_size: 50 }),
        vehiclesAPI.list({ page_size: 50 }),
      ]);
      setStats(s.data);
      setBookings(b.data.results || b.data);
      setUsers(u.data.results || u.data);
      setVehicles(v.data.results || v.data);
      setOnline(true);
      setLastSync(new Date());
    } catch (_) {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchAll]);

  const resolveDispute = async (id, decision) => {
    setBusy(id);
    try { await bookingsAPI.resolveDispute(id, decision); await fetchAll(); } catch (_) {}
    setBusy(null);
  };

  const setVehicleStatus = async (v, status) => {
    try { await vehiclesAPI.update(v.id, { status }); await fetchAll(); } catch (_) {}
  };

  const disputedBookings = bookings.filter(b => b.status === 'disputed');
  const pendingVehicles = vehicles.filter(v => v.status === 'pending');
  const pendingClients = users.filter(u => u.role === 'CLIENT' && !u.is_verified).length;
  const urgentCount = pendingVehicles.length + disputedBookings.length + pendingClients;

  const grossRevenue = useMemo(() =>
    bookings.reduce((s, b) => s + Number(b.subtotal || 0), 0), [bookings]);
  const commission = useMemo(() =>
    bookings.reduce((s, b) => s + Number(b.commission_amount || 0), 0), [bookings]);
  const activeFleet = vehicles.filter(v => v.status === 'approved').length;

  const sparkData = useMemo(() =>
    bookings.slice(0, 10).map((b, i) => ({ i, v: Number(b.subtotal || 0) / 1000 })), [bookings]);

  const badges = {
    reservations: bookings.filter(b => b.status === 'pending').length,
    vehicles: vehicles.length,
    owners: users.filter(u => u.role === 'OWNER').length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    disputes: disputedBookings.length,
    finances: 0,
    messages: 0,
  };

  return (
    <AdminLayout
      title={`Bienvenue, ${user?.first_name || user?.firstName || 'Admin'}`}
      subtitle={
        <span className="flex items-center gap-3">
          <span>{online ? `Synchro ${lastSync?.toLocaleTimeString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))}` : 'API injoignable'}</span>
          {online ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className="text-red-500" />}
        </span>
      }
      badges={badges}
    >
      {/* Bandeau urgences */}
      <PriorityQueue
        pendingVehicles={pendingVehicles}
        disputedBookings={disputedBookings}
        pendingClients={pendingClients}
        pendingPayouts={0}
        urgentCount={urgentCount}
      />

      {/* KPIs */}
      <KpiCards
        grossRevenue={grossRevenue}
        commission={commission || (stats?.commission_total ?? 0)}
        activeFleet={activeFleet}
        totalFleet={vehicles.length}
        interventions={bookings.length}
        sparkData={sparkData}
      />

      {/* Donut + rapports + revenus plateforme */}
      <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5 mb-6 items-stretch">
        <TierRepartition vehicles={vehicles} />
        <RevenueChart bookings={bookings} />
        <PlatformRevenue
          commission={commission || (stats?.commission_total ?? 0)}
          grossRevenue={grossRevenue}
          sparkData={sparkData}
        />
      </div>

      {/* Actions — litiges + véhicules à valider */}
      {(disputedBookings.length > 0 || pendingVehicles.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {disputedBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 p-4">
              <h3 className="font-black text-red-700 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle size={15} /> Litiges à arbitrer
              </h3>
              <div className="space-y-2.5">
                {disputedBookings.map(b => (
                  <div key={b.id} className="border border-red-100 bg-red-50/50 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 truncate">
                          BK-{String(b.id).padStart(4, '0')} — {b.client_name} · {b.vehicle_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {b.start_date} → {b.end_date} · {Number(b.subtotal).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} F gelés
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button disabled={busy === b.id} onClick={() => resolveDispute(b.id, 'refund')}
                          className="text-[10px] font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                          Rembourser
                        </button>
                        <button disabled={busy === b.id} onClick={() => resolveDispute(b.id, 'release')}
                          className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                          Payer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingVehicles.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-black text-slate-900 text-sm mb-3">Véhicules à valider</h3>
              <div className="space-y-2">
                {pendingVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2.5">
                    <Link to={`/admin/vehicles/${v.id}`} className="min-w-0 hover:text-teal-600 transition-colors">
                      <p className="text-[12px] font-bold truncate">{v.brand} {v.model}</p>
                      <p className="text-[10px] text-slate-400">{v.plate} · {v.owner_name}</p>
                    </Link>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setVehicleStatus(v, 'approved')} title="Approuver"
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"><CheckCircle2 size={14} /></button>
                      <button onClick={() => setVehicleStatus(v, 'suspended')} title="Suspendre"
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"><XCircle size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Réservations récentes + activité */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
        <RecentBookings bookings={bookings} />
        <AuditLog bookings={bookings} vehicles={vehicles} users={users} />
      </div>

      <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-slate-400">
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
