import React from 'react';
import { Wallet, Percent, Car, CalendarCheck } from 'lucide-react';
import StatCard from '../StatCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));

/* 4 KPI style maquette — icône colorée + valeur + libellé (StatCard partagé). */
export default function KpiCards({ grossRevenue = 0, commission = 0, activeFleet = 0, totalFleet = 0, interventions = 0, sparkData = [] }) {
  const cards = [
    { icon: Wallet,        iconCls: 'bg-blue-50 text-blue-600',       value: fmt(grossRevenue), unit: 'FCFA',          label: "Chiffre d'affaires" },
    { icon: Percent,       iconCls: 'bg-emerald-50 text-emerald-600', value: fmt(commission),   unit: 'FCFA',          label: 'Commissions (15 %)' },
    { icon: Car,           iconCls: 'bg-amber-50 text-amber-600',     value: activeFleet,       unit: `/ ${totalFleet}`, label: 'Flotte active' },
    { icon: CalendarCheck, iconCls: 'bg-violet-50 text-violet-600',   value: interventions,     unit: '',              label: 'Réservations' },
  ];

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {cards.map(c => <StatCard key={c.label} {...c} />)}
    </div>
  );
}
