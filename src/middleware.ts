import { defineMiddleware } from 'astro:middleware';
import { getSecret } from 'astro:env/server';

/**
 * Only the Keystatic routes run on the Worker; every other page is a static file and never
 * reaches this code. In production:
 * - if any Keystatic variable is missing, /keystatic and /api/keystatic answer with a plain
 *   "Keystatic is not configured" page (503) naming the missing variables, never their values;
 * - every Keystatic response carries X-Robots-Tag: noindex.
 */
const REQUIRED_SECRETS = ['KEYSTATIC_GITHUB_CLIENT_ID', 'KEYSTATIC_GITHUB_CLIENT_SECRET', 'KEYSTATIC_SECRET'] as const;

const isKeystatic = (path: string) => /^\/(api\/)?keystatic(\/|$)/.test(path);

function missingVariables() {
  const missing: string[] = REQUIRED_SECRETS.filter((name) => !getSecret(name));
  // Inlined at build time, so it must be a build variable as well as a runtime one.
  if (!import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG) missing.push('PUBLIC_KEYSTATIC_GITHUB_APP_SLUG');
  return missing;
}

const notConfigured = (missing: string[]) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Keystatic is not configured</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f2ea;color:#0f1a14;font:16px/1.55 system-ui,sans-serif}main{max-width:34rem;padding:2rem}h1{font-weight:500;font-size:1.75rem;margin:0 0 .75rem}code{font-size:.9em}li{margin:.25rem 0}</style></head>
<body><main>
<h1>Keystatic is not configured</h1>
<p>The editor needs these values in Cloudflare, then a redeploy:</p>
<ul>${missing.map((name) => `<li><code>${name}</code></li>`).join('')}</ul>
<p><code>KEYSTATIC_*</code> go under the Worker's Settings → Variables and Secrets, as secrets. <code>PUBLIC_*</code> are GitHub Actions variables (repo Settings → Secrets and variables → Actions → Variables). The public site is unaffected. See DEPLOY.md, step 5.</p>
</main></body></html>`;

export const onRequest = defineMiddleware(async (context, next) => {
  if (!import.meta.env.PROD || !isKeystatic(context.url.pathname)) return next();

  const missing = missingVariables();
  if (missing.length) {
    return new Response(notConfigured(missing), {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const response = await next();
  try {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  } catch {
    // Some responses (redirects) have immutable headers: copy them onto a new response.
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
});
