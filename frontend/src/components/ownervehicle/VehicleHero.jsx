import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BadgeCheck, MapPin, Gauge } from 'lucide-react';
import { fleetImage } from '../ownerfleet/FleetCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

const STATUS = {
  approved:    { label: 'En ligne — visible au catalogue',     cls: 'bg-teal-100 text-teal-700' },
  rented:      { label: 'En location · Mission en cours',      cls: 'bg-sky-100 text-sky-700' },
  pending:     { label: 'En attente de contrôle AutoLink',     cls: 'bg-amber-100 text-amber-700' },
  maintenance: { label: 'En maintenance',                      cls: 'bg-amber-100 text-amber-700' },
  suspended:   { label: 'Suspendu',                            cls: 'bg-red-100 text-red-600' },
};

/* En-tête de la fiche véhicule — données réelles du véhicule. */
export default function VehicleHero({ v }) {
  const navigate = useNavigate();
  const st = STATUS[v.status] || STATUS.approved;
  const hub = v.availability_prefs?.pickup_hub || v.availability_prefs?.pickup_address;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row gap-5">
      <img src={fleetImage(v)} alt="" className="w-full md:w-40 h-28 object-cover rounded-2xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{v.brand} {v.model} {v.year ? `(${v.year})` : ''}</h1>
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${st.cls}`}>{st.label}</span>
              <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">{v.category || '—'} · {v.fuel || '—'}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-semibold flex-wrap">
              <span className="flex items-center gap-1"><BadgeCheck size={11} className="text-teal-600" /> Immat. : {v.plate || '—'}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {v.city || '—'}{hub ? ` — ${hub}` : ''}</span>
              <span className="flex items-center gap-1"><Gauge size={11} /> {v.mileage ? `${fmt(v.mileage)} km` : 'Kilométrage non renseigné'}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate(`/owner/edit-vehicle/${v.id}`)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 hover:border-teal-400 px-3.5 py-2 rounded-xl transition-colors">
              <TrendingUp size={12} /> Modifier l'annonce &amp; les tarifs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
