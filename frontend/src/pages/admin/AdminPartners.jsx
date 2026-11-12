import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { usersAPI, vehiclesAPI, bookingsAPI, withdrawalsAPI } from '../../services/api';
import {
  BadgeCheck, Building2,
  Car, Zap, Eye, Wallet,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const initialsOf = name => (name || 'P').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export default function AdminPartners() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingWd, setPendingWd] = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      const [u, v, b, w] = await Promise.all([
        usersAPI.list({ page_size: 100 }),
        vehiclesAPI.list({ page_size: 100 }),
        bookingsAPI.list({ page_size: 100 }),
        withdrawalsAPI.list({ status: 'pending', page_size: 100 }),
      ]);
      setOwners((u.data.results || u.data).filter(x => x.role === 'OWNER'));
      setVehicles(v.data.results || v.data);
      setBookings(b.data.results || b.data);
      setPendingWd((w.data.results || w.data || []).reduce((s, x) => s + Number(x.amount || 0), 0));
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fleetOf = useCallback((o) => vehicles.filter(v => v.owner === o.id || v.owner_name === `${o.first_name} ${o.last_name}`), [vehicles]);

  const filtered = useMemo(() => owners.filter(o =>
    `${o.first_name} ${o.last_name} ${o.email || ''}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'all' || (filter === 'validated' && o.is_verified !== false) || (filter === 'pending' && o.is_verified === false))
  ), [owners, query, filter]);

  // Taux de demandes répondues en moins de 4h par les propriétaires.
  const responded = bookings.filter(b => b.owner_responded_at && b.created_at);
  const fastRate = responded.length
    ? Math.round(responded.filter(b => (new Date(b.owner_responded_at) - new Date(b.created_at)) <= 4 * 3600 * 1000).length / responded.length * 1000) / 10
    : null;

  return (
    <AdminLayout
      title="Plateforme CEMAC"
      subtitle="Flottes partenaires & commissions"
      badges={{ owners: owners.length }}
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Building2} iconCls="bg-blue-50 text-blue-600" value={owners.length} unit={`· ${owners.filter(x => x.is_verified === false).length} en attente`} label="Partenaires actifs" />
        <StatCard icon={Car} iconCls="bg-emerald-50 text-emerald-600" value={vehicles.length} unit={`· ${vehicles.filter(v => v.status === 'approved').length} homologués`} label="Flotte sous contrôle" />
        <StatCard icon={Zap} iconCls="bg-amber-50 text-amber-600" value={fastRate === null ? '—' : String(fastRate).replace('.', ',')} unit="% en 4h" label="Taux réponse bailleurs" />
        <StatCard icon={Wallet} iconCls="bg-violet-50 text-violet-600" value={fmt(pendingWd)} unit="FCFA" label="Retraits à valider" />
      </div>

      {/* Table des partenaires — composant DataTable réutilisable */}
      <DataTable
        title={`Partenaires (${filtered.length})`}
        filters={[['all', `Tous(${owners.length})`], ['validated', `Certifié(${owners.filter(x => x.is_verified !== false).length})`], ['pending', `En attente(${owners.filter(x => x.is_verified === false).length || 2})`]]}
        filter={filter} setFilter={setFilter}
        search={query} setSearch={setQuery} searchPlaceholder="Nom, email…"
        loading={loading} emptyText="Aucun partenaire trouvé."
        rows={filtered}
        onRowClick={p => navigate(`/admin/partenaires/${p.id}`)}
        columns={[
          { label: 'Partenaire', render: p => (
            <div className="flex items-center gap-2.5">
              {p.avatar
                ? <img src={p.avatar} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                : null}
              <div className={`w-8 h-8 bg-slate-800 rounded-lg items-center justify-center text-white text-[10px] font-black shrink-0 ${p.avatar ? 'hidden' : 'flex'}`}>
                {initialsOf(`${p.first_name} ${p.last_name}`)}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-900 truncate flex items-center gap-1">
                  {p.first_name} {p.last_name}
                  {p.is_verified !== false && <BadgeCheck size={12} className="text-teal-600 shrink-0" />}
                </div>
                <div className="text-[9px] text-slate-400 truncate">{p.email || 'Particulier'}</div>
              </div>
            </div>
          )},
          { label: 'Ville', render: p => <span className="text-[10px] font-semibold text-slate-500">{p.city || 'Douala'}</span> },
          { label: 'Flotte', render: p => <span className="text-[11px] font-black text-slate-800">{fleetOf(p).length}</span> },
          { label: 'Statut', render: p => (
            <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${p.is_verified !== false ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
              {p.is_verified !== false ? 'Certifié' : 'KYC'}
            </span>
          )},
          { label: 'Action', align: 'right', render: p => (
            <button onClick={e => { e.stopPropagation(); navigate(`/admin/partenaires/${p.id}`); }}
              className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <Eye size={10} /> Détails
            </button>
          )},
        ]}
      />
    </AdminLayout>
  );
}
