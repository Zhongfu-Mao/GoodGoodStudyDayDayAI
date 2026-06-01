#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const radarDir = path.join(root, 'src/content/radar');
const sourcePoolPath = path.join(root, 'scripts/radar/source-pool.json');
const sourcePool = JSON.parse(await readFile(sourcePoolPath, 'utf8'));
const enforceFromDate = parseFromDateArg() ?? sourcePool.publicationGate?.enforceDailyFrom ?? '9999-99-99';
const enforceToDate = parseToDateArg() ?? '9999-99-99';
const lookbackDays = 7;
const failures = [];

const zhFiles = (await readdir(radarDir))
  .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}\.md$/.test(file))
  .sort();

const byDate = new Map();
for (const file of zhFiles) {
  const date = extractDate(file);
  const body = await readFile(path.join(radarDir, file), 'utf8');
  byDate.set(date, { file, links: extractLinks(body) });
}

for (const [date, current] of byDate.entries()) {
  if (date < enforceFromDate) continue;
  if (date > enforceToDate) continue;
  const currentDate = parseDate(date);
  const seen = new Map();

  for (const [otherDate, other] of byDate.entries()) {
    if (otherDate < enforceFromDate) continue;
    if (otherDate > enforceToDate) continue;
    const delta = daysBetween(parseDate(otherDate), currentDate);
    if (delta <= 0 || delta > lookbackDays) continue;
    for (const link of other.links) {
      seen.set(normalizeUrl(link), `${other.file}`);
    }
  }

  for (const link of current.links) {
    const normalized = normalizeUrl(link);
    const previousFile = seen.get(normalized);
    if (previousFile) {
      failures.push(
        `${current.file}: duplicate link from previous ${lookbackDays} days: ${link} (${previousFile})`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Checked radar dedupe for ${zhFiles.length} daily radar files.`);

function extractDate(file) {
  return file.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}

function parseFromDateArg() {
  const index = process.argv.indexOf('--from');
  const value = index === -1 ? '' : process.argv[index + 1];
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    console.error(`Invalid --from date: ${value}`);
    process.exit(1);
  }
  return value;
}

function parseToDateArg() {
  const index = process.argv.indexOf('--to');
  const value = index === -1 ? '' : process.argv[index + 1];
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    console.error(`Invalid --to date: ${value}`);
    process.exit(1);
  }
  return value;
}

function extractLinks(body) {
  const links = [];
  const pattern = /^-\s+链接：\s*(https?:\/\/\S+)$/gm;
  for (const match of body.matchAll(pattern)) {
    links.push(match[1].trim());
  }
  return links;
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  url.hostname = url.hostname.replace(/^www\./, '');
  return url.toString().replace(/\/$/, '');
}

function parseDate(date) {
  return new Date(`${date}T00:00:00Z`);
}

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
