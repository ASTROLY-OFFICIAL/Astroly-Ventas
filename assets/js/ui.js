// Piezas compartidas por todas las páginas: cabecera, tema, moneda, dock del carrito con la mascota,
// panel del carrito, tarjetas de producto, animación de "volar al carrito" y entradas de texto.
// En Shopify cada bloque se vuelve una sección o snippet (header, cart-drawer, product-card).
import {CONFIG, COLLECTIONS, TONE_NAMES, byId, collectionName} from './data.js';
import * as store from './store.js';
import {artSVG} from './art.js';
import {createMascot} from './mascota.js';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)');
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

export const ICON = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4L19 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.4 2.6 2.2 4.3 5 4.5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 20v-7h2.4l.4-2.8h-2.8V8.6c0-.8.3-1.4 1.4-1.4h1.5V4.7c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v1.9H9.2V13h2.4v7"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5 5.6 16A7.8 7.8 0 1 1 8.4 18.6Z"/><path d="M9.3 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.4.5c.5 1 1.3 1.8 2.4 2.4l.5-.4c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.6.4-1.5.5-2.4.2a8 8 0 0 1-4.6-4.6c-.3-.9-.2-1.8.3-2.4Z"/></svg>'
};

// ── Tema claro / oscuro (se recuerda, como en la landing)
export function initTheme() {
  const saved = localStorage.getItem('astroly-theme');
  document.documentElement.dataset.theme = saved || 'light';
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; localStorage.setItem('astroly-theme', next);
  store.emit('theme', {theme: next});
}

// ── Cabecera
export function header(active = '') {
  const cur = store.getCurrency();
  const h = document.createElement('header');
  h.className = 'site-header';
  h.innerHTML = `
    <a class="brand" href="index.html" aria-label="astroly, inicio"><img src="assets/img/isotipo.svg" alt="" class="brand-mark"><span>astroly</span></a>
    <nav class="primary-nav" aria-label="Principal">
      <a href="index.html#catalogo" ${active === 'catalogo' ? 'aria-current="page"' : ''}>Catálogo</a>
      <a href="index.html#colecciones">Colecciones</a>
      <a href="index.html#destacados">Novedades</a>
    </nav>
    <div class="header-actions">
      <div class="currency" role="group" aria-label="Moneda">
        <button type="button" data-currency-btn="COP" aria-pressed="${cur === 'COP'}">COP</button>
        <button type="button" data-currency-btn="USD" aria-pressed="${cur === 'USD'}">USD</button>
      </div>
      <button type="button" class="icon-btn theme-btn" aria-label="Cambiar tema claro u oscuro"><span class="i-sun">${ICON.sun}</span><span class="i-moon">${ICON.moon}</span></button>
      <a class="header-cart" href="carrito.html">Carrito <span class="mono" data-cart-count>${store.count()}</span></a>
    </div>`;
  document.body.prepend(h);
  $$('[data-currency-btn]', h).forEach(b => b.addEventListener('click', () => store.setCurrency(b.dataset.currencyBtn)));
  $('.theme-btn', h).addEventListener('click', toggleTheme);
  let last = 0;
  addEventListener('scroll', () => { const y = scrollY; h.classList.toggle('is-scrolled', y > 8); h.classList.toggle('is-hidden', y > 300 && y > last + 2 && !document.body.classList.contains('drawer-open')); if (y < last - 2) h.classList.remove('is-hidden'); last = y; }, {passive: true});
}

// ── Pie
export function footer() {
  const f = document.createElement('footer');
  f.className = 'site-footer band';
  f.innerHTML = `
    <div class="footer-top">
      <div class="footer-col"><span class="label">Tienda</span><a href="index.html#catalogo">Catálogo</a><a href="index.html#colecciones">Colecciones</a><a href="carrito.html">Carrito</a></div>
      <div class="footer-col"><span class="label">Redes</span>${CONFIG.socials.map(s => `<a href="${s.url}">${s.name}</a>`).join('')}</div>
      <div class="footer-col"><span class="label">Compra</span><span>Pago en línea</span><span>Precios en COP o USD</span><span>Envíos en Colombia</span></div>
      <p class="footer-note">Tienda en línea de astroly. Las fotos, descripciones y precios de esta vista son de ejemplo.</p>
    </div>
    <p class="footer-giant" aria-hidden="true">astroly</p>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} astroly</span><span class="mono">Hogar · Decoración · Lo que viene</span></div>`;
  document.body.append(f);
}

// ── Dock del carrito (abajo a la derecha). La mascota se sienta encima.
let mascot = null;
export const getMascot = () => mascot;
export function dock() {
  const d = document.createElement('div');
  d.className = 'dock';
  d.innerHTML = `<div class="dock-slot" data-mascot-slot="dock" aria-hidden="true"></div>
    <button type="button" class="dock-btn" aria-label="Abrir carrito">
      <span class="dock-icon">${ICON.bag}<span class="dock-count mono" data-cart-count>${store.count()}</span></span>
      <span class="dock-total" data-cart-total>${store.money(store.subtotal())}</span>
    </button>
    <span class="dock-drop" aria-hidden="true">Suelta aquí</span>`;
  document.body.append(d);
  $('.dock-btn', d).addEventListener('click', openDrawer);
  // Arrastrar una tarjeta hasta el dock la añade al carrito.
  d.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/astroly')) { e.preventDefault(); d.classList.add('is-over'); } });
  d.addEventListener('dragleave', () => d.classList.remove('is-over'));
  d.addEventListener('drop', e => { e.preventDefault(); d.classList.remove('is-over'); const [id, tone] = e.dataTransfer.getData('text/astroly').split('|'); store.add(id, tone, 1); pulseDock(); });
  mascot = createMascot();
  window.astrolyMascot = mascot;
  return d;
}
export function pulseDock() { const b = $('.dock-btn'); if (!b) return; b.classList.remove('is-pulse'); void b.offsetWidth; b.classList.add('is-pulse'); }

// ── Panel del carrito
export function drawer() {
  const el = document.createElement('aside');
  el.className = 'drawer band'; el.setAttribute('aria-label', 'Carrito'); el.setAttribute('aria-hidden', 'true'); el.inert = true;
  el.innerHTML = `<div class="drawer-head"><h2>Tu carrito <span class="mono" data-cart-count></span></h2><button type="button" class="icon-btn" data-close aria-label="Cerrar carrito">${ICON.close}</button></div>
    <div class="drawer-lines"></div>
    <div class="drawer-foot"><div class="row"><span>Subtotal</span><strong data-cart-total></strong></div><p class="hint">Envío e impuestos se calculan al pagar.</p>
    <a class="button" href="carrito.html">Ver carrito</a><button type="button" class="button ghost" data-checkout>Pagar ahora</button></div>`;
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  document.body.append(scrim, el);
  scrim.addEventListener('click', closeDrawer); $('[data-close]', el).addEventListener('click', closeDrawer);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  $('[data-checkout]', el).addEventListener('click', checkout);
}
export function openDrawer() {
  renderDrawer(); document.body.classList.add('drawer-open');
  const d = $('.drawer'); d.inert = false; d.setAttribute('aria-hidden', 'false'); $('[data-close]', d).focus();
}
export function closeDrawer() {
  if (!document.body.classList.contains('drawer-open')) return;
  document.body.classList.remove('drawer-open'); const d = $('.drawer'); d.inert = true; d.setAttribute('aria-hidden', 'true');
}
export function lineRow(l) {
  const p = l.product;
  return `<div class="line" data-id="${p.id}" data-tone="${l.tone}">
    <a class="line-art" href="producto.html?id=${p.id}&tono=${l.tone}">${artSVG(p.art, l.tone)}</a>
    <div class="line-info"><a href="producto.html?id=${p.id}&tono=${l.tone}" class="line-name">${esc(p.name)}</a><span class="line-meta">${TONE_NAMES[l.tone]} · ${collectionName(p.col)}</span>
      <div class="stepper" role="group" aria-label="Cantidad de ${esc(p.name)}"><button type="button" data-step="-1" aria-label="Quitar uno">${ICON.minus}</button><span class="mono">${l.qty}</span><button type="button" data-step="1" aria-label="Añadir uno">${ICON.plus}</button></div></div>
    <div class="line-end">${store.priceTag(p.price * l.qty)}<button type="button" class="link-btn" data-remove>Quitar</button></div></div>`;
}
export function bindLines(root) {
  root.addEventListener('click', e => {
    const line = e.target.closest('.line'); if (!line) return;
    const {id, tone} = line.dataset; const cur = store.lines().find(l => l.id === id && l.tone === tone); if (!cur) return;
    const step = e.target.closest('[data-step]');
    if (step) store.setQty(id, tone, cur.qty + +step.dataset.step);
    if (e.target.closest('[data-remove]')) { line.classList.add('is-leaving'); setTimeout(() => store.remove(id, tone), reduce.matches ? 0 : 220); }
  });
}
function renderDrawer() {
  const box = $('.drawer-lines'); if (!box) return;
  const ls = store.lines();
  box.innerHTML = ls.length ? ls.map(lineRow).join('') : `<div class="empty"><p>Tu carrito está vacío.</p><a class="text-link" href="index.html#catalogo">Ir al catálogo ${ICON.arrow}</a></div>`;
  if (!box.dataset.bound) { bindLines(box); box.dataset.bound = 1; }
}
export function checkout() {
  if (!store.count()) { mascot?.react('empty'); return; }
  mascot?.react('checkout');
  // En Shopify: location.href = '/checkout'. En la vista previa se explica con un aviso.
  toast('Aquí se abre el pago seguro de Shopify.');
}
export function toast(text) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = text; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
}

// Contadores y totales en toda la página.
function syncCart() {
  $$('[data-cart-count]').forEach(e => { e.textContent = store.count(); });
  $$('[data-cart-total]').forEach(e => { e.textContent = store.money(store.subtotal()); });
  document.body.classList.toggle('has-cart', store.count() > 0);
  if (document.body.classList.contains('drawer-open')) renderDrawer();
}
store.on('cart', syncCart);
store.on('currency', syncCart);

// ── Volar al carrito: la ilustración del producto viaja en arco hasta el dock.
export function flyToCart(fromEl, html) {
  const target = $('.dock-btn');
  if (!fromEl || !target || reduce.matches) return Promise.resolve();
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const ghost = document.createElement('div'); ghost.className = 'fly-ghost'; ghost.innerHTML = html;
  const size = Math.min(a.width, a.height, 220);
  Object.assign(ghost.style, {left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px`});
  document.body.append(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = 36 / size;
  const anim = ghost.animate([
    {transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1},
    {transform: `translate(${dx * .45}px,${dy * .45 - 160}px) scale(${(1 + s) / 2}) rotate(-12deg)`, opacity: 1, offset: .5},
    {transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(8deg)`, opacity: .2}
  ], {duration: 720, easing: 'cubic-bezier(.45,0,.25,1)'});
  return anim.finished.then(() => { ghost.remove(); pulseDock(); });
}

// ── Tarjeta de producto
export function card(p, i = 0) {
  const tone = p.tones[0];
  return `<article class="card" data-id="${p.id}" data-tone="${tone}" style="--i:${i}">
    <a class="card-stage" href="producto.html?id=${p.id}" draggable="true" aria-label="${esc(p.name)}">
      <span class="card-art">${artSVG(p.art, tone)}</span>
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <span class="card-index mono">${String(i + 1).padStart(2, '0')}</span>
    </a>
    <button type="button" class="fav ${store.isFav(p.id) ? 'is-on' : ''}" aria-pressed="${store.isFav(p.id)}" aria-label="Guardar ${esc(p.name)} en favoritos">${ICON.heart}</button>
    <div class="card-info">
      <div class="card-text"><h3><a href="producto.html?id=${p.id}">${esc(p.name)}</a></h3>
        <div class="tones" role="group" aria-label="Tonos">${p.tones.map((t, k) => `<button type="button" class="tone tone-${t}" data-tone="${t}" aria-label="${TONE_NAMES[t]}" aria-pressed="${k === 0}"></button>`).join('')}</div></div>
      <div class="card-buy">${store.priceTag(p.price)}<button type="button" class="quick-add" aria-label="Añadir ${esc(p.name)} al carrito">${ICON.plus}${ICON.check}</button></div>
    </div>
  </article>`;
}
export function bindCards(root) {
  root.addEventListener('click', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const p = byId(c.dataset.id);
    const tb = e.target.closest('.tone');
    if (tb) {
      c.dataset.tone = tb.dataset.tone;
      $$('.tone', c).forEach(b => b.setAttribute('aria-pressed', b === tb));
      const art = $('.card-art', c); art.innerHTML = artSVG(p.art, tb.dataset.tone); art.classList.remove('is-swap'); void art.offsetWidth; art.classList.add('is-swap');
      return;
    }
    if (e.target.closest('.fav')) { const b = e.target.closest('.fav'); const v = store.toggleFav(p.id); b.classList.toggle('is-on', v); b.setAttribute('aria-pressed', v); return; }
    if (e.target.closest('.quick-add')) {
      const b = e.target.closest('.quick-add'); if (b.classList.contains('is-done')) return;
      b.classList.add('is-done');
      flyToCart($('.card-art', c), artSVG(p.art, c.dataset.tone)).then(() => store.add(p.id, c.dataset.tone, 1));
      setTimeout(() => b.classList.remove('is-done'), 1600);
    }
  });
  // Pasar el cursor por un producto: la mascota mira hacia él con curiosidad.
  let hoverT = 0;
  root.addEventListener('pointerover', e => {
    const c = e.target.closest('.card'); if (!c || c.contains(e.relatedTarget)) return;
    clearTimeout(hoverT); hoverT = setTimeout(() => {
      const r = c.getBoundingClientRect(); mascot?.lookAt(r.left + r.width / 2, r.top + r.height / 2);
      const m = $('.mascot')?.getBoundingClientRect(); mascot?.react('hover', {dir: m && r.left + r.width / 2 < m.left ? -1 : 1});
    }, 700);
  });
  root.addEventListener('pointerout', e => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) { clearTimeout(hoverT); mascot?.react('unhover'); } });
  root.addEventListener('dragstart', e => {
    const c = e.target.closest('.card'); if (!c) return;
    e.dataTransfer.setData('text/astroly', `${c.dataset.id}|${c.dataset.tone}`); e.dataTransfer.effectAllowed = 'copy';
    document.body.classList.add('is-dragging'); mascot?.say('¡Suéltalo aquí abajo!', 1800);
  });
  root.addEventListener('dragend', () => document.body.classList.remove('is-dragging'));
}

// ── Titulares que suben palabra por palabra (como en la landing)
export function rise(root = document) {
  $$('[data-rise]', root).forEach(h => {
    if (h.dataset.split) return; h.dataset.split = 1;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(' '); else { const m = document.createElement('span'); m.className = 'mask'; const s = document.createElement('span'); s.className = 'word'; s.textContent = w; m.append(s); frag.append(m); } });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('mask')) walk(n);
    });
    walk(h);
    $$('.word', h).forEach((w, i) => w.style.setProperty('--w', i));
  });
  const els = $$('[data-rise]:not([data-rise="manual"]),[data-reveal]', root);
  if (reduce.matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
  document.documentElement.classList.add('has-rise');
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), {rootMargin: '0px 0px -8% 0px'});
  els.forEach(e => io.observe(e));
  // Al hacer scroll muy rápido, todo lo que ya pasó queda visible.
  addEventListener('scroll', () => els.forEach(e => { if (!e.classList.contains('is-in') && e.getBoundingClientRect().top < innerHeight) e.classList.add('is-in'); }), {passive: true});
}

export function shell(active) {
  initTheme(); header(active); drawer(); dock(); footer();
  syncCart();
  return mascot;
}
export {store, artSVG, COLLECTIONS, CONFIG, TONE_NAMES, collectionName, esc};
