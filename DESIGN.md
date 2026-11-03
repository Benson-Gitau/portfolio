# Design

Direction: **soft-wash editorial** (Benson's brief, 2026-11-03). Exact values live in `src/styles/global.css`; `DECISIONS.md` records why. Supersedes the design.webp reference direction.

- **Palettes:** six light palettes (forest default, lime, navy, aubergine, teal, midnight), chosen in Keystatic settings and applied as `data-palette` on `<html>`. Twelve tokens each: ink, btn, btn-text, page, panel, wash, glow, dot, muted, faded, soft, line. Components use tokens only.
- **One strong colour:** `--btn`, on primary buttons. Panel, wash, glow and dot are never text. Status green only on the "Available" dot. Cards and chips are white.
- **Washes:** the only gradients: top (header and hero), middle (process), bottom (final call to action and footer).
- **Type:** Geist for headings (400 for section heads, -0.03em), Inter for body, Geist Mono for small labels and placeholders. Instrument Serif italic only for the hero's "Automation Consultant", section eyebrows, "Jambo!", the logo, quote marks and the giant footer name. `--faded` carries the de-emphasised tail of large headings.
- **Signatures:** large centred name over a cut-out portrait; floating tilted chips; three tilted process cards on a dashed path with a dot marker; an image-only project panel in `--panel`; giant serif name cropped by the page's bottom edge.
- **Motion:** content visible by default; 12px/400ms reveals; portrait rises on load; chips float ±4px; process cards ease halfway straight as the path draws in; work images lift on hover. Reduced motion: none, static tilts kept. Under 760px: no chip tilt, no path.
