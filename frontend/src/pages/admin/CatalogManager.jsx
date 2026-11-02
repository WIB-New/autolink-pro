import React, { useState, useRef, useMemo } from 'react';
import { Upload, Trash2, Edit3, Plus, Image, CheckCircle, X, Car, Save, ChevronLeft, ChevronRight, Search, Wrench, CheckCircle2, Wallet, Filter } from 'lucide-react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { CATALOG_VEHICLES } from '../../utils/carImages';
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

function EditModal({ vehicle, onSave, onClose }) {
  const [form, setForm] = useState({
    name: vehicle?.name || '',
    category: vehicle?.category || 'Berline',
    price: vehicle?.price || 25000,
    image: vehicle?.image || '',
    available: vehicle?.available ?? true,
  });
  const [preview, setPreview] = useState(vehicle?.image || '');
  const [previewError, setPreviewError] = useState(false);
  const fileRef = useRef();

  const handleUrlChange = (url) => {
    setForm(f => ({ ...f, image: url }));
    setPreviewError(false);
    setPreview(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handleUrlChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const isNew = !vehicle?.id;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">{isNew ? 'Ajouter un véhicule au catalogue' : 'Modifier les images'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
            {preview && !previewError ? (
              <img src={preview} alt="Aperçu" onError={() => setPreviewError(true)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Car size={36} />
                <span className="text-sm">Aperçu de l'image</span>
              </div>
            )}
            {preview && !previewError && (
              <div className="absolute bottom-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle size={11} /> Image valide
              </div>
            )}
          </div>

          {/* URL input */}
          <div>
            <label className="label">URL de l'image</label>
            <input type="url" className="input-field" placeholder="https://images.unsplash.com/photo-..." value={form.image} onChange={e => handleUrlChange(e.target.value)} />
          </div>

          {/* Or upload */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          </div>
          <div>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileRef.current.click()} className="w-full border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-slate-500 dark:text-slate-400">
              <Upload size={22} />
              <span className="text-sm font-medium">Téléverser depuis l'appareil</span>
              <span className="text-xs text-slate-400">JPG, PNG, WEBP — Max 5 MB</span>
            </button>
          </div>

          {/* Vehicle info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nom du véhicule</label>
              <input type="text" className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tarif journalier (FCFA)</label>
              <input type="number" className="input-field" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, available: !f.available }))} className={`w-11 h-6 rounded-full transition-colors relative ${form.available ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${form.available ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Disponible</span>
              </label>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-3 text-sm">Annuler</button>
          <button onClick={() => onSave({ ...vehicle, ...form, image: preview })} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
            <Save size={16} /> {isNew ? 'Ajouter au catalogue' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CatalogManager() {
  const [vehicles, setVehicles] = useState(CATALOG_VEHICLES);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState('ALL');
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [avail, setAvail] = useState('all');

  /* KPIs flotte */
  const stats = useMemo(() => ({
    total: vehicles.length,
    dispo: vehicles.filter(v => v.available).length,
    maintenance: vehicles.filter(v => !v.available).length,
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

  const handleSave = (updated) => {
    if (updated.id) {
      setVehicles(vs => vs.map(v => v.id === updated.id ? updated : v));
    } else {
      setVehicles(vs => [...vs, { ...updated, id: Date.now(), rating: 5.0 }]);
    }
    setEditing(null);
    setShowAdd(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce véhicule du catalogue ?')) {
      setVehicles(vs => vs.filter(v => v.id !== id));
    }
  };

  return (
    <AdminLayout title="Catalogue et Flotte" subtitle="Parc publié & gammes tarifaires">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Car} iconCls="bg-blue-50 text-blue-600" value={stats.total} unit={`· ${stats.categories} gammes`} label="Véhicules au catalogue" />
          <StatCard icon={CheckCircle2} iconCls="bg-emerald-50 text-emerald-600" value={stats.dispo} unit={`· ${stats.total ? Math.round(stats.dispo / stats.total * 100) : 0} %`} label="Disponibles" />
          <StatCard icon={Wrench} iconCls="bg-amber-50 text-amber-600" value={stats.maintenance} label="En maintenance / indispo" />
          <StatCard icon={Wallet} iconCls="bg-violet-50 text-violet-600" value={stats.avgPrice.toLocaleString('fr-FR')} unit="F/jour" label="Tarif moyen" />
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-xs font-bold">
            <CheckCircle size={14} /> Catalogue mis à jour avec succès.
          </div>
        )}

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
              className="ml-auto my-1.5 flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3.5 py-2 rounded-xl transition-colors shrink-0">
              <Plus size={13} /> Ajouter un véhicule
            </button>
          </div>
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <FilterField label="Recherche" icon={Search} value={query} onChange={v => { setQuery(v); setPage(1); }} placeholder="Nom du véhicule…" />
            <FilterField label="Disponibilité" icon={Filter} type="select" value={avail} onChange={v => { setAvail(v); setPage(1); }}
              options={[{ value: 'all', label: 'Tous statuts' }, { value: 'dispo', label: 'Disponibles' }, { value: 'indispo', label: 'En maintenance / indispo' }]} />
          </div>
        </div>

        {/* Grid */}
        <div id="catalog-grid" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 scroll-mt-24">
          {pageItems.map(v => (
            <ImageCard key={v.id} vehicle={v} onEdit={setEditing} onDelete={handleDelete} />
          ))}
          {/* Add placeholder */}
          <button onClick={() => setShowAdd(true)} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="text-sm font-medium">Ajouter un véhicule</span>
          </button>
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
      </div>

      {(editing || showAdd) && (
        <EditModal
          vehicle={editing || null}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowAdd(false); }}
        />
      )}
    </AdminLayout>
  );
}
