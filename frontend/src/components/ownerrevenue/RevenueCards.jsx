import React from 'react';
import { Wallet, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../StatCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* 3 cartes soldes — StatCard partagé (maquette). La 1re carte déclenche le retrait. */
export default function RevenueCards({ available = 0, pending = 0, total = 0, onWithdraw }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <StatCard icon={Wallet} iconCls="bg-emerald-50 text-emerald-600"
        value={fmt(available)} unit="FCFA" label="Solde disponible · Retirer"
        onClick={onWithdraw} title="Déclencher un retrait" />
      <StatCard icon={Clock} iconCls="bg-amber-50 text-amber-600"
        value={fmt(pending)} unit="FCFA" label="En attente de virement" />
      <StatCard icon={TrendingUp} iconCls="bg-blue-50 text-blue-600"
        value={fmt(total)} unit="FCFA" label="Total cumulé" />
    </div>
  );
}
