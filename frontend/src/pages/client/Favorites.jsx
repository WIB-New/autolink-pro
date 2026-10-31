import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import Icon from '../../components/Icon';
import { useConfirm } from '../../contexts/ConfirmContext';
import { vehiclesAPI } from '../../services/api';
import { TIER_BADGES, vehicleImage, vehicleName, vehicleRate } from '../../utils/vehicles';
import { formatNumber, uiText, vehicleLabel } from '../../i18n';

const t = (text, options) => uiText('pages.client.Favorites', text, options);

export default function Favorites() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('daily_rate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tier, setTier] = useState('');

  const load = useCallback(async () => {
    try { const { data } = await vehiclesAPI.favorites(); setVehicles(data); setError(''); } catch (_) { setError(t('API injoignable — favoris indisponibles.')); }
    setLoaded(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  const tiers = useMemo(() => [...new Set(vehicles.map((v) => v.tier))], [vehicles]);
  const visible = useMemo(() => vehicles
    .filter((v) => (!tier || v.tier === tier) && `${v.brand} ${v.model} ${v.city}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (Number(a[sortField]) - Number(b[sortField])) * (sortOrder === 'desc' ? -1 : 1)), [vehicles, search, sortField, sortOrder, tier]);

  const remove = async (vehicle) => {
    if (!(await confirm({ title: t('Retirer des favoris'), message: t('Retirer {{name}} de vos favoris ?', { name: vehicleName(vehicle) }), confirmLabel: t('Retirer'), danger: true }))) return;
    await vehiclesAPI.removeFavorite(vehicle.id);
    setVehicles((items) => items.filter((item) => item.id !== vehicle.id));
  };

  const available = vehicles.filter((v) => v.status === 'approved').length;

  return (
    <DashboardLayout title={t('Mes favoris')} subtitle={t('Retrouvez les véhicules que vous avez sauvegardés et réservez-les en un clic.')}
      actions={<Link to="/client/search" className="btn-secondary"><Icon name="search" size={20} />{t('Explorer le catalogue')}</Link>}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: 'favorite', label: 'Véhicules sauvegardés', value: vehicles.length },
            { icon: 'event_available', label: 'Disponibles maintenant', value: available },
            { icon: 'payments', label: 'Tarif le plus bas', value: vehicles.length ? `${formatNumber(Math.min(...vehicles.map(vehicleRate)))} F/j` : '—' },
          ].map((kpi) => (
            <div key={kpi.label} className="card flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-error-container/60 text-error flex items-center justify-center"><Icon name={kpi.icon} fill={kpi.icon === 'favorite'} /></span>
              <div><div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{kpi.value}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t(kpi.label)}</div></div>
            </div>
          ))}
        </div>

        <div className="card p-3 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {['', ...tiers].map((value) => (
              <button key={value || 'all'} onClick={() => setTier(value)} className={`shrink-0 px-4 py-2 rounded-lg font-label-lg text-label-lg ${tier === value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                {value ? vehicleLabel(value, 'tier') : t('Tous')}
              </button>
            ))}
          </div>
          <ListToolbar className="lg:w-[420px]" search={search} onSearchChange={setSearch} sortField={sortField} onSortFieldChange={setSortField} sortOrder={sortOrder} onSortOrderChange={setSortOrder}
            sortOptions={[{ value: 'daily_rate', label: t('Prix') }, { value: 'year', label: t('Année') }, { value: 'rating', label: t('Note') }]} placeholder={t('Rechercher un favori')} />
        </div>

        {error && <p className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</p>}

        {visible.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map((v) => {
              const available = v.status === 'approved';
              return (
                <article key={v.id} className="card p-0 overflow-hidden flex flex-col">
                  <div className="relative h-48">
                    <img src={vehicleImage(v)} alt={vehicleName(v)} className={`w-full h-full object-cover ${available ? '' : 'grayscale'}`} />
                    <span className={`absolute top-3 left-3 px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[v.tier]}`}>{vehicleLabel(v.tier_label || v.tier, 'tier')}</span>
                    <button onClick={() => remove(v)} aria-label={t('Retirer des favoris')} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-surface-container-lowest/95 text-error flex items-center justify-center shadow"><Icon name="favorite" fill /></button>
                    <span className={`absolute bottom-3 left-3 ${available ? 'badge-success' : 'badge-warning'}`}>{available ? t('Disponible') : t('Actuellement loué')}</span>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><Icon name="location_on" size={16} />{v.city}</span>
                      <span className="flex items-center gap-1"><Icon name="star" size={16} fill className="text-tertiary-container" />{Number(v.rating || 0).toFixed(1)}</span>
                    </div>
                    <Link to={`/client/vehicle/${v.id}`} className="font-headline-sm text-headline-sm text-on-surface dark:text-white hover:text-primary">{vehicleName(v)}</Link>
                    <div className="flex flex-wrap gap-3 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><Icon name="airline_seat_recline_normal" size={16} />{v.seats} pl.</span>
                      <span className="flex items-center gap-1"><Icon name="local_gas_station" size={16} />{vehicleLabel(v.fuel, 'fuel')}</span>
                      <span className="flex items-center gap-1"><Icon name="lock" size={16} />{t('Caution {{n}} F', { n: formatNumber(v.deposit_amount) })}</span>
                    </div>
                    <div className="mt-auto flex items-end justify-between">
                      <div className="font-headline-md text-headline-md text-primary">{formatNumber(vehicleRate(v))} <span className="font-label-sm text-label-sm">FCFA/j</span></div>
                      <button onClick={() => navigate(`/client/search?vehicle=${v.id}`)} disabled={!available} className="btn-primary py-2 px-4">{t('Réserver')}<Icon name="arrow_forward" size={18} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : loaded && (
          <div className="card text-center py-16">
            <Icon name="heart_broken" size={44} className="text-outline" />
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white mt-2">{t('Aucun favori pour le moment.')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('Touchez le cœur d’un véhicule dans le catalogue pour le retrouver ici.')}</p>
            <Link to="/client/search" className="btn-primary mt-4">{t('Parcourir le catalogue')}</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
