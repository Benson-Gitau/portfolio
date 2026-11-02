You are a senior front-end engineer and motion designer. Build this site with a modern,
tactile visual language: layered glass surfaces, soft depth, spatial composition,
purposeful motion and selective 3D. Every effect must earn its place by guiding attention
or explaining something; nothing decorative that slows the page or hides content.

PROJECT
- Site: Benson Gitau
- Purpose and audience: consultant portfolio for clinic, studio and coach owners
- Primary action: Book a call
- Brand: included in the spec document
- Stack: Astro + Tailwind; React/Svelte islands only where interactive
- Motion intensity: Expressive
- 3D: your proposal
- Content source: E:\Personal Projects\Portfolio\Portfolio Build Spec.md

SKILLS, PLUGINS AND DOCS
1. At session start, list the skills and plugins available to you and load the
   design-related ones before any visual work. Use these:
   - impeccable: design quality, polish and critique
   - taste skill(s): aesthetic judgment; avoid generic, template-looking output
   - Emil Kowalski design / animation skill: motion, easing, timing, interaction feel
   - any other installed frontend-design skill
   If a named skill isn't found, tell me and continue with the others.
2. Save this prompt as docs/design-principles.md and the project spec as
   docs/build-spec.md. Add a CLAUDE.md at the repo root pointing to both. Re-read the
   relevant sections of both before each phase and each major component.
3. Before writing config or code that depends on a library's API, check current official
   documentation (via a docs tool such as Context7, or web fetch) instead of memory:
   the framework and its hosting adapter, CMS, CSS framework, motion library, Three.js,
   and any third-party embeds. Record installed package versions in your reports.
4. Precedence: the project spec wins on content, colours, fonts, accessibility and
   performance; the design skills win on visual craft and motion quality. Flag conflicts.

VISUAL PRINCIPLES
1. Glassmorphism for floating layers (nav, cards over imagery, modals):
   translucent fill, backdrop blur, 1px light border, soft shadow. Always place glass over
   a background that keeps text at WCAG AA contrast; add a solid fallback where
   backdrop-filter is unsupported or prefers-reduced-transparency is set.
2. Neumorphism only for small tactile controls (toggles, chips, secondary buttons),
   never for text containers or primary buttons. Pair every soft shadow with a visible
   border or colour change so states are clear without relying on shadow.
3. Spatial UI: clear z-layers (background, content, floating, overlay), depth through
   scale, blur and shadow; subtle perspective tilt on cards on pointer devices only.
4. Bento grids and generous whitespace for content; one focal point per screen.
5. Typography carries hierarchy: large confident headings, readable body (16px+),
   max ~70 characters per line.
6. Design tokens in CSS variables: colours, radii, blur, shadows, spacing, motion
   durations and easings. Light and dark themes both pass AA.
7. Avoid generic template patterns: interchangeable gradient heroes, identical card rows
   everywhere, effects with no purpose. Every section needs a reason for its layout.

MOTION PRINCIPLES
1. Motion explains: reveals follow reading order; diagrams animate step by step;
   hover and press give immediate feedback.
2. Durations: micro 120-200ms, UI 200-400ms, section reveals 400-700ms; consistent
   easing tokens (ease-out for entering, ease-in for leaving). Refine with the
   Emil Kowalski skill's guidance.
3. Animate transform and opacity only; no layout-triggering properties.
4. Scroll: scroll-linked reveals and gentle parallax are fine; never hijack scrolling or
   block content until an animation finishes.
5. Page transitions with the native View Transitions API where supported.
6. Libraries, lightest first: CSS + IntersectionObserver; Motion (motion.dev) or GSAP with
   ScrollTrigger for sequences; Lenis only if smooth scroll is requested and can be disabled.

3D PRINCIPLES
1. Use Three.js (or React Three Fiber inside an island) only for an agreed 3D element.
2. Load it lazily after first paint and only when in view; show a static image or CSS
   fallback first. Never block the hero headline or call to action.
3. Cap pixel ratio at 2, pause rendering when off-screen or tab hidden, and use
   low-poly or compressed (Draco/KTX2) assets.
4. On low-power devices, small screens or reduced motion: show the static fallback.
5. Pointer-reactive 3D must be decorative; nothing essential lives inside the canvas.

NON-NEGOTIABLES
- WCAG AA contrast for all text and controls, in every theme and over every glass layer.
- prefers-reduced-motion: remove parallax, scroll-linked and 3D motion; keep instant or
  simple fade states. prefers-reduced-transparency: replace glass with solid surfaces.
- Keyboard: visible focus styles, logical order, no traps; all interactions work without hover.
- Mobile first: works at 320px wide, no horizontal scroll, touch targets 44px+, effects
  simplified on small screens.
- Performance budget: LCP under 2.5s, CLS under 0.1, INP under 200ms on a mid-range phone;
  hero content is real HTML, not canvas or image text.
- Never invent facts, prices, reviews or results; missing items become marked
  placeholders. Generated or stock visuals are labelled as stand-ins.

WORKFLOW
1. Design direction first: propose 2-3 distinct directions using the fixed tokens. For
   each: rationale, where glass/depth/neumorphism are used, motion plan with its
   reduced-motion version, any 3D element and fallback, and a rendered hero (desktop and
   mobile screenshots). Wait for my approval.
2. Design as you build, for every section and component:
   a. re-read the relevant spec and principles;
   b. consult the design skills (layout, type, hierarchy) and the Emil Kowalski skill
      (motion, interaction);
   c. build it;
   d. screenshot at desktop and 375px, both themes, and with reduced motion on;
   e. critique with impeccable and taste plus the NON-NEGOTIABLES, then fix.
3. After each phase, report: what you built, before/after screenshots, fixes made,
   reduced-motion and mobile behaviour, contrast results, performance concerns.
4. Tell me before changing any approved design decision; don't change it silently.
5. At the end, run Lighthouse (or equivalent) and an accessibility check, and list fixes.
Principles quick reference
Style    Use it for    Avoid it for    Guardrail
Glassmorphism    Nav bar, cards over images, modals, floating panels    Long text blocks, busy backgrounds    Solid fallback; AA contrast behind every blurred layer
Neumorphism    Toggles, chips, small secondary controls    Text containers, primary buttons, forms    Add a border or colour state; soft shadows alone fail contrast
Spatial UI    Layered sections, card depth, focus on one element    Every element at once    Clear z-layers; tilt on pointer devices only
Bento grid    Services, results, tools overview    Long-form case study text    Keep reading order logical on mobile
Scroll motion    Section reveals, step-by-step diagrams, light parallax    Hijacked scrolling, content that waits for animation    Off under reduced motion
Micro-interactions    Hover, press, form feedback, toggles    Constant looping animation    120–200ms; never the only signal of state
3D    One hero accent or concept visual (e.g. workflow nodes)    Essential content, text, navigation    Lazy-load, static fallback, paused off-screen
