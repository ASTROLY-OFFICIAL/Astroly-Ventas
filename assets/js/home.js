// Inicio: portada compacta, novedades y catálogo con filtros.
import {shell, productUrl, artSVG, $, $$, ICON, card, bindCards, reduce, store, COLLECTIONS, CONFIG, TONE_NAMES, esc, norm} from './ui.js';
import {PRODUCTS, byId} from './data.js';

const mascot = shell();

const featured = byId('lampara-halo') || PRODUCTS[0];
if (featured) {
  const link = $('[data-featured]');
  link.href = productUrl(featured.id, featured.tones[0]);
  link.innerHTML = `<span class="featured-art">${artSVG(featured.art, featured.tones[0])}</span>
    <span class="featured-info"><strong>${esc(featured.name)}</strong>${store.priceTag(featured.price)}<span>Ver producto →</span></span>`;
  link.hidden = false;
}
$('.search-icon').innerHTML = ICON.search;

// ── Intro: el isotipo 3D gira sobre la tarjeta de redes y se vuelve la mascota (primera visita).
if (!reduce.matches && !sessionStorage.getItem('astroly-intro') && scrollY < 50) {
  sessionStorage.setItem('astroly-intro', '1');
  mascot.prepare();
  import('./hero3d.js').then(({playIntro}) => playIntro($('.hero-slot'), {onSettle: () => mascot.assemble()}))
    .catch(() => mascot.assemble());
} else setTimeout(() => mascot.react('greet', {text: 'Hola de nuevo. ¿Qué buscamos hoy?'}), 600);

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
