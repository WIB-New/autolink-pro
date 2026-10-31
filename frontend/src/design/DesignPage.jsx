import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DesignShell from './DesignShell';

// Page maquette : HTML Stitch injecté dans DesignShell.
// - `links` : { 'Texte bouton': '/route' | 'modal' | 'close-modal' }
// - interactions génériques reproduisant les micro-scripts du design :
//   onglets/filtres, montants, suppression favoris, compteur comparaison,
//   copie presse-papier, réponses rapides + envoi de message, téléchargements.
export default function DesignPage({ html, links = {}, modalHtml = null, role = 'client' }) {
  const ref = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (modalHtml && new URLSearchParams(location.search).get('recharge') === '1') setModalOpen(true);
  }, [modalHtml, location.search]);

  const wire = (root) => {
    const cleanups = [];
    const on = (el, fn) => {
      el.addEventListener('click', fn);
      cleanups.push(() => el.removeEventListener('click', fn));
    };
    // Texte visible SANS les noms des icônes Material Symbols
    const text = (el) => {
      const c = el.cloneNode(true);
      c.querySelectorAll('.material-symbols-outlined').forEach((s) => s.remove());
      return c.textContent.replace(/\s+/g, ' ').trim();
    };

    // Les handlers inline Stitch (onclick="selectAmount(...)") cassent -> on les retire
    root.querySelectorAll('[onclick],[onchange],[oninput]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('onchange');
      el.removeAttribute('oninput');
    });

    // 1) Ancres mortes neutralisées
    root.querySelectorAll('a[href="#"], a[href=""]').forEach((a) => on(a, (e) => e.preventDefault()));

    // 2) Liens de navigation mappés par texte (clés les plus longues d'abord)
    const entries = Object.entries(links).sort((a, b) => b[0].length - a[0].length);
    root.querySelectorAll('a, button').forEach((el) => {
      const t = text(el);
      for (const [key, target] of entries) {
        if (t === key || t.includes(key)) {
          el.style.cursor = 'pointer';
          on(el, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (target === 'modal') setModalOpen(true);
            else if (target === 'close-modal') setModalOpen(false);
            else navigate(target);
          });
          return;
        }
      }
    });

    // 2b) Bouton croix / Fermer de la modale -> ferme
    root.querySelectorAll('button').forEach((el) => {
      const icon = el.querySelector('.material-symbols-outlined');
      if (icon && icon.textContent.trim() === 'close') on(el, () => setModalOpen(false));
      if (text(el) === 'Annuler' && modalRef.current && modalRef.current.contains(el)) {
        on(el, () => setModalOpen(false));
      }
    });

    // 2c) Modale rechargement : "Continuer vers la validation" -> simulation USSD puis succès
    root.querySelectorAll('button').forEach((el) => {
      if (text(el).includes('Continuer vers la validation')) {
        on(el, () => {
          el.disabled = true;
          el.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span><span>Prompt USSD envoyé au +237 670 •• •• 90...</span>';
          setTimeout(() => {
            el.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span><span>Paiement approuvé par Mobile Money !</span>';
            setTimeout(() => { setModalOpen(false); }, 1600);
          }, 1800);
        });
      }
      // "Recharger maintenant" (C5 inline) -> même simulation puis modale fermée si ouverte
      if (text(el).includes('Recharger maintenant')) {
        on(el, () => {
          el.disabled = true;
          const orig = el.innerHTML;
          el.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Demande USSD envoyée...</span>';
          setTimeout(() => {
            el.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span><span>Approuvé par Mobile Money !</span>';
            setTimeout(() => { el.innerHTML = orig; el.disabled = false; }, 2200);
          }, 1500);
        });
      }
    });

    // 2d) Sélection du moyen de paiement : coche à GAUCHE (radio), anneau sur la carte choisie
    const radios = root.querySelectorAll('input[type="radio"][name*="payment_method"],input[type="radio"][name*="recharge_method"],input[type="radio"][name*="escrow_source"]');
    const syncRadios = () => {
      radios.forEach((r) => {
        const card = r.closest('label');
        if (!card) return;
        card.classList.toggle('ring-2', r.checked);
        card.classList.toggle('ring-primary', r.checked);
        // Icône décorative à droite : check si sélectionné, sinon icône vide
        const icon = card.querySelector('.material-symbols-outlined:last-child, span:last-child.material-symbols-outlined');
        if (icon && ['check', 'radio_button_unchecked'].includes(icon.textContent.trim())) {
          icon.textContent = r.checked ? 'check' : 'radio_button_unchecked';
          icon.classList.toggle('text-primary', r.checked);
          icon.classList.toggle('text-outline', !r.checked);
          icon.style.opacity = '1';
        }
      });
    };
    radios.forEach((r) => { r.addEventListener('change', syncRadios); cleanups.push(() => r.removeEventListener('change', syncRadios)); });
    if (radios.length) syncRadios();

    // 2e) Messagerie : Tous / Réservations / Support filtrent la liste des conversations
    root.querySelectorAll('button').forEach((btn) => {
      const t = text(btn);
      if (['Tous', 'Réservations', 'Support'].includes(t)) {
        on(btn, () => {
          const group = [...btn.parentElement.querySelectorAll('button')];
          group.forEach((b) => {
            b.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
            b.classList.add('text-on-surface-variant');
          });
          btn.classList.add('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
          btn.classList.remove('text-on-surface-variant');
          // Filtrer les conversations : un support = Hub/Conciergerie, réservation = avec véhicule
          const list = btn.closest('.flex-col')?.parentElement?.querySelector('.overflow-y-auto');
          const items = list ? list.querySelectorAll(':scope > div') : [];
          items.forEach((item) => {
            const it = item.textContent;
            const isSupport = /Hub|Conciergerie|Support/i.test(it);
            const show = t === 'Tous' || (t === 'Support' && isSupport) || (t === 'Réservations' && !isSupport);
            item.style.display = show ? '' : 'none';
          });
        });
      }
      // Filtre par rôles : Tous / Clients / Chauffeurs / Propriétaires / Support
      if (['Tous', 'Clients', 'Chauffeurs', 'Propriétaires', 'Support'].includes(t)) {
        const parent = btn.parentElement;
        if (parent && parent.querySelectorAll('button').length === 5) {
          on(btn, () => {
            const group = [...parent.querySelectorAll('button')];
            group.forEach((b) => {
              b.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
              b.classList.add('text-on-surface-variant');
            });
            btn.classList.add('bg-surface-container-lowest', 'text-on-surface', 'font-semibold', 'shadow-sm');
            btn.classList.remove('text-on-surface-variant');
            // Filtrer par rôle dans la liste des conversations
            const list = btn.closest('.flex-col')?.parentElement?.querySelector('.overflow-y-auto');
            const items = list ? list.querySelectorAll(':scope > div') : [];
            items.forEach((item) => {
              const it = item.textContent;
              const isClient = /Client|Emmanuel|Jean-Pierre Mbida/i.test(it);
              const isDriver = /Chauffeur|Mbida|Jean-Pierre/i.test(it);
              const isOwner = /Propriétaire|Marc T\./i.test(it);
              const isSupport = /Hub|Conciergerie|Support|AutoLink/i.test(it);
              let show = t === 'Tous';
              if (t === 'Clients') show = isClient;
              if (t === 'Chauffeurs') show = isDriver;
              if (t === 'Propriétaires') show = isOwner;
              if (t === 'Support') show = isSupport;
              item.style.display = show ? '' : 'none';
            });
          });
        }
      }
    });

    // 2f) Notifications C8 : filtres, marquer lu / tout lire, archiver, compteur, état vide
    if (root.querySelector('.notification-card')) {
      const cards = () => [...root.querySelectorAll('.notification-card')];
      const counter = root.querySelector('#unread-counter');
      const empty = root.querySelector('#empty-state');
      let current = 'unread';
      const countUnread = () => {
        const n = root.querySelectorAll('.notification-card[data-status="unread"]').length;
        if (counter) counter.textContent = n;
        const pill = root.querySelector('[data-filter="unread"] span');
        if (pill) pill.textContent = n;
      };
      const markRead = (card) => {
        card.setAttribute('data-status', 'read');
        card.classList.remove('bg-surface-container-low');
        card.classList.add('bg-surface-container-lowest');
        const d = card.querySelector('.unread-dot'); if (d) d.remove();
        const b = card.querySelector('.mark-read-toggle'); if (b) b.remove();
      };
      const applyFilter = (f) => {
        current = f;
        let visible = 0;
        cards().forEach((c) => {
          const show = f === 'all' || (f === 'unread' && c.dataset.status === 'unread') || c.dataset.category === f;
          c.classList.toggle('hidden', !show);
          if (show) visible += 1;
        });
        root.querySelectorAll('.timeframe-block').forEach((tf) => {
          tf.classList.toggle('hidden', !tf.querySelector('.notification-card:not(.hidden)'));
        });
        if (empty) { empty.classList.toggle('hidden', visible > 0); empty.classList.toggle('flex', visible === 0); }
      };
      root.querySelectorAll('.filter-tab').forEach((tab) => {
        on(tab, () => {
          root.querySelectorAll('.filter-tab').forEach((t) => {
            t.classList.remove('bg-primary', 'text-on-primary', 'font-semibold', 'shadow-sm');
            t.classList.add('text-on-surface-variant');
          });
          tab.classList.remove('text-on-surface-variant');
          tab.classList.add('bg-primary', 'text-on-primary', 'font-semibold', 'shadow-sm');
          applyFilter(tab.dataset.filter);
        });
      });
      root.querySelectorAll('.mark-read-toggle').forEach((b) => {
        on(b, (e) => { e.stopPropagation(); const c = b.closest('.notification-card'); if (c) { markRead(c); countUnread(); if (current === 'unread') applyFilter('unread'); } });
      });
      root.querySelectorAll('.archive-btn').forEach((b) => {
        on(b, (e) => {
          e.stopPropagation();
          const c = b.closest('.notification-card');
          if (!c) return;
          c.style.cssText += ';opacity:0;transform:scale(.98)';
          setTimeout(() => { c.remove(); countUnread(); applyFilter(current); }, 180);
        });
      });
      const allRead = root.querySelector('#mark-all-read-btn');
      if (allRead) on(allRead, () => { cards().forEach((c) => { if (c.dataset.status === 'unread') markRead(c); }); countUnread(); if (current === 'unread') applyFilter('unread'); });
      const reset = root.querySelector('[data-reset-filter]');
      if (reset) on(reset, () => root.querySelector('[data-filter="all"]')?.click());
      applyFilter('unread');
    }

    // 2g) Menus "trois points" (more_vert) -> liste d'options cliquables
    root.querySelectorAll('button').forEach((btn) => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (!icon || icon.textContent.trim() !== 'more_vert') return;
      if (icon.parentElement !== btn || btn.children.length > 1) return;
      on(btn, (e) => {
        e.preventDefault(); e.stopPropagation();
        const prev = root.querySelector('.dp-ctx-menu'); if (prev) { prev.remove(); return; }
        const menu = document.createElement('div');
        menu.className = 'dp-ctx-menu absolute right-0 z-[90] w-56 bg-surface-container-lowest rounded-xl shadow-elevation-3 border border-outline-variant/30 py-1.5';
        menu.style.top = 'calc(100% + 6px)';
        const opts = [
          ['visibility', role === 'driver' ? 'Voir la course' : 'Voir le dossier', role === 'driver' ? '/driver/dashboard' : '/client/bookings/1'],
          ['chat_bubble', 'Ouvrir la conversation', role === 'driver' ? '/driver/messages' : '/messages'],
          ['archive', 'Archiver le dossier', null],
          ['flag', 'Signaler un problème', '/help'],
        ];
        opts.forEach(([ic, label, to]) => {
          const b = document.createElement('button');
          b.className = 'flex items-center gap-2.5 w-full px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors';
          b.innerHTML = `<span class="material-symbols-outlined text-[18px]">${ic}</span>${label}`;
          b.onclick = (ev) => { ev.stopPropagation(); menu.remove(); if (to) navigate(to); else alert('Action enregistrée (exemple).'); };
          menu.appendChild(b);
        });
        const host = btn.parentElement;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        host.appendChild(menu);
        const close = (ev) => { if (!menu.contains(ev.target) && ev.target !== btn) { menu.remove(); document.removeEventListener('mousedown', close); } };
        setTimeout(() => document.addEventListener('mousedown', close), 0);
      });
    });

    // 3) Onglets / filtres (C3 réservations, C6 favoris, C7 messagerie)
    const activate = (btn, group, onApply) => {
      const siblings = [...group];
      siblings.forEach((b) => {
        b.classList.remove('bg-primary', 'text-on-primary', 'bg-surface-container-lowest', 'text-primary', 'shadow-sm', 'font-semibold');
        b.classList.add('text-on-surface-variant');
      });
      btn.classList.remove('text-on-surface-variant');
      btn.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
      if (onApply) onApply();
    };
    const groups = new Map();
    root.querySelectorAll('[data-tab], .tab-btn, .filter-city-btn, .filter-gamme-btn, #reservation-tabs button, .fav-card button').forEach(() => {});
    root.querySelectorAll('[id$="-tabs"] button, [role="tablist"] button').forEach((btn) => {
      const parent = btn.closest('[id$="-tabs"], [role="tablist"]');
      if (!groups.has(parent)) groups.set(parent, [...parent.querySelectorAll('button')]);
      on(btn, () => activate(btn, groups.get(parent)));
    });
    root.querySelectorAll('.filter-city-btn, .filter-gamme-btn').forEach((btn) => {
      on(btn, () => {
        const scope = btn.classList.contains('filter-city-btn') ? 'city' : 'gamme';
        const value = btn.dataset.city || btn.dataset.gamme || 'all';
        activate(btn, [...root.querySelectorAll(`.filter-${scope}-btn`)]);
        root.querySelectorAll('.fav-card').forEach((card) => {
          const match = value === 'all' || card.dataset[scope] === value;
          card.style.display = match ? '' : 'none';
        });
      });
    });

    // 4) Montants de recharge (pastilles + input personnalisé)
    const fmt = (n) => `${Number(n).toLocaleString('fr-FR')} FCFA`;
    const updateAmount = (val) => {
      const display = root.querySelector('#display-amount'); if (display) display.textContent = val.replace(' FCFA', '');
      const cta = root.querySelector('#cta-amount'); if (cta) cta.textContent = val.replace(' FCFA', '');
      const input = root.querySelector('#custom-amount-input'); if (input) input.value = parseInt(val.replace(/\D/g, ''), 10) || 0;
      const future = root.querySelector('#future-balance');
      if (future && input) future.textContent = fmt(26500 + (parseInt(input.value, 10) || 0));
      root.querySelectorAll('.amount-pill, .amount-btn').forEach((p) => {
        const active = text(p).includes(val.replace(' FCFA', ''));
        p.classList.toggle('bg-primary', active);
        p.classList.toggle('text-on-primary', active);
        p.classList.toggle('bg-surface-container', !active);
        p.classList.toggle('bg-primary-container', false);
      });
    };
    root.querySelectorAll('.amount-pill, .amount-btn').forEach((pill) => {
      on(pill, () => {
        const m = text(pill).match(/([\d\s]+)/);
        if (m) updateAmount(`${m[1].trim()} FCFA`);
        else updateAmount('Autre');
      });
    });
    const customInput = root.querySelector('#custom-amount-input');
    if (customInput) {
      const handler = () => {
        const future = root.querySelector('#future-balance');
        if (future) future.textContent = fmt(26500 + (parseInt(customInput.value, 10) || 0));
        // Désélectionner les boutons prédéfinis quand on tape dans l'input
        root.querySelectorAll('.amount-pill, .amount-btn').forEach((p) => {
          p.classList.remove('bg-primary', 'text-on-primary');
          p.classList.add('bg-surface-container', 'text-on-surface');
        });
      };
      customInput.addEventListener('input', handler);
      cleanups.push(() => customInput.removeEventListener('input', handler));
    }

    // 5) Suppression de favoris + badge
    root.querySelectorAll('.remove-fav-btn, [data-remove-id]').forEach((btn) => {
      on(btn, (e) => {
        e.stopPropagation();
        const card = btn.closest('.fav-card, article');
        if (!card) return;
        card.style.transition = 'all .25s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 240);
        const badge = root.querySelector('#fav-count-badge');
        if (badge) badge.textContent = String(Math.max(0, parseInt(badge.textContent, 10) - 1));
      });
    });

    // 6) Compteur de comparaison
    const syncCompare = () => {
      const c = root.querySelector('#compare-count');
      if (c) c.textContent = String(root.querySelectorAll('.compare-checkbox:checked').length);
    };
    root.querySelectorAll('.compare-checkbox').forEach((box) => {
      const h = () => syncCompare();
      box.addEventListener('change', h);
      cleanups.push(() => box.removeEventListener('change', h));
    });

    // 7) Copie presse-papier (#copy-btn / bouton content_copy)
    root.querySelectorAll('#copy-btn, button:has(.material-symbols-outlined)').forEach((btn) => {
      if (text(btn).includes('content_copy') || btn.id === 'copy-btn') {
        on(btn, () => {
          const ref2 = root.querySelector('#booking-ref');
          const value = ref2 ? ref2.textContent.replace(/[\s#]/g, '') : 'ALP-2025-DLA-8924';
          if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
          const fb = root.querySelector('#copy-feedback');
          if (fb) {
            fb.classList.remove('opacity-0');
            fb.classList.add('opacity-100');
            setTimeout(() => { fb.classList.remove('opacity-100'); fb.classList.add('opacity-0'); }, 2200);
          }
        });
      }
    });

    // 8) Réponses rapides + envoi de message (C7)
    const textarea = root.querySelector('textarea');
    root.querySelectorAll('button').forEach((btn) => {
      const t = text(btn);
      if (textarea && /(Je serai là à l'heure|Retard de vol|Pouvez-vous m'appeler|Préciser le point)/.test(t)) {
        on(btn, () => { textarea.value = t; textarea.focus(); });
      }
      if (/^Envoyer/.test(t) || t.endsWith('send')) {
        on(btn, () => {
          if (!textarea || !textarea.value.trim()) return;
          const thread = root.querySelector('.overflow-y-auto.p-space-md.space-y-4') || textarea.closest('div').parentElement.parentElement.previousElementSibling;
          const bubble = document.createElement('div');
          bubble.className = 'flex items-end justify-end gap-2.5 w-full';
          bubble.innerHTML = `<div class="flex flex-col gap-1 items-end max-w-[80%]"><div class="p-3.5 rounded-2xl rounded-br-sm bg-primary text-on-primary text-body-md font-body-md shadow-sm">${textarea.value.replace(/</g, '&lt;')}</div><span class="font-label-sm text-[11px] text-outline mr-1">À l'instant</span></div>`;
          if (thread) { thread.appendChild(bubble); thread.scrollTop = thread.scrollHeight; }
          textarea.value = '';
        });
      }
    });

    // 9) Boutons d'impression / téléchargement → boîte d'impression navigateur (démo)
    root.querySelectorAll('a, button').forEach((el) => {
      const t = text(el);
      if (/^(Imprimer|Télécharger|Relevé PDF|Exporter CSV|Format PDF|Factures\b)/.test(t) || t === 'download') {
        el.style.cursor = 'pointer';
        on(el, (e) => { e.preventDefault(); window.print(); });
      }
    });

    // 10) Checkbox chauffeur (étape 1) : grise le bloc permis
    const exempt = root.querySelector('#driverExemptCheck');
    const block = root.querySelector('#drivingLicenseBlock');
    if (exempt && block) {
      const h = () => {
        block.classList.toggle('bg-tertiary-fixed/30', !exempt.checked);
        block.classList.toggle('bg-surface-container-low', exempt.checked);
      };
      exempt.addEventListener('change', h);
      cleanups.push(() => exempt.removeEventListener('change', h));
    }

    // 11) Bouton Recharger du bandeau étape 3 → retour portefeuille
    root.querySelectorAll('a, button').forEach((el) => {
      if (text(el) === 'Recharger') on(el, (e) => { e.preventDefault(); navigate('/client/wallet?recharge=1'); });
    });

    return () => cleanups.forEach((fn) => fn());
  };

  useEffect(() => {
    if (!ref.current) return undefined;
    return wire(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  useEffect(() => {
    if (!modalOpen || !modalRef.current) return undefined;
    return wire(modalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  return (
    <DesignShell role={role}>
      <div ref={ref} className="pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8" dangerouslySetInnerHTML={{ __html: html }} />
      {modalHtml && modalOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" ref={modalRef}>
          <div dangerouslySetInnerHTML={{ __html: modalHtml }} />
        </div>
      )}
    </DesignShell>
  );
}
