---
name: Benson Gitau portfolio
description: A consultant's site that reconciles its promises like a ledger, line by line.
colors:
  bg: "#0b1220"
  bg-light: "#f7f5f0"
  surface: "#111a2e"
  surface-light: "#ffffff"
  glass: "rgba(255, 255, 255, 0.06)"
  glass-light: "rgba(255, 255, 255, 0.65)"
  glass-border: "rgba(255, 255, 255, 0.12)"
  glass-border-light: "rgba(18, 24, 38, 0.1)"
  glass-fallback: "#142038"
  glass-fallback-light: "#ffffff"
  text: "#f5f7fa"
  text-light: "#121826"
  text-muted: "#a7b0c0"
  text-muted-light: "#4b5563"
  accent: "#ff7a1a"
  accent-text: "#ff7a1a"
  accent-text-light: "#c2410c"
  accent-soft: "rgba(255, 122, 26, 0.14)"
  accent-soft-light: "rgba(255, 122, 26, 0.12)"
  on-accent: "#0b1220"
  on-accent-light: "#121826"
  teal-text: "#2dd4bf"
  teal-text-light: "#0f766e"
  line-strong: "#2dd4bf"
  line-strong-light: "#0f766e"
  danger: "#f87171"
  danger-light: "#b91c1c"
  rule: "color-mix(in srgb, #f5f7fa 26%, transparent)"
  rule-light: "color-mix(in srgb, #121826 26%, transparent)"
  border-control: "color-mix(in srgb, #f5f7fa 45%, #0b1220)"
  border-control-light: "color-mix(in srgb, #121826 45%, #f7f5f0)"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2rem, 9.2vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  row-title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 2vw, 1.625rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  figure:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "clamp(3rem, 8vw, 7.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.04em"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
  accent-word:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontWeight: 400
    letterSpacing: "-0.01em"
rounded:
  sm: "12px"
  md: "20px"
  lg: "28px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 2.25vw, 2rem)"
  section: "clamp(5rem, 11vw, 10rem)"
  row: "1.5rem"
  row-compact: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "3.25rem"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    padding: "0 1rem"
    height: "44px"
  filter-chip-pressed:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
  tool-chip:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.625rem"
  notification-card:
    backgroundColor: "{colors.glass-fallback}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  project-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
  service-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "clamp(1.25rem, 2.2vw, 2rem)"
  result-figure:
    textColor: "{colors.accent-text}"
    typography: "{typography.figure}"
---

# Design System: Benson Gitau portfolio

## Overview

**Creative North Star: "The Reconciliation"**

The site works the way a bank clerk closes a ledger. Promises sit on ruled rows; each one earns a teal tick; open items stay visibly open, marked by a dashed circle. It refuses the gradient hero with a floating dashboard, and with it the look of a generic AI agency. Belief comes from the working being on show: demos carry a label, results carry a figure, and missing proof stays missing.

The ground is flat and dark by default, with a complete warm-paper light theme chosen by a toggle, a saved choice or the system setting. On that ground only a few things float: the nav, the video frame, the notification cards, the booking frame and modals. Rows are generous and hairline-ruled rather than boxed, section bands alternate between page and surface colour, and large Geist headlines do the persuading.

Colours and fonts are fixed by `docs/build-spec.md`. Layout, surfaces and motion are the approved direction, with stacked notification cards fused into the ledger. Motion carries one idea: things close. Ticks draw, rows arrive, sheets square up. The signature is a tick drawn at the end of a ruled row.

**Key Characteristics:**
- Ruled rows with an end-of-line tick, in place of boxed feature cards
- Geist Mono for figures, tool chips and truth labels
- Orange reserved for what to press and which number to read
- Flat ground, with depth only on the floating few
- One decorative Three.js ledger stack, with a static drawing as its equal fallback

## Colors

A navy-ink ground with paper-white text, one hot orange signal and one teal confirmation; every role has a separately tuned value for each theme, and the `-light` token keys hold the light theme.

### Primary
- **Signal Orange** (#ff7a1a): the fill for primary buttons, the video play button and text selection, in both themes. Text on it uses On-Accent Ink, never white.
- **Signal Orange Text** (#ff7a1a dark, #c2410c light): result figures, client-card results and service prices. The light value exists because the fill colour fails as text on paper.
- **Orange Wash** (`accent-soft`): only the hover tint behind desktop nav links.
- **On-Accent Ink** (#0b1220 dark, #121826 light): text and icons on orange.

### Secondary
- **Reconciled Teal** (`teal-text`, #2dd4bf dark, #0f766e light): ticks, "Demo" and demo-build labels, med spa offer numerals and FAQ chevrons.
- **Ledger Line** (`line-strong`, #2dd4bf dark, #0f766e light): essential lines that carry meaning, such as the process connector, the outcome top rules and the edges of the ledger stack.

### Tertiary
- **Open Item Red** (#f87171 dark, #b91c1c light): the dashed open mark on unreconciled leaks, and the dashed outline of development-only placeholder marks. Never a fill.

### Neutral
- **Navy Ink / Warm Paper** (`bg`): the page ground.
- **Raised Navy / White** (`surface`): alternating section bands, resting cards, tactile controls and the ledger stack's sheets.
- **Glass and Glass Fallback** (`glass`, `glass-border`, `glass-fallback`): floating surfaces. The fallback is the solid fill wherever blur is unsupported or reduced transparency is requested, and also the base of the notification cards, the scrolled nav and the booking modal.
- **Paper White / Ink** (`text`) and **Slate** (`text-muted`): primary and supporting text.
- **Hairline** (`rule`): text colour at 26%, for the rules between rows. Decorative only.
- **Control Edge** (`border-control`): text colour at 45% over the ground, the border that carries state on tactile controls.

### Named Rules

**The Press-or-Read Rule.** Orange marks what to press and which number to read: actions and key numbers. "Client project" labels, closing lines and lead cards stay neutral, as the finish review settled. The build carries one display exception, the Instrument Serif accent word in page-level H1s; it does not extend to H2 accent words, which take the text colour, or to anything else.

**The Tick Means Closed Rule.** A teal tick asserts that something is reconciled, and the dashed red circle says it is not. Do not use a tick as a generic bullet on an unresolved item.

**The Line-Strength Rule.** A line that carries meaning uses Ledger Line, whose light value reaches 3:1 on paper where the spec's `--teal` reaches only 2.28:1. Hairlines may only separate.

## Typography

**Display Font:** Geist 500/600 (with system-ui, sans-serif)
**Body Font:** Inter 400/500 (with system-ui, sans-serif)
**Label/Mono Font:** Geist Mono 400/500 (with ui-monospace, monospace)
**Accent Font:** Instrument Serif italic 400 (with Georgia, serif)

**Character:** Tight, confident Geist does the talking, and Inter stays out of its way. Geist Mono is the ledger's own voice, for anything counted or labelled, and a single Instrument Serif word adds the human note. Fonts are self-hosted through the Fontsource provider, in these weights only.

### Hierarchy
- **Display** (600, `clamp(2rem, 9.2vw, 5.25rem)` on phones, `clamp(3rem, 4.75vw, 5.5rem)` from 1024px, line-height 1, -0.035em): the home H1, set as ruled rows. The med spa H1 runs larger, up to 6.25rem, as a plain headline.
- **Headline** (600, `clamp(2rem, 4.6vw, 4rem)`, 1.04, -0.03em): section headings.
- **Title** (600, about 1.25 to 1.75rem, 1.1, -0.015 to -0.02em): H3s on rows, cards and steps. The lead service cell rises to 3rem.
- **Row Title** (500, `clamp(1.125rem, 2vw, 1.625rem)`, 1.25): diagram steps, result labels and FAQ questions.
- **Body** (Inter 400, 1rem, 1.6, paragraphs capped at 70ch with pretty wrapping): lead paragraphs step up to 1.0625 or 1.125rem.
- **Figure** (Geist Mono 500, `clamp(3rem, 8vw, 7.5rem)`, 1, -0.04em): result values on case studies, in Signal Orange Text. Client-card results use the same face at up to 1.5rem.
- **Label** (Geist Mono 500, 0.8125rem, sentence case, no added tracking): "Demo" and type labels, and chips at weight 400.
- **Accent Word** (Instrument Serif italic 400, -0.01em): one word per major headline, 1.08em in the home H1.

### Named Rules

**The Counted-Things Rule.** If it is a result, a step number, a tool name, a price, a duration or a "Demo" label, it is in Geist Mono. Prose and headings never are.

**The One Word Rule.** A major headline gets one Instrument Serif accent word, chosen in content with `*word*` or `accentWord`, and it does not wrap in an H2.

## Layout

The container caps at 96rem with a fluid gutter, and sections breathe with a fluid vertical step. Layout is mostly asymmetric two-column grids: 7fr/4fr for the hero and work header, 5fr/7fr for the problem rows, 5fr/6fr for the final call to action. From 1024px, the left heading column of the problem section and the left copy of the final section stay sticky at 6rem.

Phones come first, with breakpoints at 768px, 1024px, 1280px and 1440px. Work cards run in alternating 7 and 5 spans on a 12-column grid so they never read as a template strip; services form a 6-column bento with a four-span lead cell; process turns from a vertical line into five horizontal columns.

The hero reorders on phones to headline, actions, video, cards, subline and trust line, keeping action and video on the first screen. Notification cards stack under the video below 1280px and float over its left edge from there, clear of the face and play button. Every interactive target is at least 44px tall, and primary buttons are 3.25rem.

## Elevation & Depth

A hybrid: flat ground with tonal section bands, plus a small, named set of floating and tactile surfaces. Resting cards and service cells carry a border and no shadow; project cards lift 4px on hover only where a fine pointer exists. The spec's `--glow-a` and `--glow-b` tokens are defined in the stylesheet, but the shipped pages paint no glow.

### Shadow Vocabulary
- **Soft float** (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25)`): glass surfaces, which are the video frame, notification cards, booking frame and modal, and the mobile menu panel.
- **Nav float** (`box-shadow: 0 6px 20px rgb(0 0 0 / 0.14)`): the pill nav bar only.
- **Tactile, dark** (`box-shadow: 0 2px 6px rgb(0 0 0 / 0.28), inset 0 1px 0 rgb(255 255 255 / 0.08)`): secondary buttons, filter chips and the modal close button.
- **Tactile, light** (`box-shadow: 0 2px 5px rgb(18 24 38 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.9)`): the same controls in the light theme.
- **Play lift** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.3)`): the play button over a photo.

### Named Rules

**The Floating Few Rule.** Only the nav, the video frame, notification cards, the booking frame and modals float. Reading content sits on the flat ground.

**The Solid Reading Rule.** Glass blurs at 18px only where the browser supports it and the visitor allows transparency; otherwise it is solid. Surfaces that hold reading go near-solid: notification cards at 94% over the photo, the modal solid, and the nav solid once scrolled.

**The Border Carries State Rule.** On a tactile control the border and fill carry the state, and the shadow only adds feel. A pressed filter inverts its fill and drops its shadow.

## Shapes

Soft and consistent: 28px for large frames and project cards, 20px for inner frames, service cells and notification cards, and full pills for every control and chip. The 12px step appears only on the skip link. Frames nest deliberately, with a 28px outer frame, 0.5rem of padding and a 20px image inside. Against those curves, ledger rows stay straight, 1px hairlines. The tick is a 2.5-weight rounded stroke on a 24-unit grid, and the open mark is a dashed 2-weight circle.

## Components

### Buttons
Pill-shaped, tactile and short on ceremony.
- **Shape:** full pill (999px), 3.25rem tall, 44px in the nav.
- **Primary:** Signal Orange fill with On-Accent Ink text in Geist 600. Used for the one action, booking a call, and every instance opens the same modal.
- **Secondary:** surface fill, Control Edge border, tactile shadow, Geist 500.
- **Hover / Focus:** press scales to 0.97 in 160ms. The focus ring is shared: a 2px text-colour outline at 2px offset, backed by a 5px ground-colour halo, so it holds on any surface.

### Chips
- **Tool chip:** a transparent pill with a hairline border in Geist Mono 0.8125rem. Static information.
- **Filter chip:** a 44px Geist 500 pill with a tactile shadow. Pressed inverts to text colour on ground colour with no shadow, and `aria-pressed` carries the state.

### Cards / Containers
- **Corner Style:** 28px on project cards, 20px on service cells.
- **Background:** surface fill, on flat ground.
- **Shadow Strategy:** none at rest, per The Floating Few Rule.
- **Border:** 1px `glass-border`.
- **Internal Padding:** 0.75rem on project cards with 0.5rem inset text; `clamp(1.25rem, 2.2vw, 2rem)` on service cells.
- **Coverless projects:** a project with no cover shows its first three steps as a small ticked ledger, rather than a stand-in image.

### Inputs / Fields
The site has no native form fields. Booking is a third-party calendar embed on a white plate at 20px radius, set inside a glass frame or the native-dialog modal.

### Navigation
A sticky glass pill with the name in Geist 600 and links in Geist 500 at 0.9375rem. Desktop links take the Orange Wash on hover. The bar turns solid after 80px of scrolling. Below 768px the links move to a solid panel behind a 44px menu button. The med spa page uses a minimal version: logo and Book a call only, with no toggle.

### Ledger Row
The system's signature. A flex or grid row with 1px hairlines, generous block padding (1 to 1.5rem) and a mark. In the home H1 each sentence is a row with its tick at the right edge, sized at 0.55em. Problem rows lead with an open mark; system diagrams are a real ordered list with a mono step number, a title and an end tick, and text is never hidden while ticks draw. Result rows put an orange mono figure opposite its Geist label. Ticks draw by stroke offset over 560ms, in order: at 300, 560 and 820ms in the hero, and 160ms apart in diagrams. With reduced motion, or without JavaScript, every tick is simply there.

### Notification Card
A glass-class card at 94% `glass-fallback`, 20px radius, Geist 500 text, led by a teal Geist Mono "Demo" label. Cards arrive after the ticks, from 900ms and 260ms apart, rising 16px from 0.97 scale over 560ms.

### Video Frame
A click-to-play facade: a glass frame at 28px holding a 20px poster, an orange 4rem play pill at bottom left and a mono duration pill at bottom right. The duration pill stays dark in both themes because it sits on the photo. The poster zooms by 3% on fine-pointer hover when motion is allowed.

### Process Line
Numbered Geist Mono circles on a 2px Ledger Line connector, which grows as each step arrives. The numbers are real information, because the steps run in that order.

### Ledger Stack (3D accent)
Six low-poly ledger sheets that start loose and square up one at a time from the bottom, 170ms apart over 800ms each, then hold with a slow sway. It sits under the copy beside the booking frame in the final call to action, on the home and med spa pages, at 4:3 and up to 16rem wide (24rem from 1024px). Its colours are read from the live tokens and it re-themes with the toggle. It is decorative: `aria-hidden`, no pointer events, nothing essential inside.

- **Static SVG first:** an inline drawing of the same stack is in the page and stays there. The canvas fades in over it without moving anything, once its first frame has rendered.
- **SVG stays, and Three.js is never requested, when:** the viewport is under 768px; the device reports 4 or fewer CPU cores; it reports 4GB or less memory; Save-Data is on; or reduced motion is requested. These checks run once, at page load.
- **Failed WebGL:** any failure to import or mount leaves the drawing in place, silently.
- **Loading and running:** Three.js is a separate chunk imported only within 200px of view, never in first load. Pixel ratio is capped at 2, the renderer requests low power, and the loop pauses off-screen and in a hidden tab.

### Motion
Tokens are 160ms (micro), 280ms (UI) and 560ms (reveal), on `cubic-bezier(0.22, 1, 0.36, 1)` for entrances; the names of the spec's two easing tokens are deliberately swapped, per `DECISIONS.md`. Content below the fold rises 20px (12px on phones) with a 70ms stagger (40ms on phones), hidden only by the running script. Everything uses CSS plus one IntersectionObserver script, with no motion library. Reduced motion collapses all of it to effectively instant.

### Imagery and Raster Provenance
Photography is Benson only, and the site has no stock or generated imagery. Shipping rasters:

- `src/assets/content/defaultShareImage/image.png`: a 1200x630 browser screenshot composed from the site's own fonts and tokens plus Benson's supplied portrait. It is the default share image, used until a page has its own cover.
- `src/assets/photos/**`: Benson's supplied photos. `hero/introVideo/poster/image.png` is the video poster and `about/photo/image.png` is the About portrait, both 2048x2048.

Any new shipping raster gets a provenance line here.

## Do's and Don'ts

### Do:
- **Do** close things visibly: a ruled row and a teal tick for what is reconciled, a dashed open mark in Open Item Red for what is not.
- **Do** set every result, step number, tool chip, price and "Demo" label in Geist Mono.
- **Do** keep orange to actions and key numbers, and use On-Accent Ink on it (#0b1220 dark, #121826 light).
- **Do** use Ledger Line (#2dd4bf dark, #0f766e light) for lines that carry meaning, and Hairline only to separate.
- **Do** give every tactile control a border or fill change that carries its state, and a 44px minimum target.
- **Do** make every animated element whole without motion: the static state is the finished state.
- **Do** show the static SVG for the ledger stack under 768px, on 4 or fewer cores, on 4GB or less memory, with Save-Data, with reduced motion and when WebGL fails.
- **Do** label demo work "Demo" or "Demo build" in teal mono wherever it appears.

### Don't:
- **Don't** build a gradient hero with a floating dashboard, robot imagery or anything that reads as a generic AI agency.
- **Don't** spread orange to labels, closing lines, section backgrounds or lead cards, or put white text on it.
- **Don't** add shadows to reading content or resting cards; only the floating few and the tactile controls have them.
- **Don't** make state depend on a soft shadow alone.
- **Don't** put text, navigation or anything essential in the 3D canvas, or let it cover text, the video or the call to action.
- **Don't** load Three.js in any page's first load.
- **Don't** add parallax or scroll-linked motion; reveals and drawing ticks carry the idea.
- **Don't** add colours or fonts beyond the spec's tokens and the derived roles recorded in `DECISIONS.md`.
