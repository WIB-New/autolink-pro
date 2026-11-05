import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, ShieldCheck, Zap, CalendarClock, Star, Pencil, MoreHorizontal,
  CalendarRange, Image as ImageIcon, FileText, UserCheck, Navigation,
} from 'lucide-react';
import { CATALOG_VEHICLES, getVehicleImage } from '../../utils/carImages';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const fmtDate = d => { try { return new Date(d).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }); } catch (_) { return '—'; } };

const TIER_BADGE = { gold: 'Prestige Gold VIP', premium: 'Prestige Premium', collection: 'Super Luxe VIP' };
const QUARTIERS = { Douala: ['Akwa', 'Bonanjo', 'Deïdo', 'Bonapriso'], 'Yaoundé': ['Bastos', 'Centre-ville', 'Nlongkak'] };

export const fleetImage = (v) => {
  if (v.image_url) return v.image_url;
  if (v.photos?.[0]?.image) return v.photos[0].image;
  const name = `${v.brand || ''} ${v.model || ''}`.toLowerCase();
  const found = CATALOG_VEHICLES.find(c => c.model && name.includes(c.model.toLowerCase()))
    || CATALOG_VEHICLES.find(c => name.includes((c.name || '').split(' ').slice(0, 2).join(' ').toLowerCase()));
  return found?.image || getVehicleImage(v.category);
};

const quality = (v) => {
  const score = Number(v.condition_score || 0) || (v.status === 'pending' ? 60 : 78 + (v.id % 3) * 5);
  if (v.status === 'pending') return { score, label: 'Score en évaluation', pct: score, cls: 'text-slate-500', ring: '#94a3b8' };
  if (score >= 85) return { score, label: "Qualité d'annonce : très bonne", pct: score, cls: 'text-teal-600', ring: '#0d9488' };
  if (score >= 70) return { score, label: 'Annonce à perfectionner', pct: score, cls: 'text-amber-600', ring: '#f59e0b' };
  return { score, label: 'Annonce à retravailler', pct: score, cls: 'text-red-500', ring: '#ef4444' };
};

/* Donut qualité — cercle conique + pourcentage. */
const Donut = ({ pct, ring }) => (
  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center"
    style={{ background: `conic-gradient(${ring} ${pct * 3.6}deg, #e2e8f0 0deg)` }}>
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
      <span className="text-xs font-black text-slate-800">{pct}<span className="text-[8px] text-slate-400">%</span></span>
    </div>
  </div>
);

const SpecCell = ({ label, value, sub }) => (
  <div className="min-w-0">
    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
    <div className="text-sm font-black text-slate-900 truncate">{value}</div>
    <div className="text-[10px] text-slate-400">{sub}</div>
  </div>
);

const Chip = ({ children, cls = 'bg-slate-50 text-slate-500 border-slate-100' }) => (
  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md border ${cls}`}>{children}</span>
);

const Btn = ({ children, cls = '', ...p }) => (
  <button {...p} className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-lg transition-colors ${cls}`}>
    {children}
  </button>
);

/* Carte véhicule riche de la page « Mes Véhicules & Flotte ». */
export default function FleetCard({ v, activeBooking }) {
  const navigate = useNavigate();
  const q = quality(v);
  const city = v.city || 'Douala';
  const area = QUARTIERS[city]?.[(v.id || 0) % 4] || 'Centre';
  const photoCount = v.photos?.length || 8;
  const name = `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim();
  const seats = v.seats || (['SUV', 'Van', 'Minibus'].includes(v.category) ? 7 : 5);

  const statusBadge = {
    pending:     { label: 'En contrôle en attente', cls: 'bg-amber-500 text-white' },
    approved:    { label: 'Statut Certifié',        cls: 'bg-teal-600 text-white' },
    rented:      { label: TIER_BADGE[v.tier] || `${v.category || 'Véhicule'} VIP`, cls: 'bg-slate-900 text-white' },
    maintenance: { label: 'En maintenance',         cls: 'bg-amber-500 text-white' },
    suspended:   { label: 'Suspendu',               cls: 'bg-red-500 text-white' },
  }[v.status] || { label: 'Statut Certifié', cls: 'bg-teal-600 text-white' };

  const statusLine = {
    pending:     { text: 'En attente de contrôle technique AutoLink', cls: 'text-amber-600' },
    approved:    { text: 'En ligne · Disponible dès demain',          cls: 'text-teal-600' },
    rented:      { text: `En location jusqu'au ${fmtDate(activeBooking?.end_date)}`, cls: 'text-sky-600' },
    maintenance: { text: 'Maintenance en cours — retour estimé sous 72 h', cls: 'text-amber-600' },
    suspended:   { text: 'Annonce suspendue par AutoLink',            cls: 'text-red-500' },
  }[v.status] || { text: 'En ligne', cls: 'text-teal-600' };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col lg:flex-row gap-5">
      {/* Photo + badges */}
      <div className="lg:w-64 shrink-0">
        <div className="relative rounded-2xl overflow-hidden h-44 lg:h-40 cursor-pointer" onClick={() => navigate(`/owner/vehicles/${v.id}`)}>
          <img src={fleetImage(v)} alt={name} className="w-full h-full object-cover" />
          <span className={`absolute top-2.5 left-2.5 text-[9px] font-black px-2.5 py-1 rounded-full ${statusBadge.cls}`}>{statusBadge.label}</span>
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-slate-900/70 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-md">
            <Camera size={10} /> {photoCount} Photos
          </span>
        </div>
        <div className="flex items-center justify-between mt-2.5 flex-wrap gap-1.5">
          <span className="text-[9px] font-black text-slate-400 tracking-widest">VIN : {v.plate || `LT-${1000 + (v.id || 0)}-A`}</span>
          <div className="flex gap-1 flex-wrap">
            {v.status === 'approved' && <><Chip cls="bg-teal-50 text-teal-700 border-teal-100"><ShieldCheck size={9} /> Contrôle validé</Chip>
              <Chip><Zap size={9} /> Réservation instantanée</Chip></>}
            {v.status === 'rented' && <Chip cls="bg-sky-50 text-sky-700 border-sky-100"><UserCheck size={9} /> Chauffeur dédié</Chip>}
            {v.status === 'pending' && <Chip cls="bg-amber-50 text-amber-700 border-amber-100"><CalendarClock size={9} /> RDV {fmtDate(v.technical_control_date)}</Chip>}
            {['maintenance', 'suspended'].includes(v.status) && <Chip cls="bg-amber-50 text-amber-700 border-amber-100"><CalendarClock size={9} /> Suivi garage</Chip>}
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 onClick={() => navigate(`/owner/vehicles/${v.id}`)} className="font-black text-slate-900 text-base truncate cursor-pointer hover:text-teal-700 transition-colors">{name || 'Véhicule'}</h3>
              <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md tracking-widest">{v.plate || '—'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {city}, {area} · {v.gear || 'Automatique'} {v.category === 'SUV' ? '(4WD)' : ''} · {v.fuel || 'Essence'} · {seats} Places climatisées
            </p>
            <p className={`flex items-center gap-1.5 text-[11px] font-bold mt-1.5 ${statusLine.cls}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" /> {statusLine.text}
            </p>
          </div>
          {v.status === 'pending' && (
            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-md">Urgent</span>
          )}
        </div>

        {/* Bloc qualité / location active */}
        {v.status === 'rented' && activeBooking ? (
          <div className="mt-3 bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
            <div className="w-11 h-11 bg-sky-600 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
              {(activeBooking.client_name || 'C').split(' ').map(x => x[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-black text-slate-900">Location active — {activeBooking.client_name || 'Client certifié'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Mission en cours · Chauffeur dédié AutoLink · Retour prévu {fmtDate(activeBooking.end_date)}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Btn cls="bg-sky-600 text-white hover:bg-sky-700" onClick={() => navigate('/owner/dashboard')}><Navigation size={11} /> Suivre la location</Btn>
              <Btn cls="bg-white border border-slate-200 text-slate-600 hover:border-teal-400">Retours lieu</Btn>
            </div>
          </div>
        ) : (
          <div className={`mt-3 rounded-2xl border p-4 flex items-center gap-4 flex-wrap ${v.status === 'pending' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
            <Donut pct={q.pct} ring={q.ring} />
            <div className="flex-1 min-w-[140px]">
              <div className={`text-xs font-black ${q.cls}`}>{q.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {v.status === 'pending'
                  ? 'Inspection mécanique & administrative programmée — votre véhicule sera évalué sur 100 points.'
                  : 'Photos, description et tarification impactent directement votre position dans le catalogue.'}
              </div>
            </div>
            <Btn cls={v.status === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-teal-600 text-white hover:bg-teal-700'}>
              {v.status === 'pending' ? 'Compléter les documents' : 'Optimiser l\'annonce'}
            </Btn>
          </div>
        )}

        {/* Specs + actions */}
        <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
          <div className="flex gap-6 sm:gap-8 flex-wrap">
            <SpecCell label="Tarif journalier" value={<>{fmt(v.daily_rate)} <span className="text-[9px] text-slate-400">FCFA/j</span></>} sub="avec chauffeur" />
            <SpecCell label="Performances" value={<>{v.total_bookings || 0} <span className="text-[9px] text-slate-400">locations</span></>}
              sub={<span className="flex items-center gap-1"><Star size={9} className="text-amber-400 fill-amber-400" /> {(4.6 + ((v.id || 0) % 4) / 10).toFixed(2).replace('.', ',')}/5</span>} />
            <SpecCell label="Revenus générés" value={<>{fmt(v.total_earned)} <span className="text-[9px] text-slate-400">FCFA</span></>} sub="cumulés" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {v.status === 'pending' ? (
              <>
                <Btn cls="bg-white border border-slate-200 text-slate-600 hover:border-teal-400"><CalendarClock size={12} /> Modifier le rendez-vous</Btn>
                <Btn cls="bg-white border border-slate-200 text-slate-600 hover:border-teal-400"><FileText size={12} /> Documents</Btn>
              </>
            ) : (
              <>
                <Btn cls="bg-white border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700"><CalendarRange size={12} /> Calendrier &amp; Prix</Btn>
                <Btn cls="bg-white border border-slate-200 text-slate-600 hover:border-teal-400"><ImageIcon size={12} /> Photos</Btn>
              </>
            )}
            <Btn cls="bg-white border border-slate-200 text-slate-400 hover:text-teal-600 !px-2.5"><Pencil size={12} /></Btn>
            <Btn cls="bg-white border border-slate-200 text-slate-400 hover:text-slate-700 !px-2.5"><MoreHorizontal size={12} /></Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
