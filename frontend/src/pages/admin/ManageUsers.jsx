import React, { useState } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, Users, Car, UserCheck, Shield } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';

const USERS = [
  { id: 1, name: 'Marie Konan', email: 'marie@email.com', phone: '+225 07 12 34 56', role: 'CLIENT', status: 'active', verified: true, joined: '2025-01-15', bookings: 8, spent: 430000 },
  { id: 2, name: 'Jean Kouassi', email: 'jean@email.com', phone: '+225 05 22 33 44', role: 'OWNER', status: 'active', verified: true, joined: '2024-11-08', vehicles: 3, earned: 2250000 },
  { id: 3, name: 'Armand Traoré', email: 'armand@email.com', phone: '+225 07 88 99 00', role: 'DRIVER', status: 'active', verified: true, joined: '2024-09-20', trips: 312, rating: 4.8 },
  { id: 4, name: 'Awa Diallo', email: 'awa@email.com', phone: '+225 05 44 55 66', role: 'CLIENT', status: 'active', verified: false, joined: '2025-08-01', bookings: 1, spent: 50000 },
  { id: 5, name: 'Moussa Koné', email: 'moussa@email.com', phone: '+225 07 00 11 22', role: 'OWNER', status: 'suspended', verified: true, joined: '2024-12-01', vehicles: 1, earned: 180000 },
  { id: 6, name: 'Paul Bamba', email: 'paul@email.com', phone: '+225 05 99 88 77', role: 'DRIVER', status: 'active', verified: true, joined: '2025-02-14', trips: 87, rating: 4.6 },
  { id: 7, name: 'Fatou Coulibaly', email: 'fatou@email.com', phone: '+225 07 33 44 55', role: 'CLIENT', status: 'active', verified: true, joined: '2025-03-22', bookings: 5, spent: 275000 },
  { id: 8, name: 'Kofi Mensah', email: 'kofi@email.com', phone: '+225 05 11 22 33', role: 'DRIVER', status: 'pending', verified: false, joined: '2025-08-20', trips: 0, rating: null },
];

const ROLE_CONFIG = { CLIENT: { label: 'Client', style: 'badge-info', icon: Users }, OWNER: { label: 'Propriétaire', style: 'badge-primary', icon: Car }, DRIVER: { label: 'Chauffeur', style: 'badge-warning', icon: UserCheck }, ADMIN: { label: 'Admin', style: 'badge-error', icon: Shield }, CONTROLLER: { label: 'Contrôleur', style: 'bg-purple-100 text-purple-700', icon: Shield } };
const STATUS_CONFIG = { active: 'badge-success', suspended: 'badge-error', pending: 'badge-warning' };

export default function ManageUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = USERS.filter(u =>
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    (statusFilter === 'ALL' || u.status === statusFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = { CLIENT: USERS.filter(u => u.role === 'CLIENT').length, OWNER: USERS.filter(u => u.role === 'OWNER').length, DRIVER: USERS.filter(u => u.role === 'DRIVER').length };

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
            options={[{ value: 'ALL', label: 'Tous les statuts' }, { value: 'active', label: 'Actifs' }, { value: 'suspended', label: 'Suspendus' }, { value: 'pending', label: 'En attente' }]} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Vérifié', 'Inscrit le', 'Activité', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => {
                  const RC = ROLE_CONFIG[u.role];
                  const Icon = RC.icon;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={RC.style}><Icon size={10} className="inline mr-1" />{RC.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={STATUS_CONFIG[u.status]}>{u.status === 'active' ? 'Actif' : u.status === 'suspended' ? 'Suspendu' : 'En attente'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {u.verified ? <CheckCircle size={16} className="text-emerald-500" /> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{u.joined}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {u.role === 'CLIENT' && `${u.bookings} réservations · ${u.spent?.toLocaleString()} F`}
                        {u.role === 'OWNER' && `${u.vehicles} véhicule(s) · ${u.earned?.toLocaleString()} F`}
                        {u.role === 'DRIVER' && `${u.trips} courses${u.rating ? ` · ★${u.rating}` : ''}`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="Voir profil"><Eye size={15} /></button>
                          <button className={`p-1.5 rounded-lg transition-colors ${u.status === 'suspended' ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-red-50 text-red-500'}`} title={u.status === 'suspended' ? 'Réactiver' : 'Suspendre'}>
                            {u.status === 'suspended' ? <CheckCircle size={15} /> : <Ban size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun utilisateur trouvé</p>
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            {filtered.length} utilisateur(s) affiché(s) sur {USERS.length}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
