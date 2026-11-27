// Producto destacado de la portada: lámpara 3D mate que levita y se desarma como un esquema de piezas.
// Ciclo automático: armada y levitando → se separa en piezas con sus nombres → se vuelve a armar.
// El botón "Ver piezas" fija la vista desarmada. Con movimiento reducido queda quieta y armada.
import * as THREE from 'three';

const clamp01 = k => Math.min(Math.max(k, 0), 1);
const smooth = k => { k = clamp01(k); return k * k * (3 - 2 * k); };

// Partes de abajo hacia arriba. y: posición armada; dy: cuánto se separa; side: lado de la etiqueta;
// anchor: punto (local) al que apunta la línea del esquema.
function buildLamp() {
  const matte = (color, extra = {}) => new THREE.MeshStandardMaterial({color, roughness: .92, metalness: 0, ...extra});
  const M = {
    pearl: matte(0xf1ede4), inner: matte(0xe6dfd1, {side: THREE.BackSide}), dark: matte(0x1b2233),
    stem: matte(0xb9b4a8), ember: matte(0xd2461a, {emissive: 0x5a1405, emissiveIntensity: .35}),
    bulb: new THREE.MeshStandardMaterial({color: 0xfff1de, emissive: 0xffc58a, emissiveIntensity: 1.4, roughness: .6}),
    glow: new THREE.MeshBasicMaterial({color: 0xffc08a, transparent: true, opacity: .55, depthWrite: false})
  };
  const parts = [];
  const add = (name, y, dy, side, anchor, ...meshes) => {
    const g = new THREE.Group(); meshes.forEach(m => g.add(m)); g.userData = {y, dy, side, anchor: new THREE.Vector3(...anchor), name};
    g.position.y = y; parts.push(g); return g;
  };
  const mesh = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; return m; };

  // Base pesada con aro naranja brasa.
  add('base', 0, -.55, 'right', [1.02, .16, 0],
    mesh(new THREE.CylinderGeometry(1.0, 1.12, .28, 72), M.dark, .14),
    mesh(new THREE.TorusGeometry(.98, .035, 12, 96), M.ember, .285).rotateX(Math.PI / 2));
  // Varilla.
  add('stem', .28, 0, 'left', [-.05, 1.0, 0], mesh(new THREE.CylinderGeometry(.055, .055, 2.0, 24), M.stem, 1.0));
  // Rótula.
  add('joint', 2.28, .38, 'right', [.12, 0, 0], mesh(new THREE.SphereGeometry(.12, 32, 16), M.dark),
    mesh(new THREE.CylinderGeometry(.16, .16, .08, 32), M.dark, .1));
  // Bombillo.
  add('bulb', 2.55, .82, 'left', [-.3, 0, 0], mesh(new THREE.SphereGeometry(.3, 40, 24), M.bulb),
    mesh(new THREE.CylinderGeometry(.11, .11, .18, 24), M.stem, -.32));
  // Pantalla en cúpula (torno), con difusor cálido en el borde.
  const prof = [];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(a) * 1.38 + .02, Math.sin(a) * .98)); }
  prof.reverse();
  const dome = new THREE.LatheGeometry(prof, 96);
  add('shade', 2.32, 1.42, 'right', [1.05, .5, 0],
    mesh(dome, M.pearl), mesh(dome, M.inner),
    mesh(new THREE.TorusGeometry(1.39, .045, 12, 120), M.pearl).rotateX(Math.PI / 2),
    mesh(new THREE.CircleGeometry(1.3, 64), M.glow, .01).rotateX(Math.PI / 2));
  return {parts, M};
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
  const warm = new THREE.PointLight(0xffb070, 3, 6, 1.6); scene.add(warm);

  const lamp = new THREE.Group(); scene.add(lamp);
  const {parts, M} = buildLamp(); parts.forEach(p => lamp.add(p));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({map: shadowTexture(), transparent: true, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2; scene.add(shadow);

  const svg = stage.querySelector('.lamp-callouts');
  const order = ['shade', 'bulb', 'joint', 'stem', 'base'];
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

    // Levitación (más suave cuando está desarmada).
    const float = reduce.matches ? .2 : .2 + Math.sin(t * 1.7) * .11 * (1 - e * .6);
    parts.forEach(p => { p.position.y = p.userData.y + p.userData.dy * e; });
    lamp.position.y = float;
    S.yaw += (S.yawT - S.yaw) * Math.min(1, dt * 4);
    lamp.rotation.y = (reduce.matches ? 0 : Math.sin(t * .42) * .35) + S.yaw - .25 * e;
    lamp.rotation.z = reduce.matches ? 0 : Math.sin(t * 1.1) * .02;
    const shadeY = lamp.position.y + parts[4].position.y + .2;
    warm.position.set(0, shadeY, .2); warm.intensity = 2.4 + Math.sin(t * 2.3) * .25;
    shadow.position.y = -.62; const sc = 1.05 - (float - .2) * .9 + e * .05; shadow.scale.set(sc, sc, 1);
    shadow.material.opacity = .9 - (float - .2) * 1.4;

    // Cámara: se aleja un poco al desarmar para que entren todas las piezas.
    const span = 3.95 + e * (camera.aspect < 1 ? 3.2 : 2.1), mid = 1.78 + e * .4;
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
