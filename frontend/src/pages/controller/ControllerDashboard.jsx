import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, Car, ArrowRight, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI } from '../../services/api';
import { formatDate } from '../../i18n';

export default function ControllerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ entry_pending: 0, exit_pending: 0, completed_week: 0, issues_week: 0, average_score_week: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, entry, exit] = await Promise.all([
          inspectionsAPI.dashboard(),
          inspectionsAPI.queue({ type: 'entry' }),
          inspectionsAPI.queue({ type: 'exit' }),
        ]);
        setStats(dash.data);
        const rows = r => r.data.results ?? r.data;
        const today = new Date().toISOString().slice(0, 10);
        setTasks(
          [...rows(entry), ...rows(exit)]
            .map(t => ({ ...t, priority: (t.start_date || '') <= today ? 'high' : 'normal' }))
            .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))
        );
      } catch (e) {
        console.error('Dashboard contrôleur:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingCount = (stats.entry_pending || 0) + (stats.exit_pending || 0);

  return (
    <DashboardLayout title="Tableau de bord Contrôleur">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Bonjour, {user?.firstName || user?.first_name}</h2>
          <p className="text-primary-200 mb-5">Vous avez <strong className="text-white">{pendingCount} inspection{pendingCount > 1 ? 's' : ''}</strong> à effectuer.</p>
          <button onClick={() => navigate('/admin/inspections')} className="flex items-center gap-2 bg-white text-primary-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-primary-50 transition-all shadow-md">
            <ClipboardList size={18} /> Voir toutes les inspections
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Faites cette semaine', value: stats.completed_week, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'En attente', value: pendingCount, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Problèmes signalés (7 j)', value: stats.issues_week, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
            { label: 'Score moyen', value: `${Math.round(stats.average_score_week || 0)}/100`, icon: ClipboardList, color: 'text-primary-600 bg-primary-50' },
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
          <h3 className="font-bold text-slate-900 mb-5">Inspections à effectuer — {new Date().toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {loading && <p className="text-sm text-slate-400 text-center py-6">Chargement…</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Aucune inspection en attente — toutes les locations couvertes sont inspectées.</p>
          )}
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={`${task.inspection_type}-${task.id}`} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${task.priority === 'high' ? 'border-primary-200 bg-primary-50' : 'border-slate-100 bg-white'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {task.inspection_type === 'entry' ? <LogIn size={22} /> : <LogOut size={22} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${task.inspection_type === 'entry' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {task.inspection_type === 'entry' ? 'ENTRÉE' : 'SORTIE'}
                    </span>
                    <span className="font-semibold text-slate-900">{task.vehicle}</span>
                    {task.priority === 'high' && <span className="badge-warning">Priorité haute</span>}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {formatDate(task.start_date)} → {formatDate(task.end_date)}</span>
                    <span className="inline-flex items-center gap-1"><User size={12} /> {task.client}</span>
                    <span>{task.booking_reference}</span>
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
