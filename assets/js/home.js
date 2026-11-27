// Inicio: portada con producto destacado en 3D, novedades y catálogo con filtros.
import {shell, $, $$, ICON, card, bindCards, reduce, store, COLLECTIONS, CONFIG, TONE_NAMES, esc, norm, flyToCart, artSVG} from './ui.js';
import {PRODUCTS} from './data.js';

const mascot = shell();

$('.search-icon').innerHTML = ICON.search;

// ── Portada: producto destacado en 3D (lámpara que levita y se desarma en piezas)
const F = CONFIG.featured, fp = PRODUCTS.find(p => p.id === F.id);
const feat = $('[data-feature]');
$('[data-feature-name]', feat).textContent = fp.name;
$('[data-feature-link]', feat).href = `producto.html?id=${fp.id}`;
$('[data-feature-price]', feat).innerHTML = store.priceTag(fp.price);
$('[data-stars]', feat).innerHTML = [1, 2, 3, 4, 5].map(i => `<i style="--fill:${Math.round(Math.min(1, Math.max(0, F.rating - i + 1)) * 100)}%"></i>`).join('');
// Cifras: cuentan desde cero cuando la portada está a la vista (datos de ejemplo en CONFIG.featured).
function countUp() {
  const goals = {rating: F.rating, sold: F.sold, reviews: F.reviews}, t0 = performance.now(), dur = reduce.matches ? 0 : 1600;
  const fmt = (k, v) => k === 'rating' ? v.toLocaleString('es-CO', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : Math.round(v).toLocaleString('es-CO');
  feat.classList.add('is-counting');
  const step = now => {
    const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 4);
    $$('[data-count]', feat).forEach(el => { const key = el.dataset.count; el.textContent = fmt(key, goals[key] * e); });
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
if (F.showStats) {
  $('[data-bar="sold"]', feat).style.setProperty('--to', '86%'); $('[data-bar="reviews"]', feat).style.setProperty('--to', '64%');
  new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); setTimeout(countUp, 350); } }, {threshold: .4}).observe($('.feature-stats', feat));
} else $('.feature-stats', feat).remove();
$('[data-feature-add]', feat).addEventListener('click', e => {
  const b = e.currentTarget; b.disabled = true;
  flyToCart($('.lamp-stage', feat), artSVG(fp.art, fp.tones[0])).then(() => { store.add(fp.id, fp.tones[0], 1); b.disabled = false; });
});
const fallback = () => { $('.lamp-stage', feat).insertAdjacentHTML('afterbegin', `<div class="lamp-fallback">${artSVG(fp.art, fp.tones[0])}</div>`); };
import('./lamp3d.js')
  .then(({mountLamp}) => mountLamp($('.lamp-stage', feat), {labels: F.parts, button: $('[data-explode]', feat),
    onExplode: open => feat.classList.toggle('is-exploded', open)}) || fallback())
  .catch(fallback);

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

function render() {
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
  grid.classList.remove('is-fresh'); void grid.offsetWidth; grid.classList.add('is-fresh');
}
grid.addEventListener('click', e => { if (e.target.closest('[data-more]')) { STATE.shown += 15; render(); } });
bindCards(grid);
drawChips(); render();
if (params.has('cat') || params.has('q') || location.hash === '#catalogo') requestAnimationFrame(() => $('#catalogo').scrollIntoView());
