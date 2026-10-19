// Verifies every `url` in icons.json: https only, locale-free, and 200 after redirects.
// Usage: node scripts/check-urls.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TIMEOUT_MS = 10_000;
const CONCURRENCY = 3;
const MAX_ATTEMPTS = 4;
const LOCALE = /^\/[a-z]{2}(-[a-z]{2,4})?(\/|$)/i;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { icons } = JSON.parse(readFileSync(join(root, 'icons.json'), 'utf8'));
const entries = icons.filter(i => i.url);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchOnce(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; icon-url-check)' },
  });
  await res.arrayBuffer();
  return res;
}

// Retries only transient failures (429, 5xx, network); a 404 is final.
async function check(entry) {
  const problems = [];
  let u;
  try {
    u = new URL(entry.url);
  } catch {
    return { entry, problems: ['not a valid URL'] };
  }
  if (u.protocol !== 'https:') problems.push('not https');
  if (LOCALE.test(u.pathname)) problems.push('carries a locale segment');

  let status = 'error';
  let finalUrl = entry.url;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchOnce(entry.url);
      status = res.status;
      finalUrl = res.url;
      if (status !== 429 && status < 500) break;
    } catch (err) {
      status = err.name === 'TimeoutError' ? 'timeout' : 'error';
    }
    if (attempt < MAX_ATTEMPTS) await sleep(2000 * attempt);
  }
  if (status !== 200) problems.push(`status ${status}`);
  return { entry, problems, status, finalUrl };
}

const results = [];
let next = 0;
async function worker() {
  while (next < entries.length) {
    results.push(await check(entries[next++]));
    await sleep(250);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const failed = results.filter(r => r.problems.length);
// Locale-only redirects (learn.microsoft.com adds /en-us/) are expected; anything else is reported.
const stripLocale = s => {
  const x = new URL(s);
  return (x.host + x.pathname.replace(LOCALE, '/')).replace(/\/$/, '').toLowerCase();
};
const moved = results.filter(
  r => !r.problems.length && stripLocale(r.finalUrl) !== stripLocale(r.entry.url),
);

for (const r of failed) console.error(`FAIL ${r.entry.id}: ${r.entry.url} (${r.problems.join(', ')})`);
for (const r of moved) console.log(`MOVED ${r.entry.id}: ${r.entry.url} -> ${r.finalUrl}`);
console.log(
  `Checked ${entries.length} urls (${icons.length - entries.length} icons without one): ` +
    `${entries.length - failed.length} ok, ${failed.length} failed, ${moved.length} redirected beyond locale`,
);
process.exit(failed.length ? 1 : 0);
