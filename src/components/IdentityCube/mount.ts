/**
 * Glue between the markup in IdentityCube.astro and the 3D scene.
 * - Shows a static poster immediately (no layout shift, good LCP)
 * - Loads three.js only after the page is idle AND the cube is on screen
 * - Falls back to flat face artwork when WebGL is unavailable or Save-Data is on
 */
import { mergeConfig, type CubeConfig, type CubeConfigInput } from './config';
import type { CubeController } from './scene';

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const idle = () =>
  new Promise<void>((r) => {
    const go = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(() => r(), { timeout: 1800 }) : setTimeout(r, 300));
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, { once: true });
  });

/**
 * The cube paints with the site's active palette: --ink (body), --panel (accent),
 * --page (paper) and --faded (secondary text). config.ts holds the fallbacks.
 */
function readPalette(el: Element, fallback: CubeConfig['palette']): CubeConfig['palette'] {
  const css = getComputedStyle(el);
  const pick = (token: string, fb: string) => {
    const v = css.getPropertyValue(token).trim();
    return v && CSS.supports('color', v) ? v : fb;
  };
  return {
    ink: pick('--ink', fallback.ink),
    accent: pick('--panel', fallback.accent),
    paper: pick('--page', fallback.paper),
    grey: pick('--faded', fallback.grey),
  };
}

const inView = (el: Element) =>
  new Promise<void>((r) => {
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          r();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
  });

export async function mountCube(root: HTMLElement) {
  if (root.dataset.mounted) return;
  root.dataset.mounted = '1';
  let raw: CubeConfigInput = {};
  try {
    raw = JSON.parse(root.dataset.config || '{}');
  } catch {
    /* use defaults */
  }
  const cfg = mergeConfig(raw);
  // an explicit config.palette wins; otherwise follow the site's data-palette
  if (!root.hasAttribute('data-palette-pinned')) cfg.palette = readPalette(root, cfg.palette);
  const stage = root.querySelector<HTMLElement>('[data-cube-stage]')!;
  const poster = root.querySelector<HTMLElement>('[data-cube-poster]');
  const live = root.querySelector<HTMLElement>('[data-cube-live]');
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-cube-pause]');
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-face-btn]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const announce = (i: number) => {
    const f = cfg.faces[i];
    if (live) live.textContent = `${f.label}${f.items.length ? ': ' + f.items.join(', ') : ''}`;
  };
  const markActive = (i: number) => buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  const scrollToFace = (i: number) => {
    const href = cfg.faces[i].href;
    if (!href) return;
    const target = href.startsWith('#') ? document.querySelector(href) : null;
    if (target) target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    else location.href = href;
  };

  await idle();
  await inView(root);

  const saveData = (navigator as any).connection?.saveData === true;
  if (!webglOK() || saveData) return mountFlat(root, cfg, stage, poster, buttons, markActive, announce);

  let cube: CubeController;
  try {
    const { createIdentityCube } = await import('./scene');
    cube = await createIdentityCube(stage, cfg, {
      onFace: (i, byUser) => {
        markActive(i);
        if (byUser) announce(i);
      },
      onActivate: scrollToFace,
    });
  } catch (err) {
    console.warn('[IdentityCube] falling back to flat artwork', err);
    return mountFlat(root, cfg, stage, poster, buttons, markActive, announce);
  }
  root.classList.add('is-3d');
  poster?.setAttribute('hidden', '');

  buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      if (cube.face === i) scrollToFace(i);
      else cube.goTo(i);
      markActive(i);
      announce(i);
    }),
  );
  root.addEventListener('keydown', (e) => {
    if (!(e.target as HTMLElement).closest('[data-face-btn]')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const i = (cube.face + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
      cube.goTo(i);
      markActive(i);
      announce(i);
      buttons[i]?.focus();
    }
  });

  const syncPause = () => {
    if (!pauseBtn) return;
    pauseBtn.hidden = reduced.matches;
  };
  syncPause();
  reduced.addEventListener?.('change', syncPause);
  pauseBtn?.addEventListener('click', () => {
    const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.setAttribute('aria-label', paused ? 'Play cube rotation' : 'Pause cube rotation');
    cube.setPaused(paused);
  });
  // Stop auto-rotation while a keyboard user is working the controls
  root.addEventListener('focusin', () => cube.setPaused(true));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) cube.setPaused(pauseBtn?.getAttribute('aria-pressed') === 'true');
  });
}

/** No-WebGL path: flat face artwork, switched by the same buttons. */
async function mountFlat(
  root: HTMLElement,
  cfg: CubeConfig,
  stage: HTMLElement,
  poster: HTMLElement | null,
  buttons: HTMLButtonElement[],
  markActive: (i: number) => void,
  announce: (i: number) => void,
) {
  root.classList.add('is-flat');
  const { paintSingleFace } = await import('./faceArt');
  const img = cfg.portraitSrc
    ? await new Promise<HTMLImageElement | null>((r) => {
        const i = new Image();
        i.onload = () => r(i);
        i.onerror = () => r(null);
        i.src = cfg.portraitSrc;
      })
    : null;
  const size = Math.min(1400, Math.round(stage.clientWidth * Math.min(devicePixelRatio || 1, 2)));
  const canvases = await Promise.all([0, 1, 2, 3].map((i) => paintSingleFace(cfg, i, size, img)));
  const holder = document.createElement('div');
  holder.className = 'icube__flat';
  holder.setAttribute('aria-hidden', 'true');
  canvases.forEach((c, i) => {
    c.className = 'icube__flat-face';
    if (i) c.style.opacity = '0';
    holder.appendChild(c);
  });
  stage.appendChild(holder);
  poster?.setAttribute('hidden', '');
  const pauseBtn = root.querySelector<HTMLElement>('[data-cube-pause]');
  if (pauseBtn) pauseBtn.hidden = true;
  buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      canvases.forEach((c, k) => (c.style.opacity = k === i ? '1' : '0'));
      markActive(i);
      announce(i);
    }),
  );
}

export function mountAll() {
  document.querySelectorAll<HTMLElement>('[data-identity-cube]').forEach((el) => void mountCube(el));
}
