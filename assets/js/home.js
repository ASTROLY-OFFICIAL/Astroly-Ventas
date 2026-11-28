// Inicio: portada compacta con la escena de Astro, novedades y catálogo con filtros (carga más al llegar al final).
import {shell, $, $$, ICON, card, bindCards, reduce, store, COLLECTIONS, CONFIG, TONE_NAMES, norm, flyToCart, artSVG} from './ui.js';
import {PRODUCTS} from './data.js';

const mascot = shell();

$('.search-icon').innerHTML = ICON.search;

// ── Portada: Astro busca entre cajas, encuentra el producto de la promoción y esta se despliega.
const P = CONFIG.promo, pp = PRODUCTS.find(p => p.id === P.id), promo = $('[data-promo]');
if (pp) {
  $('[data-promo-label]').textContent = P.label;
  $('[data-promo-name]').textContent = pp.name;
  $('[data-promo-price]').innerHTML = store.priceTag(pp.price);
  $('[data-promo-link]').href = `producto.html?id=${pp.id}`;
  const offer = $('[data-promo-offer]'); offer.textContent = P.offer; offer.hidden = !P.offer;
  $('[data-promo-add]').addEventListener('click', () => flyToCart($('[data-promo-name]'), artSVG(pp.art, pp.tones[0])).then(() => store.add(pp.id, pp.tones[0], 1)));
}
import('./escena.js').then(({mountScene}) => mountScene($('.hero-scene'), {
  onFound: () => { if (pp) { promo.classList.remove('is-open'); void promo.offsetWidth; promo.classList.add('is-open'); } },
  onReset: () => promo.classList.remove('is-open')
})).catch(() => promo.classList.add('is-open'));
if (!pp) promo.remove();

// ── Novedades
const track = $('.row-track');
const fresh = PRODUCTS.filter(p => p.badge).concat(PRODUCTS.filter(p => !p.badge)).slice(0, 8);
track.innerHTML = fresh.map(card).join('');
bindCards(track);
const [prev, next] = $$('[data-row]');
prev.innerHTML = ICON.left; next.innerHTML = ICON.right;
$$('[data-row]').forEach(b => b.addEventListener('click', () => track.scrollBy({left: +b.dataset.row * track.clientWidth * .8, behavior: reduce.matches ? 'auto' : 'smooth'})));

// ── Catálogo
const grid = $('.grid'), input = $('.catalog input'), sort = $('.sort select'), results = $('.results'), empty = $('.catalog-empty');
const params = new URLSearchParams(location.search);
const STATE = {col: params.get('cat') || 'todo', price: 'all', tone: 'all', q: params.get('q') || '', sort: 'rel', shown: 15};
input.value = STATE.q;
const PRICES = [{key: 'all', name: 'Cualquier precio'}, {key: 'lo', name: 'Hasta 80 mil', test: p => p.price <= 80000}, {key: 'mid', name: '80 a 150 mil', test: p => p.price > 80000 && p.price <= 150000}, {key: 'hi', name: 'Más de 150 mil', test: p => p.price > 150000}];
const chips = {
  col: [{key: 'todo', name: 'Todo'}, ...COLLECTIONS.filter(c => !c.soon)],
  price: PRICES,
  tone: [{key: 'all', name: 'Todos los tonos'}, ...Object.keys(TONE_NAMES).map(k => ({key: k, name: TONE_NAMES[k]}))]
};
function drawChips() {
  $$('[data-filter]').forEach(box => {
    const f = box.dataset.filter;
    box.innerHTML = chips[f].map(c => `<button type="button" class="chip" data-key="${c.key}" aria-pressed="${STATE[f] === c.key}">${f === 'tone' && c.key !== 'all' ? `<i class="tone tone-${c.key}"></i>` : ''}${c.name}</button>`).join('');
  });
}
$('.filters').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  const f = b.closest('[data-filter]').dataset.filter;
  STATE[f] = b.dataset.key; STATE.shown = 15; drawChips(); render(); mascot.react('filter');
});
document.addEventListener('astroly:filter', e => { STATE.col = e.detail.cat; STATE.shown = 15; drawChips(); render(); $('#catalogo').scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth'}); mascot.react('filter'); });
let t = 0;
input.addEventListener('input', () => { STATE.q = input.value; STATE.shown = 15; mascot.react('search'); clearTimeout(t); t = setTimeout(render, 120); });
sort.addEventListener('change', () => { STATE.sort = sort.value; render(); });
$('[data-reset]').addEventListener('click', () => { Object.assign(STATE, {col: 'todo', price: 'all', tone: 'all', q: ''}); input.value = ''; drawChips(); render(); });

function render(fresh = true) {
  const priceTest = PRICES.find(p => p.key === STATE.price)?.test || (() => true);
  let list = PRODUCTS.filter(p => (STATE.col === 'todo' || p.col === STATE.col) && priceTest(p) && (STATE.tone === 'all' || p.tones.includes(STATE.tone))
    && (!STATE.q || norm(p.name + ' ' + p.short).includes(norm(STATE.q))));
  if (STATE.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
  if (STATE.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
  if (STATE.sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const total = list.length;
  grid.innerHTML = list.slice(0, STATE.shown).map((p, i) => card(p, i, STATE.tone)).join('') +
    (total > STATE.shown ? `<button type="button" class="more" data-more>Ver más <span class="mono">${STATE.shown}/${total}</span></button>` : '');
  results.textContent = `${total} ${total === 1 ? 'producto' : 'productos'}`;
  empty.hidden = total > 0;
  if (!total && STATE.q) mascot.react('noresults');
  if (fresh) { grid.classList.remove('is-fresh'); void grid.offsetWidth; grid.classList.add('is-fresh'); }
  moreIO.disconnect(); const m = $('[data-more]', grid); if (m) moreIO.observe(m);
}
grid.addEventListener('click', e => { if (e.target.closest('[data-more]')) more(); });
// Carga continua, como en las tiendas grandes: al acercarse al final se agregan más productos sin recargar.
function more() { const y = scrollY; STATE.shown += 15; render(false); scrollTo(0, y); }
const moreIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && more()), {rootMargin: '0px 0px 400px 0px'});
bindCards(grid);
drawChips(); render();
if (params.has('cat') || params.has('q') || location.hash === '#catalogo') requestAnimationFrame(() => $('#catalogo').scrollIntoView());
