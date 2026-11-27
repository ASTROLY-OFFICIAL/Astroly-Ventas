// Estado de la tienda en el navegador: carrito, moneda, favoritos y un bus de eventos
// que escucha la mascota. En Shopify el carrito vive en /cart.js (Ajax API); las funciones
// add / setQty / remove quedan con la misma forma para cambiarlas por esas llamadas.
import {CONFIG, byId} from './data.js';

import {emit} from './events.js';
export {on, emit} from './events.js';

const KEY = {cart: 'astroly-cart', cur: 'astroly-currency', fav: 'astroly-favs'};
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// Moneda: COP o USD, elegida por el cliente y recordada.
let currency = read(KEY.cur, CONFIG.defaultCurrency);
export const getCurrency = () => currency;
export function setCurrency(c) {
  if (c === currency) return;
  currency = c; write(KEY.cur, c);
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money(+el.dataset.price); });
  document.querySelectorAll('[data-currency-btn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.currencyBtn === c));
  emit('currency', {currency: c});
}
const fmtCOP = new Intl.NumberFormat('es-CO', {maximumFractionDigits: 0});
const fmtUSD = new Intl.NumberFormat('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export function money(cop) {
  if (currency === 'USD') return `US$ ${fmtUSD.format(cop / CONFIG.usdRate)}`;
  return `$ ${fmtCOP.format(cop)}`;
}
// Un precio que se actualiza solo al cambiar de moneda.
export const priceTag = (cop, cls = '') => `<span class="price ${cls}" data-price="${cop}">${money(cop)}</span>`;

// Carrito: líneas {id, tone, qty}.
let cart = read(KEY.cart, []).filter(l => byId(l.id));
const save = () => write(KEY.cart, cart);
export const lines = () => cart.map(l => ({...l, product: byId(l.id)}));
export const count = () => cart.reduce((s, l) => s + l.qty, 0);
export const subtotal = () => cart.reduce((s, l) => s + l.qty * byId(l.id).price, 0);

export function add(id, tone, qty = 1, origin = null) {
  const p = byId(id); if (!p) return;
  tone = tone || p.tones[0];
  const line = cart.find(l => l.id === id && l.tone === tone);
  if (line) line.qty += qty; else cart.push({id, tone, qty});
  save(); emit('cart', {type: 'add', id, tone, qty, origin, product: p});
}
export function setQty(id, tone, qty) {
  const line = cart.find(l => l.id === id && l.tone === tone); if (!line) return;
  const before = line.qty;
  if (qty <= 0) return remove(id, tone);
  line.qty = Math.min(qty, 99); save();
  emit('cart', {type: qty > before ? 'more' : 'less', id, tone});
}
export function remove(id, tone) {
  cart = cart.filter(l => !(l.id === id && l.tone === tone)); save();
  emit('cart', {type: 'remove', id, tone});
}
export function clear() { cart = []; save(); emit('cart', {type: 'clear'}); }

// Favoritos.
let favs = new Set(read(KEY.fav, []));
export const isFav = id => favs.has(id);
export function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  write(KEY.fav, [...favs]); emit('fav', {id, on: favs.has(id)});
  return favs.has(id);
}

// Otra pestaña cambió el carrito: se sincroniza.
addEventListener('storage', e => {
  if (e.key === KEY.cart) { cart = read(KEY.cart, []).filter(l => byId(l.id)); emit('cart', {type: 'sync'}); }
});
