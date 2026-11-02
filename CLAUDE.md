# Benson Gitau portfolio

Read these before working, and re-read the relevant sections before each phase and each major component:

- `docs/build-spec.md`: source of truth for structure, copy, content model and design tokens
- `docs/design-principles.md`: visual, motion, 3D and accessibility principles
- `AGENTS.md`: Astro dev server and documentation links

The spec wins on content, colours, fonts, accessibility and performance. The design skills win on visual craft and motion quality. Flag real conflicts.

## Working rules

1. Read the whole spec before writing code. Then reply with a short build plan (phases, components, packages) and wait for approval.
2. Colours and fonts in Design tokens are fixed. Layout, composition, surfaces, motion and any 3D element are design decisions guided by the principles. Complete the Design direction step and wait for approval before building pages.
3. Use the copy in the spec exactly. Do not rewrite headlines or invent new claims, numbers, clients, reviews or prices.
4. Anything in [SQUARE BRACKETS] is a placeholder: store it in the Keystatic `settings` singleton or the relevant entry, render it visibly marked in development, and list it in the final report.
5. Demo builds are always labelled "Demo build". Never present demo outcomes as achieved results.
6. Clients are anonymous: never render a client name unless its `nameApproved` flag is true.
7. Build phase by phase (see Build order). After each phase, report what was built, how it behaves on mobile and with reduced motion, contrast results, and anything needed from Benson.
8. If a decision in the spec seems wrong or blocks you, ask before changing it. After a direction is approved, say so before changing any approved design decision.
