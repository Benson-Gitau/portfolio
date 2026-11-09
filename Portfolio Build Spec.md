# Portfolio Build Spec — for Claude Code

## Instructions

You are building the personal portfolio site of Benson Gitau, an automation and AI systems consultant for health, fitness and wellness businesses. This spec is the source of truth for structure, copy, content model and design tokens. The Modern UI, Motion & 3D prompt template (provided alongside this spec) defines the visual, motion, 3D and accessibility principles; apply it to everything here.

**Working rules**

1. Read the whole spec before writing code. Then reply with a short build plan (phases, components, packages) and wait for approval.
2. **You own the visual design.** Colours and fonts in Design tokens are fixed; layout, composition, surfaces, motion and any 3D element are your decisions, guided by the Modern UI, Motion & 3D template. Before building pages, complete the Design direction step and wait for approval.
3. Use the copy in this spec exactly. Do not rewrite headlines or invent new claims, numbers, clients, reviews or prices.
4. Anything in \[SQUARE BRACKETS\] is a placeholder: store it in the Keystatic `settings` singleton or the relevant entry, render it visibly marked in development, and list it in your final report.
5. Demo builds are always labelled "Demo build". Never present demo outcomes as achieved results.
6. Clients are anonymous: never render a client name unless its `nameApproved` flag is true.
7. Build phase by phase (see Build order). After each phase, report what you built, how it behaves on mobile and with reduced motion, contrast results, and anything you need from me.
8. If a decision in this spec seems wrong or blocks you, ask before changing it. After a direction is approved, tell me before changing any approved design decision.

## Skills, plugins and documentation

### Project docs in the repo

At the start, save this spec as `docs/build-spec.md` and the Modern UI, Motion & 3D template as `docs/design-principles.md`. Add a short `CLAUDE.md` at the repo root that points to both and lists the working rules above, so every session reads them. Before each phase and each major component, re-read the relevant sections of both files.

### Design skills and plugins

1. At session start, list the skills and plugins available to you and load the design-related ones before any visual work. These are installed and must be used:
   - **impeccable** — design quality, polish and critique
   - **taste** skill(s) — aesthetic judgment and avoiding generic, template-looking output
   - **Emil Kowalski design / animation skill** — motion, easing, timing and interaction feel
   - any other installed frontend-design skill
2. If a named skill isn't found, tell me and continue with the others; don't substitute your own defaults silently.
3. Where a skill's guidance conflicts with this spec, the spec wins on content, colours, fonts, accessibility and performance; the skills win on visual craft and motion quality. Flag real conflicts to me.

### Design as you build (repeat for every section and component)

1. Re-read the section in `docs/build-spec.md` and the relevant principles in `docs/design-principles.md`.
2. Consult the design skills for layout, typography and hierarchy; consult the Emil Kowalski skill for any motion or interaction.
3. Build the section.
4. Screenshot it at desktop and 375px mobile, in both themes, and once with reduced motion on.
5. Critique it using the impeccable and taste skills and the template's NON-NEGOTIABLES; fix what they flag.
6. Report the before/after screenshots and the fixes in your phase report.

### Official documentation

Check current official documentation before writing configuration or code that depends on a library's API; don't rely on memory. Use a docs tool (such as a Context7 MCP) or web fetch if available. This applies to:

- Astro and the Cloudflare adapter
- Keystatic (Astro integration, collections, singletons, GitHub storage)
- Tailwind CSS
- the motion library you choose (CSS, Motion, GSAP) and Three.js if used
- GoHighLevel calendar embed
- YouTube embed parameters

Record the version of each package you install in your phase report.

## Fixed decisions

| Area | Decision |
| --- | --- |
| Framework | Astro (static output for all public pages), TypeScript, Tailwind CSS. Use framework islands (React) only where interactivity requires it: Keystatic admin, 3D accent, work filter |
| CMS | Keystatic. Local storage in development, GitHub storage in production. The `/keystatic` admin route is the only server-rendered route |
| Hosting | Cloudflare Pages with the Astro Cloudflare adapter |
| Booking | GoHighLevel calendar embed. Every "Book a call" button opens the embed in an accessible modal; the final CTA section also shows it inline. URL from `settings.ghlCalendarEmbedUrl` |
| Video | YouTube (unlisted). Use a privacy-enhanced, click-to-load "lite" embed: poster image first, iframe only after the user clicks |
| Intro video | In the home hero, as the main visual (see Home page) |
| Clients | Anonymous. Describe clients by type; testimonials stay hidden until `permissionToPublish` is true |
| Themes | Dark theme default; light theme via toggle, remembered per visitor, respecting `prefers-color-scheme` on first visit |
| Motion level | Expressive: glass and spatial depth, scroll-built system diagrams, one 3D accent with static fallback |
| Audiences | Upwork and Fiverr buyers (home and case studies); med spa owners from cold email (`/med-spas`) |

## Build order

| Phase | Tasks | Done when |
| --- | --- | --- |
| 1. Foundation | Astro project, Tailwind, Cloudflare adapter, colour and font tokens, theme toggle, base layout | Tokens render in both themes; AA contrast verified |
| 2. Design direction | Propose 2–3 directions and render the home hero in each (see Design direction) | I approve one direction |
| 3. Content model | Keystatic config (collections, singletons), seed all copy and case studies from this spec | Admin opens locally; every page reads content from Keystatic, none hard-coded |
| 4. Home page | All home sections in the approved direction, intro video in the hero, booking modal | Matches copy; video loads only on click; booking modal is focus-trapped and closable with Esc |
| 5. Case studies | `/work/[slug]` template, system diagram, results, gallery, demo video | All six pages render; Demo build labels show; reduced-motion fallbacks work |
| 6. Med spa page | `/med-spas` with UTM capture and `?spa=` personalisation | Copy matches; personalisation sanitised; one CTA |
| 7. Motion and 3D | The motion and any 3D element from the approved direction | Off or simplified with reduced motion and on mobile; no layout shift |
| 8. SEO and checks | Meta, Open Graph images, sitemap, robots, 404, Lighthouse and accessibility audit | Passes Acceptance checks; placeholder list reported |

## Routes

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `home` singleton + featured projects | Full navigation |
| `/med-spas` | `medSpaPage` singleton | Reduced nav: logo + Book a call only; no footer link list |
| `/work/[slug]` | `projects` collection | One page per project; own title, description, share image |
| `/404` | static | Links to Work and Book a call |
| `/keystatic` | Keystatic admin | Server-rendered; excluded from sitemap and indexing |

**Main navigation:** Work (`/#work`) · Services (`/#services`) · Process (`/#process`) · About (`/#about`) · theme toggle · **Book a call** (accent button, opens booking modal). Sticky glass bar that becomes solid after scrolling; collapses to a menu button under 768px.

**Footer:** Benson Gitau · Automation & AI systems · Nairobi, working worldwide · © {current year} · Work · Services · \[AGENCY NAME\] · LinkedIn · GitHub · X.

## Design tokens

Define these as CSS custom properties and map them into Tailwind's theme. Verify every text/background pair against WCAG AA in both themes.

```css
:root, [data-theme="dark"] {
  --bg: #0B1220;            /* page */
  --surface: #111A2E;       /* cards, sections */
  --glass: rgba(255,255,255,0.06);
  --glass-border: rgba(255,255,255,0.12);
  --glass-fallback: #142038; /* when backdrop-filter unsupported or reduced transparency */
  --text: #F5F7FA;
  --text-muted: #A7B0C0;
  --accent: #FF7A1A;        /* buttons, key numbers; button text uses --bg, never white */
  --accent-text: #FF7A1A;
  --accent-soft: rgba(255,122,26,0.14);
  --teal: #2DD4BF;          /* diagram lines, wellness tags, success */
  --teal-text: #2DD4BF;
  --danger: #F87171;
  --glow-a: rgba(255,122,26,0.18); /* hero radial glow, top left */
  --glow-b: rgba(45,212,191,0.14); /* hero radial glow, bottom right */
}
[data-theme="light"] {
  --bg: #F7F5F0;
  --surface: #FFFFFF;
  --glass: rgba(255,255,255,0.65);
  --glass-border: rgba(18,24,38,0.10);
  --glass-fallback: #FFFFFF;
  --text: #121826;
  --text-muted: #4B5563;
  --accent: #FF7A1A;        /* fill with dark text */
  --accent-text: #C2410C;   /* orange for links/text on light */
  --accent-soft: rgba(255,122,26,0.12);
  --teal: #14B8A6;
  --teal-text: #0F766E;
  --danger: #B91C1C;
  --glow-a: rgba(255,122,26,0.12);
  --glow-b: rgba(20,184,166,0.10);
}
:root {
  --radius-sm: 12px; --radius-md: 20px; --radius-lg: 28px; --radius-pill: 999px;
  --blur-glass: 18px;
  --shadow-soft: 0 10px 30px rgba(0,0,0,0.25);
  --dur-micro: 160ms; --dur-ui: 280ms; --dur-reveal: 560ms;
  --ease-in: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out: cubic-bezier(0.4, 0, 1, 1);
}
```

**Fonts** (Google Fonts, self-host or preload, `font-display: swap`, only these weights):

- Geist 500/600: headings, nav, buttons
- Instrument Serif italic 400: one accent word per major headline (e.g. *booked*)
- Inter 400/500: body text
- Geist Mono 400/500: result numbers, tool chips, "Demo build" labels

### Design direction (your step before building pages)

Propose 2–3 distinct visual directions that use only the colour and font tokens above and follow the Modern UI, Motion & 3D template. For each direction give:

- A name and a one-paragraph rationale tied to the audience (wellness business owners and Upwork buyers judging a consultant).
- How it uses glass, depth, spatial layering and neumorphism (where, and where not).
- The motion plan: what moves, when, why, and the reduced-motion version.
- Whether it includes a 3D element, what it represents, and its fallback.
- A rendered home hero (desktop and mobile screenshots) using the real hero copy and the intro video placement.

Fixed requirements every direction must meet:

- The intro video is the hero's main visual (poster image, click to play).
- One primary action: Book a call.
- Real HTML text for all headlines and copy; nothing essential inside canvas or images.
- Optional hero content you may use: the `heroCards` notification snippets (each labelled "Demo").

Avoid generic template patterns: interchangeable gradient heroes, identical three-card rows everywhere, effects with no purpose. Every section should have a reason for its layout. Wait for my approval before building pages.

## Keystatic content model

Create `keystatic.config.ts` with the collections and singletons below. All images require alt text. Use a shared `video` object wherever a video appears: `{ youtubeId (text, required), title (text), poster (image + alt), transcript (multiline text), durationLabel (text, e.g. "60s") }`.

### Collection `projects` → `/work/[slug]`

| Field | Type | Rules |
| --- | --- | --- |
| title | text | Outcome headline |
| slug | slug | Generated from title |
| type | select: `demo` / `client` | `demo` renders the "Demo build" label everywhere |
| lane | select: `wellness` / `ecommerce-ops` | Drives the work filter |
| industry | select: Med spa, Clinic, Gym/Studio, Coach, E-commerce, Operations | Card tag |
| clientDescriptor | text | Anonymous description, e.g. "multi-store e-commerce group" |
| clientName | text, optional | Rendered only when `nameApproved` is true |
| nameApproved | checkbox, default false |  |
| summary | multiline text, ≤155 chars | Card text and meta description |
| cardResult | text | One line for the card, e.g. "\~80% less manual oversight" or "Demo build · Retell AI + GoHighLevel" |
| problem | multiline text |  |
| steps | array of `{ title, description }` | Feeds the system diagram |
| results | array of `{ value, label }` | For `client` only; hide for `demo` |
| designedTo | multiline text | For `demo` only: what the system is designed to do |
| tools | relationship → skills (multiple) |  |
| coverImage | image + alt | Card and share image source |
| gallery | array of `{ image, alt, caption }` |  |
| demoVideo | video object, optional |  |
| body | Markdoc | Optional extra narrative |
| cta | text | Closing line |
| featured | checkbox | Shown on home |
| order | number | Sort order |

### Collection `testimonials`

| Field | Type | Rules |
| --- | --- | --- |
| format | select: `text` / `video` | Conditional fields |
| quote | multiline text | `text` only |
| video | video object | `video` only; transcript required |
| personName, role | text |  |
| company | text, optional | Rendered only when `nameApproved` is true |
| nameApproved | checkbox |  |
| photo | image + alt, optional |  |
| project | relationship → projects, optional | Shows on that case study |
| source | select: Direct, Upwork, Fiverr, LinkedIn | Small label |
| permissionToPublish | checkbox, default false | **Exclude from build when false** |
| featured, order | checkbox, number | Home proof section |

### Collection `skills`

| Field | Type |
| --- | --- |
| name | text |
| category | select: CRM, Automation, AI voice, Booking platforms, E-commerce, Payments, Data |
| icon | image (SVG), optional, monochrome |
| showInToolsStrip | checkbox |
| order | number |

Seed skills: GoHighLevel, n8n, Zapier, Retell AI, Mindbody, Stripe, Twilio, Shopify, Square, OpenAI, Claude, Zoho CRM, PostgreSQL, Power BI.

### Singletons

- **`home`:** hero `{ eyebrow, headlineBefore, accentWord, headlineAfter, subline, primaryCta, secondaryCta, trustLine, introVideo (video object) }`; `heroCards` array of `{ text }`; `problem { heading, cards[{ title, text }], closingLine }`; `outcomes { heading, items[{ title, text }] }`; `work { heading, intro }`; `services { heading, items[{ title, text, priceFrom (optional) }] }`; `process { heading, steps[{ title, text }] }`; `about { heading, text, photo, agencyName, agencyUrl }`; `proof { heading }`; `finalCta { heading, text, buttonLabel }`.
- **`medSpaPage`:** same pattern for every section of `/med-spas` (hero, demo video, leaks, system steps, offers, platforms, safeguards, proof, faq\[{ q, a }\], finalCta).
- **`settings`:** `ghlCalendarEmbedUrl`, `email`, `linkedinUrl`, `githubUrl`, `xUrl`, `agencyName`, `agencyUrl`, `siteUrl`, `defaultShareImage`, `analyticsSnippet` (optional).

## Home page (`/`)

Seed the `home` singleton with this copy and build the sections in this order. One primary action throughout: **Book a 20-minute call** (opens the booking modal).

### 1. Hero (`id="top"`)

- eyebrow: `Automation & AI systems for health, fitness and wellness`
- headline: `Every call answered. Every lead followed up. Every slot` + accent word `booked` (Instrument Serif italic) + `.`
- subline: `I build the systems that stop revenue leaking between the first inquiry and the booked appointment, for med spas, clinics, gyms, studios and coaches, on GoHighLevel, n8n, Mindbody and AI voice agents.`
- primaryCta: `Book a 20-minute call`
- secondaryCta: `See the systems →` (scrolls to `#work`)
- trustLine: `Built for businesses in the US, UK and Kenya · 5 years in bank operations before automation`
- introVideo: youtubeId `[INTRO_VIDEO_YOUTUBE_ID]`, title `60-second intro`, poster = Benson's photo, transcript `[INTRO_VIDEO_TRANSCRIPT]`. Rendered as the hero's main visual with the YouTube lite player (see Components).
- heroCards: `Missed call → texted back in seconds`, `Consultation booked · Thu 2:30pm`, `Reminder sent` (each labelled "Demo").

### 2. Problem

- heading: `Most wellness businesses don't have a lead problem. They have a follow-up problem.`
- cards:
  1. `Calls go to voicemail.` — `During treatments, classes and after hours, the caller doesn't leave a message. They book somewhere else.`
  2. `Leads go cold.` — `Ad and website leads wait hours for a reply, long after they've stopped looking.`
  3. `The front desk retypes everything.` — `Bookings, payments and forms live in tools that don't talk, so your team copies data instead of looking after clients.`
- closingLine: `Each one is revenue you've already paid to attract.`

### 3. Outcomes

- heading: `What it looks like when it's fixed`
- items:
  1. `Every inquiry gets a fast response.` — `Calls answered, missed calls texted back and new leads contacted within minutes, day or night.`
  2. `Fewer empty slots.` — `Reminders, no-show follow-up and rebooking run automatically.`
  3. `Admin that runs itself.` — `Your booking platform, CRM and payments share data, so your team stops retyping it.`

### 4. Work (`id="work"`)

- heading: `Systems I've built`
- intro: `Three demo builds for wellness businesses, and real results from e-commerce and operations clients. Demo builds are labelled.`
- Filter chips: `All` · `Health & wellness` · `E-commerce & operations` (filters by `lane`).
- Cards from featured projects, sorted by `order`: cover image, type label, industry tag, title, cardResult, up to 4 tool chips, link.
- Below the grid, a single line from "Other work" (see Case studies).

### 5. Services (`id="services"`)

- heading: `Ways I can help`
- Bento grid of 7 cards:
  1. `AI receptionist` — `Answers every call, books consultations and hands clinical questions to your team.`
  2. `Missed-call text-back and no-show recovery` — `Wins back missed calls and empty slots automatically.`
  3. `Speed-to-lead` — `Calls or texts every ad lead within a minute and books them.`
  4. `GoHighLevel setup for wellness businesses` — `Calendars, pipeline, forms and core automations, set up properly.`
  5. `Mindbody and booking integrations` — `Mindbody, Vagaro and Boulevard connected to your CRM with n8n or Zapier.`
  6. `Landing pages and funnels` — `Treatment and offer pages that turn ad clicks into booked consultations.`
  7. `E-commerce automation` — `Orders, inventory, CRM and reporting for Shopify and Square stores.`
- priceFrom: leave empty; render "From $X" only when filled.

### 6. Process (`id="process"`)

- heading: `How a project runs`
- steps: `Audit` — `A 20-minute call and a map of where leads and bookings slip through today.` · `Plan` — `A short system plan with scope, tools and price, approved before I build.` · `Build and test` — `Built in your own accounts and tested end to end with real scenarios.` · `Handover` — `Walkthrough video and written docs, so your team can run it.` · `Support` — `Optional monthly monitoring and improvements.`

### 7. Tools strip

Skills with `showInToolsStrip`, as mono chips, in `order`.

### 8. About (`id="about"`)

- heading: `Systems that fit how your business actually runs`
- text: `Before automation, I spent five years in operations at Equity Bank, where I learned that most problems are process problems first and tool problems second. I start every project the same way: map how leads, bookings and payments really move through your business, find where they leak, then build the simplest system that closes the gap. Since 2024 I've built automation, integration and AI systems for businesses in the US, UK and Kenya, on GoHighLevel, n8n, Zapier and AI voice agents. I'm based in Nairobi, work remotely, and hand over everything in your accounts, documented, so you're never dependent on me.`
- photo: Benson's photo (a second photo, different from the video poster, if available)
- Agency link: `My client work runs through [AGENCY NAME] →` linking to `[AGENCY URL]`.

### 9. Proof

- heading: `From the people I've built for`
- Render featured testimonials (text and video) with `permissionToPublish = true`. If none qualify, do not render this section at all.

### 10. Final CTA (`id="contact"`)

- heading: `Tell me where bookings slip through. I'll show you the system I'd build.`
- text: `A 20-minute call, no pitch deck. You leave with a clear picture of what to fix first, whether or not we work together.`
- Inline GHL booking embed, plus email and LinkedIn links below it.

## Med spa page (`/med-spas`)

Landing page for cold-email traffic. Seed the `medSpaPage` singleton with this copy. Reduced navigation (logo + Book a call). The CTA label on this page is **Book a 15-minute walkthrough** and opens the same GHL booking modal.

### 1. Hero

- eyebrow (default): `For med spas and aesthetic clinics`
- eyebrow (personalised): `Built for {spa}` when `?spa=` is present (see Components for sanitising)
- headline: `Your next consultation is calling while you're mid-treatment.`
- subline: `I build the system that answers every call, follows up every lead and fills empty slots, connected to the booking platform you already use.`
- primaryCta: `Book a 15-minute walkthrough`
- secondaryCta: `Watch the 90-second demo ↓` (scrolls to the demo video)

### 2. Demo video

The med spa AI receptionist demo (youtubeId `[MEDSPA_DEMO_YOUTUBE_ID]`), labelled "Demo build", captions on, lite player.

### 3. Where bookings leak

- `Calls during treatments and after hours go to voicemail, and most callers book elsewhere.`
- `Ad and website leads wait hours for a reply.`
- `No-shows and lapsed clients leave empty slots that nobody follows up.`
- `Your team retypes between the booking platform, CRM and marketing tools.`

### 4. The system

Scroll-built diagram (same component as case studies), steps:

1. `Call or lead` — `A call, missed call, form or ad lead comes in.`
2. `Instant response` — `The AI receptionist answers, or a text goes out within seconds.`
3. `Booked` — `The consultation lands in your calendar.`
4. `Reminders` — `Confirmations and reminders cut no-shows.`
5. `Review request` — `Happy clients are asked for a Google review.`
6. `Rebooking` — `Clients are invited back at the right treatment interval.`

### 5. Where to start

1. `Missed-call text-back and no-show recovery` — `The fastest win, live in days.`
2. `AI receptionist` — `Every call answered and booked; clinical questions go to your team.`
3. `Reactivation and reviews` — `Past clients rebooked and more Google reviews.`

Small line: `Also available: treatment landing pages, speed-to-lead for ad leads, and GoHighLevel setup.`

### 6. Works with what you use

Plain-text chips (no brand logos): `GoHighLevel` `Aesthetic Record` `Boulevard` `Vagaro` `Zenoti`. Text: `Every booking platform allows different connections. Before you commit, I check what yours supports and tell you exactly what will and won't connect.`

### 7. Handled carefully

- `Medical and treatment details stay out of texts and call summaries.`
- `Leads are only called with their consent; opt-outs are automatic.`
- `US texting is registered (A2P) so messages actually deliver.`
- `We review each tool's data terms, including BAAs where needed, before building.`

### 8. Proof

Card linking to `/work/med-spa-ai-receptionist` (Demo build), plus: `For an e-commerce client, the same capture-and-follow-up approach cut manual operational oversight by roughly 80%.` Show approved med spa testimonials here when they exist.

### 9. FAQ (accessible accordion)

- `Will patients know it's AI?` — `It introduces itself as your virtual assistant; you approve the wording.`
- `Do I need to change booking software?` — `No. I work with your current platform where it allows, or set up GoHighLevel alongside it.`
- `How long does it take?` — `Text-back and reminders in under a week; an AI receptionist in about two weeks.`
- `What does it cost to run?` — `Phone and AI minutes are billed to your own accounts; I estimate them before building.`
- `What if it gets something wrong?` — `It answers only from your approved information, hands off when unsure, and every call is recorded for review.`

### 10. Final CTA

- heading: `See what this would look like for your spa.`
- text: `15 minutes. I'll map where your bookings leak and show you the system I'd build first.`
- Inline GHL booking embed; below it: `Prefer email? Reply to the message I sent you.`

## Case study seed content

Create these six `projects` entries (all `featured: true`, `order` as numbered). Page layout: type label → title → summary → problem → system diagram (from `steps`) → results (client) or designed-to (demo) → tools → gallery/demo video → linked testimonials → `cta` + booking button. Gallery images and demo videos are placeholders until supplied.

### 1. `med-spa-ai-receptionist` — demo · wellness · Med spa

- title: `Every call answered and booked, even mid-treatment`
- summary: `An AI receptionist that answers every call, books consultations into GoHighLevel and hands clinical questions to staff.`
- cardResult: `Demo build · Retell AI + GoHighLevel`
- problem: `A med spa's front desk can't answer the phone while checking clients in or assisting with treatments, and after-hours calls go to voicemail. Most callers don't leave a message; they book with the next clinic.`
- steps: `Call comes in` / `AI receptionist answers using the spa's treatment menu and policies` / `Caller looked up in GoHighLevel to personalise the greeting` / `Consultation booked in the GHL calendar` / `SMS confirmation and reminders sent` / `Call summary and tags saved; clinical questions transferred to staff`
- designedTo: `Answer every call around the clock, book consultations without staff involvement and log every conversation. Medical details are kept out of summaries and texts.`
- tools: Retell AI, GoHighLevel, n8n, Twilio
- demoVideo: `[MEDSPA_DEMO_YOUTUBE_ID]`
- cta: `If your front desk misses calls during treatments, this is the system I'd start with.`

### 2. `studio-mindbody-win-back` — demo · wellness · Gym/Studio

- title: `Turning intro-offer visitors into members with Mindbody and GoHighLevel`
- summary: `Mindbody activity drives automatic follow-up, so every trial client hears from the studio at the right moment.`
- cardResult: `Demo build · Mindbody + n8n + GoHighLevel`
- problem: `Boutique studios sell intro offers, then lose most trial clients after a class or two because nobody follows up at the right moment. Lapsed members drift away quietly.`
- steps: `New client or booking in Mindbody` / `n8n syncs it into GoHighLevel` / `Welcome and first-class booking sequence` / `Post-visit follow-up and member offer timed to the trial ending` / `Missed-class nudge and staff task` / `Win-back sequence after [WIN_BACK_DAYS] days without a visit` / `Trials, conversions and win-backs tracked in a pipeline`
- designedTo: `Follow up every trial client automatically at the moments that matter, while keeping Mindbody API usage low by using webhooks.`
- tools: Mindbody, n8n, GoHighLevel
- demoVideo: `[STUDIO_DEMO_YOUTUBE_ID]`
- cta: `If your intro offers sell but don't convert, let's look at your follow-up.`

### 3. `coach-onboarding-system` — demo · wellness · Coach

- title: `From paid to onboarded, without manual admin`
- summary: `A client lifecycle system for online coaches: payment, onboarding, weekly check-ins and renewals on autopilot.`
- cardResult: `Demo build · GoHighLevel + Stripe`
- problem: `Online coaches repeat the same routine for every client: welcome message, intake form, program access, weekly check-ins and renewal reminders. When one is missed, clients feel forgotten.`
- steps: `Lead books a discovery call` / `Payment through Stripe` / `Welcome, intake form and program access sent` / `Weekly check-in forms with reminders` / `Coach alerted when a client goes quiet` / `Renewal reminder and failed-payment follow-up`
- designedTo: `Run the full client lifecycle so the coach spends time coaching, not chasing admin.`
- tools: GoHighLevel, Stripe, n8n
- demoVideo: `[COACH_DEMO_YOUTUBE_ID]`
- cta: `If onboarding still happens in your inbox, this is the fix.`

### 4. `ecommerce-crm-automation` — client · ecommerce-ops · E-commerce

- title: `Cutting manual operational oversight by roughly 80%`
- clientDescriptor: `a multi-store e-commerce group in Kenya`
- summary: `Shopify orders and customers synced into the CRM in real time, replacing manual data entry and ad-hoc follow-up.`
- cardResult: `~80% less manual oversight`
- problem: `Orders and customers had to be copied into the CRM by hand, and marketing follow-up was ad hoc.`
- steps: `Order or customer created in Shopify` / `n8n workflow picks it up in real time` / `Contact and order synced to Zoho CRM and GoHighLevel` / `Follow-up triggered automatically`
- results: `~80%` — `less manual operational oversight`
- tools: n8n, Shopify, Zoho CRM, GoHighLevel
- cta: `The same capture-and-follow-up pattern is what I build for clinics and studios.`

### 5. `order-inventory-reporting` — client · ecommerce-ops · E-commerce

- title: `Lower overhead, and a 15% shipping-cost gap found`
- clientDescriptor: `an e-commerce coffee business`
- summary: `Order and inventory automation plus a reporting pipeline across multiple Shopify stores.`
- cardResult: `~40% lower operational overhead`
- problem: `Inventory and order processing were manual, and the numbers behind decisions couldn't be trusted.`
- steps: `Order and inventory processing automated` / `n8n pulls sales and operational data from multiple Shopify stores` / `CAC, LTV, AOV, churn and fulfilment costs modelled in PostgreSQL` / `Power BI dashboards compare stores`
- results: `~40%` — `lower operational overhead`; `15%` — `gap found between reported and actual shipping costs`
- tools: n8n, Shopify, PostgreSQL, Power BI
- cta: `If your numbers live in five different tools, let's connect them.`

### 6. `operations-reporting` — client · ecommerce-ops · Operations

- title: `10+ hours a week back from manual reporting`
- clientDescriptor: `a real estate platform`
- summary: `Scheduled reporting workflows that collect, transform and deliver operational data automatically.`
- cardResult: `10+ hours saved per week`
- problem: `Operational reports were compiled by hand every week.`
- steps: `Scheduled data collection` / `Transformation and checks` / `Report delivered to the team`
- results: `10+ hours` — `saved per week`; plus text: `More accurate data behind decisions`
- tools: `[CASE_6_TOOLS]`
- cta: `If someone on your team builds the same report every week, that's the first thing to automate.`

### Other work (one line under the work grid, no pages)

`Also built: StoreLink, a multi-platform inventory sync for Shopify, Square and Etsy · a remote-jobs platform for the Kenyan market · a real estate marketing website · a natural foods Shopify store.`

## Components and behaviour

### BookingModal and BookingEmbed (GoHighLevel)

- Source: `settings.ghlCalendarEmbedUrl` (the calendar's embed/share URL from GoHighLevel). Load GoHighLevel's embed script only when the modal opens or the inline embed scrolls into view.
- Modal: `role="dialog"`, labelled heading, focus trapped, Esc and close button close it, focus returns to the trigger, background scroll locked.
- If UTM parameters were captured (see below), append them to the embed URL.
- Fallback: if the URL is empty or the embed fails to load, show a button that opens the booking page in a new tab and an email link.
- Fire an analytics event `book_call_open` on open (if analytics is configured).

### VideoLite (YouTube)

- Props: the `video` object. Render the poster image with alt text, a large accessible play button (`aria-label="Play video: {title}"`) and the duration label.
- On click, swap in an iframe from `youtube-nocookie.com` with autoplay, captions on (`cc_load_policy=1`) and `rel=0`; set a descriptive iframe `title`.
- Never load YouTube scripts before the click. Provide a "Read transcript" disclosure below every video using `transcript`.
- In the hero, the poster sits inside the glass video frame; with reduced motion, no hover zoom.

### Testimonials

- Query only `permissionToPublish = true`. Text: quote, name, role, company (only if `nameApproved`), source label. Video: VideoLite + name/role + transcript.
- If no testimonial qualifies for a section, render nothing (no empty headings).

### WorkGrid and filter

- Chips `All`, `Health & wellness`, `E-commerce & operations`, as `button` elements with `aria-pressed`. Without JavaScript, all cards show.
- Card: whole card is one link; type label in mono ("Demo build" or "Client project").

### SystemDiagram

- Input: `steps`. Visual treatment follows the approved direction (e.g. nodes and connectors that build in sequence as the section scrolls into view).
- Must be real HTML text (not canvas) so it is readable and indexable; on mobile it stacks vertically; with reduced motion it renders as a static ordered list.

### Results

- Client projects: large Geist Mono numbers with labels from `results`. Demo projects: render `designedTo` under the heading "What it's designed to do" and never show the results block.

### UTM capture and personalisation

- On any page, read `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` from the URL and keep them in `sessionStorage` (wrapped in try/catch) for the booking embed.
- On `/med-spas`, read `spa`; allow only letters, numbers, spaces, apostrophes, ampersands and hyphens, trim to 40 characters, render as text (never HTML). If invalid or missing, show the default eyebrow.

### ThemeToggle

- Button with accessible label; sets `data-theme` on `<html>`; remembers choice in `localStorage` (try/catch); set the theme before first paint to avoid a flash.

### 3D element (only if the approved direction includes one)

- Framework island loaded with a dynamic import after first paint and only when visible; device pixel ratio capped at 2; paused when off-screen or the tab is hidden.
- Static image or CSS fallback on screens under 768px, low-power devices and `prefers-reduced-motion`.
- Decorative only: never covers text, the intro video or the call to action.

## SEO and acceptance checks

### Metadata

| Page | Title | Description |
| --- | --- | --- |
| `/` | `Benson Gitau — Automation for Wellness Businesses` | `Automation and AI voice systems that answer every call, follow up every lead and fill the calendar for med spas, clinics, gyms and coaches.` |
| `/med-spas` | `AI Receptionist & Follow-Up for Med Spas — Benson Gitau` | `Stop losing consultations to voicemail. Calls answered, leads followed up and no-shows recovered, connected to your booking platform.` |
| `/work/[slug]` | `{title} — Benson Gitau` | `{summary}` |

- Canonical URLs from `settings.siteUrl`; Open Graph and Twitter tags on every page; 1200×630 share images generated from each project's `coverImage` (fallback `settings.defaultShareImage`).
- `sitemap.xml` and `robots.txt`; exclude `/keystatic`.
- Structured data: `Person` on home (name, jobTitle "AI & Automation Specialist", sameAs LinkedIn/GitHub/X); `Service` for each services card.

### Acceptance checks (all must pass before final report)

- [ ] WCAG AA contrast in dark and light themes, including text over glass and on accent buttons
- [ ] Full keyboard use: nav, filter, video play, booking modal, FAQ accordion; visible focus states
- [ ] `prefers-reduced-motion`: no parallax, scroll-linked or 3D motion; diagrams static; hero cards static
- [ ] `prefers-reduced-transparency` and no `backdrop-filter` support: solid surfaces
- [ ] Layout works from 320px wide with no horizontal scroll; touch targets ≥ 44px
- [ ] Lighthouse on mobile: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100; LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] No YouTube or GoHighLevel scripts load before user interaction or scroll into view
- [ ] Demo projects never show results; client names hidden unless approved; unapproved testimonials absent from build output
- [ ] Every image has alt text; every video has a transcript
- [ ] All placeholders listed in the final report

## Placeholders

Store each value where listed, render it visibly marked in development, and list any still empty in your final report. Do not guess values.

| Placeholder | Where it lives |
| --- | --- |
| `[GHL_CALENDAR_EMBED_URL]` | `settings.ghlCalendarEmbedUrl` |
| `[INTRO_VIDEO_YOUTUBE_ID]`, `[INTRO_VIDEO_TRANSCRIPT]` | `home.hero.introVideo` |
| `[MEDSPA_DEMO_YOUTUBE_ID]` | `medSpaPage` demo video and project 1 `demoVideo` |
| `[STUDIO_DEMO_YOUTUBE_ID]` | project 2 `demoVideo` |
| `[COACH_DEMO_YOUTUBE_ID]` | project 3 `demoVideo` |
| `[WIN_BACK_DAYS]` | project 2 steps |
| `[CASE_6_TOOLS]` | project 6 tools |
| `[AGENCY NAME]`, `[AGENCY URL]` | `settings.agencyName`, `settings.agencyUrl` |
| `[SITE_URL]` | `settings.siteUrl` |
| Photos: hero video poster, about photo | `home.hero.introVideo.poster`, `home.about.photo` |
| Project cover images and gallery screenshots | each `projects` entry |
| Testimonials | `testimonials` collection; none published until `permissionToPublish` is true |

Known values: email `bensonkgitau@gmail.com`; LinkedIn `https://www.linkedin.com/in/benson-gitau-b89b6b191/`; GitHub `https://github.com/BennyGitau`; X `https://x.com/benny_gitau`.
