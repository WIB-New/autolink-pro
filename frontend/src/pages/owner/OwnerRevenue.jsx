import React, { useState, useEffect, useCallback } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { RevenueCards, WithdrawPanel, RevenueTable, WithdrawHistory } from '../../components/ownerrevenue';
import { FileDown, RefreshCw, Banknote } from 'lucide-react';
import { bookingsAPI, walletAPI } from '../../services/api';
import { ownerNet } from '../../utils/commission';

/* Export CSV des locations comptabilisées (séparateur « ; » pour Excel FR). */
const exportCsv = (bookings) => {
  const rows = bookings.filter(b => ['completed', 'active', 'confirmed'].includes(b.status));
  const head = ['Dossier', 'Début', 'Fin', 'Véhicule', 'Immatriculation', 'Locataire', 'Statut', 'Brut (FCFA)', 'Commission (FCFA)', 'Net (FCFA)'];
  const lines = rows.map(b => [
    `BK-${String(b.id).padStart(4, '0')}`, b.start_date, b.end_date, b.vehicle_name, b.vehicle_plate,
    b.client_name, b.status, Math.round(b.subtotal || 0), Math.round(b.commission_amount || 0), Math.round(ownerNet(b)),
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'));
  const blob = new Blob(['\ufeff' + [head.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `autolink-revenus-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

export default function OwnerRevenue() {
  const [bookings, setBookings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [online, setOnline] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, w] = await Promise.all([bookingsAPI.list({ page_size: 100 }), walletAPI.get()]);
      setBookings(b.data.results || b.data || []);
      setBalance(Number(w.data.balance || 0));
      setTransactions(w.data.transactions || []);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = bookings.filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((s, b) => s + ownerNet(b), 0);
  const total = bookings.filter(b => b.status === 'completed')
    .reduce((s, b) => s + ownerNet(b), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <OwnerLayout badges={{ demandes: pendingCount }} balance={balance}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900">Revenus &amp; retraits</h1>
            {!online && <button onClick={load} className="text-red-500 inline-flex items-center gap-1 text-[11px] font-bold"><RefreshCw size={9} /> Hors ligne</button>}
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={() => setShowWithdraw(true)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Banknote size={13} /> Retirer
            </button>
            <button onClick={() => exportCsv(bookings)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl hover:border-teal-400">
              <FileDown size={12} /> Export CSV
            </button>
          </div>
        </div>

        {/* Soldes */}
        <RevenueCards available={balance} pending={pending} total={total}
          onWithdraw={() => setShowWithdraw(true)} />

        {/* Table revenus */}
        <RevenueTable bookings={bookings} />

        {/* Historique */}
        <WithdrawHistory transactions={transactions} />

        {/* Modal de retrait */}
        <WithdrawPanel open={showWithdraw} onClose={() => setShowWithdraw(false)} balance={balance} />
      </div>
    </OwnerLayout>
  );
}
