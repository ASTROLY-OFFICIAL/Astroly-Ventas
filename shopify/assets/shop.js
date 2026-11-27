import {createMascot} from './mascota.js';
import {emit} from './events.js';

const mascot = createMascot();
if (document.body.dataset.page === 'index') mascot.react('greet');
const themeKey = 'astroly-theme';
try { document.documentElement.dataset.theme = localStorage.getItem(themeKey) || 'light'; } catch {}
for (const toggle of document.querySelectorAll('[data-theme-toggle]')) {
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(themeKey, theme); } catch {}
    emit('theme', {theme});
  });
}

document.addEventListener('change', event => {
  const select = event.target.closest('[data-card-variant]');
  if (!select) return;
  const card = select.closest('[data-card]');
  const option = select.selectedOptions[0];
  for (const link of card.querySelectorAll('[data-product-link]')) link.href = option.value;
  card.querySelector('[data-price]').textContent = option.dataset.price;
  const photo = card.querySelector('.card-stage img');
  if (photo && option.dataset.image) {
    photo.removeAttribute('srcset');
    photo.src = option.dataset.image;
    photo.alt = option.dataset.alt || '';
  }
  mascot.react('tone');
});

document.addEventListener('click', event => {
  const thumb = event.target.closest('[data-photo]');
  if (!thumb || event.ctrlKey || event.metaKey) return;
  const photo = document.querySelector('.pdp-stage img');
  if (!photo) return;
  event.preventDefault();
  photo.removeAttribute('srcset');
  photo.src = thumb.href;
  photo.alt = thumb.dataset.alt;
  mascot.react('zoom');
});

document.addEventListener('click', event => {
  if (!event.target.closest('.nav-cart') || document.body.dataset.page === 'cart' || event.ctrlKey || event.metaKey) return;
  const panel = document.querySelector('[data-cart-panel]');
  if (!panel?.showModal) return;
  event.preventDefault();
  panel.showModal();
});

document.addEventListener('submit', async event => {
  const form = event.target.closest('form.shop-add');
  if (!form || !document.querySelector('[data-cart-panel]')?.showModal) return;
  event.preventDefault();
  const button = form.querySelector('[name="add"]');
  if (button.disabled) return;
  const data = new FormData(form);
  data.set('sections', 'panel-carrito');
  data.set('sections_url', location.pathname);
  const status = form.querySelector('[data-cart-error]');
  status.textContent = '';
  button.disabled = true;
  try {
    const response = await fetch(form.action + '.js', {method:'POST', body:data, headers:{Accept:'application/json'}});
    const result = await response.json();
    if (!response.ok) {
      status.textContent = result.description || 'Shopify no pudo añadir esta variante.';
      return;
    }
    const markup = result.sections?.['panel-carrito'];
    const panel = markup && new DOMParser().parseFromString(markup, 'text/html').querySelector('[data-cart-panel]');
    if (!panel) {
      location.assign(document.querySelector('.nav-cart').href);
      return;
    }
    document.querySelector('[data-cart-panel]').replaceWith(panel);
    document.querySelector('.nav-cart [data-count]').textContent = panel.dataset.count;
    emit('cart', {type:'add', qty:Number(data.get('quantity') || 1)});
    panel.showModal();
  } catch {
    status.textContent = 'No se pudo confirmar el cambio. Revisa tu carrito antes de volver a añadir.';
    const cart = document.querySelector('.nav-cart').cloneNode(false);
    cart.className = 'text-link';
    cart.textContent = 'Ver carrito';
    status.append(' ', cart);
  } finally {
    button.disabled = false;
  }
});
