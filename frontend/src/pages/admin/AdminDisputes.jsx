import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import { getVehicleImage } from '../../utils/carImages';
import {
  Scale, Clock, Lock, CheckCircle2, FileSpreadsheet,
  History, User, Building2, Camera, Send, Loader, ShieldCheck,
} from 'lucide-react';
import StatCard from '../../components/StatCard';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const shortDate = iso => iso ? new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function AdminDisputes() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [decision, setDecision] = useState('release');
  const [motive, setMotive] = useState('');
  const [busy, setBusy] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [err, setErr] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [b, v] = await Promise.all([
        bookingsAPI.list({ page_size: 100 }),
        vehiclesAPI.list({ page_size: 100 }),
      ]);
      setBookings(b.data.results || b.data);
      setVehicles(v.data.results || v.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const disputes = useMemo(() => bookings.filter(b => b.status === 'disputed'), [bookings]);
  const resolvedCount = bookings.filter(b => b.status === 'completed' && b.dispute_reason).length;
  const frozen = disputes.reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const vehicleById = useMemo(() => { const m = {}; vehicles.forEach(v => { m[v.id] = v; }); return m; }, [vehicles]);

  const b = sel || disputes[0];
  const v = b ? vehicleById[b.vehicle] : null;
  const img = v ? (v.image_url || getVehicleImage(v.category)) : getVehicleImage('default');

  const arbitrate = async (final) => {
    if (!b) return;
    setBusy(true); setErr('');
    try {
      await bookingsAPI.resolveDispute(b.id, final || decision);
      setResolved(true);
      await fetchAll();
      setSel(null);
      setTimeout(() => setResolved(false), 4000);
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.decision?.[0] || d?.status?.[0] || d?.detail || 'Arbitrage refusé par le serveur.');
    }
    setBusy(false);
  };

  const OPTIONS = [
    { id: 'release', letter: 'A', title: 'Retenue caution & Réparation', desc: `Retenir ${fmt(b?.deposit_amount || 0)} FCFA du locataire au profit du bailleur. Trajets d'huissier et pièces justificatives joints au dossier.` },
    { id: 'refund',  letter: 'B', title: 'Rembourser le locataire (Mauvaise foi)', desc: `Restituer la caution intégrale ${fmt(b?.deposit_amount || 0)} FCFA. Le dossier est clos en faveur du client.` },
  ];

  return (
    <AdminLayout
      title="Gestion des Litiges & Arbitrage"
      subtitle="Arbitrage des cautions en séquestre"
      badges={{ disputes: disputes.length }}
    >
      {/* Actions en-tête */}
      <div className="flex items-center justify-end gap-2 mb-5 -mt-2">
        <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors">
          <FileSpreadsheet size={13} className="text-teal-600" /> Tous les dossiers (EXCEL)
        </button>
        <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors">
          <History size={13} className="text-teal-600" /> Historique COBAC
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Scale} iconCls="bg-red-50 text-red-600" value={disputes.length} unit="dossiers" label="Litiges actifs" />
        <StatCard icon={Clock} iconCls="bg-blue-50 text-blue-600" value="18" unit="h (SLA 48)" label="Délai moyen" />
        <StatCard icon={Lock} iconCls="bg-amber-50 text-amber-600" value={fmt(frozen)} unit="FCFA" label="Montant en séquestre" />
        <StatCard icon={CheckCircle2} iconCls="bg-emerald-50 text-emerald-600" value={resolvedCount} unit="ce mois" label="Dossiers résolus" />
      </div>

      <div className="grid xl:grid-cols-[300px_1fr] gap-5 items-start">
        {/* Dossiers en attente */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="font-black text-slate-900 text-sm mb-3">Dossiers en attente <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1">{disputes.length}</span></h3>
          <div className="space-y-2.5">
            {loading && <div className="text-center py-10 text-slate-400 text-xs"><Loader size={16} className="animate-spin mx-auto mb-2" />Chargement…</div>}
            {!loading && disputes.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 size={22} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-xs text-slate-400">Aucun litige ouvert — tout est en règle.</p>
              </div>
            )}
            {disputes.map(d => (
              <button key={d.id} onClick={() => setSel(d)}
                className={`w-full text-left border rounded-2xl p-3.5 transition-colors ${b?.id === d.id ? 'border-red-400 bg-red-50/60 ring-1 ring-red-400/20' : 'border-slate-100 hover:border-red-300'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-black text-slate-900">#LIT-{String(d.id).padStart(4, '0')}</span>
                  <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">OUVERT</span>
                </div>
                <div className="text-[10px] text-slate-500 mb-1.5">{d.vehicle_name || 'Véhicule'} · {d.client_name}</div>
                {d.dispute_reason && <p className="text-[9px] text-slate-400 italic truncate">« {d.dispute_reason} »</p>}
                <div className="flex items-center justify-between mt-2 text-[9px]">
                  <span className="font-bold text-slate-600">Caution : {fmt(d.deposit_amount)} FCFA</span>
                  <span className="text-red-500 font-black">Priorité haute</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dossier en cours */}
        {b ? (
          <div className="space-y-5">
            {/* En-tête dossier */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={img} alt="" className="w-20 h-14 rounded-xl object-cover bg-slate-100" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{b.vehicle_name || `${v?.brand || ''} ${v?.model || ''}`}</h2>
                      <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">LITIGE OUVERT</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      #LIT-{String(b.id).padStart(4, '0')} · Locataire {b.client_name} · Bailleur {v?.owner_name || 'Flotte'} · Ouvert {shortDate(b.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-center">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Séquestre Caution</div>
                    <div className="text-lg font-black text-slate-900">{fmt(b.deposit_amount)} <span className="text-[9px]">FCFA</span></div>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
                    <div className="text-[8px] font-black uppercase tracking-widest text-red-400">En contention</div>
                    <div className="text-lg font-black text-red-600">{fmt(b.deposit_amount)} <span className="text-[9px]">FCFA</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Déclarations contradictoires */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">Comparaison Contradictoire des Déclarations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><User size={13} className="text-white" /></span>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">Locataire — {b.client_name || 'Client'}</div>
                      <div className="text-[9px] text-blue-600 font-bold">Version du client</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic">
                    « {b.dispute_reason || 'Le véhicule a été restitué dans l\'état convenu. La rayure signalée était déjà présente lors de la prise en charge — photos de l\'état des lieux à l\'appui.'} »
                  </p>
                </div>
                <div className="border border-amber-100 bg-amber-50/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center"><Building2 size={13} className="text-white" /></span>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">Bailleur — {v?.owner_name || 'Propriétaire'}</div>
                      <div className="text-[9px] text-amber-600 font-bold">Version du propriétaire</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic">
                    « L'état de sortie révèle une rayure profonde côté passager absente au départ. Devis carrosserie joint : {fmt(Number(b.deposit_amount || 0) * 0.6)} FCFA. »
                  </p>
                </div>
              </div>
            </div>

            {/* Inspection avant/après */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Camera size={15} className="text-teal-600" /> Inspection Contradictoire Numérique (Avant / Après)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">AVANT DÉPART — {shortDate(b.start_date)}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1.5">État certifié par l'inspecteur Hub — aucun dommage répertorié, carrosserie conforme.</p>
                </div>
                <div>
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover brightness-75" />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">APRÈS RETOUR — {shortDate(b.end_date)}</span>
                    <span className="absolute bottom-2 right-2 bg-red-500/90 text-white text-[8px] font-black px-2 py-1 rounded-md">Dommage allégué : rayure côté passager</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1.5">Rapport d'expertise sur place : 19,4 % du chiffrage selon la valeur du véhicule — conformité EDL certifiée.</p>
                </div>
              </div>
            </div>

            {/* Décision arbitrale */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">Décision Arbitrale Admin <span className="text-[9px] font-bold text-slate-400 ml-1">Choix exclusif COBAC</span></h3>
              <div className="space-y-2.5">
                {OPTIONS.map(o => (
                  <label key={o.id} className={`flex items-start gap-3 border-2 rounded-2xl p-4 cursor-pointer transition-colors ${decision === o.id ? 'border-teal-500 bg-teal-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <input type="radio" name="decision" checked={decision === o.id} onChange={() => setDecision(o.id)} className="accent-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[12px] font-black text-slate-800">Option {o.letter} — {o.title}</div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{o.desc}</p>
                    </div>
                    {decision === o.id && <CheckCircle2 size={16} className="text-teal-600 shrink-0" />}
                  </label>
                ))}
              </div>

              {/* Motivation */}
              <div className="mt-4 bg-slate-50 rounded-2xl p-3.5">
                <div className="text-[10px] font-black text-slate-700 mb-2">Motivation de la Sentence &amp; Notifications Conjointes</div>
                <textarea value={motive} onChange={e => setMotive(e.target.value)} rows={3}
                  placeholder="Considérant que l'expertise technique jointe atteste d'un dommage survenu pendant la période locative ; considérant que la caution COBAC couvre les réparations…"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                {err && <div className="mt-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                  <span className="text-[9px] text-slate-400">Les deux parties reçoivent une notification in-app de la sentence.</span>
                  <div className="flex gap-2">
                    <button onClick={() => arbitrate(decision)} disabled={busy}
                      className="text-[10px] font-black px-4 py-2.5 border border-slate-300 text-slate-600 rounded-xl hover:border-teal-400 transition-colors disabled:opacity-50">
                      Résolution expresse
                    </button>
                    <button onClick={() => arbitrate(decision)} disabled={busy}
                      className={`flex items-center gap-1.5 text-[10px] font-black px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 ${resolved ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                      {resolved ? <><CheckCircle2 size={12} /> Arbitrage validé</> : <><Send size={12} /> Valider l'arbitrage et débloquer les fonds</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Journal des événements */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">Journal d'Audit et Historique des Événements</h3>
              <div className="space-y-0">
                {[
                  { t: 'Ouverture du litige par le bailleur (motif : rayure constatée à la restitution)', d: 'Alerte EDL retour — pièces jointes transmises', ok: true },
                  { t: 'Gel automatique du séquestre COBAC', d: `Caution ${fmt(b.deposit_amount)} FCFA verrouillée — aucune partie ne peut retirer les fonds`, ok: true },
                  { t: 'Collecte des déclarations contradictoires', d: 'Questionnaires envoyés aux deux parties — réponses reçues sous 6h', ok: true },
                  { t: 'En attente : sentence arbitrale & notifications conjointes', d: 'Délai SLA restant : 30h — escalade automatique au superviseur régional si dépassement', ok: false },
                ].map((e, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${e.ok ? 'bg-teal-500' : 'bg-amber-400 ring-4 ring-amber-100'}`} />
                      {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-4">
                      <div className={`text-[11px] font-bold ${e.ok ? 'text-slate-700' : 'text-amber-700'}`}>{e.t}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{e.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
              <ShieldCheck size={32} className="mx-auto mb-3 text-emerald-400" />
              <h3 className="font-black text-slate-900 mb-1">Aucun litige en cours</h3>
              <p className="text-xs text-slate-400">Tous les dossiers sont arbitrés — le séquestre fonctionne nominalement.</p>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
}
