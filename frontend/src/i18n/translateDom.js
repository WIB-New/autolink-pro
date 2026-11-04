import i18n from './index';
import dict from './design-dict.json';

const norm = (t) => t.trim().replace(/\s+/g, ' ');
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'CODE', 'OPTION-ICON']);

// Index global : phrase FR -> EN, toutes scopes confondues (ui.common prioritaire)
let fullIndex = null;
const buildIndex = () => {
  if (fullIndex) return fullIndex;
  fullIndex = {};
  const res = i18n.getResourceBundle('en', 'translation') || {};
  Object.keys(res).forEach((k) => {
    const bar = k.indexOf('|');
    if (bar === -1) return;
    const phrase = k.slice(bar + 1);
    if (k.startsWith('ui.common|') || !(phrase in fullIndex)) fullIndex[phrase] = res[k];
  });
  Object.assign(fullIndex, dict);
  return fullIndex;
};

const lookup = (phrase) => {
  const p = norm(phrase);
  if (!p) return null;
  const idx = buildIndex();
  if (idx[p]) return idx[p];
  // Fallback token-par-jeton : « 04 sept. », « Litige • disputed »…
  if (p.length < 60) {
    const parts = p.split(/(\s+)/).map((tok) => idx[tok] || idx[tok.replace(/[.,:;!?]$/, '')] || tok);
    const out = parts.join('');
    if (out !== p) return out;
  }
  return null;
};

const ORIG = new WeakMap();

export function translateDom(root) {
  if (!root || i18n.language !== 'en') {
    restoreDom(root);
    return;
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let n = walker.nextNode();
  while (n) { nodes.push(n); n = walker.nextNode(); }
  nodes.forEach((node) => {
    const el = node.parentElement;
    if (!el || SKIP_TAGS.has(el.tagName)) return;
    if (el.classList.contains('material-symbols-outlined') || el.classList.contains('material-icons')) return;
    if (!ORIG.has(node)) ORIG.set(node, node.textContent);
    const raw = ORIG.get(node);
    if (!norm(raw)) return;
    const en = lookup(raw);
    if (en) node.textContent = raw.replace(raw.trim(), en);
  });
  // placeholders & titles
  root.querySelectorAll('input[placeholder], textarea[placeholder], [title]').forEach((el) => {
    const ph = el.getAttribute('placeholder');
    if (ph) { if (!ORIG.has(el)) ORIG.set(el, { ph }); const en = lookup(ORIG.get(el).ph); if (en) el.setAttribute('placeholder', en); }
    const ti = el.getAttribute('title');
    if (ti) { const o = ORIG.get(el) || { }; if (!o.ti) { o.ti = ti; ORIG.set(el, { ...o, ti }); } const en = lookup(o.ti || ti); if (en) el.setAttribute('title', en); }
  });
}

function restoreDom(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n = walker.nextNode();
  while (n) { if (ORIG.has(n)) n.textContent = ORIG.get(n); n = walker.nextNode(); }
  root.querySelectorAll('input[placeholder], textarea[placeholder], [title]').forEach((el) => {
    const o = ORIG.get(el);
    if (o?.ph) el.setAttribute('placeholder', o.ph);
    if (o?.ti) el.setAttribute('title', o.ti);
  });
}

// Traduit les nœuds injectés après coup (messages, lignes régénérées, toasts)
let observer = null;
export function observeDom(root) {
  if (observer) observer.disconnect();
  if (!root) return () => {};
  observer = new MutationObserver((muts) => {
    if (i18n.language !== 'en') return;
    muts.forEach((m) => m.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const en = lookup(node.textContent);
        if (en) node.textContent = node.textContent.replace(node.textContent.trim(), en);
      } else if (node.querySelectorAll) {
        translateDom(node);
      }
    }));
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}

export default translateDom;
