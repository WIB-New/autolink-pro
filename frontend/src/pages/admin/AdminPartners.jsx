import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { usersAPI, vehiclesAPI, bookingsAPI } from '../../services/api';
import {
  BadgeCheck, Building2,
  Car, Zap, Eye, Wallet,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const initialsOf = name => (name || 'P').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export default function AdminPartners() {
  const navigate = useNavigate();
  const [owners, setOwners] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAll = useCallback(async () => {
    try {
      const [u, v, b] = await Promise.all([
        usersAPI.list({ page_size: 100 }),
        vehiclesAPI.list({ page_size: 100 }),
        bookingsAPI.list({ page_size: 100 }),
      ]);
      setOwners((u.data.results || u.data).filter(x => x.role === 'OWNER'));
      setVehicles(v.data.results || v.data);
      setBookings(b.data.results || b.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fleetOf = useCallback((o) => vehicles.filter(v => v.owner === o.id || v.owner_name === `${o.first_name} ${o.last_name}`), [vehicles]);

  const filtered = useMemo(() => owners.filter(o =>
    `${o.first_name} ${o.last_name} ${o.email || ''}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'all' || (filter === 'validated' && o.is_verified !== false) || (filter === 'pending' && o.is_verified === false))
  ), [owners, query, filter]);

  const balance = bookings.filter(b => ['completed', 'active'].includes(b.status)).reduce((s, b) => s + Number(b.owner_amount || 0), 0);

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
        <StatCard icon={Zap} iconCls="bg-amber-50 text-amber-600" value="94,2" unit="% en 4h" label="Taux réponse bailleurs" />
        <StatCard icon={Wallet} iconCls="bg-violet-50 text-violet-600" value={fmt(balance)} unit="FCFA" label="Retraits à valider" />
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
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">
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
