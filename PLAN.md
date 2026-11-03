# Plan: soft-wash editorial homepage

Source: Benson's "New design direction for the homepage: soft-wash editorial" brief (2026-11-03). It supersedes the "Reference direction (design.webp)" redesign and the colour tokens in `docs/build-spec.md`. Finished steps are logged in PROGRESS.md and judgement calls in DECISIONS.md.

Skills: impeccable, design-taste-frontend and emil-design-eng for visual and motion work. Check Astro, Tailwind v4 and Keystatic docs through Context7 before using any API I'm unsure of.

## Step 0: Baseline
- [ ] Checkpoint the uncommitted design.webp redesign (29 files) so this work diffs cleanly. Needs Benson's OK.
- [ ] Update the Design tokens section of `docs/build-spec.md` to point at this brief, so the two documents agree.

## Step 1: Tokens, palettes and washes
- [ ] Replace the dark/light tokens in `global.css` with the 12 palette tokens × 6 palettes, keyed on `html[data-palette]`. Default is `forest`.
- [ ] Add fixed tokens: `--card: #fff`, `--status: #2F9E52`, `--shadow-soft`, plus washes built with `color-mix()`. These are the only gradients on the site.
- [ ] Map the tokens to Tailwind `@theme inline` names. Alias the old names (`--bg`, `--text`, `--accent`…) so the case study pages, /med-spas and 404 keep rendering until they're restyled.
- [ ] Add a `palette` select to the Keystatic `settings` singleton and render it as `data-palette` on `<html>`.
- [ ] Remove dark mode and the theme toggle (the palettes are light only; see the open question).
- [ ] Grep for hard-coded colours in components and replace each one with a token.

## Step 2: Type and layout primitives
- [ ] Type roles: Geist headings, Inter body, Geist Mono labels. Instrument Serif italic only in the hero title line, section eyebrows, "Jambo!", the footer name, the header logo and quote marks.
- [ ] `SectionHead` component: serif eyebrow at 18px in --muted, then a Geist 400 heading with -0.03em tracking at `clamp(34px,4vw,52px)`, centred. An optional faded tail renders in --faded, never in serif.
- [ ] Container: 1240px max width, 32px padding (20px on mobile). Button styles: --btn primary pill and white-with-line secondary, both at least 44px.
- [ ] `Chip` component: white pill, soft shadow, 10px --dot dot. `Placeholder` restyled: Geist Mono label on a white-70% or --soft tile, visible in dev and hidden in production.

## Step 3: Content model (Keystatic + seed content)
- [ ] `home` singleton: rebuild around the new sections: hero (title lines, `heroPortrait`, available pill, audience line, statement, buttons), tool row, jambo (statement, faded tail, chips), process, work, reviews, about (`introVideoId`, `introPoster`, `introDuration`, `introTranscript` as rich text, `bio`, `timeline`), final CTA, footer links.
- [ ] Drop the unused home fields: problem, outcomes, services, heroCards and filters.
- [ ] `projects`: add `panelImage` and `panelOrder`. Set up the four home projects (see the open question on project entries).
- [ ] `testimonials`: `type`, `quote`, `pullQuote`, `videoId`, `poster`, `duration`, `orientation`, `role`, `practiceType`, `source`, `anonymous`, `photo`, `featured`, `order`. Keep `permissionToPublish` as a hard gate.
- [ ] `skills`: add Vagaro. Set the tool row order to GoHighLevel · n8n · Zapier · Mindbody · Vagaro · Retell AI · Twilio.
- [ ] Copy the brief's text into `home.yaml` exactly. `[Years]` for Equity Bank stays a placeholder.
- [ ] Add dev-only seed reviews (marked placeholders) so the layout can be built. Production never renders them.

## Step 4: Header and hero
- [ ] Header on the top wash: serif logo, centred nav (Work, Process, Reviews, About; Reviews hidden when there are no reviews), "Book a call" pill. A light sticky treatment at most, plus a mobile menu.
- [ ] Hero: two-line centred title overlapping the cutout portrait (420px max, 4:5), with a 3-column bottom-aligned row (available pill and audience line | portrait | statement and two buttons). No video. "Watch intro" scrolls to #about and is hidden when `introVideoId` is empty.
- [ ] Mobile: stacked title, 280px portrait, the pill floating over the portrait's left edge, then text and full-width buttons.

## Step 5: Tool row and project panel
- [ ] Tool row: Geist 600 18px --muted with --line rules above and below. One centred wrapped line on mobile.
- [ ] Project panel: --panel block, 28px radius and padding, a 3-column grid (large | two stacked | large) of images only. Mono-labelled white-70% placeholders. On mobile, 2 columns with the first image spanning both.

## Step 6: Jambo and Process
- [ ] Jambo: serif "Jambo!", centred statement with its --faded tail, and floating tilted chips (alternate chips offset 18px).
- [ ] Process on the middle wash: three tilted white cards (offsets as specified), and a dashed SVG curve through them with a --dot marker. Cards stack on mobile with ±1.5° tilt and no curve.

## Step 7: Selected Work and Reviews
- [ ] Work: 2×2 grid of link cards (--soft frame, 4:3 cover or a dashed placeholder, title and 1–2 tool tags). One column on mobile. Case study pages keep the "Demo build" label.
- [ ] Reviews: 3-column masonry (CSS columns) of video, text and pull-quote cards in `order`. Video loads on click only from youtube-nocookie, never autoplays, and has the specified aria-label. `anonymous` hides name and photo. An empty collection hides the section and its nav link.

## Step 8: About, final CTA and footer
- [ ] About: 2-column layout with the intro video (16:9 click-to-load, --panel play button, "1:30 · CC" badge, `cc_load_policy=1`), name and social row (44px targets), transcript disclosure, bio and the `<dl>` timeline. The no-video fallback shows the poster without a play button.
- [ ] Final CTA on the bottom wash, opening the existing GHL modal.
- [ ] Footer: links on the left, © on the right, and a giant aria-hidden serif name cropped by the bottom edge, with no horizontal overflow.

## Step 9: Motion
- [ ] Content stays visible by default. The reveal is a rise of 12px or less plus a fade over about 400ms, applied only to content entering the viewport, and only when JS has run. No blank gaps.
- [ ] Load-in portrait rise. Chip float of ±4px, staggered. Process cards ease about halfway to straight on scroll while the path draws in. Work images lift 6px and scale to 1.02 on hover.
- [ ] Reduced motion turns off all animation but keeps the static tilts. Below 760px: no chip tilt and no path.

## Step 10: Remove the old homepage
- [ ] Delete Showcase, Leaks, Services, Tick and the checkmark lists and coloured status icons, then sweep the homepage for leftover accent colours and extra serif italics.

## Step 11: Checks
- [ ] Measure WCAG AA contrast in all 6 palettes (scripted). Check 44px targets, focus rings, aria-labels, no horizontal scroll at 390px, `astro build` and the production placeholder warnings.
- [ ] Screenshot every section at 1440px and 390px in forest, plus one full page per other palette (Playwright). Compare each against the brief and fix every difference or log it in DECISIONS.md.
- [ ] Show Benson the screenshots. **Stop before /med-spas.**

## Contrast pre-check (from the brief's hex values)
All pairs pass AA except:
- `--muted` on `--panel` in **midnight** is 3.29:1. Captions on pull-quote cards will use `--ink` in every palette.
- `--faded` on `--page` is 3.13–3.41:1, which passes only as large text. The brief already limits it to 24px and up.
- `--dot` on white is 2.2:1 in lime, navy and midnight. Dots and quote marks are decorative, so no text contrast applies.
- Status green on white is 3.42:1, which passes for a non-text dot.
