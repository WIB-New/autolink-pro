import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, FileCheck, ClipboardCheck, Contact, Scale, Smartphone, ChevronRight } from 'lucide-react';

/* Bandeau prioritaire compact — visible uniquement s'il y a des urgences. */
export default function PriorityQueue({ pendingVehicles = [], disputedBookings = [], pendingClients = 0, pendingPayouts = 0, urgentCount = 0 }) {
  const navigate = useNavigate();
  if (!urgentCount) return null;

  const chips = [
    { icon: FileCheck,      n: pendingVehicles.length,   label: 'Véhicules',    to: '/admin/catalog' },
    { icon: ClipboardCheck, n: 0,                        label: 'Inspections',  to: '/admin/inspections' },
    { icon: Contact,        n: pendingClients,           label: 'KYC clients',  to: '/admin/clients' },
    { icon: Scale,          n: disputedBookings.length,  label: 'Litiges',      to: '/admin/litiges' },
    { icon: Smartphone,     n: pendingPayouts,           label: 'Retraits',     to: '/admin/finance' },
  ].filter(c => c.n > 0 || ['Véhicules', 'Litiges'].includes(c.label));

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm px-4 py-3 mb-6 flex items-center gap-4 flex-wrap">
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
          <AlertOctagon size={16} className="text-white" />
        </span>
        <span className="text-[13px] font-black text-red-600">{urgentCount} dossier{urgentCount > 1 ? 's' : ''} urgent{urgentCount > 1 ? 's' : ''}</span>
      </span>
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {chips.map(c => (
          <button key={c.label} onClick={() => navigate(c.to)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-600 transition-colors">
            <c.icon size={13} />
            {c.label}
            <span className="bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">{c.n}</span>
            <ChevronRight size={11} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
