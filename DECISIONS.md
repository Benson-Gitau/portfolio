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

- The Keystatic production repo in `keystatic.config.ts` (`BennyGitau/portfolio`) is a stand-in until the GitHub repo exists.
- `site` in `astro.config.mjs` is a stand-in until `[SITE_URL]` is known.
- `npm audit` reports 2 moderate issues through `@keystatic/core` (`minimatch`). The only offered fix downgrades Keystatic to 0.0.46, so it is not applied. Keystatic's server code runs only on the admin route.
