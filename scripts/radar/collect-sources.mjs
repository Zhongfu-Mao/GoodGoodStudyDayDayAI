import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  discoveryTargets,
  validateRadarFeed,
  mergeDiscoveryCandidates,
  resolveDiscoveryWindow,
  selectFeedCandidates,
} from '../lib/radar-feeds.mjs';

const args = process.argv.slice(2);
const date = args[args.indexOf('--date') + 1];
if (!args.includes('--date') || !/^\d{4}-\d{2}-\d{2}$/.test(date))
  throw new Error('--date YYYY-MM-DD required');
const pool = JSON.parse(await readFile('scripts/radar/source-pool.json', 'utf8'));
const output = `tmp/radar-${date}/discovery-index.json`;
let previous, previousRaw;
try {
  previousRaw = await readFile(output, 'utf8');
  previous = JSON.parse(previousRaw);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const window = resolveDiscoveryWindow(date, {
  start: args.includes('--start') ? args[args.indexOf('--start') + 1] : undefined,
  cutoff: args.includes('--cutoff') ? args[args.indexOf('--cutoff') + 1] : undefined,
  previous,
});
const cacheDir = `tmp/radar-fetch/${date}`;
await mkdir(cacheDir, { recursive: true });
const cached = new Map();
for (const name of (await readdir(cacheDir)).sort()) {
  if (!name.endsWith('.json')) continue;
  try {
    const result = JSON.parse(await readFile(`${cacheDir}/${name}`, 'utf8'));
    if (result.ok) cached.set(result.requestedUrl, { ...result, cacheFile: `${cacheDir}/${name}` });
  } catch {
    /* incomplete cache is not success */
  }
}
const execute = promisify(execFile);
const results = [];
const candidates = [],
  futureCandidates = [],
  olderCandidates = [],
  dateUncertainCandidates = [];
const targets = discoveryTargets(pool, {
  includeLowFrequency: args.includes('--include-low-frequency'),
});
for (const target of targets) {
  try {
    let result = cached.get(target.url);
    const reused = Boolean(result);
    if (!result) {
      const { stdout } = await execute(
        process.execPath,
        ['scripts/radar/fetch-url.mjs', target.url, '--compact', '--cache-dir', cacheDir],
        { maxBuffer: 2_000_000 },
      );
      const compact = JSON.parse(stdout);
      result = {
        ...JSON.parse(await readFile(compact.cacheFile, 'utf8')),
        cacheFile: compact.cacheFile,
      };
    }
    const validation = ['rss', 'podcast-rss'].includes(target.kind)
      ? validateRadarFeed(result, { podcast: target.kind === 'podcast-rss' })
      : null;
    const selected = validation ? selectFeedCandidates(result, target, window) : null;
    if (selected) {
      candidates.push(...selected.stories);
      futureCandidates.push(...selected.futureCandidates);
      olderCandidates.push(...selected.olderCandidates);
      dateUncertainCandidates.push(...selected.dateUncertainCandidates);
    }
    results.push({
      source: target.source,
      role: target.role,
      url: target.url,
      reused,
      cacheFile: result.cacheFile,
      status: validation ? 'feed_verified' : 'needs_article_review',
      validation,
      rejectedEntries: selected?.rejectedEntries ?? [],
    });
  } catch (error) {
    results.push({
      source: target.source,
      url: target.url,
      status: 'needs_browser_or_fallback',
      reason: error.message.slice(0, 300),
    });
  }
}
// Browser and mail evidence are deliberately not fabricated by an HTTP collector.
for (const source of pool.activeCoreSources.filter((s) => s.access.primary.kind === 'chrome'))
  results.push({ source: source.name, status: 'browser_required', url: source.access.primary.url });
await mkdir(`tmp/radar-${date}`, { recursive: true });
if (previousRaw && !previous.window) {
  // Preserve the historical, potentially drifting index when adopting the fixed window.
  await writeFile(`${output}.before-fixed-window.json`, previousRaw, { flag: 'wx' }).catch(
    (error) => {
      if (error.code !== 'EEXIST') throw error;
    },
  );
}
const stories = mergeDiscoveryCandidates(candidates);
await writeFile(
  output,
  JSON.stringify(
    {
      date,
      window,
      cutoff: window.end,
      results,
      stories,
      futureCandidates,
      olderCandidates,
      dateUncertainCandidates,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    output,
    targets: results.length,
    verifiedFeeds: results.filter((r) => r.status === 'feed_verified').length,
    mergedStories: stories.length,
    futureCandidates: futureCandidates.length,
    requiresReview: true,
  }),
);
