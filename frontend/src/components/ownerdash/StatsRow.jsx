import React from 'react';
import { Gauge, Star, Car, Banknote } from 'lucide-react';
import StatCard from '../StatCard';

/* Rangée de 4 KPI style maquette — icône colorée + valeur + libellé (StatCard partagé). */
export default function StatsRow({ occupancy = 0, rating = 0, activeVehicles = 0, revenuePerDay = 0 }) {
  const stats = [
    { icon: Banknote, iconCls: 'bg-blue-50 text-blue-600',       value: Math.round(revenuePerDay).toLocaleString('fr-FR'), unit: 'FCFA', label: 'Revenu / jour' },
    { icon: Gauge,    iconCls: 'bg-emerald-50 text-emerald-600', value: Math.round(occupancy),   unit: '%',   label: "Taux d'occupation" },
    { icon: Car,      iconCls: 'bg-amber-50 text-amber-600',     value: activeVehicles,          unit: '',    label: 'Véhicules actifs' },
    { icon: Star,     iconCls: 'bg-violet-50 text-violet-600',   value: rating,                  unit: '/5',  label: 'Note flotte' },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </div>
  );
}
