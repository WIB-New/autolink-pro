import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Eye, Ban, CheckCircle, Shield, Loader, Plus, Pencil, Trash2,
  KeyRound, ClipboardCheck, XCircle, UserCheck, Mail, Phone, CalendarDays,
} from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';
import { usersAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { mediaUrl } from '../../utils/media';

const initialsOf = (u) => (`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || '?')
  .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const EMPTY_FORM = { first_name: '', last_name: '', email: '', phone: '', password: '' };

export default function AdminControllers() {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [busyId, setBusyId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);      // user en cours d'édition
  const [detail, setDetail] = useState(null);       // user en consultation
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await usersAPI.list({ role: 'CONTROLLER', page_size: 200 });
      setUsers(data.results || data || []);
    } catch (_) { /* silencieux */ }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  const filtered = useMemo(() => users.filter((u) => {
    const name = `${u.first_name} ${u.last_name}`.trim();
    const status = u.is_active ? 'active' : 'suspended';
    return (statusFilter === 'ALL' || status === statusFilter)
      && (name.toLowerCase().includes(search.toLowerCase())
        || (u.email || '').toLowerCase().includes(search.toLowerCase())
        || (u.phone || '').includes(search));
  }), [users, search, statusFilter]);

  const counts = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    inspections: users.reduce((a, u) => a + (u.inspections_count || 0), 0),
  };

  const createController = async () => {
    setBusy(true); setError('');
    try {
      const payload = {
        username: form.email, email: form.email,
        first_name: form.first_name, last_name: form.last_name,
        phone: form.phone, role: 'CONTROLLER',
      };
      if (form.password) payload.password = form.password;
      await usersAPI.create(payload);
      setCreateOpen(false); setForm(EMPTY_FORM);
      flash(`Compte créé — identifiants envoyés à ${form.email}.`);
      await load();
    } catch (e) {
      const d = e?.response?.data || {};
      setError(d.email?.[0] || d.username?.[0] || d.phone?.[0] || d.password?.[0] || d.detail || 'Échec de la création.');
    } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    setBusy(true); setError('');
    try {
      await usersAPI.update(editing.id, {
        first_name: editing.first_name, last_name: editing.last_name,
        email: editing.email, phone: editing.phone,
      });
      setEditing(null);
      flash('Compte mis à jour.');
      await load();
    } catch (e) {
      const d = e?.response?.data || {};
      setError(d.email?.[0] || d.phone?.[0] || d.detail || 'Échec de la mise à jour.');
    } finally { setBusy(false); }
  };

  const toggleActive = async (u) => {
    const suspend = u.is_active;
    const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
    if (suspend) {
      const ok = await confirm({
        title: 'Suspendre ce contrôleur ?',
        message: `${name} ne pourra plus se connecter ni remplir de fiches d'inspection.`,
        confirmLabel: 'Suspendre', danger: true,
      });
      if (!ok) return;
    }
    setBusyId(u.id);
    try { await usersAPI.update(u.id, { is_active: !suspend }); await load(); } catch (_) {}
    setBusyId(null);
  };

  const resetCredentials = async (u) => {
    const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
    const ok = await confirm({
      title: 'Renvoyer de nouveaux identifiants ?',
      message: `Un nouveau mot de passe sera généré et envoyé à ${u.email}. Ses sessions actives seront révoquées.`,
      confirmLabel: 'Renvoyer les identifiants',
    });
    if (!ok) return;
    setBusyId(u.id);
    try {
      await usersAPI.resetCredentials(u.id);
      flash(`Nouveaux identifiants envoyés à ${u.email}.`);
    } catch (e) {
      setError('');
      flash(e?.response?.data?.detail || `Échec de l'envoi pour ${name}.`);
    }
    setBusyId(null);
  };

  const remove = async (u) => {
    const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
    const ok = await confirm({
      title: 'Supprimer ce compte contrôleur ?',
      message: `${name} sera définitivement supprimé. Ses fiches d'inspection déjà remplies resteront tracées.`,
      confirmLabel: 'Supprimer', danger: true,
    });
    if (!ok) return;
    setBusyId(u.id);
    try { await usersAPI.delete(u.id); await load(); flash('Compte supprimé.'); }
    catch (e) { flash(e?.response?.data?.detail || 'Suppression impossible.'); }
    setBusyId(null);
  };

  return (
    <AdminLayout title="Contrôleurs" subtitle="Comptes staff — inspections entrée/sortie">
      <div className="max-w-7xl mx-auto space-y-6">
        {notice && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold">
            <CheckCircle size={16} /> {notice}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Shield} iconCls="bg-purple-50 text-purple-600" value={counts.total} label="Contrôleurs" />
          <StatCard icon={UserCheck} iconCls="bg-emerald-50 text-emerald-600" value={counts.active} label="Comptes actifs" />
          <StatCard icon={ClipboardCheck} iconCls="bg-blue-50 text-blue-600" value={counts.inspections} label="Inspections réalisées" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3.5 sm:items-end">
          <div className="flex-1 grid sm:grid-cols-2 gap-3.5">
            <FilterField label="Recherche" icon={Search} value={search} onChange={setSearch} placeholder="Nom, email ou téléphone…" />
            <FilterField label="Statut" icon={UserCheck} type="select" value={statusFilter} onChange={setStatusFilter}
              options={[{ value: 'ALL', label: 'Tous les statuts' }, { value: 'active', label: 'Actifs' }, { value: 'suspended', label: 'Suspendus' }]} />
          </div>
          <button onClick={() => { setCreateOpen(true); setError(''); setForm(EMPTY_FORM); }}
            className="btn-primary px-5 py-2.5 flex items-center justify-center gap-2 shrink-0">
            <Plus size={16} /> Nouveau contrôleur
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Contrôleur', 'Téléphone', 'Statut', 'Inspections', 'Inscrit le', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400"><Loader size={20} className="animate-spin mx-auto" /></td></tr>
                )}
                {!loading && filtered.map((u) => {
                  const name = `${u.first_name} ${u.last_name}`.trim() || u.username;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar
                            ? <img src={mediaUrl(u.avatar)} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            : <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {initialsOf(u)}
                              </div>}
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {name}
                              {u.is_verified && <CheckCircle size={13} className="text-emerald-500" />}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{u.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={u.is_active ? 'badge-success' : 'badge-error'}>{u.is_active ? 'Actif' : 'Suspendu'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                          <ClipboardCheck size={13} className="text-purple-500" />{u.inspections_count ?? 0} fiche(s)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetail(u)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="Voir"><Eye size={15} /></button>
                          <button onClick={() => { setEditing({ ...u }); setError(''); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Modifier"><Pencil size={15} /></button>
                          <button onClick={() => resetCredentials(u)} disabled={busyId === u.id}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Renvoyer les identifiants (nouveau mot de passe par email)">
                            <KeyRound size={15} />
                          </button>
                          <button onClick={() => toggleActive(u)} disabled={busyId === u.id}
                            className={`p-1.5 rounded-lg transition-colors ${!u.is_active ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-red-50 text-red-500'}`}
                            title={u.is_active ? 'Suspendre' : 'Réactiver'}>
                            {u.is_active ? <Ban size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button onClick={() => remove(u)} disabled={busyId === u.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Supprimer">
                            <Trash2 size={15} />
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
              <Shield size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun contrôleur trouvé</p>
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            {filtered.length} contrôleur(s) affiché(s) sur {users.length}
          </div>
        </div>
      </div>

      {/* Modale création */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Shield size={18} className="text-purple-600" /> Nouveau contrôleur</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><XCircle size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <input type="text" className="input-field" placeholder="Brice"
                    value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input type="text" className="input-field" placeholder="Mballa"
                    value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Email (identifiant de connexion)</label>
                <input type="email" className="input-field" placeholder="controleur@autolink.cm"
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Téléphone (+237)</label>
                <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                  value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">Mot de passe <span className="font-normal text-slate-400">(optionnel)</span></label>
                <input type="text" className="input-field" placeholder="Laisser vide = généré automatiquement"
                  value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <Mail size={14} className="shrink-0 mt-0.5 text-blue-500" />
                Les identifiants de connexion seront envoyés automatiquement à l'email du contrôleur.
              </p>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setCreateOpen(false)} className="btn-outline flex-1 py-3">Annuler</button>
              <button onClick={createController} disabled={busy || !form.first_name || !form.email}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />} Créer le compte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale édition */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Pencil size={18} className="text-blue-600" /> Modifier le contrôleur</h3>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><XCircle size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <input type="text" className="input-field" value={editing.first_name || ''}
                    onChange={(e) => setEditing((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input type="text" className="input-field" value={editing.last_name || ''}
                    onChange={(e) => setEditing((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={editing.email || ''}
                  onChange={(e) => setEditing((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input type="tel" className="input-field" value={editing.phone || ''}
                  onChange={(e) => setEditing((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1 py-3">Annuler</button>
              <button onClick={saveEdit} disabled={busy || !editing.email}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />} Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale détail */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-4">
              {detail.avatar
                ? <img src={mediaUrl(detail.avatar)} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                : <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">{initialsOf(detail)}</div>}
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  {`${detail.first_name} ${detail.last_name}`.trim() || detail.username}
                  {detail.is_verified && <CheckCircle size={16} className="text-emerald-500" />}
                </h3>
                <span className="badge-info">Contrôleur AutoLink</span>
              </div>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                [Mail, 'Email', detail.email],
                [Phone, 'Téléphone', detail.phone || '—'],
                [ClipboardCheck, 'Inspections réalisées', `${detail.inspections_count ?? 0} fiche(s)`],
                [CalendarDays, 'Inscrit le', detail.created_at ? new Date(detail.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                [UserCheck, 'Statut', detail.is_active ? 'Actif' : 'Suspendu'],
              ].map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Icon size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-40 shrink-0">{label}</span>
                  <span className="font-semibold text-slate-800 truncate">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetail(null)} className="btn-outline w-full py-3">Fermer</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
