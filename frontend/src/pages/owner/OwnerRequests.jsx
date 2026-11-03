import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { RequestCard, RequestDetail } from '../../components/ownerrequests';
import { Zap, ShieldCheck, Clock, RefreshCw, Car, MapPin, ArrowUpDown } from 'lucide-react';
import FilterField from '../../components/FilterField';
import { bookingsAPI, vehiclesAPI } from '../../services/api';

const TABS = [
  { id: 'pending',   label: 'À traiter',  match: b => b.status === 'pending' },
  { id: 'accepted',  label: 'Acceptées',  match: b => ['confirmed', 'active'].includes(b.status) },
  { id: 'refused',   label: 'Refusées',   match: b => ['cancelled', 'disputed'].includes(b.status) },
  { id: 'done',      label: 'Terminées',  match: b => b.status === 'completed' },
];

export default function OwnerRequests() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('pending');
  const [vehicle, setVehicle] = useState('');
  const [zone, setZone] = useState('');
  const [tri, setTri] = useState('exp');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [b, v] = await Promise.all([bookingsAPI.list({ page_size: 50 }), vehiclesAPI.list({ mine: 1, page_size: 100 })]);
      const list = b.data.results || b.data || [];
      setBookings(list);
      setVehicles(v.data.results || v.data || []);
      setSelected(s => list.find(x => x.id === s?.id) || list.find(x => x.status === 'pending') || null);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, status) => {
    setBusy(id);
    try { await bookingsAPI.updateStatus(id, status); } catch (_) {}
    setBusy(null);
    load();
  };

  const visible = useMemo(() => {
    const t = TABS.find(x => x.id === tab);
    return bookings.filter(t.match).filter(b => !vehicle || String(b.vehicle) === vehicle);
  }, [bookings, tab, vehicle]);

  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t.id, bookings.filter(t.match).length])), [bookings]);

  return (
    <OwnerLayout badges={{ demandes: counts.pending }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900">Demandes de location</h1>
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><Clock size={11} /> ~18 min</span>
            {!online && <button onClick={load} className="text-red-500 flex items-center gap-1 text-[11px] font-bold"><RefreshCw size={9} /> Hors ligne</button>}
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <span className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black px-3.5 py-2 rounded-xl">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> {counts.pending} en attente
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl">
              <Zap size={12} className="text-teal-600" /> Acceptation auto <span className="text-[8px] font-black text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">OFF</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl">
              <ShieldCheck size={12} className="text-teal-600" /> MoMo 98,4 %
            </span>
          </div>
        </div>

        {/* Onglets + filtres — carte unique style pro */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                {t.id === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {t.label}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{counts[t.id]}</span>
                {tab === t.id && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="p-4 grid sm:grid-cols-3 gap-3.5">
            <FilterField label="Véhicule" icon={Car} type="select" value={vehicle} onChange={setVehicle}
              options={[{ value: '', label: 'Tous les véhicules' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.brand} ${v.model}` }))]} />
            <FilterField label="Zone" icon={MapPin} type="select" value={zone} onChange={setZone}
              options={[{ value: '', label: 'Toutes zones' }, { value: 'dla', label: 'Douala & Kribi' }, { value: 'yao', label: 'Yaoundé' }]} />
            <FilterField label="Tri" icon={ArrowUpDown} type="select" value={tri} onChange={setTri}
              options={[{ value: 'exp', label: "Urgence d'expiration" }, { value: 'price', label: 'Montant décroissant' }]} />
          </div>
        </div>

        {/* Liste + dossier */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-4">
            {visible.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                <p className="font-bold text-slate-500">Aucune demande dans cet onglet.</p>
                <p className="text-sm mt-1">Les nouvelles demandes de vos clients apparaîtront ici.</p>
              </div>
            ) : visible.map(b => (
              <RequestCard key={b.id} b={b} selected={selected?.id === b.id}
                onSelect={setSelected} onDecide={decide} busy={busy} />
            ))}
          </div>
          <RequestDetail b={selected} onDecide={decide} busy={busy} />
        </div>
      </div>
    </OwnerLayout>
  );
}
