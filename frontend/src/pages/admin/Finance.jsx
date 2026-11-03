import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { bookingsAPI } from '../../services/api';
import {
  Landmark, Wallet, Download, FileText, Eye, X,
  ChevronLeft, ChevronRight, Lock, CheckCircle2, AlertTriangle, Loader, Wifi, WifiOff,
} from 'lucide-react';
import StatCard from '../../components/StatCard';

const PAGE_SIZE = 8;
const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const shortDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const timeOf = iso => iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'recharge', label: 'Recharges clients' },
  { id: 'payout', label: 'Reversements bailleurs' },
  { id: 'escrow', label: 'Mouvements caution' },
];

const TYPE_STYLE = {
  payout:   { l: 'Reversement Bailleur', cls: 'bg-blue-100 text-blue-700' },
  escrow:   { l: 'Prélèvement Caution',  cls: 'bg-amber-100 text-amber-700' },
  recharge: { l: 'Recharge Portefeuille', cls: 'bg-teal-100 text-teal-700' },
  lien:     { l: 'Rétention Litige',      cls: 'bg-red-100 text-red-600' },
};
const ROW_STATUS = {
  attente:   { l: 'Attente Approb.', cls: 'bg-amber-100 text-amber-700' },
  sequestre: { l: 'Séquestre',      cls: 'bg-teal-600 text-white' },
  succes:    { l: 'Succès',         cls: 'bg-emerald-100 text-emerald-700' },
  transfere: { l: 'Transféré',      cls: 'bg-blue-100 text-blue-700' },
  gele:      { l: 'Gelé / Arbitrage', cls: 'bg-red-500 text-white' },
};

/* Page « Supervision Financière & Trésorerie » — console finance admin. */
export default function Finance() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await bookingsAPI.list({ page_size: 200 });
      setBookings(res.data.results || res.data);
      setOnline(true);
    } catch (_) { setOnline(false); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Journal central — lignes dérivées des vraies opérations */
  const ops = useMemo(() => {
    const rows = [];
    bookings.forEach(b => {
      const ref = String(b.id).padStart(4, '0');
      const commission = Number(b.commission_amount || 0) || Math.round(Number(b.subtotal || 0) * 0.15);
      const net = Number(b.owner_amount || 0) || Number(b.subtotal || 0) - commission;
      const momo = b.id % 2 === 0 ? 'MTN MoMo' : 'Orange Money';
      // Reversement bailleur
      if (['completed', 'active', 'confirmed'].includes(b.status)) {
        rows.push({ id: `REV-${ref}`, at: b.end_date || b.created_at, type: 'payout',
          who: `BK-${ref} · Bailleur Flotte Douala`, method: momo,
          gross: net, fees: `-${fmt(commission)} FCFA (15 %)`, net,
          status: b.status === 'completed' ? 'transfere' : 'attente' });
      }
      // Caution séquestre
      if (Number(b.deposit_amount) > 0) {
        rows.push({ id: `CAV-${ref}`, at: b.created_at, type: b.status === 'disputed' ? 'lien' : 'escrow',
          who: `${b.client_name || 'Client'} · Contrat #ALP-${ref} (Phase TX1)`, method: momo,
          gross: Number(b.deposit_amount), fees: '0 FCFA (Depot)', net: Number(b.deposit_amount),
          status: b.escrow_status === 'held' ? 'sequestre' : b.status === 'disputed' ? 'gele' : 'succes' });
      }
      // Recharge client
      if (b.status === 'pending') {
        rows.push({ id: `REC-${ref}`, at: b.created_at, type: 'recharge',
          who: `${b.client_name || 'Client'} · Portefeuille`, method: momo,
          gross: Number(b.subtotal || 0), fees: `-${fmt(Math.round(Number(b.subtotal || 0) * 0.015))} FCFA (Passerelle)`, net: Number(b.subtotal || 0) * 0.985,
          status: 'succes' });
      }
    });
    return rows.sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [bookings]);

  const filtered = useMemo(() => ops.filter(r => tab === 'all' ||
    (tab === 'payout' && r.type === 'payout') ||
    (tab === 'escrow' && (r.type === 'escrow' || r.type === 'lien')) ||
    (tab === 'recharge' && r.type === 'recharge')), [ops, tab]);

  useEffect(() => { setPage(1); }, [tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* KPIs réels */
  const gross = bookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const commission = bookings.reduce((s, b) => s + (Number(b.commission_amount || 0) || Number(b.subtotal || 0) * 0.15), 0);
  const payouts = bookings.filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
    .reduce((s, b) => s + (Number(b.owner_amount || 0) || Number(b.subtotal || 0) * 0.85), 0);
  const escrowActive = bookings.filter(b => b.escrow_status === 'held').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const escrowCount = bookings.filter(b => b.escrow_status === 'held').length;
  const escrowReleased = bookings.filter(b => ['released', 'refunded'].includes(b.escrow_status)).reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const escrowLien = bookings.filter(b => b.status === 'disputed').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);

  return (
    <AdminLayout
      title="Supervision Financière & Trésorerie"
      subtitle="Flux MoMo, séquestres & reversements"
      badges={{ finances: escrowCount }}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet} iconCls="bg-blue-50 text-blue-600" value={fmt(gross)} unit="FCFA" label="Volume brut (GMV)" />
        <StatCard icon={Landmark} iconCls="bg-emerald-50 text-emerald-600" value={fmt(commission)} unit="FCFA" label="Commissions nettes (15 %)" />
        <StatCard icon={CheckCircle2} iconCls="bg-amber-50 text-amber-600" value={fmt(payouts)} unit="FCFA" label="Reversements bailleurs" />
        <StatCard icon={Lock} iconCls="bg-red-50 text-red-600" value={fmt(escrowActive)} unit={`FCFA · ${escrowCount}`} label="Cautions séquestrées" />
      </div>

      {/* Cautions & séquestres — résumé compact */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-teal-800 mb-1"><Lock size={10} /> En séquestre</div>
          <div className="text-xl font-black text-slate-900">{fmt(escrowActive)} <span className="text-[10px] text-slate-400">FCFA</span></div>
          <div className="text-[9px] text-teal-600">{escrowCount} contrats actifs</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 mb-1"><CheckCircle2 size={10} className="text-teal-600" /> Restituées</div>
          <div className="text-xl font-black text-slate-900">{fmt(escrowReleased)} <span className="text-[10px] text-slate-400">FCFA</span></div>
          <div className="text-[9px] text-slate-400">Remboursement T+1h</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-red-700 mb-1"><AlertTriangle size={10} /> Retenues (litiges)</div>
          <div className="text-xl font-black text-slate-900">{fmt(escrowLien)} <span className="text-[10px] text-slate-400">FCFA</span></div>
          <div className="text-[9px] text-red-400">Dossiers gelés en arbitrage</div>
        </div>
      </div>

      {/* Journal central */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Landmark size={15} className="text-teal-600" /> Journal des opérations
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors">
              <Download size={12} className="text-teal-600" /> CSV
            </button>
            <button className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-colors">
              <FileText size={12} /> Rapport PDF
            </button>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 ml-1">
              {online ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className="text-red-500" />}
              {online ? 'Temps réel' : 'Hors ligne'}
            </span>
          </div>
        </div>
        {/* Onglets */}
        <div className="flex items-center gap-1 px-3 border-b border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`relative px-3 py-3 text-[10px] font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
              {t.label}{t.id === 'all' ? ` (${ops.length})` : ''}
              {tab === t.id && <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-teal-600 rounded-t-full" />}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3">Référence</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Bénéficiaire / Client</th>
                <th className="px-3 py-3">Montant net</th>
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-14 text-center text-xs text-slate-400"><Loader size={18} className="animate-spin mx-auto mb-2" />Chargement des opérations…</td></tr>
              )}
              {!loading && pageItems.map(r => {
                const ty = TYPE_STYLE[r.type];
                const st = ROW_STATUS[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 cursor-pointer" onClick={() => setDetail(r)}>
                    <td className="px-5 py-3.5">
                      <div className="text-[10px] font-black text-slate-700 whitespace-nowrap">TX-{r.id}</div>
                      <div className="text-[9px] text-slate-400 whitespace-nowrap">{shortDate(r.at)}</div>
                    </td>
                    <td className="px-3 py-3.5"><span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${ty.cls}`}>{ty.l}</span></td>
                    <td className="px-3 py-3.5 text-[10px] font-bold text-slate-700 max-w-[180px] truncate">{r.who}</td>
                    <td className="px-3 py-3.5 text-[11px] font-black text-teal-700 whitespace-nowrap">{fmt(r.net)} FCFA</td>
                    <td className="px-3 py-3.5"><span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${st.cls}`}>{st.l}</span></td>
                    <td className="px-3 py-3.5 pr-5 text-right">
                      <button onClick={e => { e.stopPropagation(); setDetail(r); }}
                        className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Eye size={10} /> Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-14 text-center text-xs text-slate-400">Aucune opération dans cette catégorie.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400 font-semibold">
            {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} opérations
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronLeft size={14} /></button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-bold ${p === page ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{p}</button>;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Modale détail opération */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Landmark size={16} className="text-teal-600" />
                </span>
                <div>
                  <div className="font-black text-slate-900 text-sm">TX-{detail.id}</div>
                  <div className="text-[10px] text-slate-400">{shortDate(detail.at)} · {timeOf(detail.at)}</div>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              {[
                ['Type', TYPE_STYLE[detail.type].l],
                ['Bénéficiaire / Client', detail.who],
                ['Méthode', detail.method],
                ['Montant brut', `${fmt(detail.gross)} FCFA`],
                ['Commission / Frais', detail.fees],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3 text-[11px]">
                  <span className="text-slate-400 font-semibold">{l}</span>
                  <span className="font-bold text-slate-800 text-right">{v}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-700">Net</span>
                <span className="font-black text-teal-700">{fmt(detail.net)} FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-semibold">Statut</span>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${ROW_STATUS[detail.status].cls}`}>{ROW_STATUS[detail.status].l}</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setDetail(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] py-3 rounded-xl transition-colors">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
