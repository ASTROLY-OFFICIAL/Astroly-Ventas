// Escena de la portada en 8 bits: Astro busca entre tres cajas. En las dos primeras no encuentra nada; en la tercera
// sale una lámpara que se enciende, Astro celebra y se despliega la promoción (onFound).
// Se dibuja en un lienzo de 200×80 píxeles escalado sin suavizado. Tocar la escena la repite.
import {paintStar, paintFace, PAL} from './mascota.js';
import {on} from './store.js';

const W = 200, H = 80, FLOOR = 72;
const BOXES = [52, 102, 152], BW = 28, BH = 22, BOX_TOP = FLOOR - BH;
const R = 11, r = 6.2, G = FLOOR - 9, T = BOX_TOP - 9, D = BOX_TOP + 10;   // centro de la estrella: suelo, sobre la caja, adentro
const WAY = [-14, 22, 77, 127, 181];
const FOUND = 10.6, END = 12.2;

const COL = {
  light: {top: '#eceae5', front: '#d8d6d0', side: '#bdbbb5', tape: '#aaa8a2', out: '#1a1b1e', inside: '#2a2c31', floor: 'rgba(0,0,0,.35)', dust: '#8a8f98',
    shade: '#f6f6f4', shadeLo: '#cfcfcb', stem: '#3a3d44', base: '#1a1b1e', bulb: '#fff4cf', ray: 'rgba(255,236,170,.9)', glyph: '#141519'},
  dark: {top: '#d9d7d1', front: '#bfbdb6', side: '#a3a19b', tape: '#8f8d87', out: '#050505', inside: '#1a1b1e', floor: 'rgba(255,255,255,.28)', dust: '#8a8f98',
    shade: '#f6f6f4', shadeLo: '#cfcfcb', stem: '#9aa0a8', base: '#d9dbe0', bulb: '#fff4cf', ray: 'rgba(255,236,170,.75)', glyph: '#f2f2f2'}
};
const GLYPH = {ask: ['111', '001', '011', '000', '010'], bang: ['1', '1', '1', '0', '1'], dots: ['10101']};

const ease = k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const lerp = (a, b, k) => a + (b - a) * k;

// Dónde está Astro y qué hace en el segundo t.
function plan(t) {
  const s = {x: WAY[0], y: G, mood: 'idle', inside: -1, walk: false, arms: 'rest', open: [false, false, false], lamp: 0, glow: 0, glyph: null};
  if (t < 1) { s.x = lerp(WAY[0], WAY[1], t); s.walk = true; return s; }
  for (let i = 0; i < 3; i++) {
    const s0 = 1 + i * 3.3, bx = BOXES[i];
    if (t < s0) break;
    s.open[i] = t >= s0 + .5;
    const last = i === 2;
    if (t < s0 + .5) { const k = seg(t, s0, s0 + .5); s.x = lerp(WAY[i + 1], bx, k); s.y = lerp(G, T, k) - Math.sin(k * Math.PI) * 12; s.arms = 'up'; return s; }
    if (t < s0 + .6) { s.x = bx; s.y = T + 1; return s; }
    if (t < s0 + 1) { s.x = bx; s.y = lerp(T, D, ease(seg(t, s0 + .6, s0 + 1))); s.arms = 'up'; s.inside = i; return s; }
    if (t < s0 + 1.7) { s.x = bx + (Math.floor(t * 14) % 2 ? 1 : -1); s.y = D - (Math.floor(t * 7) % 2); s.inside = i; s.arms = 'dig'; s.dig = i; return s; }
    if (!last) {
      if (t < s0 + 2.1) { s.x = bx; s.y = lerp(D, T, ease(seg(t, s0 + 1.7, s0 + 2.1))); s.inside = i; return s; }
      if (t < s0 + 2.8) { s.x = bx; s.y = T; s.mood = i === 0 ? 'no' : 'confused'; s.glyph = i === 0 ? 'ask' : 'dots'; s.arms = 'shrug'; return s; }
      if (t < s0 + 3.3) { const k = seg(t, s0 + 2.8, s0 + 3.3); s.x = lerp(bx, WAY[i + 2], k); s.y = lerp(T, G, k) - Math.sin(k * Math.PI) * 10; s.arms = 'up'; continue; }
      s.x = WAY[i + 2]; s.y = G; continue;
    }
    // Tercera caja: sale con la lámpara, salta a un lado y la lámpara se enciende.
    s.lamp = ease(seg(t, s0 + 1.7, s0 + 2.5)); s.glow = seg(t, s0 + 2.5, s0 + 3.1);
    if (t < s0 + 2.1) { s.x = bx; s.y = lerp(D, T, ease(seg(t, s0 + 1.7, s0 + 2.1))); s.inside = 2; s.arms = 'up'; s.glyph = 'bang'; return s; }
    if (t < s0 + 2.6) { const k = seg(t, s0 + 2.1, s0 + 2.6); s.x = lerp(bx, WAY[4], k); s.y = lerp(T, G, k) - Math.sin(k * Math.PI) * 14; s.arms = 'up'; return s; }
    s.x = WAY[4]; s.y = G;
    s.mood = t < END ? 'celebrate' : 'happy'; s.arms = t < END ? 'cheer' : 'point';
    return s;
  }
  return s;
}

export function mountScene(root, {onFound, onReset} = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H; canvas.className = 'scene-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Astro, la estrellita de astroly, busca entre cajas y encuentra una lámpara.');
  root.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= W || y >= H) return; ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); };
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  let t0 = performance.now(), found = false, parts = [], visible = true, raf = 0, last = 0;

  function boxBack(i, c, open) {
    const bx = BOXES[i], x0 = bx - BW / 2, x1 = bx + BW / 2 - 1;
    if (!open) { rect(x0 + 2, BOX_TOP - 3, x1 - 2, BOX_TOP - 1, c.top); rect(x0 + 2, BOX_TOP - 4, x1 - 2, BOX_TOP - 4, c.out); put(x0 + 1, BOX_TOP - 3, c.out); put(x1 - 1, BOX_TOP - 3, c.out); rect(bx - 1, BOX_TOP - 3, bx, BOX_TOP - 1, c.tape); return; }
    rect(x0 + 2, BOX_TOP - 3, x1 - 2, BOX_TOP - 1, c.inside);
    for (let k = 0; k < 8; k++) {             // solapas abiertas
      rect(x0 - k, BOX_TOP - 1 - k, x0 - k + 2, BOX_TOP - 1 - k, k === 7 ? c.out : c.top); put(x0 - k - 1, BOX_TOP - 1 - k, c.out);
      rect(x1 + k - 2, BOX_TOP - 1 - k, x1 + k, BOX_TOP - 1 - k, k === 7 ? c.out : c.side); put(x1 + k + 1, BOX_TOP - 1 - k, c.out);
    }
  }
  function boxFront(i, c) {
    const bx = BOXES[i], x0 = bx - BW / 2, x1 = bx + BW / 2 - 1;
    rect(x0, BOX_TOP, x1, FLOOR - 1, c.front);
    rect(x1 - 4, BOX_TOP + 1, x1 - 1, FLOOR - 2, c.side);
    rect(bx - 1, BOX_TOP, bx, BOX_TOP + 7, c.tape);
    rect(x0 + 4, FLOOR - 7, x0 + 9, FLOOR - 6, c.side);           // etiqueta
    for (let x = x0; x <= x1; x++) { put(x, BOX_TOP, c.out); put(x, FLOOR - 1, c.out); }
    for (let y = BOX_TOP; y < FLOOR; y++) { put(x0, y, c.out); put(x1, y, c.out); }
  }
  function lamp(x, base, glow, c, t) {
    if (glow > 0) {                          // halo y rayos en píxeles alternos
      const reach = 4 + glow * 8, spin = t * .4;
      for (let k = 0; k < 8; k++) {
        const a = spin + k * Math.PI / 4;
        if (Math.sin(a) > .35) continue;        // sin rayos hacia la caja
        for (let d = 15; d < 15 + reach; d++) if (d % 3 !== 2) put(x + Math.cos(a) * d, base - 18 + Math.sin(a) * d * .8, c.ray);
      }
    }
    rect(x - 6, base - 2, x + 5, base - 1, c.base); rect(x - 5, base - 3, x + 4, base - 3, c.base);
    rect(x - 1, base - 14, x, base - 4, c.stem);
    for (let y = 0; y < 9; y++) {
      const half = Math.round(4 + y * .85);
      for (let dx = -half; dx < half; dx++) put(x + dx, base - 23 + y, y === 0 || dx === -half || dx === half - 1 ? c.out : dx > half - 4 ? c.shadeLo : c.shade);
    }
    rect(x - 10, base - 14, x + 9, base - 14, c.out);
    rect(x - 3, base - 13, x + 2, base - 13, glow > 0 ? c.bulb : c.shadeLo);
  }
  function glyph(name, x, y, col) { GLYPH[name].forEach((row, ry) => [...row].forEach((v, rx) => v === '1' && put(x + rx, y + ry, col))); }

  function draw(now) {
    const t = reduce.matches ? END + 1 : (now - t0) / 1000;
    const dark = document.documentElement.dataset.theme === 'dark';
    const c = dark ? COL.dark : COL.light, pal = dark ? PAL.dark : PAL.light;
    const s = plan(t);
    ctx.clearRect(0, 0, W, H);
    for (let x = 4; x < W - 4; x++) put(x, FLOOR, c.floor);
    for (let x = 8; x < W - 8; x += 2) put(x, FLOOR + 1, c.floor);

    BOXES.forEach((_, i) => boxBack(i, c, s.open[i]));
    BOXES.forEach((_, i) => { if (i !== s.inside && !(i === 2 && s.lamp < 1 && s.lamp > 0)) boxFront(i, c); });
    if (s.lamp > 0) lamp(BOXES[2], FLOOR + 1 - (BH + 1) * s.lamp, s.glow, c, t);

    // Estrellita
    const tip = [0, 1, 2, 3, 4].map(() => [0, 0]);
    const mv = (i, dx, dy) => { tip[i][0] += dx; tip[i][1] += dy; };
    const w = k => Math.round(Math.sin(t * k));
    if (s.walk) { const st = Math.floor(t * 8) % 2; mv(st ? 2 : 3, 0, -2); mv(1, 0, 1); mv(4, 0, 1); }
    if (s.arms === 'up') { mv(1, -1, -4); mv(4, 1, -4); }
    if (s.arms === 'dig') { mv(1, w(18), -3 + w(14)); mv(4, -w(18), -3 - w(14)); }
    if (s.arms === 'shrug') { mv(1, 1, -2); mv(4, -1, -2); }
    if (s.arms === 'cheer') { mv(1, 1, -5 + w(12)); mv(4, -1, -5 - w(12)); }
    if (s.arms === 'point') { mv(4, -3, -2); }
    let sx = s.x, sy = s.y + (s.walk ? -Math.abs(w(8)) : 0);
    if (s.mood === 'no') sx += Math.round(Math.sin(t * 22));
    if (s.mood === 'celebrate') sy -= Math.abs(Math.round(Math.sin(t * 7) * 3));
    paintStar(put, {cx: sx, cy: sy, R, r, tip, pal});
    const look = s.arms === 'point' ? [-1, 0] : s.walk || s.x < BOXES[2] ? [1, 0] : [0, 0];
    paintFace(put, {cx: sx, cy: sy, pal, mood: s.mood, lx: look[0], ly: look[1], small: true, blinking: Math.floor(t * 10) % 37 === 0});
    if (s.inside >= 0) boxFront(s.inside, c);
    if (s.lamp > 0 && s.lamp < 1 && s.inside !== 2) boxFront(2, c);
    if (s.glyph) glyph(s.glyph, Math.round(sx) + 8, Math.round(sy) - 18, c.glyph);

    // Partículas: cosas que salen volando de la caja y chispas al encontrar la lámpara
    if (s.dig != null && Math.random() < .5) parts.push({x: BOXES[s.dig] + (Math.random() * 16 - 8), y: BOX_TOP - 2, vx: Math.random() * 1.6 - .8, vy: -1.4 - Math.random(), g: .12, life: .7, age: 0, c: c.dust, size: 1 + (Math.random() < .3)});
    if (s.mood === 'celebrate' && Math.random() < .4) parts.push({x: sx + Math.random() * 30 - 15, y: sy - 8 - Math.random() * 10, vx: 0, vy: -.2, g: 0, life: .6, age: 0, c: pick(pal.frost), spark: true});
    parts = parts.filter(p => (p.age += 1 / 60) < p.life);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy;
      if (p.spark) { put(p.x, p.y, p.c); if (p.age < p.life / 2) { put(p.x - 1, p.y, p.c); put(p.x + 1, p.y, p.c); put(p.x, p.y - 1, p.c); put(p.x, p.y + 1, p.c); } return; }
      rect(p.x, p.y, p.x + p.size - 1, p.y + p.size - 1, p.c);
    });

    if (!found && t >= FOUND) { found = true; onFound?.(); }
  }
  const pick = list => list[Math.floor(Math.random() * list.length)];
  function loop(now) {
    raf = 0;
    if (!visible) return;
    if (now - last > 15) { last = now; draw(now); }
    if (!reduce.matches) raf = requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(canvas);
  reduce.addEventListener?.('change', () => { if (!raf) raf = requestAnimationFrame(loop); });
  on('theme', () => { if (reduce.matches) requestAnimationFrame(draw); });
  canvas.addEventListener('click', () => { if (reduce.matches) return; t0 = performance.now(); found = false; parts = []; onReset?.(); });
  raf = requestAnimationFrame(loop);
  return {replay() { t0 = performance.now(); found = false; parts = []; onReset?.(); }};
}
