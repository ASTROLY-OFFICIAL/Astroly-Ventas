// Producto destacado de la portada: lámpara luna 3D que levita, gira y se desarma como un esquema de piezas.
// Ciclo automático: armada y levitando → se separa en piezas con sus nombres → se vuelve a armar.
// El botón "Ver piezas" fija la vista desarmada. Con movimiento reducido queda quieta y armada.
import * as THREE from 'three';

const clamp01 = k => Math.min(Math.max(k, 0), 1);
const smooth = k => { k = clamp01(k); return k * k * (3 - 2 * k); };

// Lámpara luna levitante: esfera con relieve lunar (texturas procedurales en assets/img/luna-*.jpg),
// luz LED cálida dentro, imán de levitación y base de madera con bobina. Partes de abajo hacia arriba.
// y: posición armada; dy: cuánto se separa; side: lado de la etiqueta; anchor: punto (local) del esquema;
// spin: gira como las lámparas luna reales.
const R = 1.25, MOON_Y = 2.12;
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#8a5a36'; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 70; i++) {
    const y = Math.random() * 128, a = Math.random() * 6 + 2, w = Math.random() * 1.6 + .4;
    g.strokeStyle = `rgba(${Math.random() < .5 ? '60,34,18' : '170,118,74'},${.15 + Math.random() * .3})`; g.lineWidth = w;
    g.beginPath(); for (let x = 0; x <= 512; x += 8) g.lineTo(x, y + Math.sin(x / 40 + i) * a); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
function buildLamp() {
  const load = (url, srgb) => { const t = new THREE.TextureLoader().load(url); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const map = load('assets/img/luna-color.jpg', true), bump = load('assets/img/luna-relieve.jpg'), glowMap = load('assets/img/luna-brillo.jpg');
  const matte = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .9, metalness: 0, ...extra});
  const M = {
    moon: new THREE.MeshStandardMaterial({map, bumpMap: bump, bumpScale: 3.2, roughness: .96, metalness: 0, emissive: 0xffdcae, emissiveMap: glowMap, emissiveIntensity: .32}),
    shell: matte(0xfff0d8, {side: THREE.BackSide, emissive: 0xffb877, emissiveIntensity: .9}),
    cut: matte(0xf3e6cc, {emissive: 0xffc58a, emissiveIntensity: .35, side: THREE.DoubleSide}),
    wood: matte(0xffffff, {map: woodTexture(), roughness: .78}), woodTop: matte(0x7d5131, {roughness: .8}),
    dark: matte(0x1d2026, {roughness: .55, metalness: .35}), ember: matte(0xd2461a, {emissive: 0xff5a1f, emissiveIntensity: 1.2}),
    led: new THREE.MeshStandardMaterial({color: 0xfff4e2, emissive: 0xffd39a, emissiveIntensity: 2.2, roughness: .5}),
    chip: matte(0xf6c35b, {emissive: 0xffc070, emissiveIntensity: 1.5})
  };
  const parts = [];
  const add = (name, y, dy, side, anchor, spin, ...meshes) => {
    const g = new THREE.Group(); meshes.forEach(m => g.add(m)); g.userData = {y, dy, side, anchor: new THREE.Vector3(...anchor), name, spin};
    g.position.y = y; parts.push(g); return g;
  };
  const mesh = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; return m; };
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const hemi = top => {
    const geo = new THREE.SphereGeometry(R, 128, 48, 0, Math.PI * 2, top ? 0 : Math.PI / 2, Math.PI / 2);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, top ? .5 + .5 * uv.getY(i) : .5 * uv.getY(i));
    const inner = new THREE.SphereGeometry(R * .93, 64, 24, 0, Math.PI * 2, top ? 0 : Math.PI / 2, Math.PI / 2);
    const ring = new THREE.RingGeometry(R * .93, R, 128); ring.rotateX(top ? Math.PI / 2 : -Math.PI / 2);
    return [mesh(geo, M.moon), mesh(inner, M.shell), mesh(ring, M.cut)];
  };

  // Base de madera con bobina y botón táctil naranja brasa.
  add('base', 0, -.7, 'right', [1.2, .16, 0], false,
    mesh(new THREE.CylinderGeometry(1.25, 1.32, .34, 96), [M.wood, M.woodTop, M.woodTop], .17),
    mesh(new THREE.CylinderGeometry(.5, .5, .02, 64), M.dark, .345),
    mesh(new THREE.TorusGeometry(.5, .018, 8, 64), M.ember, .35).rotateX(Math.PI / 2),
    at(mesh(new THREE.CircleGeometry(.05, 24), M.ember), 0, .2, 1.305));
  // Imán de levitación (dentro del polo inferior).
  add('magnet', MOON_Y - R * .86, -.62, 'left', [-.34, 0, 0], true,
    mesh(new THREE.CylinderGeometry(.34, .34, .12, 48), M.dark), mesh(new THREE.CylinderGeometry(.18, .18, .13, 32), M.chip));
  // Media esfera inferior.
  add('bottom', MOON_Y, 0, 'right', [R * .98, -.25, 0], true, ...hemi(false));
  // Luz LED cálida (placa con chips).
  const led = add('led', MOON_Y, .62, 'left', [-.42, 0, 0], true,
    mesh(new THREE.CylinderGeometry(.42, .42, .09, 48), M.led),
    ...[0, 1, 2, 3, 4, 5].map(i => at(mesh(new THREE.BoxGeometry(.09, .03, .09), M.chip), Math.cos(i) * .26, .045, Math.sin(i) * .26)));
  // Media esfera superior.
  add('top', MOON_Y, 1.38, 'right', [R * .9, .45, 0], true, ...hemi(true));
  return {parts, M, led};
}

function haloTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 18, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,200,140,.55)'); r.addColorStop(.45, 'rgba(255,170,100,.16)'); r.addColorStop(1, 'rgba(255,160,90,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  r.addColorStop(0, 'rgba(2,8,22,.55)'); r.addColorStop(1, 'rgba(2,8,22,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function mountLamp(stage, {labels = [], button, onExplode} = {}) {
  const canvas = document.createElement('canvas'); canvas.className = 'lamp-canvas'; stage.prepend(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true}); }
  catch { canvas.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xe8eeff, 0x0f2d5e, 1.25));
  const key = new THREE.DirectionalLight(0xfff6ea, 2.2); key.position.set(-4, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8ff, 1.1); rim.position.set(5, 3, -4); scene.add(rim);
  const warm = new THREE.PointLight(0xffb070, 3, 7, 1.4); scene.add(warm);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: haloTexture(), color: 0xffc58a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}));
  halo.scale.setScalar(5.2); scene.add(halo);

  const lamp = new THREE.Group(); scene.add(lamp);
  const {parts, M} = buildLamp(); parts.forEach(p => lamp.add(p));
  parts.sort((a, b) => a.userData.y + a.userData.dy - (b.userData.y + b.userData.dy)); // de abajo hacia arriba ya explotado
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({map: shadowTexture(), transparent: true, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

  const svg = stage.querySelector('.lamp-callouts');
  const order = ['top', 'led', 'bottom', 'magnet', 'base'];
  const NS = 'http://www.w3.org/2000/svg';
  const marks = order.map((name, i) => {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'callout');
    const full = labels[i] || name;
    g.innerHTML = `<polyline/><circle r="3.5"/><text><tspan class="n">0${i + 1}</tspan> <tspan class="full">${full}</tspan><tspan class="short">${full.split(' ')[0]}</tspan></text>`;
    svg.append(g); return {name, g, line: g.querySelector('polyline'), dot: g.querySelector('circle'), text: g.querySelector('text')};
  });

  let W = 1, H = 1;
  function size() {
    W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  }
  new ResizeObserver(size).observe(stage); size();

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const S = {explode: 0, manual: false, t0: performance.now(), visible: true, yaw: 0, yawT: 0};
  stage.closest('[data-feature]')?.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(); S.yawT = ((e.clientX - r.left) / r.width - .5) * .7;
  });
  stage.closest('[data-feature]')?.addEventListener('pointerleave', () => { S.yawT = 0; });
  button?.addEventListener('click', () => {
    S.manual = !S.manual; button.setAttribute('aria-pressed', S.manual);
    button.textContent = S.manual ? 'Armar' : 'Ver piezas';
    if (!S.manual) S.t0 = performance.now() - 6200; // vuelve al ciclo justo cuando se arma
    onExplode?.(S.manual);
  });
  new IntersectionObserver(([e]) => { S.visible = e.isIntersecting; if (S.visible) requestAnimationFrame(frame); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });

  const v = new THREE.Vector3(); const CYCLE = 11;
  let last = 0, wasOpen = false;
  function frame(now) {
    if (!S.visible || document.hidden) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    const t = (now - S.t0) / 1000, c = t % CYCLE;
    // Ciclo: 0–4.6 s armada · 4.6–5.8 se separa · 5.8–9.4 esquema · 9.4–10.6 se arma.
    const auto = reduce.matches ? 0 : c < 4.6 ? 0 : c < 5.8 ? smooth((c - 4.6) / 1.2) : c < 9.4 ? 1 : c < 10.6 ? 1 - smooth((c - 9.4) / 1.2) : 0;
    const target = S.manual ? 1 : auto;
    S.explode += (target - S.explode) * (reduce.matches ? 1 : Math.min(1, dt * (S.manual ? 6 : 14)));
    const e = S.explode;
    if ((e > .5) !== wasOpen) { wasOpen = e > .5; if (!S.manual) onExplode?.(wasOpen); }

    // Levitación: la luna flota y gira sobre la base; la base queda quieta.
    const float = reduce.matches ? 0 : Math.sin(t * 1.5) * .09 * (1 - e * .6);
    const spin = reduce.matches ? .6 : t * .3;
    parts.forEach(p => {
      p.position.y = p.userData.y + p.userData.dy * e + (p.userData.spin ? float : 0);
      if (p.userData.spin) p.rotation.y = spin;
    });
    S.yaw += (S.yawT - S.yaw) * Math.min(1, dt * 4);
    lamp.rotation.y = S.yaw - .2 * e;
    const ledY = parts[3].position.y;
    warm.position.set(0, ledY + .1, 0); warm.intensity = (2.2 + Math.sin(t * 2.1) * .2) * (1 + e * .4);
    const glow = .32 + Math.sin(t * 2.1) * .035;
    M.moon.emissiveIntensity = glow;
    halo.position.set(0, MOON_Y + float, -.6); halo.material.opacity = .85 - e * .35;
    shadow.position.y = .005; shadow.scale.set(1.05, 1.05, 1); shadow.material.opacity = .8;

    // Cámara: se aleja un poco al desarmar para que entren todas las piezas.
    const span = 4.0 + e * (camera.aspect < 1 ? 3.0 : 2.0), mid = 1.72 + e * .35;
    const dist = (span / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.max(1, .82 / camera.aspect) + .6;
    camera.position.set(0, mid + 1.1, dist); camera.lookAt(0, mid, 0);
    renderer.render(scene, camera);

    // Esquema: líneas desde cada pieza hasta su etiqueta al costado.
    svg.style.opacity = clamp01((e - .55) / .35);
    if (e > .5) {
      lamp.updateMatrixWorld();
      const used = {left: [], right: []};
      marks.forEach(m => {
        const p = parts.find(x => x.userData.name === m.name);
        v.copy(p.userData.anchor).applyMatrix4(p.matrixWorld).project(camera);
        const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H, side = p.userData.side;
        let ly = y; used[side].forEach(u => { if (Math.abs(u - ly) < 26) ly = u + 26; }); used[side].push(ly);
        const lx = side === 'right' ? W - 12 : 12, ex = side === 'right' ? Math.max(x + 24, W * .72) : Math.min(x - 24, W * .28);
        m.line.setAttribute('points', `${x},${y} ${ex},${ly} ${lx},${ly}`);
        m.dot.setAttribute('cx', x); m.dot.setAttribute('cy', y);
        m.text.setAttribute('x', lx); m.text.setAttribute('y', ly - 6);
        m.text.setAttribute('text-anchor', side === 'right' ? 'end' : 'start');
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {canvas};
}
