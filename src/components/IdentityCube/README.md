# Identity Cube: hero centrepiece for bensongitau.dev

A real Three.js cube (rounded geometry, physical materials, studio environment lighting, lime rim glow, contact shadow) with four canvas-painted faces: **Person → Builder → Expertise → Impact**.

## Files

```
src/components/IdentityCube/
  IdentityCube.astro   ← drop-in component (poster, controls, screen-reader content)
  config.ts            ← ALL copy, links, colours, timing, angle — edit here
  faceArt.ts           ← how each face is painted (canvas 2D → texture)
  scene.ts             ← Three.js scene, rotation, drag, click-to-face
  mount.ts             ← lazy loading, WebGL detection, flat fallback, a11y wiring
  identity-cube.css
src/components/HeroCentered.astro ← reference layout (hard-coded copy) — not used
src/components/HeroSplit.astro    ← alternative: copy left, cube right — not used
```

**On bensongitau.dev** the live hero is `src/components/home/Hero.astro`: HeroCentered's layout merged into the
existing hero, so copy, CTAs and the portrait still come from Keystatic (`home.hero`, `heroPortrait`).

## Install

```bash
npm i three
```

That is the only new dependency. three.js loads **after** the page is idle and the cube is on screen, in its own chunk, so it doesn't count against first paint or LCP.

## Use

1. Use a transparent-background cut-out portrait, **≥1200px**. The site uses the Keystatic hero portrait at `src/assets/photos/hero/heroPortrait/image.png` (1211×1299).
2. Swap `HeroCentered.astro` in for the current hero (or `HeroSplit.astro` for the two-column version), **or** keep your hero markup and just add:

```astro
---
import IdentityCube from '../components/IdentityCube/IdentityCube.astro';
import portrait from '../assets/photos/hero/heroPortrait/image.png';
---
<IdentityCube portrait={portrait} />
```

3. Override anything per use:

```astro
<IdentityCube
  portrait={portrait}
  config={{
    role: 'AUTOMATION CONSULTANT',
    timing: { perFace: 7, linger: 0.8, turn: 1.8, resumeAfterInteraction: 8 },
    angle: { yaw: -20, pitch: 8 },
  }}
/>
```

## Colours

The cube follows the site's `data-palette`. `identity-cube.css` uses `--ink` / `--panel` for the poster and
controls, and `mount.ts` reads `--ink`, `--panel`, `--page` and `--faded` from the page when it paints the faces.
`config.ts` → `palette` holds lime fallbacks for when a token is missing. Passing `config.palette` explicitly pins
the cube to those colours instead.

## Auto-rotation

Continuous, never a dead stop. A phase advances at `1 / timing.perFace` quarter-turns per second and is warped so
the cube slows right down as each face comes to the front, then speeds up between faces:

```
speed(x) = 1 − linger · cos(2πx)       x = position within the quarter-turn, 0 = face in front
```

| Setting | Default | Meaning |
|---|---|---|
| `timing.perFace` | `6` | Average seconds per quarter-turn |
| `timing.linger` | `0.85` | 0 = constant speed · 0.85 = 15% of average speed at each face, 185% between · capped at 0.95 |
| `timing.turn` | `1.6` | Seconds for a turn the visitor asked for (click, button, arrow key) |
| `timing.resumeAfterInteraction` | `6` | Seconds auto-rotation waits after a click, drag or button press |

After any interaction the phase is re-seeded from the face the cube landed on, and speed ramps back up from zero,
so rotation resumes from there without a jump. The face buttons' `aria-pressed` follows whichever face is in front.

## Centred layout notes

- The cube's stage is taller than the cube (`headroom: 0.6`). The extra transparent space slides up **behind** the headline using a negative margin, so the entrance drops in from behind "AI & Automation Specialist" without being clipped by the stage edge.
- The headline stays on top (`z-index: 2`) and fully readable. At rest the cube sits just below it, because a solid cube can't overlap the type the way the transparent cut-out portrait did.
- Hover, grab and drag only respond over the cube itself, not over the empty headroom.
- Below 960px everything stacks: headline → cube → statement + buttons → chip + services + audience.

## Behaviour

| | |
|---|---|
| Load | Static poster renders instantly (no layout shift) → 3D cube takes over once ready |
| Entrance | Once the cube is ⅓ on screen it's thrown in from above (top-right by default), tumbles like a die, lands with a slight squash, bounces twice, rocks, and settles on the portrait. It rests there for `intro.restBeforeRotate` (2.4s), then eases into rotation. Set with `intro: { from: 'top-right' \| 'top-left' \| 'top' \| 'side', duration, restBeforeRotate }`; `enabled: false` turns it off |
| Auto | Continuous: ~6s per quarter-turn, slowing to ~15% speed as each face arrives, never fully stopping (see above) |
| Hover | Auto-rotation eases to a stop (no freeze), plus a soft parallax tilt and brighter rim glow |
| Drag / swipe | Rotates freely (tilt limited to ±22°), snaps to the nearest face with momentum |
| Click a side face | Turns it to the front |
| Click the front face | Scrolls to its section (`#about`, `#services`, `#process`, `#work`, set in config) |
| Buttons | Keyboard and screen-reader route to every face; ← → keys move between faces |
| Pause button | Required by WCAG 2.2.2 for auto-moving content; hidden when reduced motion is on |
| Reduced motion | No entrance (cube is simply there), no auto-rotation, no float, short turns only on request; render loop sleeps when idle |
| Off-screen / hidden tab | Render loop stops |
| No WebGL / Save-Data | Flat face artwork, switched by the same buttons; three.js is never downloaded |
| Touch | `touch-action: pan-y`, so vertical swipes still scroll the page (and don't disturb the rotation) |
| Keyboard focus | Auto-rotation eases to a stop while focus is inside the cube's controls |

Textures are 2048px on desktop/retina and 1024px on small screens. Pixel ratio is capped at 2.
