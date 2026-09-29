import { readdir, readFile, writeFile, mkdir, rename, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  monthCutoff,
  shouldArchiveMedia,
  LOCAL_MEDIA_PATTERN,
  rewriteMediaReferences,
} from '../lib/media-retention.mjs';
import { hashR2File } from '../lib/r2.mjs';
import { updateFrontmatterValue } from '../lib/frontmatter.mjs';

async function filesUnder(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await filesUnder(file)));
    else if (/\.(md|mdx)$/.test(file)) result.push(file);
  }
  return result;
}

export async function cutover(argv = process.argv.slice(2)) {
  const opts = { apply: false, manifest: '', asOf: '', publicBase: '' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') opts.apply = true;
    else if (argv[i] === '--manifest') opts.manifest = argv[++i];
    else if (argv[i] === '--as-of') opts.asOf = argv[++i];
    else if (argv[i] === '--public-base') opts.publicBase = argv[++i];
    else throw new Error(`Unknown option ${argv[i]}`);
  }
  if (!opts.manifest || !opts.asOf || !opts.publicBase)
    throw new Error('Require --manifest, --as-of and --public-base');
  const base = new URL(opts.publicBase);
  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== '/'
  )
    throw new Error('Require a plain HTTPS public origin');
  const cutoff = monthCutoff(opts.asOf);
  const manifest = JSON.parse(await readFile(opts.manifest, 'utf8'));
  if (manifest.mode !== 'private-staging' || manifest.status !== 'complete' || !manifest.verifiedAt)
    throw new Error('Require independently verified staging manifest');
  const sources = new Map();
  const latest = new Map();
  for (const file of await filesUnder('src/content')) {
    const source = await readFile(file, 'utf8');
    sources.set(file, source);
    const date = source.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    for (const match of source.matchAll(LOCAL_MEDIA_PATTERN)) {
      const asset = `public${match[0]}`;
      if (!date) throw new Error(`Undated media reference in ${file}`);
      if (!latest.has(asset) || latest.get(asset) < date) latest.set(asset, date);
    }
  }
  const assets = manifest.assets.filter((a) =>
    shouldArchiveMedia(a.file, latest.get(a.file), cutoff),
  );
  const urls = new Map(assets.map((a) => [a.file, `${base.origin}/${a.key}`]));
  const updates = new Map();
  for (const [file, source] of sources) {
    let updated = rewriteMediaReferences(source, urls);
    const audio = source.match(/^audioUrl:\s*["']?(\/audio\/radar\/[^\s"']+)/m)?.[1];
    const record = assets.find((a) => a.file === `public${audio}`);
    if (record) updated = updateFrontmatterValue(updated, 'audioSize', record.size);
    if (source !== updated) updates.set(file, updated);
  }
  const summary = {
    asOf: opts.asOf,
    cutoff,
    files: assets.length,
    bytes: assets.reduce((n, a) => n + a.size, 0),
    contentFiles: updates.size,
    retained: manifest.assets.length - assets.length,
  };
  console.log(JSON.stringify(summary));
  const backup = path.resolve(`.cache/r2-cutover/${opts.asOf}`);
  if (!opts.apply) return summary;
  // Complete all checks before touching source or moving any original.
  for (const asset of assets) {
    if (
      !/^public\/(audio|decks|images)\/radar\/[\w.-]+$/.test(asset.file) ||
      !/^(audio|decks|images)\/radar\/[\w.-]+$/.test(asset.key)
    )
      throw new Error('Unsafe manifest path');
    const digest = await hashR2File(asset.file);
    if (digest.sha256 !== asset.sha256 || digest.size !== asset.size)
      throw new Error(`Local asset changed: ${asset.file}`);
    try {
      await access(path.join(backup, asset.file));
      throw new Error(`Backup already exists: ${asset.file}`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  let next = 0;
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (next < assets.length) {
        const a = assets[next++];
        const response = await fetch(urls.get(a.file), {
          method: 'HEAD',
          headers: { Origin: 'https://zhongfu-mao.github.io' },
          signal: AbortSignal.timeout(30000),
        });
        if (
          response.status !== 200 ||
          Number(response.headers.get('content-length')) !== a.size ||
          response.headers.get('etag')?.replaceAll('"', '') !== a.md5 ||
          response.headers.get('access-control-allow-origin') !== 'https://zhongfu-mao.github.io'
        )
          throw new Error(`Public verification failed: ${a.key} (${response.status})`);
      }
    }),
  );
  await mkdir(backup, { recursive: true });
  await writeFile(
    path.join(backup, 'record.json'),
    JSON.stringify(
      { ...summary, publicBase: base.origin, assets, sources: Object.fromEntries(sources) },
      null,
      2,
    ),
  );
  for (const [file, updated] of updates) await writeFile(file, updated);
  for (const a of assets) {
    const destination = path.join(backup, a.file);
    await mkdir(path.dirname(destination), { recursive: true });
    await rename(a.file, destination);
  }
  await writeFile(
    path.join(backup, 'complete.json'),
    JSON.stringify({ ...summary, completedAt: new Date().toISOString() }, null, 2),
  );
  console.log(`Cutover complete. Original media and content snapshots retained at ${backup}`);
  return summary;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  cutover().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
