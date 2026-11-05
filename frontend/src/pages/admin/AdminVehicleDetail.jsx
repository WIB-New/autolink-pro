import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { TechSheet, HubReport, PhotoChecklist, DocsPanel, PricingPanel, HomologationChecklist, InternalNotes } from '../../components/adminveh';
import { vehiclesAPI } from '../../services/api';
import {
  ChevronRight, ChevronLeft, Hourglass, XCircle, MessageSquare,
  Rocket, Loader, Phone, MessageCircle,
} from 'lucide-react';

const STATUS_BAND = {
  pending:   { label: 'En attente de validation finale', cls: 'bg-amber-50 border-amber-200 text-amber-800' },
  approved:  { label: 'Véhicule homologué & publié', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  suspended: { label: 'Homologation refusée — véhicule suspendu', cls: 'bg-red-50 border-red-200 text-red-700' },
  rented:    { label: 'Homologué — actuellement en location', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
};

export default function AdminVehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await vehiclesAPI.detail(id);
      setVehicle(res.data);
    } catch (_) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (status) => {
    setBusy(true);
    try { await vehiclesAPI.update(id, { status }); await load(); } catch (_) {}
    setBusy(false);
  };

  const savePricing = async (payload) => {
    try { await vehiclesAPI.update(id, payload); await load(); } catch (_) {}
  };

  if (loading) {
    return (
      <AdminLayout title="Dossier d'homologation" subtitle="Chargement…">
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-2">
          <Loader size={18} className="animate-spin" /> Chargement du véhicule…
        </div>
      </AdminLayout>
    );
  }
  if (!vehicle) {
    return (
      <AdminLayout title="Véhicule introuvable" subtitle="">
        <div className="text-center py-24">
          <p className="text-slate-500 mb-4">Ce dossier véhicule n'existe pas.</p>
          <button onClick={() => navigate('/admin/dashboard')} className="text-teal-600 font-bold text-sm">← Retour au tableau de bord</button>
        </div>
      </AdminLayout>
    );
  }

  const v = vehicle;
  const band = STATUS_BAND[v.status] || STATUS_BAND.pending;
  const ref = `VEH-2025-${String(v.brand || 'AUT').slice(0, 3).toUpperCase()}-${String(v.id).padStart(3, '0')}`;

  return (
    <AdminLayout
      title={
        <span className="flex items-center gap-2 flex-wrap">
          {v.brand} {v.model} {v.fuel === 'Hybride' ? 'AWD Hybrid' : ''} {v.year}
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md align-middle">#{ref}</span>
        </span>
      }
      subtitle={`Soumission Hub ${v.city || 'Douala'} Akwa · Dossier d'homologation prioritaire`}
    >
      {/* Fil d'ariane + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 -mt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <button onClick={() => navigate(-1)} className="hover:text-teal-600 transition-colors"><ChevronLeft size={14} /></button>
          <Link to="/admin/catalog" className="hover:text-teal-600 transition-colors">Véhicules</Link>
          <ChevronRight size={12} />
          <span>Homologations &amp; Audits Flotte</span>
          <ChevronRight size={12} />
          <span className="text-slate-700">#{ref}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {v.status === 'pending' && (
            <>
              <button onClick={() => setStatus('suspended')} disabled={busy}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                <XCircle size={13} /> Refuser l'homologation
              </button>
              <button className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors">
                <MessageSquare size={13} /> Demander modifications
              </button>
              <button onClick={() => setStatus('approved')} disabled={busy}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50">
                <Rocket size={13} /> Publier le véhicule
              </button>
            </>
          )}
          {v.status === 'approved' && (
            <button onClick={() => setStatus('suspended')} disabled={busy}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
              <XCircle size={13} /> Suspendre la publication
            </button>
          )}
          {v.status === 'suspended' && (
            <button onClick={() => setStatus('approved')} disabled={busy}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
              <Rocket size={13} /> Republier
            </button>
          )}
        </div>
      </div>

      {/* Bande statut */}
      <div className={`border rounded-2xl px-5 py-3.5 mb-5 flex flex-wrap items-center justify-between gap-3 ${band.cls}`}>
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-white/70 rounded-xl flex items-center justify-center">
            <Hourglass size={16} />
          </span>
          <div>
            <div className="text-sm font-black">Statut : {band.label}</div>
            <div className="text-[10px] opacity-80">
              Soumis le {v.created_at ? new Date(v.created_at).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }) : '24 Oct 2025'} par {v.owner_name || 'le bailleur'} — Partenaire Flotte Certifié
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black">
          <span className="bg-white/70 rounded-xl px-3 py-2">{v.owner_name || 'Bailleur'}</span>
          <span className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-1"><Phone size={10} /> +237 6·· ·· ·· 22</span>
          <button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-3 py-2 flex items-center gap-1 transition-colors">
            <MessageCircle size={10} /> Message direct
          </button>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid xl:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-5">
          <TechSheet vehicle={v} />
          <PhotoChecklist vehicle={v} />
          <DocsPanel vehicle={v} />
          <HomologationChecklist />
        </div>
        <div className="space-y-5">
          <HubReport vehicle={v} />
          <PricingPanel vehicle={v} onSave={savePricing} />
          <InternalNotes vehicle={v} />
        </div>
      </div>
    </AdminLayout>
  );
}
