// La mascota de Astroly: el isotipo convertido en una araña de 8 bits.
// El cuerpo es el triángulo invertido del logo, rasterizado en píxeles, y el hueco circular es su ojo.
// Reacciona a lo que hace el cliente, teje una telaraña si nadie hace nada, se duerme y se despierta.
//
// Dónde está:
//  · En la portada se sienta sobre la tarjeta de redes (data-mascot-slot="hero").
//  · Al bajar, lanza su hilo y cuelga a la derecha de la pantalla. Mientras haces scroll se desliza
//    por la telaraña (baja si bajas, sube si subes) y cuando paras se queda en esa altura.
//  · Solo se baja del hilo al llegar a la portada o al pie de página (data-mascot-slot="footer").
import {on} from './store.js';

const W = 56, H = 48;                       // resolución en píxeles del sprite
const LOGO = 'M22 8H98Q119 8 108 27L73 86Q60 108 47 86L12 27Q1 8 22 8Z M76 42A16 16 0 1 0 44 42A16 16 0 1 0 76 42Z';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// ── Cuerpo: el isotipo pasado a una rejilla de píxeles (un poco más ancho y robusto).
const BODY = (() => {
  const c = document.createElement('canvas').getContext('2d');
  const path = new Path2D(LOGO), s = 26 / 102, bx = 28 - 13, by = 12;
  const cells = [], eye = [], set = new Set();
  const ex = bx + (60 - 9) * s, ey = by + (42 - 8) * s, er = 16 * s + .15;
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

const PAL = { // negro piano, marfil antiguo y turquesa surf para los efectos
  light: {body: '#0f0f11', hi: '#3a3a3f', lo: '#000000', eye: '#f6f1e6', pupil: '#0f0f11', line: '#0f0f11', fx: '#138f8c', soft: '#4a463e', web: 'rgba(15,15,17,.28)', out: null},
  dark: {body: '#0f0f11', hi: '#4a4a50', lo: '#000000', eye: '#f6f1e6', pupil: '#0f0f11', line: '#ebe3d0', fx: '#3cc9c6', soft: '#a39d8f', web: 'rgba(235,227,208,.3)', out: '#ebe3d0'}
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
// Ojos especiales, dibujados dentro del hueco (9×9 centrado).
const EYES = {
  heart: ['000000000', '001101100', '011111110', '011111110', '011111110', '001111100', '000111000', '000010000', '000000000'],
  dizzy: ['000000000', '011111100', '010000100', '010110100', '010100100', '010111100', '010000000', '011111110', '000000000'],
  happy: ['000000000', '000000000', '000000000', '001111100', '011000110', '110000011', '000000000', '000000000', '000000000']
};

export function createMascot({root = document.body} = {}) {
  const el = document.createElement('div');
  el.className = 'mascot'; el.dataset.mode = 'hero';
  el.innerHTML = `<div class="mascot-thread" aria-hidden="true"></div>
    <button class="mascot-body" type="button" aria-label="Mascota de astroly: tócala para saludar">
      <canvas width="${W}" height="${H}"></canvas></button>
    <p class="mascot-bubble" role="status" aria-live="polite"></p>`;
  root.append(el);
  const canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
  const bubble = el.querySelector('.mascot-bubble'), thread = el.querySelector('.mascot-thread');
  const btn = el.querySelector('.mascot-body');

  const S = {
    mood: 'idle', moodUntil: 0, look: [0, 0], lookTarget: [0, 0],
    blinkAt: performance.now() + 2500, jumpStart: 0, jumps: 0,
    lastInput: performance.now(), web: 0, particles: [], assembled: 1,
    clicks: [], hover: null, sleeping: false, pos: null, mode: 'hero',
    hangY: null, scrollDir: 0, lastScrollT: 0, swing: 0, swingV: 0, darkBg: false, saidFooter: false
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
  function setMood(mood, ms = 1600) { S.mood = mood; S.moodUntil = performance.now() + ms; }
  function hop(times = 1) { if (reduce.matches) return; S.jumps = times; S.jumpStart = performance.now(); }
  function wake() {
    const was = S.sleeping; S.sleeping = false; S.web = 0; el.classList.remove('is-asleep');
    if (was) { setMood('startle', 900); emitFx('bang', 1, {x: BODY.cx + 10, y: BODY.top - 7, vy: -.4, vx: 0}); hop(1); say(pick(['¡Ah! Estaba despierto…', '¡Uy! Me quedé dormido.', '¡Ya volví!'])); }
  }
  function activity() { S.lastInput = performance.now(); if (S.sleeping || S.mood === 'weave') wake(); if (S.mood === 'weave') S.mood = 'idle'; }

  const PHRASES = {
    add: ['¡Buena elección!', '¡Al carrito!', 'Eso se verá increíble en casa.', '¡Lo atrapé!', 'Uno más para tu espacio.'],
    remove: ['Bueno… otra vez será.', 'Lo devuelvo a su lugar.', 'Snif.'],
    fav: ['¡A favoritos!', 'Yo también lo quiero.', '¡Ese es mi favorito!'],
    hover: ['Mmm, ese me gusta.', '¿Ese?', 'Buen ojo.'],
    usd: ['Ahora en dólares.', 'Modo internacional.'], cop: ['De vuelta a pesos.', 'Precios en pesos.'],
    light: ['¡Qué luz!', 'Modo día.'], dark: ['Shh, modo noche.', 'Qué tranquilo está esto.'],
    search: ['Buscando…', 'Déjame ver…'], none: ['No encontré nada así.', 'Hmm, prueba otra palabra.'],
    checkout: ['¡A pagar! Yo te acompaño.', '¡Vamos!'],
    click: ['¡Hola!', '¡Hey!', 'Soy el guardián de tu carrito.', 'Hago cosquillas.', '¿Me buscabas?'],
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
      case 'night': setMood('sleepy', 2200); emitFx('star', 3, {g: -.005, life: 2}); say(pick(PHRASES.night), 1500); break;
      case 'typing': setMood('write', 900); break;
      case 'hello': setMood('wave', 1800); hop(1); say(`¡Hola, ${data.name}!`, 1800); break;
      case 'saved': setMood('celebrate', 1600); hop(2); emitFx('check', 1, {x: BODY.cx + 8, y: BODY.top - 7, vx: 0, vy: -.5}); emitFx('confetti', 12, {g: .12}); say(pick(PHRASES.saved)); break;
      case 'invalid': setMood('no', 1400); emitFx('ask', 1, {x: BODY.cx + 10, y: BODY.top - 6, vx: 0, vy: -.3}); say(data.text || pick(PHRASES.invalid), 2000); break;
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
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
    const t = now / 1000, step = Math.floor(t * 8) / 8;
    if (now > S.moodUntil && !['idle', 'weave', 'sleep'].includes(S.mood)) S.mood = 'idle';

    // Inactividad: teje y luego se duerme.
    const idleFor = now - S.lastInput;
    if (!S.sleeping && S.mood === 'idle' && idleFor > 14000) { S.mood = 'weave'; say('Mientras tanto, tejo un poco…', 2200); }
    if (S.mood === 'weave') { S.web = Math.min(1, S.web + 1 / (60 * 7)); if (idleFor > 30000) { S.sleeping = true; S.mood = 'sleep'; el.classList.add('is-asleep'); } }
    if (S.sleeping) S.mood = 'sleep';

    const hanging = S.mode === 'hang';
    const sliding = hanging && now - S.lastScrollT < 260;
    let jy = 0;
    if (S.jumps > 0 && !hanging) {
      const d = (now - S.jumpStart) / 340, k = d % 1;
      if (d >= S.jumps) S.jumps = 0; else jy = -Math.round(Math.sin(k * Math.PI) * 5);
    }
    const mood = S.mood;
    const bob = reduce.matches ? 0 : (mood === 'sleep' ? Math.round(Math.sin(t * 1.2)) : hanging ? 0 : (Math.floor(step * 2) % 2 ? -1 : 0));
    const squat = !hanging && mood === 'sleep' ? 3 : mood === 'sad' ? 1 : 0;
    const dance = mood === 'dance' ? Math.round(Math.sin(t * 10) * 2) : 0;
    const shake = ((mood === 'dizzy' || mood === 'startle') && !reduce.matches ? Math.round(Math.sin(t * 40)) : 0) + (mood === 'no' ? Math.round(Math.sin(t * 22) * 1.5) : 0);
    const oy = jy + bob + squat + (hanging ? 3 : 0), ox = dance + shake;

    if (S.web > 0) drawWeb(put, pal, S.web);

    // Hilo dentro del sprite (2 px, continúa el hilo de la página)
    if (hanging) for (let y = 0; y < BODY.top + oy + 1; y++) { put(BODY.cx, y, pal.line); put(BODY.cx + 1, y, pal.line); }

    // Patas (2 px de grosor)
    const ground = BODY.bottom + 2;
    const attachRows = [2, 5, 8, 11].map(r => BODY.top + r);
    const legsShown = S.assembled >= 1 ? 4 : Math.floor(clamp((S.assembled - .55) / .45, 0, 1) * 4);
    [-1, 1].forEach(dir => attachRows.forEach((ay, i) => {
      const row = BODY.rows[ay]; if (!row || i >= legsShown) return;
      const ax = (dir < 0 ? row[0] : row[1]) + ox, aY = ay + oy;
      const reach = [25, 21, 16, 11][i];
      // Pose de pie: rodillas altas y cerca del cuerpo, pies abiertos en abanico.
      const KNEE = [[8, 9], [7, 6], [6, 4], [4, 2]];
      let fx = BODY.cx + dir * reach, fy = ground, kx = ax + dir * KNEE[i][0], ky = aY - KNEE[i][1];
      const phase = i * 1.3 + (dir > 0 ? 1.7 : 0);
      if (hanging) {
        if (sliding && i < 2) {
          // se agarra del hilo y se desliza
          const grip = Math.floor(t * 10 + i + (dir > 0 ? 1 : 0)) % 2;
          fx = BODY.cx + .5 + dir * 2; fy = BODY.top + oy - 3 - i * 3 - grip;
          kx = ax + dir * (5 - i); ky = aY - 5 - i;
        } else {
          // patas colgando, abiertas, con un leve vaivén
          const sw = reduce.matches ? 0 : Math.round(Math.sin(t * 2.2 + phase) * (sliding ? 1.5 : .8));
          kx = ax + dir * (5 + i); ky = aY - 3 + i;
          fx = ax + dir * (8 + i * .5) + sw; fy = aY + 5 + i * 2;
        }
      } else if (mood === 'sleep') {
        kx = ax + dir * 4; ky = aY - 2; fx = BODY.cx + dir * (reach * .75); fy = ground;
      } else if (mood === 'celebrate' || (mood === 'dance' && i < 2) || (S.jumps > 0 && jy < -1)) {
        const up = Math.sin(t * 14 + phase) * 2;
        kx = ax + dir * 5; ky = aY - 3; fx = BODY.cx + ox + dir * (reach + 1); fy = aY - 7 + i * 3 + up;
      } else if ((mood === 'wave' || mood === 'hello') && dir > 0 && i === 0) {
        kx = ax + 3; ky = aY - 4; fx = ax + 6 + Math.round(Math.sin(t * 12) * 2); fy = aY - 12;
      } else if ((mood === 'read' || mood === 'weave' || mood === 'write') && i === 0) {
        kx = ax + dir * 3; ky = aY - 4; fx = ax + dir * 5 + (mood !== 'read' ? Math.round(Math.sin(t * (mood === 'write' ? 14 : 6) + dir) * 2) : 0); fy = aY - 9;
      } else if (mood === 'magnify' && dir > 0 && i === 0) {
        kx = ax + 5; ky = aY - 2; fx = BODY.ex + 7; fy = BODY.ey + oy + 3;
      } else if (mood === 'paint' && dir > 0 && i === 0) {
        kx = ax + 3; ky = aY - 4; fx = ax + 7 + Math.round(Math.sin(t * 16) * 3); fy = aY - 10 + Math.round(Math.cos(t * 16) * 2);
      } else {
        const tap = !reduce.matches && mood !== 'sad' && Math.floor(t * 2 + i * 0.7 + (dir > 0 ? .35 : 0)) % 7 === 0 ? 1 : 0;
        fy = ground - tap;
        if (mood === 'curious' && S.hover && Math.sign(S.hover) === dir && i === 0) { kx = ax + dir * 4; ky = aY - 6; fx = ax + dir * 9; fy = aY - 5; }
      }
      thick(put, ax, aY, kx, ky, pal.line, dir);
      thick(put, kx, ky, fx, fy, pal.line, dir);
    }));

    // Cuerpo
    const ak = S.assembled;
    BODY.cells.forEach(([x, y], idx) => {
      if (ak < 1 && ((idx * 7919) % 97) / 97 >= ak) return;
      const top = !BODY.has(x, y - 1), left = !BODY.has(x - 1, y), right = !BODY.has(x + 1, y), bottom = !BODY.has(x, y + 1);
      let c = pal.body;
      if (top || (left && y < BODY.top + 7)) c = pal.hi;
      else if (bottom || right) c = pal.lo;
      put(x + ox, y + oy, c);
      if (pal.out) { if (top) put(x + ox, y + oy - 1, pal.out); if (left) put(x + ox - 1, y + oy, pal.out); if (right) put(x + ox + 1, y + oy, pal.out); if (bottom) put(x + ox, y + oy + 1, pal.out); }
    });

    drawEye(put, pal, now, ox, oy, mood, ak, hanging);

    // Boca
    const my = Math.round(BODY.ey + BODY.er + 2) + oy, mx = BODY.cx + ox;
    const mouths = {
      celebrate: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]], happy: [[-1, 0], [0, 1], [1, 0]], love: [[-1, 0], [0, 1], [1, 0]],
      dance: [[-1, 0], [0, 1], [1, 0]], wave: [[-1, 0], [0, 1], [1, 0]], hello: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]],
      startle: [[0, 0], [0, 1], [-1, 0], [1, 0], [-1, 1], [1, 1]], sad: [[-1, 1], [0, 0], [1, 1]], no: [[-1, 1], [0, 1], [1, 1]],
      confused: [[-2, 1], [-1, 0], [0, 1], [1, 0]], dizzy: [[-1, 0], [0, 1], [1, 0], [2, 1]], paint: [[-1, 0], [0, 1], [1, 0]],
      shades: [[-2, 0], [-1, 1], [0, 1], [1, 1], [2, 0]], write: [[0, 0], [1, 0]]
    };
    (mouths[mood] || []).forEach(([dx, dy]) => put(mx + dx, my + dy, pal.eye));

    if (mood === 'shades') {
      for (let x = -7; x <= 7; x++) for (let y = -1; y <= 1; y++) put(BODY.cx + x + ox, Math.round(BODY.ey) + y + oy, '#000');
      put(BODY.cx - 5 + ox, Math.round(BODY.ey) - 1 + oy, '#fff'); put(BODY.cx + 3 + ox, Math.round(BODY.ey) - 1 + oy, '#fff');
    }
    if (mood === 'magnify') {
      // lupa: aro grueso alrededor del ojo y mango hacia abajo a la derecha
      const cx = BODY.ex + ox, cy = BODY.ey + oy, r = BODY.er + 1.6;
      for (let a = 0; a < Math.PI * 2; a += .12) { put(cx + Math.cos(a) * r, cy + Math.sin(a) * r, '#5a5d63'); put(cx + Math.cos(a) * (r + 1), cy + Math.sin(a) * (r + 1), '#5a5d63'); }
      thick(put, cx + r * .7, cy + r * .7, cx + r * .7 + 5, cy + r * .7 + 5, '#5a5d63', 1);
    }

    // Partículas
    if (mood === 'sleep' && Math.random() < .015) emitFx('z', 1, {x: BODY.cx + 9, y: BODY.top + oy - 1, vx: .25, vy: -.35, life: 2.4});
    if (mood === 'dance' && Math.random() < .05) emitFx('note', 1);
    if (mood === 'dizzy' && Math.random() < .08) emitFx('star', 1, {x: BODY.cx + Math.cos(t * 6) * 10, y: BODY.top - 3 + Math.sin(t * 6) * 2, vx: 0, vy: 0, life: .4});
    S.particles = S.particles.filter(p => (p.age += 1 / 60) < p.life);
    S.particles.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy;
      if (p.age > p.life * .7 && Math.floor(p.age * 12) % 2) return;
      if (p.kind === 'confetti') { p.c ??= pick([pal.fx, pal.soft, pal.eye]); put(p.x, p.y, p.c); put(p.x + 1, p.y, p.c); return; }
      const g = GLYPH[p.kind]; if (!g) return;
      g.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(Math.round(p.x) + rx, Math.round(p.y) + ry, pal.fx)));
    });
  }

  function drawEye(put, pal, now, ox, oy, mood, ak, hanging) {
    if (ak <= 0) return;
    if (ak < .6) { BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body)); return; }
    if (now > S.blinkAt) { S.blinkUntil = now + 130; S.blinkAt = now + rand(2600, 5200); if (Math.random() < .2) S.blinkAt = now + 260; }
    const blinking = now < (S.blinkUntil || 0);
    const cx = Math.round(BODY.ex - .5), cy = Math.round(BODY.ey - .5);
    const special = {love: 'heart', dizzy: 'dizzy', celebrate: 'happy', dance: 'happy', happy: 'happy', hello: 'happy', paint: 'happy'}[mood];
    if (mood === 'sleep' || (blinking && !special)) {
      BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body));
      for (let x = -3; x <= 3; x++) { put(cx + x + ox, cy + 1 + oy, pal.eye); }
      return;
    }
    if (special === 'happy') {
      BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.body));
      EYES.happy.forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(cx - 4 + rx + ox, cy - 4 + ry + oy, pal.eye)));
      return;
    }
    BODY.eye.forEach(([x, y]) => put(x + ox, y + oy, pal.eye));
    if (special && EYES[special]) {
      EYES[special].forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(cx - 4 + rx + ox, cy - 4 + ry + oy, pal.pupil)));
      return;
    }
    // la pupila mira hacia el cursor, el producto, o hacia donde se desliza
    let target = S.lookTarget;
    if (hanging && now - S.lastScrollT < 400) target = [0, S.scrollDir * 2];
    S.look[0] += (target[0] - S.look[0]) * .2; S.look[1] += (target[1] - S.look[1]) * .2;
    let lx = Math.round(clamp(S.look[0], -2, 2)), ly = Math.round(clamp(S.look[1], -2, 2));
    if (mood === 'read' || mood === 'write') { lx = Math.round(Math.sin(now / 180) * 2); ly = 1; }
    const big = ['curious', 'startle', 'confused', 'magnify'].includes(mood);
    const size = big ? 4 : 3;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(cx + lx + x - 1 + ox, cy + ly + y - 1 + oy, pal.pupil);
    put(cx + lx - 1 + ox, cy + ly - 1 + oy, '#6a6d73'); // brillo
    if (mood === 'sleepy' || mood === 'meh') for (let x = -4; x <= 4; x++) { put(cx + x + ox, cy - 4 + oy, pal.body); put(cx + x + ox, cy - 3 + oy, pal.body); put(cx + x + ox, cy - 2 + oy, pal.body); if (mood === 'sleepy') put(cx + x + ox, cy - 1 + oy, pal.body); }
    if (mood === 'sad' || mood === 'no') for (let x = -4; x <= 4; x++) for (let y = -4; y <= -4 + Math.max(0, x + 1) * .6; y++) put(cx + x + ox, cy + Math.round(y) + oy, pal.body);
    if (mood === 'confused') for (let x = 0; x <= 4; x++) { put(cx + x + ox, cy - 4 + oy, pal.body); put(cx + x + ox, cy - 3 + oy, pal.body); }
  }

  function drawWeb(put, pal, k) {
    const cx = BODY.cx, cy = BODY.top + 6, R = 26, spokes = 10, rings = 5;
    for (let s = 0; s < spokes; s++) {
      const a = s / spokes * Math.PI * 2 + .2, len = R * Math.min(1, k * 2);
      for (let r = 4; r < len; r += .7) put(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8, pal.web);
    }
    const shown = Math.floor(clamp((k - .3) / .7, 0, 1) * rings);
    for (let i = 1; i <= shown; i++) {
      const r = 4 + i * (R - 4) / rings;
      for (let s = 0; s < spokes; s++) {
        const a1 = s / spokes * Math.PI * 2 + .2, a2 = (s + 1) / spokes * Math.PI * 2 + .2;
        line(put, Math.round(cx + Math.cos(a1) * r), Math.round(cy + Math.sin(a1) * r * .8), Math.round(cx + Math.cos(a2) * r * .92), Math.round(cy + Math.sin(a2) * r * .8 * .92), pal.web);
      }
    }
  }

  // ── Posición
  let lastScroll = scrollY;
  addEventListener('scroll', () => {
    const dy = scrollY - lastScroll; lastScroll = scrollY;
    if (dy) { S.scrollDir = Math.sign(dy); S.lastScrollT = performance.now(); }
    if (S.mode === 'hang' && S.hangY != null && !reduce.matches) {
      // se desliza por la telaraña en la dirección del scroll y se queda donde paras
      S.hangY = clamp(S.hangY + dy * .3, hangMin(), hangMax());
      S.swingV += clamp(dy * .02, -1.5, 1.5);
    }
    activity();
  }, {passive: true});
  const narrow = matchMedia('(max-width: 899px)');
  const hangSize = () => narrow.matches ? 54 : 72;
  const hangMin = () => narrow.matches ? 70 : 90;
  const hangMax = () => innerHeight * (narrow.matches ? .58 : .62);

  function visible(slot) {
    if (!slot) return null;
    const r = slot.getBoundingClientRect();
    if (!r.width || r.bottom < 40 || r.top > innerHeight - 30) return null;
    return r;
  }
  function place() {
    const hero = visible(document.querySelector('[data-mascot-slot="hero"]'));
    const foot = visible(document.querySelector('[data-mascot-slot="footer"]'));
    const heroR = hero && hero.bottom > innerHeight * .2 ? hero : null;
    const mode = heroR ? 'hero' : foot ? 'footer' : 'hang';
    let target;
    if (mode === 'hang') {
      const w = hangSize();
      if (S.hangY == null) S.hangY = clamp((S.pos?.y ?? innerHeight * .3), hangMin(), hangMax());
      const right = narrow.matches ? 0 : 6;
      target = {x: innerWidth - w - right, y: S.hangY, w};
    } else {
      const r = mode === 'hero' ? heroR : foot;
      target = {x: r.left, y: r.top, w: r.width};
    }
    if (mode !== S.mode) {
      const from = S.mode; S.mode = mode; el.dataset.mode = mode;
      if (mode === 'hang' && S.pos) { S.hangY = clamp(S.pos.y, hangMin(), hangMax()); S.swingV += 2; }
      if (mode === 'footer' && !S.saidFooter) { S.saidFooter = true; setTimeout(() => react('greet', {text: pick(PHRASES.footer)}), 450); }
      if (from === 'hang' && mode !== 'hang') hop(1);
    }
    if (!S.pos || reduce.matches) S.pos = {...target};
    const f = mode === 'hang' ? .2 : .3;
    S.pos.x += (target.x - S.pos.x) * f; S.pos.y += (target.y - S.pos.y) * f; S.pos.w += (target.w - S.pos.w) * f;
    // vaivén del hilo
    S.swingV += -S.swing * .06; S.swingV *= .9; S.swing = clamp(S.swing + S.swingV, -8, 8);
    const sw = mode === 'hang' ? S.swing : 0;
    el.style.transform = `translate3d(${(S.pos.x + sw).toFixed(1)}px,${S.pos.y.toFixed(1)}px,0) rotate(${(-sw * .8).toFixed(2)}deg)`;
    el.style.width = `${S.pos.w.toFixed(1)}px`;
    const px = S.pos.w / W;
    thread.style.width = `${(px * 2).toFixed(1)}px`;
    thread.style.height = `${(S.pos.y + 2).toFixed(1)}px`;
    thread.style.opacity = mode === 'hang' ? '1' : '0';
  }

  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .45);
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
    const els = document.elementsFromPoint(r.left + r.width / 2, clamp(r.bottom - 4, 0, innerHeight - 1)).filter(e => !el.contains(e));
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
    // Para probar en la consola: astrolyMascot.idle(31) simula 31 s sin actividad (teje y se duerme).
    idle(sec) { S.lastInput = performance.now() - sec * 1000; if (sec > 14) { S.mood = 'weave'; S.web = Math.min(1, sec / 21); } },
    prepare() { if (!reduce.matches) S.assembled = 0; },
    lookAt(x, y) { const r = canvas.getBoundingClientRect(); const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1; S.lookTarget = [dx / d * 2, dy / d * 2]; }
  };
}

function greeting() {
  const h = new Date().getHours();
  return `${h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'}. Bienvenido a astroly.`;
}
// Línea de píxeles (Bresenham) y su versión de 2 px de grosor.
function line(put, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, guard = 0;
  while (guard++ < 200) { put(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
}
function thick(put, x0, y0, x1, y1, c, dir = 1) {
  line(put, x0, y0, x1, y1, c);
  // la segunda línea va hacia afuera si el tramo es más vertical, o hacia abajo si es más horizontal
  if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) line(put, x0 + dir, y0, x1 + dir, y1, c);
  else line(put, x0, y0 + 1, x1, y1 + 1, c);
}
