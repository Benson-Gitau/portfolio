import { defineMiddleware } from 'astro:middleware';

/**
 * Only the Keystatic routes run on the Worker; every other page is a static file and never
 * reaches this code. In production every Keystatic response carries X-Robots-Tag: noindex.
 * Login is handled by Keystatic Cloud, so there are no secrets to check here.
 */
const isKeystatic = (path: string) => /^\/(api\/)?keystatic(\/|$)/.test(path);

export const onRequest = defineMiddleware(async (context, next) => {
  if (!import.meta.env.PROD || !isKeystatic(context.url.pathname)) return next();

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
