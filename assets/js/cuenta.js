import {shell, $, $$, store, artSVG, esc} from './ui.js';
import {PRODUCTS} from './data.js';

shell();

// Favoritos
function favs() {
  const list = PRODUCTS.filter(p => store.isFav(p.id));
  $('.fav-list').innerHTML = list.length ? list.map(p => `<a class="sp-hit" href="producto.html?id=${p.id}"><span class="sp-art">${artSVG(p.art, p.tones[0])}</span><span>${esc(p.name)}</span>${store.priceTag(p.price)}</a>`).join('')
    : '<p class="hint">Toca el corazón de un producto para guardarlo aquí.</p>';
}
favs(); store.on('fav', favs);
