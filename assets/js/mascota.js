// La mascota de Astroly: el isotipo convertido en una araña de 8 bits.
// El cuerpo es el triángulo invertido del logo, rasterizado en píxeles, y el hueco circular es su ojo.
// Reacciona a lo que hace el cliente (añadir, quitar, favoritos, moneda, tema, búsqueda, pago),
// teje una telaraña si nadie hace nada, se duerme y se despierta, y cuelga de un hilo al hacer scroll.
// Vive en un solo elemento fijo que viaja entre la portada (data-mascot-slot="hero") y el dock del carrito.
import {on} from './store.js';

const W = 56, H = 48;                       // resolución en píxeles del sprite
const LOGO = 'M22 8H98Q119 8 108 27L73 86Q60 108 47 86L12 27Q1 8 22 8Z M76 42A16 16 0 1 0 44 42A16 16 0 1 0 76 42Z';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// ── Cuerpo: el isotipo pasado a una rejilla de píxeles.
const BODY = (() => {
  const c = document.createElement('canvas').getContext('2d');
  const path = new Path2D(LOGO), s = 22 / 102, bx = 17, by = 14;
  const cells = [], eye = [], set = new Set();
  const ex = bx + (60 - 9) * s, ey = by + (42 - 8) * s, er = 16 * s + .2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = 9 + (x + .5 - bx) / s, sy = 8 + (y + .5 - by) / s;
    if (Math.hypot(x + .5 - ex, y + .5 - ey) < er) { eye.push([x, y]); continue; }
    if (c.isPointInPath(path, sx, sy, 'evenodd')) { cells.push([x, y]); set.add(x + ',' + y); }
  }
  const has = (x, y) => set.has(x + ',' + y);
  const rows = {};
  cells.forEach(([x, y]) => { const r = rows[y] ??= [x, x]; r[0] = Math.min(r[0], x); r[1] = Math.max(r[1], x); });
  const top = Math.min(...cells.map(c => c[1])), bottom = Math.max(...cells.map(c => c[1]));
  return {cells, eye, has, rows, top, bottom, ex, ey, er, cx: 28};
})();

const PAL = {
  light: {body: '#0b0b0d', hi: '#3a3e45', lo: '#000000', eye: '#f2f2f2', pupil: '#0a0a0a', line: '#0b0b0d', fx: '#0a0a0a', soft: '#262626', web: 'rgba(0,0,0,.28)', out: null},
  dark: {body: '#0b0b0d', hi: '#4b4f56', lo: '#000000', eye: '#f2f2f2', pupil: '#0a0a0a', line: '#d9dbe0', fx: '#f2f2f2', soft: '#8c8c8c', web: 'rgba(255,255,255,.3)', out: '#d9dbe0'}
};

// Glifos de 8 bits para los efectos.
const GLYPH = {
  z: ['111', '001', '010', '100', '111'],
  heart: ['01010', '11111', '11111', '01110', '00100'],
  bang: ['1', '1', '1', '0', '1'],
  ask: ['111', '001', '011', '000', '010'],
  note: ['0011', '0010', '0010', '1110', '1100'],
  star: ['010', '111', '010'],
  drop: ['010', '111', '111', '010'],
  coin: ['0110', '1001', '1011', '0110']
};
// Ojos especiales, dibujados dentro del hueco (7×7 centrado).
const EYES = {
  heart: ['0000000', '0110110', '1111111', '1111111', '0111110', '0011100', '0001000'],
  dizzy: ['0000000', '0111110', '0100010', '0101010', '0101110', '0100000', '0111111'],
  x: ['0000000', '0100010', '0010100', '0001000', '0010100', '0100010', '0000000'],
  happy: ['0000000', '0000000', '0011100', '0100010', '1000001', '0000000', '0000000'],
  star: ['0001000', '0001000', '0011100', '1111111', '0011100', '0110110', '0100010'],
  coin: ['0000000', '0011100', '0110110', '0101010', '0110110', '0011100', '0000000']
};

export function createMascot({root = document.body} = {}) {
  const el = document.createElement('div');
  el.className = 'mascot';
  el.innerHTML = `<div class="mascot-thread" aria-hidden="true"></div>
    <button class="mascot-body" type="button" aria-label="Mascota de astroly: tócala para saludar">
      <canvas width="${W}" height="${H}"></canvas></button>
    <p class="mascot-bubble" role="status" aria-live="polite"></p>`;
  root.append(el);
  const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
  const bubble = el.querySelector('.mascot-bubble'), thread = el.querySelector('.mascot-thread');
  const btn = el.querySelector('.mascot-body');

  // ── Estado
  const S = {
    mood: 'idle', moodUntil: 0, eye: 'open', look: [0, 0], lookTarget: [0, 0],
    blinkAt: performance.now() + 2500, jump: 0, jumpStart: 0, jumps: 0,
    lastInput: performance.now(), web: 0, particles: [], assembled: 1, assembleStart: 0,
    hang: 0, hangV: 0, sway: 0, clicks: [], hover: null, sleeping: false, born: performance.now(),
    pos: null, size: 0, mode: 'hero'
  };
  const theme = () => S.darkBg ? PAL.dark : PAL.light;

  // ── Burbuja de texto
  let bubbleTimer = 0;
  function say(text, ms = 2400) {
    if (!text) return;
    bubble.textContent = text; el.classList.add('is-talking');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => el.classList.remove('is-talking'), ms);
  }

  // ── Partículas
  function emitFx(kind, n = 1, opts = {}) {
    for (let i = 0; i < n; i++) S.particles.push({
      kind, x: opts.x ?? BODY.cx + rand(-6, 6), y: opts.y ?? BODY.top - 2,
      vx: opts.vx ?? rand(-.6, .6), vy: opts.vy ?? rand(-1.6, -.6), g: opts.g ?? 0, life: opts.life ?? rand(1.1, 1.8), age: 0,
      c: opts.c
    });
  }

  // ── Estados de ánimo
  function setMood(mood, ms = 1600) { S.mood = mood; S.moodUntil = performance.now() + ms; }
  function hop(times = 1) { if (reduce.matches) return; S.jumps = times; S.jumpStart = performance.now(); }
  function wake(fromSleep) {
    const was = S.sleeping; S.sleeping = false; S.web = 0; el.classList.remove('is-asleep');
    if (was && fromSleep !== false) { setMood('startle', 900); emitFx('bang', 1, {x: BODY.cx + 8, y: BODY.top - 6, vy: -.4, vx: 0}); hop(1); say(pick(['¡Ah! Estaba despierto…', '¡Uy! Me quedé dormido.', '¡Ya volví!'])); }
  }
  function activity() { S.lastInput = performance.now(); if (S.sleeping || S.mood === 'weave') wake(); if (S.mood === 'weave') S.mood = 'idle'; }

  const PHRASES = {
    add: ['¡Buena elección!', '¡Al carrito!', 'Eso se verá increíble en casa.', '¡Lo atrapé!', 'Uno más para tu espacio.'],
    remove: ['Bueno… otra vez será.', 'Lo devuelvo a su lugar.', 'Snif.'],
    fav: ['¡A favoritos!', 'Yo también lo quiero.', '¡Ese es mi favorito!'],
    hover: ['Mmm, ese me gusta.', '¿Ese?', 'Buen ojo.', 'Míralo de cerca.'],
    usd: ['Ahora en dólares.', 'Modo internacional.'], cop: ['De vuelta a pesos.', 'Precios en pesos.'],
    light: ['¡Qué luz!', 'Modo día.'], dark: ['Shh, modo noche.', 'Qué tranquilo está esto.'],
    search: ['Buscando…', 'Déjame ver…'], none: ['No encontré nada así.', 'Hmm, prueba otra palabra.'],
    checkout: ['¡A pagar! Yo te acompaño.', '¡Vamos!'],
    click: ['¡Hola!', '¡Hey!', 'Soy el guardián de tu carrito.', 'Hago cosquillas.', '¿Me buscabas?'],
    dizzy: ['Ya, ya… me mareo.', 'Demasiados toques.'],
    back: ['¡Volviste!', 'Te estaba esperando.'],
    empty: ['Tu carrito está vacío. Yo lo cuido.'],
    full: ['¡Wow, qué carrito!']
  };

  function react(type, data = {}) {
    activity();
    const now = performance.now();
    switch (type) {
      case 'add':
        setMood('celebrate', 1500); hop(2); emitFx('confetti', 16, {y: BODY.top, vy: undefined, g: .12});
        emitFx('heart', 1, {x: BODY.cx, y: BODY.top - 4, vx: 0, vy: -.7});
        say(data.count >= 5 ? pick(PHRASES.full) : pick(PHRASES.add)); break;
      case 'more': setMood('happy', 900); hop(1); emitFx('coin', 1, {vx: 0, vy: -.9}); break;
      case 'less': setMood('meh', 900); break;
      case 'remove': setMood('sad', 2200); emitFx('drop', 1, {x: BODY.ex + 3, y: BODY.ey + 2, vx: 0, vy: .3, g: .05}); say(pick(PHRASES.remove)); break;
      case 'fav': if (data.on) { setMood('love', 1800); hop(1); emitFx('heart', 4, {g: -.01}); say(pick(PHRASES.fav)); } else setMood('meh', 900); break;
      case 'hover':
        S.hover = data.dir || null;
        if (now - (S.lastHoverSay || 0) > 9000 && Math.random() < .35) { say(pick(PHRASES.hover), 1600); S.lastHoverSay = now; }
        setMood('curious', 1200); if (Math.random() < .3) emitFx('ask', 1, {x: BODY.cx + 9, y: BODY.top - 5, vx: 0, vy: -.3}); break;
      case 'unhover': S.hover = null; break;
      case 'currency': setMood('dizzy', 1100); emitFx('coin', 3); say(pick(data.currency === 'USD' ? PHRASES.usd : PHRASES.cop), 1600); break;
      case 'theme': if (data.theme === 'dark') { setMood('sleepy', 1600); say(pick(PHRASES.dark), 1600); } else { setMood('shades', 2400); say(pick(PHRASES.light), 1600); } break;
      case 'search': setMood('read', 900); if (now - (S.lastSearchSay || 0) > 6000) { say(pick(PHRASES.search), 1200); S.lastSearchSay = now; } break;
      case 'noresults': setMood('confused', 2200); emitFx('ask', 2); say(pick(PHRASES.none)); break;
      case 'checkout': setMood('dance', 2600); hop(3); emitFx('note', 4, {g: -.01}); say(pick(PHRASES.checkout)); break;
      case 'empty': setMood('sad', 1800); say(pick(PHRASES.empty), 2600); break;
      case 'back': setMood('happy', 1200); hop(1); say(pick(PHRASES.back), 1800); break;
      case 'greet': setMood('wave', 2200); say(data.text || '¡Hola! Bienvenido a astroly.', 2800); break;
      case 'click': {
        S.clicks = S.clicks.filter(t => now - t < 2500); S.clicks.push(now);
        if (S.clicks.length >= 5) { setMood('dizzy', 2000); emitFx('star', 5); say(pick(PHRASES.dizzy)); S.clicks = []; }
        else { setMood('wave', 1400); hop(1); say(pick(PHRASES.click), 1800); }
        break;
      }
    }
  }

  // ── Dibujo
  function frame(now) {
    const pal = theme();
    ctx.clearRect(0, 0, W, H);
    const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, 1, 1); };
    const t = now / 1000, step = Math.floor(t * 8) / 8;      // tiempo cuantizado: movimiento a 8 fps
    if (now > S.moodUntil && !['idle', 'weave', 'sleep'].includes(S.mood)) S.mood = 'idle';

    // Inactividad: teje una telaraña y luego se duerme.
    const idleFor = now - S.lastInput;
    if (!S.sleeping && S.mood === 'idle' && idleFor > 14000) { S.mood = 'weave'; say('Mientras tanto, tejo un poco…', 2200); }
    if (S.mood === 'weave') { S.web = Math.min(1, S.web + 1 / (60 * 7)); if (idleFor > 30000) { S.sleeping = true; S.mood = 'sleep'; el.classList.add('is-asleep'); } }
    if (S.sleeping) S.mood = 'sleep';

    // Salto
    let jy = 0;
    if (S.jumps > 0) {
      const d = (now - S.jumpStart) / 340, k = d % 1;
      if (d >= S.jumps) S.jumps = 0; else jy = -Math.round(Math.sin(k * Math.PI) * 5);
    }
    const mood = S.mood;
    const bob = reduce.matches ? 0 : (mood === 'sleep' ? Math.round(Math.sin(t * 1.2)) : (Math.floor(step * 2) % 2 ? -1 : 0));
    const squat = mood === 'sleep' ? 3 : mood === 'sad' ? 1 : 0;
    const dance = mood === 'dance' ? Math.round(Math.sin(t * 10) * 2) : 0;
    const shake = (mood === 'dizzy' || mood === 'startle') && !reduce.matches ? Math.round(Math.sin(t * 40)) : 0;
    const oy = jy + bob + squat, ox = dance + shake;

    // Telaraña de fondo
    if (S.web > 0) drawWeb(put, pal, S.web);

    // Hilo (si cuelga)
    if (S.hang > 2) for (let y = 0; y < BODY.top + oy; y++) put(BODY.cx + ox, y, pal.line);

    // Patas
    const ground = BODY.bottom + 2;
    const attachRows = [2, 5, 8, 11].map(r => BODY.top + r);
    const hanging = S.hang > 2;
    const legsShown = S.assembled >= 1 ? 4 : Math.floor(clamp((S.assembled - .55) / .45, 0, 1) * 4);
    [-1, 1].forEach(dir => attachRows.forEach((ay, i) => {
      const row = BODY.rows[ay]; if (!row || i >= legsShown) return;
      const ax = (dir < 0 ? row[0] : row[1]) + ox, aY = ay + oy;
      const reach = [25, 21, 16, 11][i];
      let fx = BODY.cx + ox * 0 + dir * reach, fy = ground, kx, ky;
      const phase = i * 1.3 + (dir > 0 ? 1.7 : 0);
      if (hanging || mood === 'sleep') {
        // patas recogidas
        fx = BODY.cx + ox + dir * (reach * .55); fy = aY + (hanging ? 4 + i : 3 + i * .5);
        if (mood === 'sleep') fy = ground;
      } else if (mood === 'celebrate' || (mood === 'dance' && i < 2) || (S.jumps > 0 && jy < -1)) {
        const up = Math.sin(t * 14 + phase) * 2;
        fx = BODY.cx + ox + dir * (reach + 1); fy = aY - 6 + i * 3 + up;
      } else if (mood === 'wave' && dir > 0 && i === 0) {
        fx = ax + 5 + Math.round(Math.sin(t * 12) * 2); fy = aY - 11;
      } else if (mood === 'read' || mood === 'weave') {
        if (i === 0) { fx = ax + dir * 4 + (mood === 'weave' ? Math.round(Math.sin(t * 6 + dir) * 2) : 0); fy = aY - 7; }
        else fy = ground - (Math.floor(step * 4 + i) % 4 === 0 ? 1 : 0);
      } else {
        // reposo: un golpeteo de patas, de a una, como impaciente
        const tap = !reduce.matches && mood !== 'sad' && Math.floor(t * 2 + i * 0.7 + (dir > 0 ? .35 : 0)) % 7 === 0 ? 1 : 0;
        fy = ground - tap;
        if (mood === 'curious' && S.hover && Math.sign(S.hover) === dir && i === 0) { fx = ax + dir * 7; fy = aY - 5; }
      }
      kx = ax + (fx - ax) * [.62, .66, .7, .74][i]; ky = Math.min(aY, fy) - ([8, 6, 4, 2][i] + (mood === 'sleep' ? -3 : 0));
      if (fy < aY - 3) { kx = ax + dir * 3; ky = aY - 2; }
      line(put, ax, aY, Math.round(kx), Math.round(ky), pal.line);
      line(put, Math.round(kx), Math.round(ky), Math.round(fx), Math.round(fy), pal.line);
    }));

    // Cuerpo (con aparición en píxeles en la intro)
    const ak = S.assembled;
    BODY.cells.forEach(([x, y], idx) => {
      if (ak < 1 && ((idx * 7919) % 97) / 97 >= ak) return;
      const top = !BODY.has(x, y - 1), left = !BODY.has(x - 1, y), right = !BODY.has(x + 1, y), bottom = !BODY.has(x, y + 1);
      let c = pal.body;
      if (top || (left && y < BODY.top + 6)) c = pal.hi;
      else if (bottom || right) c = pal.lo;
      put(x + ox, y + oy, c);
      if (pal.out) { if (top) put(x + ox, y + oy - 1, pal.out); if (left) put(x + ox - 1, y + oy, pal.out); if (right) put(x + ox + 1, y + oy, pal.out); if (bottom) put(x + ox, y + oy + 1, pal.out); }
    });

    // Ojo
    drawEye(put, pal, now, ox, oy, mood, ak);

    // Boca según el ánimo
    const my = Math.round(BODY.ey + BODY.er + 2) + oy, mx = BODY.cx + ox;
    const mouths = {
      celebrate: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]], happy: [[-1, 0], [0, 1], [1, 0]], love: [[-1, 0], [0, 1], [1, 0]],
      dance: [[-1, 0], [0, 1], [1, 0]], wave: [[-1, 0], [0, 1], [1, 0]], startle: [[0, 0], [0, 1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
      sad: [[-1, 1], [0, 0], [1, 1]], confused: [[-2, 1], [-1, 0], [0, 1], [1, 0]], sleep: [], dizzy: [[-1, 0], [0, 1], [1, 0], [2, 1]],
      shades: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]]
    };
    (mouths[mood] || []).forEach(([dx, dy]) => put(mx + dx, my + dy, pal.eye));

    // Lentes de sol
    if (mood === 'shades') {
      for (let x = -6; x <= 6; x++) for (let y = -1; y <= 1; y++) put(BODY.cx + x + ox, Math.round(BODY.ey) + y + oy, '#000');
      put(BODY.cx - 4 + ox, Math.round(BODY.ey) - 1 + oy, '#fff'); put(BODY.cx + 3 + ox, Math.round(BODY.ey) - 1 + oy, '#fff');
    }

    // Partículas
    if (mood === 'sleep' && Math.random() < .015) emitFx('z', 1, {x: BODY.cx + 7, y: BODY.top + oy - 1, vx: .25, vy: -.35, life: 2.4});
    if (mood === 'dance' && Math.random() < .05) emitFx('note', 1);
    if (mood === 'dizzy' && Math.random() < .08) emitFx('star', 1, {x: BODY.cx + Math.cos(t * 6) * 9, y: BODY.top - 2 + Math.sin(t * 6) * 2, vx: 0, vy: 0, life: .4});
    S.particles = S.particles.filter(p => (p.age += 1 / 60) < p.life);
    S.particles.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy;
      const fade = p.age > p.life * .7 && Math.floor(p.age * 12) % 2;
      if (fade) return;
      const color = p.c || (p.kind === 'confetti' ? pick([pal.fx, pal.soft, pal.eye]) : pal.fx);
      if (p.kind === 'confetti') { if (!p.c) p.c = color; put(p.x, p.y, p.c); return; }
      const g = GLYPH[p.kind]; if (!g) return;
      g.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(Math.round(p.x) + rx, Math.round(p.y) + ry, pal.fx)));
    });
  }

  function drawEye(put, pal, now, ox, oy, mood, ak) {
    if (ak <= 0) return;
    if (ak < .6) { BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body)); return; }
    // parpadeo
    if (now > S.blinkAt) { S.blinkUntil = now + 130; S.blinkAt = now + rand(2600, 5200); if (Math.random() < .2) S.blinkAt = now + 260; }
    const blinking = now < (S.blinkUntil || 0);
    const cx = Math.round(BODY.ex - .5), cy = Math.round(BODY.ey - .5);
    const special = {love: 'heart', dizzy: 'dizzy', celebrate: 'happy', dance: 'happy', happy: 'happy', startle: null, wave: null, confused: null}[mood];
    if (mood === 'sleep' || (blinking && !special)) {
      BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body));
      for (let x = -3; x <= 3; x++) put(cx + x + ox, cy + 1 + oy, pal.eye);
      return;
    }
    if (special === 'happy') {
      BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body));
      EYES.happy.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(cx - 3 + rx + ox, cy - 3 + ry + oy, pal.eye)));
      return;
    }
    BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.eye));
    if (special && EYES[special]) {
      EYES[special].forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(cx - 3 + rx + ox, cy - 3 + ry + oy, pal.pupil)));
      return;
    }
    // la pupila mira hacia el objetivo (cursor, producto o carrito)
    S.look[0] += (S.lookTarget[0] - S.look[0]) * .2; S.look[1] += (S.lookTarget[1] - S.look[1]) * .2;
    let lx = Math.round(clamp(S.look[0], -1.6, 1.6)), ly = Math.round(clamp(S.look[1], -1.6, 1.6));
    if (mood === 'read') { lx = Math.round(Math.sin(now / 180) * 1.5); ly = 1; }
    const big = mood === 'curious' || mood === 'startle' || mood === 'confused';
    const size = big ? 3 : 2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(cx + lx + x - (size > 2 ? 1 : 0) + ox, cy + ly + y - (size > 2 ? 1 : 0) + oy, pal.pupil);
    if (!big) put(cx + lx + ox, cy + ly + oy, pal.pupil === '#0a0a0a' ? '#5a5d63' : pal.pupil); // brillo
    // párpados
    if (mood === 'sleepy' || mood === 'meh') for (let x = -3; x <= 3; x++) { put(cx + x + ox, cy - 3 + oy, pal.body); put(cx + x + ox, cy - 2 + oy, pal.body); if (mood === 'sleepy') put(cx + x + ox, cy - 1 + oy, pal.body); }
    if (mood === 'sad') for (let x = -3; x <= 3; x++) for (let y = -3; y <= -3 + Math.max(0, x + 1) * .6; y++) put(cx + x + ox, cy + Math.round(y) + oy, pal.body);
    if (mood === 'confused') for (let x = 0; x <= 3; x++) put(cx + x + ox, cy - 3 + oy, pal.body);
  }

  function drawWeb(put, pal, k) {
    const cx = BODY.cx, cy = BODY.top + 6, R = 26;
    const spokes = 10, rings = 5;
    for (let s = 0; s < spokes; s++) {
      const a = s / spokes * Math.PI * 2 + .2, len = R * Math.min(1, k * 2);
      for (let r = 4; r < len; r += .7) put(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * .8), pal.web);
    }
    const ringsShown = Math.floor(clamp((k - .3) / .7, 0, 1) * rings);
    for (let i = 1; i <= ringsShown; i++) {
      const r = 4 + i * (R - 4) / rings;
      for (let s = 0; s < spokes; s++) {
        const a1 = s / spokes * Math.PI * 2 + .2, a2 = (s + 1) / spokes * Math.PI * 2 + .2;
        line(put, Math.round(cx + Math.cos(a1) * r), Math.round(cy + Math.sin(a1) * r * .8), Math.round(cx + Math.cos(a2) * r * .92), Math.round(cy + Math.sin(a2) * r * .8 * .92), pal.web);
      }
    }
  }

  // ── Posición: viaja entre la portada y el dock; cuelga de un hilo cuando se hace scroll.
  let lastScroll = scrollY, lastScrollT = performance.now();
  addEventListener('scroll', () => {
    const now = performance.now(), dy = scrollY - lastScroll, dt = Math.max(16, now - lastScrollT);
    lastScroll = scrollY; lastScrollT = now;
    if (!reduce.matches && S.mode === 'dock') S.hangV += clamp(dy / dt * 9, -14, 14);
    activity();
  }, {passive: true});

  function place(now) {
    const heroSlot = document.querySelector('[data-mascot-slot="hero"]');
    const dockSlot = document.querySelector('[data-mascot-slot="dock"]');
    const r = heroSlot?.getBoundingClientRect();
    const useHero = r && r.bottom > innerHeight * .35 && r.width > 0;
    const slot = useHero ? heroSlot : dockSlot;
    if (!slot) return;
    const b = slot.getBoundingClientRect();
    const mode = useHero ? 'hero' : 'dock';
    if (mode !== S.mode) { S.mode = mode; el.dataset.mode = mode; if (mode === 'dock' && !reduce.matches) { S.hangV += 10; } }
    const target = {x: b.left, y: b.top, w: b.width};
    if (!S.pos || reduce.matches) S.pos = {...target};
    const f = useHero ? .35 : .16;
    S.pos.x += (target.x - S.pos.x) * f; S.pos.y += (target.y - S.pos.y) * f; S.pos.w += (target.w - S.pos.w) * f;
    // resorte del hilo
    S.hangV += -S.hang * .08; S.hangV *= .86; S.hang = clamp(S.hang + S.hangV, -6, 90);
    if (Math.abs(S.hang) < .05 && Math.abs(S.hangV) < .05) { S.hang = 0; S.hangV = 0; }
    const hang = S.mode === 'dock' ? Math.max(0, S.hang) : 0;
    el.style.transform = `translate3d(${S.pos.x.toFixed(1)}px,${(S.pos.y + hang * -1).toFixed(1)}px,0)`;
    el.style.width = `${S.pos.w.toFixed(1)}px`;
    thread.style.opacity = hang > 3 ? '1' : '0';
    el.classList.toggle('is-hanging', hang > 3);
  }

  // ── Mirada: sigue un poco al cursor (no es su función principal: solo da vida).
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .45);
    const d = Math.hypot(dx, dy) || 1;
    S.lookTarget = [dx / d * Math.min(1.6, d / 60), dy / d * Math.min(1.6, d / 60)];
    if (d < r.width * .6 && Math.hypot(e.movementX, e.movementY) > 40 && S.mood === 'idle') { setMood('startle', 500); }
    activity();
  }, {passive: true});
  ['keydown', 'pointerdown', 'touchstart', 'wheel'].forEach(type => addEventListener(type, activity, {passive: true}));
  btn.addEventListener('click', () => react('click'));
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = performance.now();
    else if (hiddenAt && performance.now() - hiddenAt > 8000) react('back');
  });

  // ── Eventos de la tienda
  on('cart', d => {
    if (d.type === 'add') react('add', {count: d.qty});
    else if (d.type === 'remove') react('remove');
    else if (d.type === 'more') react('more');
    else if (d.type === 'less') react('less');
  });
  on('fav', d => react('fav', d));
  on('currency', d => react('currency', d));
  on('theme', d => react('theme', d));

  // ── Bucle
  function loop(now) { place(now); if (now - (S.bgCheck || 0) > 250) { S.bgCheck = now; S.darkBg = darkBehind(); } frame(now); requestAnimationFrame(loop); }
  // ¿Qué hay detrás? En fondos oscuros (tema oscuro o bandas negras) las patas y el contorno se aclaran.
  function darkBehind() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return false;
    const els = document.elementsFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, r.bottom - 2)).filter(e => !el.contains(e));
    const hero = els.find(e => e.matches?.('.hero-stage,.empty-slot,.cart-empty'));
    if (hero) return !!(hero.classList.contains('hero-stage') && !hero.classList.contains('is-settled'));
    const band = els.some(e => e.classList?.contains('band'));
    return (document.documentElement.dataset.theme === 'dark') !== band;
  }
  requestAnimationFrame(loop);

  return {
    el, react, say,
    // Intro: el cuerpo aparece píxel a píxel, le salen las patas y abre el ojo.
    assemble() {
      if (reduce.matches) { S.assembled = 1; react('greet'); return; }
      S.assembled = 0; const t0 = performance.now();
      const run = now => { S.assembled = Math.min(1, (now - t0) / 1100); if (S.assembled < 1) requestAnimationFrame(run); else { hop(1); setTimeout(() => react('greet', {text: greeting()}), 250); } };
      requestAnimationFrame(run);
    },
    // Para probar en la consola: astrolyMascot.idle(31) simula 31 s sin actividad (teje y se duerme).
    idle(sec) { S.lastInput = performance.now() - sec * 1000; if (sec > 14) { S.mood = 'weave'; S.web = Math.min(1, sec / 21); } },
    prepare() { if (!reduce.matches) S.assembled = 0; },
    hide(v) { el.classList.toggle('is-hidden', v); },
    lookAt(x, y) { const r = canvas.getBoundingClientRect(); const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1; S.lookTarget = [dx / d * 1.6, dy / d * 1.6]; }
  };
}

function greeting() {
  const h = new Date().getHours();
  const part = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  return `${part}. Bienvenido a astroly.`;
}

// Línea de píxeles (Bresenham).
function line(put, x0, y0, x1, y1, c) {
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, guard = 0;
  while (guard++ < 200) { put(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
}
