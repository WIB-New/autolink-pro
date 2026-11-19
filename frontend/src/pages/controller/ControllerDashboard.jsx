import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, LogIn, LogOut, TrendingUp, PieChart as PieIcon, CalendarDays, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inspectionsAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const LANG = () => (localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR');
const dayKey = (d) => d.toISOString().slice(0, 10);
const dayLabel = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(LANG(), { weekday: 'short', day: 'numeric' });
const TT_STYLE = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700 };
const AXIS_TICK = { fontSize: 10, fill: '#94a3b8' };

export default function ControllerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ entry_pending: 0, exit_pending: 0, completed_week: 0, issues_week: 0, average_score_week: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, entry, exit, list] = await Promise.all([
          inspectionsAPI.dashboard(),
          inspectionsAPI.queue({ type: 'entry' }),
          inspectionsAPI.queue({ type: 'exit' }),
          inspectionsAPI.list({ ordering: '-inspection_date', page_size: 300 }),
        ]);
        setStats(dash.data);
        const rows = r => r.data.results ?? r.data;
        setTasks([...rows(entry), ...rows(exit)]);
        setHistory(rows(list));
      } catch (e) {
        console.error('Dashboard contrôleur:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pendingCount = (stats.entry_pending || 0) + (stats.exit_pending || 0);

  /* Activité des 14 derniers jours : fiches remplies + problèmes signalés. */
  const activity = useMemo(() => {
    const map = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      map[dayKey(d)] = { d: dayLabel(dayKey(d)), entries: 0, exits: 0, issues: 0 };
    }
    history.forEach(i => {
      const k = dayKey(new Date(i.inspection_date));
      if (!map[k]) return;
      if (i.inspection_type === 'entry') map[k].entries += 1; else map[k].exits += 1;
      if ((i.issues || []).length) map[k].issues += 1;
    });
    return Object.values(map);
  }, [history]);

  /* Score moyen d'état par jour (fiches récentes). */
  const scoreTrend = useMemo(() => {
    const sums = {};
    history.forEach(i => {
      const k = dayKey(new Date(i.inspection_date));
      if (!sums[k]) sums[k] = { d: dayLabel(k), total: 0, n: 0 };
      sums[k].total += Number(i.condition_score || 0);
      sums[k].n += 1;
    });
    return Object.keys(sums).sort().slice(-14)
      .map(k => ({ d: sums[k].d, score: Math.round(sums[k].total / sums[k].n) }));
  }, [history]);

  /* Répartition de la file d'attente. */
  const queueSplit = [
    { name: 'Entrées à faire', value: stats.entry_pending || 0, color: '#10b981' },
    { name: 'Sorties à faire', value: stats.exit_pending || 0, color: '#ef4444' },
  ];

  /* Charge à venir : inspections en attente regroupées par date de début de location. */
  const upcoming = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const k = t.start_date;
      if (!map[k]) map[k] = { d: dayLabel(k), entries: 0, exits: 0 };
      if (t.inspection_type === 'entry') map[k].entries += 1; else map[k].exits += 1;
    });
    return Object.keys(map).sort().map(k => map[k]);
  }, [tasks]);

  return (
    <DashboardLayout title="Tableau de bord Contrôleur">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Bonjour, {user?.firstName || user?.first_name}</h2>
          <p className="text-primary-200 mb-5">Vous avez <strong className="text-white">{pendingCount} inspection{pendingCount > 1 ? 's' : ''}</strong> à effectuer.</p>
          <button onClick={() => navigate('/controller/inspections')} className="flex items-center gap-2 bg-white text-primary-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-primary-50 transition-all shadow-md">
            <ClipboardList size={18} /> Voir la file d'inspections
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
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={18} /></div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {loading && <p className="text-sm text-slate-400 text-center py-6">Chargement…</p>}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Activité 14 jours */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Activity size={15} className="text-primary-600" /> Fiches remplies — 14 derniers jours
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Entrées</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Sorties</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" /> Avec problème</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={activity} margin={{ top: 0, right: 0, left: -26, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="d" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TT_STYLE} />
                  <Bar dataKey="entries" name="Entrées" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="exits" name="Sorties" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="issues" name="Avec problème" fill="#fbbf24" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tendance du score */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp size={15} className="text-teal-600" /> État moyen constaté (/100)
                </h3>
              </div>
              {scoreTrend.length ? (
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={scoreTrend} margin={{ top: 0, right: 0, left: -26, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="d" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v}/100`, 'État moyen']} />
                    <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2.5} fill="url(#scoreFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-slate-400 text-center py-16">Aucune fiche enregistrée récemment.</p>}
            </div>

            {/* File d'attente */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <PieIcon size={15} className="text-amber-500" /> File d'attente actuelle
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Entrées</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Sorties</span>
                </div>
              </div>
              {pendingCount ? (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={queueSplit} dataKey="value" innerRadius={58} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                        {queueSplit.map(s => <Cell key={s.name} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TT_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">à faire</span>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400 text-center py-16">File vide — tout est inspecté.</p>}
            </div>

            {/* Charge à venir */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CalendarDays size={15} className="text-primary-600" /> Charge à venir — inspections en attente par date
                </h3>
                <button onClick={() => navigate('/controller/inspections')} className="text-[11px] font-bold text-primary-600 hover:text-primary-700">
                  Ouvrir la file complète →
                </button>
              </div>
              {upcoming.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={upcoming} margin={{ top: 0, right: 0, left: -26, bottom: 0 }} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="d" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TT_STYLE} />
                    <Bar dataKey="entries" name="Entrées" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="exits" name="Sorties" stackId="a" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-slate-400 text-center py-12">Aucune inspection en attente — toutes les locations couvertes sont inspectées.</p>}
            </div>
          </div>
        )}

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
