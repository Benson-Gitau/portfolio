/**
 * Face artwork painters. Each face is drawn onto a 2D canvas at runtime and
 * used as a texture, so text stays razor sharp, copy edits in config.ts flow
 * straight through, and no extra image downloads are needed (except the portrait).
 */
import type { CubeConfig, CubeFace, CubeFonts } from './config';

type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ utils */

function rgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function setFont(ctx: Ctx, weight: string | number, size: number, family: string) {
  ctx.font = `${weight} ${Math.round(size)}px ${family}`;
}

/** Shrinks font size until text fits maxWidth. Returns the size used. */
function fitText(ctx: Ctx, text: string, weight: string | number, size: number, family: string, maxW: number) {
  let s = size;
  setFont(ctx, weight, s, family);
  while (ctx.measureText(text).width > maxW && s > 8) {
    s *= 0.96;
    setFont(ctx, weight, s, family);
  }
  return s;
}

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

let grainCache: HTMLCanvasElement | null = null;
function grain(): HTMLCanvasElement {
  if (grainCache) return grainCache;
  const c = document.createElement('canvas');
  c.width = c.height = 192;
  const g = c.getContext('2d')!;
  const img = g.createImageData(192, 192);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 14;
  }
  g.putImageData(img, 0, 0);
  return (grainCache = c);
}

/* --------------------------------------------------------- fonts loading */

export function resolveFonts(cfg: CubeConfig): CubeFonts {
  const css = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const v = (name: string) => css?.getPropertyValue(name).trim() || '';
  return {
    sans: cfg.fonts?.sans || v('--font-geist') || 'Geist, Inter, system-ui, sans-serif',
    serif: cfg.fonts?.serif || v('--font-instrument') || '"Instrument Serif", Georgia, serif',
    mono: cfg.fonts?.mono || v('--font-geist-mono') || '"Geist Mono", ui-monospace, monospace',
  };
}

export async function loadFonts(f: CubeFonts) {
  if (!('fonts' in document)) return;
  const wanted = [
    `800 40px ${f.sans}`,
    `600 40px ${f.sans}`,
    `500 40px ${f.sans}`,
    `italic 400 40px ${f.serif}`,
    `400 40px ${f.serif}`,
    `500 40px ${f.mono}`,
  ];
  const timeout = new Promise((r) => setTimeout(r, 2500));
  await Promise.race([Promise.all(wanted.map((w) => document.fonts.load(w).catch(() => null))), timeout]);
}

/* ------------------------------------------------------------ shared frame */

interface Paint {
  ctx: Ctx;
  S: number;
  M: number;
  cfg: CubeConfig;
  f: CubeFonts;
}

function base({ ctx, S, cfg }: Paint) {
  const { ink } = cfg.palette;
  ctx.fillStyle = ink;
  ctx.fillRect(0, 0, S, S);
  // soft studio light falloff
  const g = ctx.createRadialGradient(S * 0.28, S * 0.18, 0, S * 0.28, S * 0.18, S * 1.05);
  g.addColorStop(0, 'rgba(255,255,255,0.055)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  // print grain
  ctx.fillStyle = ctx.createPattern(grain(), 'repeat')!;
  ctx.fillRect(0, 0, S, S);
}

function frame(p: Paint, index: number, eyebrow: string, extraRight?: string) {
  const { ctx, S, M, cfg, f } = p;
  const { accent, grey } = cfg.palette;
  // hairline border (the bevel of the 3D cube sits just outside this)
  const inset = S * 0.032;
  ctx.strokeStyle = rgba(accent, 0.38);
  ctx.lineWidth = Math.max(1.5, S * 0.0016);
  rr(ctx, inset, inset, S - inset * 2, S - inset * 2, S * 0.018);
  ctx.stroke();
  // corner ticks
  const t = S * 0.038;
  ctx.strokeStyle = accent;
  ctx.lineWidth = S * 0.0035;
  ctx.lineCap = 'square';
  const c = inset;
  const corners: [number, number, number, number][] = [
    [c, c, 1, 1],
    [S - c, c, -1, 1],
    [c, S - c, 1, -1],
    [S - c, S - c, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + t * dy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + t * dx, y);
    ctx.stroke();
  }
  // meta row
  const y = M * 0.98;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.fillRect(M, y - S * 0.0075, S * 0.015, S * 0.015);
  setFont(ctx, 500, S * 0.0215, f.mono);
  ctx.fillStyle = grey;
  ctx.textAlign = 'left';
  ctx.fillText(`0${index + 1} — ${eyebrow}`, M + S * 0.03, y);
  ctx.textAlign = 'right';
  ctx.fillText(extraRight ?? `0${index + 1} / 04`, S - M, y);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function headline(p: Paint, text: string, top: number) {
  const { ctx, S, M, cfg, f } = p;
  setFont(ctx, 'italic 400', S * 0.084, f.serif);
  ctx.fillStyle = cfg.palette.paper;
  let lines = wrap(ctx, text, S - M * 2);
  if (lines.length === 2) {
    // balance two-line headlines so there is no lonely last word
    const words = text.split(' ');
    let best = lines;
    let bestW = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
      if (w < bestW && w <= S - M * 2) {
        bestW = w;
        best = [a, b];
      }
    }
    lines = best;
  }
  lines.forEach((l, i) => ctx.fillText(l, M, top + S * 0.075 * (i + 1)));
  return top + S * 0.075 * lines.length;
}

/** Bezier helper returning point at t */
function bez(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const u = 1 - t;
  return [0, 1].map(
    (k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k],
  );
}

/* ----------------------------------------------------------- face: person */

function processPortrait(img: CanvasImageSource & { width: number; height: number }, size: number, accent: string) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.imageSmoothingQuality = 'high';
  // contain, bottom aligned
  const s = Math.min(size / img.width, size / img.height);
  const w = img.width * s;
  const h = img.height * s;
  g.drawImage(img, (size - w) / 2, size - h, w, h);
  // editorial black & white: luminance + gentle contrast curve
  const d = g.getImageData(0, 0, size, size);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    let l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    l = l / 255;
    l = l < 0.5 ? 2 * l * l : 1 - 2 * (1 - l) * (1 - l); // s-curve
    l = Math.min(1, l * 1.04 + 0.02);
    px[i] = px[i + 1] = px[i + 2] = l * 255;
  }
  g.putImageData(d, 0, 0);
  // lime halftone only across the lower body (keeps the face untouched)
  g.globalCompositeOperation = 'source-atop';
  const step = size * 0.014;
  for (let y = size * 0.6; y < size; y += step) {
    const k = (y - size * 0.6) / (size * 0.4);
    for (let x = 0; x < size; x += step) {
      const ox = (Math.round(y / step) % 2) * step * 0.5;
      const r = step * 0.42 * Math.min(1, k * 1.15);
      if (r < 0.4) continue;
      g.fillStyle = rgba(accent, 0.55);
      g.beginPath();
      g.arc(x + ox, y, r, 0, TAU);
      g.fill();
    }
  }
  g.globalCompositeOperation = 'source-over';
  return c;
}

function paintPerson(p: Paint, face: CubeFace, portrait: HTMLImageElement | HTMLCanvasElement | null) {
  const { ctx, S, M, cfg, f } = p;
  const { accent, paper, ink } = cfg.palette;
  base(p);

  // lime disc with diagonal halftone fade
  const cx = S * 0.53;
  const cy = S * 0.38;
  const r = S * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.clip();
  const step = S * 0.017;
  ctx.fillStyle = rgba(ink, 0.9);
  for (let y = cy - r; y < cy + r; y += step) {
    for (let x = cx - r; x < cx + r; x += step) {
      const t = (x - cx + (y - cy)) / (2 * r) + 0.15; // diagonal
      const dr = step * 0.5 * Math.max(0, Math.min(1, t * 1.6));
      if (dr < 0.6) continue;
      ctx.beginPath();
      ctx.arc(x, y, dr, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // offset outline ring + geometry
  ctx.strokeStyle = rgba(paper, 0.32);
  ctx.lineWidth = S * 0.0022;
  ctx.beginPath();
  ctx.arc(cx - S * 0.045, cy + S * 0.03, r, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = S * 0.003;
  ctx.beginPath();
  const tx = S * 0.15;
  const ty = S * 0.5;
  ctx.moveTo(tx, ty - S * 0.045);
  ctx.lineTo(tx + S * 0.045, ty + S * 0.03);
  ctx.lineTo(tx - S * 0.045, ty + S * 0.03);
  ctx.closePath();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(S * 0.79, S * 0.16, S * 0.12, S * 0.1);
  ctx.clip();
  ctx.strokeStyle = rgba(paper, 0.28);
  ctx.lineWidth = S * 0.0022;
  for (let i = -10; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(S * 0.79 + i * S * 0.014, S * 0.26);
    ctx.lineTo(S * 0.79 + i * S * 0.014 + S * 0.1, S * 0.16);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = accent;
  ctx.fillRect(S * 0.84, S * 0.55, S * 0.022, S * 0.022);

  // portrait
  if (portrait) {
    const P = Math.round(S * 0.84);
    const art = processPortrait(portrait as any, P, accent);
    ctx.drawImage(art, (S - P) / 2 + S * 0.01, S * 0.105);
  }

  // scrim into the type block
  const sg = ctx.createLinearGradient(0, S * 0.6, 0, S * 0.82);
  sg.addColorStop(0, rgba(ink, 0));
  sg.addColorStop(1, rgba(ink, 0.97));
  ctx.fillStyle = sg;
  ctx.fillRect(0, S * 0.6, S, S * 0.22);
  ctx.fillStyle = rgba(ink, 0.97);
  ctx.fillRect(0, S * 0.82, S, S * 0.18);

  // name
  ctx.fillStyle = paper;
  fitText(ctx, cfg.name, 800, S * 0.108, f.sans, S - M * 2);
  ctx.fillText(cfg.name, M - S * 0.004, S * 0.845);

  // role pill
  setFont(ctx, 500, S * 0.027, f.mono);
  const label = cfg.role;
  const tw = ctx.measureText(label).width;
  const ph = S * 0.052;
  const py = S * 0.875;
  ctx.fillStyle = accent;
  rr(ctx, M, py, tw + S * 0.05, ph, ph / 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(label, M + S * 0.025, py + ph / 2 + S * 0.002);
  ctx.textBaseline = 'alphabetic';

  frame(p, 0, face.eyebrow, cfg.portraitIsStandIn ? 'PORTRAIT STAND-IN' : undefined);
}

/* ------------------------------------------------------------ face: build */

function paintBuild(p: Paint, face: CubeFace) {
  const { ctx, S, M, cfg, f } = p;
  const { accent, paper, ink } = cfg.palette;
  base(p);
  headline(p, face.headline ?? '', S * 0.13);

  // dotted blueprint grid
  ctx.fillStyle = rgba(paper, 0.08);
  for (let y = S * 0.36; y <= S * 0.64; y += S * 0.035)
    for (let x = M; x <= S - M; x += S * 0.035) ctx.fillRect(x, y, S * 0.003, S * 0.003);

  const trig = [S * 0.17, S * 0.5];
  const hub = [S * 0.46, S * 0.5];
  const outs = [S * 0.385, S * 0.5, S * 0.615].map((y) => [S * 0.79, y]);

  // connections — glow pass then crisp pass
  const curves: number[][][] = [
    [trig, [trig[0] + S * 0.12, trig[1]], [hub[0] - S * 0.12, hub[1]], hub],
    ...outs.map((o) => [hub, [hub[0] + S * 0.14, hub[1]], [o[0] - S * 0.16, o[1]], [o[0] - S * 0.09, o[1]]]),
  ];
  for (const pass of [0, 1]) {
    ctx.save();
    ctx.strokeStyle = pass ? accent : rgba(accent, 0.5);
    ctx.lineWidth = pass ? S * 0.0026 : S * 0.006;
    if (!pass) {
      ctx.shadowColor = accent;
      ctx.shadowBlur = S * 0.02;
    }
    for (const [a, b, c, d] of curves) {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.bezierCurveTo(b[0], b[1], c[0], c[1], d[0], d[1]);
      ctx.stroke();
    }
    ctx.restore();
  }
  // data packets along the lines
  ctx.fillStyle = paper;
  curves.forEach(([a, b, c, d], i) => {
    const [x, y] = bez(a, b, c, d, 0.35 + (i % 2) * 0.3);
    ctx.beginPath();
    ctx.arc(x, y, S * 0.0065, 0, TAU);
    ctx.fill();
  });

  // trigger node
  ctx.strokeStyle = accent;
  ctx.lineWidth = S * 0.003;
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(trig[0], trig[1], S * 0.038, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(trig[0], trig[1], S * 0.012, 0, TAU);
  ctx.fill();

  // agent hub — layered hexagon for depth
  const hex = (x: number, y: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + Math.PI / 6;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  };
  ctx.fillStyle = rgba(accent, 0.18);
  hex(hub[0] + S * 0.014, hub[1] + S * 0.016, S * 0.075);
  ctx.fill();
  ctx.save();
  ctx.shadowColor = rgba(accent, 0.6);
  ctx.shadowBlur = S * 0.04;
  ctx.fillStyle = accent;
  hex(hub[0], hub[1], S * 0.075);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = rgba(ink, 0.55);
  ctx.lineWidth = S * 0.0025;
  hex(hub[0], hub[1], S * 0.048);
  ctx.stroke();
  ctx.fillStyle = ink;
  setFont(ctx, 500, S * 0.026, f.mono);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', hub[0], hub[1] + S * 0.002);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // output cards (stacked for depth)
  const cw = S * 0.16;
  const ch = S * 0.072;
  for (const [ox, oy] of outs) {
    const x = ox - S * 0.09;
    const y = oy - ch / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    rr(ctx, x + S * 0.012, y + S * 0.014, cw, ch, S * 0.014);
    ctx.fill();
    ctx.fillStyle = '#1b1f1b';
    rr(ctx, x, y, cw, ch, S * 0.014);
    ctx.fill();
    ctx.strokeStyle = rgba(paper, 0.16);
    ctx.lineWidth = S * 0.0018;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x + S * 0.03, oy, S * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba(paper, 0.5);
    rr(ctx, x + S * 0.052, oy - S * 0.014, cw * 0.5, S * 0.009, S * 0.005);
    ctx.fill();
    ctx.fillStyle = rgba(paper, 0.2);
    rr(ctx, x + S * 0.052, oy + S * 0.006, cw * 0.32, S * 0.009, S * 0.005);
    ctx.fill();
  }

  // capability grid 2×2
  const colW = (S - M * 2 - S * 0.04) / 2;
  const itemSize = Math.min(...face.items.slice(0, 4).map((it) => fitText(ctx, it, 600, S * 0.044, f.sans, colW)));
  face.items.slice(0, 4).forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * (colW + S * 0.04);
    const y = S * 0.69 + row * S * 0.118;
    ctx.fillStyle = rgba(paper, 0.16);
    ctx.fillRect(x, y, colW, Math.max(1, S * 0.0013));
    setFont(ctx, 500, S * 0.021, f.mono);
    ctx.fillStyle = accent;
    ctx.fillText(`0${i + 1}`, x, y + S * 0.038);
    ctx.fillStyle = paper;
    setFont(ctx, 600, itemSize, f.sans);
    ctx.fillText(item, x, y + S * 0.095);
  });

  frame(p, 1, face.eyebrow);
}

/* -------------------------------------------------------- face: expertise */

function paintExpertise(p: Paint, face: CubeFace) {
  const { ctx, S, M, cfg, f } = p;
  const { accent, paper, ink, grey } = cfg.palette;
  base(p);
  headline(p, face.headline ?? '', S * 0.13);

  // layered translucent panels
  const panels = [
    { x: S * 0.1, y: S * 0.35, w: S * 0.5, h: S * 0.2, rot: -0.07, lime: false },
    { x: S * 0.36, y: S * 0.33, w: S * 0.52, h: S * 0.22, rot: 0.045, lime: false },
    { x: S * 0.24, y: S * 0.39, w: S * 0.46, h: S * 0.17, rot: -0.015, lime: true },
  ];
  const code = [
    ['POST /webhooks/booking', '→ 200'],
    ["graph.add_node('qualify')", ''],
    ['await crm.contacts.upsert(lead)', ''],
    ['on: form.submitted', '→ agent'],
  ];
  panels.forEach((pn, i) => {
    ctx.save();
    ctx.translate(pn.x + pn.w / 2, pn.y + pn.h / 2);
    ctx.rotate(pn.rot);
    ctx.translate(-pn.w / 2, -pn.h / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    rr(ctx, S * 0.012, S * 0.016, pn.w, pn.h, S * 0.02);
    ctx.fill();
    ctx.fillStyle = pn.lime ? rgba(accent, 0.07) : 'rgba(255,255,255,0.045)';
    rr(ctx, 0, 0, pn.w, pn.h, S * 0.02);
    ctx.fill();
    ctx.strokeStyle = pn.lime ? rgba(accent, 0.6) : rgba(paper, 0.14);
    ctx.lineWidth = S * 0.0018;
    ctx.stroke();
    // window dots
    [0, 1, 2].forEach((k) => {
      ctx.fillStyle = k === 0 && pn.lime ? accent : rgba(paper, 0.22);
      ctx.beginPath();
      ctx.arc(S * 0.03 + k * S * 0.022, S * 0.03, S * 0.0065, 0, TAU);
      ctx.fill();
    });
    setFont(ctx, 400, S * 0.0185, f.mono);
    const lines = pn.lime ? code : code.slice(i, i + 2).concat(code.slice(0, i));
    lines.slice(0, pn.lime ? 4 : 3).forEach(([a, b], li) => {
      const ly = S * 0.07 + li * S * 0.03;
      ctx.fillStyle = pn.lime ? rgba(paper, 0.72) : rgba(grey, 0.55);
      ctx.fillText(a, S * 0.03, ly);
      if (b) {
        ctx.fillStyle = pn.lime ? accent : rgba(grey, 0.55);
        ctx.fillText(b, S * 0.03 + ctx.measureText(a + '  ').width, ly);
      }
    });
    ctx.restore();
  });

  // architectural connectors
  ctx.strokeStyle = rgba(paper, 0.14);
  ctx.lineWidth = S * 0.0018;
  ctx.setLineDash([S * 0.008, S * 0.008]);
  ctx.beginPath();
  ctx.moveTo(M, S * 0.6);
  ctx.lineTo(S - M, S * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);

  // technology chips, bottom-aligned
  setFont(ctx, 500, S * 0.033, f.sans);
  const padX = S * 0.028;
  const ch = S * 0.068;
  const gap = S * 0.016;
  const rows: { t: string; w: number }[][] = [[]];
  let rowW = 0;
  for (const t of face.items) {
    const w = ctx.measureText(t).width + padX * 2;
    if (rowW + w > S - M * 2 && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push({ t, w });
    rowW += w + gap;
  }
  const startY = S * 0.925 - rows.length * (ch + gap) + gap;
  rows.forEach((row, ri) => {
    let x = M;
    const y = startY + ri * (ch + gap);
    for (const { t, w } of row) {
      const hi = t === face.items[face.items.length - 1];
      ctx.fillStyle = hi ? accent : 'rgba(255,255,255,0.04)';
      rr(ctx, x, y, w, ch, ch / 2);
      ctx.fill();
      if (!hi) {
        ctx.strokeStyle = rgba(paper, 0.3);
        ctx.lineWidth = S * 0.0018;
        ctx.stroke();
      }
      ctx.fillStyle = hi ? ink : paper;
      ctx.textBaseline = 'middle';
      ctx.fillText(t, x + padX, y + ch / 2 + S * 0.002);
      ctx.textBaseline = 'alphabetic';
      x += w + gap;
    }
  });

  frame(p, 2, face.eyebrow);
}

/* ----------------------------------------------------------- face: impact */

function paintImpact(p: Paint, face: CubeFace) {
  const { ctx, S, M, cfg, f } = p;
  const { accent, paper } = cfg.palette;
  base(p);
  headline(p, face.headline ?? '', S * 0.13);

  // dashboard card
  const x0 = M;
  const y0 = S * 0.33;
  const w = S - M * 2;
  const h = S * 0.27;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, x0 + S * 0.012, y0 + S * 0.016, w, h, S * 0.024);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  rr(ctx, x0, y0, w, h, S * 0.024);
  ctx.fill();
  ctx.strokeStyle = rgba(paper, 0.14);
  ctx.lineWidth = S * 0.0018;
  ctx.stroke();

  // legend placeholders (abstract — no figures)
  ctx.fillStyle = rgba(paper, 0.35);
  rr(ctx, x0 + S * 0.035, y0 + S * 0.035, S * 0.12, S * 0.01, S * 0.005);
  ctx.fill();
  ctx.fillStyle = rgba(paper, 0.15);
  rr(ctx, x0 + S * 0.035, y0 + S * 0.056, S * 0.07, S * 0.01, S * 0.005);
  ctx.fill();

  // bars trending up
  const chartX = x0 + S * 0.035;
  const chartW = w * 0.6;
  const base0 = y0 + h - S * 0.035;
  const n = 8;
  const bw = (chartW / n) * 0.56;
  const heights = [0.22, 0.3, 0.27, 0.4, 0.46, 0.58, 0.7, 0.86];
  heights.forEach((v, i) => {
    const bh = v * (h - S * 0.12);
    const bx = chartX + (i * chartW) / n;
    ctx.fillStyle = i >= n - 2 ? accent : rgba(paper, 0.16 + i * 0.03);
    rr(ctx, bx, base0 - bh, bw, bh, S * 0.006);
    ctx.fill();
  });
  // smooth trend line + area
  const pts = heights.map((v, i) => [chartX + (i * chartW) / n + bw / 2, base0 - v * (h - S * 0.12) - S * 0.03]);
  const trace = () => {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1];
      const [qx, qy] = pts[i];
      ctx.bezierCurveTo((px + qx) / 2, py, (px + qx) / 2, qy, qx, qy);
    }
  };
  const area = ctx.createLinearGradient(0, y0, 0, base0);
  area.addColorStop(0, rgba(accent, 0.22));
  area.addColorStop(1, rgba(accent, 0));
  ctx.beginPath();
  trace();
  ctx.lineTo(pts[pts.length - 1][0], base0);
  ctx.lineTo(pts[0][0], base0);
  ctx.closePath();
  ctx.fillStyle = area;
  ctx.fill();
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = S * 0.004;
  ctx.shadowColor = accent;
  ctx.shadowBlur = S * 0.016;
  ctx.beginPath();
  trace();
  ctx.stroke();
  ctx.restore();
  const last = pts[pts.length - 1];
  ctx.fillStyle = paper;
  ctx.beginPath();
  ctx.arc(last[0], last[1], S * 0.009, 0, TAU);
  ctx.fill();

  // ring gauge
  const gx = x0 + w * 0.82;
  const gy = y0 + h / 2 + S * 0.01;
  const gr = S * 0.075;
  ctx.lineCap = 'round';
  ctx.lineWidth = S * 0.016;
  ctx.strokeStyle = rgba(paper, 0.1);
  ctx.beginPath();
  ctx.arc(gx, gy, gr, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.beginPath();
  ctx.arc(gx, gy, gr, -Math.PI / 2, -Math.PI / 2 + TAU * 0.78);
  ctx.stroke();
  ctx.lineWidth = S * 0.003;
  ctx.strokeStyle = rgba(paper, 0.25);
  ctx.beginPath();
  ctx.arc(gx, gy, gr * 0.62, 0, TAU);
  ctx.stroke();
  // up-right arrow glyph in the gauge
  ctx.strokeStyle = paper;
  ctx.lineWidth = S * 0.005;
  ctx.beginPath();
  const a = gr * 0.25;
  ctx.moveTo(gx - a, gy + a);
  ctx.lineTo(gx + a, gy - a);
  ctx.moveTo(gx - a * 0.2, gy - a);
  ctx.lineTo(gx + a, gy - a);
  ctx.lineTo(gx + a, gy + a * 0.2);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // outcomes list
  const listSize = Math.min(...face.items.slice(0, 4).map((it) => fitText(ctx, it, 600, S * 0.042, f.sans, S - M * 2 - S * 0.08)));
  face.items.slice(0, 4).forEach((item, i) => {
    const y = S * 0.645 + i * S * 0.07;
    ctx.fillStyle = rgba(paper, 0.16);
    ctx.fillRect(M, y, S - M * 2, Math.max(1, S * 0.0013));
    ctx.fillStyle = paper;
    setFont(ctx, 600, listSize, f.sans);
    ctx.textBaseline = 'middle';
    ctx.fillText(item, M, y + S * 0.036);
    ctx.textBaseline = 'alphabetic';
    // up-right arrow drawn as vector (fonts may lack the glyph)
    const ax = S - M - S * 0.012;
    const ay = y + S * 0.036;
    const as = S * 0.013;
    ctx.strokeStyle = accent;
    ctx.lineWidth = S * 0.0042;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax - as, ay + as);
    ctx.lineTo(ax + as, ay - as);
    ctx.moveTo(ax - as * 0.25, ay - as);
    ctx.lineTo(ax + as, ay - as);
    ctx.lineTo(ax + as, ay + as * 0.25);
    ctx.stroke();
    ctx.lineCap = 'butt';
  });

  frame(p, 3, face.eyebrow);
}

/* ----------------------------------------------------------------- caps */

function paintCap(p: Paint) {
  const { ctx, S, cfg, f } = p;
  const { accent, paper } = cfg.palette;
  base(p);
  ctx.strokeStyle = rgba(paper, 0.05);
  ctx.lineWidth = Math.max(1, S * 0.0012);
  for (let i = 1; i < 12; i++) {
    const v = (i / 12) * S;
    ctx.beginPath();
    ctx.moveTo(v, 0);
    ctx.lineTo(v, S);
    ctx.moveTo(0, v);
    ctx.lineTo(S, v);
    ctx.stroke();
  }
  const initials = cfg.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3);
  setFont(ctx, 'italic 400', S * 0.26, f.serif);
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, S / 2, S / 2 + S * 0.01);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.strokeStyle = rgba(accent, 0.3);
  ctx.lineWidth = S * 0.0016;
  rr(ctx, S * 0.032, S * 0.032, S * 0.936, S * 0.936, S * 0.018);
  ctx.stroke();
}

/* ---------------------------------------------------------------- public */

export type FaceCanvases = {
  /** Order matches BoxGeometry material slots: +x, -x, +y, -y, +z, -z */
  slots: HTMLCanvasElement[];
};

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

export async function paintFaces(
  cfg: CubeConfig,
  size: number,
  portrait: HTMLImageElement | HTMLCanvasElement | null,
): Promise<FaceCanvases> {
  const fonts = resolveFonts(cfg);
  await loadFonts(fonts);
  const make = async (fn: (p: Paint) => void) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    fn({ ctx, S: size, M: size * 0.085, cfg, f: fonts });
    await nextFrame(); // spread work over frames; avoids one long task
    return c;
  };
  const [person, build, expertise, impact] = cfg.faces;
  const front = await make((p) => paintPerson(p, person, portrait));
  const right = await make((p) => paintBuild(p, build));
  const back = await make((p) => paintExpertise(p, expertise));
  const left = await make((p) => paintImpact(p, impact));
  const cap = await make(paintCap);
  // rotation order PERSON(+z) → BUILD(+x) → EXPERTISE(-z) → IMPACT(-x)
  return { slots: [right, left, cap, cap, front, back] };
}

/** Exposed for the static (no-WebGL) fallback: a flat render of one face */
export async function paintSingleFace(cfg: CubeConfig, index: number, size: number, portrait: HTMLImageElement | null) {
  const fonts = resolveFonts(cfg);
  await loadFonts(fonts);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const p: Paint = { ctx: c.getContext('2d')!, S: size, M: size * 0.085, cfg, f: fonts };
  const face = cfg.faces[index];
  [() => paintPerson(p, face, portrait), () => paintBuild(p, face), () => paintExpertise(p, face), () => paintImpact(p, face)][index]();
  return c;
}
