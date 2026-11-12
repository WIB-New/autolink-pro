import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { usersAPI, bookingsAPI } from '../../services/api';
import {
  Users, UserCheck, Clock, Flag, Eye, Star,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';

const initialsOf = name => (name || 'C').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export default function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAll = useCallback(async () => {
    try {
      const [u, b] = await Promise.all([usersAPI.list({ page_size: 100 }), bookingsAPI.list({ page_size: 100 })]);
      setClients((u.data.results || u.data).filter(x => x.role === 'CLIENT'));
      setBookings(b.data.results || b.data);
    } catch (_) {}
    setLoading(false);
  }, []);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => clients.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email || ''}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === 'all' || (filter === 'verified' && c.is_verified !== false) || (filter === 'pending' && c.is_verified === false))
  ), [clients, query, filter]);

  const bookingsOf = useCallback(c => bookings.filter(b => (b.client === c.id) || (b.client_name || '').toLowerCase().includes((c.first_name || '').toLowerCase())), [bookings]);
  const pendingKyc = clients.filter(x => x.is_verified === false).length;

  return (
    <AdminLayout
      title="Clients & Dossiers KYC CEMAC"
      subtitle="Dossiers KYC & portefeuille clients"
      badges={{ clients: clients.length }}
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Users} iconCls="bg-blue-50 text-blue-600" value={clients.length} label="Portefeuille clients" />
        <StatCard icon={UserCheck} iconCls="bg-emerald-50 text-emerald-600" value={clients.length - pendingKyc} unit={`· ${clients.length ? Math.round((clients.length - pendingKyc) / clients.length * 100) : 0} %`} label="KYC conformes" />
        <StatCard icon={Clock} iconCls="bg-amber-50 text-amber-600" value={pendingKyc} label="En attente de vérification" />
        <StatCard icon={Flag} iconCls="bg-red-50 text-red-600" value={bookings.filter(b => b.status === 'disputed').length} label="Sous surveillance" />
      </div>

      {/* Table des clients — composant DataTable réutilisable */}
      <DataTable
        title={`Clients & KYC (${filtered.length})`}
        filters={[['all', `Tous(${clients.length})`], ['verified', `Vérifié(${clients.length - pendingKyc})`], ['pending', `KYC en cours(${pendingKyc})`]]}
        filter={filter} setFilter={setFilter}
        search={query} setSearch={setQuery} searchPlaceholder="Nom, email…"
        loading={loading} emptyText="Aucun client trouvé."
        rows={filtered}
        onRowClick={c => navigate(`/admin/clients/${c.id}`)}
        columns={[
          { label: 'Client', render: c => (
            <div className="flex items-center gap-2.5">
              {c.avatar
                ? <img src={c.avatar} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                : <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {initialsOf(`${c.first_name} ${c.last_name}`)}
                  </div>}
              <div className="min-w-0">
                <div className="text-[11px] font-black text-slate-900 truncate">{c.first_name} {c.last_name}</div>
                <div className="text-[9px] text-slate-400 truncate">{c.email || '—'}</div>
              </div>
            </div>
          )},
          { label: 'Ville', render: c => <span className="text-[10px] font-semibold text-slate-500">{c.city || 'Douala'}</span> },
          { label: 'Locations', render: c => <span className="text-[11px] font-black text-slate-800">{bookingsOf(c).length}</span> },
          { label: 'Note reçue', render: c => c.client_rating != null ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-800">
              <Star size={11} className="text-amber-500 fill-amber-500" />{Number(c.client_rating).toFixed(1)}
              <span className="text-[9px] font-semibold text-slate-400">({c.client_rating_count})</span>
            </span>
          ) : <span className="text-[10px] text-slate-400">—</span> },
          { label: 'Statut', render: c => (
            <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${c.is_verified !== false ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
              {c.is_verified !== false ? 'Vérifié' : 'KYC en revue'}
            </span>
          )},
          { label: 'Action', align: 'right', render: c => (
            <button onClick={e => { e.stopPropagation(); navigate(`/admin/clients/${c.id}`); }}
              className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <Eye size={10} /> Détails
            </button>
          )},
        ]}
      />
    </AdminLayout>
  );
}
