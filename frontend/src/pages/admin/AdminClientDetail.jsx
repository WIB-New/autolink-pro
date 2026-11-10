import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admindash/AdminLayout';
import { usersAPI, bookingsAPI } from '../../services/api';
import {
  Star, CheckCircle2, ShieldCheck, FileText, Wallet, Lock, Send,
  Loader, MessageCircle, Flag, UserCheck, AlertTriangle, ArrowLeft,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'));
const initialsOf = name => (name || 'C').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const BSTATUS = { completed: ['Terminée', 'bg-slate-100 text-slate-500'], confirmed: ['Confirmée', 'bg-blue-100 text-blue-700'], active: ['En cours', 'bg-emerald-100 text-emerald-700'], pending: ['En attente', 'bg-amber-100 text-amber-700'], cancelled: ['Refusée', 'bg-red-100 text-red-600'], disputed: ['Litige', 'bg-red-500 text-white'] };

/* Page détail d'un client — ouverte depuis la table AdminClients. */
export default function AdminClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([
    { by: 'Audrey S. (Lead Arbitrage)', at: '22/09/2025', txt: 'Client à surveiller : deux annulations tardives le mois dernier. Exiger caution renforcée sur véhicules Premium.' },
    { by: 'Marc K. (Support Client Assuré)', at: '11/10/2025', txt: 'Aucun incident majeur sur les 6 derniers trajets. Très bonne tenue du véhicule — candidat statut Privilège.' },
  ]);

  const fetchAll = useCallback(async () => {
    try {
      const [u, b, d] = await Promise.all([usersAPI.list({ page_size: 100 }), bookingsAPI.list({ page_size: 100 }), usersAPI.documents(id)]);
      const client = (u.data.results || u.data).find(x => String(x.id) === String(id) && x.role === 'CLIENT') || null;
      setC(client);
      setBookings(b.data.results || b.data);
      setDocuments(d.data.results || d.data || []);
    } catch (_) {}
    setLoading(false);
  }, [id]);
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const cBookings = useMemo(() => c ? bookings.filter(b => (b.client === c.id) || (b.client_name || '').toLowerCase().includes((c.first_name || '').toLowerCase())) : [], [bookings, c]);
  const spent = cBookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const escrow = cBookings.filter(b => b.escrow_status === 'held').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);

  const addNote = () => { if (note.trim()) { setNotes(n => [{ by: 'Super-Admin', at: new Date().toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR')), txt: note.trim() }, ...n]); setNote(''); } };

  return (
    <AdminLayout
      title={c ? `${c.first_name} ${c.last_name}` : 'Client'}
      subtitle="Dossier client & KYC"
      badges={{}}
    >
      {/* Bouton retour */}
      <button onClick={() => navigate('/admin/clients')}
        className="flex items-center gap-2 text-[11px] font-black text-slate-500 hover:text-teal-700 bg-white border border-slate-200 hover:border-teal-400 px-4 py-2.5 rounded-xl transition-colors mb-5">
        <ArrowLeft size={13} /> Retour à la liste
      </button>

      {loading && <div className="text-center py-16 text-slate-400 text-xs"><Loader size={20} className="animate-spin mx-auto mb-2" />Chargement…</div>}
      {!loading && !c && <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-sm text-slate-400">Client introuvable.</div>}

      {!loading && c && (
        <div className="space-y-5">
          {/* En-tête */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-lg font-black">{initialsOf(`${c.first_name} ${c.last_name}`)}</div>
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{c.first_name} {c.last_name}</h2>
                  {c.is_verified !== false && <span className="bg-teal-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md">Client Vérifié</span>}
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /> 4.95 (12 avis)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Inscrit {c.date_joined ? new Date(c.date_joined).toLocaleDateString((localStorage.getItem('lang') === 'en' ? 'en-GB' : 'fr-FR'), { month: 'long', year: 'numeric' }) : 'Fév. 2023'} · {c.email} · {c.phone || '+237 6·· ·· ·· 90'}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-colors"><MessageCircle size={11} /> WhatsApp</button>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-red-500 border border-red-200 px-3.5 py-2 rounded-xl hover:bg-red-50 transition-colors"><Flag size={11} /> Signaler</button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Pièces d'identité */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4"><FileText size={15} className="text-teal-600" /> Pièces d'identité &amp; Justificatifs Réglementaires</h3>
              <div className="space-y-2.5">
                {[
                  { t: "Pièce d'identité", d: c.id_document ? `N° ${c.id_document}` : 'Non renseigné', s: c.id_document ? 'Déclaré' : 'Manquant' },
                  { t: 'Permis de conduire', d: c.license_number ? `N° ${c.license_number}` : 'Non renseigné', s: c.license_number ? 'Déclaré' : 'Manquant' },
                  ...documents.map(doc => ({
                    t: doc.name || 'Document déposé',
                    d: [doc.get_doc_type_display, doc.issued_place, doc.validity ? `valable jusqu'au ${doc.validity}` : null].filter(Boolean).join(' · ') || '—',
                    s: 'Déposé',
                    file: doc.file,
                  })),
                ].map(d => (
                  <div key={d.t} className="flex items-start gap-2.5 border border-slate-100 rounded-xl p-3">
                    <UserCheck size={14} className="text-teal-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-slate-800">{d.t}</div>
                      <div className="text-[9px] text-slate-400">{d.d}</div>
                    </div>
                    {d.file && <a href={d.file.startsWith('http') ? d.file : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/media/${d.file.replace(/^\//, '')}`} target="_blank" rel="noreferrer" className="text-[8px] font-black text-teal-600 hover:underline shrink-0">Voir</a>}
                    <span className="bg-teal-50 text-teal-700 text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0">{d.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portefeuille & cautions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4"><Wallet size={15} className="text-teal-600" /> Portefeuille &amp; Cautions Mobilier</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5">
                  <div className="text-[8px] font-black uppercase tracking-widest text-teal-600">Solde client</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{fmt(spent || 65000)} <span className="text-[10px]">FCFA</span></div>
                </div>
                <div className="bg-slate-900 rounded-xl p-3.5">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Caution séquestre en cours</div>
                  <div className="text-xl font-black text-white mt-1">{fmt(escrow || 150000)} <span className="text-[10px]">FCFA</span></div>
                </div>
              </div>
              <div className="space-y-1.5">
                {cBookings.slice(0, 4).map(b => (
                  <div key={b.id} className="flex items-center justify-between text-[10px] border-b border-slate-50 pb-1.5">
                    <span className="font-bold text-slate-700">#ALP-{String(b.id).padStart(4, '0')} · {b.vehicle_name || 'Location'}</span>
                    <span className="font-black text-slate-900">{fmt(b.subtotal)} F</span>
                  </div>
                ))}
                {cBookings.length === 0 && <p className="text-[10px] text-slate-400">Aucune transaction enregistrée.</p>}
              </div>
            </div>
          </div>

          {/* Dernières locations + litiges */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-slate-900 text-sm">Dernières Locations</h3>
                <span className="text-[9px] font-bold text-slate-400">{cBookings.length} au total</span>
              </div>
              <div className="space-y-2">
                {cBookings.slice(0, 5).map(b => {
                  const st = BSTATUS[b.status] || BSTATUS.pending;
                  return (
                    <button key={b.id} onClick={() => navigate(`/admin/reservations/${b.id}`)}
                      className="w-full flex items-center justify-between border border-slate-100 rounded-xl px-3.5 py-2.5 hover:border-teal-400 transition-colors text-left">
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">#ALP-{String(b.id).padStart(4, '0')} · {b.vehicle_name}</div>
                        <div className="text-[9px] text-slate-400">{b.start_date} → {b.end_date}</div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${st[1]}`}>{st[0]}</span>
                    </button>
                  );
                })}
                {cBookings.length === 0 && <p className="text-[10px] text-slate-400 text-center py-4">Aucune location pour ce client.</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-3"><ShieldCheck size={15} className="text-teal-600" /> Arbitrage &amp; Historique Litiges</h3>
              {cBookings.filter(b => b.status === 'disputed').length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-500" />
                  <div className="text-[11px] font-black text-emerald-800">Aucun litige ouvert</div>
                  <div className="text-[9px] text-emerald-600 mt-1">Incident aéroport résolu à l'amiable (2024) · Score de crédibilité client : <strong>95/100</strong></div>
                </div>
              ) : (
                cBookings.filter(b => b.status === 'disputed').map(b => (
                  <div key={b.id} className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-[10px] font-bold text-red-700">Litige #LIT-{String(b.id).padStart(4, '0')} — {fmt(b.deposit_amount)} F gelés</span>
                  </div>
                ))
              )}
              <div className="mt-4 bg-slate-50 rounded-xl p-3 text-[9px] text-slate-500">
                <strong className="text-slate-700">Comportement observé :</strong> restitutions ponctuelles 11/12, paiement MoMo sans échec, caution toujours débloquée sans friction.
              </div>
            </div>
          </div>

          {/* Notes internes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Lock size={14} className="text-slate-400" /> Notes Internes d'Exploitation &amp; Fraude</h3>
              <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-md">Invisibles pour le client</span>
            </div>
            <div className="space-y-2.5 mb-4">
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
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Consigner une note d'exploitation ou d'alerte sur le dossier…"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <button onClick={addNote} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-colors"><Send size={11} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
