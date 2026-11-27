// La mascota de astroly: un gato de casa en 8 bits, naranja brasa con collar blanco perla.
// Se dibuja píxel a píxel en un lienzo de 36×40 (con contorno grueso) y se escala con image-rendering: pixelated.
// Reacciona a lo que hace el cliente, se acicala si nadie hace nada, se duerme enroscado y se despierta.
//
// Dónde está:
//  · En la portada del inicio no aparece. Al bajar, entra de un salto y se sienta abajo a la derecha.
//  · Mientras haces scroll camina en su sitio (con la cola en alto); cuando paras, se sienta.
//  · En el pie de página se sienta sobre el borde (data-mascot-slot="footer").
//  · En otras páginas puede tener un sitio propio grande (data-mascot-slot="hero"), como el carrito vacío.
import {on} from './store.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 899px)');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const W = 36, H = 40, OX = 2, OY = 8;          // lienzo en píxeles; el gato ocupa 32×32 abajo
const COL = {
  out: '#06142e', body: '#d2461a', dark: '#a8360f', light: '#ff8a55', pearl: '#f3f0e8', eye: '#06142e',
  nose: '#f7b9a4', inner: '#f8c8b4', bell: '#f6c35b', fx: '#ff8a55', fx2: '#f3f0e8', tongue: '#f28c8c'
};
// Glifos de 8 bits para los efectos.
const GLYPH = {
  z: ['111', '001', '010', '100', '111'],
  heart: ['01010', '11111', '11111', '01110', '00100'],
  bang: ['1', '1', '1', '0', '1'],
  ask: ['111', '001', '011', '000', '010'],
  note: ['0011', '0010', '0010', '1110', '1100'],
  star: ['010', '111', '010'],
  coin: ['0110', '1001', '1011', '0110'],
  check: ['0001', '0010', '1100', '0100']
};
const FXCOL = {z: COL.fx2, ask: COL.fx2, bang: COL.fx2};

export function createMascot({root = document.body} = {}) {
  const el = document.createElement('div');
  el.className = 'mascot'; el.dataset.mode = 'hidden';
  el.innerHTML = `<button class="mascot-body" type="button" aria-label="Gato de astroly: tócalo para saludar">
      <canvas width="${W}" height="${H}"></canvas></button>
    <p class="mascot-bubble" role="status" aria-live="polite"></p>`;
  root.append(el);
  const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d'), btn = el.querySelector('.mascot-body');
  const bubble = el.querySelector('.mascot-bubble');
  const img = ctx.createImageData(W, H);

  const S = {
    mood: 'idle', moodUntil: 0, look: [0, 0], lookTarget: [0, 0], blinkAt: performance.now() + 2500,
    jumpStart: 0, jumps: 0, lastInput: performance.now(), clicks: [], sleeping: false,
    pos: null, mode: 'hidden', lastScrollT: 0, scrollDir: 1, saidFooter: false, entered: false, particles: []
  };

  let bubbleTimer = 0;
  function say(text, ms = 2400) {
    if (!text || S.mode === 'hidden') return;
    bubble.textContent = text; el.classList.add('is-talking');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => el.classList.remove('is-talking'), ms);
  }
  function emitFx(kind, n = 1, {dx = 0} = {}) {
    if (S.mode === 'hidden') return;
    for (let i = 0; i < n; i++) S.particles.push({kind, x: 18 + dx + rand(-8, 6), y: 8 + rand(-2, 3), vx: rand(-.35, .35), vy: rand(-.9, -.45), life: rand(1.1, 1.7), age: -i * .1});
  }
  function setMood(mood, ms = 1600) { S.mood = mood; S.moodUntil = performance.now() + ms; }
  function hop(times = 1) { if (reduce.matches) return; S.jumps = times; S.jumpStart = performance.now(); }
  function wake() {
    const was = S.sleeping; S.sleeping = false; el.classList.remove('is-asleep');
    if (was) { setMood('startle', 900); emitFx('bang'); hop(1); say(pick(['¡Miau! Estaba despierto…', 'Me quedé dormido.', '¡Ya volví!'])); }
  }
  function activity() { S.lastInput = performance.now(); if (S.sleeping) wake(); if (S.mood === 'groom') S.mood = 'idle'; }

  const PHRASES = {
    add: ['¡Buena elección!', '¡Al carrito!', 'Eso se verá increíble en casa.', 'Miau, me encanta.', 'Uno más para tu espacio.'],
    remove: ['Bueno… otra vez será.', 'Lo devuelvo a su lugar.', 'Miau…'],
    fav: ['¡A favoritos!', 'Yo también lo quiero.', 'Ronroneo aprobado.'],
    hover: ['Mmm, ese me gusta.', '¿Ese?', 'Buen ojo.'],
    usd: ['Ahora en dólares.', 'Modo internacional.'], cop: ['De vuelta a pesos.', 'Precios en pesos.'],
    light: ['¡Qué luz!', 'Modo día.'], dark: ['Modo noche. Mi favorito.', 'Hora de cazar sombras.'],
    search: ['Buscando…', 'Déjame olfatear…'], none: ['No encontré nada así.', 'Prueba otra palabra.'],
    checkout: ['¡A pagar! Yo te acompaño.', '¡Vamos!'],
    click: ['¡Miau!', 'Prrr…', '¡Hola!', 'Cuido tu carrito.', 'Me hiciste cosquillas.'],
    dizzy: ['Ya, ya… me mareo.', 'Demasiadas caricias.'],
    back: ['¡Volviste!', 'Te estaba esperando.'],
    empty: ['Tu carrito está vacío. Yo lo cuido.'],
    tone: ['Ese tono le queda.', '¡Otro color!', 'Me gusta más este.'],
    zoom: ['Déjame ver de cerca…', 'Qué detalle.'],
    night: ['Así se ve de noche.', 'Mis ojos ven en la oscuridad.'],
    saved: ['¡Datos guardados!', 'Listo, ya te conozco.'],
    invalid: ['Revisa ese dato.', 'Falta algo por ahí.'],
    footer: ['¡Gracias por pasar!', 'Aquí abajo también estoy.'],
    filter: ['Buena categoría.', 'Filtrando…'],
    enter: ['¡Miau! Te acompaño.', 'Aquí estoy.']
  };

  function react(type, data = {}) {
    const now = performance.now();
    if (type !== 'hover' && type !== 'unhover' && type !== 'typing') activity();
    switch (type) {
      case 'add': setMood('happy', 1500); hop(data.count > 1 ? 2 : 1); emitFx('heart', 3); if (Math.random() < .7) say(pick(PHRASES.add)); break;
      case 'more': setMood('happy', 900); hop(1); emitFx('coin', 1); break;
      case 'less': setMood('meh', 900); break;
      case 'remove': setMood('sad', 2200); say(pick(PHRASES.remove)); break;
      case 'fav': if (data.on) { setMood('love', 1800); hop(1); emitFx('heart', 4); say(pick(PHRASES.fav)); } else setMood('meh', 900); break;
      case 'hover':
        if (data.x != null) lookAt(data.x, data.y);
        if (S.mood === 'idle' || S.mood === 'curious') setMood('curious', 1200);
        if (Math.random() < .08 && now - (S.lastHoverSay || 0) > 9000) { say(pick(PHRASES.hover), 1500); S.lastHoverSay = now; }
        break;
      case 'unhover': break;
      case 'currency': setMood('dizzy', 1100); emitFx('coin', 3); say(pick(data.currency === 'USD' ? PHRASES.usd : PHRASES.cop), 1600); break;
      case 'theme': if (data.theme === 'dark') { setMood('sleepy', 1600); say(pick(PHRASES.dark), 1600); } else { setMood('shades', 2400); say(pick(PHRASES.light), 1600); } break;
      case 'search': setMood('read', 900); if (now - (S.lastSearchSay || 0) > 6000) { say(pick(PHRASES.search), 1200); S.lastSearchSay = now; } break;
      case 'noresults': setMood('confused', 2200); emitFx('ask', 2); say(pick(PHRASES.none)); break;
      case 'filter': setMood('happy', 900); hop(1); if (Math.random() < .5) say(pick(PHRASES.filter), 1200); break;
      case 'checkout': setMood('dance', 2600); hop(3); emitFx('note', 4); say(pick(PHRASES.checkout)); break;
      case 'empty': setMood('sad', 1800); say(pick(PHRASES.empty), 2600); break;
      case 'back': setMood('happy', 1200); hop(1); say(pick(PHRASES.back), 1800); break;
      case 'greet': setMood('wave', 2200); say(data.text || '¡Hola! Bienvenido a astroly.', 2800); break;
      case 'tone': setMood('happy', 1300); emitFx('star', 4); say(pick(PHRASES.tone), 1400); break;
      case 'zoom': setMood('magnify', 2400); say(pick(PHRASES.zoom), 1500); break;
      case 'night': setMood('sleepy', 2200); emitFx('star', 2); say(pick(PHRASES.night), 1500); break;
      case 'typing': setMood('write', 900); activity(); break;
      case 'hello': setMood('wave', 1800); hop(1); say(`¡Hola, ${data.name}!`, 1800); break;
      case 'saved': setMood('celebrate', 1600); hop(2); emitFx('check', 1); emitFx('star', 5); say(pick(PHRASES.saved)); break;
      case 'invalid': setMood('no', 1400); emitFx('ask', 1); say(data.text || pick(PHRASES.invalid), 2000); break;
      case 'click': {
        S.clicks = S.clicks.filter(t => now - t < 2500); S.clicks.push(now);
        if (S.clicks.length >= 5) { setMood('dizzy', 2000); emitFx('star', 5); say(pick(PHRASES.dizzy)); S.clicks = []; }
        else if (Math.random() < .5) { setMood('purr', 1600); emitFx('heart', 2); say('Prrr…', 1400); }
        else { setMood('wave', 1400); hop(1); say(pick(PHRASES.click), 1800); }
        break;
      }
    }
  }

  // ── Dibujo en píxeles: cada forma se prueba en coordenadas locales (con giro y desplazamiento),
  // después una pasada de contorno grueso, y encima bigotes y efectos sin contorno.
  const EYE_FOR = {
    happy: 'happy', love: 'heart', dizzy: 'dizzy', startle: 'big', curious: 'big', magnify: 'big', purr: 'closed',
    sleepy: 'half', meh: 'half', groom: 'closed', celebrate: 'happy', dance: 'happy', wave: 'happy', shades: 'open'
  };
  const grid = new Array(W * H), top = new Array(W * H);
  const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const tri = (x, y, [ax, ay], [bx, by], [cx, cy]) => {
    const s1 = (x - bx) * (ay - by) - (ax - bx) * (y - by), s2 = (x - cx) * (by - cy) - (bx - cx) * (y - cy), s3 = (x - ax) * (cy - ay) - (cx - ax) * (y - ay);
    return !((s1 < 0 || s2 < 0 || s3 < 0) && (s1 > 0 || s2 > 0 || s3 > 0));
  };
  // Pinta en la rejilla todas las celdas donde test(x, y) devuelve un color; T: giro (rad) y traslado.
  function fill(test, T = {}) {
    const {a = 0, px = 16, py = 20, dx = 0, dy = 0} = T, c = Math.cos(-a), s = Math.sin(-a);
    for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) {
      let x = gx - OX + .5 - dx - px, y = gy - OY + .5 - dy - py;
      const lx = x * c - y * s + px, ly = x * s + y * c + py;
      const col = test(lx, ly); if (col) grid[gy * W + gx] = col;
    }
  }
  // Pone píxeles sueltos (coordenadas locales) aplicando el mismo giro.
  function dots(list, col, T = {}, layer = grid) {
    const {a = 0, px = 16, py = 20, dx = 0, dy = 0} = T, c = Math.cos(a), s = Math.sin(a);
    list.forEach(([x, y]) => {
      const rx = x + .5 - px, ry = y + .5 - py;
      const gx = Math.floor(rx * c - ry * s + px + dx + OX), gy = Math.floor(rx * s + ry * c + py + dy + OY);
      if (gx >= 0 && gy >= 0 && gx < W && gy < H) layer[gy * W + gx] = col;
    });
  }
  const EYES = {
    open: [[0, 0, 'e'], [1, 0, 'p'], [0, 1, 'e'], [1, 1, 'e']],
    big: [[-1, -1, 'e'], [0, -1, 'e'], [1, -1, 'p'], [-1, 0, 'e'], [0, 0, 'e'], [1, 0, 'e'], [-1, 1, 'e'], [0, 1, 'e'], [1, 1, 'e']],
    happy: [[-1, 1, 'e'], [0, 0, 'e'], [1, 0, 'e'], [2, 1, 'e']],
    closed: [[-1, 0, 'e'], [0, 1, 'e'], [1, 1, 'e'], [2, 0, 'e']],
    half: [[-1, 1, 'e'], [0, 1, 'e'], [1, 1, 'e'], [2, 1, 'e']],
    heart: [[-1, -1, 'p'], [1, -1, 'p'], [-1, 0, 'p'], [0, 0, 'p'], [1, 0, 'p'], [0, 1, 'p']],
    dizzy: [[-1, -1, 'e'], [0, -1, 'e'], [1, -1, 'e'], [1, 0, 'e'], [1, 1, 'e'], [0, 1, 'e'], [-1, 1, 'e'], [-1, 0, 'e']]
  };
  function frame(now) {
    const t = now / 1000, idleFor = (now - S.lastInput) / 1000, dt = Math.min((now - (S.lastT || now)) / 1000, .05); S.lastT = now;
    if (S.mood !== 'idle' && now > S.moodUntil && S.mood !== 'groom') S.mood = 'idle';
    if (!S.sleeping && idleFor > 30 && !reduce.matches) { S.sleeping = true; el.classList.add('is-asleep'); S.mood = 'idle'; }
    else if (!S.sleeping && idleFor > 14 && S.mood === 'idle' && !reduce.matches) S.mood = 'groom';
    const m = S.sleeping ? 'sleep' : S.mood;
    const walking = !S.sleeping && S.mode === 'corner' && now - S.lastScrollT < 280 && !reduce.matches;
    grid.fill(null); top.fill(null);

    // mirada (máximo un píxel)
    S.look[0] += (S.lookTarget[0] - S.look[0]) * .15; S.look[1] += (S.lookTarget[1] - S.look[1]) * .15;
    let [lx, ly] = S.look;
    if (m === 'read') { lx = Math.sin(t * 5) * 1.2; ly = .8; }
    if (m === 'write') { lx = 0; ly = 1; }
    let blinking = false;
    if (now > S.blinkAt) { if (now - S.blinkAt < 140) blinking = true; else S.blinkAt = now + rand(2200, 5200); }

    if (m === 'sleep') {
      const br = Math.sin(t * 1.6) > 0 ? 0 : 1;
      fill((x, y) => { const d = Math.hypot(x - 27, y - 25.5); return d < 5.6 && d > 3.4 && (x > 26 || y > 26) ? COL.body : null; });
      fill((x, y) => ell(x, y, 18, 26.5 + br * .3, 11, 5.6 - br * .3) && y < 31 ? (x > 23 ? COL.dark : COL.body) : null);
      const T = {dy: br * .3};
      fill((x, y) => (tri(x, y, [5, 23], [5.5, 17], [9.5, 21]) || tri(x, y, [10, 20.5], [13.5, 17], [14, 23])) ? COL.body : null, T);
      fill((x, y) => ell(x, y, 9.5, 25.5, 6, 4.8) ? COL.body : null, T);
      fill((x, y) => ell(x, y, 9.5, 27, 3.4, 2) ? COL.light : null, T);
      fill((x, y) => ell(x, y, 19, 30, 9, 1.6) && x > 13 ? COL.light : null);
      dots([[6, 21], [12, 21]], COL.inner, T);
      dots([[6, 25], [7, 26], [8, 26], [11, 26], [12, 26], [13, 25], [9, 27], [10, 27]].slice(0, 6), COL.eye, T);
      dots([[9, 27], [10, 27]], COL.nose, T);
      dots([[16, 23], [17, 23], [18, 23], [19, 23]], COL.pearl, T);
      if (now - (S.lastZ || 0) > 1500) { S.lastZ = now; emitFx('z', 1, {dx: -8}); }
    } else {
      // cuerpo: respiración, caminar o bailar
      const bob = walking ? (Math.sin(t * 12) > 0 ? -1 : 0) : m === 'dance' ? (Math.sin(t * 9) > 0 ? -1 : 0) : 0;
      const breathe = Math.sin(t * 2.2) > .6 ? .4 : 0;
      // cola
      let ta = Math.sin(t * 1.4) * .25;
      if (walking || m === 'happy' || m === 'celebrate' || m === 'love') ta = -.55 + Math.sin(t * 8) * .3;
      if (m === 'dance') ta = Math.sin(t * 9) * .8;
      if (m === 'sad') ta = .5;
      if (m === 'startle') ta = -.9;
      const tail = [];
      for (let k = 0; k <= 1; k += .06) {
        const ang = -1.25 + ta - k * 1.5;      // empieza a la derecha del cuerpo y sube
        tail.push([22.5 + Math.cos(ang + 1.25 - ta) * k * 7 + k * k * 2, 29 - k * 9 + Math.sin(ang) * .4 * k]);
      }
      fill((x, y) => tail.some(([tx, ty], i) => Math.hypot(x - tx, y - ty) < (i > tail.length - 3 ? 1.5 : 1.35)) ? (y < 22 ? COL.light : COL.body) : null, {dy: bob});
      fill((x, y) => ell(x, y, 16, 24.6 + breathe * .5, 8.3, 7.4 - breathe * .4) && y < 31 ? (x > 20.5 ? COL.dark : COL.body) : null, {dy: bob});
      fill((x, y) => ell(x, y, 16, 26.5, 3.8, 3.8) && y < 31 ? COL.light : null, {dy: bob});
      // patas: alternan al caminar o al escribir
      const step = walking ? (Math.sin(t * 12) > 0 ? 1 : -1) : m === 'write' ? (Math.sin(t * 18) > 0 ? 1 : -1) : 0;
      const pawL = m === 'groom' ? null : [12.5, 30 - (step > 0 ? 1 : 0)], pawR = m === 'wave' ? null : [19.5, 30 - (step < 0 ? 1 : 0)];
      [pawL, pawR].forEach(pw => pw && fill((x, y) => ell(x, y, pw[0], pw[1], 2.6, 1.7) ? COL.light : null, {dy: bob}));
      // pata levantada: saludar o acicalarse
      if (m === 'wave') { const wv = Math.sin(t * 10) > 0 ? 1 : 0; fill((x, y) => ell(x, y, 24 + wv, 19 - wv, 2.2, 2.4) ? COL.light : null, {dy: bob}); }
      if (m === 'groom') fill((x, y) => ell(x, y, 14, 20.5, 2.2, 2.2) ? COL.light : null, {dy: bob});

      // cabeza
      let a = lx * .06, hx = 0, hy = bob;
      if (m === 'confused') a = .28;
      if (m === 'no') a = Math.sin(t * 22) * .22;
      if (m === 'dizzy') { a = Math.sin(t * 7) * .2; hx = Math.cos(t * 7) > 0 ? 1 : 0; }
      if (m === 'dance') a = Math.sin(t * 9) * .22;
      if (m === 'sad') { hy += 1; a = -.1; }
      if (m === 'write') { hy += 1; a = -.14; }
      if (m === 'groom') { hy += 1; a = .2; }
      if (m === 'curious') a = lx * .08 + .14;
      if (m === 'purr') hx = Math.sin(t * 60) > 0 ? .4 : 0;
      const T = {a, px: 16, py: 21, dx: hx, dy: hy};
      const earDown = m === 'sad' || m === 'no' ? 1.5 : 0, earUp = m === 'startle' || m === 'curious' ? 1 : 0;
      fill((x, y) => tri(x, y, [7.5, 12], [8.5 - earDown * 1.6, 3.5 - earUp + earDown], [13.5, 8.5]) || tri(x, y, [24.5, 12], [23.5 + earDown * 1.6, 3.5 - earUp + earDown], [18.5, 8.5]) ? COL.body : null, T);
      fill((x, y) => tri(x, y, [9.3, 10], [9.8 - earDown, 6 - earUp + earDown], [12, 8.6]) || tri(x, y, [22.7, 10], [22.2 + earDown, 6 - earUp + earDown], [20, 8.6]) ? COL.inner : null, T);
      fill((x, y) => ell(x, y, 16, 13.6, 8.8, 6.6) ? (x > 21.5 ? COL.dark : COL.body) : null, T);
      fill((x, y) => ell(x, y, 16, 16.8, 3.4, 2.1) ? COL.light : null, T);
      fill((x, y) => y >= 7.8 && y < 9 && x > 13 && x < 19 && x % 3 < 1 ? COL.dark : null, T);   // rayas de gato atigrado
      // collar perla con cascabel
      fill((x, y) => ell(x, y, 16, 21.4, 6.6, 1.5) && y > 20.6 ? COL.pearl : null, {dy: bob});
      dots([[15, 22], [16, 22], [15, 23], [16, 23]], COL.bell, {dy: bob}); dots([[15, 24], [16, 24]], COL.out, {dy: bob});

      // ojos
      const eye = blinking && EYE_FOR[m] === undefined ? 'half' : (EYE_FOR[m] || 'open');
      const ex = clamp(Math.round(lx), -1, 1), ey = clamp(Math.round(ly), -1, 1);
      const off = eye === 'open' || eye === 'big' ? [ex, ey] : [0, 0];
      [[12, 13], [19, 13]].forEach(([cx, cy]) => {
        EYES[eye].forEach(([x, y, k]) => dots([[cx + x + off[0], cy + y + off[1]]], k === 'p' ? COL.pearl : COL.eye, T));
      });
      // nariz y boca
      dots([[15, 15], [16, 15]], COL.nose, T);
      if (el.classList.contains('is-talking') || m === 'startle') dots([[15, 17], [16, 17], [15, 18], [16, 18]], COL.eye, T);
      else dots([[14, 17], [15, 16], [16, 16], [17, 17]], COL.eye, T);
      if (m === 'groom') dots([[15, 17], [16, 17]], COL.tongue, T);
      if (m === 'shades') { dots([...Array(12)].map((_, i) => [10 + i, 12]), COL.eye, T); dots([[11, 13], [12, 13], [13, 13], [18, 13], [19, 13], [20, 13], [12, 14], [19, 14]], COL.eye, T); }
      if (m === 'magnify') {
        const ring = []; for (let k = 0; k < 24; k++) ring.push([19.5 + Math.cos(k / 24 * 6.283) * 3.4, 13.5 + Math.sin(k / 24 * 6.283) * 3.4]);
        dots(ring, COL.pearl, T, top); dots([[23, 17], [24, 18], [25, 19]], COL.eye, T, top);
      }
      // bigotes (sin contorno)
      dots([[4, 15], [5, 15], [4, 17], [5, 17], [26, 15], [27, 15], [26, 17], [27, 17]], COL.pearl, T, top);
    }

    // contorno grueso
    const data = img.data; data.fill(0);
    const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const put = (i, c) => { const [r, g, b] = hex(c); data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (grid[i]) { put(i, grid[i]); continue; }
      if ((x > 0 && grid[i - 1]) || (x < W - 1 && grid[i + 1]) || (y > 0 && grid[i - W]) || (y < H - 1 && grid[i + W])) put(i, COL.out);
    }
    for (let i = 0; i < W * H; i++) if (top[i]) put(i, top[i]);
    // sombra en el piso
    for (let x = 7; x < 29; x++) { const i = (H - 1) * W + x; if (!data[i * 4 + 3]) { data[i * 4 + 3] = 70; } }
    // efectos
    S.particles = S.particles.filter(p => (p.age += dt) < p.life);
    S.particles.forEach(p => {
      if (p.age < 0) return;
      p.x += p.vx; p.y += p.vy * (reduce.matches ? 0 : 1);
      const g = GLYPH[p.kind] || GLYPH.star, c = FXCOL[p.kind] || COL.fx;
      g.forEach((row, ry) => [...row].forEach((v, rx) => {
        const x = Math.round(p.x) + rx, y = Math.round(p.y) + ry;
        if (v === '1' && x >= 0 && y >= 0 && x < W && y < H) put(y * W + x, c);
      }));
    });
    ctx.putImageData(img, 0, 0);

    // salto (en píxeles enteros del sprite)
    let jump = 0;
    if (S.jumps && !reduce.matches) {
      const k = (now - S.jumpStart) / 380;
      if (k >= S.jumps) S.jumps = 0; else jump = Math.round(Math.sin((k % 1) * Math.PI) * 5);
    }
    canvas.style.transform = `translateY(${(-jump * canvas.clientWidth / W).toFixed(1)}px)`;
  }

  // ── Posición
  let lastScroll = scrollY;
  addEventListener('scroll', () => {
    const dy = scrollY - lastScroll; lastScroll = scrollY;
    if (dy) { S.scrollDir = Math.sign(dy); S.lastScrollT = performance.now(); }
    activity();
  }, {passive: true});
  const size = () => narrow.matches ? 64 : 88;
  const tall = w => w * H / W;

  function visible(slot) {
    if (!slot) return null;
    const r = slot.getBoundingClientRect();
    if (!r.width || r.bottom < 40 || r.top > innerHeight - 30) return null;
    return r;
  }
  function place() {
    const slot = visible(document.querySelector('[data-mascot-slot="hero"]'));
    const foot = visible(document.querySelector('[data-mascot-slot="footer"]'));
    const cover = document.querySelector('body[data-page="home"] .hero')?.getBoundingClientRect();
    const onCover = cover && cover.bottom > innerHeight * .42;
    const mode = slot ? 'slot' : foot ? 'footer' : onCover ? 'hidden' : 'corner';
    const w = mode === 'slot' ? slot.width : mode === 'footer' ? foot.width : size();
    let target;
    if (mode === 'slot') target = {x: slot.left, y: slot.bottom - tall(w), w};
    else if (mode === 'footer') target = {x: foot.left, y: foot.bottom - tall(w), w};
    else {
      const bottom = narrow.matches ? 64 + 10 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe')) || 0) : 14;
      target = {x: innerWidth - w - (narrow.matches ? 6 : 10), y: innerHeight - bottom - tall(w), w};
      if (mode === 'hidden') target.y = innerHeight + 30;
    }
    if (mode !== S.mode) {
      const from = S.mode; S.mode = mode; el.dataset.mode = mode;
      if (mode === 'hidden') el.classList.remove('is-talking');
      if (mode === 'corner' && from === 'hidden') { hop(1); if (!S.entered) { S.entered = true; setTimeout(() => react('greet', {text: pick(PHRASES.enter)}), 350); } }
      if (mode === 'footer' && !S.saidFooter) { S.saidFooter = true; setTimeout(() => react('greet', {text: pick(PHRASES.footer)}), 450); }
      if (from === 'corner' && mode === 'footer') hop(1);
    }
    if (!S.pos || reduce.matches) S.pos = {...target};
    const f = .22;
    S.pos.x += (target.x - S.pos.x) * f; S.pos.y += (target.y - S.pos.y) * f; S.pos.w += (target.w - S.pos.w) * f;
    el.style.transform = `translate3d(${S.pos.x.toFixed(1)}px,${S.pos.y.toFixed(1)}px,0)`;
    el.style.width = `${S.pos.w.toFixed(1)}px`;
  }

  function lookAt(x, y) {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * .5), d = Math.hypot(dx, dy) || 1;
    S.lookTarget = [dx / d * Math.min(1.6, d / 60), dy / d * Math.min(1.6, d / 60)];
  }
  addEventListener('pointermove', e => {
    lookAt(e.clientX, e.clientY);
    const r = canvas.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    if (d < r.width * .7 && Math.hypot(e.movementX, e.movementY) > 45 && S.mood === 'idle') { setMood('startle', 600); hop(1); }
    activity();
  }, {passive: true});
  btn.addEventListener('pointerenter', () => { if (S.mood === 'idle') setMood('curious', 900); });
  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(type => addEventListener(type, activity, {passive: true}));
  btn.addEventListener('click', () => react('click'));
  addEventListener('dragstart', () => setMood('curious', 4000));
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt && performance.now() - hiddenAt > 8000) react('back');
  });

  on('cart', d => {
    if (d.type === 'add') react('add', {count: d.qty});
    else if (d.type === 'remove') react('remove');
    else if (d.type === 'more') react('more');
    else if (d.type === 'less') react('less');
  });
  on('fav', d => react('fav', d));
  on('currency', d => react('currency', d));
  on('theme', d => react('theme', d));

  function loop(now) { place(); frame(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  return {
    el, react, say, lookAt,
    // Para probar en la consola: astrolyMascot.idle(31) simula 31 s sin actividad (se acicala y se duerme).
    idle(sec) { S.lastInput = performance.now() - sec * 1000; },
    // Compatibilidad con la intro anterior: el gato no necesita armarse.
    assemble() { react('greet'); }, prepare() {}
  };
}
