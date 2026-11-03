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
| 3D accent: a low-poly stack of ledger sheets squaring up beside the final call to action | Approved in Phase 2 and required by the spec's motion level. Phase 7 first shipped without it and wrongly recorded that the direction had none; corrected in Phase 8 |
| Three.js loads on its own, only when the accent is near view | Spec's loading rules. It is not part of any page's first load |
| Static drawing instead of WebGL under 768px, on 4 or fewer CPU cores, 4GB or less memory, Save-Data, reduced motion or failed WebGL | Spec's fallback rules |
| No motion library; CSS plus one IntersectionObserver script | Lightest option in the principles, and adds no dependency |
| Only content below the fold is hidden, and only by the running script | A failed script, no JavaScript or reduced motion leaves all content visible |
| No parallax or scroll-linked motion | Reveals and the drawing ticks carry the direction's idea; parallax would add movement without meaning |
| Phones get less travel and a shorter stagger (12px, 40ms) | The spec asks for motion to be simplified on mobile |
| Pages build as flat files (`build.format: 'file'`) | Otherwise Workers answers `/med-spas` with a 307 to `/med-spas/`, adding a redirect to every cold-email link and project link |
| Instrument Serif is preloaded | It loaded late and re-wrapped headlines, shifting the med spa page by 0.09 on phones. Now 0 in production |

## Phase 8: SEO and checks

| Decision | Why |
| --- | --- |
| Canonical links, Open Graph URLs and images, and the sitemap appear only once `settings.siteUrl` is a real URL | A stand-in domain in production would tell search engines the wrong address |
| Share images come from Astro's `getImage`, cropped to 1200×630 at build time | No extra service or Worker code |
| Default share image was made from the site's own hero type and Benson's portrait | The spec needs a fallback and none was supplied. Project pages use it until they have covers |
| 404 copy lives in `settings.notFound` and is my wording | The spec gives the page's links, not its copy |
| Unfinished videos and placeholder transcripts are left out of production builds, along with the med spa demo button | A play button with nothing behind it breaks trust. They appear as soon as the values are added |
| Every production build warns about placeholders left in the pages | So an unfinished value cannot ship unnoticed |
| Orange is limited to actions and key numbers: "Client project" labels, the problem's closing line and the lead service card are now neutral | Finish review, against the approved contract |
| Project cards without covers lost their inner panel, and the booking fallback lost its second frame | Finish review |

## Redesign: reference direction (design.webp)

Benson replaced "The Reconciliation" with the reference image. Colours, fonts and copy stay as specified.

| Decision | Why |
| --- | --- |
| Centred hero with a monochrome cut-out portrait, floating cards, and the page opening under an orange wash | The reference, with orange in place of its lime |
| The cut-out is still the intro video's poster and play button | The spec keeps the video as the hero's main visual |
| Backdrop removed locally from the supplied photos, which replaces both files in place | Git history keeps the originals |
| Tools strip moved under the hero, Testimonials after Process, Work and Services after that, About last | The reference's order. It departs from the spec's section order at Benson's request |
| Reference items left out: award badge, client avatars, "100+ clients", logos, quotes, career dates | The spec forbids inventing claims, clients or reviews |
| Orange panel previews projects as text tiles until covers exist | Placeholder for the reference's screenshot collage |
| About timeline uses only facts from the spec's About text | Stands in for the reference's career list |
| Section labels such as "/ The problem" and "/ The fix" are mine | The reference needs them; the spec has none |
| 3D ledger stack and Three.js removed | The new direction has no 3D. Supersedes Phase 8 |
| All gradients removed, including the orange wash, section glows and the portrait fade. The spec's `--glow-a` and `--glow-b` tokens stay defined but unused | Benson's request. The final call to action and case study closing use flat `--surface` instead |

## Redesign: soft-wash editorial (supersedes the design.webp direction)

Source: Benson's soft-wash editorial brief, 2026-11-03. Its colour tokens replace the build spec's.

| Decision | Why |
| --- | --- |
| Dark mode and the theme toggle are removed site-wide; the Keystatic `palette` select replaces them | Benson's choice. The six palettes are light only |
| Home Work grid: "After-Hours AI Receptionist" is the retitled med-spa-ai-receptionist and "Gym Trial-to-Member" the retitled studio-mindbody-win-back. "Med Spa Speed-to-Lead" and "Clinic No-Show Recovery" are new demo entries with [placeholder] case-study fields; in production their cards show without a link until filled in | Benson's choice. The brief names four projects but only two had content |
| Testimonials keep `permissionToPublish` as a build gate. A name shows only when `anonymous` is false and `nameApproved` is true | Benson's choice; matches CLAUDE.md rule 6 |
| Pull-quote captions use `--ink`, not `--muted` | `--muted` on `--panel` is 3.29:1 in midnight, below AA |
| The uncommitted design.webp redesign was committed as a checkpoint before this work | Benson's choice, for a clean diff and easy rollback |
| Home work cards use a new `cardTitle` field; project page headlines are unchanged | The brief's short names ("Gym Trial-to-Member") are card labels. Retitling the pages would rewrite approved case-study copy |
| The two new demos ("Med Spa Speed-to-Lead", "Clinic No-Show Recovery") have no page in production while their title, summary or problem is a placeholder; their cards show without a link | Agreed with Benson. In development the pages build so the layout can be checked |
| Panel placeholder labels ("Screenshot · Speed-to-lead SMS thread" etc.) are mine | The brief gives one example label. They show in development only |
| The project panel shows in production only when all four slots have an image | It is images only; a part-empty panel would be bare tiles |
| On phones the panel's last image also spans both columns | The brief spans the first; with four images the fourth would otherwise sit alone in half a row |
| Gym Trial-to-Member tools reordered to Mindbody, GoHighLevel, n8n | The work card shows the first two tools, and the brief lists Mindbody and GHL |
| Tool tags use full names ("GoHighLevel"), not "GHL" | The brief uses both forms; full names match the tool row |
| Top and bottom washes are body background layers; the middle wash sits on the process section with its top edge masked out | A wash painted on a section box starts on a visible line. The mask is not a visible gradient |
| Process card straightening and the path draw are triggered once on entering view (900ms and 1.6s), not scrubbed with scroll position | Same visual result without scroll-linked work; holds in every browser |
| Process cards keep their ±1.5° tilt on phones and do not straighten there | The brief fixes ±1.5° on mobile |
| The footer name scales at 17vw below 530px instead of holding the 90px floor | At 90px "Gitau" runs off the side of a 390px screen; the brief wants the bottom edge to do the cropping |
| Intro poster is the cut-out portrait set to `contain`, standing on the dark video ground | A 16:9 cover crop cut off the head |
| Social links in About are text pills (LinkedIn, Upwork, Fiverr), not logos | No logo files, and brand marks would add the extra colours the brief removes |
| "Watch intro" and the About play button stay visible in development while the video ID is a placeholder; production hides them as the brief says | Unfinished content is shown marked in development |
| Testimonials: a review with any [PLACEHOLDER] in its role, practice type, quote or video ID is dropped from production | This is how the dev seed reviews never ship |
| Header is not sticky | "Not sticky-heavy". It scrolls away with the top wash |
| `theme-color` meta removed | Dark mode is gone and the palette lives in CSS |
| Placeholder build warning now catches mixed-case values such as [Years] | It only matched uppercase, so [Years] could ship unnoticed. Production now hides it too |
| Services section restored at Benson's request, between Selected Work and Reviews, with its original seven items and copy | Benson's request after the soft-wash build. It follows the work, where the visitor has just seen what gets built |
| Services heading is "Ways I can help", in plain Geist; the old `*help*` accent marker is dropped | The brief allows no serif words inside headings |
| Services is a ruled two-column list (title, then muted description), not cards | Process and Work already use card rows; a list reads as a menu and keeps cards from becoming the page's only structure |
| "/ Services" eyebrow reused from the previous build; no Services link added to the header nav | The brief fixes the nav as Work, Process, Reviews, About |
| Service structured data (schema.org `Service`) restored | It was removed with the section |
| Services added to the header nav (after Work) and the footer links. Supersedes the "no Services link" row above | Benson's request. It sits after Work in both places so the menu reads work first, then services |
| Section spacing tightened site-wide: `--space-section` is now clamp(3rem, 5.5vw, 5rem), down from clamp(5rem, 9vw, 8rem). Jambo top padding, the process stage, the final call to action, the med spa booking block, case study headers and the 404 page were reduced to match | Benson: too much space between sections. Homepage gaps between sections went from about 256px to about 150px on desktop and from about 160px to 96px on phones. Jambo top padding drops below the brief's 112px at Benson's request |

## /med-spas restyle (soft-wash)

| Decision | Why |
| --- | --- |
| Full restyle in the soft-wash direction; every line of copy kept from the build spec | Benson chose the full restyle |
| `*accent*` markers removed from the med spa headings in Keystatic; headings are plain Geist 400 | The direction allows no serif or coloured words inside headings. Only the markup changed, not the words |
| The hero eyebrow is a white pill with a `--dot` dot, so "Built for {spa}" reads as a personal tag | It is the page's one personal moment for cold-email visitors |
| Demo video sits on a `--panel` mat, with a "Demo build" tag top-left and "90s · CC" top-right; its title and transcript link sit under the player | Reuses the homepage panel surface. The demo stays labelled as a demo build |
| A shared `VideoPlayer` component now serves the About intro and the med spa demo | One click-to-load player, so both behave and look the same |
| "Where bookings leak" and "Handled carefully" are split layouts (heading left, ruled list right) with no icons | The brief removes checkmarks and coloured status icons. The split gives the page a change of rhythm from centred sections |
| "The system" is numbered nodes on a dashed line over the middle wash: across on desktop, down on phones. The first node is filled with `--btn` | Replaces the case-study SystemDiagram and its ticks on this page. Numbers stay because the order is the point |
| "Where to start": the first offer sits on `--panel` and is wider | The spec orders the offers by where to start, so the first one leads |
| Platform chips float and tilt like the homepage chips; no tilt on phones | Same chip language as the homepage |
| Proof card is the homepage's work-card frame, with a "Demo build" tag | Keeps the demo label next to the project |
| FAQ is a ruled accordion with a plus that turns into a cross | Native `<details>`, so it stays accessible |
| The booking block has no white band; the calendar sits in a white card on the bottom wash | The old band was a flat surface the new direction removes |
| BookingEmbed and BookingModal hard-coded colours replaced with tokens | Brief: no hard-coded colours in components |

## Deploy: Cloudflare through GitHub (2026-11-03)

| Decision | Why |
| --- | --- |
| **Cloudflare Workers + Workers Builds instead of Pages** (approved by Benson) | `@astrojs/cloudflare` v14, required by Astro 7, says "no longer supports deployment on Cloudflare Pages". Workers Builds gives the same flow: push `main` → production, other branches → preview URLs, no GitHub Actions or repo secrets |
| Context7 was not available, so I used the current docs (docs.astro.build, keystatic.com, developers.cloudflare.com) and the installed package sources | The brief asked for current docs, not memory. The installed sources are the exact versions that run |
| Output stays static; only the Keystatic-injected routes (`prerender: false`) run on the Worker | Verified on workerd: pages are `dist/client` files, and `/keystatic` and `/api/keystatic` are Worker responses |
| `imageService: 'compile'` kept | Images are optimised with sharp during the build (Node). The Worker gets the no-op service, so there is no sharp at runtime and no Cloudflare Images binding or cost. The adapter's new default (`cloudflare-binding`) would provision a paid binding |
| Keystatic secrets are declared optional in `astro:env` and read at runtime with `getSecret` (Worker secrets) | They are never inlined into the bundle (checked with dummy values), and a build without them passes |
| `src/middleware.ts` returns a 503 "Keystatic is not configured" page that names the missing variables (never their values), and adds `X-Robots-Tag: noindex` to every Keystatic response | `_headers` does not apply to Worker responses, so the noindex has to come from the Worker. Static pages never reach the middleware |
| `PUBLIC_*` values are **build** variables in Workers Builds, not runtime variables | They are inlined at build time. Plain runtime variables set in the dashboard are also replaced by `wrangler deploy` |
| `npm run dev:github` (a small Node script setting `PUBLIC_KEYSTATIC_STORAGE=github`) forces GitHub mode locally | Keystatic creates the GitHub App only in Node, not on the Worker. A script works the same in PowerShell and bash |
| `site` comes from `PUBLIC_SITE_URL`, then `settings.siteUrl`, and only if it is a real https URL. Canonical, share images, JSON-LD `url` and the robots sitemap line all read `Astro.site` | One source of truth. A placeholder domain never reaches search engines |
| Node pinned to 24 (`.nvmrc`, `engines: >=24 <25`) | Workers Builds' default image is Node 24 and reads `.nvmrc`. Local is 24.11 |
| CSP allows `'unsafe-inline'` for scripts and styles | The built pages have small inline scripts (JSON-LD, the `?spa=` personalisation, reveal, Astro islands) and inline `style` custom properties. A hash-based CSP would need Astro's CSP feature and a re-check of every script, which is a separate task. Everything else is locked to `'self'`, plus YouTube-nocookie, i.ytimg.com and the GoHighLevel domains (`*.leadconnectorhq.com`, `link.msgsndr.com`, `*.msgsndr.com`). Fonts are self-hosted by Astro, so Google Fonts is not needed |
| `/_astro/*` immutable caching is left to the adapter, which injects it into `_headers` at build | Writing it twice would duplicate the rule |
| No `public/_redirects` | No public route changed, and the site has never been live, so nothing old needs redirecting |
| `nodejs_compat` and `compatibility_date: 2026-10-01` kept in `wrangler.jsonc`; the explicit `assets` block removed | The adapter docs say it generates the assets config (`dist/client`, `ASSETS` binding) itself. The old block pointed at `./dist`; the adapter already overrode it with `dist/client` in the generated config, so it was only misleading |
| **Deploys run from GitHub Actions** (`.github/workflows/deploy.yml`), with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repo secrets. This replaces Workers Builds and was chosen by Benson on 2026-11-03 | Benson had already set up an API token and account ID. This overrides the deploy brief's "no GitHub Actions, no GitHub secrets". Push to `main` runs `wrangler deploy`. Same-repo PRs run `wrangler versions upload --preview-alias pr-<n>`, which gives a preview URL without touching production. `PUBLIC_*` are Actions variables. `KEYSTATIC_*` stay Cloudflare Worker secrets |
| **Keystatic uses Keystatic Cloud** (project `benson-portfolio/portfolio`) in production, local mode in dev. Chosen by Benson on 2026-11-03. Supersedes GitHub mode, the `astro:env` Keystatic secrets, the 503 "not configured" page and `npm run dev:github` (now `npm run dev:cloud`) | No GitHub App to create and no `KEYSTATIC_*` secrets or `PUBLIC_KEYSTATIC_*` variables to keep in sync. Cloud still commits to `Benson-Gitau/portfolio`, so the deploy workflow is unchanged. The middleware keeps only the noindex header |
| Production domain is `https://bensongitau.dev` (apex); `www` 301s to it with a Cloudflare Redirect Rule. Custom domains are attached to the Worker, not a Pages project | The deploy is on Workers; the domain brief described Pages. `settings.siteUrl` and the workflow default to the apex |
