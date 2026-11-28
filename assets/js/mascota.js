// La mascota de Astroly: Astro, una estrellita de 8 bits, negra con ojos blancos.
// Es una estrella gordita de cinco puntas dibujada píxel a píxel: la punta de arriba es su cabeza, las de los lados
// son sus brazos y las de abajo sus piernas. Mueve las puntas para saludar, celebrar, leer o volar.
// Reacciona a lo que hace el cliente, une estrellas en una constelación si nadie hace nada, se duerme y se despierta.
//
// Dónde está:
//  · En el inicio no sale mientras se ve la escena de la portada (allí la estrellita tiene su propia animación).
//  · Al bajar flota a la derecha de la pantalla. Cuando haces scroll se transforma en estrella fugaz con una estela
//    de escarcha: si bajas, cae con paracaídas; si subes, vuela con un jetpack. Al parar, se queda flotando.
//  · En el pie de página se sienta sobre el borde (data-mascot-slot="footer") y en otras páginas puede tener un
//    sitio grande propio (data-mascot-slot="hero"), como el carrito vacío.
//
// paintStar, paintFace, line y PAL se exportan para que la escena de la portada dibuje la misma estrellita.
import {on} from './store.js';

const PAD = 16;                              // filas libres arriba del sprite para el paracaídas
const W = 56, H = 48 + PAD + 10;             // resolución en píxeles del sprite (+10 abajo para las llamas)
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// ── Forma: estrella de cinco puntas, gordita (radio interior alto) para que se lea como personaje.
const BODY = {cx: 28, cy: 27 + PAD, R: 19, r: 10.5};
BODY.top = BODY.cy - BODY.R + 1; BODY.bottom = BODY.cy + 15;
BODY.ex = BODY.cx + 4; BODY.ey = BODY.cy - 2;
// Constelación que va uniendo cuando nadie hace nada (coordenadas del sprite).
const SKY = [[4, 16], [8, 6], [17, 10], [39, 5], [47, 11], [52, 22]].map(([x, y]) => [x, y + PAD]);

export const PAL = {
  light: {body: '#141519', hi: '#30333b', lo: '#020203', out: null, eye: '#f6f6f4', pupil: '#141519', fx: '#0a0a0a', soft: '#262626', web: 'rgba(0,0,0,.4)',
    frost: ['#ffffff', '#eaf3ff', '#c4d9f5'], chute: '#f4f4f2', chute2: '#c9ccd2', cord: '#2b2e34', metal: '#5a5e66', metalHi: '#8a8f98', flame: ['#fff4cf', '#ffc24a', '#ff7a2f']},
  dark: {body: '#141519', hi: '#30333b', lo: '#020203', out: '#d9dbe0', eye: '#f6f6f4', pupil: '#141519', fx: '#f2f2f2', soft: '#8c8c8c', web: 'rgba(255,255,255,.45)',
    frost: ['#ffffff', '#eaf3ff', '#c4d9f5'], chute: '#f4f4f2', chute2: '#9ea3ab', cord: '#c9ccd2', metal: '#5a5e66', metalHi: '#8a8f98', flame: ['#fff4cf', '#ffc24a', '#ff7a2f']}
};

// Glifos de 8 bits para los efectos.
const GLYPH = {
  z: ['111', '001', '010', '100', '111'],
  heart: ['01010', '11111', '11111', '01110', '00100'],
  bang: ['11', '11', '11', '00', '11'],
  ask: ['111', '001', '011', '000', '010'],
  note: ['0011', '0010', '0010', '1110', '1100'],
  star: ['010', '111', '010'],
  drop: ['010', '111', '111', '010'],
  coin: ['0110', '1001', '1011', '0110'],
  check: ['0001', '0010', '1100', '0100']
};
// Ojos especiales (5×5, centrados en cada ojo).
const EYES = {
  heart: ['01010', '11111', '11111', '01110', '00100'],
  dizzy: ['11111', '10001', '10101', '10111', '10000'],
  happy: ['00000', '01110', '10001', '00000', '00000'],
  closed: ['00000', '00000', '11111', '00000', '00000']
};
const SMILE = {
  celebrate: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]], happy: [[-1, 0], [0, 1], [1, 0]], love: [[-1, 0], [0, 1], [1, 0]],
  dance: [[-1, 0], [0, 1], [1, 0]], wave: [[-1, 0], [0, 1], [1, 0]], hello: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]],
  startle: [[0, 0], [0, 1], [-1, 0], [1, 0], [-1, 1], [1, 1]], sad: [[-1, 1], [0, 0], [1, 1]], no: [[-1, 1], [0, 1], [1, 1]],
  confused: [[-2, 1], [-1, 0], [0, 1], [1, 0]], dizzy: [[-1, 0], [0, 1], [1, 0], [2, 1]], paint: [[-1, 0], [0, 1], [1, 0]],
  shades: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]], write: [[0, 0], [1, 0]], idle: [[-1, 0], [0, 1], [1, 0]],
  curious: [[0, 0], [0, 1]], read: [[0, 0], [1, 0]], magnify: [[0, 0], [1, 0]], sleep: [[0, 0]], meh: [[-1, 0], [0, 0], [1, 0]],
  sleepy: [[0, 0], [0, 1]], fly: [[-1, 0], [0, 0], [1, 0]]
};

// ── Pintores compartidos (la mascota y la escena de la portada).
// Estrella: cinco puntas con desplazamiento por punta (tip[i] = [dx, dy]), sombreado y contorno de 2 px si pal.out.
export function paintStar(put, {cx, cy, R = BODY.R, r = BODY.r, tip = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], pal, ak = 1, lean = 0}) {
  const poly = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + lean, b = a + Math.PI / 5;
    poly.push([cx + Math.cos(a) * R + tip[i][0], cy + Math.sin(a) * R + tip[i][1]]);
    poly.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]);
  }
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const x0 = Math.floor(cx - R - 12), x1 = Math.ceil(cx + R + 12), y0 = Math.floor(cy - R - 12), y1 = Math.ceil(cy + R + 12);
  const cells = new Set(), key = (x, y) => (x + 1024) * 4096 + y + 1024;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x + .5, y + .5)) cells.add(key(x, y));
  const has = (x, y) => cells.has(key(x, y));
  let idx = 0;
  for (const k of cells) {
    const kx = Math.floor(k / 4096), x = kx - 1024, y = k - kx * 4096 - 1024;
    if (ak < 1 && ((idx++ * 7919) % 97) / 97 >= ak) continue;
    const top = !has(x, y - 1), left = !has(x - 1, y), right = !has(x + 1, y), bottom = !has(x, y + 1);
    put(x, y, top || (left && y < cy) ? pal.hi : bottom || right || !has(x + 2, y) || !has(x, y + 2) ? pal.lo : pal.body);
    if (pal.out) [[0, -1], [-1, 0], [1, 0], [0, 1], [0, 2], [2, 0], [-2, 0], [1, 1], [-1, 1]].forEach(([dx, dy]) => {
      if (!has(x + dx, y + dy) && !(dy === 2 && has(x, y + 1)) && !(Math.abs(dx) === 2 && has(x + Math.sign(dx), y))) put(x + dx, y + dy, pal.out);
    });
  }
  return poly;
}
// Cara: ojos blancos con pupila que mira (lx, ly entre -1 y 1), ojos especiales según el ánimo y boca blanca.
// small: versión de 1×2 para la escena de la portada.
export function paintFace(put, {cx, cy, pal, mood = 'idle', lx = 0, ly = 0, blinking = false, small = false}) {
  const special = {love: 'heart', dizzy: 'dizzy', celebrate: 'happy', dance: 'happy', happy: 'happy', hello: 'happy', paint: 'happy', wave: 'happy'}[mood]
    || (mood === 'sleep' || (blinking && mood !== 'shades') ? 'closed' : null);
  if (small) {
    [[cx - 3, cy - 1], [cx + 2, cy - 1]].forEach(([x, y]) => {
      if (special === 'happy') { put(x - 1, y + 1, pal.eye); put(x, y, pal.eye); put(x + 1, y + 1, pal.eye); }
      else if (special === 'closed') { put(x - 1, y + 1, pal.eye); put(x, y + 1, pal.eye); put(x + 1, y + 1, pal.eye); }
      else { put(x + (lx > .3 ? 1 : 0), y + (ly > .3 ? 1 : 0), pal.eye); put(x + (lx > .3 ? 1 : 0), y + 1 + (ly > .3 ? 1 : 0), pal.eye); }
    });
    if (['happy', 'celebrate', 'hello', 'wave'].includes(mood)) { put(cx - 1, cy + 3, pal.eye); put(cx, cy + 4, pal.eye); put(cx + 1, cy + 3, pal.eye); }
    else if (mood === 'no' || mood === 'confused') { put(cx - 1, cy + 4, pal.eye); put(cx, cy + 4, pal.eye); put(cx + 1, cy + 4, pal.eye); }
    else put(cx, cy + 3, pal.eye);
    return;
  }
  const eyes = [[cx - 6, cy - 2], [cx + 3, cy - 2]];
  if (special) {
    eyes.forEach(([x0, y0]) => EYES[special].forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(x0 - 1 + rx, y0 - 2 + ry, pal.eye))));
  } else {
    const big = ['curious', 'startle', 'confused', 'magnify'].includes(mood);
    eyes.forEach(([x0, y0]) => {
      const w = 3, h = big ? 5 : 4;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) put(x0 - 1 + x, y0 - 1 + y, pal.eye);
      // pupila de 1×2 dentro del ojo blanco
      const px = x0 + Math.round(clamp(lx, -1, 1)), py = y0 + Math.round(clamp(ly, -1, 1) * (big ? 1.5 : 1)) + (big ? 1 : 0);
      put(px, py, pal.pupil); put(px, py + 1, pal.pupil);
      if (mood === 'sleepy' || mood === 'meh') for (let x = -1; x < 2; x++) { put(x0 + x, y0 - 1, pal.body); put(x0 + x, y0, pal.body); }
      if (mood === 'sad' || mood === 'no') put(x0 + (x0 < cx ? 1 : -1), y0 - 3, pal.eye);   // ceja caída
      if (mood === 'confused' && x0 > cx) { put(x0 - 1, y0 - 3, pal.eye); put(x0, y0 - 3, pal.eye); }
    });
  }
  (SMILE[mood] || SMILE.idle).forEach(([dx, dy]) => put(cx - 1 + dx, cy + 3 + dy, pal.eye));
}
// Línea de píxeles (Bresenham) y su versión de 2 px de grosor.
export function line(put, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, guard = 0;
  while (guard++ < 300) { put(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
}
function thick(put, x0, y0, x1, y1, c, dir = 1) {
  line(put, x0, y0, x1, y1, c);
  if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) line(put, x0 + dir, y0, x1 + dir, y1, c);
  else line(put, x0, y0 + 1, x1, y1 + 1, c);
}

export function createMascot({root = document.body} = {}) {
  const el = document.createElement('div');
  el.className = 'mascot'; el.dataset.mode = 'scene';
  el.innerHTML = `<button class="mascot-body" type="button" aria-label="Astro, la estrellita de astroly: tócala para saludar">
      <canvas width="${W}" height="${H}"></canvas></button>
    <p class="mascot-bubble" role="status" aria-live="polite"></p>`;
  root.append(el);
  const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
  const bubble = el.querySelector('.mascot-bubble');
  const btn = el.querySelector('.mascot-body');

  const S = {
    mood: 'idle', moodUntil: 0, look: [0, 0], lookTarget: [0, 0],
    blinkAt: performance.now() + 2500, jumpStart: 0, jumps: 0,
    lastInput: performance.now(), web: 0, particles: [], assembled: 1,
    clicks: [], hover: null, sleeping: false, pos: null, mode: 'scene',
    hangY: null, scrollDir: 0, lastScrollT: 0, swing: 0, swingV: 0, darkBg: false, saidFooter: false, greeted: false, pose: null
  };
  const theme = () => S.darkBg ? PAL.dark : PAL.light;

  let bubbleTimer = 0;
  function say(text, ms = 2400) {
    if (!text) return;
    bubble.textContent = text; el.classList.add('is-talking');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => el.classList.remove('is-talking'), ms);
  }
  function emitFx(kind, n = 1, opts = {}) {
    for (let i = 0; i < n; i++) S.particles.push({
      kind, x: opts.x ?? BODY.cx + rand(-7, 7), y: opts.y ?? BODY.top - 3,
      vx: opts.vx ?? rand(-.6, .6), vy: opts.vy ?? rand(-1.6, -.6), g: opts.g ?? 0, life: opts.life ?? rand(1.1, 1.8), age: 0, c: opts.c
    });
  }
  // Escarcha: chispas de 1 px o en cruz que titilan.
  function frost(n, {x, y, vx, vy, spread = 10, life} = {}) {
    for (let i = 0; i < n; i++) emitFx('frost', 1, {
      x: (x ?? BODY.cx) + rand(-spread, spread), y: (y ?? BODY.cy) + rand(-spread * .6, spread * .6),
      vx: vx ?? rand(-.25, .25), vy: vy ?? rand(-.25, .25), life: life ?? rand(.5, 1.1), c: pick(theme().frost)
    });
  }
  function setMood(mood, ms = 1600) { S.mood = mood; S.moodUntil = performance.now() + ms; }
  function hop(times = 1) { if (reduce.matches) return; S.jumps = times; S.jumpStart = performance.now(); }
  function wake() {
    const was = S.sleeping; S.sleeping = false; S.web = 0; el.classList.remove('is-asleep');
    if (was) { setMood('startle', 900); emitFx('bang', 1, {x: BODY.cx + 10, y: BODY.top - 7, vy: -.4, vx: 0}); hop(1); say(pick(['¡Ah! Estaba despierta…', '¡Uy! Me quedé dormida.', '¡Ya volví!'])); }
  }
  function activity() { S.lastInput = performance.now(); if (S.sleeping || S.mood === 'weave') wake(); if (S.mood === 'weave') S.mood = 'idle'; }

  const PHRASES = {
    add: ['¡Buena elección!', '¡Al carrito!', 'Eso se verá increíble en casa.', '¡Lo atrapé!', 'Uno más para tu espacio.'],
    remove: ['Bueno… otra vez será.', 'Lo devuelvo a su lugar.', 'Snif.'],
    fav: ['¡A favoritos!', 'Yo también lo quiero.', '¡Ese es mi favorito!'],
    hover: ['Mmm, ese me gusta.', '¿Ese?', 'Buen ojo.'],
    usd: ['Ahora en dólares.', 'Modo internacional.'], cop: ['De vuelta a pesos.', 'Precios en pesos.'],
    light: ['¡Qué luz!', 'Modo día.'], dark: ['Shh, modo noche.', 'Aquí brillo más.'],
    search: ['Buscando…', 'Déjame ver…'], none: ['No encontré nada así.', 'Hmm, prueba otra palabra.'],
    checkout: ['¡A pagar! Yo te acompaño.', '¡Vamos!'],
    click: ['¡Hola!', '¡Hey!', 'Soy Astro, la guardiana de tu carrito.', '¿Buscamos algo?', '¿Me buscabas?'],
    dizzy: ['Ya, ya… me mareo.', 'Demasiados toques.'],
    back: ['¡Volviste!', 'Te estaba esperando.'],
    empty: ['Tu carrito está vacío. Yo lo cuido.'],
    full: ['¡Wow, qué carrito!'],
    tone: ['Ese tono le queda.', '¡Otro color!', 'Me gusta más este.'],
    zoom: ['Déjame ver de cerca…', 'Qué detalle.'],
    night: ['Así se ve de noche.', 'Qué ambiente.'],
    saved: ['¡Datos guardados!', 'Listo, ya te conozco.'],
    invalid: ['Revisa ese dato.', 'Falta algo por ahí.'],
    footer: ['¡Gracias por pasar!', 'Aquí abajo también estoy.'],
    filter: ['Buena categoría.', 'Filtrando…']
  };

  function react(type, data = {}) {
    activity();
    const now = performance.now();
    switch (type) {
      case 'add':
        setMood('celebrate', 1500); hop(2); emitFx('confetti', 18, {y: BODY.top, vy: undefined, g: .12});
        emitFx('heart', 1, {x: BODY.cx - 2, y: BODY.top - 5, vx: 0, vy: -.7});
        say(data.count >= 5 ? pick(PHRASES.full) : pick(PHRASES.add)); break;
      case 'more': setMood('happy', 900); hop(1); emitFx('coin', 1, {vx: 0, vy: -.9}); break;
      case 'less': setMood('meh', 900); break;
      case 'remove': setMood('sad', 2200); emitFx('drop', 1, {x: BODY.ex + 4, y: BODY.ey + 3, vx: 0, vy: .3, g: .05}); say(pick(PHRASES.remove)); break;
      case 'fav': if (data.on) { setMood('love', 1800); hop(1); emitFx('heart', 4, {g: -.01}); say(pick(PHRASES.fav)); } else setMood('meh', 900); break;
      case 'hover':
        S.hover = data.dir || null;
        if (now - (S.lastHoverSay || 0) > 9000 && Math.random() < .35) { say(pick(PHRASES.hover), 1600); S.lastHoverSay = now; }
        setMood('curious', 1200); if (Math.random() < .3) emitFx('ask', 1, {x: BODY.cx + 11, y: BODY.top - 6, vx: 0, vy: -.3}); break;
      case 'unhover': S.hover = null; break;
      case 'currency': setMood('dizzy', 1100); emitFx('coin', 3); say(pick(data.currency === 'USD' ? PHRASES.usd : PHRASES.cop), 1600); break;
      case 'theme': if (data.theme === 'dark') { setMood('sleepy', 1600); say(pick(PHRASES.dark), 1600); } else { setMood('shades', 2400); say(pick(PHRASES.light), 1600); } break;
      case 'search': setMood('read', 900); if (now - (S.lastSearchSay || 0) > 6000) { say(pick(PHRASES.search), 1200); S.lastSearchSay = now; } break;
      case 'noresults': setMood('confused', 2200); emitFx('ask', 2); say(pick(PHRASES.none)); break;
      case 'filter': setMood('happy', 900); hop(1); if (Math.random() < .5) say(pick(PHRASES.filter), 1200); break;
      case 'checkout': setMood('dance', 2600); hop(3); emitFx('note', 4, {g: -.01}); say(pick(PHRASES.checkout)); break;
      case 'empty': setMood('sad', 1800); say(pick(PHRASES.empty), 2600); break;
      case 'back': setMood('happy', 1200); hop(1); say(pick(PHRASES.back), 1800); break;
      case 'greet': setMood('wave', 2200); say(data.text || '¡Hola! Bienvenido a astroly.', 2800); break;
      case 'tone': setMood('paint', 1300); emitFx('star', 4, {g: .03}); say(pick(PHRASES.tone), 1400); break;
      case 'zoom': setMood('magnify', 2400); say(pick(PHRASES.zoom), 1500); break;
      case 'night': setMood('sleepy', 2200); frost(8); say(pick(PHRASES.night), 1500); break;
      case 'typing': setMood('write', 900); break;
      case 'hello': setMood('wave', 1800); hop(1); say(`¡Hola, ${data.name}!`, 1800); break;
      case 'saved': setMood('celebrate', 1600); hop(2); emitFx('check', 1, {x: BODY.cx + 8, y: BODY.top - 7, vx: 0, vy: -.5}); emitFx('confetti', 12, {g: .12}); say(pick(PHRASES.saved)); break;
      case 'invalid': setMood('no', 1400); emitFx('ask', 1, {x: BODY.cx + 10, y: BODY.top - 6, vx: 0, vy: -.3}); say(data.text || pick(PHRASES.invalid), 2000); break;
      case 'click': {
        S.clicks = S.clicks.filter(t => now - t < 2500); S.clicks.push(now);
        if (S.clicks.length >= 5) { setMood('dizzy', 2000); emitFx('star', 5); say(pick(PHRASES.dizzy)); S.clicks = []; }
        else { setMood('wave', 1400); hop(1); frost(6); say(pick(PHRASES.click), 1800); }
        break;
      }
    }
  }

  // ── Dibujo
  function frame(now) {
    const pal = theme();
    ctx.clearRect(0, 0, W, H);
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const t = now / 1000, step = Math.floor(t * 8) / 8;
    if (now > S.moodUntil && !['idle', 'weave', 'sleep'].includes(S.mood)) S.mood = 'idle';

    // Inactividad: une estrellas y luego se duerme.
    const idleFor = now - S.lastInput;
    if (!S.sleeping && S.mood === 'idle' && idleFor > 14000) { S.mood = 'weave'; say('Mientras tanto, uno estrellas…', 2200); }
    if (S.mood === 'weave') { S.web = Math.min(1, S.web + 1 / (60 * 7)); if (idleFor > 30000) { S.sleeping = true; S.mood = 'sleep'; el.classList.add('is-asleep'); } }
    if (S.sleeping) S.mood = 'sleep';

    // Vuelo: al hacer scroll se vuelve estrella fugaz (paracaídas al bajar, jetpack al subir).
    const floating = S.mode === 'hang';
    const pose = floating && !reduce.matches && now - S.lastScrollT < 700 ? (S.scrollDir > 0 ? 'chute' : 'jet') : null;
    if (pose !== S.pose) { if (pose) frost(16, {spread: 16}); S.pose = pose; }
    let jy = 0;
    if (S.jumps > 0 && !floating) {
      const d = (now - S.jumpStart) / 340, k = d % 1;
      if (d >= S.jumps) S.jumps = 0; else jy = -Math.round(Math.sin(k * Math.PI) * 5);
    }
    const mood = pose ? (S.mood === 'idle' || S.mood === 'weave' ? 'fly' : S.mood) : S.mood;
    const bob = reduce.matches ? 0 : mood === 'sleep' ? Math.round(Math.sin(t * 1.2)) : floating ? Math.round(Math.sin(t * 2.4)) : (Math.floor(step * 2) % 2 ? -1 : 0);
    const squat = !floating && mood === 'sleep' ? 3 : mood === 'sad' ? 1 : 0;
    const dance = mood === 'dance' ? Math.round(Math.sin(t * 10) * 2) : 0;
    const shake = ((mood === 'dizzy' || mood === 'startle') && !reduce.matches ? Math.round(Math.sin(t * 40)) : 0) + (mood === 'no' ? Math.round(Math.sin(t * 22) * 1.5) : 0);
    const oy = jy + bob + squat, ox = dance + shake;

    if (S.web > 0) drawSky(put, pal, S.web, t);

    // Puntas: 0 cabeza, 1 brazo derecho, 2 pierna derecha, 3 pierna izquierda, 4 brazo izquierdo.
    const tip = [0, 1, 2, 3, 4].map(() => [0, 0]);
    const mv = (i, dx, dy) => { tip[i][0] += dx; tip[i][1] += dy; };
    const wig = (k, a = 1) => reduce.matches ? 0 : Math.round(Math.sin(t * k) * a);
    if (pose === 'chute') { mv(1, -3, -5); mv(4, 3, -5); const sw = wig(3, 1); mv(2, sw, 2); mv(3, sw, 2); }
    else if (pose === 'jet') { mv(1, -1, 4); mv(4, 1, 4); mv(2, -3, 2); mv(3, 3, 2); }
    else if (floating && mood === 'idle') { mv(1, 0, 1 + wig(1.6)); mv(4, 0, 1 - wig(1.6)); mv(2, wig(2.2), 1); mv(3, wig(2.2), 1); }
    else if (mood === 'sleep') { mv(1, -1, 4); mv(4, 1, 4); mv(0, 0, 2); }
    else if (mood === 'celebrate' || (S.jumps > 0 && jy < -1)) { mv(1, 1, -7 + wig(14)); mv(4, -1, -7 - wig(14)); }
    else if (mood === 'dance') { mv(1, 0, -5 * (Math.sin(t * 10) > 0)); mv(4, 0, -5 * (Math.sin(t * 10) <= 0)); mv(0, wig(10, 2), 0); }
    else if (mood === 'wave' || mood === 'hello') { mv(1, 2 + wig(12, 2), -9); }
    else if (mood === 'read' || mood === 'write' || mood === 'weave') { const k = mood === 'read' ? 0 : wig(mood === 'write' ? 14 : 6); mv(1, -5, 3 + k); mv(4, 5, 3 - k); }
    else if (mood === 'magnify') { mv(1, -4, -3); }
    else if (mood === 'paint') { mv(1, 2 + wig(16, 3), -6 + Math.round(Math.cos(t * 16) * 2)); }
    else if (mood === 'sad' || mood === 'no') { mv(1, -2, 5); mv(4, 2, 5); mv(0, 0, 1); }
    else if (mood === 'startle') { mv(1, 3, -4); mv(4, -3, -4); mv(0, 0, -2); }
    else if (mood === 'shades') { mv(4, -1, -4); }
    else {
      if (mood === 'curious' && S.hover) mv(S.hover > 0 ? 1 : 4, S.hover > 0 ? 4 : -4, -3);
      if (!reduce.matches && Math.floor(t * 2) % 7 === 0) mv(Math.floor(t / 3.5) % 2 ? 2 : 3, 0, -1);  // golpecito con el pie
      mv(0, wig(1.3, .6), 0);
    }
    const cx = BODY.cx + ox, cy = BODY.cy + oy;

    // Jetpack: dos tanques detrás del cuerpo y llamas que titilan.
    if (pose === 'jet') {
      [-1, 1].forEach(d => {
        const x0 = cx + d * 12 - (d < 0 ? 4 : 0);
        for (let y = cy - 1; y < cy + 10; y++) for (let x = x0; x < x0 + 5; x++) {
          const edge = x === x0 || x === x0 + 4 || y === cy - 1 || y === cy + 9;
          put(x, y, edge ? '#050505' : y === cy || x === x0 + 1 ? pal.metalHi : pal.metal);
        }
        const L = 6 + Math.floor((t * 20 + (d > 0 ? 2 : 0)) % 4);
        for (let k = 0; k < L; k++) for (let x = x0 + 1; x < x0 + 4; x++) {
          const edge = x === x0 + 1 || x === x0 + 3;
          if (edge && k > L - 3) continue;
          put(x, cy + 10 + k, k < 2 && !edge ? pal.flame[0] : k < L - 2 ? pal.flame[1] : pal.flame[2]);
        }
      });
      if (Math.random() < .7) frost(1, {x: cx + pick([-10, 10]), y: cy + 19, vx: rand(-.15, .15), vy: rand(.4, .8), spread: 2, life: .7});
    }

    const ak = S.assembled;
    const poly = paintStar(put, {cx, cy, tip, pal, ak});

    // Paracaídas: cúpula de gajos con cuerdas hasta los brazos.
    if (pose === 'chute') {
      const sw = wig(2.6, 1), top = 1, cxp = cx + sw;
      for (let y = 0; y < 10; y++) {
        const half = Math.round(Math.sqrt(1 - ((9.5 - y) / 10) ** 2) * 22);
        for (let x = -half; x <= half; x++) {
          const edge = y === 0 || Math.abs(x) === half || y === 9;
          const gore = Math.floor((x + 22) / 7) % 2;
          put(cxp + x, top + y, edge ? (pal.out || '#141519') : gore ? pal.chute : pal.chute2);
        }
      }
      line(put, cxp - 21, top + 10, poly[8][0], poly[8][1], pal.cord);
      line(put, cxp - 8, top + 10, poly[8][0], poly[8][1], pal.cord);
      line(put, cxp + 8, top + 10, poly[2][0], poly[2][1], pal.cord);
      line(put, cxp + 21, top + 10, poly[2][0], poly[2][1], pal.cord);
      if (Math.random() < .6) frost(1, {x: cx + rand(-14, 14), y: cy + 6, vx: rand(-.1, .1), vy: rand(-.9, -.4), spread: 1, life: .9});
    } else if (floating && !reduce.matches && Math.random() < .03) frost(1, {spread: 18});

    if (ak >= .6) {
      if (now > S.blinkAt) { S.blinkUntil = now + 130; S.blinkAt = now + rand(2600, 5200); if (Math.random() < .2) S.blinkAt = now + 260; }
      let target = S.lookTarget;
      if (pose) target = [0, S.scrollDir * 2];
      S.look[0] += (target[0] - S.look[0]) * .2; S.look[1] += (target[1] - S.look[1]) * .2;
      let lx = S.look[0] / 2, ly = S.look[1] / 2;
      if (mood === 'read' || mood === 'write') { lx = Math.sin(now / 180); ly = 1; }
      paintFace(put, {cx, cy, pal, mood, lx, ly, blinking: now < (S.blinkUntil || 0)});
    }
    if (mood === 'shades') {
      for (let x = -8; x <= 7; x++) for (let y = -1; y <= 1; y++) put(cx + x, cy - 2 + y, x === -8 || x === 7 || y === -1 ? '#8a8f98' : '#3a3e46');
      put(cx - 6, cy - 2, '#fff'); put(cx + 2, cy - 2, '#fff');
    }
    if (mood === 'magnify') {
      const mx = cx + 4.5, my = cy - 1.5, r = 4.5;
      for (let a = 0; a < Math.PI * 2; a += .1) { put(mx + Math.cos(a) * r, my + Math.sin(a) * r, '#9aa0a8'); put(mx + Math.cos(a) * (r + 1), my + Math.sin(a) * (r + 1), '#9aa0a8'); }
      thick(put, mx + 4, my + 4, mx + 8, my + 8, '#9aa0a8', 1);
    }

    // Partículas
    if (mood === 'sleep' && Math.random() < .015) emitFx('z', 1, {x: BODY.cx + 9, y: BODY.top + oy - 1, vx: .25, vy: -.35, life: 2.4});
    if (mood === 'dance' && Math.random() < .05) emitFx('note', 1);
    if (mood === 'dizzy' && Math.random() < .08) emitFx('star', 1, {x: BODY.cx + Math.cos(t * 6) * 10, y: BODY.top - 3 + Math.sin(t * 6) * 2, vx: 0, vy: 0, life: .4});
    S.particles = S.particles.filter(p => (p.age += 1 / 60) < p.life);
    S.particles.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy;
      if (p.kind === 'frost') {
        const k = p.age / p.life;
        put(p.x, p.y, p.c);
        if (k < .5 && Math.floor(p.age * 14 + p.x) % 3 === 0) { put(p.x - 1, p.y, p.c); put(p.x + 1, p.y, p.c); put(p.x, p.y - 1, p.c); put(p.x, p.y + 1, p.c); }
        return;
      }
      if (p.age > p.life * .7 && Math.floor(p.age * 12) % 2) return;
      if (p.kind === 'confetti') { p.c ??= pick([pal.fx, pal.soft, pal.eye]); put(p.x, p.y, p.c); put(p.x + 1, p.y, p.c); return; }
      const g = GLYPH[p.kind]; if (!g) return;
      g.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(Math.round(p.x) + rx, Math.round(p.y) + ry, pal.fx)));
    });
  }

  // Constelación: aparece estrella por estrella y se une con líneas tenues; las estrellas titilan.
  function drawSky(put, pal, k, t) {
    const n = Math.ceil(k * SKY.length);
    for (let i = 0; i < n - 1; i++) line(put, SKY[i][0], SKY[i][1], SKY[i + 1][0], SKY[i + 1][1], pal.web);
    for (let i = 0; i < n; i++) {
      const [x, y] = SKY[i]; put(x, y, pal.fx);
      if (Math.sin(t * 3 + i * 1.7) > .3) { put(x - 1, y, pal.fx); put(x + 1, y, pal.fx); put(x, y - 1, pal.fx); put(x, y + 1, pal.fx); }
    }
  }

  // ── Posición
  let lastScroll = scrollY;
  addEventListener('scroll', () => {
    const dy = scrollY - lastScroll; lastScroll = scrollY;
    if (dy) { S.scrollDir = Math.sign(dy); S.lastScrollT = performance.now(); }
    if (S.mode === 'hang' && S.hangY != null && !reduce.matches) {
      // baja con el paracaídas si bajas, sube con el jetpack si subes, y se queda donde paras
      S.hangY = clamp(S.hangY + dy * .3, hangMin(), hangMax());
      S.swingV += clamp(dy * .02, -1.5, 1.5);
    }
    activity();
  }, {passive: true});
  const narrow = matchMedia('(max-width: 899px)');
  const hangSize = () => narrow.matches ? 56 : 74;
  const hangMin = () => narrow.matches ? 60 : 70;
  const hangMax = () => innerHeight * (narrow.matches ? .56 : .6);

  function visible(slot) {
    if (!slot) return null;
    const r = slot.getBoundingClientRect();
    if (!r.width || r.bottom < 40 || r.top > innerHeight - 30) return null;
    return r;
  }
  function place() {
    const scene = visible(document.querySelector('[data-mascot-scene]'));
    const hero = visible(document.querySelector('[data-mascot-slot="hero"]'));
    const foot = visible(document.querySelector('[data-mascot-slot="footer"]'));
    const heroR = hero && hero.bottom > innerHeight * .2 ? hero : null;
    const mode = scene && scene.bottom > innerHeight * .25 ? 'scene' : heroR ? 'hero' : foot ? 'footer' : 'hang';
    let target;
    if (mode === 'hang' || mode === 'scene') {
      const w = hangSize();
      if (S.hangY == null) S.hangY = clamp((S.pos?.y ?? innerHeight * .3), hangMin(), hangMax());
      target = {x: innerWidth - w - (narrow.matches ? 0 : 6), y: S.hangY, w};
    } else {
      const r = mode === 'hero' ? heroR : foot;
      target = {x: r.left, y: r.top - PAD * r.width / W, w: r.width};
    }
    if (mode !== S.mode) {
      const from = S.mode; S.mode = mode; el.dataset.mode = mode;
      if (mode === 'hang' && S.pos) { S.hangY = clamp(S.pos.y, hangMin(), hangMax()); S.swingV += 2; }
      if (mode === 'hang' && from === 'scene') { frost(22, {spread: 20}); if (!S.greeted) { S.greeted = true; setTimeout(() => react('greet', {text: greeting()}), 500); } }
      if (mode === 'footer' && !S.saidFooter) { S.saidFooter = true; setTimeout(() => react('greet', {text: pick(PHRASES.footer)}), 450); }
      if (from === 'hang' && mode !== 'hang' && mode !== 'scene') hop(1);
    }
    if (!S.pos || reduce.matches) S.pos = {...target};
    const f = mode === 'hang' ? .2 : .3;
    S.pos.x += (target.x - S.pos.x) * f; S.pos.y += (target.y - S.pos.y) * f; S.pos.w += (target.w - S.pos.w) * f;
    // inclinación suave según la velocidad del scroll
    S.swingV += -S.swing * .06; S.swingV *= .9; S.swing = clamp(S.swing + S.swingV, -8, 8);
    const sw = mode === 'hang' ? S.swing : 0;
    el.style.transform = `translate3d(${S.pos.x.toFixed(1)}px,${S.pos.y.toFixed(1)}px,0) rotate(${(-sw * .6).toFixed(2)}deg)`;
    el.style.width = `${S.pos.w.toFixed(1)}px`;
  }

  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .6);
    const d = Math.hypot(dx, dy) || 1;
    S.lookTarget = [dx / d * Math.min(2, d / 50), dy / d * Math.min(2, d / 50)];
    if (d < r.width * .6 && Math.hypot(e.movementX, e.movementY) > 40 && S.mood === 'idle') setMood('startle', 500);
    activity();
  }, {passive: true});
  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(type => addEventListener(type, activity, {passive: true}));
  btn.addEventListener('click', () => react('click'));
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

  function darkBehind() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return false;
    const els = document.elementsFromPoint(r.left + r.width / 2, clamp(r.bottom - 12, 0, innerHeight - 1)).filter(e => !el.contains(e));
    const stage = els.find(e => e.matches?.('.hero,.cart-empty'));
    if (stage) return document.documentElement.dataset.theme === 'dark';
    const band = els.some(e => e.classList?.contains('band'));
    return (document.documentElement.dataset.theme === 'dark') !== band;
  }
  function loop(now) { place(); if (now - (S.bgCheck || 0) > 250) { S.bgCheck = now; S.darkBg = darkBehind(); } frame(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  return {
    el, react, say,
    assemble() {
      if (reduce.matches) { S.assembled = 1; react('greet'); return; }
      S.assembled = 0; const t0 = performance.now();
      const run = now => { S.assembled = Math.min(1, (now - t0) / 1100); if (S.assembled < 1) requestAnimationFrame(run); else { hop(1); setTimeout(() => react('greet', {text: greeting()}), 250); } };
      requestAnimationFrame(run);
    },
    // Para probar en la consola: astrolyMascot.idle(31) simula 31 s sin actividad (une estrellas y se duerme).
    idle(sec) { S.lastInput = performance.now() - sec * 1000; if (sec > 14) { S.mood = 'weave'; S.web = Math.min(1, sec / 21); } },
    // Para probar el vuelo: astrolyMascot.fly(1) (paracaídas) o astrolyMascot.fly(-1) (jetpack).
    fly(dir) { S.scrollDir = dir; S.lastScrollT = performance.now() + 2000; },
    prepare() { if (!reduce.matches) S.assembled = 0; },
    lookAt(x, y) { const r = canvas.getBoundingClientRect(); const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1; S.lookTarget = [dx / d * 2, dy / d * 2]; }
  };
}

function greeting() {
  const h = new Date().getHours();
  return `${h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}. ¿Qué buscamos hoy?`;
}
