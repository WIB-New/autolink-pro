import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { RequestCard, RequestDetail } from '../../components/ownerrequests';
import { RefreshCw, Car, ArrowUpDown } from 'lucide-react';
import FilterField from '../../components/FilterField';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import { ownerNet } from '../../utils/commission';

/* La confirmation est automatique au paiement : le propriétaire suit ses
   réservations et clôture la location quand il récupère son véhicule. */
const TABS = [
  { id: 'upcoming', label: 'Confirmées & en cours', match: b => ['confirmed', 'active'].includes(b.status) },
  { id: 'pending',  label: 'En attente de paiement', match: b => b.status === 'pending' },
  { id: 'issues',   label: 'Annulées & litiges',     match: b => ['cancelled', 'disputed'].includes(b.status) },
  { id: 'done',     label: 'Terminées',              match: b => b.status === 'completed' },
];

const SORTS = {
  date:  (a, b) => new Date(a.start_date) - new Date(b.start_date),
  price: (a, b) => ownerNet(b) - ownerNet(a),
};

export default function OwnerRequests() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [vehicle, setVehicle] = useState('');
  const [tri, setTri] = useState('date');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [b, v] = await Promise.all([bookingsAPI.list({ page_size: 100 }), vehiclesAPI.list({ mine: 1, page_size: 100 })]);
      const list = b.data.results || b.data || [];
      setBookings(list);
      setVehicles(v.data.results || v.data || []);
      setSelected(s => list.find(x => x.id === s?.id) || null);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const complete = async (id) => {
    setBusy(id);
    setError('');
    try { await bookingsAPI.updateStatus(id, 'completed'); }
    catch (e) { setError(e.response?.data?.detail || 'Impossible de clôturer cette location.'); }
    setBusy(null);
    load();
  };

  const visible = useMemo(() => {
    const t = TABS.find(x => x.id === tab);
    return bookings
      .filter(t.match)
      .filter(b => !vehicle || String(b.vehicle) === vehicle)
      .sort(SORTS[tri]);
  }, [bookings, tab, vehicle, tri]);

  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t.id, bookings.filter(t.match).length])), [bookings]);

  return (
    <OwnerLayout badges={{ demandes: counts.pending }}>
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-black text-slate-900">Réservations</h1>
          {!online && <button onClick={load} className="text-red-500 flex items-center gap-1 text-[11px] font-bold"><RefreshCw size={9} /> Hors ligne — réessayer</button>}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl px-4 py-3">{error}</div>}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
                className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                {t.label}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{counts[t.id]}</span>
                {tab === t.id && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
              </button>
            ))}
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-3.5">
            <FilterField label="Véhicule" icon={Car} type="select" value={vehicle} onChange={setVehicle}
              options={[{ value: '', label: 'Tous les véhicules' }, ...vehicles.map(v => ({ value: String(v.id), label: `${v.brand} ${v.model}` }))]} />
            <FilterField label="Tri" icon={ArrowUpDown} type="select" value={tri} onChange={setTri}
              options={[{ value: 'date', label: 'Date de départ' }, { value: 'price', label: 'Gain net décroissant' }]} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-4">
            {visible.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                <p className="font-bold text-slate-500">Aucune réservation dans cet onglet.</p>
                <p className="text-sm mt-1">Les réservations de vos véhicules apparaîtront ici.</p>
              </div>
            ) : visible.map(b => (
              <RequestCard key={b.id} b={b} selected={selected?.id === b.id} onSelect={setSelected} />
            ))}
          </div>
          <RequestDetail b={selected || visible[0]} onComplete={complete} busy={busy} />
        </div>
      </div>
    </OwnerLayout>
  );
}
