import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, Users, Car, UserCheck, Shield, Star, Loader } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';
import { usersAPI } from '../../services/api';

const ROLE_CONFIG = { CLIENT: { label: 'Client', style: 'badge-info', icon: Users }, OWNER: { label: 'Propriétaire', style: 'badge-primary', icon: Car }, DRIVER: { label: 'Chauffeur', style: 'badge-warning', icon: UserCheck }, ADMIN: { label: 'Admin', style: 'badge-error', icon: Shield }, CONTROLLER: { label: 'Contrôleur', style: 'bg-purple-100 text-purple-700', icon: Shield } };
const STATUS_CONFIG = { active: 'badge-success', suspended: 'badge-error' };

const initialsOf = name => (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await usersAPI.list({ page_size: 200 });
      setUsers(data.results || data || []);
    } catch (_) {}
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => users.filter(u => {
    const name = `${u.first_name} ${u.last_name}`.trim();
    const status = u.is_active ? 'active' : 'suspended';
    return (roleFilter === 'ALL' || u.role === roleFilter)
      && (statusFilter === 'ALL' || status === statusFilter)
      && (name.toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()));
  }), [users, search, roleFilter, statusFilter]);

  const counts = {
    CLIENT: users.filter(u => u.role === 'CLIENT' && u.is_active).length,
    OWNER: users.filter(u => u.role === 'OWNER' && u.is_active).length,
    DRIVER: users.filter(u => u.role === 'DRIVER' && u.is_active).length,
  };

  const detailPath = (u) => u.role === 'CLIENT' ? `/admin/clients/${u.id}` : u.role === 'OWNER' ? `/admin/partenaires/${u.id}` : u.role === 'DRIVER' ? '/admin/drivers' : null;

  const toggleActive = async (u) => {
    const suspend = u.is_active;
    if (suspend && !window.confirm(`Suspendre le compte de ${u.first_name} ${u.last_name} ?`)) return;
    setBusyId(u.id);
    try { await usersAPI.update(u.id, { is_active: !suspend }); await load(); } catch (_) {}
    setBusyId(null);
  };

  const activity = (u) => {
    if (u.role === 'CLIENT') return `${u.bookings_count ?? 0} réservation(s)`;
    if (u.role === 'OWNER') return `${u.vehicles_count ?? 0} véhicule(s)`;
    if (u.role === 'DRIVER') return `${u.trips_count ?? 0} course(s)`;
    return '—';
  };

  const rating = (u) => {
    if (u.role === 'CLIENT' && u.client_rating != null) return `${Number(u.client_rating).toFixed(1)} (${u.client_rating_count} avis)`;
    if (u.role === 'DRIVER' && u.driver_rating != null) return `${Number(u.driver_rating).toFixed(1)} (${u.driver_rating_count} avis)`;
    return null;
  };

  return (
    <AdminLayout title="Utilisateurs et Comptes" subtitle="Comptes & vérifications KYC">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Users} iconCls="bg-blue-50 text-blue-600" value={counts.CLIENT} label="Clients actifs" />
          <StatCard icon={Car} iconCls="bg-emerald-50 text-emerald-600" value={counts.OWNER} label="Propriétaires actifs" />
          <StatCard icon={UserCheck} iconCls="bg-amber-50 text-amber-600" value={counts.DRIVER} label="Chauffeurs actifs" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <FilterField label="Recherche" icon={Search} value={search} onChange={setSearch} placeholder="Nom ou email…" />
          <FilterField label="Rôle" icon={Users} type="select" value={roleFilter} onChange={setRoleFilter}
            options={[{ value: 'ALL', label: 'Tous les rôles' }, { value: 'CLIENT', label: 'Clients' }, { value: 'OWNER', label: 'Propriétaires' }, { value: 'DRIVER', label: 'Chauffeurs' }]} />
          <FilterField label="Statut" icon={UserCheck} type="select" value={statusFilter} onChange={setStatusFilter}
            options={[{ value: 'ALL', label: 'Tous les statuts' }, { value: 'active', label: 'Actifs' }, { value: 'suspended', label: 'Suspendus' }]} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Note', 'Vérifié', 'Inscrit le', 'Activité', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && (
                  <tr><td colSpan="8" className="py-12 text-center text-slate-400"><Loader size={20} className="animate-spin mx-auto" /></td></tr>
                )}
                {!loading && filtered.map(u => {
                  const RC = ROLE_CONFIG[u.role] || ROLE_CONFIG.CLIENT;
                  const Icon = RC.icon;
                  const status = u.is_active ? 'active' : 'suspended';
                  const name = `${u.first_name} ${u.last_name}`.trim() || u.username;
                  const path = detailPath(u);
                  const note = rating(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar
                            ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            : <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {initialsOf(name).charAt(0)}
                              </div>}
                          <div>
                            <div className="font-semibold text-slate-900">{name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={RC.style}><Icon size={10} className="inline mr-1" />{RC.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={STATUS_CONFIG[status]}>{status === 'active' ? 'Actif' : 'Suspendu'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {note
                          ? <span className="inline-flex items-center gap-1 text-xs font-black text-slate-800"><Star size={11} className="text-amber-500 fill-amber-500" />{note}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_verified ? <CheckCircle size={16} className="text-emerald-500" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{activity(u)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {path && <button onClick={() => navigate(path)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="Voir profil"><Eye size={15} /></button>}
                          <button onClick={() => toggleActive(u)} disabled={busyId === u.id}
                            className={`p-1.5 rounded-lg transition-colors ${status === 'suspended' ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-red-50 text-red-500'}`}
                            title={status === 'suspended' ? 'Réactiver' : 'Suspendre'}>
                            {status === 'suspended' ? <CheckCircle size={15} /> : <Ban size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun utilisateur trouvé</p>
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            {filtered.length} utilisateur(s) affiché(s) sur {users.length}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
