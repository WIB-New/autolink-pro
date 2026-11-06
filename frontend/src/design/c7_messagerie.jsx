import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DesignShell from './DesignShell';
import { messagingAPI } from '../services/api';
import useApiData from '../utils/useApiData';

const ini = (s) => (s || '?').split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
const hh = (iso) => (iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '');
const ROLE_LABEL = { CLIENT: 'Client AutoLink', DRIVER: 'Chauffeur certifié AutoLink', OWNER: 'Propriétaire AutoLink', ADMIN: 'Support AutoLink' };
const EMOJIS = ['😊', '😂', '😍', '👍', '🙏', '😉', '🔥', '❤️', '🎉', '😢', '😮', '🤝'];
const FILTERS = [['', 'Tous'], ['CLIENT', 'Clients'], ['DRIVER', 'Chauffeurs'], ['OWNER', 'Propriétaires'], ['ADMIN', 'Support']];

// participants exclut déjà l'utilisateur courant côté API
const convName = (c) => c.subject || c.title || c.name
  || (c.participants || []).map((p) => p.name || p.username).filter(Boolean).join(', ')
  || 'Conversation';
const other = (c) => (c.participants || [])[0] || null;

export default function C7({ role = 'client' }) {
  const [params] = useSearchParams();
  const { data: cdata } = useApiData(() => messagingAPI.conversations(), []);
  const [convs, setConvs] = useState([]);
  useEffect(() => { setConvs(cdata?.results || (Array.isArray(cdata) ? cdata : [])); }, [cdata]);

  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [frole, setFrole] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [compose, setCompose] = useState(false);
  const [users, setUsers] = useState([]);
  const [picked, setPicked] = useState([]);
  const [uq, setUq] = useState('');
  const [urole, setUrole] = useState('');
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const endRef = useRef(null);

  const activeConv = convs.find((c) => c.id === active);
  const peer = activeConv ? other(activeConv) : null;
  const name = activeConv ? convName(activeConv) : '';
  const unread = convs.reduce((a, c) => a + (c.unread_count || 0), 0);

  useEffect(() => {
    const wanted = Number(params.get('conv'));
    if (wanted && convs.some((c) => c.id === wanted)) setActive(wanted);
    else if (!active && convs.length) setActive(convs[0].id);
  }, [convs, params]); // eslint-disable-line

  useEffect(() => {
    if (!active) return undefined;
    messagingAPI.messages(active)
      .then(({ data: d }) => setMsgs(Array.isArray(d) ? d : d?.results || []))
      .catch(() => setMsgs([]));
    return undefined;
  }, [active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const refresh = () => {
    messagingAPI.conversations().then(({ data: d }) => setConvs(d?.results || d || [])).catch(() => {});
    if (active) messagingAPI.messages(active).then(({ data: d }) => setMsgs(Array.isArray(d) ? d : d?.results || [])).catch(() => {});
  };
  const send = () => {
    const content = text.trim();
    if (!content || !active) return;
    messagingAPI.send(active, { content }).then(() => { setText(''); refresh(); }).catch(() => {});
  };
  const sendFiles = (files) => {
    if (!active || !files?.length) return;
    [...files].reduce((p, f) => p.then(() => {
      const fd = new FormData();
      fd.append('attachment', f); fd.append('content', f.name);
      return messagingAPI.send(active, fd).catch(() => {});
    }), Promise.resolve()).then(refresh);
  };
  const loadUsers = (q, r) => messagingAPI.users({ search: q, role: r }).then((res) => setUsers(res.data || [])).catch(() => setUsers([]));
  const flag = () => messagingAPI.open({ support: true, subject: 'Signalement' }).then(({ data: conv }) => {
    messagingAPI.send(conv.id, { content: `Signalement depuis la messagerie — conversation #${active || '-'}.` }).catch(() => {});
    window.location.href = `/messages?conv=${conv.id}`;
  }).catch(() => {});

  const filtered = convs.filter((c) => {
    if (frole === 'ADMIN' && !(c.kind === 'support' || (c.participants || []).some((p) => p.role === 'ADMIN'))) return false;
    if (frole && frole !== 'ADMIN' && !(c.participants || []).some((p) => p.role === frole)) return false;
    return !search || convName(c).toLowerCase().includes(search.toLowerCase())
      || String(c.last_message?.content || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DesignShell role={role}>
      <div className="h-[calc(100dvh-64px)] lg:h-full flex flex-col p-4 lg:p-6 gap-4">
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Messagerie & Échanges</h1>
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
          {/* Liste des conversations */}
          <aside className={`w-full lg:w-80 shrink-0 ${active ? 'hidden lg:flex' : 'flex'} flex-col gap-3 bg-surface-container-lowest rounded-2xl p-3 shadow-sm min-h-0`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Messages</span>
                <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[11px] font-bold">{unread} non lu{unread > 1 ? 's' : ''}</span>
              </div>
              <button type="button" onClick={() => { setCompose(true); setPicked([]); setUq(''); setUrole(''); loadUsers('', ''); }}
                className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary flex items-center justify-center" title="Nouvel échange">
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
              </button>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un échange, un chauffeur..."
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary" />
            <div className="flex gap-1.5 p-1 bg-surface-container-low rounded-xl">
              {FILTERS.map(([k, l]) => (
                <button key={k} type="button" onClick={() => setFrole(k)}
                  className={`flex-1 py-1 px-1 rounded-lg font-label-sm text-[11px] text-center transition-all ${frole === k ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant'}`}>{l}</button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
              {filtered.map((c) => (
                <button key={c.id} type="button" onClick={() => setActive(c.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${active === c.id ? 'bg-surface-container-high' : 'hover:bg-surface-container-low'}`}>
                  <span className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[14px] shrink-0">{ini(convName(c))}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex justify-between"><span className="font-label-md text-label-md font-bold text-on-surface truncate">{convName(c)}</span>
                      <span className="font-label-sm text-[10px] text-primary font-bold shrink-0">{hh(c.last_message?.created_at || c.updated_at)}</span></span>
                    {c.booking_label && <span className="block font-label-sm text-[10px] text-on-surface-variant truncate"><span className="material-symbols-outlined text-[11px] align-middle">directions_car</span> {c.booking_label}</span>}
                    <span className="block font-body-sm text-body-sm text-on-surface-variant truncate">{c.last_message?.content || ''}</span>
                  </span>
                  {!!c.unread_count && <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">{c.unread_count}</span>}
                </button>
              ))}
              {!filtered.length && <p className="text-center font-body-sm text-on-surface-variant py-8">Aucune conversation.</p>}
            </div>
          </aside>

          {/* Panneau conversation */}
          <section className={`flex-1 min-w-0 min-h-0 ${active ? 'flex' : 'hidden lg:flex'} flex-col bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden`}>
            {activeConv ? (
              <>
                <header className="flex items-center gap-3 p-4 border-b border-surface-container shrink-0">
                  <button type="button" onClick={() => setActive(null)} className="lg:hidden w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface flex items-center justify-center shrink-0" title="Retour">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">{ini(name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">{name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold">{ROLE_LABEL[peer?.role] || (activeConv.kind === 'support' ? 'Support AutoLink' : 'Contact')}</span>
                    </div>
                    {peer?.phone && <p className="font-body-sm text-[12px] text-on-surface-variant"><span className="material-symbols-outlined text-[13px] align-middle">call</span> {peer.phone}</p>}
                  </div>
                  {peer?.phone && <a href={`tel:${peer.phone}`} className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm font-bold hover:bg-surface-container flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">call</span>Appeler</a>}
                  <button type="button" onClick={flag} title="Signaler à l'admin" className="w-9 h-9 rounded-xl hover:bg-error-container hover:text-error text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                  </button>
                </header>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                  {msgs.map((m) => {
                    const mine = !!m.is_mine;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl shadow-sm font-body-md text-body-md ${mine ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-low text-on-surface rounded-bl-sm'}`}>
                          {!mine && <span className="block font-label-sm text-[11px] font-bold opacity-70">{m.sender_name || ''}</span>}
                          {m.content && <span className="whitespace-pre-wrap break-words">{m.content}</span>}
                          {m.attachment && <a href={m.attachment} target="_blank" rel="noreferrer" className="block mt-1 underline font-label-sm">{String(m.attachment).split('/').pop() || 'Pièce jointe'}</a>}
                          <span className={`block text-right font-label-sm text-[10px] mt-1 ${mine ? 'opacity-70' : 'text-outline'}`}>{hh(m.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {!msgs.length && <p className="text-center font-body-sm text-on-surface-variant py-10">Aucun message — écrivez le premier.</p>}
                  <div ref={endRef} />
                </div>
                <div className="relative shrink-0 border-t border-surface-container p-3 bg-surface-container-lowest">
                  {emojiOpen && (
                    <div className="absolute bottom-16 right-20 z-50 bg-surface-container-lowest rounded-2xl shadow-2xl p-2 grid grid-cols-6 gap-1">
                      {EMOJIS.map((e) => <button key={e} type="button" onClick={() => setText((t) => t + e)} className="text-[22px] hover:bg-surface-container rounded-lg p-1">{e}</button>)}
                    </div>
                  )}
                  <div className="flex items-end gap-2 rounded-2xl bg-surface-container-low p-2">
                    <button type="button" onClick={() => fileRef.current?.click()} title="Joindre des fichiers" className="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
                    <button type="button" onClick={() => photoRef.current?.click()} title="Photo / caméra" className="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[20px]">photo_camera</span></button>
                    <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { sendFiles(e.target.files); e.target.value = ''; }} />
                    <input ref={photoRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={(e) => { sendFiles(e.target.files); e.target.value = ''; }} />
                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} placeholder={`Écrivez votre message à ${name}...`}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      className="flex-1 bg-transparent resize-none py-2 px-1 text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none max-h-28" />
                    <button type="button" onClick={() => setEmojiOpen((o) => !o)} title="Émojis" className="w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span></button>
                    <button type="button" onClick={send} className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold flex items-center gap-2 shrink-0">Envoyer<span className="material-symbols-outlined text-[18px]">send</span></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant font-body-md">Sélectionnez une conversation.</div>
            )}
          </section>
        </div>
      </div>

      {/* Modale nouvel échange */}
      {compose && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setCompose(false); }}>
          <div className="bg-surface-container-lowest rounded-2xl p-5 w-full max-w-md flex flex-col gap-3 shadow-2xl max-h-[85vh]">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Nouvel échange</h2>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(([k, l]) => (
                <button key={k} type="button" onClick={() => { setUrole(k); loadUsers(uq, k); }}
                  className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm ${urole === k ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>{l}</button>
              ))}
            </div>
            <input value={uq} onChange={(e) => { setUq(e.target.value); loadUsers(e.target.value, urole); }} placeholder="Nom, prénom ou email…"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary" />
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-[140px]">
              {users.map((u) => {
                const on = picked.includes(u.id);
                return (
                  <button key={u.id} type="button" onClick={() => setPicked((p) => (on ? p.filter((x) => x !== u.id) : [...p, u.id]))}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-left ${on ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-surface-container-low'}`}>
                    {u.photo ? <img src={u.photo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                      : <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[13px] shrink-0">{ini(u.name)}</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block font-label-md text-label-md font-semibold text-on-surface truncate">{u.name}</span>
                      <span className="block font-body-sm text-[11px] text-on-surface-variant truncate">{u.email} · {u.role}</span>
                    </span>
                    {on && <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>}
                  </button>
                );
              })}
              {!users.length && <p className="text-center font-body-sm text-on-surface-variant py-8">Aucun utilisateur trouvé.</p>}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setCompose(false)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
              <button type="button" disabled={!picked.length} onClick={() => {
                messagingAPI.open({ users: picked }).then(({ data: conv }) => { setCompose(false); setActive(conv.id); refresh(); }).catch(() => {});
              }} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">Démarrer{picked.length > 1 ? ` (${picked.length})` : ''}</button>
            </div>
          </div>
        </div>
      )}
    </DesignShell>
  );
}
