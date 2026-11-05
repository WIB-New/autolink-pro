import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Image, Car, ChevronLeft, ChevronRight, Search, Wrench, CheckCircle2, Wallet, Filter, Loader, Plus, X, Save } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { getVehicleImage } from '../../utils/carImages';
import { vehiclesAPI } from '../../services/api';
import { mediaUrl, vehicleCover } from '../../utils/media';
import StatCard from '../../components/StatCard';
import FilterField from '../../components/FilterField';

const CATEGORIES = ['Berline', 'SUV', 'Luxe', 'Van', 'Minibus', 'Pick-up', 'Citadine'];
const PAGE_SIZE = 8; /* 4 colonnes × 2 lignes max par page */

function ImageCard({ vehicle, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-lg transition-all">
      <div className="relative h-48 bg-slate-100 dark:bg-slate-700 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <Image size={32} />
            <span className="text-xs">Image non disponible</span>
          </div>
        ) : (
          <img
            src={vehicle.image}
            alt={vehicle.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
          <button onClick={() => onEdit(vehicle)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors">
            <Edit3 size={16} className="text-primary-600" />
          </button>
          <button onClick={() => onDelete(vehicle.id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 dark:bg-slate-800/90 text-xs font-bold px-2 py-1 rounded-lg text-slate-700 dark:text-slate-200 shadow">{vehicle.category}</span>
        </div>
        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${vehicle.available ? 'bg-emerald-400' : 'bg-slate-400'} ring-2 ring-white`} />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 truncate">{vehicle.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{vehicle.image}</p>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all';
const labelCls = 'block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5';
const FUELS = ['essence', 'diesel', 'hybrid', 'electric'];
const INSURANCES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'all_risk', label: 'Tous risques' },
];

/* Création réelle via l'API — le véhicule naît en statut 'pending',
   owner = compte admin (visible immédiatement dans le catalogue admin). */
function AddVehicleModal({ onClose, onCreated }) {
  const [f, setF] = useState({
    brand: '', model: '', year: '', plate: '', category: 'Berline', fuel: 'essence',
    seats: 5, color: '', mode: 'platform', daily_rate: '', city: 'Douala',
    insurance_type: 'standard', insurance_expiry: '', mileage: 0, description: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.brand && f.model && f.year && f.plate && f.daily_rate && f.insurance_type && f.insurance_expiry;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      Object.entries({ ...f, plate: f.plate.toUpperCase(), seats: Number(f.seats), year: Number(f.year), daily_rate: Number(f.daily_rate), mileage: Number(f.mileage) || 0 })
        .forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      const res = await vehiclesAPI.create(fd);
      onCreated(res.data);
    } catch (err) {
      const d = err.response?.data;
      const first = d && typeof d === 'object' ? Object.values(d)[0] : null;
      setError(Array.isArray(first) ? first[0] : (first || 'Erreur — vérifiez les champs.'));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="relative px-6 py-4 border-b border-slate-100 shrink-0 text-center">
          <h3 className="font-black text-slate-900 text-sm">Ajouter un véhicule</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Enregistrement direct — statut « En attente » par défaut.</p>
          <button onClick={onClose} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="overflow-y-auto px-6 py-5 flex-1">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div><label className={labelCls}>Marque *</label><input className={inputCls} value={f.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota" /></div>
            <div><label className={labelCls}>Modèle *</label><input className={inputCls} value={f.model} onChange={e => set('model', e.target.value)} placeholder="Corolla" /></div>
            <div><label className={labelCls}>Année *</label><input type="number" className={inputCls} value={f.year} onChange={e => set('year', e.target.value)} placeholder="2021" /></div>
            <div><label className={labelCls}>Immatriculation *</label><input className={inputCls} value={f.plate} onChange={e => set('plate', e.target.value)} placeholder="LT-123-AB" /></div>
            <div><label className={labelCls}>Catégorie</label><input className={inputCls} value={f.category} onChange={e => set('category', e.target.value)} /></div>
            <div><label className={labelCls}>Carburant</label>
              <select className={inputCls} value={f.fuel} onChange={e => set('fuel', e.target.value)}>{FUELS.map(x => <option key={x} value={x}>{x}</option>)}</select></div>
            <div><label className={labelCls}>Places</label><input type="number" min="2" max="15" className={inputCls} value={f.seats} onChange={e => set('seats', e.target.value)} /></div>
            <div><label className={labelCls}>Couleur</label><input className={inputCls} value={f.color} onChange={e => set('color', e.target.value)} placeholder="Blanc" /></div>
            <div><label className={labelCls}>Mode</label>
              <select className={inputCls} value={f.mode} onChange={e => set('mode', e.target.value)}>
                <option value="platform">Plateforme (géré AutoLink)</option><option value="home">Domicile (libre-service)</option>
              </select></div>
            <div><label className={labelCls}>Tarif journalier (FCFA) *</label><input type="number" className={inputCls} value={f.daily_rate} onChange={e => set('daily_rate', e.target.value)} placeholder="25000" /></div>
            <div><label className={labelCls}>Ville</label><input className={inputCls} value={f.city} onChange={e => set('city', e.target.value)} /></div>
            <div><label className={labelCls}>Kilométrage</label><input type="number" className={inputCls} value={f.mileage} onChange={e => set('mileage', e.target.value)} /></div>
            <div><label className={labelCls}>Type d'assurance *</label>
              <select className={inputCls} value={f.insurance_type} onChange={e => set('insurance_type', e.target.value)}>{INSURANCES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}</select></div>
            <div><label className={labelCls}>Expiration assurance *</label><input type="date" className={inputCls} value={f.insurance_expiry} onChange={e => set('insurance_expiry', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Description</label>
              <textarea rows={2} className={`${inputCls} resize-none`} value={f.description} onChange={e => set('description', e.target.value)} placeholder="État, équipements…" /></div>
          </div>
          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl text-center">{error}</div>}
        </form>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button type="button" onClick={onClose} className="w-32 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">Annuler</button>
          <div className="flex-1" />
          <button onClick={submit} disabled={busy || !valid}
            className="w-32 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5">
            {busy ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogManager() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('ALL');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [avail, setAvail] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  /* Vrais véhicules de la DB — l'admin voit TOUS les statuts (pending, approved…). */
  const load = () => {
    setLoading(true);
    vehiclesAPI.list({ page_size: 100 })
      .then(res => {
        const list = res.data.results || res.data;
        setVehicles(list.map(v => ({
          id: v.id,
          name: `${v.brand} ${v.model} ${v.year}`,
          category: v.category,
          price: Number(v.daily_rate) || 0,
          image: vehicleCover(v) || v.image_url || getVehicleImage(v.category),
          available: v.status === 'approved',
          status: v.status,
          owner: v.owner_name,
        })));
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  /* KPIs flotte */
  const stats = useMemo(() => ({
    total: vehicles.length,
    dispo: vehicles.filter(v => v.available).length,
    maintenance: vehicles.filter(v => v.status === 'pending').length,
    categories: new Set(vehicles.map(v => v.category)).size,
    avgPrice: Math.round(vehicles.reduce((s, v) => s + Number(v.price || 0), 0) / Math.max(vehicles.length, 1)),
  }), [vehicles]);

  const filtered = useMemo(() => vehicles.filter(v =>
    (filterCat === 'ALL' || v.category === filterCat) &&
    (avail === 'all' || (avail === 'dispo' ? v.available : !v.available)) &&
    (v.name || '').toLowerCase().includes(query.toLowerCase())
  ), [vehicles, filterCat, avail, query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goTo = (p) => { setPage(Math.min(Math.max(1, p), totalPages)); document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  // Édition/validation des véhicules → page détail dédiée (/admin/vehicles/:id)

  return (
    <AdminLayout title="Catalogue et Flotte" subtitle="Parc publié & gammes tarifaires">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Car} iconCls="bg-blue-50 text-blue-600" value={stats.total} unit={`· ${stats.categories} gammes`} label="Véhicules au catalogue" />
          <StatCard icon={CheckCircle2} iconCls="bg-emerald-50 text-emerald-600" value={stats.dispo} unit={`· ${stats.total ? Math.round(stats.dispo / stats.total * 100) : 0} %`} label="Disponibles" />
          <StatCard icon={Wrench} iconCls="bg-amber-50 text-amber-600" value={stats.maintenance} label="En maintenance / indispo" />
          <StatCard icon={Wallet} iconCls="bg-violet-50 text-violet-600" value={stats.avgPrice.toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'))} unit="F/jour" label="Tarif moyen" />
        </div>

        {/* Filtres — carte unique style pro */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1 px-2 border-b border-slate-100 overflow-x-auto">
            {['ALL', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => { setFilterCat(c); setPage(1); }}
                className={`relative flex items-center gap-1.5 px-3 py-3.5 text-[11px] font-bold whitespace-nowrap transition-colors ${filterCat === c ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                {c === 'ALL' ? 'Tous' : c}
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${filterCat === c ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {c === 'ALL' ? vehicles.length : vehicles.filter(v => v.category === c).length}
                </span>
                {filterCat === c && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
              </button>
            ))}
            <button onClick={() => setShowAdd(true)}
              className="ml-auto my-1.5 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors shrink-0">
              <Plus size={13} /> Ajouter un véhicule
            </button>
          </div>
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <FilterField label="Recherche" icon={Search} value={query} onChange={v => { setQuery(v); setPage(1); }} placeholder="Nom du véhicule…" />
            <FilterField label="Disponibilité" icon={Filter} type="select" value={avail} onChange={v => { setAvail(v); setPage(1); }}
              options={[{ value: 'all', label: 'Tous statuts' }, { value: 'dispo', label: 'Approuvés' }, { value: 'indispo', label: 'En attente / autres' }]} />
          </div>
        </div>

        {/* Grid */}
        {loading && <div className="text-center py-14 text-xs text-slate-400"><Loader size={18} className="animate-spin mx-auto mb-2" />Chargement des véhicules…</div>}
        <div id="catalog-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 scroll-mt-24">
          {!loading && pageItems.map(v => (
            <ImageCard key={v.id} vehicle={v} onEdit={() => navigate(`/admin/vehicles/${v.id}`)} onDelete={() => navigate(`/admin/vehicles/${v.id}`)} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => goTo(safePage - 1)} disabled={safePage === 1} aria-label="Page précédente"
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={15} />
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => goTo(p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${p === safePage ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages} aria-label="Page suivante"
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Usage guide */}
        {/* <div className="card bg-slate-50 dark:bg-slate-800/50">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Image size={18} className="text-primary-600" /> Recommandations pour les images
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Format recommandé', value: 'JPG ou WEBP (meilleure compression)' },
              { label: 'Dimensions idéales', value: '800×600 px ou ratio 4:3 / 16:9' },
              { label: 'Poids maximum', value: '< 500 KB (optimisé pour mobile)' },
              { label: 'Sources libres', value: 'Unsplash, Pexels, Pixabay (photos CC0)' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
                <div className="font-semibold text-slate-900 dark:text-white text-xs">{value}</div>
              </div>
            ))}
          </div>
        </div> */}

        {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); load(); }} />}
      </div>
    </AdminLayout>
  );
}
