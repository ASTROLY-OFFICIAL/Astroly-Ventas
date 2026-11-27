// Página del carrito: líneas con cantidad, resumen en banda invertida y pago.
// Si está vacío, la mascota baja grande al centro de la página.
import {shell, $, $$, card, bindCards, bindLines, lineRow, store, checkout} from './ui.js';
import {PRODUCTS} from './data.js';

const mascot = shell();
const box = $('.cart-lines'), empty = $('.cart-empty'), summary = $('.summary');
$$('[data-currency-btn]', summary).forEach(b => {
  b.setAttribute('aria-pressed', b.dataset.currencyBtn === store.getCurrency());
  b.addEventListener('click', () => store.setCurrency(b.dataset.currencyBtn));
});
$('[data-checkout]', summary).addEventListener('click', checkout);

let wasEmpty = null;
function render() {
  const ls = store.lines(), isEmpty = !ls.length;
  box.innerHTML = ls.map(lineRow).join('');
  box.hidden = summary.hidden = isEmpty; empty.hidden = !isEmpty;
  if (isEmpty && wasEmpty === false) mascot.react('empty');
  wasEmpty = isEmpty;
}
bindLines(box);
store.on('cart', render);
render();
if (wasEmpty) setTimeout(() => mascot.react('empty'), 700);

const picks = PRODUCTS.filter(p => p.badge).concat(PRODUCTS).filter((p, i, a) => a.indexOf(p) === i).slice(0, 4);
const grid = $('.related .grid'); grid.innerHTML = picks.map((x, i) => card(x, i)).join(''); bindCards(grid);

