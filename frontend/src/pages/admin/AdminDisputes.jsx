import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { bookingsAPI } from '../../services/api';
import { mediaUrl } from '../../utils/media';
import { useConfirm } from '../../contexts/ConfirmContext';
import {
  Scale, Clock, Lock, CheckCircle2, FileSpreadsheet,
  User, Building2, Camera, Send, Loader, ShieldCheck, Gavel,
} from 'lucide-react';
import StatCard from '../../components/StatCard';

/* Libellés des trois issues d'arbitrage possibles. */
const DECISION = {
  release: { label: 'en faveur du propriétaire', tag: '→ PROPRIÉTAIRE', cls: 'bg-amber-100 text-amber-700',
    sentence: 'caution et part location versées au propriétaire' },
  refund_deposit: { label: 'caution restituée au client', tag: '→ CLIENT (caution)', cls: 'bg-teal-100 text-teal-700',
    sentence: 'caution restituée au client — location due au propriétaire' },
  refund: { label: 'remboursement total du client', tag: '→ CLIENT (total)', cls: 'bg-emerald-100 text-emerald-700',
    sentence: 'location et caution intégralement remboursées au client' },
};
const decisionOf = (b) => DECISION[b?.dispute_decision] || null;

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const shortDate = iso => iso ? new Date(iso).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const longDate = iso => iso ? new Date(iso).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

/* Délai moyen de résolution des litiges déjà arbitrés. */
const avgDelay = (rows) => {
  const hours = rows
    .filter(b => b.dispute_resolved_at && b.dispute_opened_at)
    .map(b => (new Date(b.dispute_resolved_at) - new Date(b.dispute_opened_at)) / 36e5)
    .filter(h => h >= 0);
  if (!hours.length) return null;
  const avg = hours.reduce((s, h) => s + h, 0) / hours.length;
  return avg >= 48 ? `${Math.round(avg / 24)} j` : `${Math.round(avg)} h`;
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [resolvedList, setResolvedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState('open'); // open | resolved
  const [decision, setDecision] = useState('release');
  const [motive, setMotive] = useState('');
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  const [resolved, setResolved] = useState(false);
  const [err, setErr] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [open, done] = await Promise.all([
        bookingsAPI.disputes({ state: 'open', page_size: 100 }),
        bookingsAPI.disputes({ state: 'resolved', page_size: 100 }),
      ]);
      setDisputes(open.data.results || open.data);
      setResolvedList(done.data.results || done.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const frozen = disputes.reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const resolvedThisMonth = resolvedList.filter(b => {
    const d = b.dispute_resolved_at && new Date(b.dispute_resolved_at);
    const now = new Date();
    return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const b = tab === 'open' ? (sel || disputes[0]) : (sel || resolvedList[0]);
  const entry = useMemo(() => (b?.inspections || []).find(i => i.inspection_type === 'entry'), [b]);
  const exit = useMemo(() => (b?.inspections || []).find(i => i.inspection_type === 'exit'), [b]);

  const arbitrate = async () => {
    if (!b) return;
    const opt = OPTIONS.find(o => o.id === decision);
    const ok = await confirm({
      title: `${opt?.title || 'Arbitrage'} — confirmer ?`,
      message: `Litige #LIT-${String(b.id).padStart(4, '0')} : ${opt?.desc || ''} Cette sentence est définitive et débloque les fonds.`,
      confirmLabel: 'Valider l\'arbitrage',
      danger: decision === 'release',
    });
    if (!ok) return;
    setBusy(true); setErr('');
    try {
      await bookingsAPI.resolveDispute(b.id, decision, motive.trim() || undefined);
      setResolved(true);
      await fetchAll();
      setSel(null); setMotive('');
      setTimeout(() => setResolved(false), 4000);
    } catch (e) {
      const d = e?.response?.data;
      setErr(d?.decision?.[0] || d?.status?.[0] || d?.detail || 'Arbitrage refusé par le serveur.');
    }
    setBusy(false);
  };

  const exportCsv = () => {
    const rows = [...disputes, ...resolvedList];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = ['Dossier;Véhicule;Client;Motif client;Réponse propriétaire;Caution;Ouvert le;Décision;Résolu le']
      .concat(rows.map(d => [
        `LIT-${String(d.id).padStart(4, '0')}`, d.vehicle_name, d.client_name,
        d.dispute_reason, d.dispute_owner_response, d.deposit_amount,
        shortDate(d.dispute_opened_at), decisionOf(d)?.label || '—',
        shortDate(d.dispute_resolved_at),
      ].map(esc).join(';')))
      .join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `litiges-autolink-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click(); URL.revokeObjectURL(link.href);
  };

  const OPTIONS = b ? [
    { id: 'release', letter: 'A', title: 'Tout au propriétaire', desc: `Retenir la caution ${fmt(b.deposit_amount)} FCFA au profit du bailleur — la part location lui est aussi versée.` },
    { id: 'refund_deposit', letter: 'B', title: 'Caution seule au client', desc: `Restituer la caution ${fmt(b.deposit_amount)} FCFA au client — la location reste due et sa part est versée au propriétaire.` },
    { id: 'refund', letter: 'C', title: 'Tout rembourser au client', desc: `Rembourser la location ${fmt(b.subtotal)} FCFA ET la caution ${fmt(b.deposit_amount)} FCFA — le propriétaire ne perçoit rien.` },
  ] : [];

  /* Journal d'audit : événements réels dérivés des horodatages persistés. */
  const audit = useMemo(() => {
    if (!b) return [];
    const ev = [];
    ev.push({ t: `Litige ouvert par le client — ${b.client_name || ''}`, d: longDate(b.dispute_opened_at) + (b.dispute_reason ? ` · « ${b.dispute_reason.slice(0, 80)}${b.dispute_reason.length > 80 ? '…' : ''} »` : ''), ok: true });
    if (b.escrow_status === 'disputed' || b.deposit_amount > 0)
      ev.push({ t: 'Gel du séquestre', d: `Caution ${fmt(b.deposit_amount)} FCFA verrouillée — aucune partie ne peut retirer les fonds`, ok: true });
    if (entry) ev.push({ t: 'Inspection d\'entrée enregistrée', d: `${entry.controller_name || 'Contrôleur'} · score ${entry.condition_score ?? '—'}/100`, ok: true });
    if (exit) ev.push({ t: 'Inspection de sortie enregistrée', d: `${exit.controller_name || 'Contrôleur'} · score ${exit.condition_score ?? '—'}/100`, ok: true });
    if (b.dispute_owner_response) ev.push({ t: 'Réponse du propriétaire reçue', d: longDate(b.dispute_owner_responded_at), ok: true });
    if (b.dispute_resolved_at) ev.push({ t: `Arbitrage rendu — ${decisionOf(b)?.label || 'décision enregistrée'}`, d: longDate(b.dispute_resolved_at) + (b.dispute_resolution_note ? ` · ${b.dispute_resolution_note}` : ''), ok: true });
    else ev.push({ t: b.dispute_owner_response ? 'En attente : sentence arbitrale' : 'En attente : réponse du propriétaire puis arbitrage', d: 'Les deux parties seront notifiées de la décision', ok: false });
    return ev;
  }, [b, entry, exit]);

  const list = tab === 'open' ? disputes : resolvedList;

  return (
    <AdminLayout
      title="Gestion des Litiges & Arbitrage"
      subtitle="Arbitrage des cautions en séquestre"
      badges={{ disputes: disputes.length }}
    >
      <div className="flex items-center justify-end gap-2 mb-5 -mt-2">
        <button onClick={() => setTab('open')}
          className={`text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors border ${tab === 'open' ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'}`}>
          En attente ({disputes.length})
        </button>
        <button onClick={() => setTab('resolved')}
          className={`text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors border ${tab === 'resolved' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
          Résolus ({resolvedList.length})
        </button>
        <button onClick={exportCsv} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors">
          <FileSpreadsheet size={13} className="text-teal-600" /> Exporter (CSV)
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Scale} iconCls="bg-red-50 text-red-600" value={disputes.length} unit="dossiers" label="Litiges actifs" />
        <StatCard icon={Clock} iconCls="bg-blue-50 text-blue-600" value={avgDelay(resolvedList) ?? '—'} unit={avgDelay(resolvedList) ? 'de délai moyen' : 'aucun résolu'} label="Délai moyen" />
        <StatCard icon={Lock} iconCls="bg-amber-50 text-amber-600" value={fmt(frozen)} unit="FCFA" label="Montant en séquestre" />
        <StatCard icon={CheckCircle2} iconCls="bg-emerald-50 text-emerald-600" value={resolvedThisMonth} unit="ce mois" label="Dossiers résolus" />
      </div>

      <div className="grid xl:grid-cols-[300px_1fr] gap-5 items-start">
        {/* Dossiers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="font-black text-slate-900 text-sm mb-3">{tab === 'open' ? 'Dossiers en attente' : 'Dossiers arbitrés'} <span className={`text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ml-1 ${tab === 'open' ? 'bg-red-500' : 'bg-emerald-500'}`}>{list.length}</span></h3>
          <div className="space-y-2.5">
            {loading && <div className="text-center py-10 text-slate-400 text-xs"><Loader size={16} className="animate-spin mx-auto mb-2" />Chargement…</div>}
            {!loading && list.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 size={22} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-xs text-slate-400">{tab === 'open' ? 'Aucun litige ouvert — tout est en règle.' : 'Aucun litige arbitré pour le moment.'}</p>
              </div>
            )}
            {list.map(d => (
              <button key={d.id} onClick={() => setSel(d)}
                className={`w-full text-left border rounded-2xl p-3.5 transition-colors ${b?.id === d.id ? 'border-red-400 bg-red-50/60 ring-1 ring-red-400/20' : 'border-slate-100 hover:border-red-300'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-black text-slate-900">#LIT-{String(d.id).padStart(4, '0')}</span>
                  {d.status === 'disputed'
                    ? <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">OUVERT</span>
                    : <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${decisionOf(d)?.cls || 'bg-slate-100 text-slate-600'}`}>{decisionOf(d)?.tag || 'RÉSOLU'}</span>}
                </div>
                <div className="text-[10px] text-slate-500 mb-1.5">{d.vehicle_name || 'Véhicule'} · {d.client_name}</div>
                {d.dispute_reason && <p className="text-[9px] text-slate-400 italic truncate">« {d.dispute_reason} »</p>}
                <div className="flex items-center justify-between mt-2 text-[9px]">
                  <span className="font-bold text-slate-600">Caution : {fmt(d.deposit_amount)} FCFA</span>
                  <span className="text-slate-400">{shortDate(d.dispute_opened_at)}</span>
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
                  {b.vehicle_image
                    ? <img src={mediaUrl(b.vehicle_image)} alt="" className="w-20 h-14 rounded-xl object-cover bg-slate-100" />
                    : <span className="w-20 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Camera size={20} /></span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{b.vehicle_name || 'Véhicule'}</h2>
                      {b.status === 'disputed'
                        ? <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">LITIGE OUVERT</span>
                        : <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">ARBITRÉ</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      #LIT-{String(b.id).padStart(4, '0')} · Locataire {b.client_name} · Bailleur {b.owner_name} · Ouvert {shortDate(b.dispute_opened_at)}
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

            {/* Déclarations contradictoires — données réelles */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">Comparaison Contradictoire des Déclarations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-blue-100 bg-blue-50/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><User size={13} className="text-white" /></span>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">Locataire — {b.client_name || 'Client'}</div>
                      <div className="text-[9px] text-blue-600 font-bold">Version du client · {longDate(b.dispute_opened_at)}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed italic">
                    « {b.dispute_reason || 'Aucun motif renseigné par le client.'} »
                  </p>
                </div>
                <div className="border border-amber-100 bg-amber-50/50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center"><Building2 size={13} className="text-white" /></span>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">Bailleur — {b.owner_name || 'Propriétaire'}</div>
                      <div className="text-[9px] text-amber-600 font-bold">Version du propriétaire{b.dispute_owner_responded_at ? ` · ${longDate(b.dispute_owner_responded_at)}` : ''}</div>
                    </div>
                  </div>
                  {b.dispute_owner_response
                    ? <p className="text-[10px] text-slate-600 leading-relaxed italic">« {b.dispute_owner_response} »</p>
                    : <p className="text-[10px] text-slate-400 leading-relaxed">En attente — le propriétaire n'a pas encore transmis sa version (il peut le faire depuis son espace, sur la réservation).</p>}
                </div>
              </div>
            </div>

            {/* Inspections réelles avant/après */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Camera size={15} className="text-teal-600" /> Inspections Numériques (Entrée / Sortie)
              </h3>
              {!entry && !exit ? (
                <p className="text-[11px] text-slate-400 bg-slate-50 rounded-xl px-4 py-5 text-center">
                  Aucune fiche d'inspection enregistrée sur cette location — les états des lieux d'entrée/sortie n'ont pas été réalisés par un contrôleur.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { insp: entry, label: 'ENTRÉE', badge: 'bg-emerald-500', date: b.start_date },
                    { insp: exit, label: 'SORTIE', badge: 'bg-red-500', date: b.end_date },
                  ].map(({ insp, label, badge, date }) => (
                    <div key={label}>
                      {insp ? (
                        <>
                          <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100">
                            {(insp.photos || []).length > 0 ? (
                              <div className="grid grid-cols-2 h-full">
                                {insp.photos.slice(0, 4).map(p => (
                                  <img key={p.id} src={mediaUrl(p.image)} alt={p.caption || ''} className="w-full h-full object-cover" />
                                ))}
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Aucune photo</div>
                            )}
                            <span className={`absolute top-2 left-2 ${badge} text-white text-[8px] font-black px-2 py-0.5 rounded-md`}>
                              {label} — {shortDate(insp.inspection_date || date)}
                            </span>
                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] font-black px-2 py-1 rounded-md">
                              Score {insp.condition_score ?? '—'}/100
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-1.5">
                            Par {insp.controller_name || 'contrôleur'} · {(insp.photos || []).length} photo(s)
                            {(insp.issues || []).length > 0 && <span className="text-red-500 font-bold"> · {insp.issues.length} problème(s) signalé(s)</span>}
                          </p>
                          {(insp.issues || []).length > 0 && (
                            <ul className="mt-1.5 space-y-1">
                              {insp.issues.slice(0, 3).map((i, k) => (
                                <li key={k} className="text-[9px] bg-red-50 text-red-700 rounded-lg px-2 py-1">
                                  {i.text || i.description || JSON.stringify(i)}{i.severity ? ` (${i.severity})` : ''}
                                </li>
                              ))}
                            </ul>
                          )}
                          {insp.notes && <p className="text-[9px] text-slate-500 mt-1 italic">« {insp.notes} »</p>}
                        </>
                      ) : (
                        <div className="rounded-2xl h-44 bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1">
                          <Camera size={18} />
                          <span className="text-[10px] font-bold">Pas de fiche {label.toLowerCase()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Décision arbitrale (litiges ouverts) ou sentence (résolus) */}
            {b.status === 'disputed' ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2"><Gavel size={15} className="text-teal-600" /> Décision Arbitrale</h3>
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

                <div className="mt-4 bg-slate-50 rounded-2xl p-3.5">
                  <div className="text-[10px] font-black text-slate-700 mb-2">Motivation de la décision (jointe au dossier)</div>
                  <textarea value={motive} onChange={e => setMotive(e.target.value)} rows={3}
                    placeholder="Motifs de la sentence — les deux parties pourront consulter cette justification…"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                  {err && <div className="mt-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                    <span className="text-[9px] text-slate-400">Les deux parties reçoivent une notification in-app de la sentence.</span>
                    <button onClick={arbitrate} disabled={busy}
                      className={`flex items-center gap-1.5 text-[10px] font-black px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 ${resolved ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                      {resolved ? <><CheckCircle2 size={12} /> Arbitrage validé</> : <><Send size={12} /> Valider l'arbitrage et débloquer les fonds</>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <h3 className="font-black text-emerald-800 text-sm mb-2 flex items-center gap-2"><Gavel size={15} /> Sentence rendue</h3>
                <p className="text-[11px] text-emerald-700 font-bold">
                  {decisionOf(b) ? decisionOf(b).sentence.charAt(0).toUpperCase() + decisionOf(b).sentence.slice(1) : 'Litige arbitré'}
                  {b.dispute_resolved_at && ` · ${longDate(b.dispute_resolved_at)}`}
                </p>
                {b.dispute_resolution_note && <p className="text-[10px] text-emerald-700 italic mt-1.5">« {b.dispute_resolution_note} »</p>}
              </div>
            )}

            {/* Journal des événements — horodatages réels */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm mb-4">Journal des Événements</h3>
              <div className="space-y-0">
                {audit.map((e, i, arr) => (
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
              <h3 className="font-black text-slate-900 mb-1">{tab === 'open' ? 'Aucun litige en cours' : 'Aucun litige arbitré'}</h3>
              <p className="text-xs text-slate-400">{tab === 'open' ? 'Tous les dossiers sont arbitrés — le séquestre fonctionne nominalement.' : 'Les sentences rendues apparaîtront ici.'}</p>
            </div>
          )
        )}
      </div>
    </AdminLayout>
  );
}
