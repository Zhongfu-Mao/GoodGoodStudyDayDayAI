#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { XMLParser } from 'fast-xml-parser';
import { parse as parseYaml } from 'yaml';
import { parseFrontmatter } from '../lib/frontmatter.mjs';
import { withBasePath } from '../lib/base-path.mjs';

const root = process.cwd();
const radarDir = path.join(root, 'src', 'content', 'radar');
const distDir = path.join(root, 'dist');

const date = getArg('--date') ?? (await getLatestDailyDate());
assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Expected a daily report date');
const slug = `daily-ai-radar-${date}`;

for (const locale of ['zh', 'ja']) {
  const prefix = locale === 'ja' ? 'ja/' : '';
  const report = await readReport(`${slug}${locale === 'ja' ? '.ja' : ''}.md`);
  assert.notEqual(report.draft, true, `${locale} report is still a draft`);
  assert.equal(report.lang, locale, `${locale} report language mismatch`);
  assert.ok(typeof report.audioUrl === 'string' && report.audioUrl, `${locale} audioUrl required`);
  const audioUrl = withBasePath(report.audioUrl);
  await assertContains(path.join(distDir, prefix, 'radar', slug, 'index.html'), [
    audioUrl.replaceAll('&', '&amp;'),
  ]);
  await assertEpisode(path.join(distDir, prefix, 'feed.xml'), `/${prefix}radar/${slug}/`, {
    ...report,
    audioUrl,
  });
}
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

  for (const candidate of dates.reverse()) {
    const report = await readReport(`daily-ai-radar-${candidate}.md`);
    if (report.draft !== true) return candidate;
  }
  throw new Error(`No published daily radar Markdown files found in ${radarDir}.`);
}

async function readReport(fileName) {
  return parseYaml(parseFrontmatter(await readFile(path.join(radarDir, fileName), 'utf8')).raw);
}

async function assertEpisode(filePath, route, report) {
  await assertFile(filePath);
  const channel = new XMLParser({ ignoreAttributes: false, parseTagValue: false }).parse(
    await readFile(filePath, 'utf8'),
  ).rss?.channel;
  assert.ok(channel, `${path.relative(root, filePath)} has no RSS channel`);
  const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
  const episodes = items.filter((item) => {
    try {
      return new URL(item.link, channel.link).pathname.endsWith(route);
    } catch {
      return false;
    }
  });
  assert.equal(episodes.length, 1, `Expected exactly one feed episode for ${route}`);
  const enclosure = episodes[0].enclosure;
  assert.ok(enclosure, `Missing enclosure for ${route}`);
  const expectedUrl = new URL(report.audioUrl, channel.link).href;
  assert.equal(enclosure['@_url'], expectedUrl, `Feed audio URL mismatch for ${route}`);
  assert.equal(enclosure['@_type'], 'audio/mpeg', `Feed audio MIME mismatch for ${route}`);
  for (const [field, actual] of [
    ['audioSize', enclosure['@_length']],
    ['audioDuration', episodes[0]['itunes:duration']],
  ]) {
    assert.ok(Number(report[field]) > 0, `${field} required for ${route}`);
    assert.equal(Number(actual), Number(report[field]), `Feed ${field} mismatch for ${route}`);
  }
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
