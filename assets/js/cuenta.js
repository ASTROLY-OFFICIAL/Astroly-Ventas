// Cuenta: el cliente diligencia sus datos. En Shopify esto lo cubren las cuentas de cliente
// y la libreta de direcciones; aquí se guarda en el navegador para la vista previa.
import {shell, $, $$, store, artSVG, esc} from './ui.js';
import {PRODUCTS} from './data.js';

const mascot = shell();
const form = $('.account-form'), status = $('[data-status]'), greet = $('[data-greeting]');
const DEPTOS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];
form.departamento.innerHTML = '<option value="">Elige uno</option>' + DEPTOS.map(d => `<option>${d}</option>`).join('');

// Cargar lo guardado
const saved = store.getAccount();
Object.entries(saved).forEach(([k, v]) => { const f = form.elements[k]; if (!f) return; if (f.type === 'checkbox') f.checked = !!v; else f.value = v; });
if (saved.nombre) greet.textContent = `Hola, ${saved.nombre}. Revisa que tus datos estén al día.`;

// La mascota "escribe" mientras llenas el formulario y te saluda por tu nombre.
let typingT = 0, greeted = !!saved.nombre;
form.addEventListener('input', e => {
  clearTimeout(typingT); typingT = setTimeout(() => mascot.react('typing'), 80);
  e.target.closest('.field')?.classList.remove('is-bad');
});
form.nombre.addEventListener('change', () => {
  const n = form.nombre.value.trim().split(' ')[0];
  if (n && !greeted) { greeted = true; mascot.react('hello', {name: n}); }
});

const RULES = {
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Ese correo no parece válido.',
  celular: v => /^\+?[\d\s-]{10,15}$/.test(v) || 'El celular debe tener 10 dígitos.',
  documento: v => /^[\d.-]{5,15}$/.test(v) || 'Revisa el número de documento.'
};
form.addEventListener('submit', e => {
  e.preventDefault();
  let first = null, msg = '';
  $$('[required]', form).forEach(f => {
    const v = f.value.trim(), rule = RULES[f.name], ok = v && (!rule || rule(v) === true);
    f.closest('.field').classList.toggle('is-bad', !ok);
    if (!ok && !first) { first = f; msg = !v ? 'Falta llenar un dato.' : rule(v); }
  });
  if (first) { first.focus(); status.textContent = msg; mascot.react('invalid', {text: msg}); return; }
  const data = Object.fromEntries([...form.elements].filter(f => f.name).map(f => [f.name, f.type === 'checkbox' ? f.checked : f.value.trim()]));
  store.saveAccount(data);
  status.textContent = 'Guardado.';
  greet.textContent = `Hola, ${data.nombre}. Tus datos quedaron guardados.`;
  mascot.react('saved');
});

// Favoritos
function favs() {
  const list = PRODUCTS.filter(p => store.isFav(p.id));
  $('.fav-list').innerHTML = list.length ? list.map(p => `<a class="sp-hit" href="producto.html?id=${p.id}"><span class="sp-art">${artSVG(p.art, p.tones[0])}</span><span>${esc(p.name)}</span>${store.priceTag(p.price)}</a>`).join('')
    : '<p class="hint">Toca el corazón de un producto para guardarlo aquí.</p>';
}
favs(); store.on('fav', favs);
