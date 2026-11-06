import React, { useState } from 'react';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';
import useApiData from '../utils/useApiData';
import { usersAPI, offersAPI } from '../services/api';

export default function Referrals({ role = 'client' }) {
  const { data } = useApiData(() => usersAPI.referral().then((r) => r.data), []);
  const { data: offers } = useApiData(() => offersAPI.list().then((r) => r.data), []);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [copiedInv, setCopiedInv] = useState(null);
  const code = data?.code || '';
  const refs = data?.referred || [];
  const offerList = offers?.results || (Array.isArray(offers) ? offers : []);
  const link = code ? `${window.location.origin}/register?ref=${code}` : '';
  const inviteText = `Rejoignez-moi sur AutoLink Pro et profitez d'avantages avec mon code parrain ${code} ! ${link}`;
  const dmy = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmt = (n) => `${new Intl.NumberFormat('fr-FR').format(Number(n || 0))} FCFA`;

  const copy = (text, set = setCopied) => { navigator.clipboard?.writeText(text); set(true); setTimeout(() => set(false), 1500); };
  const shareWithQr = async (text, url) => {
    if (!url || !navigator.share) return false;
    try {
      let files;
      try {
        const blob = await (await fetch(qr)).blob();
        const file = new File([blob], `autolink-parrain-${code}.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) files = [file];
      } catch (_) { /* QR indisponible */ }
      await navigator.share({ title: 'AutoLink Pro — Parrainage', text, url, ...(files ? { files } : {}) });
      return true;
    } catch (_) { return true; /* annulé par l'utilisateur */ }
  };
  const share = async () => { if (!(await shareWithQr(inviteText, link))) copy(link, setShared); };
  const whatsappShare = async () => { if (!(await shareWithQr(inviteText, link))) window.open(whatsapp, '_blank'); };
  const relaunch = async (first) => {
    const msg = `Salut ${first} ! Termine ta première location AutoLink pour débloquer ton bonus. ${link}`;
    if (!(await shareWithQr(msg, link))) {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
  const qr = code ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}` : '';

  return (
    <DesignShell role={role}>
      <div className="w-full px-gutter py-space-lg flex flex-col gap-space-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Parrainage & Réductions</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Parrainez vos proches et cumulez des réductions sur vos locations.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* Code + partage */}
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-lg flex flex-col gap-space-md relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <span className="font-label-lg text-label-lg uppercase tracking-wide text-surface-variant">Votre code parrainage</span>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-highest/20 px-4 py-3">
                <span className="font-display-lg text-display-lg-mobile tracking-wider text-primary-fixed truncate">{code || '…'}</span>
                <button onClick={() => copy(code)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shrink-0">
                  <Icon name={copied ? 'check' : 'content_copy'} size={16} />{copied ? 'Copié' : 'Copier'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={share} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold">
                  <Icon name="share" size={16} />{shared ? 'Lien copié !' : 'Partager'}
                </button>
                <button onClick={whatsappShare} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white font-label-md font-bold">
                  <Icon name="chat" size={16} />WhatsApp
                </button>
                <button onClick={() => copy(link)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">
                  <Icon name="link" size={16} />Copier le lien
                </button>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {qr && <img src={qr} alt={`QR code — ${link}`} className="w-24 h-24 rounded-xl bg-white p-1" loading="lazy" />}
                <div className="flex flex-col gap-1">
                  <p className="font-body-sm text-body-sm text-surface-variant/80">Scannez ou partagez votre lien pour inviter vos proches.</p>
                  <p className="font-body-sm text-body-sm text-surface-variant/80">Vous gagnez <strong>5 000 FCFA</strong> quand votre filleul termine sa première location.</p>
                  <p className="font-body-sm text-body-sm text-surface-variant/80">Crédits gagnés : <strong>{fmt(data?.credits)}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Offres actives réelles */}
          <div className="card flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Offres actives</h2>
            {!offerList.length && <p className="py-3 text-on-surface-variant text-body-sm">Aucune offre active pour le moment.</p>}
            {offerList.map((o) => (
              <div key={o.id || o.code} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4">
                <div className="min-w-0">
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">{o.title}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{o.description}</div>
                  {o.terms && <div className="font-body-sm text-[11px] text-outline mt-1">{o.terms}</div>}
                </div>
                <button onClick={() => copy(o.code)} className="px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold shrink-0 hover:opacity-80" title="Copier le code">{o.code}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Filleuls — tableau avec actions */}
        <div className="card">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Vos filleuls ({data?.referred_count ?? refs.length})</h2>
          {refs.length === 0 ? (
            <p className="py-4 text-on-surface-variant text-body-sm">Aucun filleul pour le moment — partagez votre code pour commencer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-body-sm text-body-sm">
                <thead><tr className="text-left font-label-sm text-label-sm text-on-surface-variant border-b border-surface-container">
                  <th className="py-3 pr-4">Filleul</th><th className="py-3 pr-4">Inscrit le</th><th className="py-3 pr-4">Bonus</th><th className="py-3 pr-4">Statut</th><th className="py-3">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-surface-container">
                  {refs.map((r, i) => (
                    <tr key={r.name + i}>
                      <td className="py-4 pr-4 font-label-md font-bold text-on-surface">{r.name}</td>
                      <td className="py-4 pr-4 text-on-surface-variant">{dmy(r.date)}</td>
                      <td className={`py-4 pr-4 font-label-md font-bold ${r.status === 'active' ? 'text-primary' : 'text-on-surface-variant'}`}>{r.status === 'active' ? '+5 000 FCFA' : '—'}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${r.status === 'active' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {r.status === 'active' ? 'Bonus crédité' : 'En attente'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { navigator.clipboard?.writeText(inviteText); setCopiedInv(i); setTimeout(() => setCopiedInv(null), 1500); }}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" title="Copier l'invitation">
                            <span className="material-symbols-outlined text-[17px]">{copiedInv === i ? 'check' : 'content_copy'}</span>
                          </button>
                          <button type="button" onClick={() => relaunch(r.name.split(' ')[0])}
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" title="Relancer (message + QR)">
                            <span className="material-symbols-outlined text-[17px]">send</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DesignShell>
  );
}
