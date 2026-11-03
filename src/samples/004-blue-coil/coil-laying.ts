import * as THREE from 'three';

/**
 * 004 / laid coil. One continuous fibre bundle spirals out from a raised centre.
 * Progress lays coil: the visible length of the path is the state. Short wraps
 * bind it as it goes; some runs of wraps are indigo. Pointer moves only the light,
 * as in the rest of this sample.
 */
export function initCoilLaying(root: HTMLElement) {
  const canvas = root.querySelector('canvas') as HTMLCanvasElement;
  const range = root.querySelector('input[type="range"]') as HTMLInputElement;
  const out = root.querySelector('[data-laid]') as HTMLElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd6bd95);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 20, 12.5);
  camera.lookAt(0, 0, 0.4);

  scene.add(new THREE.HemisphereLight(0xfff4e2, 0x7a6448, 0.7));
  const light = new THREE.DirectionalLight(0xfff1dc, 3.2);
  light.position.set(-6, 10, 4);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  const lc = light.shadow.camera as THREE.OrthographicCamera;
  lc.left = -9; lc.right = 9; lc.top = 9; lc.bottom = -9;
  scene.add(light);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: 0xd6bd95, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // The path: an outward spiral that drifts a little by hand and rises at its beginning.
  const turns = 9;
  const pitch = 0.62;
  const tubeR = pitch * 0.47;
  const pts: THREE.Vector3[] = [];
  const steps = turns * 90;
  for (let i = 0; i <= steps; i++) {
    const a = (i / 90) * Math.PI * 2;
    const drift = 0.06 * Math.sin(a * 0.5 + 1.3) + 0.04 * Math.sin(a * 1.7);
    const r = 0.35 + pitch * (a / (Math.PI * 2)) + drift;
    const lift = 0.55 * Math.exp(-(r * r) / 1.6);
    pts.push(new THREE.Vector3(Math.cos(a) * r, tubeR + lift, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tubular = 1800, radial = 14;

  // Dry fibre: fine lines along the length of the bundle.
  const fc = document.createElement('canvas');
  fc.width = 512; fc.height = 64;
  const fx = fc.getContext('2d')!;
  fx.fillStyle = '#b8915c'; fx.fillRect(0, 0, 512, 64);
  for (let y = 0; y < 64; y++) {
    const v = Math.random();
    fx.fillStyle = `rgba(${v > .5 ? '238,206,150' : '96,70,40'},${0.08 + Math.random() * 0.18})`;
    fx.fillRect(0, y, 512, 1);
  }
  const fibre = new THREE.CanvasTexture(fc);
  fibre.wrapS = fibre.wrapT = THREE.RepeatWrapping;
  fibre.repeat.set(220, 1);
  fibre.colorSpace = THREE.SRGBColorSpace;

  const tubeGeo = new THREE.TubeGeometry(curve, tubular, tubeR, radial, false);
  const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ map: fibre, roughness: 0.93 }));
  tube.castShadow = tube.receiveShadow = true;
  scene.add(tube);

  // Bindings: short wraps across the bundle, ordered along the path.
  const wraps = 1500;
  const wrapGeo = new THREE.TorusGeometry(tubeR * 1.03, tubeR * 0.1, 5, 16);
  const wrapMat = new THREE.MeshStandardMaterial({ roughness: 0.85 });
  const binds = new THREE.InstancedMesh(wrapGeo, wrapMat, wraps);
  binds.castShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), z = new THREE.Vector3(0, 0, 1);
  const natural = new THREE.Color(0xc9a06a), indigo = new THREE.Color(0x243b58);
  const wrapT: number[] = [];
  for (let i = 0; i < wraps; i++) {
    const t = (i + 0.5) / wraps;
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    q.setFromUnitVectors(z, tan);
    m.compose(p, q, new THREE.Vector3(1, 1, 1));
    binds.setMatrixAt(i, m);
    // Indigo appears in runs on some circuits, then recedes.
    const circuit = Math.floor(t * turns);
    const run = Math.sin(t * 61) > 0.45 && circuit % 3 !== 1;
    binds.setColorAt(i, run ? indigo : natural);
    wrapT.push(t);
  }
  scene.add(binds);

  let target = Number(range.value) / 100;
  let laid = reduced ? target : 0;

  function apply() {
    const segs = Math.max(0, Math.floor(laid * tubular));
    tubeGeo.setDrawRange(0, segs * radial * 6);
    let n = 0;
    while (n < wraps && wrapT[n] <= laid) n++;
    binds.count = n;
    out.textContent = String(Math.round(laid * 100));
    range.setAttribute('aria-valuetext', `${Math.round(laid * 100)} % of the coil laid`);
  }

  range.addEventListener('input', () => {
    target = Number(range.value) / 100;
    if (reduced) { laid = target; apply(); draw(); }
    else wake();
  });

  const lightTarget = new THREE.Vector2(-6, 4);
  canvas.addEventListener('pointermove', (e) => {
    const b = canvas.getBoundingClientRect();
    lightTarget.set(((e.clientX - b.left) / b.width - 0.5) * 18, ((e.clientY - b.top) / b.height - 0.5) * 14);
    if (reduced) { light.position.set(lightTarget.x, 10, lightTarget.y); draw(); } else wake();
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 640 ? 38 : 30;
    camera.updateProjectionMatrix();
    draw();
  }

  function draw() { if (visible) renderer.render(scene, camera); }

  // Render on demand: animate only while laying or while the light is moving.
  let raf = 0, visible = false;
  function wake() { if (!raf && visible) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    laid += (target - laid) * 0.08;
    if (Math.abs(target - laid) < 0.0008) laid = target;
    light.position.x += (lightTarget.x - light.position.x) * 0.12;
    light.position.z += (lightTarget.y - light.position.z) * 0.12;
    apply(); draw();
    const moving = laid !== target || Math.abs(lightTarget.x - light.position.x) > 0.01 || Math.abs(lightTarget.y - light.position.z) > 0.01;
    if (moving) wake();
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
    else { cancelAnimationFrame(raf); raf = 0; }
  }).observe(root);
  addEventListener('resize', resize);
  apply();
  resize();
  root.dataset.ready = '';
}
