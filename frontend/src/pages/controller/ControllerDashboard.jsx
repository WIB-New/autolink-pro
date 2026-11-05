import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Car, ArrowRight, LogIn, LogOut, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TODAY_TASKS = [
  { id: 'INS001', type: 'entry', vehicle: 'Toyota Corolla 2022', plate: 'LT-4523-A', client: 'Marie Ngo Bell', time: '08:00', location: 'Agence AutoLink — Akwa, Douala', priority: 'high' },
  { id: 'INS003', type: 'entry', vehicle: 'BMW Série 5 2022', plate: 'CE-8810-K', client: 'Awa Mbarga', time: '10:30', location: 'Agence AutoLink — Akwa, Douala', priority: 'high' },
  { id: 'INS002', type: 'exit', vehicle: 'Hyundai Tucson 2023', plate: 'LT-2210-G', client: 'Yves Kamga', time: '14:00', location: 'Résidence client — Bonanjo, Douala', priority: 'normal' },
];

const WEEKLY_STATS = { done: 18, pending: 3, issues: 2, avgScore: 89 };

export default function ControllerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Tableau de bord Contrôleur">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Bonjour, {user?.firstName}</h2>
          <p className="text-primary-200 mb-5">Vous avez <strong className="text-white">{TODAY_TASKS.length} inspections</strong> à effectuer aujourd'hui.</p>
          <button onClick={() => navigate('/admin/inspections')} className="flex items-center gap-2 bg-white text-primary-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-primary-50 transition-all shadow-md">
            <ClipboardList size={18} /> Voir toutes les inspections
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Faites cette semaine', value: WEEKLY_STATS.done, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'En attente', value: WEEKLY_STATS.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Problèmes signalés', value: WEEKLY_STATS.issues, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
            { label: 'Score moyen', value: `${WEEKLY_STATS.avgScore}/100`, icon: ClipboardList, color: 'text-primary-600 bg-primary-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Today's tasks */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-5">Programme du jour — {new Date().toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          <div className="space-y-4">
            {TODAY_TASKS.sort((a, b) => a.time.localeCompare(b.time)).map(task => (
              <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${task.priority === 'high' ? 'border-primary-200 bg-primary-50' : 'border-slate-100 bg-white'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.type === 'entry' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {task.type === 'entry' ? <LogIn size={22} /> : <LogOut size={22} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${task.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {task.type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                    </span>
                    <span className="font-semibold text-slate-900">{task.vehicle}</span>
                    {task.priority === 'high' && <span className="badge-warning">Priorité haute</span>}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {task.time}</span>
                    <span className="inline-flex items-center gap-1"><User size={12} /> {task.client}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {task.location}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Car size={12} /> {task.plate}</div>
                </div>
                <button onClick={() => navigate('/admin/inspections')} className="btn-primary py-2 px-4 text-sm flex items-center gap-1 shrink-0">
                  Inspecter <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick guide */}
        <div className="card bg-slate-50">
          <h3 className="font-bold text-slate-900 mb-4">Guide d'inspection rapide</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { Icon: LogIn, iconCls: 'text-emerald-600', label: 'Fiche d\'entrée', points: ["Remplir AVANT remise des clés", "Photo de chaque côté du véhicule", "Niveau carburant et kilométrage", "Vérifier assurance et documents"] },
              { Icon: LogOut, iconCls: 'text-red-600', label: 'Fiche de sortie', points: ["Remplir APRÈS retour du véhicule", "Comparer avec la fiche d'entrée", "Documenter tout dommage nouveau", "Confirmer le niveau de carburant"] },
            ].map(({ Icon, iconCls, label, points }) => (
              <div key={label} className="bg-white rounded-xl p-4 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Icon size={16} className={iconCls} /> {label}</h4>
                <ul className="space-y-1.5">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle size={13} className="text-primary-500 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
