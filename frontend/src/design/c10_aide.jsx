import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full pb-16 max-w-[1100px] mx-auto">
<!-- Header -->
<div class="flex flex-col gap-2 mb-6">
<h1 class="font-headline-xl text-headline-xl text-on-surface">Comment pouvons-nous vous aider ?</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Trouvez une réponse immédiate : réservations, caution, Mobile Money, documents — ou contactez notre équipe à Douala & Yaoundé.</p>
</div>
<!-- Recherche FAQ -->
<div class="relative mb-6">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input class="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="Rechercher une question (caution, réservation, chauffeur…)" type="text"/>
</div>
<!-- Catégories -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
<button class="px-4 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm">Toutes les catégories</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Réservation & Véhicules</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Paiement & Caution</button>
<button class="px-4 py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md transition-colors">Assistance & Sécurité</button>
</div>
<!-- FAQ accordéons -->
<div class="bg-surface-container-lowest rounded-2xl shadow-sm divide-y divide-outline-variant/30 mb-8">
<div class="faq-item" data-cat="reservation"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quel est le délai minimum pour réserver un véhicule ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Vous pouvez réserver jusqu'à 2 heures avant le départ pour les formules courtes (3h/8h/24h). Pour une location Longue durée ou Interurbain avec chauffeur, réservez de préférence 24h à l'avance afin de garantir la disponibilité du véhicule et du chauffeur certifié.</p></div></div>
<div class="faq-item" data-cat="reservation"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Est-ce que le prix affiché varie entre Douala et Yaoundé ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Non. Le tarif journalier affiché sur la fiche véhicule est identique à Douala et à Yaoundé. Seuls peuvent s'ajouter les options choisies (chauffeur certifié +10 000 FCFA/24h, livraison aéroport +5 000 FCFA) ou une livraison hors zone standard.</p></div></div>
<div class="faq-item" data-cat="reservation"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Comment fonctionne l'option avec chauffeur certifié ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">L'option « Avec chauffeur » ajoute un chauffeur professionnel certifié AutoLink Pro, bilingue FR/EN, pour +10 000 FCFA par tranche de 24h. Vous êtes uniquement passager : aucun permis n'est requis de votre part et la responsabilité de conduite incombe au chauffeur.</p></div></div>
<div class="faq-item" data-cat="paiement"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Comment recharger mon portefeuille avec MTN/Orange Money ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Allez dans Portefeuille → « Recharger mon portefeuille », choisissez MTN Mobile Money ou Orange Money, saisissez le numéro à débiter et le montant (minimum 500 FCFA). Validez la demande USSD reçue sur votre téléphone : le solde est crédité immédiatement.</p></div></div>
<div class="faq-item" data-cat="paiement"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quand ma caution est-elle débloquée après la location ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">La caution reste bloquée sous séquestre pendant toute la location. Elle est restituée intégralement sous 24 à 72h ouvrées après le check-out, dès que l'inspection du véhicule confirme l'absence de dommage ou de litige en cours.</p></div></div>
<div class="faq-item" data-cat="assistance"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Quels documents dois-je fournir pour débloquer mon compte ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Pour prendre le volant : une pièce d'identité (CNI camerounaise ou passeport) et un permis de conduire B valide au Cameroun (recto-verso). Téléversez-les depuis Profil → Documents ou directement à l'étape « Récapitulatif & Documents » de votre réservation.</p></div></div>
<div class="faq-item" data-cat="assistance"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Que faire si mon véhicule tombe en panne pendant la location ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Contactez immédiatement le standard 24h/24 au +237 699 456 123. L'assistance dépêche un dépanneur partenaire — le remorquage est couvert par l'assurance Activa incluse. Si le véhicule est immobilisé, un véhicule de remplacement vous est proposé ou la location est remboursée au prorata.</p></div></div>
<div class="faq-item" data-cat="reservation"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Puis-je modifier ou annuler ma réservation gratuitement ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Oui. Les réservations « À venir » se modifient (dates, options, véhicule) ou s'annulent gratuitement jusqu'à 48h avant le départ, depuis Mes Réservations → Modifier / Annuler. Sous 48h, des frais peuvent s'appliquer ; le remboursement est crédité directement sur votre portefeuille.</p></div></div>
<div class="faq-item" data-cat="reservation"><div class="faq-q flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-container-low transition-colors"><span class="font-label-md text-label-md font-semibold text-on-surface">Les véhicules sont-ils équipés pour les trajets interurbains ?</span><span class="material-symbols-outlined text-outline faq-arrow">expand_more</span></div><div class="faq-a hidden px-5 pb-4 -mt-1"><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Oui. Tous les véhicules du catalogue sont inspectés pour les longs trajets (axe Douala–Yaoundé et liaisons nationales). Choisissez la formule « Interurbain » : kilométrage élargi inclus ; l'option chauffeur est fortement recommandée pour ces trajets.</p></div></div>
</div>
<!-- Canaux d'assistance -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary"><span class="material-symbols-outlined text-[22px]">call</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Appeler le standard — 24h/24</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Urgences route, pannes et retards.</span>
<a href="tel:+237699456123" class="font-label-md text-label-md text-primary font-bold hover:underline">+237 699 456 123</a>
<a href="tel:+237656789000" class="font-label-md text-label-md text-primary font-bold hover:underline">+237 656 789 000</a>
</div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600"><span class="material-symbols-outlined text-[22px]">chat</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">WhatsApp Business</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Réponse moyenne en moins de 10 min, 7j/7 de 7h à 22h.</span>
<a href="https://wa.me/237699456123" target="_blank" rel="noreferrer" class="font-label-md text-label-md text-green-600 font-bold hover:underline">Démarrer sur WhatsApp</a>
</div>
<div class="bg-surface-container-lowest rounded-2xl p-5 shadow-sm flex flex-col gap-2">
<div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800"><span class="material-symbols-outlined text-[22px]">location_on</span></div>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Nos agences</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Douala — Bonanjo, Av. de Gaulle<br>Yaoundé — Bastos, Rue 1.739<br>Lun–Sam : 8h–18h</span>
</div>
</div>
<!-- Formulaire de contact -->
<div class="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-1">Envoyez-nous un message</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-5">Réponse sous 24 h ouvrées · support@autolinkpro.cm · +237 656 789 000</p>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Nom complet *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" value="Emmanuel Ndedi" type="text"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Numéro de téléphone *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="+237 6XX XX XX XX" type="tel"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Adresse e-mail *</span><input class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="votre@email.com" type="email"/></label>
<label class="flex flex-col gap-1"><span class="font-label-sm text-label-sm text-on-surface-variant">Sujet de la demande *</span><select class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none cursor-pointer"><option>Réservation</option><option>Paiement & Caution</option><option>Documents & Profil</option><option>Litige / Réclamation</option><option>Autre</option></select></label>
</div>
<label class="flex flex-col gap-1 mb-5"><span class="font-label-sm text-label-sm text-on-surface-variant">Votre message *</span><textarea class="px-3 py-2.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary min-h-[110px] resize-y" placeholder="Décrivez votre demande ou votre problème en quelques lignes…"></textarea></label>
<button class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md transition-all" type="button">
<span class="material-symbols-outlined text-[18px]">send</span>Envoyer le message
</button>
</div>
</div>`;
const LINKS = { 'Démarrer sur WhatsApp': 'https://wa.me/237699456123' };

export default function C10Aide() {
  React.useEffect(() => {
    // Accordéons : délégation — le DOM est ré-injecté par DesignPage à chaque rendu
    const faqClick = (e) => {
      const el = e.target.closest('.faq-q');
      if (!el) return;
      const body = el.parentElement.querySelector('.faq-a');
      const arrow = el.querySelector('.faq-arrow');
      const hid = body.classList.toggle('hidden');
      if (arrow) arrow.textContent = hid ? 'expand_more' : 'expand_less';
    };
    document.addEventListener('click', faqClick);
    // Catégories -> data-cat
    const catKey = { 'réservation': 'reservation', 'reservation': 'reservation', 'paiement': 'paiement', 'payment': 'paiement', 'assistance': 'assistance', 'sécurité': 'assistance', 'security': 'assistance' };
    const cats = [...document.querySelectorAll('button')].filter((b) => /catégorie|Réservation|Paiement|Assistance/i.test(b.textContent));
    const q = document.querySelector('input[placeholder*="Rechercher"]');
    const apply = () => {
      const act = (cats.find((b) => b.classList.contains('bg-primary'))?.textContent || 'Toutes').trim();
      const actKey = act === 'Toutes' || /toutes/i.test(act) ? '' : Object.keys(catKey).find((k) => act.toLowerCase().includes(k));
      const term = (q?.value || '').toLowerCase();
      document.querySelectorAll('.faq-item').forEach((f) => {
        const okQ = !term || f.textContent.toLowerCase().includes(term);
        const okC = !actKey || (f.dataset.cat || '') === catKey[actKey];
        f.style.display = okQ && okC ? '' : 'none';
      });
    };
    cats.forEach((b) => b.addEventListener('click', () => { cats.forEach((x) => { x.classList.remove('bg-primary', 'text-on-primary'); x.classList.add('bg-surface-container-lowest', 'text-on-surface-variant'); }); b.classList.add('bg-primary', 'text-on-primary'); b.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant'); apply(); }));
    q?.addEventListener('input', apply);
    // Appels / WhatsApp
    document.querySelectorAll('a[href^="tel:"], a[href="#"]').forEach(() => {});
    const callBtn = [...document.querySelectorAll('a, button')].find((b) => /699 456 123|Appeler le standard/i.test(b.textContent));
    if (callBtn && callBtn.tagName !== 'A') callBtn.closest('div')?.addEventListener('click', () => { window.location.href = 'tel:+237699456123'; });
    const waBtn = [...document.querySelectorAll('a, button')].find((b) => /WhatsApp/i.test(b.textContent));
    if (waBtn) {
      if (waBtn.tagName === 'A') { waBtn.href = 'https://wa.me/237699456123'; waBtn.target = '_blank'; }
      else waBtn.addEventListener('click', () => window.open('https://wa.me/237699456123', '_blank'));
    }
    // Valeurs capturées en direct — le DOM peut être ré-injecté entre saisie et clic
    const vals = { nom: '', tel: '', email: '', sujet: '', msg: '' };
    const track = (e) => {
      const el = e.target;
      if (el.tagName === 'TEXTAREA') vals.msg = el.value;
      else if (el.tagName === 'SELECT') vals.sujet = el.value;
      else if (el.tagName === 'INPUT') {
        if (el.type === 'email') vals.email = el.value;
        else if (el.type === 'tel') vals.tel = el.value;
        else vals.nom = el.value;
      }
    };
    document.addEventListener('input', track);
    document.addEventListener('change', track);
    // Formulaire de contact -> contactAPI.send (délégué — le DOM est ré-injecté)
    const sendClick = async (e) => {
      const send = e.target.closest('button');
      if (!send || !send.textContent.includes('Envoyer le message')) return;
      e.preventDefault();
      let form = send.parentElement;
      while (form && !form.querySelector('textarea')) form = form.parentElement;
      if (!form) form = document;
      const ins = [...form.querySelectorAll('input')]; const ta = form.querySelector('textarea');
      const sel = form.querySelector('select');
      const [nom, tel, email] = ins.map((i, idx) => (i.value.trim() || [vals.nom, vals.tel, vals.email][idx]));
      const msg = (ta?.value.trim() || vals.msg).trim();
      if (!email || !msg) {
        const missing = !email ? 'Adresse e-mail requise' : 'Votre message est requis';
        send.textContent = missing;
        const bad = !email ? ins[2] : ta;
        if (bad) { bad.classList.add('ring-2', 'ring-error'); setTimeout(() => bad.classList.remove('ring-2', 'ring-error'), 2500); }
        setTimeout(() => { send.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span>Envoyer le message'; }, 2000);
        return;
      }
      send.disabled = true; send.textContent = 'Envoi…';
      const parts = nom.split(/\s+/).filter(Boolean);
      const sujet = sel?.value || vals.sujet || 'Autre';
      try {
        const { contactAPI } = await import('../services/api');
        await contactAPI.send({
          first_name: parts[0] || 'Client',
          last_name: parts.slice(1).join(' ') || parts[0] || 'AutoLink',
          email, phone: tel,
          rental_type: sujet,
          message: `[${sujet}] ${msg}`,
        });
        send.textContent = 'Message envoyé !'; if (ta) ta.value = '';
        if (!form.querySelector('.msg-ok')) {
          const p = document.createElement('p');
          p.className = 'msg-ok font-label-md text-label-md text-primary font-bold mt-2';
          p.textContent = 'Votre message a bien été transmis au support — réponse sous 24 h ouvrées.';
          send.parentElement.appendChild(p);
        }
        setTimeout(() => { send.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span>Envoyer le message'; send.disabled = false; }, 2500);
      } catch (_e) { send.textContent = 'Erreur — réessayez'; setTimeout(() => { send.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span>Envoyer le message'; send.disabled = false; }, 2500); }
    };
    document.addEventListener('click', sendClick);
    return () => { document.removeEventListener('click', faqClick); document.removeEventListener('click', sendClick); document.removeEventListener('input', track); document.removeEventListener('change', track); };
  }, []);
  return <DesignPage html={HTML} links={LINKS} />;
}
