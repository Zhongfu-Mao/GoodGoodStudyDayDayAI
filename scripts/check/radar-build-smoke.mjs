#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const radarDir = path.join(root, 'src', 'content', 'radar');
const distDir = path.join(root, 'dist');

const date = getArg('--date') ?? (await getLatestDailyDate());
const slug = `daily-ai-radar-${date}`;

await assertFile(path.join(distDir, 'radar', slug, 'index.html'));
await assertFile(path.join(distDir, 'ja', 'radar', slug, 'index.html'));

await assertContains(path.join(distDir, 'feed.xml'), [slug, `/audio/radar/${slug}.mp3`]);
await assertContains(path.join(distDir, 'ja', 'feed.xml'), [slug, `/audio/radar/${slug}.ja.mp3`]);
await assertSitemapContains([`/radar/${slug}/`, `/ja/radar/${slug}/`]);

console.log(`Radar build smoke check passed for ${date}.`);

function getArg(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(name);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];

  return undefined;
}

async function getLatestDailyDate() {
  const files = await readdir(radarDir);
  const dates = files
    .map((fileName) => fileName.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})\.md$/)?.[1])
    .filter(Boolean)
    .sort();

  const latest = dates.at(-1);
  if (!latest) {
    throw new Error(`No daily radar Markdown files found in ${radarDir}.`);
  }

  return latest;
}

async function assertFile(filePath) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Missing expected build output: ${path.relative(root, filePath)}`);
  }
}

async function assertContains(filePath, needles) {
  await assertFile(filePath);
  const content = await readFile(filePath, 'utf8');
  const missing = needles.filter((needle) => !content.includes(needle));

  if (missing.length > 0) {
    throw new Error(
      `${path.relative(root, filePath)} is missing expected content: ${missing.join(', ')}`,
    );
  }
}

async function assertSitemapContains(needles) {
  const files = (await readdir(distDir))
    .filter((fileName) => /^sitemap-\d+\.xml$/.test(fileName))
    .map((fileName) => path.join(distDir, fileName));

  if (files.length === 0) {
    throw new Error('No sitemap-*.xml files found in dist.');
  }

  const sitemapText = (await Promise.all(files.map((filePath) => readFile(filePath, 'utf8')))).join(
    '\n',
  );
  const missing = needles.filter((needle) => !sitemapText.includes(needle));

  if (missing.length > 0) {
    throw new Error(`Sitemap is missing expected radar routes: ${missing.join(', ')}`);
  }
}
