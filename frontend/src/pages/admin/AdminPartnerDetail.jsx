import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { useConfirm } from '../../contexts/ConfirmContext';
import { usersAPI, vehiclesAPI, bookingsAPI, withdrawalsAPI } from '../../services/api';
import { getVehicleImage } from '../../utils/carImages';
import { vehicleCover } from '../../utils/media';
import {
  Phone, MessageCircle, CheckCircle2, ShieldCheck,
  FileText, Wallet, Lock, Send, Loader, Eye, ArrowLeft,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const initialsOf = name => (name || 'P').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const VSTATUS = { approved: ['Homologué', 'bg-teal-100 text-teal-700'], pending: ['En attente', 'bg-amber-100 text-amber-700'], suspended: ['Désactivé', 'bg-red-100 text-red-600'], rented: ['En location', 'bg-blue-100 text-blue-700'] };

/* Page détail d'un propriétaire — ouverte depuis la table AdminPartners. */
export default function AdminPartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [o, setO] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [u, v, b, w, d] = await Promise.all([
        usersAPI.list({ page_size: 100 }),
        vehiclesAPI.list({ page_size: 100 }),
        bookingsAPI.list({ page_size: 100 }),
        withdrawalsAPI.list({ user: id, page_size: 20 }),
        usersAPI.documents(id),
      ]);
      const owner = (u.data.results || u.data).find(x => String(x.id) === String(id) && x.role === 'OWNER');
      setO(owner || null);
      setVehicles(v.data.results || v.data);
      setBookings(b.data.results || b.data);
      setWithdrawals(w.data.results || w.data || []);
      setDocs(d.data.results || d.data || []);
    } catch (_) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fleet = useMemo(() => o ? vehicles.filter(v => v.owner === o.id || v.owner_name === `${o.first_name} ${o.last_name}`) : [], [vehicles, o]);
  const fleetBookings = useMemo(() => o ? bookings.filter(b => fleet.some(v => v.id === b.vehicle)) : [], [bookings, fleet, o]);
  const gross = fleetBookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const responded = fleetBookings.filter(b => ['accepted', 'refused'].includes(b.owner_response));
  const confirmRate = responded.length ? Math.round(responded.filter(b => b.owner_response === 'accepted').length / responded.length * 100) : null;
  const delays = fleetBookings.filter(b => b.owner_responded_at && b.created_at)
    .map(b => (new Date(b.owner_responded_at) - new Date(b.created_at)) / 60000);
  const avgDelay = delays.length ? Math.round(delays.reduce((a, c) => a + c, 0) / delays.length) : null;
  const rated = fleetBookings.filter(b => b.client_rating);
  const avgRating = rated.length ? rated.reduce((s, b) => s + Number(b.client_rating), 0) / rated.length : null;
  const pendingWd = withdrawals.filter(w => w.status === 'pending');

  const processWithdrawal = async (w, approve) => {
    const ok = await confirm({
      title: approve ? 'Autoriser le virement' : 'Refuser le retrait',
      message: approve
        ? `Confirmez que ${fmt(w.amount)} FCFA ont été virés vers ${w.phone}.`
        : `Le montant de ${fmt(w.amount)} FCFA sera recrédité sur le solde du propriétaire.`,
      confirmLabel: approve ? 'Autoriser' : 'Refuser',
      danger: !approve,
    });
    if (!ok) return;
    try {
      await (approve ? withdrawalsAPI.approve(w.id, '') : withdrawalsAPI.reject(w.id, ''));
      setError('');
      fetchAll();
    } catch (e) { setError(e.response?.data?.detail || 'Action impossible.'); }
  };

  const toggleSuspend = async () => {
    const ok = await confirm({
      title: o.is_active ? 'Suspendre ce propriétaire' : 'Réactiver ce propriétaire',
      message: `Le compte de ${o.first_name} ${o.last_name} sera ${o.is_active ? 'suspendu' : 'réactivé'}.`,
      danger: o.is_active,
    });
    if (!ok) return;
    try { await usersAPI.update(o.id, { is_active: !o.is_active }); setError(''); fetchAll(); }
    catch (e) { setError(e.response?.data?.is_active?.[0] || 'Action impossible.'); }
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(n => [{ by: 'Super-Admin', at: new Date().toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { day: '2-digit', month: 'short' }), txt: note.trim() }, ...n]);
    setNote('');
  };

  return (
    <AdminLayout
      title={o ? `${o.first_name} ${o.last_name}` : 'Partenaire'}
      subtitle="Fiche détaillée du propriétaire"
      badges={{}}
    >
      {/* Bouton retour */}
      <button onClick={() => navigate('/admin/partenaires')}
        className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-teal-700 bg-white border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors mb-5">
        <ArrowLeft size={13} /> Retour à la liste
      </button>

      {loading && <div className="text-center py-16 text-slate-400 text-xs"><Loader size={20} className="animate-spin mx-auto mb-2" />Chargement…</div>}

      {!loading && !o && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">Partenaire introuvable.</div>}

      {!loading && o && (
        <div className="space-y-5">
          {/* En-tête */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-4">
              {o.avatar && (
                <img src={o.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />)}
              <div className={`w-14 h-14 bg-slate-800 rounded-2xl items-center justify-center text-white text-lg font-black shrink-0 ${o.avatar ? 'hidden' : 'flex'}`}>
                {initialsOf(`${o.first_name} ${o.last_name}`)}
              </div>
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{o.first_name} {o.last_name}</h2>
                  {o.kyc_status === 'verified'
                    ? <span className="bg-teal-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md">Partenaire Certifié</span>
                    : <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded-md">KYC {o.kyc_status || 'non déposé'}</span>}
                  {!o.is_active && <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-md">Compte suspendu</span>}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {o.email} · {o.phone || '—'} · Partenaire depuis {o.created_at ? new Date(o.created_at).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { month: 'short', year: 'numeric' }) : '—'}
                </div>
              </div>
              <div className="flex gap-2">
                {o.phone && <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl hover:border-teal-400 transition-colors"><Phone size={11} /> Appeler</a>}
                {(o.whatsapp || o.phone) && (
                  <a href={`https://wa.me/${(o.whatsapp || o.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors">
                    <MessageCircle size={11} /> WhatsApp
                  </a>)}
                <button onClick={toggleSuspend}
                  className={`flex items-center gap-1.5 text-[10px] font-black px-3.5 py-2 rounded-xl border transition-colors ${o.is_active ? 'text-red-500 border-red-200 hover:bg-red-50' : 'text-teal-700 border-teal-200 hover:bg-teal-50'}`}>
                  {o.is_active ? 'Suspendre' : 'Réactiver'}
                </button>
              </div>
            </div>
            {error && <div className="mt-3 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
            {/* Coordonnées */}
            <div className="grid sm:grid-cols-3 gap-2.5 mt-4">
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Ville d'opération</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">{o.city || '—'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Mobile Money (retraits)</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">
                  {o.payment_method ? `${o.payment_method.toUpperCase()} : ${o.payment_phone || '—'}` : 'Non renseigné'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Contact direct</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">{o.phone || '—'}{o.whatsapp ? ` · WA ${o.whatsapp}` : ''}</div>
              </div>
            </div>
          </div>

          {/* KPIs partenaire */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-black text-slate-900 text-sm mb-4">Indicateurs de Performance Opérationnelle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { l: 'Taux confirmation', v: confirmRate === null ? '—' : `${confirmRate} %`, s: `${responded.length} demandes traitées`, green: false },
                { l: 'Délai réponse moy.', v: avgDelay === null ? '—' : avgDelay >= 60 ? `${Math.floor(avgDelay / 60)} h ${avgDelay % 60} min` : `${avgDelay} min`, s: 'Demande → réponse', green: false },
                { l: 'Note clients', v: avgRating === null ? '—' : `${avgRating.toFixed(1)} ★`, s: rated.length ? `${rated.length} avis` : 'Aucun avis', green: false },
                { l: 'Volume brut généré', v: `${fmt(gross)} F`, s: `${fleetBookings.length} locations`, green: false },
                { l: 'Solde disponible', v: `${fmt(o.balance)}`, s: 'FCFA — retirable', green: true },
              ].map(k => (
                <div key={k.l} className={`rounded-xl p-3 ${k.green ? 'bg-teal-600' : 'bg-slate-50'}`}>
                  <div className={`text-[8px] font-black uppercase tracking-widest ${k.green ? 'text-teal-100' : 'text-slate-400'}`}>{k.l}</div>
                  <div className={`text-lg font-black mt-1 ${k.green ? 'text-white' : 'text-slate-900'}`}>{k.v}</div>
                  <div className={`text-[9px] font-bold mt-0.5 ${k.green ? 'text-teal-200' : 'text-teal-600'}`}>{k.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conformité */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><ShieldCheck size={15} className="text-teal-600" /> Conformité &amp; Documents KYC</h3>
              <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${o.kyc_status === 'verified' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'}`}>
                {o.kyc_status === 'verified' ? 'KYC vérifié' : o.kyc_status === 'pending' ? 'KYC en attente' : o.kyc_status === 'rejected' ? 'KYC rejeté' : 'Aucun KYC'}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {[
                { t: "Pièce d'identité", f: o.id_document, verified: o.id_document_verified },
                { t: 'Permis de conduire', f: o.driving_license, extra: o.driving_license_expires_at ? `Expire le ${new Date(o.driving_license_expires_at).toLocaleDateString('fr-FR')}` : null },
                { t: 'Justificatif de domicile', f: o.address_proof },
                { t: 'Attestation d\'assurance', f: o.insurance },
              ].map(k => (
                <div key={k.t} className="flex items-start gap-2.5 border border-slate-100 rounded-xl p-3">
                  <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-slate-800">{k.t}</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">
                      {k.f
                        ? <a href={k.f} target="_blank" rel="noreferrer" className="text-teal-600 underline">Voir le document</a>
                        : 'Non déposée'}
                      {k.extra ? ` · ${k.extra}` : ''}
                      {k.verified ? ' · Vérifiée' : ''}
                    </div>
                  </div>
                  {k.verified
                    ? <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                    : k.f ? <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 shrink-0">Déposé</span>
                    : <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 shrink-0">Manquant</span>}
                </div>
              ))}
              {docs.map(d => (
                <div key={d.id} className="flex items-start gap-2.5 border border-slate-100 rounded-xl p-3">
                  <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-slate-800">{d.name}</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">
                      {[d.issued_place, d.validity ? `Valide jusqu'au ${new Date(d.validity).toLocaleDateString('fr-FR')}` : null].filter(Boolean).join(' · ') || 'Document déposé'}
                      {d.file && <> · <a href={d.file} target="_blank" rel="noreferrer" className="text-teal-600 underline">Voir</a></>}
                    </div>
                  </div>
                  {d.status === 'verified'
                    ? <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                    : <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {d.status === 'rejected' ? 'Refusé' : 'En attente'}
                      </span>}
                </div>
              ))}
              {!o.id_document && !o.driving_license && !o.address_proof && !o.insurance && docs.length === 0 && (
                <div className="text-[10px] text-slate-400 col-span-2">Aucun document déposé par ce propriétaire.</div>
              )}
            </div>
          </div>

          {/* Flotte rattachée */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Flotte Rattachée ({fleet.length} Véhicule{fleet.length > 1 ? 's' : ''})</h3>
              <button className="text-[10px] font-bold text-teal-600">Assigner un véhicule +</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-2.5">Véhicule</th><th className="px-3 py-2.5">Immatriculation</th><th className="px-3 py-2.5">Catégorie</th><th className="px-3 py-2.5">Tarif / jour</th><th className="px-3 py-2.5">Statut</th><th className="px-3 py-2.5 text-right pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fleet.map(v => {
                  const st = VSTATUS[v.status] || VSTATUS.pending;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={vehicleCover(v) || v.image_url || getVehicleImage(v.category)} alt="" className="w-12 h-9 rounded-lg object-cover bg-slate-100" />
                          <div className="text-[11px] font-bold text-slate-800">{v.brand} {v.model} {v.year}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[11px] font-bold text-slate-600">{v.plate}</td>
                      <td className="px-3 py-3 text-[10px] text-slate-500">{v.category || '—'}</td>
                      <td className="px-3 py-3 text-[11px] font-black text-slate-900">{fmt(v.daily_rate)} F</td>
                      <td className="px-3 py-3"><span className={`text-[9px] font-black px-2 py-1 rounded-lg ${st[1]}`}>{st[0]}</span></td>
                      <td className="px-3 py-3 pr-5 text-right">
                        {v.status === 'suspended' ? (
                          <button onClick={() => vehiclesAPI.update(v.id, { status: 'approved' }).then(fetchAll).catch(() => {})}
                            className="text-[9px] font-black text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            Réactiver
                          </button>
                        ) : (
                          <button onClick={() => navigate(`/admin/vehicles/${v.id}`)}
                            className="inline-flex items-center gap-1 text-[9px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Eye size={10} /> Voir dossier
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {fleet.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">Aucun véhicule rattaché.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Demandes de retrait */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Wallet size={15} className="text-teal-600" /> Retraits Bailleur</h3>
              <span className="text-[9px] font-bold text-slate-400">Solde : {fmt(o.balance)} FCFA</span>
            </div>
            {pendingWd.length === 0 && <div className="text-[10px] text-slate-400 mb-3">Aucune demande de retrait en attente.</div>}
            <div className="space-y-2.5">
              {withdrawals.map(w => (
                <div key={w.id} className="bg-slate-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-900">{fmt(w.amount)} <span className="text-[10px] text-slate-400">FCFA</span>
                      <span className={`ml-2 text-[8px] font-black px-2 py-0.5 rounded-md ${w.status === 'pending' ? 'bg-amber-100 text-amber-700' : w.status === 'paid' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'}`}>
                        {w.status === 'pending' ? 'En attente' : w.status === 'paid' ? 'Payé' : 'Rejeté'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">
                      Réf {w.reference} · {(w.method || '').toUpperCase()} {w.phone} · {w.created_at ? new Date(w.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => processWithdrawal(w, false)}
                        className="text-[10px] font-black text-red-500 border border-red-200 px-3.5 py-2 rounded-xl hover:bg-red-50 transition-colors">Refuser</button>
                      <button onClick={() => processWithdrawal(w, true)}
                        className="flex items-center gap-1.5 text-[10px] font-black bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl transition-colors">
                        <CheckCircle2 size={12} /> Valider le virement
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {withdrawals.length === 0 && <div className="text-[10px] text-slate-400">Aucun retrait enregistré pour ce propriétaire.</div>}
            </div>
          </div>

          {/* Notes internes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1"><Lock size={14} className="text-slate-400" /> Notes Internes d'Exploitation</h3>
            <p className="text-[9px] text-slate-400 mb-4">Visible par les équipes AutoLink seulement.</p>
            <div className="space-y-2.5 mb-4">
              {notes.length === 0 && <div className="text-[10px] text-slate-400">Aucune note interne pour ce partenaire.</div>}
              {notes.map((n, i) => (
                <div key={i} className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                  <div className="flex justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-slate-700">{n.by}</span>
                    <span className="text-[9px] text-slate-400">{n.at}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{n.txt}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Ajouter une observation confidentielle sur le bailleur…"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={addNote} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors"><Send size={11} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
