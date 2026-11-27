// Ilustraciones isométricas de los productos de ejemplo, con el mismo vocabulario del kit
// (iso-art de la landing): cara superior iluminada (ft), caras izquierda (fl) y derecha (fr),
// y tonos m (blanco), s (grafito), c (perla) y p (hueso). Cada variante de color cambia el tono.
// Cuando lleguen las fotos reales, el <img> del producto reemplaza esta ilustración.

const C = Math.cos(Math.PI / 6), K = C.toFixed(4);
const n = v => Math.round(v * 10) / 10;
const P = (x, y, z = 0) => [n((x - y) * C), n((x + y) / 2 - z)];
const poly = (list, cls) => `<polygon class="${cls}" points="${list.map(p => P(...p).join(',')).join(' ')}"/>`;
const onLeft = (y, inner) => `<g transform="matrix(${K} .5 0 -1 ${n(-C * y)} ${n(y / 2)})">${inner}</g>`;
const onRight = (x, inner) => `<g transform="matrix(${K} -.5 0 -1 ${n(C * x)} ${n(x / 2)})">${inner}</g>`;

function box(x, y, z, w, d, h, tone = 'm', cls = '') {
  return `<g class="${tone} ${cls}">` +
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], 'fl') +
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], 'fr') +
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], 'ft') + '</g>';
}
// Sólido de revolución: perfil [[z, r], ...] de abajo hacia arriba, sombreado con degradado.
function lathe(profile, tone = 'm', {open = false, cx = 0, cy = 0} = {}) {
  const [ox, oy] = P(cx, cy, 0);
  const k = 1.2247, e = .7071;
  const left = profile.map(([z, r]) => `${n(ox - r * k)},${n(oy - z)}`);
  const right = profile.slice().reverse().map(([z, r]) => `${n(ox + r * k)},${n(oy - z)}`);
  const [zb, rb] = profile[0], [zt, rt] = profile[profile.length - 1];
  const side = `<path class="lx" fill="url(#g-${tone})" d="M${left.join('L')}L${right.join('L')}A${n(rb * k)} ${n(rb * e)} 0 0 1 ${n(ox - rb * k)} ${n(oy - zb)}Z"/>`;
  const top = `<ellipse class="ft" cx="${ox}" cy="${n(oy - zt)}" rx="${n(rt * k)}" ry="${n(rt * e)}"/>`;
  const hole = open ? `<ellipse class="hole" cx="${ox}" cy="${n(oy - zt + rt * .08)}" rx="${n(rt * k * .78)}" ry="${n(rt * e * .7)}"/>` : '';
  return `<g class="${tone}">${side}${top}${hole}</g>`;
}
const shadow = (rx = 34, ry = 12, x = 0, y = 4) => `<ellipse class="shadow" cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const defs = () => `<defs><radialGradient id="g-moon-p" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#fff6e2"/><stop offset=".6" stop-color="#f1dfbd"/><stop offset="1" stop-color="#d4b98d"/></radialGradient><radialGradient id="g-moon-m" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ecebe6"/><stop offset="1" stop-color="#c9c7c0"/></radialGradient>${['m', 's', 'c', 'p'].map(t => `<linearGradient id="g-${t}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" style="stop-color:var(--${t}2)"/><stop offset=".32" style="stop-color:var(--${t}1)"/><stop offset="1" style="stop-color:var(--${t}3)"/></linearGradient>`).join('')}
<linearGradient id="g-glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#d9dce2" stop-opacity=".9"/><stop offset=".55" stop-color="#f4f5f7"/><stop offset="1" stop-color="#b9bdc5"/></linearGradient>
<radialGradient id="g-glow"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
// Otro tono para los detalles: blanco y hueso llevan grafito; grafito y perla llevan blanco.
const alt = t => (t === 's' || t === 'c') ? 'm' : 's';

const DRAW = {
  vase: t => shadow(26, 9) +
    `<g class="a-stems"><path class="stem" d="M2 -62 Q 6 -84 18 -96"/><path class="stem" d="M-1 -62 Q -8 -80 -20 -88"/><path class="stem" d="M0 -62 Q 0 -86 4 -100"/>` +
    `<circle class="bud" cx="18" cy="-96" r="2.2"/><circle class="bud" cx="-20" cy="-88" r="2"/><circle class="bud" cx="4" cy="-100" r="2.4"/></g>` +
    lathe([[0, 10], [5, 15], [16, 18], [28, 14], [40, 7], [56, 5.5], [62, 7]], t, {open: true}),
  lamp: t => shadow(28, 10) +
    `<ellipse class="glow a-glow" cx="0" cy="-30" rx="40" ry="26" fill="url(#g-glow)"/>` +
    lathe([[0, 13], [4, 13], [6, 9], [8, 4]], alt(t)) +
    `<rect class="metal" x="-1.6" y="-56" width="3.2" height="49" rx="1.6"/>` +
    lathe([[50, 24], [53, 24], [62, 21], [70, 14], [75, 5], [76, 0]], t) +
    `<ellipse class="bulb a-glow" cx="0" cy="-50" rx="16" ry="5"/>`,
  moon: t => shadow(26, 9) +
    `<ellipse class="glow a-glow" cx="0" cy="-58" rx="44" ry="40" fill="url(#g-glow)"/>` +
    `<polygon class="wood-l" points="-27,-4 0,10 0,18 -27,4"/><polygon class="wood-r" points="0,10 27,-4 27,4 0,18"/><polygon class="wood-t" points="-27,-4 0,-18 27,-4 0,10"/>` +
    `<ellipse class="coil" cx="0" cy="-4" rx="9" ry="4.6"/>` +
    `<g class="a-float"><circle class="moon-ball" cx="0" cy="-60" r="29" fill="url(#g-moon-${t})"/>` +
    `<circle class="crater" cx="-9" cy="-70" r="6"/><circle class="crater" cx="10" cy="-52" r="8"/><circle class="crater" cx="12" cy="-76" r="3.5"/><circle class="crater" cx="-14" cy="-50" r="3"/><circle class="crater" cx="-2" cy="-40" r="2.4"/></g>`,
  candle: t => shadow(24, 9) + box(-14, -14, 0, 28, 28, 40, t) +
    `<path class="wick" d="M0 -40 v-6"/><g class="a-flame"><path class="flame" d="M0 -60 C 5 -53 5 -48 0 -46 C -5 -48 -5 -53 0 -60Z"/></g>`,
  frame: t => shadow(30, 9, 6, 2) + box(-24, 0, 0, 52, 4, 64, t) +
    onLeft(4, `<rect class="mat" x="-19" y="5" width="42" height="54"/><rect class="pic" x="-15" y="9" width="34" height="46"/>` +
      `<polygon class="pic-mtn" points="-15,9 -4,28 2,20 10,34 19,22 19,9"/><circle class="pic-sun" cx="10" cy="44" r="4.5"/>`),
  clock: t => shadow(26, 7, 4, 2) +
    onLeft(4, `<circle class="rim-${t}" cx="2" cy="34" r="30"/>`) +
    onLeft(0, `<circle class="face-${t}" cx="2" cy="34" r="27"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => { const a = i * Math.PI / 6, r1 = i % 3 ? 22 : 19; return `<line class="tick" x1="${n(2 + Math.cos(a) * r1)}" y1="${n(34 + Math.sin(a) * r1)}" x2="${n(2 + Math.cos(a) * 24)}" y2="${n(34 + Math.sin(a) * 24)}"/>`; }).join('') +
      `<g class="a-hour" style="transform-origin:2px 34px"><line class="hand" x1="2" y1="34" x2="2" y2="48"/></g>` +
      `<g class="a-min" style="transform-origin:2px 34px"><line class="hand thin" x1="2" y1="34" x2="18" y2="34"/></g>` +
      `<circle class="pin" cx="2" cy="34" r="2"/>`),
  cushion: t => shadow(34, 11) +
    `<g class="puffy">${box(-20, -6, 2, 40, 14, 40, t)}</g>` +
    onLeft(8, `<circle class="tuft" cx="0" cy="22" r="2.2"/><path class="seam" d="M-14 22 Q 0 26 14 22"/>`),
  mirror: t => shadow(30, 9, 6, 2) +
    onLeft(6, `<path class="rim-${t}" d="M-22 0V44A22 22 0 0 0 22 44V0Z"/>`) +
    onLeft(2, `<path class="frame-${t}" d="M-22 0V44A22 22 0 0 0 22 44V0Z"/><path class="mirror-glass" d="M-17 4V44A17 17 0 0 0 17 44V4Z" fill="url(#g-glass)"/>` +
      `<path class="shine a-shine" d="M-10 10L4 60" /><path class="shine thin a-shine" d="M-3 8L9 48"/>`),
  plant: t => shadow(30, 10) +
    `<g class="a-sway">` +
    `<path class="leaf" d="M0 -40 C -26 -54 -30 -78 -20 -92 C -10 -74 -4 -58 0 -40Z"/>` +
    `<path class="leaf l2" d="M0 -40 C 22 -52 32 -74 26 -88 C 12 -74 4 -58 0 -40Z"/>` +
    `<path class="leaf l3" d="M0 -40 C -6 -64 0 -92 8 -104 C 12 -84 8 -60 0 -40Z"/>` +
    `<path class="leaf l2" d="M0 -40 C -18 -44 -36 -52 -40 -62 C -24 -62 -10 -54 0 -40Z"/></g>` +
    box(-17, -17, 0, 34, 34, 34, t),
  bowl: t => shadow(36, 12) + lathe([[0, 12], [3, 18], [10, 25], [18, 29], [20, 29.5]], t, {open: true}) +
    `<circle class="fruit" cx="-8" cy="-22" r="7"/><circle class="fruit f2" cx="7" cy="-21" r="6"/>`,
  sculpture: t => shadow(28, 9) + box(-16, -16, 0, 32, 32, 14, alt(t)) +
    `<g class="a-float">` + onLeft(-2, `<path class="iso-mark-back" transform="translate(-22 18) scale(.36 -.36) translate(0 -110)" d="M22 8H98Q119 8 108 27L73 86Q60 108 47 86L12 27Q1 8 22 8Z M76 42A16 16 0 1 0 44 42A16 16 0 1 0 76 42Z"/>`) +
    onLeft(-6, `<path class="iso-mark mark-${t}" fill-rule="evenodd" transform="translate(-22 18) scale(.36 -.36) translate(0 -110)" d="M22 8H98Q119 8 108 27L73 86Q60 108 47 86L12 27Q1 8 22 8Z M76 42A16 16 0 1 0 44 42A16 16 0 1 0 76 42Z"/>`) + `</g>`,
  shelf: t => shadow(40, 8, 0, -4) + box(-34, -10, 18, 68, 18, 5, t) +
    box(-28, -6, 23, 6, 12, 26, 's') + box(-21, -6, 23, 5, 12, 22, 'c') + box(-15, -6, 23, 7, 12, 28, 'm') +
    `<g transform="translate(${P(18, 0, 23)})">${lathe([[0, 5], [6, 7], [14, 4], [18, 3]], alt(t))}</g>`,
  diffuser: t => shadow(22, 8) +
    `<g class="a-sticks"><line class="stick" x1="0" y1="-32" x2="-14" y2="-84"/><line class="stick" x1="0" y1="-32" x2="4" y2="-90"/><line class="stick" x1="0" y1="-32" x2="16" y2="-80"/><line class="stick" x1="0" y1="-32" x2="-4" y2="-76"/></g>` +
    lathe([[0, 13], [3, 15], [22, 15], [28, 9], [32, 5], [38, 5]], t) +
    `<path class="mist a-mist" d="M4 -92 q 6 -8 0 -14 q -6 -8 2 -14"/>`,
  tray: t => shadow(42, 12) + box(-30, -22, 0, 60, 44, 6, t) +
    poly([[-26, -18, 6], [26, -18, 6], [26, 18, 6], [-26, 18, 6]], 'inner') +
    `<g transform="translate(${P(-8, 0, 6)})">${lathe([[0, 6], [10, 7], [12, 7.5]], alt(t), {open: true})}</g>` +
    `<g transform="translate(${P(12, 4, 6)})">${lathe([[0, 4], [3, 4.5], [14, 4.5], [18, 2], [20, 1.4]], 'c')}</g>`,
  pillar: t => shadow(22, 8) + `<ellipse class="glow a-glow" cx="0" cy="-104" rx="30" ry="18" fill="url(#g-glow)"/>` +
    lathe([[0, 12], [3, 12], [5, 4], [86, 4], [90, 9], [96, 9]], t) +
    `<ellipse class="bulb a-glow" cx="0" cy="-96" rx="10" ry="5"/>`,
  crate: () => shadow(34, 11) +
    `<g class="ghost">${box(-22, -22, 0, 44, 44, 34, 'm')}</g>` +
    `<g class="a-float">${box(-12, -12, 44, 24, 24, 24, 's')}</g>` +
    onLeft(22, `<path class="plus" d="M0 10v14M-7 17h14"/>`)
};

export function artSVG(kind, tone = 'm', {cls = ''} = {}) {
  const draw = DRAW[kind] || DRAW.vase;
  return `<svg class="art art-${kind} ${cls}" viewBox="-64 -112 128 124" aria-hidden="true" focusable="false">${defs()}<g class="art-scene">${draw(tone)}</g></svg>`;
}
