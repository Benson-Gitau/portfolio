# Deploying the portfolio

The site deploys to **Cloudflare Workers** from **GitHub Actions** (`.github/workflows/deploy.yml`). Pushing to `main` builds and deploys production. A pull request gets its own preview URL, `https://pr-<number>-benson-gitau-portfolio.<subdomain>.workers.dev`, and production is untouched. The workflow logs in to Cloudflare with an API token and account ID stored as GitHub secrets.

> Why Workers and not Pages: the Astro Cloudflare adapter this site uses (v14, for Astro 7) no longer supports Pages.

**Domain:** production is **`https://bensongitau.dev`** (apex). `www.bensongitau.dev` redirects permanently (301) to the apex. Always https, never http. The apex is the value of `PUBLIC_SITE_URL` and `settings.siteUrl`, so it drives `site` in `astro.config.mjs`, canonical URLs, Open Graph URLs, the sitemap and the `robots.txt` sitemap line. Setup is in step 4.

How it fits together:

- **Public pages:** every page is a static file. Content changes need a rebuild.
- **The Worker:** runs only `/keystatic` and `/api/keystatic`.
- **Editing locally:** `npm run dev`, then `localhost:4321/keystatic`. This is local mode: it edits files on disk, with no login.
- **Editing live:** `https://bensongitau.dev/keystatic`. This uses **Keystatic Cloud** (project `benson-portfolio/portfolio`): you log in with your Keystatic Cloud account, and saving commits to `main` on GitHub, which triggers a redeploy (about 1–2 minutes). There are no Keystatic secrets to manage.

Never paste secret values into chat, commits or issues.

---

## 1. Push the repo to GitHub

```sh
git push origin main
```

The repo is `Benson-Gitau/portfolio`.

## 2. GitHub secrets and variables for the workflow

GitHub → repo **Settings** → **Secrets and variables** → **Actions**.

**Secrets** tab → **New repository secret**:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token made from the **Edit Cloudflare Workers** template (Cloudflare → My Profile → API Tokens → Create Token) |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID (Cloudflare → Workers & Pages → right-hand sidebar) |

The workflow expects exactly these names. If yours are named differently, rename them or tell me and I'll change the workflow.

**Variables** tab (optional): `PUBLIC_SITE_URL` = `https://bensongitau.dev`. The workflow and `settings.siteUrl` already default to it, so you only need this to override it.

To deploy: push to `main`, or go to the **Actions** tab → **Deploy** → **Run workflow**. The first deploy creates the `benson-gitau-portfolio` Worker.

Find the live URL in Cloudflare → **Workers & Pages** → **benson-gitau-portfolio**, or in the deploy step's log.

Don't also connect the repo through Cloudflare's own Git integration (Workers Builds), or every push will deploy twice.

## 3. Connect Keystatic Cloud to the repo

The code already points at the Cloud project `benson-portfolio/portfolio` (`keystatic.config.ts`).

1. Go to [keystatic.cloud](https://keystatic.cloud) and sign in with GitHub.
2. Open the team **benson-portfolio** → project **portfolio**.
3. In the project's settings, connect the GitHub repository **Benson-Gitau/portfolio**. When GitHub asks where to install the Keystatic Cloud app, choose **Only select repositories** → **Benson-Gitau/portfolio** → **Install**.
4. If the project asks for your site's URL, use `https://bensongitau.dev`.
5. To let someone else edit, invite them to the team in Keystatic Cloud. They also need write access to the GitHub repo.

Optional, to test before deploying: stop any running `npm run dev`, run `npm run dev:cloud`, open `http://127.0.0.1:4321/keystatic` and log in. Saving here commits to GitHub too. Go back to everyday editing with `npm run dev`.

**If you set up the old GitHub mode earlier**, clean it up: delete the `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and `KEYSTATIC_SECRET` secrets on the Worker (Settings → Variables and Secrets), the `PUBLIC_KEYSTATIC_*` GitHub Actions variables, the same lines in your local `.env`, and the old Keystatic GitHub App (GitHub → Settings → Developer settings → GitHub Apps). None of them are read any more.

## 4. Add the custom domain

Production domain: `bensongitau.dev` (apex), with `www.bensongitau.dev` redirecting to it.

1. **Put the zone on Cloudflare.** Make sure `bensongitau.dev` is a zone in your Cloudflare account (Cloudflare dashboard → **Add a domain** if it isn't listed). If the domain is registered elsewhere, add the site in Cloudflare, then switch the nameservers at your registrar to the two Cloudflare gives you, and wait for the zone to show **Active**. An apex custom domain only works when the zone is on Cloudflare.
2. **Attach both hostnames to the Worker.** Workers & Pages → **benson-gitau-portfolio** → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → `bensongitau.dev` → **Add domain**. Repeat for `www.bensongitau.dev`. Cloudflare creates the DNS records and certificates for both. (This is the Workers equivalent of a Pages project's **Custom domains** tab.)
3. **Redirect www to the apex.** In the `bensongitau.dev` zone → **Rules** → **Redirect Rules** → **Create rule**:
   - Name: `www to apex`
   - When incoming requests match: **Wildcard pattern**, request URL `https://www.bensongitau.dev/*`
   - Then: target URL `https://bensongitau.dev/${1}`, status code **301**, **Preserve query string** on.
   - **Deploy**. The rule runs before the Worker, so `www` traffic never reaches it.
4. **TLS.** In the zone → **SSL/TLS** → **Overview**: set the encryption mode to **Full (strict)**. Then **SSL/TLS** → **Edge Certificates**: turn on **Always Use HTTPS**.
5. **Check the build URL.** `PUBLIC_SITE_URL` and `settings.siteUrl` are already `https://bensongitau.dev`. If you set the GitHub variable (step 2), it must be exactly that: https, apex, no trailing slash. Run the **Deploy** workflow after any change.

Log in to the editor at `https://bensongitau.dev/keystatic`, not on `www` (it redirects) or on PR preview URLs.

Verify:

- `https://www.bensongitau.dev/work/med-spa-ai-receptionist?x=1` → 301 to `https://bensongitau.dev/work/med-spa-ai-receptionist?x=1`.
- `http://bensongitau.dev/` → redirects to `https://bensongitau.dev/`.
- View source on the home page: `<link rel="canonical" href="https://bensongitau.dev/">` and `og:url` on the apex.
- `https://bensongitau.dev/robots.txt` ends with `Sitemap: https://bensongitau.dev/sitemap-index.xml`.

**Turnstile (only if a Turnstile widget is added later):** the site has no Turnstile widget today. If one is added, list these hostnames on the widget (Cloudflare → Turnstile → widget → **Hostname management**): `bensongitau.dev`, `www.bensongitau.dev`, `benson-gitau-portfolio.<your-subdomain>.workers.dev`, and allow `https://challenges.cloudflare.com` in `script-src` and `frame-src` of the CSP in `public/_headers`.

## 5. Smoke test

1. Open `https://bensongitau.dev/`, `/med-spas`, `/work/med-spa-ai-receptionist` and a made-up URL (it should show the 404 page).
2. Open `https://bensongitau.dev/keystatic` → log in with Keystatic Cloud.
3. Open **Testimonials** → any entry → change one character → **Save**.
4. On GitHub, a new commit appears on `main`.
5. On GitHub → **Actions**, a **Deploy** run starts for that commit and goes green. Reload the site to see the change.
6. Undo the test edit the same way.

## 6. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Browser shows **"Too many redirects"** (`ERR_TOO_MANY_REDIRECTS`) | SSL/TLS mode is Flexible. Set it to **Full (strict)** (step 4.4). |
| `bensongitau.dev` won't attach as a custom domain | The zone isn't on this Cloudflare account, or it's still **Pending** while nameservers propagate (step 4.1). |
| `www.bensongitau.dev` doesn't redirect | The Redirect Rule is missing or not deployed, or `www` has no proxied (orange-cloud) DNS record. Adding `www` as a Worker custom domain creates one (step 4.2–4.3). |
| Keystatic login says you don't have access to the project | Your Keystatic Cloud account isn't in the `benson-portfolio` team, or the project name in `keystatic.config.ts` doesn't match the one in Keystatic Cloud (step 3). |
| Saving in Keystatic fails, or it can't find the repo | The repo isn't connected to the Cloud project, the Keystatic Cloud GitHub app isn't installed on `Benson-Gitau/portfolio`, or your GitHub account lacks write access (step 3). |
| Deploy run fails with **Authentication error [code: 10000]** or asks for an account | `CLOUDFLARE_API_TOKEN` is missing, expired or lacks Workers edit permission, or `CLOUDFLARE_ACCOUNT_ID` is wrong (step 2). |
| Every push deploys twice | The repo is also connected through Cloudflare's Git integration. Disconnect it: Worker → Settings → Builds → Disconnect. |
| Logs show `No such module "node:…"` or another Node API error | `nodejs_compat` is missing. It's set in `wrangler.jsonc` under `compatibility_flags`. Don't remove it. |
| `/keystatic` returns **404** | The route was prerendered or the Worker isn't running. Check the build log shows `adapter: @astrojs/cloudflare`, and that the Actions log shows `npx wrangler deploy` uploading a Worker, not only assets. |
| Build fails at `npm ci` or with an engines error | The Node version comes from `.nvmrc` (24). Keep it in step with `engines` in `package.json`. |
| The calendar or a video doesn't load on the live site | The Content Security Policy in `public/_headers` blocks its domain. If GoHighLevel uses a white-label domain, add it to `script-src` and `frame-src`. |

## Local commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server, Keystatic in local mode |
| `npm run dev:cloud` | Dev server, Keystatic in Cloud mode (saves commit to GitHub) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the build on workerd, Cloudflare's runtime, at `localhost:4321` |
