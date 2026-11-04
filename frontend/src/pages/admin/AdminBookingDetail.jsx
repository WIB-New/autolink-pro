import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { PartiesPanel, FinancePanel, InspectionPanel, AuditNotes, Roadmap } from '../../components/adminbook';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import {
  ChevronRight, ShieldCheck, Send, CheckCircle2, Pencil, XCircle,
  FileText, Timer, Loader, Lock,
} from 'lucide-react';

const shortDate = iso => iso ? new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_BADGE = {
  pending:   { label: 'À transmettre au propriétaire', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmée — remise en préparation', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  active:    { label: 'Mission en cours', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: 'Terminée', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: 'Annulée', cls: 'bg-red-100 text-red-600 border-red-200' },
  disputed:  { label: 'Litige — arbitrage requis', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await bookingsAPI.detail(id);
      setBooking(res.data);
      if (res.data.vehicle) {
        const v = await vehiclesAPI.detail(res.data.vehicle).catch(() => null);
        if (v) setVehicle(v.data);
      }
    } catch (_) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (status) => {
    setBusy(true);
    try { await bookingsAPI.updateStatus(id, status); await load(); } catch (_) {}
    setBusy(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Dossier de Réservation" subtitle="Chargement…">
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-2">
          <Loader size={18} className="animate-spin" /> Chargement du dossier…
        </div>
      </AdminLayout>
    );
  }
  if (!booking) {
    return (
      <AdminLayout title="Dossier introuvable" subtitle="">
        <div className="text-center py-24">
          <p className="text-slate-500 mb-4">Ce dossier de réservation n'existe pas.</p>
          <button onClick={() => navigate('/admin/reservations')} className="text-teal-600 font-bold text-sm">← Retour aux réservations</button>
        </div>
      </AdminLayout>
    );
  }

  const b = booking;
  const days = b.days || Math.max(1, Math.round((new Date(b.end_date) - new Date(b.start_date)) / 86400000));
  const badge = STATUS_BADGE[b.status] || STATUS_BADGE.pending;

  return (
    <AdminLayout
      title={
        <span className="flex items-center gap-2 flex-wrap">
          Dossier de Réservation <span className="text-teal-600">#ALP-{String(b.id).padStart(4, '0')}</span>
          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md align-middle">PRIORITÉ P1</span>
        </span>
      }
      subtitle={`${b.vehicle_name || ''} · ${shortDate(b.start_date)} au ${shortDate(b.end_date)} (${days} jours) · Hub ${/yaound/i.test(b.pickup_address || '') ? 'Bastos Yaoundé' : 'Akwa Douala'}`}
    >
      {/* Fil d'ariane + statut */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 -mt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <Link to="/admin/reservations" className="hover:text-teal-600 transition-colors">Réservations</Link>
          <ChevronRight size={12} />
          <span className="text-slate-700">#ALP-2025-DLA-{String(b.id).padStart(4, '0')}</span>
          <span className="bg-teal-50 text-teal-700 text-[9px] font-black px-2 py-0.5 rounded-md ml-1">CEMAC Littoral Ops</span>
        </div>
        <span className={`flex items-center gap-1.5 border text-[10px] font-black px-3 py-1.5 rounded-xl ${badge.cls}`}>
          <Timer size={11} /> {badge.label} · Expire dans 02h45m
        </span>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {b.status === 'pending' && (
          <button onClick={() => setStatus('confirmed')} disabled={busy}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50">
            <Send size={13} /> Transmettre au propriétaire
          </button>
        )}
        {['pending', 'confirmed'].includes(b.status) && (
          <button onClick={() => setStatus('active')} disabled={busy}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
            <CheckCircle2 size={13} className="text-teal-600" /> Confirmer manuellement
          </button>
        )}
        <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors">
          <Pencil size={13} className="text-slate-400" /> Modifier
        </button>
        {!['cancelled', 'completed'].includes(b.status) && (
          <button onClick={() => setStatus('cancelled')} disabled={busy}
            className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
            <XCircle size={13} /> Refuser / Annuler
          </button>
        )}
        <button className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black px-4 py-2.5 rounded-xl transition-colors">
          <FileText size={13} /> Contrat OHADA
        </button>
      </div>

      {/* Bande protocole séquestre */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 text-[11px] font-black text-emerald-800">
          <ShieldCheck size={14} className="text-emerald-600" />
          Protocole de Séquestre Bancaire &amp; Mobilité Confirmé CEMAC
        </span>
        <span className="text-[10px] text-emerald-600">Escrow MTN MoMo Validé</span>
        <span className="text-[10px] text-emerald-600 flex items-center gap-1"><Lock size={9} /> Juridiction Douala-Bonanjo</span>
      </div>

      {/* Grille principale */}
      <div className="grid xl:grid-cols-[1fr_330px] gap-5 items-start">
        <div className="space-y-5">
          <PartiesPanel booking={b} vehicle={vehicle} />
          <InspectionPanel booking={b} />
          <AuditNotes booking={b} />
        </div>
        <div className="space-y-5">
          <FinancePanel booking={b} />
          <Roadmap booking={b} onTransmit={() => setStatus('confirmed')} />
        </div>
      </div>
    </AdminLayout>
  );
}
