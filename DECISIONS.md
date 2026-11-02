# Decisions

Approved decisions and deliberate departures from `docs/build-spec.md`. Newest phase last.

## Approved by Benson before Phase 1

| Decision | Why |
| --- | --- |
| Deploy to Cloudflare Workers with static assets, not Pages | The current Astro Cloudflare adapter no longer supports Pages |
| Easing token names swapped, values unchanged: `--ease-out` is `cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-in` is `cubic-bezier(0.4, 0, 1, 1)` | The spec had the names reversed. Entrances use `--ease-out`; `--ease-in` is for short exits only |
| Spec and principles override the taste skills on glass, Geist Mono, the accent word, eyebrows, the long headline and hero glows | Precedence rule: the spec wins on content, colours and fonts |
| Button text on accent is `--on-accent`: `#0B1220` dark, `#121826` light | `--bg` on orange in light theme is about 2.4:1 |
| Essential diagram lines use `--line-strong`: `--teal` dark, `--teal-text` light | `--teal` on the light background is 2.28:1, below the 3:1 needed |
| Project slugs are entered as the spec lists them, not generated from titles | `/med-spas` links to `/work/med-spa-ai-receptionist` |
| `[CASE_6_TOOLS]` is an empty tools field, marked in development | A relationship field can't hold placeholder text |
| Optional `resultsNote` text field on projects | Case 6's "More accurate data behind decisions" has no number |
| One commit per phase on `main`, no pushes | Benson's approval |

## Phase 1

| Decision | Why |
| --- | --- |
| Fonts load through Astro's Fonts API using the Fontsource provider, self-hosted | Same Google Fonts families. `fonts.gstatic.com` refuses TLS from the development machine, which fails the build with the Google provider |
| The Cloudflare adapter is skipped under `astro dev` | The adapter runs dev in the Workers runtime, where Keystatic local storage fails. Build and preview still use it |
| Sessions are off (`session: false`) | Nothing uses them, so no KV namespace is needed |
| Images are optimised at build time (`imageService: 'compile'`) | Public pages are static, so no runtime image service is needed |

## Open

- `site` in `astro.config.mjs` is a stand-in until `[SITE_URL]` is known.
- `npm audit` reports 2 moderate issues through `@keystatic/core` (`minimatch`). The only offered fix downgrades Keystatic to 0.0.46, so it is not applied. Keystatic's server code runs only on the admin route.

## Phase 2: approved direction

Benson approved **Direction A, The Reconciliation, with Direction C's notification cards**.

| Decision | Detail |
| --- | --- |
| Hero idea | The headline is a ledger: each sentence is a ruled row that gets a teal tick |
| Hero cards | C's stacked notification cards, each labelled "Demo", replace A's ledger strip. Near-solid fill (94%) so text holds AA over the photo |
| Card placement | From 1280px, float over the video's left edge, clear of the face and play button. Below 1280px, stack under the video |
| Phone order | Eyebrow, headline, actions, video, cards, subline, trust line |
| Glass | Nav and video frame; near-solid notification cards; modals |
| Neumorphism | Theme toggle, secondary button, filter chips |
| Motion | Ticks draw in order, then cards arrive. System diagrams check off line by line on scroll |
| 3D | Proposed, not built: a low-poly stack of ledger sheets beside the final call to action, static image fallback. Three.js is added in Phase 7 |

## Phase 3: content model

| Decision | Why |
| --- | --- |
| Content rules live in `src/lib/content.ts`, the only route from Keystatic to pages | Demos lose results, unapproved names and unpublished testimonials never reach a template, and breaches fail the build |
| Alt text is checked at build time, not in the admin | The admin must be able to save entries while cover images are still missing |
| Prerendering runs on Node (`prerenderEnvironment: 'node'`) | Keystatic's reader needs file access at build time |
| Images keep Keystatic's own folder layout | A save moves images there anyway, so seeding the same way keeps saves clean |
| Added fields: `seo`, `work.filters`, `work.otherWork`, `about.agencyLine`, `medSpaPage` section headings, `settings.footerRole`, `settings.footerLocation` | The spec's copy needed a home in Keystatic so none is hard-coded |
| Added placeholders: `[MEDSPA_DEMO_TRANSCRIPT]`, `[STUDIO_DEMO_TRANSCRIPT]`, `[COACH_DEMO_TRANSCRIPT]` | Every video needs a transcript, and the spec's list only has one for the intro |
| Demo video titles reuse the project title; med spa duration is "90s", from the spec's "90-second demo" | The player's label needs a title and the spec gives none |
| Skill categories for Twilio (AI voice), OpenAI and Claude (Automation), Square (E-commerce) are a best fit | The spec's category list has no exact match. Categories are not displayed |
| Med spa headings "Proof" and "FAQ" come from the spec's section names | The spec gives no separate heading copy |

## Phase 4: home page

| Decision | Why |
| --- | --- |
| Keystatic production repo is `Benson-Gitau/portfolio` | Read from the connected git remote |
| Booking uses a native `<dialog>` | The browser supplies the focus trap, Esc and focus return |
| Work filter is a small vanilla script, not a React island | It needs no framework, and all cards show without JavaScript |
| A `*word*` in a section heading sets it as the accent word | Spec: one accent word per major headline. The words are unchanged |
| Projects with no cover show their first steps as a ledger | Real content rather than a stand-in image. A cover replaces it when supplied |
| Book buttons are links to `#contact` that open the modal with JavaScript | Booking still works without JavaScript |
| `settings.ghlEmbedScriptUrl` is a setting, empty until supplied | The script URL could not be confirmed from official docs, so it comes from Benson's embed code |

## Phase 5: case studies

| Decision | Why |
| --- | --- |
| Project pages have an `accentWord` field rather than `*word*` in the title | Titles also appear on cards and in meta tags, where markers would show |
| Section labels on project pages live in `settings.caseStudy` | The spec names the sections but gives copy only for "What it's designed to do". No page text is hard-coded |
| Added an "All work" link above the type label | The spec's layout has no way back to the grid apart from the nav |
| Optional `body` narrative sits after results or designed-to | The spec's layout does not place it |

## Phase 6: med spa page

| Decision | Why |
| --- | --- |
| Nav button reads "Book a call"; page buttons read "Book a 15-minute walkthrough". Both open the same modal | The routes table names the nav as "logo + Book a call only", and the long label does not fit beside the logo on a phone |
| No theme toggle on this page | "Logo + Book a call only". A saved choice or the system setting still applies |
| `?spa=` is applied by a small inline script straight after the eyebrow | The page is static, and running it there avoids a flash of the default text |
| A name with any disallowed character falls back to the default eyebrow; a valid long name is cut to 40 characters | Spec's sanitising rule. Letters from any alphabet count, so "Zoë" works |
| Video heading is the demo's title | The spec's demo section has no heading, and the section needs one for screen readers |

## Phase 7: motion and 3D

| Decision | Why |
| --- | --- |
| No 3D element | The approved direction has none, and the spec only calls for one if the direction includes it |
| No motion library; CSS plus one IntersectionObserver script | Lightest option in the principles, and adds no dependency |
| Only content below the fold is hidden, and only by the running script | A failed script, no JavaScript or reduced motion leaves all content visible |
| No parallax or scroll-linked motion | Reveals and the drawing ticks carry the direction's idea; parallax would add movement without meaning |
| Phones get less travel and a shorter stagger (12px, 40ms) | The spec asks for motion to be simplified on mobile |
| Pages build as flat files (`build.format: 'file'`) | Otherwise Workers answers `/med-spas` with a 307 to `/med-spas/`, adding a redirect to every cold-email link and project link |
| Instrument Serif is preloaded | It loaded late and re-wrapped headlines, shifting the med spa page by 0.09 on phones. Now 0 in production |
