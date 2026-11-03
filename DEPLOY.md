# Deploying the portfolio

The site deploys to **Cloudflare Workers** using **Workers Builds**, Cloudflare's own GitHub integration. Pushing to `main` deploys production. Other branches and pull requests get preview URLs. There are no GitHub Actions and no GitHub secrets.

> Why Workers and not Pages: the Astro Cloudflare adapter this site uses (v14, for Astro 7) no longer supports Pages. The flow is the same; only the dashboard paths differ.

How it fits together:

- **Public pages:** every page is a static file. Content changes need a rebuild.
- **The Worker:** runs only `/keystatic` and `/api/keystatic`.
- **Editing locally:** `npm run dev`, then `localhost:4321/keystatic`. This is local mode: it edits files on disk, with no login.
- **Editing live:** `https://<domain>/keystatic`. This is GitHub mode: saving commits to `main`, which triggers a redeploy (about 1–2 minutes).

Never paste secret values into chat, commits or issues.

---

## 1. Push the repo to GitHub

```sh
git push origin main
```

The repo is `Benson-Gitau/portfolio`.

## 2. Create the Worker from the repo

Cloudflare dashboard → **Workers & Pages** → **Create application** → **GitHub** (under "Import a repository") → authorise Cloudflare on GitHub if asked → pick **Benson-Gitau/portfolio**.

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

Under **Advanced settings → Build variables**, add `NODE_VERSION` = `24`. This matches `.nvmrc`, which Cloudflare also reads.

Select **Save and Deploy**. The first deploy works without any Keystatic variables: the public site is fully static, and `/keystatic` shows "Keystatic is not configured" until step 5.

Then check that preview URLs are on: Worker → **Settings** → **Domains & Routes** → **workers.dev** and **Preview URLs** both **Enabled**.

## 3. Create the Keystatic GitHub App (once, on your computer)

1. Stop any running `npm run dev`. Astro allows one dev server per project.
2. Run Keystatic in GitHub mode locally:

   ```sh
   npm run dev:github
   ```

   This is `npm run dev` with `PUBLIC_KEYSTATIC_STORAGE=github`.
3. Open `http://127.0.0.1:4321/keystatic`. Keystatic offers to create a GitHub App.
   - In **Deployed App URL**, enter your live URL. If you don't have the custom domain yet, use the `https://benson-gitau-portfolio.<your-subdomain>.workers.dev` address from step 2.
   - Leave the organisation blank.
4. Select **Create GitHub App**, name it (for example `benson-gitau-keystatic`), and confirm.
5. When GitHub asks where to install it, choose **Only select repositories** → **Benson-Gitau/portfolio** → **Install**.

Keystatic writes `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` into `.env`. `.env` is gitignored, so check it never appears in `git status`.

Go back to everyday editing with `npm run dev`, which uses local mode.

## 4. Point the GitHub App at the live site

GitHub → your avatar → **Settings** → **Developer settings** → **GitHub Apps** → your app → **Edit** (direct link: `https://github.com/settings/apps/<app-slug>`).

Under **Callback URL**, select **Add Callback URL** for each of these:

- `https://<your-domain>/api/keystatic/github/oauth/callback`
- `https://benson-gitau-portfolio.<your-subdomain>.workers.dev/api/keystatic/github/oauth/callback`
- `http://127.0.0.1:4321/api/keystatic/github/oauth/callback` (keeps `npm run dev:github` working)

Select **Save changes**.

Then make sure the app is installed on the repo: **Install App** (left menu) → your account → **Only select repositories** includes `portfolio`.

Branch preview URLs change per version. Use Keystatic on the production URL, not on previews.

## 5. Add the variables to Cloudflare

Copy each value from your local `.env`, without pasting it anywhere else. Values go in two places.

**Runtime secrets:** Worker → **Settings** → **Variables and Secrets** → **Add**. Set Type to **Secret** for each:

| Name | Value from `.env` |
| --- | --- |
| `KEYSTATIC_GITHUB_CLIENT_ID` | yes |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | yes |
| `KEYSTATIC_SECRET` | yes |

**Build variables:** Worker → **Settings** → **Build** → **Variables and secrets** → **Add**. These are plain text, because they are baked into the static pages and the admin at build time:

| Name | Value |
| --- | --- |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | from `.env` |
| `PUBLIC_SITE_URL` | `https://<your-domain>` (or the workers.dev URL for now) |
| `PUBLIC_KEYSTATIC_REPO_OWNER` | `Benson-Gitau` |
| `PUBLIC_KEYSTATIC_REPO_NAME` | `portfolio` |
| `NODE_VERSION` | `24` (already added in step 2) |

Previews use the same values unless you override them.

Redeploy: Worker → **Deployments** → latest build → **Retry build**. Or push any commit.

## 6. Add the custom domain

The domain must already be a zone on your Cloudflare account. Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → enter it (e.g. `bensongitau.com`) → **Add domain**. Repeat for `www.` if you want it.

Then:

1. Set the `PUBLIC_SITE_URL` build variable to `https://<your-domain>` (step 5), and **Retry build**. Canonical URLs, share images, the sitemap and the `robots.txt` sitemap line all come from this value.
2. In the GitHub App, check the callback URL for that domain is listed (step 4).
3. Optional: in Keystatic → **Settings**, set **Site URL** to the same value.

## 7. Smoke test

1. Open `https://<your-domain>/`, `/med-spas`, `/work/med-spa-ai-receptionist` and a made-up URL (it should show the 404 page).
2. Open `https://<your-domain>/keystatic` → **Log in with GitHub** → authorise.
3. Open **Testimonials** → any entry → change one character → **Save**.
4. On GitHub, a new commit by your account appears on `main`.
5. In Cloudflare, under Worker → **Deployments**, a new build starts and finishes. Reload the site to see the change.
6. Undo the test edit the same way.

## 8. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| GitHub says **"The redirect_uri is not associated with this application"** | The callback URL doesn't match exactly. Check the scheme, domain, `www.` and the path `/api/keystatic/github/oauth/callback` (step 4). |
| `/keystatic` shows **"Keystatic is not configured"** | Some values are missing, and the page lists which ones. `KEYSTATIC_*` go in **Variables and Secrets** as secrets. `PUBLIC_*` go in **Build → Variables and secrets**. Retry the build after adding them. |
| A variable vanished after a deploy | Plain-text runtime variables added in the dashboard are replaced by `wrangler deploy`. Keep `PUBLIC_*` as **build** variables and `KEYSTATIC_*` as **secrets**, which survive deploys. |
| Logs show `No such module "node:…"` or another Node API error | `nodejs_compat` is missing. It's set in `wrangler.jsonc` under `compatibility_flags`. Don't remove it. |
| `/keystatic` returns **404** | The route was prerendered or the Worker isn't running. Check the build log shows `adapter: @astrojs/cloudflare`, and that the deploy command is `npx wrangler deploy` (not a static-assets-only upload). |
| Build fails at `npm ci` or with an engines error | The Node version is wrong. Check `NODE_VERSION` = `24`. |
| Saving in Keystatic fails with a permissions error | The GitHub App isn't installed on the repo, or your account lacks write access (step 4). |
| The calendar or a video doesn't load on the live site | The Content Security Policy in `public/_headers` blocks its domain. If GoHighLevel uses a white-label domain, add it to `script-src` and `frame-src`. |

## Local commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server, Keystatic in local mode |
| `npm run dev:github` | Dev server, Keystatic in GitHub mode (for step 3) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the build on workerd, Cloudflare's runtime, at `localhost:4321`. Put local test secrets in `.dev.vars`, never real ones you don't need. |
