import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { OwnerLayout } from '../../components/ownerdash';
import {
  VehicleHero, VehicleStats, AuditTimeline,
  BookingCalendar, InspectionPanel,
} from '../../components/ownervehicle';
import { vehiclesAPI, bookingsAPI, inspectionsAPI } from '../../services/api';
import { Loader } from 'lucide-react';

export default function OwnerVehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rating, setRating] = useState({ avg: null, count: 0 });
  const [online, setOnline] = useState(true);
  const [blocking, setBlocking] = useState(false);

  const load = useCallback(async () => {
    try {
      const [v, b, insp, avail, rev] = await Promise.all([
        vehiclesAPI.detail(id),
        bookingsAPI.list({ page_size: 100 }),
        inspectionsAPI.list({ vehicle: id, page_size: 20 }).catch(() => ({ data: { results: [] } })),
        vehiclesAPI.availability(id).catch(() => ({ data: { results: [] } })),
        vehiclesAPI.reviews ? vehiclesAPI.reviews(id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      setVehicle(v.data);
      setBookings((b.data.results || b.data || []).filter(x => x.vehicle === Number(id)));
      setInspections(insp.data.results || insp.data || []);
      setBlocks(avail.data.results || avail.data || []);
      const rs = rev.data.results || rev.data || [];
      setRating(rs.length
        ? { avg: rs.reduce((s, r) => s + Number(r.rating || 0), 0) / rs.length, count: rs.length }
        : { avg: null, count: 0 });
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const blockDates = async (start, end, reason) => {
    setBlocking(true);
    try {
      await vehiclesAPI.blockDates(id, start, end, reason);
      await load();
      return true;
    } catch (_) { return false; }
    finally { setBlocking(false); }
  };

  if (!vehicle) return (
    <OwnerLayout>
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader size={28} className="animate-spin mb-3 text-teal-500" />
        <p className="text-sm font-bold">{online ? 'Chargement du dossier technique…' : 'API injoignable — actualisez la page.'}</p>
      </div>
    </OwnerLayout>
  );

  const missions = bookings.filter(b => b.status === 'completed').length || vehicle.total_bookings || 0;
  const now = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const bookedDays = bookings
    .filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((days, b) => {
      const s = new Date(Math.max(new Date(b.start_date), mStart));
      const e = new Date(Math.min(new Date(b.end_date), mEnd));
      return e >= s ? days + Math.round((e - s) / 86400000) + 1 : days;
    }, 0);

  return (
    <OwnerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <VehicleHero v={vehicle} />
        <VehicleStats
          earned={vehicle.total_earned || 0}
          bookedDays={bookedDays}
          daysInMonth={mEnd.getDate()}
          rating={rating.avg}
          ratingCount={rating.count}
          missions={missions}
        />
        <AuditTimeline v={vehicle} />
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <BookingCalendar v={vehicle} bookings={bookings} blocks={blocks} onBlock={blockDates} blocking={blocking} />
          <InspectionPanel v={vehicle} inspections={inspections} />
        </div>
      </div>
    </OwnerLayout>
  );
}
