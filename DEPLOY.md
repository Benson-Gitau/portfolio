# Deploying the portfolio

The site deploys to **Cloudflare Workers** using **Workers Builds**, Cloudflare's own GitHub integration. Pushing to `main` builds and deploys production. Other branches and pull requests get preview URLs, and production is untouched. There are no GitHub Actions, no API tokens and no GitHub secrets.

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

## 2. Create the Worker from the repo

Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → authorise Cloudflare on GitHub if asked → pick **Benson-Gitau/portfolio**.

On the configure screen:

| Setting | Value |
| --- | --- |
| Project name | `benson-gitau-portfolio` (must match `name` in `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` (leave empty) |
| Production branch | `main` |
| Builds for non-production branches | enabled |

Under **Advanced settings → Build variables**, add `NODE_VERSION` = `24`. This matches `.nvmrc`, which Cloudflare also reads. `PUBLIC_SITE_URL` is optional: `settings.siteUrl` already gives `https://bensongitau.dev`. If you add it, it must be exactly that.

Select **Save and Deploy**. The first build creates the Worker and takes a few minutes. Watch it under Worker → **Deployments** → **View build**.

Find the live URL in Cloudflare → **Workers & Pages** → **benson-gitau-portfolio**. To redeploy without a new commit: Worker → **Deployments** → latest build → **Retry build**.

## 3. Connect Keystatic Cloud to the repo

The code already points at the Cloud project `benson-portfolio/portfolio` (`keystatic.config.ts`).

1. Go to [keystatic.cloud](https://keystatic.cloud) and sign in with GitHub.
2. Open the team **benson-portfolio** → project **portfolio**.
3. In the project's settings, connect the GitHub repository **Benson-Gitau/portfolio**. When GitHub asks where to install the Keystatic Cloud app, choose **Only select repositories** → **Benson-Gitau/portfolio** → **Install**.
4. If the project asks for your site's URL, use `https://bensongitau.dev`.
5. To let someone else edit, invite them to the team in Keystatic Cloud. They also need write access to the GitHub repo.

Optional, to test before deploying: stop any running `npm run dev`, run `npm run dev:cloud`, open `http://127.0.0.1:4321/keystatic` and log in. Saving here commits to GitHub too. Go back to everyday editing with `npm run dev`.

**If you set up the old GitHub mode or GitHub Actions earlier**, clean it up. None of these are read any more:
- The `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and `KEYSTATIC_SECRET` secrets on the Worker (Settings → Variables and Secrets), and the same lines in your local `.env`.
- The old Keystatic GitHub App (GitHub → Settings → Developer settings → GitHub Apps).
- The GitHub repo's Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and any Actions variables (repo Settings → Secrets and variables → Actions). Then delete that API token in Cloudflare (My Profile → API Tokens).

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
5. **Check the build URL.** `settings.siteUrl` is already `https://bensongitau.dev`. If you set a `PUBLIC_SITE_URL` build variable (step 2), it must be exactly that: https, apex, no trailing slash. Retry the build after any change.

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
5. In Cloudflare → Worker → **Deployments**, a build starts for that commit and succeeds. Reload the site to see the change.
6. Undo the test edit the same way.

## 6. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Browser shows **"Too many redirects"** (`ERR_TOO_MANY_REDIRECTS`) | SSL/TLS mode is Flexible. Set it to **Full (strict)** (step 4.4). |
| `bensongitau.dev` won't attach as a custom domain | The zone isn't on this Cloudflare account, or it's still **Pending** while nameservers propagate (step 4.1). |
| `www.bensongitau.dev` doesn't redirect | The Redirect Rule is missing or not deployed, or `www` has no proxied (orange-cloud) DNS record. Adding `www` as a Worker custom domain creates one (step 4.2–4.3). |
| Keystatic login says you don't have access to the project | Your Keystatic Cloud account isn't in the `benson-portfolio` team, or the project name in `keystatic.config.ts` doesn't match the one in Keystatic Cloud (step 3). |
| Saving in Keystatic fails, or it can't find the repo | The repo isn't connected to the Cloud project, the Keystatic Cloud GitHub app isn't installed on `Benson-Gitau/portfolio`, or your GitHub account lacks write access (step 3). |
| Build fails at `npm ci` with **"Missing: … from lock file"** | `package-lock.json` was written by an older npm. Regenerate it with a current npm (`npm install -g npm@latest`, then `npm install`) and commit it. |
| A build seems stuck for more than 10 minutes | Open the build log (Deployments → View build) to see the step. Cancel and **Retry build**. |
| Deploy fails because the Worker name doesn't match | The Worker's name in Cloudflare must equal `name` in `wrangler.jsonc` (`benson-gitau-portfolio`). |
| Logs show `No such module "node:…"` or another Node API error | `nodejs_compat` is missing. It's set in `wrangler.jsonc` under `compatibility_flags`. Don't remove it. |
| `/keystatic` returns **404** | The route was prerendered or the Worker isn't running. Check the build log shows `adapter: @astrojs/cloudflare`, and that the deploy step shows `npx wrangler deploy` uploading a Worker, not only assets. |
| Build fails at `npm ci` or with an engines error | The Node version comes from `.nvmrc` (24). Keep it in step with `engines` in `package.json`. |
| The calendar or a video doesn't load on the live site | The Content Security Policy in `public/_headers` blocks its domain. If GoHighLevel uses a white-label domain, add it to `script-src` and `frame-src`. |

## Local commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server, Keystatic in local mode |
| `npm run dev:cloud` | Dev server, Keystatic in Cloud mode (saves commit to GitHub) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the build on workerd, Cloudflare's runtime, at `localhost:4321` |
