/**
 * Identity Cube — Three.js scene.
 * Only imported (lazily) once the browser has proven it can run WebGL.
 */
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  DirectionalLight,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  Color,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { CubeConfig } from './config';
import { paintFaces } from './faceArt';

export interface CubeHooks {
  /** Fires whenever a new face settles in front. byUser = visitor caused it */
  onFace?: (index: number, byUser: boolean) => void;
  /** Visitor clicked the face that is already in front */
  onActivate?: (index: number) => void;
}

export interface CubeController {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  setPaused: (paused: boolean) => void;
  readonly face: number;
  destroy: () => void;
}

const QUARTER = Math.PI / 2;
const DEG = Math.PI / 180;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Classic bounce: lands at t≈0.36, rebounds twice with decaying height */
function bounceOut(x: number) {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
}
const pulse = (x: number, at: number, width: number) => Math.exp(-((x - at) ** 2) / (2 * width * width));

/** Start pose for each throw direction (everything animates to 0) */
const THROWS = {
  'top-right': { x: 2.3, y: 3.6, rx: -Math.PI, rz: -Math.PI * 1.5 },
  'top-left': { x: -2.3, y: 3.6, rx: -Math.PI, rz: Math.PI * 1.5 },
  top: { x: 0, y: 3.9, rx: -Math.PI * 1.5, rz: -Math.PI / 2 },
  side: { x: 3.4, y: 1.1, rx: -Math.PI / 2, rz: -Math.PI * 2 },
} as const;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mod = (n: number, m: number) => ((n % m) + m) % m;
const TAU = Math.PI * 2;

/**
 * Auto-rotation runs on a continuous phase (1 unit = one quarter-turn).
 * warp() maps phase → quarter-turns so the speed dips at every face and
 * peaks between faces, without ever reaching zero:
 *   speed(x) = 1 − (1 − s)·cos(2πx), s = 1 − linger
 * → s × average at each face (0.15 at linger 0.85), 2 − s halfway.
 * warp(k) = k for every integer k, so a landed face maps straight back to a phase.
 */
function warp(p: number, slope: number) {
  const k = Math.floor(p);
  const x = p - k;
  return k + x - ((1 - slope) / TAU) * Math.sin(TAU * x);
}

/** BoxGeometry material slot → narrative face index */
const SLOT_TO_FACE: Record<number, number> = { 4: 0, 0: 1, 5: 2, 1: 3 };

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    try {
      if (new URL(src, location.href).origin !== location.origin) img.crossOrigin = 'anonymous';
    } catch {
      /* data: urls */
    }
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.45, 'rgba(0,0,0,0.22)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export async function createIdentityCube(
  host: HTMLElement,
  cfg: CubeConfig,
  hooks: CubeHooks = {},
): Promise<CubeController> {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- renderer */
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:default;outline:none';

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.15, 8);
  camera.lookAt(0, -0.05, 0);

  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const key = new DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 6);
  const rim = new DirectionalLight(new Color(cfg.palette.accent), 2.2);
  rim.position.set(-5, 3, -4);
  const fill = new DirectionalLight(0xffffff, 0.35);
  fill.position.set(-4, -2, 3);
  scene.add(key, rim, fill);

  /* ---------- textures */
  const cssSize = Math.max(host.clientWidth, host.clientHeight, 320);
  const texSize = cssSize * dpr > 760 ? 2048 : 1024;
  const portrait = await loadImage(cfg.portraitSrc);
  const { slots } = await paintFaces(cfg, texSize, portrait);
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const textures = new Map<HTMLCanvasElement, CanvasTexture>();
  const materials = slots.map((c, slot) => {
    let tex = textures.get(c);
    if (!tex) {
      tex = new CanvasTexture(c);
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = aniso;
      tex.minFilter = LinearMipmapLinearFilter;
      textures.set(c, tex);
    }
    const isCap = slot === 2 || slot === 3;
    // Artwork is mostly self-lit (emissive) so the printed colours stay true;
    // a low-intensity diffuse + clearcoat layer adds shading and a glassy sheen.
    return new MeshPhysicalMaterial({
      map: tex,
      color: 0x8c8c8c,
      emissive: 0xffffff,
      emissiveMap: tex,
      emissiveIntensity: isCap ? 0.45 : 0.62,
      roughness: 0.72,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.42,
      envMapIntensity: 0.22,
    });
  });

  /* ---------- objects */
  const SIZE = 2;
  const geo = new RoundedBoxGeometry(SIZE, SIZE, SIZE, 6, 0.07);
  const cube = new Mesh(geo, materials);

  const rimMat = new MeshBasicMaterial({
    color: cfg.palette.accent,
    side: BackSide,
    transparent: true,
    opacity: 0.18,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const rimShell = new Mesh(geo, rimMat);
  rimShell.scale.setScalar(1.014);

  const yawGroup = new Group();
  yawGroup.add(cube, rimShell);
  const pitchGroup = new Group();
  pitchGroup.add(yawGroup);
  // intro: tumble (rotation) inside squash/drop (position + scale) so squash stays vertical
  const tumbleGroup = new Group();
  tumbleGroup.add(pitchGroup);
  const dropGroup = new Group();
  dropGroup.add(tumbleGroup);
  const root = new Group();
  root.add(dropGroup);
  scene.add(root);

  const shadowMat = new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0.6 });
  const shadow = new Mesh(new PlaneGeometry(3.1, 3.1), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.62;
  scene.add(shadow);

  /* ---------- state */
  const baseYaw = cfg.angle.yaw * DEG;
  const basePitch = cfg.angle.pitch * DEG;
  const pitchLimit = cfg.pitchLimit * DEG;
  let spin = 0; // face k is in front when spin = -k·90°
  let pitch = basePitch;
  let tween: { from: number; to: number; t0: number; dur: number; ease: (t: number) => number; byUser: boolean } | null = null;
  let phase = 0; // auto-rotation phase; phase k ⇔ face k in front
  let motion = 0; // 0..1 auto-rotation speed factor, eased (hover/pause ease to a stop)
  let hovered = false;
  let userPaused = false;
  let holdUntil = 0;
  let inView = true;
  let lastFace = 0;
  let hover = 0; // 0..1 hover feedback amount
  const tilt = new Vector2();
  const ZERO = new Vector2();
  const tiltTarget = new Vector2();
  let needsRender = true;
  // intro state
  const throwFrom = THROWS[cfg.intro.from] ?? THROWS['top-right'];
  let intro: 'waiting' | 'playing' | 'done' = cfg.intro.enabled && !reduced.matches ? 'waiting' : 'done';
  let introT0 = 0;
  let settledAt = 0; // time the intro finished (float fades in from here)
  if (intro === 'waiting') root.visible = false;

  const faceFromSpin = (s: number) => mod(Math.round(-s / QUARTER), 4);
  const now = () => performance.now() / 1000;

  const slope = 1 - clamp(cfg.timing.linger, 0, 0.95);

  function settle(byUser: boolean) {
    // carry on auto-rotating from exactly where the visitor left it
    phase = Math.round(-spin / QUARTER);
    const f = faceFromSpin(spin);
    if (f !== lastFace || byUser) {
      lastFace = f;
      hooks.onFace?.(f, byUser);
    }
  }

  function tweenTo(target: number, byUser: boolean, dur = cfg.timing.turn, ease = easeInOut) {
    if (reduced.matches) dur = Math.min(dur, 0.35);
    tween = { from: spin, to: target, t0: now(), dur, ease, byUser };
    motion = 0;
    needsRender = true;
  }

  function goTo(i: number, byUser = true) {
    const k0 = Math.round(-spin / QUARTER);
    let delta = mod(i - mod(k0, 4), 4);
    if (delta > 2) delta -= 4;
    if (byUser) holdUntil = now() + cfg.timing.resumeAfterInteraction;
    tweenTo(-(k0 + delta) * QUARTER, byUser);
  }

  /* ---------- sizing */
  // The cube lives in the bottom square of the stage; `headroom` adds space above it.
  // A view offset keeps the cube's perspective identical whatever the headroom.
  const BASE_FOV = 28;
  let regionWorldH = 3.8; // world-space height of the cube's square region
  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    const hd = Math.max(0, cfg.headroom);
    const hr = h / (1 + hd); // height of the cube region
    const regionAspect = w / hr;
    const R = 1.75; // bounding radius incl. float + three-quarter silhouette
    const vfov = BASE_FOV * DEG;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * regionAspect);
    const dist = R / Math.sin(Math.min(vfov, hfov) / 2);
    camera.position.z = dist;
    regionWorldH = 2 * Math.tan(vfov / 2) * dist;
    // full virtual frustum is symmetric around the cube; we render its top part
    const fullH = hr * (1 + 2 * hd);
    camera.fov = (2 * Math.atan(Math.tan(vfov / 2) * (fullH / hr))) / DEG;
    camera.aspect = w / fullH;
    if (hd > 0) camera.setViewOffset(w, fullH, 0, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  /* ---------- pointer */
  const ray = new Raycaster();
  const ndc = new Vector2();
  let drag: { id: number; x: number; y: number; lastX: number; lastT: number; v: number; moved: boolean; spin0: number; pitch0: number } | null = null;

  function hitTest(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(cube, false)[0] ?? null;
  }
  function pickFace(e: PointerEvent): number {
    const slot = hitTest(e)?.face?.materialIndex ?? -1;
    return SLOT_TO_FACE[slot] ?? -1;
  }

  const onEnter = () => {};
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      hovered = false;
      tiltTarget.set(0, 0);
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || intro !== 'done') return;
    if (e.pointerType === 'mouse' && !hitTest(e)) return; // empty space around the cube
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastT: now(), v: 0, moved: false, spin0: spin, pitch0: pitch };
  };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      // hover only counts over the cube itself, not the transparent stage
      const over = !!drag || (intro === 'done' && !!hitTest(e));
      if (over !== hovered) {
        hovered = over;
        if (!over) tiltTarget.set(0, 0);
        canvas.style.cursor = over ? (drag?.moved ? 'grabbing' : 'grab') : 'default';
      }
      if (over) tiltTarget.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const k = 3.2 / r.width; // a full-width drag ≈ 180°
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      tween = null;
      motion = 0;
      // auto-rotation may have moved on since pointerdown: grab from where it is now
      drag.spin0 = spin - dx * k;
      drag.pitch0 = pitch - dy * k * 0.6;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }
    if (!drag.moved) return;
    spin = drag.spin0 + dx * k;
    pitch = clamp(drag.pitch0 + dy * k * 0.6, basePitch - pitchLimit, basePitch + pitchLimit);
    const t = now();
    const dt = Math.max(t - drag.lastT, 1 / 120);
    drag.v = drag.v * 0.6 + (((e.clientX - drag.lastX) * k) / dt) * 0.4;
    drag.lastX = e.clientX;
    drag.lastT = t;
    needsRender = true;
  };
  const release = (e: PointerEvent, cancelled: boolean) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    canvas.style.cursor = hovered ? 'grab' : 'default';
    // a touch that became a page scroll: leave the cube alone
    if (cancelled && !d.moved) return;
    holdUntil = now() + cfg.timing.resumeAfterInteraction;
    if (d.moved || cancelled) {
      const projected = spin + clamp(d.v, -8, 8) * 0.16;
      tweenTo(Math.round(projected / QUARTER) * QUARTER, true, 0.75, easeOut);
      return;
    }
    if (intro !== 'done') return;
    const f = pickFace(e);
    if (f < 0) return;
    if (f === faceFromSpin(spin) && !tween) hooks.onActivate?.(f);
    else goTo(f, true);
  };
  const onUp = (e: PointerEvent) => release(e, false);
  const onCancel = (e: PointerEvent) => release(e, true);

  canvas.addEventListener('pointerenter', onEnter);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);

  /* ---------- visibility */
  const io = new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    if (inView) start();
  });
  io.observe(host);
  // play the entrance once the cube is properly on screen
  const introIO = new IntersectionObserver(
    ([en]) => {
      if (en.isIntersecting && intro === 'waiting') {
        intro = 'playing';
        introT0 = now();
        root.visible = true;
        start();
      }
      if (intro !== 'waiting') introIO.disconnect();
    },
    { threshold: 0.35 },
  );
  if (intro === 'waiting') introIO.observe(host);
  const onVis = () => document.visibilityState === 'visible' && start();
  document.addEventListener('visibilitychange', onVis);
  const onMotionPref = () => {
    needsRender = true;
    start();
  };
  reduced.addEventListener?.('change', onMotionPref);

  /* ---------- loop */
  let raf = 0;
  let last = now();
  function start() {
    if (!raf) {
      last = now();
      raf = requestAnimationFrame(loop);
    }
  }
  function loop() {
    raf = 0;
    if (!inView || document.visibilityState !== 'visible') return;
    const t = now();
    const dt = Math.min(t - last, 0.1);
    last = t;
    const still = reduced.matches;

    if (intro === 'waiting') {
      renderer.render(scene, camera); // transparent until thrown in
      return; // introIO restarts the loop
    }

    // entrance: thrown in, tumbles, bounces, settles on the portrait
    let introY = 0;
    if (intro === 'playing') {
      const D = cfg.intro.duration;
      const p = clamp((t - introT0) / D, 0, 1);
      const pDrop = clamp(p / 0.82, 0, 1);
      const pRot = easeOut(clamp(p / 0.62, 0, 1));
      const startY = throwFrom.y + Math.max(0, cfg.headroom) * regionWorldH;
      introY = startY * (1 - bounceOut(pDrop));
      const x = throwFrom.x * (1 - easeOut(clamp(p / 0.7, 0, 1)));
      // impacts happen where bounceOut touches 1 → squash like a weighted die
      const sq =
        0.075 * pulse(pDrop, 1 / 2.75, 0.025) + 0.03 * pulse(pDrop, 2 / 2.75, 0.02) + 0.012 * pulse(pDrop, 2.5 / 2.75, 0.015);
      // settling rock after it lands
      const rockT = Math.max(0, p - 0.45) * D;
      const rock = 0.07 * Math.sin(rockT * 13) * Math.exp(-rockT * 4.5) * (p > 0.45 ? 1 : 0);
      tumbleGroup.rotation.set(throwFrom.rx * (1 - pRot), 0, throwFrom.rz * (1 - pRot) + rock);
      dropGroup.position.set(x, introY - sq * (SIZE / 2), 0);
      dropGroup.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
      shadow.position.x = x;
      if (p >= 1) {
        intro = 'done';
        tumbleGroup.rotation.set(0, 0, 0);
        dropGroup.position.set(0, 0, 0);
        dropGroup.scale.set(1, 1, 1);
        shadow.position.x = 0;
        settledAt = t;
        holdUntil = t + cfg.intro.restBeforeRotate; // rests on the portrait, then starts turning
        phase = 0;
        motion = 0;
        lastFace = 0;
        hooks.onFace?.(0, false);
      }
      needsRender = true;
    }

    // tween
    let flourish = 0;
    if (tween) {
      const p = clamp((t - tween.t0) / tween.dur, 0, 1);
      spin = tween.from + (tween.to - tween.from) * tween.ease(p);
      flourish = Math.sin(p * Math.PI) * Math.min(1, Math.abs(tween.to - tween.from) / QUARTER);
      if (p >= 1) {
        const byUser = tween.byUser;
        tween = null;
        settle(byUser);
      }
      needsRender = true;
    }

    // continuous auto-rotation: slows right down at each face, speeds up between them
    const grabbed = !!drag?.moved || !!tween;
    const autoPaused = still || hovered || userPaused || grabbed || t < holdUntil || intro !== 'done';
    if (still || grabbed || intro !== 'done') {
      motion = 0;
    } else {
      // starts gently, eases to a stop on hover/pause (never an instant freeze)
      const target = autoPaused ? 0 : 1;
      motion += (target - motion) * (1 - Math.exp(-dt * (target ? 1.4 : 3.2)));
      if (!target && motion < 2e-3) motion = 0;
    }
    if (motion > 0) {
      phase += (dt / Math.max(0.5, cfg.timing.perFace)) * motion;
      spin = -QUARTER * warp(phase, slope);
      const x = phase - Math.floor(phase);
      flourish = Math.max(flourish, 0.5 * motion * (0.5 - 0.5 * Math.cos(TAU * x)));
      const f = faceFromSpin(spin);
      if (f !== lastFace) {
        lastFace = f;
        hooks.onFace?.(f, false); // keeps the face buttons' aria-pressed in step
      }
      needsRender = true;
    }

    // pitch eases back to rest when not dragging
    if (!drag && Math.abs(pitch - basePitch) > 1e-4) {
      pitch += (basePitch - pitch) * (1 - Math.exp(-dt * 4));
      needsRender = true;
    }

    // hover feedback + parallax
    const hoverTarget = hovered || drag ? 1 : 0;
    if (Math.abs(hover - hoverTarget) > 1e-3) needsRender = true;
    hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 8));
    tilt.lerp(hovered && !drag ? tiltTarget : ZERO, 1 - Math.exp(-dt * 5));

    const floatIn = intro === 'done' ? clamp((t - settledAt) / 1.5, 0, 1) : 0;
    const float = still ? 0 : Math.sin((t - settledAt) * 0.85) * 0.07 * floatIn;
    root.position.y = float;
    root.rotation.z = still ? 0 : Math.sin((t - settledAt) * 0.55) * 0.012 * floatIn;
    root.rotation.y = tilt.x * 0.09;
    root.rotation.x = tilt.y * 0.06;
    root.scale.setScalar(1 + hover * 0.02 - flourish * 0.04);
    pitchGroup.rotation.x = pitch;
    yawGroup.rotation.y = baseYaw + spin;
    rimMat.opacity = 0.16 + hover * 0.2 + flourish * 0.12;
    shadowMat.opacity = Math.max(0, 0.55 - float * 1.6 - flourish * 0.1) / (1 + introY * 0.9);
    shadow.scale.setScalar((1 - float * 0.6) * (1 + introY * 0.12));

    if (needsRender || !still) {
      renderer.render(scene, camera);
      needsRender = false;
    }
    // In reduced-motion mode we stop the loop as soon as the scene is idle
    const idle = still && !tween && !drag && Math.abs(hover - hoverTarget) < 1e-3 && Math.abs(pitch - basePitch) < 1e-3;
    if (!idle) raf = requestAnimationFrame(loop);
  }

  // keep the loop alive for pointer interaction in reduced-motion mode
  canvas.addEventListener('pointermove', start);
  canvas.addEventListener('pointerdown', start);

  host.appendChild(canvas);
  renderer.render(scene, camera);
  start();

  const controller: CubeController = {
    goTo: (i) => {
      goTo(i, true);
      start();
    },
    // via goTo so a turn started mid-rotation always lands squarely on a face
    next: () => {
      goTo(mod(faceFromSpin(spin) + 1, 4), true);
      start();
    },
    prev: () => {
      goTo(mod(faceFromSpin(spin) + 3, 4), true);
      start();
    },
    setPaused: (p) => {
      userPaused = p;
      start();
    },
    get face() {
      return faceFromSpin(spin);
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      introIO.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      reduced.removeEventListener?.('change', onMotionPref);
      geo.dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      rimMat.dispose();
      shadowMat.map?.dispose();
      shadowMat.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
  return controller;
}
