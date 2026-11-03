# To do

Open items after the soft-wash editorial homepage build (2026-11-03). Placeholders show, marked, in development and are hidden in production until filled in.

## Content needed from Benson

Add these in Keystatic (`/keystatic`) unless a file path is given.

- [ ] **Intro video YouTube ID**: Home → About → Intro video YouTube ID (replaces `[INTRO_VIDEO_YOUTUBE_ID]`). This also turns on the hero's "Watch intro" button.
- [ ] **Intro video transcript**: Home → About → Intro transcript (replaces `[INTRO_VIDEO_TRANSCRIPT]`).
- [ ] **Intro video duration**: Home → About → Intro duration. It is set to "1:30" from the brief; confirm it matches the real video.
- [ ] **Upwork profile URL**: Settings → Upwork URL (replaces `[UPWORK_URL]`).
- [ ] **Fiverr profile URL**: Settings → Fiverr URL (replaces `[FIVERR_URL]`).
- [ ] **Equity Bank years**: Home → About → Timeline → Operations (replaces `[Years]`).
- [ ] **Four panel screenshots**: Projects → each home project → Panel image. The panel appears in production only when all four exist.
  - [ ] After-Hours AI Receptionist: AI receptionist call log
  - [ ] Med Spa Speed-to-Lead: speed-to-lead SMS thread
  - [ ] Clinic No-Show Recovery: no-show recovery workflow
  - [ ] Gym Trial-to-Member: trial-to-member pipeline
- [ ] **Four work-card covers**: Projects → each home project → Cover image.
- [ ] **Med Spa Speed-to-Lead case study**: title, summary, problem, steps and "designed to" text. Its page stays out of production until the title, summary and problem are filled in.
- [ ] **Clinic No-Show Recovery case study**: the same fields as Med Spa Speed-to-Lead.
- [ ] **Real reviews**: add them in Testimonials with "Permission to publish" ticked. Then delete the five `seed-*` files in `src/content/testimonials/`.
- [ ] **Med spa demo video**: the YouTube ID, transcript and a poster image (Med spa page → Demo video). Until the ID is in, the demo section and its button stay hidden in production.
- [ ] **`[WIN_BACK_DAYS]`**: the Gym Trial-to-Member (studio-mindbody-win-back) case study steps.

## Build work still open

- [x] Add Services to the header and footer (done 2026-11-03).
- [ ] Confirm any "From" prices for services (Home → Services → Price from). Left empty until confirmed.
- [ ] Review the screenshots in `docs/screenshots/soft-wash/` and approve the homepage or send changes.
- [ ] Run the taste and Emil Kowalski skill review passes on the homepage.
- [ ] Commit the homepage work. Only the checkpoint `bace2ff` is committed so far.
- [ ] **Deploy**: follow DEPLOY.md steps 1–7 (Cloudflare Worker from the repo, Keystatic GitHub App, variables, custom domain, smoke test).
- [x] Restyle /med-spas in the soft-wash direction (done 2026-11-03). Review `docs/screenshots/soft-wash/med-spas-forest-*`.
- [ ] Restyle the case-study pages (`/work/[slug]`), removing their checkmark ticks.
- [ ] Update the impeccable homepage notes (`.impeccable/surfaces/src-pages-index-astro.md`) to describe the new design.
