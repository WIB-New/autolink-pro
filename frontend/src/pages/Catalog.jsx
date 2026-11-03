import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  X, Car, ChevronDown, ChevronLeft, ChevronRight, Filter, Loader,
} from 'lucide-react';
import { PublicNavbar, Footer } from '../components/landing';
import CatalogCard from '../components/catalog/CatalogCard';
import FiltersSidebar, { GAMMES, FORMULE_OPTS, matchCategory, PRICE_MAX } from '../components/catalog/FiltersSidebar';
import SearchWidget from '../components/landing/SearchWidget';
import { CATALOG_VEHICLES, getVehicleImage } from '../utils/carImages';
import { normalizeVehicle, vehicleBrand } from '../utils/vehicleMeta';
import { vehiclesAPI } from '../services/api';

const SORTS = [
  { id: 'reco',   label: 'Recommandés' },
  { id: 'asc',    label: 'Prix croissant' },
  { id: 'desc',   label: 'Prix décroissant' },
  { id: 'rating', label: 'Mieux notés' },
];
const PAGE_SIZE = 6;

/* Mappe un véhicule API vers le format carte catalogue */
const mapApiVehicle = (v) => normalizeVehicle({
  id: v.id,
  name: `${v.brand} ${v.model} ${v.year}`,
  category: v.category,
  tier: v.tier || 'standard',
  image: v.image_url || getVehicleImage(v.category),
  price: Number(v.daily_rate || v.computed_rate) || 25000,
  kmIncluded: v.km_included_per_day || 200,
  kmRate: v.extra_km_rate || 150,
  deposit: Number(v.deposit_amount) || 0,
  city: v.city,
  rating: Number(v.rating) || 4.7,
  reviews: v.rating_count || 0,
  available: v.status === 'approved',
  plate: v.plate,
  seats: v.seats || 5,
  fuel: v.fuel || 'Essence',
  year: v.year,
  fromApi: true,
});

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('reco');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const villeParam = params.get('ville') || 'Douala';
  const categorieParam = params.get('categorie');
  const etatParam = params.get('etat');

  const [filters, setFilters] = useState({
    onlyAvailable: true,
    gammes: params.get('gamme') ? [params.get('gamme')] : [],
    formule: 'urban_day',
    priceMax: PRICE_MAX,
    categories: categorieParam && categorieParam !== 'Toutes' ? [categorieParam] : [],
    marques: [],
    transmissions: [],
    energies: [],
    equipements: [],
  });

  // Chargement : API en priorité, catalogue local en secours
  useEffect(() => {
    let mounted = true;
    vehiclesAPI.getAll()
      .then(res => {
        if (!mounted) return;
        const list = (res.data.results || res.data || []).map(mapApiVehicle);
        setVehicles(list.length ? list : CATALOG_VEHICLES.map(normalizeVehicle));
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setVehicles(CATALOG_VEHICLES.map(normalizeVehicle));
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const list = vehicles.filter(v =>
      (!filters.onlyAvailable || v.available) &&
      (v.city?.toLowerCase() === villeParam.toLowerCase()) &&
      (filters.gammes.length === 0 || filters.gammes.includes(v.tier)) &&
      v.price <= filters.priceMax &&
      (filters.categories.length === 0 || filters.categories.some(c => matchCategory(v, c))) &&
      (filters.marques.length === 0 || filters.marques.includes(vehicleBrand(v))) &&
      (filters.transmissions.length === 0 || filters.transmissions.includes(v.gear)) &&
      (filters.energies.length === 0 || filters.energies.includes(v.fuel)) &&
      (filters.equipements.length === 0 || filters.equipements.every(e => v.equipments.includes(e)))
    );
    const sorted = [...list];
    if (sort === 'asc')    sorted.sort((a, b) => a.price - b.price);
    if (sort === 'desc')   sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'reco')   sorted.sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews));
    return sorted;
  }, [vehicles, filters, sort, villeParam]);

  // Retour à la page 1 à chaque changement de filtres / tri
  useEffect(() => { setPage(1); }, [filters, sort, villeParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goTo = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    document.getElementById('resultats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageNums = (() => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const nums = [1];
    if (page > 3) nums.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) nums.push(p);
    if (page < totalPages - 2) nums.push('…');
    nums.push(totalPages);
    return nums;
  })();

  const activeChips = [
    { key: 'ville', label: villeParam },
    ...(categorieParam && categorieParam !== 'Toutes' ? [{ key: 'cat', label: categorieParam }] : []),
    ...(etatParam && etatParam !== 'Toutes' ? [{ key: 'etat', label: etatParam }] : []),
    ...filters.gammes.map(g => ({ key: `gamme-${g}`, label: GAMMES.find(x => x.id === g)?.label, clear: () => setFilters(f => ({ ...f, gammes: f.gammes.filter(x => x !== g) })) })),
    ...filters.categories.map(c => ({ key: `cat-${c}`, label: c, clear: () => setFilters(f => ({ ...f, categories: f.categories.filter(x => x !== c) })) })),
    ...filters.marques.map(m => ({ key: `marque-${m}`, label: m, clear: () => setFilters(f => ({ ...f, marques: f.marques.filter(x => x !== m) })) })),
    ...filters.transmissions.map(t => ({ key: `tr-${t}`, label: t, clear: () => setFilters(f => ({ ...f, transmissions: f.transmissions.filter(x => x !== t) })) })),
    ...filters.energies.map(e => ({ key: `en-${e}`, label: e, clear: () => setFilters(f => ({ ...f, energies: f.energies.filter(x => x !== e) })) })),
    ...filters.equipements.map(e => ({ key: `eq-${e}`, label: e, clear: () => setFilters(f => ({ ...f, equipements: f.equipements.filter(x => x !== e) })) })),
    ...(filters.priceMax < PRICE_MAX ? [{ key: 'prix', label: `≤ ${filters.priceMax.toLocaleString('fr-FR')} F`, clear: () => setFilters(f => ({ ...f, priceMax: PRICE_MAX })) }] : []),
  ];

  const activeCount = activeChips.length - 1;
  const clearAll = () => {
    setFilters(f => ({
      ...f, gammes: [], categories: [], marques: [], transmissions: [],
      energies: [], equipements: [], priceMax: PRICE_MAX, onlyAvailable: true,
    }));
    setParams({});
  };

  const handleSearchSubmit = (formData) => {
    const q = new URLSearchParams({ ville: formData.depart, retour: formData.retour });
    if (formData.debut) q.set('debut', formData.debut);
    if (formData.fin) q.set('fin', formData.fin);
    if (formData.categorie !== 'Toutes') q.set('categorie', formData.categorie);
    if (formData.etat !== 'Toutes') q.set('etat', formData.etat);
    setParams(q);

    setFilters(f => ({
      ...f,
      categories: formData.categorie !== 'Toutes' ? [formData.categorie] : [],
    }));
  };

  const formuleLabel = FORMULE_OPTS.find(f => f.id === filters.formule)?.label.replace(' heures', 'h').replace(' heure', 'h') || '24h';

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <div className="pt-28 lg:pt-36 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Utilisation du SearchWidget unifié */}
          <div className="mb-10">
            <SearchWidget 
              initialValues={{
                ville: villeParam,
                debut: params.get('debut') || '',
                fin: params.get('fin') || '',
                retour: params.get('retour') || 'Douala',
                categorie: categorieParam || 'Toutes',
                etat: etatParam || 'Toutes',
              }}
              onSearch={handleSearchSubmit}
            />
          </div>

          <div className={`grid gap-6 items-start ${filtersOpen ? 'lg:grid-cols-[260px_1fr]' : 'lg:grid-cols-1'}`}>
            {/* Sidebar filtres */}
            {filtersOpen && (
              <FiltersSidebar vehicles={vehicles} filters={filters} setFilters={setFilters}
                activeCount={Math.max(activeCount, 0)} onClose={() => setFiltersOpen(false)} />
            )}

            {/* Résultats */}
            <div id="resultats" className="scroll-mt-32">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {!filtersOpen && (
                    <button onClick={() => setFiltersOpen(true)}
                      className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm">
                      <Filter size={14} />
                      Filtres
                      {activeCount > 0 && (
                        <span className="bg-teal-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{activeCount}</span>
                      )}
                    </button>
                  )}
                  <h1 className="text-xl md:text-2xl text-slate-900">
                    {filtered.length} véhicule{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
                    <span className="text-slate-900"> à {villeParam}</span>
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Trier par</span>
                  <div className="relative">
                    <select value={sort} onChange={e => setSort(e.target.value)}
                      className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                      {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Chips filtres actifs */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtres :</span>
                {activeChips.map(c => (
                  <span key={c.key}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {c.label}
                    {c.clear && (
                      <button onClick={c.clear} aria-label={`Retirer ${c.label}`}
                        className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {activeChips.length > 1 && (
                  <button onClick={clearAll}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 underline underline-offset-2">
                    Effacer tout
                  </button>
                )}
              </div>

              {/* Grille véhicules */}
              {loading ? (
                <div className="text-center py-24 text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" /> Chargement des véhicules…
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Car size={28} className="text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Aucun véhicule trouvé</h3>
                  <p className="text-slate-500 text-sm mb-5">Modifiez vos filtres pour élargir la recherche.</p>
                  <button onClick={clearAll} className="text-sm font-bold text-teal-600 hover:text-teal-700">
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <>
                  <div className={`grid sm:grid-cols-2 gap-6 ${filtersOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'}`}>
                    {pageItems.map(v => (
                      <CatalogCard key={`${v.fromApi ? 'api' : 'cat'}-${v.id}`} v={v} formuleLabel={formuleLabel} wide={!filtersOpen} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
                      <button onClick={() => goTo(page - 1)} disabled={page === 1} aria-label="Page précédente"
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      {pageNums.map((p, i) => p === '…' ? (
                        <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">…</span>
                      ) : (
                        <button key={p} onClick={() => goTo(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${p === page ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-700'}`}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => goTo(page + 1)} disabled={page === totalPages} aria-label="Page suivante"
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}