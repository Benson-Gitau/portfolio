import {
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';

/**
 * The 3D accent: loose ledger sheets squaring up into one reconciled stack.
 * Decorative only. Loaded after first paint, when in view, and paused off-screen.
 */
const SHEETS = 6;
const WIDTH = 3.2;
const DEPTH = 2.3;
const THICKNESS = 0.09;
const GAP = 0.16;

// Fixed, so the stack looks the same on every visit.
const LOOSE = [
  { x: -0.35, z: 0.22, r: -0.2 },
  { x: 0.3, z: -0.18, r: 0.16 },
  { x: -0.2, z: -0.26, r: -0.12 },
  { x: 0.38, z: 0.16, r: 0.22 },
  { x: -0.28, z: 0.2, r: 0.14 },
  { x: 0.24, z: -0.2, r: -0.18 },
];

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function drawPage(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = token('--surface');
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = token('--text-muted');
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  for (let i = 1; i <= 4; i++) {
    const y = (h / 5) * i;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, y);
    ctx.lineTo(w * 0.92, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = token('--teal-text');
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    const y = (h / 5) * (i + 0.5);
    ctx.beginPath();
    ctx.moveTo(w * 0.8, y + 2);
    ctx.lineTo(w * 0.825, y + 24);
    ctx.lineTo(w * 0.875, y - 22);
    ctx.stroke();
  }
}

export function mount(root: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  root.append(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 4 / 3, 0.1, 50);
  camera.position.set(0, 5.2, 7.6);
  camera.lookAt(0, 0.35, 0);
  scene.add(new HemisphereLight(0xffffff, 0x445566, 1.5));
  const sun = new DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 6, 4);
  scene.add(sun);

  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = 640;
  pageCanvas.height = 460;
  const pageTexture = new CanvasTexture(pageCanvas);
  pageTexture.colorSpace = SRGBColorSpace;

  const geometry = new BoxGeometry(WIDTH, THICKNESS, DEPTH);
  const edges = new EdgesGeometry(geometry);
  const side = new MeshStandardMaterial({ roughness: 0.85 });
  const top = new MeshStandardMaterial({ roughness: 0.85, map: pageTexture });
  const line = new LineBasicMaterial();

  const stack = new Group();
  const sheets = LOOSE.slice(0, SHEETS).map((_, i) => {
    const mesh = new Mesh(geometry, [side, side, top, side, side, side]);
    mesh.add(new LineSegments(edges, line));
    mesh.position.y = i * GAP;
    stack.add(mesh);
    return mesh;
  });
  scene.add(stack);

  const applyTheme = () => {
    side.color = new Color(token('--surface'));
    line.color = new Color(token('--line-strong'));
    drawPage(pageCanvas);
    pageTexture.needsUpdate = true;
  };
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  new ResizeObserver(() => {
    const { width, height } = root.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(root);

  let frame = 0;
  let started: number | null = null;
  let shown = false;

  const draw = (now: number) => {
    started ??= now;
    const elapsed = now - started;
    sheets.forEach((sheet, i) => {
      // Sheets square up one at a time, from the bottom of the stack.
      const t = easeOut(Math.min(Math.max((elapsed - i * 170) / 800, 0), 1));
      const loose = LOOSE[i];
      sheet.position.x = loose.x * (1 - t);
      sheet.position.z = loose.z * (1 - t);
      sheet.rotation.y = loose.r * (1 - t);
    });
    stack.rotation.y = -0.42 + Math.sin(elapsed * 0.00035) * 0.07;
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      root.dataset.live = 'true';
    }
    frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  let visible = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !document.hidden) start();
    else stop();
  }).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !visible) stop();
    else start();
  });
}
