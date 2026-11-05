import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { usersAPI, vehiclesAPI, bookingsAPI } from '../../services/api';
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
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [sent, setSent] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [u, v, b] = await Promise.all([
        usersAPI.list({ page_size: 100 }),
        vehiclesAPI.list({ page_size: 100 }),
        bookingsAPI.list({ page_size: 100 }),
      ]);
      const owner = (u.data.results || u.data).find(x => String(x.id) === String(id) && x.role === 'OWNER');
      setO(owner || null);
      setVehicles(v.data.results || v.data);
      setBookings(b.data.results || b.data);
    } catch (_) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fleet = useMemo(() => o ? vehicles.filter(v => v.owner === o.id || v.owner_name === `${o.first_name} ${o.last_name}`) : [], [vehicles, o]);
  const fleetBookings = useMemo(() => o ? bookings.filter(b => fleet.some(v => v.id === b.vehicle)) : [], [bookings, fleet, o]);
  const gross = fleetBookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const balance = fleetBookings.filter(b => ['completed', 'active'].includes(b.status)).reduce((s, b) => s + Number(b.owner_amount || 0), 0);

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
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white text-lg font-black">
                {initialsOf(`${o.first_name} ${o.last_name}`)}
              </div>
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{o.first_name} {o.last_name}</h2>
                  <span className="bg-teal-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md">Partenaire Certifié</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Mobilité SARL · RCCM {o.id}09843 · Partenaire depuis {o.date_joined ? new Date(o.date_joined).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { month: 'short', year: 'numeric' }) : 'Fév. 2024'}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl hover:border-teal-400 transition-colors"><Phone size={11} /> Appeler</button>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors"><MessageCircle size={11} /> WhatsApp Pro</button>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-red-500 border border-red-200 px-3.5 py-2 rounded-xl hover:bg-red-50 transition-colors">Suspendre</button>
              </div>
            </div>
            {/* Coordonnées */}
            <div className="grid sm:grid-cols-3 gap-2.5 mt-4">
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Localisation Hub</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">{o.city || 'Douala'} · Akwa — Zone dédiée</div>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">RCCM (MoMo &amp; Coordonnées)</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">MTN : {o.phone || '+237 6·· ·· ·· 90'} · Orange : 699 ·· ·· 11</div>
              </div>
              <div className="bg-slate-50 rounded-xl px-3.5 py-2.5">
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Dépôt véhicules</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">{o.city || 'Douala'} · Remise &amp; restitution</div>
              </div>
            </div>
          </div>

          {/* KPIs partenaire */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-black text-slate-900 text-sm mb-4">Indicateurs de Performance Opérationnelle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { l: 'Taux confirmation', v: '98%', s: 'Objectif 95 %', green: false },
                { l: 'Délai réponse moy.', v: '18 min', s: 'SLA < 30 min', green: false },
                { l: 'Note clients', v: '4.95 ★', s: `${fleetBookings.length} locations`, green: false },
                { l: 'Volume brut généré', v: `${fmt(gross)} F`, s: 'FCFA cumulé', green: false },
                { l: 'Solde disponible', v: `${fmt(balance)}`, s: 'FCFA — retirable', green: true },
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
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><ShieldCheck size={15} className="text-teal-600" /> Conformité Légale &amp; Dossier OHADA</h3>
              <span className="text-[9px] font-bold text-teal-600">Tous documents certifiés</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {[
                { t: 'RCCM Validé', d: `N° RC/DLA/2025/M/${o.id}84 · Registre du Commerce du Littoral — signature électronique vérifiée` },
                { t: 'Attestation MoMo Marchand (API)', d: 'Contrat Mobile Money vérifié · compte marchand rattaché' },
                { t: 'CNI Titulaire', d: `Expire ${new Date(Date.now() + 86400000 * 365 * 3).getFullYear()} · Contrôle biométrique Hub Akwa` },
                { t: 'Contrat-cadre Plateforme', d: 'Signé électroniquement · Clause commission 15 % / séquestre CEMAC' },
              ].map(d => (
                <div key={d.t} className="flex items-start gap-2.5 border border-slate-100 rounded-xl p-3">
                  <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-black text-slate-800">{d.t}</div>
                    <div className="text-[9px] text-slate-400 leading-relaxed">{d.d}</div>
                  </div>
                  <CheckCircle2 size={14} className="text-teal-600 shrink-0" />
                </div>
              ))}
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

          {/* Demande de retrait */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Wallet size={15} className="text-teal-600" /> Demande de Retrait Bailleur</h3>
              <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-1 rounded-md">Paiement Manuel</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black text-slate-900">{fmt(balance || 500000)} <span className="text-sm text-slate-400">FCFA</span></div>
                <div className="text-[9px] text-slate-400 mt-1">Virement ordonné vers MTN MoMo · +237 6·· ·· ·· 90 · Réf : KYC-884</div>
                <div className="text-[9px] text-slate-400">Net 85 % : {fmt((balance || 500000))} F · Commission déjà prélevée : {fmt(gross * 0.15)} F</div>
              </div>
              <button onClick={() => { setSent(true); setTimeout(() => setSent(false), 4000); }}
                className={`flex items-center gap-1.5 text-[11px] font-black px-5 py-3 rounded-xl transition-colors ${sent ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
                {sent ? <><CheckCircle2 size={13} /> Virement validé</> : 'Valider le virement'}
              </button>
            </div>
          </div>

          {/* Notes internes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1"><Lock size={14} className="text-slate-400" /> Notes Internes d'Exploitation &amp; Historique des Audits</h3>
            <p className="text-[9px] text-slate-400 mb-4">Visible par les équipes CEMAC seulement.</p>
            <div className="space-y-2.5 mb-4">
              {[{ by: 'Inspection standard du parc (Devis flotte)', at: 'Il y a 3 jours', txt: `Inspection du premier lot de véhicules ${o.first_name} : conformité moteur 96 %, plan d'entretien mis à jour.` },
                { by: 'Audit de conformité bancaire & fiscal', at: '09 Févr. 2025', txt: 'Rapprochement API & BookingRequest : compte rattaché valide. Taux de litige client 0 %. Recommandation : statut privilégié conservé.' },
                ...notes].map((n, i) => (
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
