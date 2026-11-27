// Ficha de producto: vistas, tono, cantidad y un botón de añadir con respuesta visible.
import {shell, $, $$, ICON, card, bindCards, rise, reduce, store, artSVG, TONE_NAMES, collectionName, flyToCart} from './ui.js';
import {PRODUCTS, byId} from './data.js';

const mascot = shell();
const params = new URLSearchParams(location.search);
const p = byId(params.get('id')) || PRODUCTS[0];
let tone = p.tones.includes(params.get('tono')) ? params.get('tono') : p.tones[0];
let qty = 1, view = 0;

document.title = `${p.name} · astroly`;
$('[data-crumb]').textContent = p.name;
$('[data-col]').textContent = collectionName(p.col);
$('.pdp-info h1').textContent = p.name;
$('.pdp-price').innerHTML = store.priceTag(p.price);
$('.pdp-short').textContent = p.short;
$('[data-desc]').textContent = `${p.short} Este texto es de ejemplo: aquí va la descripción completa del producto.`;
$('.giant-tag').textContent = `${collectionName(p.col)} · ${p.name}`;

// Vistas: frente, detalle y de noche.
const VIEWS = ['Frente', 'Detalle', 'De noche'];
const stage = $('.pdp-stage'), artBox = $('.pdp-art'), thumbs = $('.pdp-thumbs');
function drawArt(swap = true) {
  artBox.innerHTML = artSVG(p.art, tone);
  if (swap) { artBox.classList.remove('is-swap'); void artBox.offsetWidth; artBox.classList.add('is-swap'); }
  thumbs.innerHTML = VIEWS.map((v, i) => `<button type="button" aria-pressed="${i === view}" aria-label="${v}" class="v-${i}">${artSVG(p.art, tone)}</button>`).join('');
}
function setView(i) {
  view = i; stage.dataset.view = i;
  $$('button', thumbs).forEach((b, k) => b.setAttribute('aria-pressed', k === i));
}
thumbs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setView($$('button', thumbs).indexOf(b)); });

// Girar la pieza con el cursor (o el dedo, en horizontal).
if (!reduce.matches) {
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    artBox.style.transform = `${view === 1 ? 'scale(1.55) ' : ''}rotateY(${(x * 22).toFixed(1)}deg) rotateX(${(-y * 14).toFixed(1)}deg)`;
  });
  stage.addEventListener('pointerleave', () => { artBox.style.transform = ''; });
}

// Tonos
const tones = $('.opt-tones');
const swatch = {m: '#f3f3f3', s: '#2e3136', c: '#c8cbd1', p: '#ece6da'};
tones.innerHTML = p.tones.map(t => `<button type="button" data-tone="${t}" aria-pressed="${t === tone}"><i style="background:${swatch[t]}"></i>${TONE_NAMES[t]}</button>`).join('');
$('[data-tone-name]').textContent = TONE_NAMES[tone];
tones.addEventListener('click', e => {
  const b = e.target.closest('[data-tone]'); if (!b || b.dataset.tone === tone) return;
  tone = b.dataset.tone; $$('[data-tone]', tones).forEach(x => x.setAttribute('aria-pressed', x === b));
  $('[data-tone-name]').textContent = TONE_NAMES[tone];
  history.replaceState(null, '', `?id=${p.id}&tono=${tone}`);
  drawArt(); setView(view);
});

// Cantidad
$('.buy-row .stepper').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  qty = Math.min(99, Math.max(1, qty + +b.dataset.q)); $('[data-qty]').textContent = qty;
});

// Añadir: el botón se llena, la pieza vuela al carrito y la mascota la atrapa.
const add = $('.add-btn');
add.addEventListener('click', () => {
  if (add.classList.contains('is-busy')) return;
  add.classList.add('is-busy');
  flyToCart(artBox, artSVG(p.art, tone)).then(() => {
    store.add(p.id, tone, qty);
    add.classList.remove('is-busy'); add.classList.add('is-done');
    setTimeout(() => add.classList.remove('is-done'), 1800);
  });
});

// Favorito
const fav = $('.pdp-fav'); fav.innerHTML = ICON.heart;
const syncFav = () => { const v = store.isFav(p.id); fav.classList.toggle('is-on', v); fav.setAttribute('aria-pressed', v); };
fav.addEventListener('click', () => { store.toggleFav(p.id); syncFav(); });
syncFav();

// Relacionados: misma colección primero.
const related = PRODUCTS.filter(x => x.id !== p.id).sort((a, b) => (b.col === p.col) - (a.col === p.col)).slice(0, 4);
const grid = $('.related .grid'); grid.innerHTML = related.map(card).join(''); bindCards(grid);

drawArt(false); setView(0); rise();
setTimeout(() => mascot.react('hover', {dir: -1}), 900);
