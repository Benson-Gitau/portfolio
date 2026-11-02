import { config, fields, singleton } from '@keystatic/core';

// Local files in development, GitHub in production (docs/build-spec.md).
// The full content model arrives in Phase 3.
export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: 'BennyGitau/portfolio' }
    : { kind: 'local' },
  singletons: {
    settings: singleton({
      label: 'Settings',
      path: 'src/content/settings',
      schema: {
        siteUrl: fields.text({ label: 'Site URL' }),
      },
    }),
  },
});
