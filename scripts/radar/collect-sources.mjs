import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  discoveryTargets,
  validateRadarFeed,
  mergeDiscoveryCandidates,
} from '../lib/radar-feeds.mjs';

const args = process.argv.slice(2);
const date = args[args.indexOf('--date') + 1];
if (!args.includes('--date') || !/^\d{4}-\d{2}-\d{2}$/.test(date))
  throw new Error('--date YYYY-MM-DD required');
const pool = JSON.parse(await readFile('scripts/radar/source-pool.json', 'utf8'));
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
  futureCandidates = [];
const cutoffArg = args.includes('--cutoff')
  ? args[args.indexOf('--cutoff') + 1]
  : new Date().toISOString();
const cutoff = Date.parse(cutoffArg);
if (!Number.isFinite(cutoff)) throw new Error('--cutoff must be an ISO timestamp with timezone');
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
    if (validation)
      for (const item of result.feed.items.slice(0, 30)) {
        if (!item.link?.startsWith('https:') || !Number.isFinite(Date.parse(item.published)))
          continue;
        const story = {
          title: item.title,
          link: item.link,
          published: item.published,
          source: target.source,
          channels: [target.kind === 'podcast-rss' ? 'podcast' : target.channel],
        };
        if (Date.parse(item.published) > cutoff) {
          futureCandidates.push(story);
          continue;
        }
        candidates.push(story);
        for (const transcript of item.transcripts ?? []) {
          if (transcript.url?.startsWith('https:'))
            candidates.push({
              ...story,
              link: transcript.url,
              canonicalUrl: item.link,
              form: 'transcript',
            });
        }
      }
    results.push({
      source: target.source,
      role: target.role,
      url: target.url,
      reused,
      cacheFile: result.cacheFile,
      status: validation ? 'feed_verified' : 'needs_article_review',
      validation,
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
const output = `tmp/radar-${date}/discovery-index.json`;
await mkdir(`tmp/radar-${date}`, { recursive: true });
const stories = mergeDiscoveryCandidates(candidates);
await writeFile(
  output,
  JSON.stringify({ date, cutoff: cutoffArg, results, stories, futureCandidates }, null, 2) + '\n',
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
