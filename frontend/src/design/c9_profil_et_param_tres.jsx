import React, { useMemo, useEffect, useState } from 'react';
import DesignPage from './DesignPage';
import DesignShell from './DesignShell';
import OwnerLayout from '../components/ownerdash/OwnerLayout';
import useApiData from '../utils/useApiData';
import { authAPI, kycAPI, usersAPI, documentsAPI } from '../services/api';

const STATUS_TEXT = { none: 'À FOURNIR', pending: 'EN VÉRIFICATION', approved: 'VALIDÉ', rejected: 'REFUSÉ' };

const HTML = `<div class="flex flex-col w-full">
<!-- Page Header -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
<div class="flex flex-col gap-1 max-w-3xl">
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Mon Profil & Paramètres de Compte</h1>
<p class="font-body-md text-on-surface-variant">Gérez vos informations personnelles et le statut légal de vos pièces justificatives.</p>
</div>
</div>
<!-- Section 1: Informations Personnelles (Summary Banner) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg relative overflow-hidden">
<div class="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
<!-- Profile Info -->
<div class="flex items-start sm:items-center gap-space-md">
<div class="relative shrink-0">
<div class="w-20 h-20 rounded-2xl bg-primary text-on-primary font-headline-lg flex items-center justify-center font-black shadow-md">
            EK
          </div>
<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-primary text-[18px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</div>
<div class="flex flex-col">
<div class="flex flex-wrap items-center gap-space-xs">
<h2 class="font-headline-md text-headline-md text-on-surface font-bold">Emmanuel Kouam</h2>
<span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">Client AutoLink</span>
</div>
<div class="flex flex-wrap items-center gap-y-1 gap-x-space-md mt-1 text-on-surface-variant font-body-sm text-body-sm">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-outline">mail</span>
              emmanuel.k@gmail.com
            </span>
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-outline">call</span>
              +237 670 42 18 90
            </span>
<span class="px-2 py-0.5 rounded-md bg-surface-container font-label-sm text-label-sm text-primary font-bold">
              MTN MoMo lié
            </span>
</div>
</div>
</div>
<!-- Trust Score & Rank Widget -->

<button id="edit-profile" class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all" type="button"><span class="material-symbols-outlined text-[18px]">edit</span>Modifier mon profil</button>
</div>
<!-- Section 2: Pièces d'identité & Justificatifs Réglementaires -->
<div class="flex flex-col gap-space-md mb-space-lg mt-space-lg">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs mb-space-md">
<div>
<h3 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Pièces d'identité & Documents Requis</h3>
<p class="font-body-md text-on-surface-variant sr-only">Documents justificatifs du compte.</p>
</div>
<button id="add-doc-btn" type="button" class="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors shadow-sm">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
        Ajouter un document
      </button>
</div>
<!-- Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
<!-- Card 1: CNI Validée -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">badge</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Pièce d'Identité Officielle</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">CNI ou Passeport Biométrique CEMAC</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shrink-0">
<span class="w-2 h-2 rounded-full bg-primary"></span>
              VALIDÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Numéro :</span>
<span class="font-mono font-semibold">102938472 (Douala)</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Validité :</span>
<span class="font-semibold text-primary">Jusqu'au 14 Août 2028</span>
</div>
<div class="flex items-center gap-1.5 text-primary font-label-sm text-label-sm pt-1">
<span class="material-symbols-outlined text-[16px]">face_retouching_natural</span>
              Vérification faciale biométrique confirmée
            </div>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="flex-1 py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">visibility</span>
            Voir le document
          </button>
<button class="py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors font-label-md text-label-md">
            Remplacer
          </button>
</div>
</div>
<!-- Card 2: Permis à renouveler -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
<div class="absolute top-0 right-0 w-2 h-full bg-blue-100"></div>
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">drive_eta</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Permis de Conduire (Cat. B)</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Indispensable pour auto-partage sans chauffeur</span>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-label-sm text-label-sm font-bold flex items-center gap-1 shrink-0">
<span class="w-2 h-2 rounded-full bg-blue-100 animate-pulse"></span>
              À RENOUVELER (15j)
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Réf. Permis :</span>
<span class="font-mono font-semibold">CM-LT-88219</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Date d'expiration :</span>
<span class="font-semibold text-blue-700">12 Novembre 2025</span>
</div>
<p class="text-blue-700 font-label-sm text-label-sm font-semibold pt-1">
              Important : passée cette date, les clés ne pourront pas vous être transmises sans chauffeur.
            </p>
</div>
</div>
<div class="flex flex-col gap-2 pt-2">
<button class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary transition-all font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm" id="lic-upload-btn" type="button">
<span class="material-symbols-outlined text-[20px]">upload_file</span>
            Téléverser le nouveau permis recto/verso
          </button>
<input accept=".jpg,.jpeg,.png,.webp,.pdf" id="lic-upload-input" style="display:none" type="file"/>
</div>
</div>
<!-- Card 3: Justificatif Domicile -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">home_pin</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Justificatif de Domicile</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Facture certifiée ou Attestation d'hébergement</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 shrink-0">
<span class="w-2 h-2 rounded-full bg-primary"></span>
              VALIDÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm">
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Émetteur & Zone :</span>
<span class="font-semibold">Facture Eneo · Douala (Akwa Nord)</span>
</div>
<div class="flex items-center justify-between text-on-surface">
<span class="text-outline font-label-sm text-label-sm">Date d'audit :</span>
<span class="font-semibold text-primary">Vérifié le 15 Septembre 2025</span>
</div>
<div class="text-outline-variant text-[12px] pt-1">
              Valable pour une période d'un an sur le réseau AutoLink Pro.
            </div>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">visibility</span>
            Voir le document
          </button>
</div>
</div>
<!-- Card 4: Assurance Complémentaire (Refusé) -->
<div class="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden">
<div class="absolute top-0 right-0 w-2 h-full bg-error"></div>
<div class="flex flex-col gap-space-sm">
<div class="flex items-start justify-between gap-space-sm">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[26px]">health_and_safety</span>
</div>
<div class="flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Assurance Complémentaire</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">Couverture personnelle responsabilité civile</span>
</div>
</div>
<span class="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-1 shrink-0">
<span class="w-2 h-2 rounded-full bg-error"></span>
              REFUSÉ
            </span>
</div>
<!-- Document details box -->
<div class="bg-error-container/30 rounded-xl p-3 flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface">
<span class="font-label-sm text-label-sm text-error font-bold flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">report_problem</span>
              Motif du rejet :
            </span>
<p class="text-on-surface-variant text-[13px] leading-relaxed">
              Document illisible ou tronqué sur les bords lors de la capture. Merci de soumettre un scan PDF haute résolution délivré par votre assureur.
            </p>
</div>
</div>
<div class="flex items-center gap-space-sm pt-2">
<button class="w-full py-2.5 px-4 rounded-xl bg-surface-container text-error hover:bg-error-container transition-colors font-label-md text-label-md flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">replay</span>
            Soumettre à nouveau
          </button>
</div>
</div>
</div>
<!-- Security & Legal Guarantee Callout -->
<div class="rounded-2xl bg-surface-container-low p-space-md flex items-center gap-space-md">

<div class="flex flex-col">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">Protection et Chiffrement Bancaire</span>
<p class="font-body-sm text-body-sm text-on-surface-variant">
          Vos documents sont chiffrés AES-256 et sécurisés conformément aux normes de l'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) et de la commission bancaire CEMAC. Aucun document n'est transmis à des tiers sans votre consentement explicite.
        </p>
</div>
</div>
</div>
`;
const LINKS = {};

const DOC_TYPES = { id: "Pièce d'identité", license: 'Permis de conduire', address: 'Justificatif de domicile', insurance: 'Assurance', other: 'Autre' };
const FIELD_LABELS = { id_document: "Pièce d'Identité Officielle", driving_license: 'Permis de Conduire (Cat. B)', address_proof: 'Justificatif de Domicile', insurance: 'Assurance Complémentaire' };

/* Chrome adaptatif : OwnerLayout pour le propriétaire, DesignShell sinon. */
const Shell = ({ role, children }) => (role === 'owner' ? <OwnerLayout>{children}</OwnerLayout> : <DesignShell role={role}>{children}</DesignShell>);

export default function C9ProfilEtParametres({ role = 'client' }) {
  const { data: me } = useApiData(() => authAPI.me(), []);
  const { data: docs } = useApiData(() => documentsAPI.list(), []);
  const [editing, setEditing] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [docEdit, setDocEdit] = useState(null); // document en cours de modification
  const [docBusy, setDocBusy] = useState(false);
  const [docErr, setDocErr] = useState('');
  const [docField, setDocField] = useState(null); // champ KYC en édition
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [photo, setPhoto] = useState(null);
  const html = useMemo(() => {
    if (!me) return HTML;
    const name = `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.username || '';
    const roleLabel = { CLIENT: 'Client AutoLink', DRIVER: 'Chauffeur AutoLink', OWNER: 'Propriétaire AutoLink', ADMIN: 'Admin AutoLink' }[me.role] || 'Client AutoLink';
    const init = name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || 'U';
    const badge = (ok, txt) => `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${ok || txt === 'EN VÉRIFICATION' ? 'bg-primary-fixed text-primary' : txt === 'REFUSÉ' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}">${txt || (ok ? 'VALIDÉ' : 'À FOURNIR')}</span>`;
    const iconBtn = (cls, title, icon, data = '') => `<button type="button" class="${cls} w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" title="${title}" ${data}><span class="material-symbols-outlined text-[17px]">${icon}</span></button>`;
    const viewBtn = (url) => url ? `<a href="${url}" target="_blank" rel="noreferrer" class="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" title="Voir"><span class="material-symbols-outlined text-[17px]">visibility</span></a>` : '';
    const upBtn = (field) => iconBtn('doc-upload', 'Modifier', 'edit', `data-field="${field}"`);
    const delBtn = (field) => iconBtn('doc-del-field', 'Supprimer', 'delete', `data-field="${field}"`);
    const licOk = me.driving_license && !(me.driving_license_expires_at && new Date(me.driving_license_expires_at) < new Date());
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const docRows = (docs?.results || (Array.isArray(docs) ? docs : [])).map((d) => `<tr>
<td class="py-4 pr-4 font-label-md font-bold text-on-surface">${esc(d.name)}<br/><span class="font-body-sm text-on-surface-variant font-normal">${DOC_TYPES[d.doc_type] || d.doc_type}</span></td>
<td class="py-4 pr-4 text-on-surface-variant">${[d.issued_place ? `Établi : ${esc(d.issued_place)}` : '', d.validity ? `Validité : ${d.validity}` : ''].filter(Boolean).join('<br/>') || 'Document enregistré'}</td>
<td class="py-4 pr-4">${badge(true, 'ENREGISTRÉ')}</td>
<td class="py-4"><div class="flex gap-1">
${viewBtn(d.file)}
<button type="button" class="doc-edit w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex items-center justify-center" title="Modifier" data-id="${d.id}"><span class="material-symbols-outlined text-[17px]">edit</span></button>
<button type="button" class="doc-del w-8 h-8 rounded-lg hover:bg-error-container text-on-error-container inline-flex items-center justify-center" title="Supprimer" data-id="${d.id}"><span class="material-symbols-outlined text-[17px]">delete</span></button>
</div></td></tr>`).join('');
    const docTable = `<div class="overflow-x-auto"><table class="w-full font-body-sm text-body-sm">
<thead><tr class="text-left font-label-sm text-label-sm text-on-surface-variant border-b border-surface-container">
<th class="py-3 pr-4">Document</th><th class="py-3 pr-4">Détails</th><th class="py-3 pr-4">Statut</th><th class="py-3">Actions</th></tr></thead>
<tbody class="divide-y divide-surface-container">
<tr><td class="py-4 pr-4 font-label-md font-bold text-on-surface">Pièce d'Identité Officielle<br/><span class="font-body-sm text-on-surface-variant font-normal">CNI ou Passeport CEMAC</span></td>
<td class="py-4 pr-4 text-on-surface-variant">${me.id_document ? 'Document transmis' : 'Non fourni'}</td>
<td class="py-4 pr-4">${badge(!!me.id_document_verified, me.id_document_verified ? 'VALIDÉ' : me.id_document ? 'EN VÉRIFICATION' : 'À FOURNIR')}</td>
<td class="py-4"><div class="flex gap-1">${viewBtn(me.id_document)}${upBtn('id_document')}${me.id_document ? delBtn('id_document') : ''}</div></td></tr>
<tr><td class="py-4 pr-4 font-label-md font-bold text-on-surface">Permis de Conduire (Cat. B)<br/><span class="font-body-sm text-on-surface-variant font-normal">Sans chauffeur</span></td>
<td class="py-4 pr-4 text-on-surface-variant">${me.driving_license ? `Expiration : ${me.driving_license_expires_at || '—'}` : 'Non fourni'}</td>
<td class="py-4 pr-4">${badge(!!licOk, me.driving_license ? (!licOk ? 'À RENOUVELER' : (me.kyc_status === 'approved' ? 'VALIDÉ' : 'EN VÉRIFICATION')) : 'À FOURNIR')}</td>
<td class="py-4"><div class="flex gap-1">${viewBtn(me.driving_license)}${upBtn('driving_license')}${me.driving_license ? delBtn('driving_license') : ''}</div></td></tr>
<tr><td class="py-4 pr-4 font-label-md font-bold text-on-surface">Justificatif de Domicile<br/><span class="font-body-sm text-on-surface-variant font-normal">Facture ou attestation</span></td>
<td class="py-4 pr-4 text-on-surface-variant">${me.address_proof ? 'Document transmis' : 'Non fourni'}</td>
<td class="py-4 pr-4">${badge(!!me.address_proof, me.address_proof ? (me.kyc_status === 'approved' ? 'VALIDÉ' : 'EN VÉRIFICATION') : 'À FOURNIR')}</td>
<td class="py-4"><div class="flex gap-1">${viewBtn(me.address_proof)}${upBtn('address_proof')}${me.address_proof ? delBtn('address_proof') : ''}</div></td></tr>
<tr><td class="py-4 pr-4 font-label-md font-bold text-on-surface">Assurance Complémentaire<br/><span class="font-body-sm text-on-surface-variant font-normal">Responsabilité civile</span></td>
<td class="py-4 pr-4 text-on-surface-variant">${me.insurance ? 'Document transmis' : 'Non fourni'}</td>
<td class="py-4 pr-4">${badge(!!me.insurance, me.insurance ? (me.kyc_status === 'approved' ? 'VALIDÉ' : 'EN VÉRIFICATION') : 'À FOURNIR')}</td>
<td class="py-4"><div class="flex gap-1">${viewBtn(me.insurance)}${upBtn('insurance')}${me.insurance ? delBtn('insurance') : ''}</div></td></tr>
${docRows}
</tbody></table></div><input id="doc-file" type="file" accept="image/*,.pdf" style="display:none"/>`;
    return HTML
      .replace(/<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">[\s\S]*?<\/div>(?=\s*<!-- Security)/, docTable)
      .replace(/>\s*EK\s*</, `>${me.avatar ? `<img src="${me.avatar}" alt="" class="w-full h-full object-cover rounded-2xl"/>` : init}<`)
      .replace('MTN MoMo lié', { mtn: 'MTN MoMo lié', orange: 'Orange Money lié', card: 'Carte bancaire liée' }[me.payment_method] || 'Aucun paiement lié')
      .replace('Emmanuel Kouam', name)
      .replace('emmanuel.k@gmail.com', me.email || '')
      .replace('Client AutoLink', roleLabel)
      .replace('+237 670 42 18 90', me.phone || '—')
      .replace('Identité vérifiée', me.is_verified || me.kyc_status === 'approved' ? 'Identité vérifiée' : 'Identité non vérifiée')
      // Statuts réels des documents KYC
      .replace(/>VALIDÉ</, `>${me.id_document_verified ? 'VALIDÉ' : (STATUS_TEXT[me.kyc_status] || 'À FOURNIR')}<`)
      .replace(/À RENOUVELER \(15j\)/, me.driving_license
        ? (me.driving_license_expires_at && new Date(me.driving_license_expires_at) < new Date() ? 'À RENOUVELER' : 'VALIDÉ')
        : (STATUS_TEXT[me.kyc_status] === 'VALIDÉ' ? 'À FOURNIR' : (STATUS_TEXT[me.kyc_status] || 'À FOURNIR')))
      .replace('12 Novembre 2025', me.driving_license_expires_at || '—')
      .replace('Numéro :\n            </span>\n            <span class="font-label-md text-label-md font-bold text-on-surface">102938472 (Douala)</span>',
               me.id_document ? 'Document transmis</span>' : 'Numéro :</span></span><span class="font-label-md text-label-md font-bold text-on-surface">Non fourni</span>');
  }, [me, docs]);

  useEffect(() => {
    const click = (e) => {
      if (e.target.closest('#edit-profile')) setEditing(true);
      if (e.target.closest('#lic-upload-btn')) document.getElementById('lic-upload-input')?.click();
      const up = e.target.closest('.doc-upload');
      if (up) { setDocField(up.dataset.field); }
      if (e.target.closest('#add-doc-btn')) { setDocEdit(null); setDocErr(''); setDocOpen(true); }
      const ed = e.target.closest('.doc-edit');
      if (ed) {
        const d = (docs?.results || (Array.isArray(docs) ? docs : [])).find((x) => String(x.id) === ed.dataset.id);
        if (d) { setDocEdit(d); setDocErr(''); setDocOpen(true); }
      }
      const del = e.target.closest('.doc-del');
      if (del && window.confirm('Supprimer ce document ?')) {
        documentsAPI.delete(del.dataset.id).then(() => window.location.reload()).catch(() => {});
      }
      const delf = e.target.closest('.doc-del-field');
      if (delf && window.confirm('Supprimer ce document ?')) {
        kycAPI.remove(delf.dataset.field).then(() => window.location.reload()).catch(() => {});
      }
    };
    const change = (e) => {
      if (e.target.id === 'doc-file' && e.target.files?.[0]) {
        const fd = new FormData();
        fd.append(window._docField || 'id_document', e.target.files[0]);
        kycAPI.upload(fd).then(() => window.location.reload()).catch(() => {
          // eslint-disable-next-line no-alert
          alert("Échec de l'envoi du document (format JPG/PNG/PDF, ≤ 8 Mo).");
        });
        e.target.value = '';
        return;
      }
      if (e.target.id !== 'lic-upload-input' || !e.target.files?.[0]) return;
      const fd = new FormData();
      fd.append('driving_license', e.target.files[0]);
      kycAPI.upload(fd).then(() => window.location.reload()).catch(() => {
        // eslint-disable-next-line no-alert
        alert("Échec de l'envoi du document (format JPG/PNG/PDF, ≤ 8 Mo).");
      });
    };
    document.addEventListener('click', click);
    document.addEventListener('change', change);
    return () => { document.removeEventListener('click', click); document.removeEventListener('change', change); };
  }, [docs]);
  if (editing) {
    const save = (e) => {
      e.preventDefault();
      const f = e.target;
      const fd = new FormData();
      ['first_name', 'last_name', 'phone', 'whatsapp', 'email', 'payment_method', 'payment_phone'].forEach((k) => { if (f[k]?.value) fd.append(k, f[k].value); });
      if (photo) fd.append('avatar', photo);
      setSaving(true); setErr('');
      usersAPI.updateMe(fd)
        .then((res) => {
          if (res?.data) localStorage.setItem('autolink_user', JSON.stringify(res.data));
          window.location.reload();
        })
        .catch((er) => {
          const d = er?.response?.data || {};
          setErr(d.email?.[0] || d.detail || 'Échec de l\'enregistrement.');
          setSaving(false);
        });
    };
    const F = ({ name, label, type = 'text', value }) => (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={name} className="font-label-md text-label-md text-on-surface-variant">{label}</label>
        <input id={name} name={name} type={type} defaultValue={value || ''} className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
      </div>
    );
    return (
      <Shell role={role}>
        <form onSubmit={save} className="max-w-2xl mx-auto w-full p-6 flex flex-col gap-5">
          <button type="button" onClick={() => setEditing(false)} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Retour au profil</button>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Modifier mon profil</h2>
          <div className="flex items-center gap-4">
            {me?.avatar || photo ? <img src={photo ? URL.createObjectURL(photo) : me.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
              : <span className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-lg font-bold">{(me?.first_name || '?')[0]}</span>}
            <label className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold cursor-pointer">
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F name="first_name" label="Prénom" value={me?.first_name} />
            <F name="last_name" label="Nom" value={me?.last_name} />
            <F name="email" label="Email (identifiant de connexion)" type="email" value={me?.email} />
            <F name="phone" label="Téléphone" value={me?.phone} />
            <F name="whatsapp" label="WhatsApp" value={me?.whatsapp} />
            <F name="payment_phone" label="N° MoMo / Orange / Carte bancaire lié" value={me?.payment_phone} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="payment_method" className="font-label-md text-label-md text-on-surface-variant">Moyen de paiement lié</label>
              <select id="payment_method" name="payment_method" defaultValue={me?.payment_method || ''} className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary">
                <option value="">— Aucun —</option><option value="mtn">MTN MoMo</option><option value="orange">Orange Money</option><option value="card">Carte bancaire</option>
              </select>
            </div>
          </div>
          {err && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{err}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </Shell>
    );
  }
  return (
    <>
      <DesignPage html={html} links={LINKS} role={role} />
      {docOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDocOpen(false); }}>
          <form className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl" onSubmit={(e) => {
            e.preventDefault();
            const f = e.target;
            const fd = new FormData();
            fd.append('name', f.doc_name.value.trim());
            fd.append('doc_type', f.doc_type.value);
            if (f.issued_place.value.trim()) fd.append('issued_place', f.issued_place.value.trim());
            if (f.validity.value) fd.append('validity', f.validity.value);
            if (f.doc_file.files?.[0]) fd.append('file', f.doc_file.files[0]);
            if (!docEdit && !f.doc_file.files?.[0]) { setDocErr('Ajoutez le fichier du document.'); return; }
            setDocBusy(true); setDocErr('');
            (docEdit ? documentsAPI.update(docEdit.id, fd) : documentsAPI.create(fd))
              .then(() => window.location.reload())
              .catch((er) => { setDocErr(er?.response?.data?.name?.[0] || er?.response?.data?.file?.[0] || "Échec de l'enregistrement."); setDocBusy(false); });
          }}>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{docEdit ? 'Modifier le document' : 'Ajouter un document'}</h2>
            <input name="doc_name" required defaultValue={docEdit?.name || ''} placeholder="Nom du document (ex : Attestation d'hébergement)"
              className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
            <select name="doc_type" defaultValue={docEdit?.doc_type || 'other'} className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary">
              {Object.entries(DOC_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <input name="issued_place" defaultValue={docEdit?.issued_place || ''} placeholder="Lieu d'établissement (ville, organisme…)"
              className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
            <div className="flex flex-col gap-1">
              <label htmlFor="doc-validity" className="font-label-sm text-label-sm text-on-surface-variant">Date de validité (optionnel)</label>
              <input id="doc-validity" name="validity" type="date" defaultValue={docEdit?.validity || ''}
                className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="doc-upload" className="font-label-sm text-label-sm text-on-surface-variant">Fichier du document {docEdit ? '(laisser vide pour conserver)' : ''}</label>
              <input id="doc-upload" name="doc_file" type="file" accept="image/*,.pdf" className="font-body-sm text-on-surface" />
            </div>
            {docErr && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{docErr}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setDocOpen(false)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
              <button type="submit" disabled={docBusy} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{docBusy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}
      {docField && (
        <div className="fixed inset-0 z-[90] bg-black/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setDocField(null); }}>
          <form className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl" onSubmit={(e) => {
            e.preventDefault();
            const f = e.target;
            const fd = new FormData();
            if (f.kyc_file.files?.[0]) fd.append(docField, f.kyc_file.files[0]);
            if (docField === 'driving_license' && f.kyc_validity.value) fd.append('driving_license_expires_at', f.kyc_validity.value);
            if (!f.kyc_file.files?.[0] && !(docField === 'driving_license' && f.kyc_validity.value)) { setDocErr('Choisissez un fichier ou modifiez la validité.'); return; }
            setDocBusy(true); setDocErr('');
            kycAPI.upload(fd)
              .then(() => window.location.reload())
              .catch((er) => { setDocErr(er?.response?.data?.detail || er?.response?.data?.non_field_errors?.[0] || "Échec de l'enregistrement."); setDocBusy(false); });
          }}>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Modifier — {FIELD_LABELS[docField]}</h2>
            {me?.[docField] && <a href={me[docField]} target="_blank" rel="noreferrer" className="font-label-md text-label-md text-primary underline inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span>Voir le document actuel</a>}
            {docField === 'driving_license' && (
              <div className="flex flex-col gap-1">
                <label htmlFor="kyc-validity" className="font-label-sm text-label-sm text-on-surface-variant">Date d'expiration</label>
                <input id="kyc-validity" name="kyc_validity" type="date" defaultValue={me?.driving_license_expires_at || ''} className="px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:ring-2 focus:ring-primary" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label htmlFor="kyc-file" className="font-label-sm text-label-sm text-on-surface-variant">Nouveau fichier</label>
              <input id="kyc-file" name="kyc_file" type="file" accept="image/*,.pdf" className="font-body-sm text-on-surface" />
            </div>
            {docErr && <p role="alert" className="p-3 rounded-lg bg-error-container text-on-error-container font-label-md">{docErr}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setDocField(null)} className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md font-bold">Annuler</button>
              <button type="submit" disabled={docBusy} className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-bold disabled:opacity-60">{docBusy ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export { HTML, LINKS };
