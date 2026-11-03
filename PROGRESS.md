# Progress

## Soft-wash editorial homepage

- 2026-11-03: Wrote PLAN.md from the soft-wash editorial brief. Read keystatic config, global.css, homepage and content. Pre-checked contrast for all six palettes (results in PLAN.md). Waiting for Benson's approval before Step 0.
- 2026-11-03: Benson approved the plan via four decisions (projects, dark mode, checkpoint, review gates), logged in DECISIONS.md. Checkpoint commit bace2ff.
- 2026-11-03: Steps 1–10 built. Palettes and washes in global.css; Keystatic palette, home, projects, testimonials and settings fields; Vagaro added; new header, hero, tool row, panel, Jambo, process, work, reviews, about, final call to action and footer; reveal script rewritten; old Showcase, Leaks, Services and ThemeToggle deleted.
- 2026-11-03: Step 11 checks. Production build passes; draft demo pages, seed reviews, the empty panel and [Years] are absent from production output. No horizontal scroll at 390px. Impeccable detector: no findings. Screenshots in docs/screenshots/soft-wash/ (forest sections at 1440 and 390, plus full pages for all six palettes). Waiting for Benson before /med-spas.
- 2026-11-03: Services section restored (Keystatic home.services, Services.astro, structured data). Screenshots: docs/screenshots/soft-wash/forest-{1440,390}-06b-services.png. No horizontal scroll at either width.
- 2026-11-03: Services link added to the header (desktop and mobile menu) and footer. Checked at 1440, 860 (tightest desktop header) and 390: no overlap, no horizontal scroll.
- 2026-11-03: Section spacing reduced on all pages. Home is now 7515px tall at 1440px. Measured gaps between sections: about 150px on desktop, 96px on phones.
- 2026-11-03: /med-spas fully restyled in soft-wash with the spec copy unchanged; shared VideoPlayer extracted; booking components tokenised. Production build passes. Screenshots: docs/screenshots/soft-wash/med-spas-forest-*. No horizontal scroll at 390px. The ?spa= personalisation still works.
- 2026-11-03: **Deploy setup (Cloudflare Workers + Workers Builds).**
  - Changed: Keystatic switches storage (GitHub in production, local in dev, `npm run dev:github` to force GitHub mode), with secrets read at runtime. Added `src/middleware.ts` (the "not configured" page and noindex), `public/_headers` (security headers and CSP), `.env.example`, `.nvmrc` (24) and `engines`. `site` comes from `PUBLIC_SITE_URL`; the sitemap excludes `/api/`; `wrangler.jsonc` was cleaned up. Wrote DEPLOY.md.
  - Verified locally:
    - `npm run build` is clean. The only warnings are the existing `[WIN_BACK_DAYS]` placeholder and the Keystatic admin chunk size; there are no Node API warnings.
    - On workerd (`astro preview`), `/`, `/med-spas`, `/work/med-spa-ai-receptionist`, a 404, `/robots.txt` and the headers all behave, and there are no CSP violations in the browser.
    - With no variables, `/keystatic` returns 503 "not configured". With dummy values, it returns 200 and "Log in with GitHub", and `/api/keystatic/github/login` redirects 307 to GitHub with the callback `/api/keystatic/github/oauth/callback`. The dummy secrets are not in `dist`.
    - In dev, `/keystatic` works in local mode.
  - Lighthouse, home page (built, workerd preview):
    - Mobile: Performance 95, Accessibility 100, Best Practices 100, SEO 100 (LCP 2.7s, CLS 0, TBT 0ms).
    - Desktop: 100, 100, 100, 100 (LCP 0.6s).
  - Not verified: the real Cloudflare deploy, the GitHub OAuth round trip, and a commit from the live admin. These need Benson's accounts (DEPLOY.md, steps 2–7).
