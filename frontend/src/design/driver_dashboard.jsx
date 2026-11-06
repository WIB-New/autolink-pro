import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

const MONTH_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

const STATUS_META = {
  pending: { label: 'À valider', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  confirmed: { label: 'À venir', cls: 'bg-secondary-container text-on-secondary-container' },
  active: { label: 'En cours', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  accepted: { label: 'Acceptée', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  completed: { label: 'Terminée', cls: 'bg-surface-container-high text-on-surface-variant' },
  cancelled: { label: 'Annulée', cls: 'bg-error-container text-on-error-container' },
  refused: { label: 'Refusée', cls: 'bg-error-container text-on-error-container' },
  disputed: { label: 'En litige', cls: 'bg-error-container text-on-error-container' },
};

function statusOf(b) {
  if (b.driver_response === 'offered' && b.status === 'confirmed') return 'pending';
  if (b.driver_response === 'refused') return 'refused';
  if (b.status === 'cancelled') return 'cancelled';
  if (b.status === 'active') return 'active';
  if (b.driver_response === 'accepted' || b.status === 'confirmed' || b.status === 'pending') return 'accepted';
  return b.status;
}

/* ————— Courbe animée : gains mensuels (SVG + tooltips au survol) ————— */
function EarningsChart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 640; const H = 190; const PAD = 8;
  const vals = data.map((d) => Number(d.earnings || 0));
  const max = Math.max(...vals, 1);
  const step = (W - PAD * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => [PAD + i * step, H - PAD - (Number(d.earnings || 0) / max) * (H - PAD * 2 - 20)]);
  const line = pts.map((p) => p.map((v) => Math.round(v)).join(',')).join(' ');
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const len = Math.max(...pts.map((p, i) => (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0)));
  const total = data.reduce((s, d) => s + Number(d.earnings || 0), 0);
  const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

  return (
    <div className="flex flex-col">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48" preserveAspectRatio="none">
          <defs>
            <linearGradient id="drvGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </linearGradient>
            <style>{`
              @keyframes drvDraw { to { stroke-dashoffset: 0 } }
              @keyframes drvFade { from { opacity: 0 } to { opacity: 1 } }
              .drv-line { stroke-dasharray: ${Math.round(len * 1.4) + 300}; stroke-dashoffset: ${Math.round(len * 1.4) + 300}; animation: drvDraw 1.6s ease-out forwards }
              .drv-area { opacity: 0; animation: drvFade .9s ease-out .9s forwards }
              .drv-dot { opacity: 0; animation: drvFade .4s ease-out forwards }
            `}</style>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={PAD} x2={W - PAD} y1={H - PAD - f * (H - 40)} y2={H - PAD - f * (H - 40)} stroke="var(--outline-variant)" strokeOpacity="0.25" strokeDasharray="3 6" />)}
          <polygon points={area} fill="url(#drvGrad)" stroke="none" className="drv-area" />
          <polyline points={line} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drv-line" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r="14" fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
              <circle cx={p[0]} cy={p[1]} r={hover === i ? 6 : 3.5} fill="#0d9488" stroke="#fff" strokeWidth="2"
                className="drv-dot pointer-events-none transition-all" style={{ animationDelay: `${0.9 + i * 0.05}s` }} />
            </g>
          ))}
        </svg>
        {hover !== null && (
          <div className="absolute -translate-x-1/2 -translate-y-full bg-on-surface text-surface rounded-lg px-3 py-1.5 font-label-sm text-label-sm font-semibold shadow-lg pointer-events-none whitespace-nowrap z-10"
            style={{ left: `${(pts[hover][0] / W) * 100}%`, top: `${(pts[hover][1] / H) * 100 - 4}%` }}>
            {fmt(data[hover].earnings)} · {data[hover].trips} course(s)
          </div>
        )}
      </div>
      <div className="flex justify-between px-1 font-label-sm text-[11px] text-on-surface-variant">
        {data.filter((_, i) => i % 2 === 0).map((d) => {
          const [y, m] = d.month.split('-');
          return <span key={d.month}>{MONTH_FR[Number(m) - 1]} {y.slice(2)}</span>;
        })}
      </div>
      <div className="pt-space-sm border-t border-outline-variant/30 flex items-center justify-between mt-2">
        <span className="font-label-md text-label-md font-semibold text-on-surface-variant">Total sur 12 mois</span>
        <span className="font-headline-sm text-headline-sm font-bold text-primary">{fmt(total)}</span>
      </div>
    </div>
  );
}

/* ————— Donut animé : répartition des statuts de course ————— */
function StatusDonut({ courses }) {
  const counts = {};
  courses.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
  const order = [['accepted', '#0d9488', 'Acceptées'], ['pending', '#f59e0b', 'À valider'], ['refused', '#ef4444', 'Refusées'], ['completed', '#64748b', 'Terminées']];
  const segs = order.map(([k, color, label]) => ({ k, color, label, n: counts[k] || 0 })).filter((s) => s.n);
  const total = segs.reduce((s, x) => s + x.n, 0) || 1;
  let acc = 0;
  const grad = segs.map((s) => { const start = acc / total * 100; acc += s.n; return `${s.color} ${start}% ${(acc / total) * 100}%`; }).join(', ');
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32 rounded-full transition-transform duration-500 hover:scale-105" style={{ background: `conic-gradient(${grad || 'var(--surface-container-high) 0 100%'})` }}>
        <div className="absolute inset-3 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center">
          <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none">{courses.length}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">courses</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        {segs.map((s) => (
          <div key={s.k} className="flex items-center justify-between font-body-sm text-body-sm">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />{s.label}</span>
            <span className="font-label-md text-label-md font-bold text-on-surface">{Math.round(s.n / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DriverDesignDashboard() {
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [user] = useState(() => { try { return JSON.parse(localStorage.getItem('autolink_user') || '{}'); } catch { return {}; } });
  const navigate = useNavigate();

  React.useEffect(() => {
    import('../services/api').then(({ driversAPI, bookingsAPI }) => {
      driversAPI.earnings().then(({ data }) => setEarnings(data)).catch(() => {});
      bookingsAPI.list({ page_size: 50 }).then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setCourses(list.map((b) => ({
          id: `BK-${String(b.id).padStart(4, '0')}`,
          client: b.client_name || 'Client', tel: b.client_phone || '—',
          car: b.vehicle_name || 'Véhicule', from: b.pickup_address || '—', to: b.dropoff_address || '—',
          dates: `${new Date(b.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → ${new Date(b.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
          start: new Date(b.start_date).getTime(),
          price: Number(b.subtotal || 0),
          status: statusOf(b),
          driverResponse: b.driver_response,
          realId: b.id,
        })));
      }).catch(() => {});
    });
  }, []);

  const setStatus = (id, status) => {
    const course = courses.find((c) => c.id === id);
    const confirmMsg = { accepted: 'Accepter cette course ?', refused: 'Refuser cette course ?', pending: 'Annuler votre refus ?' }[status];
    if (!course || !window.confirm(confirmMsg)) return;
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    if (course?.realId) import('../services/api').then(({ bookingsAPI }) => {
      const rollback = (err) => {
        setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, status: course.status } : c)));
        alert(err?.response?.data?.detail || 'Action impossible pour cette course.');
      };
      if (status === 'accepted') bookingsAPI.acceptDriverRide(course.realId).catch(rollback);
      else if (status === 'refused') bookingsAPI.refuseDriverRide(course.realId).catch(rollback);
      else if (status === 'pending') bookingsAPI.resetDriverRide(course.realId).catch(rollback);
    });
  };

  const toggleSort = (k) => { if (sortKey === k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(true); } };

  const filtered = courses
    .filter((c) => !q || `${c.client} ${c.car} ${c.id} ${c.from} ${c.to}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const v = sortKey === 'price' ? a.price - b.price : sortKey === 'client' ? a.client.localeCompare(b.client, 'fr') : sortKey === 'status' ? a.status.localeCompare(b.status, 'fr') : a.start - b.start;
      return sortAsc ? v : -v;
    });

  const sortIco = (k) => (sortKey !== k ? 'unfold_more' : sortAsc ? 'expand_less' : 'expand_more');
  const fmt = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

  return (
    <DesignShell role="driver">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col gap-space-lg">
        {/* Header — même style que le dashboard client */}
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Bonjour, {user.first_name || 'Chauffeur'}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Gérez les courses qui vous sont attribuées et suivez vos revenus.</p>
        </div>

        {/* KPIs — style cards client : icône colorée + valeur + bande accent */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[
            ['star', 'Note moyenne', `${earnings ? Number(earnings.rating).toFixed(1).replace('.', ',') : '—'} / 5`, `${earnings?.rating_count ?? 0} avis`, 'bg-amber-100 text-amber-600', 'bg-amber-500'],
            ['check_circle', 'Courses', String(earnings?.total_trips ?? 0), 'terminées', 'bg-teal-100 text-teal-700', 'bg-teal-600'],
            ['account_balance_wallet', 'Gains totaux', fmt(earnings?.total_earned || 0), 'cumulés', 'bg-emerald-100 text-emerald-700', 'bg-emerald-600'],
            ['directions_car', 'Courses actives', String(courses.filter((c) => c.status === 'accepted' || c.status === 'active').length), 'en attente ou en cours', 'bg-sky-100 text-sky-700', 'bg-sky-600'],
          ].map(([icon, label, val, sub, iconCls, bar]) => (
            <div key={label} className="relative flex flex-col items-start gap-space-sm px-space-md py-space-xl rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
              <span className={`w-11 h-11 rounded-xl ${iconCls} flex items-center justify-center shrink-0`}><Icon name={icon} size={22} /></span>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface leading-none truncate">{val}</span>
                <span className="font-label-md text-label-md text-on-surface-variant mt-1">{label}</span>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">{sub}</span>
              </div>
              <span className={`absolute top-0 bottom-0 right-0 w-1.5 ${bar}`} />
            </div>
          ))}
        </div>

        {/* Graphiques : courbe gains mensuels + donut statuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          <div className="lg:col-span-8 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
            <div className="flex items-center justify-between pb-space-md">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Gains mensuels</span>
              <button onClick={() => navigate('/driver/revenue')} className="text-primary font-label-md text-label-md font-semibold hover:underline flex items-center gap-1">Voir détail<Icon name="arrow_forward" size={16} /></button>
            </div>
            <EarningsChart data={earnings?.monthly_earnings?.length ? earnings.monthly_earnings : []} />
          </div>
          <div className="lg:col-span-4 flex flex-col p-space-lg rounded-xl bg-surface-container-lowest text-on-surface shadow-sm">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface pb-space-md">Statuts de mes courses</span>
            <StatusDonut courses={courses} />
          </div>
        </div>

        {/* Courses — tableau façon espace client : recherche + tri + actions */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Mes courses <span className="text-on-surface-variant font-normal">({filtered.length})</span></h2>
            <div className="relative w-full md:w-72">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une course, un client…" className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                  {[
                    ['client', 'Client / Véhicule'],
                    ['date', 'Dates & Trajet'],
                    ['price', 'Montant'],
                    ['status', 'Statut'],
                    [null, 'Actions'],
                  ].map(([k, lbl]) => (
                    <th key={lbl} className="px-3 py-2 border-b border-outline-variant/40">
                      {k ? (
                        <button onClick={() => toggleSort(k)} className="flex items-center gap-1 uppercase font-semibold hover:text-on-surface transition-colors">{lbl}<Icon name={sortIco(k)} size={14} /></button>
                      ) : lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`hover:bg-surface-container-low transition-colors ${c.status === 'refused' ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0"><Icon name="person" size={18} /></div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md font-bold text-on-surface truncate">{c.client}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.car} · {c.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md text-on-surface">{c.dates}</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[220px]">{c.from} → {c.to}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-b border-outline-variant/20 font-label-md text-label-md font-bold text-primary whitespace-nowrap">{fmt(c.price)}</td>
                    <td className="px-3 py-3 border-b border-outline-variant/20">
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${STATUS_META[c.status]?.cls || 'bg-surface-container-high text-on-surface-variant'}`}>{STATUS_META[c.status]?.label || c.status}</span>
                    </td>
                    <td className="px-3 py-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/driver/courses/${c.realId}`)} title="Voir en détail" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center transition-colors"><Icon name="visibility" size={17} /></button>
                        {c.status === 'pending' && (
                          <>
                            <button onClick={() => setStatus(c.id, 'accepted')} title="Accepter la course" className="w-8 h-8 rounded-lg bg-primary-fixed hover:bg-primary hover:text-on-primary text-primary inline-flex items-center justify-center transition-colors"><Icon name="check_circle" size={17} /></button>
                            <button onClick={() => setStatus(c.id, 'refused')} title="Refuser la course" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant inline-flex items-center justify-center transition-colors"><Icon name="cancel" size={17} /></button>
                          </>
                        )}
                        {(c.status === 'accepted' || c.status === 'active') && (
                          <>
                            <button onClick={() => navigate('/driver/messages')} title="Envoyer un message au client" className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container inline-flex items-center justify-center transition-colors"><Icon name="chat" size={16} /></button>
                            {c.status === 'accepted' && <button onClick={() => setStatus(c.id, 'refused')} title="Se désister de la course" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant inline-flex items-center justify-center transition-colors"><Icon name="event_busy" size={17} /></button>}
                          </>
                        )}
                        {c.status === 'refused' && c.driverResponse === 'refused' && (
                          <button onClick={() => setStatus(c.id, 'pending')} title="Annuler le refus" className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center transition-colors"><Icon name="settings_backup_restore" size={17} /></button>
                        )}
                        {(c.status === 'completed' || c.status === 'confirmed') && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan="5" className="px-3 py-10 text-center font-body-md text-body-md text-on-surface-variant">Aucune course trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {detail && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Course {detail.id}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${STATUS_META[detail.status]?.cls || 'bg-surface-container-high text-on-surface-variant'}`}>{STATUS_META[detail.status]?.label || detail.status}</span>
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg hover:bg-surface-container inline-flex items-center justify-center text-on-surface-variant"><Icon name="close" size={18} /></button>
            </div>
            <dl className="space-y-3 font-body-md text-body-md">
              {[
                ['person', 'Client', `${detail.client} — ${detail.tel}`],
                ['directions_car', 'Véhicule', detail.car],
                ['event', 'Dates', detail.dates],
                ['route', 'Trajet', `${detail.from} → ${detail.to}`],
                ['payments', 'Montant', fmt(detail.price)],
              ].map(([icon, label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon name={icon} size={18} className="text-secondary mt-0.5 shrink-0" />
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt><dd className="text-on-surface">{value}</dd></div>
                </div>
              ))}
            </dl>
            <button onClick={() => navigate('/driver/messages')} className="mt-6 w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2"><Icon name="chat" size={17} />Contacter le client</button>
          </div>
        </div>
      )}
    </DesignShell>
  );
}
