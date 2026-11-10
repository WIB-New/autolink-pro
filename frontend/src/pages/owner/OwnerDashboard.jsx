import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OwnerLayout, BalanceCard, PriorityRequests, StatsRow,
  RevenueChart, StatusDonut, RecentPayments, UpcomingBookings,
} from '../../components/ownerdash';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { bookingsAPI, vehiclesAPI, walletAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ownerNet } from '../../utils/commission';

const POLL = 15000;
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const DAY = 86400000;
const BOOKED = ['completed', 'active', 'confirmed'];

/* Jours loués sur les 30 derniers jours (chevauchement de chaque location avec la fenêtre). */
const bookedDaysLast30 = (bookings) => {
  const end = Date.now();
  const start = end - 30 * DAY;
  return bookings.filter(b => BOOKED.includes(b.status)).reduce((s, b) => {
    const from = Math.max(new Date(b.start_date).getTime(), start);
    const to = Math.min(new Date(b.end_date).getTime() + DAY, end);
    return s + Math.max(0, (to - from) / DAY);
  }, 0);
};

/* Revenus nets propriétaire + nombre de locations agrégés par mois. */
const revenueSeries = (bookings) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  return months.map(m => {
    const monthBookings = bookings
      .filter(b => BOOKED.includes(b.status))
      .filter(b => { const d = new Date(b.start_date || b.created_at); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); });
    return {
      month: MONTHS[m.getMonth()],
      revenue: monthBookings.reduce((s, b) => s + ownerNet(b), 0),
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
  const [stats, setStats] = useState(null);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [v, b, w, s] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 200 }),
        walletAPI.get(),
        bookingsAPI.ownerStats(),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setBalance(Number(w.data.balance || 0));
      setStats(s.data);
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
  const activeVehicles = stats?.vehicles_online ?? vehicles.filter(v => v.status === 'approved' || v.status === 'rented').length;
  const totalEarned = stats ? Number(stats.revenue_total || 0) : bookings.filter(b => b.status === 'completed').reduce((s, b) => s + ownerNet(b), 0);
  const occupancy = stats ? Number(stats.occupancy_rate || 0) : (activeVehicles ? Math.min(100, bookedDaysLast30(bookings) / (activeVehicles * 30) * 100) : 0);
  const revenuePerDay = stats ? Number(stats.revenue_per_day || 0) : bookings
    .filter(b => BOOKED.includes(b.status) && new Date(b.start_date).getTime() >= Date.now() - 30 * DAY)
    .reduce((s, b) => s + ownerNet(b), 0) / 30;
  const pendingPayout = stats ? Number(stats.pending_escrow || 0) : bookings.filter(b => ['confirmed', 'active'].includes(b.status)).reduce((s, b) => s + ownerNet(b), 0);
  const rating = stats ? Number(stats.average_rating || 0).toFixed(1) : '—';

  /* Série mensuelle : revenus = payouts réellement versés (owner-stats backend),
     nombre de locations calculé côté client sur les bookings chargés. */
  const series = stats?.monthly_series?.length
    ? stats.monthly_series.map(m => {
        const [y, mo] = m.month.split('-').map(Number);
        const count = bookings.filter(b => BOOKED.includes(b.status) && (() => { const d = new Date(b.start_date || b.created_at); return d.getMonth() === mo - 1 && d.getFullYear() === y; })()).length;
        return { month: MONTHS[(mo || 1) - 1], revenue: Number(m.revenue || 0), count };
      })
    : revenueSeries(bookings);
  const spark = series.map((m, i) => ({ i, v: m.revenue / 1000 }));

  return (
    <OwnerLayout badges={{ demandes: pendingCount }} balance={balance}>
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

        {/* Réservations en attente de paiement client */}
        <PriorityRequests bookings={bookings} />

        {/* KPIs */}
        <StatsRow
          occupancy={occupancy}
          rating={rating}
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
