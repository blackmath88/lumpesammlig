import * as THREE from 'three';

/**
 * The collecting table: every sample rests as a physical specimen on one long
 * table. Scroll walks the camera along it; hover lifts a specimen into the light.
 * Specimens show a still poster of their live preview; the live study opens on click.
 */

export type TableItem = {
  id: string;
  number: string;
  title: string;
  object: string;
  href: string;
  poster: string;
};

type Form = 'cloth' | 'paper' | 'board' | 'card' | 'ream' | 'screen';

// How each source rests on a table. Chosen from the encounter, not from the look.
const FORMS: Record<string, Form> = {
  'waschlumpe': 'cloth',
  'soft-green-macrame': 'cloth',
  'blue-coil-basket': 'board',
  'flaked-blue-painted-wood': 'board',
  'blue-printed-paper': 'paper',
  'wordart': 'screen',
  'stitched-care': 'cloth',
  'pixels-to-stitches': 'cloth',
  'thread-icons': 'cloth',
  'impossible-index': 'card',
  'switchboard': 'card',
  // 014 is researched, not visited: its surfaces are paper and ink on purpose, so it rests as a ream.
  'made-heavy': 'ream'
};

const THICKNESS: Record<Form, number> = { cloth: 0.02, paper: 0.006, board: 0.09, card: 0.03, ream: 0.16, screen: 0.05 };
const EDGE: Record<Form, number> = { cloth: 0xd9d4c8, paper: 0xe8e2d4, board: 0x8a7255, card: 0xf3f0e7, ream: 0xf1ece2, screen: 0x2a2c30 };

// Deterministic jitter so the arrangement is hand-placed but stable between visits.
function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function clothGeometry(w: number, h: number, seed: number) {
  const g = new THREE.PlaneGeometry(w, h, 48, 36);
  const r = rand(seed);
  const a = r() * 6, b = r() * 6, c = r() * 6;
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const edge = Math.max(Math.abs(x) / (w / 2), Math.abs(y) / (h / 2));
    // gentle folds, a little more lift towards the edges like cloth that was set down
    const z = 0.035 * Math.sin(x * 2.1 + a) * Math.cos(y * 1.7 + b)
            + 0.02 * Math.sin((x + y) * 3.3 + c)
            + 0.05 * Math.pow(edge, 3) * Math.sin(x * 1.3 + y * 0.9 + a);
    pos.setZ(i, Math.max(0.006, z + 0.05));
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  return g;
}

export function initTable(root: HTMLElement, items: TableItem[]) {
  const canvas = root.querySelector('canvas') as HTMLCanvasElement;
  const caption = root.querySelector('[data-caption]') as HTMLElement;
  const strip = root.querySelectorAll<HTMLAnchorElement>('[data-goto]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const bg = new THREE.Color(0xe9e4da);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 9, 22);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  // Light: a high window on the left, a soft room fill.
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xa89f8e, 0.75));
  const sun = new THREE.DirectionalLight(0xfff3df, 3.1);
  sun.position.set(-4, 9, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0004;
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -8; sc.right = 8; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 30;
  scene.add(sun, sun.target);

  // The table: warm linen-coloured top with a faint grain.
  const grain = document.createElement('canvas');
  grain.width = grain.height = 256;
  const gx = grain.getContext('2d')!;
  gx.fillStyle = '#e4ded2'; gx.fillRect(0, 0, 256, 256);
  const gr = rand(7);
  for (let i = 0; i < 2600; i++) {
    gx.fillStyle = `rgba(${120 + gr() * 40},${105 + gr() * 30},${80 + gr() * 30},${0.04 + gr() * 0.05})`;
    gx.fillRect(gr() * 256, gr() * 256, 1 + gr() * 22, 1);
  }
  const grainTex = new THREE.CanvasTexture(grain);
  grainTex.wrapS = grainTex.wrapT = THREE.RepeatWrapping;
  grainTex.repeat.set(10, 4);
  grainTex.colorSpace = THREE.SRGBColorSpace;
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 30),
    new THREE.MeshStandardMaterial({ map: grainTex, roughness: 0.92 })
  );
  table.rotation.x = -Math.PI / 2;
  table.receiveShadow = true;
  scene.add(table);

  // Specimens, laid along the table in a loose double row.
  const loader = new THREE.TextureLoader();
  const r = rand(42);
  const spacing = 2.15;
  const meshes: THREE.Mesh[] = [];
  const contacts: THREE.Mesh[] = [];
  const blob = document.createElement('canvas');
  blob.width = blob.height = 128;
  const bx = blob.getContext('2d')!;
  const grad = bx.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(38,30,18,.62)'); grad.addColorStop(.55, 'rgba(38,30,18,.34)'); grad.addColorStop(1, 'rgba(38,30,18,0)');
  bx.fillStyle = grad; bx.fillRect(0, 0, 128, 128);
  const blobTex = new THREE.CanvasTexture(blob);
  const homes: { pos: THREE.Vector3; rot: number }[] = [];

  items.forEach((item, i) => {
    const form = FORMS[item.id] ?? 'paper';
    const w = form === 'ream' ? 1.7 : form === 'card' ? 1.75 : 2.0;
    const h = w * 0.75;
    const tex = loader.load(item.poster);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const face = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: form === 'screen' ? 0.35 : form === 'paper' || form === 'card' ? 0.85 : 0.95,
      metalness: 0
    });

    let mesh: THREE.Mesh;
    if (form === 'cloth') {
      mesh = new THREE.Mesh(clothGeometry(w, h, i * 97 + 3), face);
    } else {
      const t = THICKNESS[form];
      const side = new THREE.MeshStandardMaterial({ color: EDGE[form], roughness: 0.9 });
      // BoxGeometry material order: +x, -x, +y (top), -y, +z, -z
      const geo = new THREE.BoxGeometry(w, t, h);
      mesh = new THREE.Mesh(geo, [side, side, face, side, side, side]);
      mesh.position.y = t / 2;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Soft contact shadow, so a specimen rests on the table even where shadow maps are weak.
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.32, h * 1.42),
      new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, toneMapped: false, fog: false }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.002;
    contacts.push(contact);
    scene.add(contact);

    const row = i % 2 === 0 ? -0.95 : 0.95;
    const x = i * spacing * 0.92 + (r() - 0.5) * 0.35;
    const z = row + (r() - 0.5) * 0.3;
    const rot = (r() - 0.5) * 0.22;
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = rot;
    contacts[i].position.set(x + 0.1, 0.004, z - 0.08);
    contacts[i].rotation.z = rot;
    mesh.userData = { index: i, baseY: mesh.position.y, lift: 0 };
    homes.push({ pos: mesh.position.clone(), rot });
    meshes.push(mesh);
    scene.add(mesh);
  });

  const firstX = homes[0]?.pos.x ?? 0;
  const lastX = homes[homes.length - 1]?.pos.x ?? 0;

  // Camera walks the table with scroll progress through the sticky section.
  let progress = 0;
  let camX = firstX;
  let focusIndex = -1;
  let hoverIndex = -1;
  let touchIndex = -1;
  let pointerStart = { x: 0, y: 0, type: '' };

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Narrow screens need a little more distance to show a whole specimen.
    camera.fov = w < 700 ? 42 : 30;
    camera.updateProjectionMatrix();
  }

  function readScroll() {
    const rect = root.getBoundingClientRect();
    const run = root.offsetHeight - innerHeight;
    progress = run > 0 ? Math.min(1, Math.max(0, -rect.top / run)) : 0;
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(2, 2);

  function setActive(i: number) {
    if (i === hoverIndex) return;
    hoverIndex = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : '';
    strip.forEach((a, k) => a.toggleAttribute('data-active', k === i));
    if (i >= 0) {
      const it = items[i];
      caption.innerHTML = `<span>${it.number}</span><strong>${it.title}</strong><p>${it.object}</p><em>enter study ↗</em>`;
      caption.dataset.show = '';
    } else {
      delete caption.dataset.show;
    }
  }

  function locatePointer(e: MouseEvent) {
    const b = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
  }

  canvas.addEventListener('pointerdown', (e) => {
    pointerStart = { x: e.clientX, y: e.clientY, type: e.pointerType };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    touchIndex = -1;
    locatePointer(e);
  });
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') ndc.set(2, 2); });
  canvas.addEventListener('click', (e) => {
    // Hit-test the tap itself; touch browsers need not send a hover frame first.
    if (Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 12) return;
    locatePointer(e);
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    const index = hit ? hit.object.userData.index as number : -1;
    const isTouch = ((e as PointerEvent).pointerType || pointerStart.type) === 'touch';
    if (index < 0) { touchIndex = -1; ndc.set(2, 2); setActive(-1); return; }
    if (isTouch && touchIndex !== index) {
      touchIndex = index;
      ndc.set(2, 2);
      setActive(index);
      return;
    }
    location.href = items[index].href;
  });
  caption.addEventListener('click', () => { if (hoverIndex >= 0) location.href = items[hoverIndex].href; });

  strip.forEach((a, k) => {
    a.addEventListener('focus', () => { focusIndex = k; touchIndex = -1; });
    a.addEventListener('mouseenter', () => { focusIndex = k; });
    a.addEventListener('blur', () => { focusIndex = -1; });
    a.addEventListener('mouseleave', () => { focusIndex = -1; });
  });

  let running = false;
  let raf = 0;
  const clock = new THREE.Clock();

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    readScroll();

    const targetX = focusIndex >= 0 ? homes[focusIndex].pos.x : firstX + (lastX - firstX) * progress;
    const k = reduced ? 1 : 1 - Math.pow(0.0025, dt);
    camX += (targetX - camX) * k;
    const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.08;
    camera.position.set(camX - 1.0 + sway, 6.3, 5.6);
    camera.lookAt(camX + 0.3, 0, 0.1);
    sun.position.set(camX - 4, 9, 5);
    sun.target.position.set(camX, 0, 0);

    // hover from pointer, or the focused index from the keyboard strip
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    const hovered = focusIndex >= 0 ? focusIndex : touchIndex >= 0 ? touchIndex : hit ? (hit.object.userData.index as number) : -1;
    setActive(hovered);

    meshes.forEach((m, i) => {
      const target = i === hovered ? 1 : 0;
      const ud = m.userData;
      ud.lift += (target - ud.lift) * (reduced ? 1 : 1 - Math.pow(0.001, dt));
      m.position.y = ud.baseY + ud.lift * 0.42;
      m.rotation.y = homes[i].rot * (1 - ud.lift * 0.8);
      m.rotation.x = ud.lift * 0.32;
      const s = 1 + ud.lift * 0.06;
      m.scale.set(s, s, s);
      const c = contacts[i];
      c.scale.setScalar(1 + ud.lift * 0.3);
      (c.material as THREE.MeshBasicMaterial).opacity = 1 - ud.lift * 0.45;
    });

    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; clock.getDelta(); frame(); }
    else if (!entry.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }, { rootMargin: '100px' });
  io.observe(root);

  resize();
  addEventListener('resize', resize);
  root.dataset.ready = '';
}
