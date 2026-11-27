// Inicio + catálogo en un solo recorrido.
import {shell, $, $$, ICON, card, bindCards, rise, reduce, store, artSVG, COLLECTIONS, CONFIG, esc, flyToCart, getMascot} from './ui.js';
import {PRODUCTS} from './data.js';

const mascot = shell('catalogo');

// ── Redes en la portada y en el cierre
const socialRow = s => `<li><a href="${s.url}" class="social-row"><span class="social-icon">${ICON[s.key]}</span><span class="social-name">${s.name}</span><span class="social-handle mono">${esc(s.handle)}</span><span class="social-arrow">${ICON.arrow}</span></a></li>`;
$('#social-list').innerHTML = CONFIG.socials.map(socialRow).join('');
$('#closing-list').innerHTML = CONFIG.socials.map(socialRow).join('');
$('.search-icon').innerHTML = ICON.search;

// ── Intro: isotipo 3D → mascota de 8 bits
const stage = $('.hero-stage');
const firstVisit = !sessionStorage.getItem('astroly-intro');
function settleHero() { stage.classList.add('is-settled'); document.body.classList.remove('is-intro'); $('.hero-copy h1').classList.add('is-in'); }
if (!reduce.matches && firstVisit && scrollY < 50) {
  sessionStorage.setItem('astroly-intro', '1'); document.body.classList.add('is-intro');
  mascot.prepare();
  import('./hero3d.js').then(({playIntro}) => playIntro($('.hero-slot'), {onSettle: () => { settleHero(); mascot.assemble(); }}))
    .catch(() => { settleHero(); mascot.assemble(); });
} else {
  stage.classList.add('is-quick'); settleHero();
  setTimeout(() => mascot.react('greet', {text: 'Hola de nuevo. ¿Qué buscamos hoy?'}), 600);
}
// Las mini ilustraciones del enunciado
$$('[data-art]').forEach(el => { el.innerHTML = artSVG(el.dataset.art, el.dataset.tone); });

// ── Novedades: riel horizontal ligado al scroll (en celular, carrusel deslizable)
const featured = PRODUCTS.filter(p => p.badge).concat(PRODUCTS.filter(p => !p.badge)).slice(0, 7);
const track = $('.showroom-track');
track.innerHTML = featured.map((p, i) => `<article class="plinth" data-id="${p.id}" data-tone="${p.tones[0]}">
  <a class="plinth-stage" href="producto.html?id=${p.id}"><span class="plinth-art">${artSVG(p.art, p.tones[0])}</span><span class="plinth-num mono">${String(i + 1).padStart(2, '0')}</span></a>
  <div class="plinth-info"><div><h3>${esc(p.name)}</h3><p>${esc(p.short)}</p></div>
    <div class="plinth-buy">${store.priceTag(p.price)}<button type="button" class="button small" data-add>Añadir ${ICON.plus}</button></div></div>
</article>`).join('');
$('.showroom-count span').textContent = String(featured.length).padStart(2, '0');
track.addEventListener('click', e => {
  const b = e.target.closest('[data-add]'); if (!b) return;
  const pl = b.closest('.plinth'), p = PRODUCTS.find(x => x.id === pl.dataset.id);
  flyToCart($('.plinth-art', pl), artSVG(p.art, pl.dataset.tone)).then(() => store.add(p.id, pl.dataset.tone, 1));
});
const showroom = $('.showroom'), plinths = $$('.plinth', track), bar = $('.showroom-bar i'), countB = $('.showroom-count b');
const wide = matchMedia('(min-width: 900px)');
function layoutShowroom() {
  if (!wide.matches || reduce.matches) { showroom.style.height = ''; track.style.transform = ''; showroom.classList.remove('is-pinned'); return; }
  showroom.classList.add('is-pinned');
  const travel = track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
  showroom.style.height = `${innerHeight + Math.max(0, travel) * 1.05}px`;
  showroom.dataset.travel = Math.max(0, travel);
}
function onShowroomScroll() {
  let k;
  if (showroom.classList.contains('is-pinned')) {
    const r = showroom.getBoundingClientRect(), total = showroom.offsetHeight - innerHeight;
    k = Math.min(Math.max(-r.top / total, 0), 1);
    track.style.transform = `translate3d(${(-k * +showroom.dataset.travel).toFixed(1)}px,0,0)`;
  } else {
    k = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
  }
  bar.style.transform = `scaleX(${Math.max(.04, k)})`;
  // La pieza más cercana al centro se enciende.
  let best = 0, bestD = Infinity;
  plinths.forEach((p, i) => { const r = p.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - innerWidth / 2); if (d < bestD) { bestD = d; best = i; } });
  plinths.forEach((p, i) => p.classList.toggle('is-center', i === best));
  countB.textContent = String(best + 1).padStart(2, '0');
}
addEventListener('scroll', onShowroomScroll, {passive: true});
track.addEventListener('scroll', onShowroomScroll, {passive: true});
addEventListener('resize', () => { layoutShowroom(); onShowroomScroll(); });
wide.addEventListener('change', () => { layoutShowroom(); onShowroomScroll(); });

// ── Colecciones: filas con vista previa; elegir una filtra el catálogo.
const rows = $('.collection-rows'), cArt = $('.collection-art'), cCap = $('.collection-caption');
rows.innerHTML = COLLECTIONS.map((c, i) => {
  const n = PRODUCTS.filter(p => p.col === c.key).length;
  return `<li><button type="button" class="c-row" data-col="${c.key}" ${c.soon ? 'data-soon' : ''}>
    <span class="c-num mono">${String(i + 1).padStart(2, '0')}</span><span class="c-name">${c.name}</span>
    <span class="c-line">${c.line}</span><span class="c-count mono">${c.soon ? 'Pronto' : `${n} ${n === 1 ? 'pieza' : 'piezas'}`}</span><span class="c-plus" aria-hidden="true">${ICON.arrow}</span></button></li>`;
}).join('');
let pinned = 0;
function preview(i) {
  const c = COLLECTIONS[i];
  cArt.innerHTML = artSVG(c.art, i % 2 ? 's' : 'm'); cArt.classList.remove('is-swap'); void cArt.offsetWidth; cArt.classList.add('is-swap');
  cCap.textContent = `${String(i + 1).padStart(2, '0')} · ${c.name}`;
  $$('.c-row', rows).forEach((r, k) => r.classList.toggle('is-active', k === i));
}
preview(0);
rows.addEventListener('pointerover', e => { const r = e.target.closest('.c-row'); if (r) preview($$('.c-row', rows).indexOf(r)); });
rows.addEventListener('focusin', e => { const r = e.target.closest('.c-row'); if (r) preview($$('.c-row', rows).indexOf(r)); });
rows.addEventListener('pointerleave', () => preview(pinned));
rows.addEventListener('click', e => {
  const r = e.target.closest('.c-row'); if (!r) return;
  if (r.hasAttribute('data-soon')) { mascot.say('Estamos preparando nuevas categorías. ¡Atento a las redes!', 2800); return; }
  pinned = $$('.c-row', rows).indexOf(r); setFilter(r.dataset.col);
  $('#catalogo').scrollIntoView({behavior: reduce.matches ? 'auto' : 'smooth'});
});

// ── Catálogo: filtros, búsqueda, orden y "ver más"
const grid = $('.grid'), filters = $('.filters'), input = $('.search input'), sort = $('.sort select'), results = $('.results'), empty = $('.catalog-empty');
const STATE = {col: 'todo', q: '', sort: 'rel', shown: 8};
filters.innerHTML = [{key: 'todo', name: 'Todo'}, ...COLLECTIONS.filter(c => !c.soon)].map(c => `<button type="button" class="chip" data-col="${c.key}" aria-pressed="${c.key === 'todo'}">${c.name}</button>`).join('');
filters.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setFilter(b.dataset.col); });
function setFilter(col) { STATE.col = col; STATE.shown = 8; $$('.chip', filters).forEach(b => b.setAttribute('aria-pressed', b.dataset.col === col)); render(); }
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
let searchT = 0;
input.addEventListener('input', () => {
  STATE.q = input.value; STATE.shown = 8; mascot.react('search');
  clearTimeout(searchT); searchT = setTimeout(render, 120);
});
sort.addEventListener('change', () => { STATE.sort = sort.value; render(); });
$('[data-reset]').addEventListener('click', () => { input.value = ''; STATE.q = ''; setFilter('todo'); });

function render() {
  let list = PRODUCTS.filter(p => (STATE.col === 'todo' || p.col === STATE.col) && (!STATE.q || norm(p.name + ' ' + p.short).includes(norm(STATE.q))));
  if (STATE.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
  if (STATE.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
  if (STATE.sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const total = list.length;
  grid.innerHTML = list.slice(0, STATE.shown).map(card).join('') +
    (total > STATE.shown ? `<button type="button" class="more" data-more>Ver ${Math.min(8, total - STATE.shown)} más <span class="mono">${STATE.shown}/${total}</span></button>` : '');
  results.textContent = `${total} ${total === 1 ? 'producto' : 'productos'}`;
  empty.hidden = total > 0;
  if (!total && STATE.q) mascot.react('noresults');
  grid.classList.remove('is-fresh'); void grid.offsetWidth; grid.classList.add('is-fresh');
}
grid.addEventListener('click', e => { if (e.target.closest('[data-more]')) { STATE.shown += 8; render(); } });
bindCards(grid);
render();
if (location.hash === '#catalogo') requestAnimationFrame(() => $('#catalogo').scrollIntoView());

// ── Barra de capítulos: aparece después de la portada, marca la sección y el progreso.
const chapter = $('.chapter-bar'), progress = $('.chapter-progress'), now = $('.chapter-now');
const sections = ['inicio', 'destacados', 'colecciones', 'catalogo'].map(id => document.getElementById(id));
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${(scrollY / Math.max(1, max)).toFixed(4)})`;
  chapter.classList.toggle('is-on', scrollY > innerHeight * .8);
  let cur = sections[0];
  sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s; });
  $$('[data-chapter]', chapter).forEach(a => a.classList.toggle('is-active', a.dataset.chapter === cur.id));
  now.textContent = $(`[data-chapter="${cur.id}"]`, chapter).textContent;
  // Portada: la palabra gigante se desplaza más despacio que el resto (profundidad)
  if (!reduce.matches && scrollY < innerHeight * 1.2) $('.hero-giant').style.translate = `0 calc(-50% + ${(scrollY * .35).toFixed(1)}px)`;
}
addEventListener('scroll', onScroll, {passive: true});
document.fonts?.ready.then(() => { layoutShowroom(); onShowroomScroll(); onScroll(); });
layoutShowroom(); onShowroomScroll(); onScroll();
rise();
