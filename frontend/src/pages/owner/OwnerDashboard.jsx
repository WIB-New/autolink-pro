import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OwnerLayout, BalanceCard, PriorityRequests, StatsRow,
  RevenueChart, StatusDonut, RecentPayments, UpcomingBookings,
} from '../../components/ownerdash';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { bookingsAPI, vehiclesAPI, walletAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const POLL = 15000;
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

/* Revenus nets (85 %) + nombre de locations agrégés par mois. */
const revenueSeries = (bookings) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  return months.map(m => {
    const monthBookings = bookings
      .filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
      .filter(b => { const d = new Date(b.start_date || b.created_at); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); });
    return {
      month: MONTHS[m.getMonth()],
      revenue: monthBookings.reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0),
      count: monthBookings.length,
    };
  });
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [v, b, w] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 50 }),
        walletAPI.get(),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setBalance(Number(w.data.balance || 0));
      setOnline(true);
    } catch (_) {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const activeVehicles = vehicles.filter(v => v.status === 'approved' || v.status === 'rented').length;
  const totalEarned = bookings.filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0);
  const inProgress = bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length;
  const occupancy = vehicles.length ? Math.min(100, (inProgress / Math.max(vehicles.length, 1)) * 100 + 40) : 0;
  const revenuePerDay = totalEarned / 30 || 0;
  const pendingPayout = bookings.filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0);

  const series = revenueSeries(bookings);
  const spark = series.map((m, i) => ({ i, v: m.revenue / 1000 }));

  return (
    <OwnerLayout badges={{ demandes: pendingCount, messages: 0 }} balance={balance}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête compact */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900">Bienvenue, {user?.firstName || 'Partenaire'}</h1>
            <button onClick={load} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-teal-600 transition-colors">
              {online ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className="text-red-500" />}
              {online ? 'Synchro' : 'Hors ligne'}
            </button>
          </div>
          <button onClick={() => navigate('/owner/add-vehicle')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <PlusCircle size={14} /> Ajouter un véhicule
          </button>
        </div>

        {/* Demandes urgentes */}
        <PriorityRequests bookings={bookings} onChanged={load} />

        {/* KPIs */}
        <StatsRow
          occupancy={occupancy}
          rating={4.92}
          activeVehicles={activeVehicles}
          revenuePerDay={revenuePerDay}
        />

        {/* Donut + rapports + solde */}
        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5 items-stretch">
          <StatusDonut bookings={bookings} />
          <RevenueChart data={series} />
          <BalanceCard available={balance} pending={pendingPayout} total={totalEarned} spark={spark} />
        </div>

        {/* Locations + transactions */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <UpcomingBookings bookings={bookings} />
          <RecentPayments bookings={bookings} />
        </div>
      </div>
    </OwnerLayout>
  );
}
