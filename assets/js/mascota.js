// La mascota de astroly: un gato de casa en vector, blanco perla con collar naranja brasa.
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

const SVG = `<svg class="cat" viewBox="0 0 100 100" aria-hidden="true">
  <ellipse class="c-shadow" cx="50" cy="96" rx="27" ry="3.4"/>
  <g class="c-awake">
    <g class="c-tail"><path class="o" d="M64 91C82 93 92 82 90 67C89 59 85 54 80 55"/><path class="f" d="M64 91C82 93 92 82 90 67C89 59 85 54 80 55"/></g>
    <g class="c-body">
      <path class="fill" d="M29 93C25 76 31 58 50 57C69 58 75 76 71 93Z"/>
      <path class="belly" d="M41 92C39 80 43 70 50 69C57 70 61 80 59 92Z"/>
      <g class="c-paw-l"><ellipse class="fill" cx="40" cy="92.5" rx="7.5" ry="4.6"/><path class="toe" d="M37.5 92v2.6M42.5 92v2.6"/></g>
      <g class="c-paw-r"><ellipse class="fill" cx="60" cy="92.5" rx="7.5" ry="4.6"/><path class="toe" d="M57.5 92v2.6M62.5 92v2.6"/></g>
    </g>
    <g class="c-head">
      <g class="c-ear-l"><path class="fill" d="M27 35L28.5 11L45 24Z"/><path class="inner" d="M31 28L31.8 17.5L40 24.5Z"/></g>
      <g class="c-ear-r"><path class="fill" d="M73 35L71.5 11L55 24Z"/><path class="inner" d="M69 28L68.2 17.5L60 24.5Z"/></g>
      <ellipse class="fill" cx="50" cy="38" rx="25" ry="19.5"/>
      <circle class="cheek" cx="35.5" cy="45" r="3.8"/><circle class="cheek" cx="64.5" cy="45" r="3.8"/>
      <g class="c-eyes">
        <g class="e e-open"><g class="c-eye-l"><ellipse cx="41" cy="38" rx="3.8" ry="4.8"/><circle class="shine" cx="42.3" cy="36.2" r="1.3"/></g>
          <g class="c-eye-r"><ellipse cx="59" cy="38" rx="3.8" ry="4.8"/><circle class="shine" cx="60.3" cy="36.2" r="1.3"/></g></g>
        <path class="e e-happy line" d="M37 39.5Q41 34.5 45 39.5M55 39.5Q59 34.5 63 39.5"/>
        <path class="e e-closed line" d="M37 38.5Q41 41.5 45 38.5M55 38.5Q59 41.5 63 38.5"/>
        <path class="e e-heart solid" d="M41 42.6l-3.7-3.6a2.3 2.3 0 0 1 3.7-2.7a2.3 2.3 0 0 1 3.7 2.7ZM59 42.6l-3.7-3.6a2.3 2.3 0 0 1 3.7-2.7a2.3 2.3 0 0 1 3.7 2.7Z"/>
        <path class="e e-dizzy line" d="M41 38m-1 0a1 1 0 1 1 2 0a2 2 0 1 1-4 0a3 3 0 1 1 6 0M59 38m-1 0a1 1 0 1 1 2 0a2 2 0 1 1-4 0a3 3 0 1 1 6 0"/>
        <g class="e e-big"><circle cx="41" cy="38" r="5.2"/><circle cx="59" cy="38" r="5.2"/><circle class="shine" cx="42.8" cy="36" r="1.7"/><circle class="shine" cx="60.8" cy="36" r="1.7"/></g>
        <path class="e e-half line" d="M37 38.5H45M55 38.5H63"/>
      </g>
      <path class="nose" d="M47.6 44.2H52.4L50 47Z"/>
      <path class="c-mouth line" d="M46 48.4Q48 50.6 50 47.8Q52 50.6 54 48.4"/>
      <ellipse class="c-mouth-open" cx="50" cy="50" rx="2.4" ry="2.8"/>
      <path class="whisk" d="M35 44.5L23 42.5M35 47L23 48.5M65 44.5L77 42.5M65 47L77 48.5"/>
      <g class="c-shades"><path d="M33 34H67V36.5H33Z"/><rect x="34" y="34" width="13" height="8" rx="2.5"/><rect x="53" y="34" width="13" height="8" rx="2.5"/></g>
    </g>
    <g class="c-collar"><path d="M34 55Q50 61.5 66 55"/><circle cx="50" cy="60" r="2.8"/></g>
    <g class="c-loupe"><circle cx="62" cy="38" r="7.5"/><path d="M67.5 43.5L74 52"/></g>
    <g class="c-paw-up"><ellipse class="fill" cx="68" cy="58" rx="5.6" ry="6.8"/><path class="toe" d="M65.5 54.5v-2M70.5 54.5v-2"/></g>
  </g>
  <g class="c-asleep">
    <path class="o" d="M80 90C96 88 96 72 84 72"/><path class="f" d="M80 90C96 88 96 72 84 72"/>
    <path class="fill" d="M22 93C20 80 34 71 54 71C74 71 84 80 82 93Z"/>
    <g class="c-sleep-head"><path class="fill" d="M20 70L21 55L31 62Z"/><path class="fill" d="M44 70L42.5 55L33 62Z"/>
      <ellipse class="fill" cx="32" cy="78" rx="15" ry="12"/>
      <path class="line" d="M24 78Q27 80.5 30 78M34 78Q37 80.5 40 78"/><path class="nose" d="M30.6 83H33.4L32 84.6Z"/></g>
    <path class="o" d="M50 92C62 95 78 94 84 90"/><path class="f" d="M50 92C62 95 78 94 84 90"/>
  </g>
</svg>`;

export function createMascot({root = document.body} = {}) {
  const el = document.createElement('div');
  el.className = 'mascot'; el.dataset.mode = 'hidden';
  el.innerHTML = `<button class="mascot-body" type="button" aria-label="Gato de astroly: tócalo para saludar">${SVG}</button>
    <div class="mascot-fx" aria-hidden="true"></div>
    <p class="mascot-bubble" role="status" aria-live="polite"></p>`;
  root.append(el);
  const svg = el.querySelector('svg'), btn = el.querySelector('.mascot-body');
  const bubble = el.querySelector('.mascot-bubble'), fx = el.querySelector('.mascot-fx');
  const g = sel => svg.querySelector(sel);
  const P = {
    tail: g('.c-tail'), body: g('.c-body'), head: g('.c-head'), eyes: g('.c-eyes'), earL: g('.c-ear-l'), earR: g('.c-ear-r'),
    eyeL: g('.c-eye-l'), eyeR: g('.c-eye-r'), pawL: g('.c-paw-l'), pawR: g('.c-paw-r'), pawUp: g('.c-paw-up'),
    collar: g('.c-collar'), sleepHead: g('.c-sleep-head'), asleep: g('.c-asleep'), shadow: g('.c-shadow')
  };

  const S = {
    mood: 'idle', moodUntil: 0, look: [0, 0], lookTarget: [0, 0], blinkAt: performance.now() + 2500,
    jumpStart: 0, jumps: 0, lastInput: performance.now(), clicks: [], sleeping: false,
    pos: null, mode: 'hidden', lastScrollT: 0, scrollDir: 1, saidFooter: false, entered: false
  };

  let bubbleTimer = 0;
  function say(text, ms = 2400) {
    if (!text || S.mode === 'hidden') return;
    bubble.textContent = text; el.classList.add('is-talking');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => el.classList.remove('is-talking'), ms);
  }
  const GLYPH = {heart: '♥', z: 'z', note: '♪', star: '✦', coin: '$', bang: '!', ask: '?', check: '✓', drop: '·', purr: '~'};
  function emitFx(kind, n = 1, {dx = 0} = {}) {
    if (S.mode === 'hidden') return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.className = `fx fx-${kind}`; s.textContent = GLYPH[kind] || '✦';
      s.style.left = `${50 + dx + rand(-22, 22)}%`; s.style.top = `${rand(2, 22)}%`;
      s.style.setProperty('--dx', `${rand(-18, 18)}px`); s.style.animationDelay = `${i * 90}ms`;
      fx.append(s); s.addEventListener('animationend', () => s.remove());
    }
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

  // ── Dibujo: cada parte se mueve con transform (origen explícito en coordenadas del SVG).
  const EYE_FOR = {
    happy: 'happy', love: 'heart', dizzy: 'dizzy', startle: 'big', curious: 'big', magnify: 'big', purr: 'closed',
    sleepy: 'half', meh: 'half', groom: 'closed', celebrate: 'happy', dance: 'happy', wave: 'happy', shades: 'open'
  };
  function frame(now) {
    const t = now / 1000, idleFor = (now - S.lastInput) / 1000;
    if (S.mood !== 'idle' && now > S.moodUntil && S.mood !== 'groom') S.mood = 'idle';
    if (!S.sleeping && idleFor > 30 && !reduce.matches) { S.sleeping = true; el.classList.add('is-asleep'); S.mood = 'idle'; }
    else if (!S.sleeping && idleFor > 14 && S.mood === 'idle' && !reduce.matches) S.mood = 'groom';
    const m = S.sleeping ? 'sleep' : S.mood;
    const walking = !S.sleeping && S.mode === 'corner' && now - S.lastScrollT < 280 && !reduce.matches;

    // mirada
    S.look[0] += (S.lookTarget[0] - S.look[0]) * .15; S.look[1] += (S.lookTarget[1] - S.look[1]) * .15;
    let [lx, ly] = S.look;
    if (m === 'read') { lx = Math.sin(t * 5) * 1.6; ly = 1.2; }
    if (m === 'write') { lx = 0; ly = 1.8; }
    // parpadeo
    let blink = 1;
    if (now > S.blinkAt) { const k = (now - S.blinkAt) / 140; blink = k < 1 ? 1 - Math.sin(k * Math.PI) * .92 : 1; if (k >= 1) S.blinkAt = now + rand(2200, 5200); }
    const eye = EYE_FOR[m] || 'open';
    svg.dataset.eye = eye; svg.dataset.mood = m;
    P.eyes.setAttribute('transform', eye === 'open' ? `translate(0 ${38 * (1 - blink)}) scale(1 ${blink})` : '');
    const pupil = `translate(${(lx * 1.3).toFixed(2)} ${(ly * 1.1).toFixed(2)})`;
    P.eyeL.setAttribute('transform', pupil); P.eyeR.setAttribute('transform', pupil);

    // cabeza
    let hr = lx * 2, hy = 0, hx = 0;
    if (m === 'confused') hr = 13;
    if (m === 'no') hr = Math.sin(t * 22) * 9;
    if (m === 'dizzy') { hr = Math.sin(t * 7) * 8; hx = Math.cos(t * 7) * 1.5; }
    if (m === 'dance') hr = Math.sin(t * 9) * 10;
    if (m === 'sad') { hy = 3; hr = -4; }
    if (m === 'write') { hy = 2; hr = -6; }
    if (m === 'groom') { hy = 2.5; hr = 10; }
    if (m === 'curious') hr = lx * 4 + 6;
    if (m === 'purr') hx = Math.sin(t * 60) * .35;
    P.head.setAttribute('transform', `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${hr.toFixed(2)} 50 56)`);
    // orejas: atentas, caídas o atrás
    const earDown = m === 'sad' || m === 'no' ? 14 : m === 'startle' || m === 'curious' ? -6 : Math.sin(t * .7) > .97 ? 8 : 0;
    P.earL.setAttribute('transform', `rotate(${-earDown} 36 30)`); P.earR.setAttribute('transform', `rotate(${earDown} 64 30)`);

    // cuerpo: respiración, caminar o bailar
    const breathe = 1 + Math.sin(t * 2.2) * .012;
    const bob = walking ? Math.abs(Math.sin(t * 12)) * -2.2 : m === 'dance' ? Math.abs(Math.sin(t * 9)) * -3 : 0;
    P.body.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) translate(50 93) scale(${(2 - breathe).toFixed(4)} ${breathe.toFixed(4)}) translate(-50 -93)`);
    const step = walking ? Math.sin(t * 12) * 3 : m === 'write' ? Math.sin(t * 18) * 1.4 : 0;
    P.pawL.setAttribute('transform', `translate(0 ${Math.min(0, step).toFixed(2)})`);
    P.pawR.setAttribute('transform', `translate(0 ${Math.min(0, -step).toFixed(2)})`);
    // pata levantada: saludar o acicalarse
    const pawUp = m === 'wave' ? `rotate(${(Math.sin(t * 10) * 18).toFixed(1)} 66 66)` : m === 'groom' ? `translate(-15 -8) rotate(-10 68 58)` : null;
    P.pawUp.style.display = pawUp ? '' : 'none'; if (pawUp) P.pawUp.setAttribute('transform', pawUp);
    P.pawR.style.opacity = m === 'wave' ? 0 : 1;
    P.pawL.style.opacity = m === 'groom' ? 0 : 1;

    // cola
    let tr = Math.sin(t * 1.4) * 7;
    if (walking || m === 'happy' || m === 'celebrate' || m === 'love') tr = -18 + Math.sin(t * 8) * 9;
    if (m === 'dance') tr = Math.sin(t * 9) * 25;
    if (m === 'sad') tr = 14;
    if (m === 'startle') tr = -28;
    P.tail.setAttribute('transform', `rotate(${tr.toFixed(2)} 64 91)`);
    P.collar.setAttribute('transform', m === 'dance' || walking ? `rotate(${(Math.sin(t * 12) * 3).toFixed(2)} 50 56)` : '');
    P.sleepHead.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.6) * .6).toFixed(2)})`);
    if (S.sleeping && now - (S.lastZ || 0) > 1600) { S.lastZ = now; emitFx('z', 1, {dx: -16}); }

    // salto
    let jump = 0;
    if (S.jumps && !reduce.matches) {
      const k = (now - S.jumpStart) / 380;
      if (k >= S.jumps) S.jumps = 0; else jump = Math.sin((k % 1) * Math.PI) * 16;
    }
    svg.style.transform = `translateY(${-jump}px)`;
    P.shadow.setAttribute('transform', `translate(50 96) scale(${(1 - jump / 40).toFixed(3)}) translate(-50 -96)`);
  }

  // ── Posición
  let lastScroll = scrollY;
  addEventListener('scroll', () => {
    const dy = scrollY - lastScroll; lastScroll = scrollY;
    if (dy) { S.scrollDir = Math.sign(dy); S.lastScrollT = performance.now(); }
    activity();
  }, {passive: true});
  const size = () => narrow.matches ? 62 : 84;

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
    if (mode === 'slot') target = {x: slot.left, y: slot.top, w};
    else if (mode === 'footer') target = {x: foot.left, y: foot.bottom - w, w};
    else {
      const bottom = narrow.matches ? 64 + 10 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe')) || 0) : 14;
      target = {x: innerWidth - w - (narrow.matches ? 6 : 10), y: innerHeight - bottom - w, w};
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
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * .38), d = Math.hypot(dx, dy) || 1;
    S.lookTarget = [dx / d * Math.min(1.6, d / 60), dy / d * Math.min(1.6, d / 60)];
  }
  addEventListener('pointermove', e => {
    lookAt(e.clientX, e.clientY);
    const r = svg.getBoundingClientRect();
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
