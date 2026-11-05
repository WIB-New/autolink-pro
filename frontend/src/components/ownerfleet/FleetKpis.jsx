import React from 'react';
import { Car, KeyRound, Banknote, Gauge } from 'lucide-react';
import StatCard from '../StatCard';

/* Bandeau KPI « Mes Véhicules & Flotte » — StatCard partagé (maquette). */
export default function FleetKpis({ total = 0, rented = 0, activeMissions = 0, occupancy = 0, revenue = 0, avgScore = 0, toOptimize = 0 }) {
  const kpis = [
    { icon: Car,      iconCls: 'bg-blue-50 text-blue-600',       value: total,         unit: `· ${rented} en location`,  label: 'Véhicules' },
    { icon: KeyRound, iconCls: 'bg-emerald-50 text-emerald-600', value: activeMissions, unit: `· ${Math.round(occupancy)} %`, label: 'Missions en cours' },
    { icon: Banknote, iconCls: 'bg-amber-50 text-amber-600',     value: Math.round(revenue).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')), unit: 'FCFA', label: 'Revenus cumulés' },
    { icon: Gauge,    iconCls: 'bg-violet-50 text-violet-600',   value: Math.round(avgScore), unit: '/100',            label: 'Score qualité' },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map(k => <StatCard key={k.label} {...k} />)}
    </div>
  );
}
