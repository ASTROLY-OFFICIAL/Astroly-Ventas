// Intro de la portada: el isotipo de Astroly en 3D (cerámica pizarra mate, como en la landing)
// sube, da una vuelta y se asienta de frente; luego se disuelve y la mascota se arma píxel a píxel.
import * as THREE from 'three';
import {RoomEnvironment} from '../vendor/RoomEnvironment.js';

const ease = k => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 3);
const settle = k => { k = Math.min(Math.max(k, 0), 1); return 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2); };

function logoShape() {
  // Mismo trazado que assets/img/isotipo.svg (viewBox 120×110), con el eje Y invertido.
  const f = (x, y) => [x - 60, 55 - y];
  const s = new THREE.Shape();
  s.moveTo(...f(22, 8)); s.lineTo(...f(98, 8)); s.quadraticCurveTo(...f(119, 8), ...f(108, 27));
  s.lineTo(...f(73, 86)); s.quadraticCurveTo(...f(60, 108), ...f(47, 86)); s.lineTo(...f(12, 27));
  s.quadraticCurveTo(...f(1, 8), ...f(22, 8));
  const hole = new THREE.Path(); hole.absarc(...f(60, 42), 16, 0, Math.PI * 2, true); s.holes.push(hole);
  return s;
}

export function playIntro(holder, {onSettle, widthRatio = .39} = {}) {
  const canvas = document.createElement('canvas'); canvas.className = 'hero-3d'; holder.append(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true}); }
  catch { canvas.remove(); onSettle?.(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 2000); camera.position.set(0, 0, 420);
  const geo = new THREE.ExtrudeGeometry(logoShape(), {depth: 16, bevelEnabled: true, bevelThickness: 5, bevelSize: 4, bevelSegments: 6, curveSegments: 48});
  geo.center();
  const mat = new THREE.MeshPhysicalMaterial({color: 0x121315, metalness: .12, roughness: .38, clearcoat: .7, clearcoatRoughness: .2, envMapIntensity: 1.1});
  const mesh = new THREE.Mesh(geo, mat); scene.add(mesh);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-200, 260, 300); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, .25));

  function size() {
    const w = holder.clientWidth, h = holder.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // El logo ocupa el mismo ancho que el cuerpo de la mascota (39 % del sprite).
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, vw = vh * camera.aspect;
    mesh.userData.scale = (vw * widthRatio) / 107;
  }
  size(); addEventListener('resize', size);

  const t0 = performance.now(); let done = false;
  function frame(now) {
    if (done) return;
    const t = (now - t0) / 1000;
    const rise = settle(t / 1.3), turn = ease((t - .1) / 1.6);
    const s = mesh.userData.scale;
    mesh.scale.setScalar(s * (.55 + .45 * rise));
    mesh.position.y = (1 - rise) * -120;
    mesh.rotation.y = (1 - turn) * Math.PI * -2;
    mesh.rotation.x = (1 - turn) * .5;
    renderer.render(scene, camera);
    if (t > 2.0 && !holder.classList.contains('is-dissolving')) { holder.classList.add('is-dissolving'); onSettle?.(); }
    if (t > 2.6) { done = true; removeEventListener('resize', size); renderer.dispose(); geo.dispose(); mat.dispose(); pmrem.dispose(); canvas.remove(); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
