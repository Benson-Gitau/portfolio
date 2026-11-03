// `npm run dev:cloud`: the dev server with Keystatic in Cloud mode instead of local mode, to test
// the Keystatic Cloud login and saving before deploying. Saving commits to GitHub, like production.
// Stop any running `npm run dev` first (Astro allows one dev server).
// Works the same on Windows, macOS and Linux. Extra arguments go to `astro dev`.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const astroBin = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const child = spawn(process.execPath, [astroBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_KEYSTATIC_STORAGE: 'cloud' },
});
child.on('exit', (code) => process.exit(code ?? 0));
