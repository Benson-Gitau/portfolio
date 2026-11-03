# Design

Direction: the reference in `design.webp`, in the spec's colours and fonts. Exact token values live in `src/styles/global.css`; `DECISIONS.md` records why.

- **Ground:** flat navy `#0B1220` or paper `#F7F5F0`. No gradients anywhere, including image fades.
- **Accent:** orange `#FF7A1A` for primary buttons, the showcase panel, the lead service card, accent words and key numbers. Teal for Demo labels, ticks and connector lines.
- **Type:** Geist 500 for tight, centred headlines; Inter for body; Instrument Serif italic for one accent word per headline, the "/ Section" labels, the nav name and the giant footer name; Geist Mono for figures and chips.
- **Surfaces:** `.soft-card`, a large-radius lifted card, is the one card style. Glass is kept for the nav, hero badge and floating cards, with solid fallbacks.
- **Signatures:** cut-out monochrome portrait under the headline; tilted numbered process cards joined by looping lines; floating industry tags around the problem statement; full-width footer wordmark.
- **Motion:** hero cards arrive in sequence; sections reveal once on scroll; everything is static with reduced motion.
- **Imagery:** portraits are Benson's supplied photos with the backdrop keyed out. The default share image is a screenshot composed from the site's type and his portrait. Project covers are still placeholders.
