// Piezas compartidas: barra lateral (Inicio, Categoría, Cuenta, Carrito), panel de búsqueda y
// categorías, panel del carrito, pie, tarjetas de producto y animación de "volar al carrito".
// En Shopify cada bloque se vuelve una sección o snippet (sidebar, search, cart-drawer, product-card).
import {CONFIG, COLLECTIONS, PRODUCTS, TONE_NAMES, byId, collectionName} from './data.js';
import * as store from './store.js';
import {artSVG} from './art.js';
import {createMascot} from './mascota.js';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)');
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const page = () => document.body.dataset.page;

export const ICON = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1Z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><circle cx="16.75" cy="16.75" r="2.6"/><path d="m18.8 18.8 1.7 1.7"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4L19 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.2-4.2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.4 2.6 2.2 4.3 5 4.5"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 20v-7h2.4l.4-2.8h-2.8V8.6c0-.8.3-1.4 1.4-1.4h1.5V4.7c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v1.9H9.2V13h2.4v7"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5 5.6 16A7.8 7.8 0 1 1 8.4 18.6Z"/><path d="M9.3 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.4.5c.5 1 1.3 1.8 2.4 2.4l.5-.4c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.6.4-1.5.5-2.4.2a8 8 0 0 1-4.6-4.6c-.3-.9-.2-1.8.3-2.4Z"/></svg>'
};

// ── Tema
export function initTheme() { document.documentElement.dataset.theme = localStorage.getItem('astroly-theme') || 'light'; }
function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; localStorage.setItem('astroly-theme', next);
  store.emit('theme', {theme: next});
}

// ── Barra lateral (en celular: barra inferior + barra superior mínima)
function sidebar() {
  const cur = store.getCurrency(), p = page();
  const nav = document.createElement('aside');
  nav.className = 'sidebar';
  nav.innerHTML = `
    <a class="side-brand" href="index.html" aria-label="astroly, inicio"><img src="assets/img/isotipo.svg" alt=""><span>astroly</span></a>
    <nav class="side-nav" aria-label="Principal">
      <a class="side-item" href="index.html" ${p === 'home' ? 'aria-current="page"' : ''}>${ICON.home}<span>Inicio</span></a>
      <button type="button" class="side-item" data-open-search aria-expanded="false" aria-controls="search-panel">${ICON.grid}<span>Categoría</span></button>
      <a class="side-item" href="cuenta.html" ${p === 'account' ? 'aria-current="page"' : ''}>${ICON.user}<span>Tú</span></a>
      <a class="side-item nav-cart" href="carrito.html" ${p === 'cart' ? 'aria-current="page"' : ''}>${ICON.bag}<span>Carrito</span><b class="badge-count mono" data-cart-count>0</b></a>
    </nav>
    <div class="side-tools">
      <div class="currency" role="group" aria-label="Moneda">
        <button type="button" data-currency-btn="COP" aria-pressed="${cur === 'COP'}">COP</button>
        <button type="button" data-currency-btn="USD" aria-pressed="${cur === 'USD'}">USD</button>
      </div>
      <button type="button" class="icon-btn theme-btn" aria-label="Cambiar tema claro u oscuro"><span class="i-sun">${ICON.sun}</span><span class="i-moon">${ICON.moon}</span></button>
    </div>`;
  document.body.prepend(nav);
  // Barra superior en celular: marca, moneda y tema.
  const top = document.createElement('div');
  top.className = 'mobile-top';
  top.innerHTML = `<a class="side-brand" href="index.html" aria-label="astroly, inicio"><img src="assets/img/isotipo.svg" alt=""><span>astroly</span></a>
    <div class="side-tools">${$('.side-tools', nav).innerHTML}</div>`;
  nav.after(top);
  $$('[data-currency-btn]').forEach(b => b.addEventListener('click', () => store.setCurrency(b.dataset.currencyBtn)));
  $$('.theme-btn').forEach(b => b.addEventListener('click', toggleTheme));
  // Carrito: abre el panel lateral (en la página del carrito, sigue el enlace).
  $('.nav-cart', nav).addEventListener('click', e => { if (p !== 'cart') { e.preventDefault(); openDrawer(); } });
  $('[data-open-search]', nav).addEventListener('click', () => toggleSearch());
  // Arrastrar una tarjeta hasta Carrito la añade.
  const cart = $('.nav-cart', nav);
  cart.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/astroly')) { e.preventDefault(); cart.classList.add('is-over'); } });
  cart.addEventListener('dragleave', () => cart.classList.remove('is-over'));
  cart.addEventListener('drop', e => { e.preventDefault(); cart.classList.remove('is-over'); const [id, tone] = e.dataTransfer.getData('text/astroly').split('|'); store.add(id, tone, 1); pulseCart(); });
}
export function pulseCart() { $$('.nav-cart').forEach(b => { b.classList.remove('is-pulse'); void b.offsetWidth; b.classList.add('is-pulse'); }); }

// ── Panel de Categoría: buscador con resultados en vivo y lista de categorías.
function searchPanel() {
  const el = document.createElement('div');
  el.className = 'search-panel'; el.id = 'search-panel'; el.inert = true; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="sp-head"><label class="search"><span class="sr">Buscar</span><span class="search-icon">${ICON.search}</span><input type="search" placeholder="Buscar productos" autocomplete="off"></label>
      <button type="button" class="icon-btn" data-close-search aria-label="Cerrar">${ICON.close}</button></div>
    <div class="sp-results" aria-live="polite"></div>
    <span class="label">Categorías</span>
    <ul class="sp-cats">${[{key: 'todo', name: 'Todo'}, ...COLLECTIONS].map(c => {
      const n = c.key === 'todo' ? PRODUCTS.length : PRODUCTS.filter(p => p.col === c.key).length;
      return `<li><a href="index.html?cat=${c.key}#catalogo" data-cat="${c.key}" ${c.soon ? 'data-soon' : ''}><span>${c.name}</span><span class="mono">${c.soon ? 'Pronto' : n}</span></a></li>`;
    }).join('')}</ul>`;
  document.body.append(el);
  const input = $('input', el), results = $('.sp-results', el);
  input.addEventListener('input', () => {
    const q = norm(input.value.trim()); getMascot()?.react('search');
    if (!q) { results.innerHTML = ''; return; }
    const hits = PRODUCTS.filter(p => norm(p.name + ' ' + p.short + ' ' + collectionName(p.col)).includes(q)).slice(0, 6);
    results.innerHTML = hits.length ? hits.map(p => `<a class="sp-hit" href="producto.html?id=${p.id}"><span class="sp-art">${artSVG(p.art, p.tones[0])}</span><span>${esc(p.name)}<small>${collectionName(p.col)}</small></span>${store.priceTag(p.price)}</a>`).join('')
      + `<a class="text-link" href="index.html?q=${encodeURIComponent(input.value)}#catalogo">Ver todos los resultados ${ICON.arrow}</a>`
      : '<p class="hint">Sin resultados.</p>';
    if (!hits.length) getMascot()?.react('noresults');
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') location.href = `index.html?q=${encodeURIComponent(input.value)}#catalogo`; });
  el.addEventListener('click', e => {
    if (e.target.closest('[data-close-search]')) return toggleSearch(false);
    const c = e.target.closest('[data-cat]');
    if (c && c.hasAttribute('data-soon')) { e.preventDefault(); getMascot()?.say('Estamos preparando nuevas categorías.', 2400); return; }
    if (c && page() === 'home') { e.preventDefault(); toggleSearch(false); document.dispatchEvent(new CustomEvent('astroly:filter', {detail: {cat: c.dataset.cat}})); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleSearch(false); });
}
export function toggleSearch(force) {
  const el = $('.search-panel'), open = force ?? !document.body.classList.contains('search-open');
  document.body.classList.toggle('search-open', open); el.inert = !open; el.setAttribute('aria-hidden', !open);
  $$('[data-open-search]').forEach(b => b.setAttribute('aria-expanded', open));
  if (open) { closeDrawer(); setTimeout(() => $('input', el).focus(), 60); getMascot()?.react('search'); }
}
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export {norm};

// ── Pie compacto (banda invertida). La mascota baja aquí al final de la página.
function footer() {
  const f = document.createElement('footer');
  f.className = 'site-footer band';
  f.innerHTML = `<div class="footer-slot" data-mascot-slot="footer" aria-hidden="true"></div>
    <div class="footer-top">
      <a class="side-brand" href="index.html"><img src="assets/img/isotipo-oscuro.svg" alt="" class="on-dark"><img src="assets/img/isotipo.svg" alt="" class="on-light"><span>astroly</span></a>
      <div class="footer-col"><span class="label">Tienda</span><a href="index.html#catalogo">Catálogo</a><a href="cuenta.html">Mi cuenta</a><a href="carrito.html">Carrito</a></div>
      <div class="footer-col"><span class="label">Compra</span><span>Pago en línea</span><span>COP o USD</span><span>Envíos en Colombia</span></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} astroly</span><span>Productos y precios de ejemplo</span></div>`;
  document.body.append(f);
}

// ── Panel del carrito
let mascot = null;
export const getMascot = () => mascot;
function drawer() {
  const el = document.createElement('aside');
  el.className = 'drawer'; el.setAttribute('aria-label', 'Carrito'); el.setAttribute('aria-hidden', 'true'); el.inert = true;
  el.innerHTML = `<div class="drawer-head"><h2>Carrito <span class="mono" data-cart-count></span></h2><button type="button" class="icon-btn" data-close aria-label="Cerrar carrito">${ICON.close}</button></div>
    <div class="drawer-lines"></div>
    <div class="drawer-foot"><div class="row"><span>Subtotal</span><strong data-cart-total></strong></div><p class="hint">Envío e impuestos se calculan al pagar.</p>
    <button type="button" class="button" data-checkout>Pagar ahora</button><a class="button ghost" href="carrito.html">Ver carrito</a></div>`;
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  document.body.append(scrim, el);
  scrim.addEventListener('click', () => { closeDrawer(); toggleSearch(false); });
  $('[data-close]', el).addEventListener('click', closeDrawer);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  $('[data-checkout]', el).addEventListener('click', checkout);
}
export function openDrawer() {
  toggleSearch(false); renderDrawer(); document.body.classList.add('drawer-open');
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
    <div class="line-info"><a href="producto.html?id=${p.id}&tono=${l.tone}" class="line-name">${esc(p.name)}</a><span class="line-meta">${TONE_NAMES[l.tone]} · ${store.priceTag(p.price)} c/u</span>
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
  toast('Estás en la vista previa. El pago se habilita en la tienda Shopify.');
}
export function toast(text) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = text; t.classList.add('is-on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
}
function syncCart() {
  $$('[data-cart-count]').forEach(e => { e.textContent = store.count(); });
  $$('[data-cart-total]').forEach(e => { e.textContent = store.money(store.subtotal()); });
  document.body.classList.toggle('has-cart', store.count() > 0);
  if (document.body.classList.contains('drawer-open')) renderDrawer();
}
store.on('cart', syncCart);
store.on('currency', syncCart);

// ── Volar al carrito (hacia el ícono de Carrito de la barra)
export function flyToCart(fromEl, html) {
  const target = $$('.nav-cart').find(e => e.offsetParent !== null);
  if (!fromEl || !target || reduce.matches) return Promise.resolve();
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const ghost = document.createElement('div'); ghost.className = 'fly-ghost'; ghost.innerHTML = html;
  const size = Math.min(a.width, a.height, 200);
  Object.assign(ghost.style, {left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px`});
  document.body.append(ghost);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), s = 28 / size;
  const anim = ghost.animate([
    {transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1},
    {transform: `translate(${dx * .5}px,${dy * .5 - 120}px) scale(${(1 + s) / 2}) rotate(-12deg)`, opacity: 1, offset: .5},
    {transform: `translate(${dx}px,${dy}px) scale(${s}) rotate(8deg)`, opacity: .2}
  ], {duration: 680, easing: 'cubic-bezier(.45,0,.25,1)'});
  return anim.finished.then(() => { ghost.remove(); pulseCart(); });
}

// ── Tarjeta de producto (estilo tienda: imagen, nombre, precio y botón visible)
export function productUrl(id, tone) {
  return 'producto.html?' + new URLSearchParams({id, tono: tone});
}
export function card(p, i = 0, tone) {
  tone = typeof tone === 'string' && p.tones.includes(tone) ? tone : p.tones[0];
  return `<article class="card" data-id="${p.id}" data-tone="${tone}" style="--i:${i}">
    <a class="card-stage" data-product-link href="${productUrl(p.id, tone)}" draggable="true" aria-label="${esc(p.name)}">
      <span class="card-art">${artSVG(p.art, tone)}</span>${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
    </a>
    <button type="button" class="fav ${store.isFav(p.id) ? 'is-on' : ''}" aria-pressed="${store.isFav(p.id)}" aria-label="Guardar ${esc(p.name)} en favoritos">${ICON.heart}</button>
    <div class="card-body">
      <span class="card-col">${collectionName(p.col)}</span>
      <h3><a data-product-link href="${productUrl(p.id, tone)}">${esc(p.name)}</a></h3>
      <div class="card-row">${store.priceTag(p.price)}<div class="tones" role="group" aria-label="Tonos">${p.tones.map((t, k) => `<button type="button" class="tone tone-${t}" data-tone="${t}" aria-label="${TONE_NAMES[t]}" aria-pressed="${t === tone}"></button>`).join('')}</div></div>
      <button type="button" class="add" aria-label="Agregar ${esc(p.name)} al carrito"><span class="add-a">${ICON.plus}Agregar</span><span class="add-b">${ICON.check}Agregado</span></button>
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
      for (const link of $$('[data-product-link]', c)) link.href = productUrl(p.id, c.dataset.tone);
       $$('.tone', c).forEach(b => b.setAttribute('aria-pressed', b === tb));
      const art = $('.card-art', c); art.innerHTML = artSVG(p.art, tb.dataset.tone); art.classList.remove('is-swap'); void art.offsetWidth; art.classList.add('is-swap');
      mascot?.react('tone'); return;
    }
    if (e.target.closest('.fav')) { const b = e.target.closest('.fav'); const v = store.toggleFav(p.id); b.classList.toggle('is-on', v); b.setAttribute('aria-pressed', v); return; }
    const add = e.target.closest('.add');
    if (add) {
      if (add.classList.contains('is-done')) return;
      add.classList.add('is-done');
      flyToCart($('.card-art', c), artSVG(p.art, c.dataset.tone)).then(() => store.add(p.id, c.dataset.tone, 1));
      setTimeout(() => add.classList.remove('is-done'), 1600);
    }
  });
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
    document.body.classList.add('is-dragging'); mascot?.say('¡Suéltalo en Carrito!', 1800);
  });
  root.addEventListener('dragend', () => document.body.classList.remove('is-dragging'));
}

export function shell() {
  initTheme(); sidebar(); searchPanel(); drawer(); footer();
  mascot = createMascot(); window.astrolyMascot = mascot;
  syncCart();
  return mascot;
}
export {store, artSVG, COLLECTIONS, CONFIG, TONE_NAMES, collectionName};
