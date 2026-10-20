#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { isDailyRadarFileInRange, parseDateRangeArgs } from './radar-date-range.mjs';
import { V2_FROM, isRadarV2, inspectRadarV2, compareRadarV2 } from '../lib/radar-format.mjs';

const root = process.cwd();
const radarDir = path.join(root, 'src/content/radar');
const taxonomyPath = path.join(root, 'scripts/radar/taxonomy.json');
const taxonomy = JSON.parse(await readFile(taxonomyPath, 'utf8'));
const range = parseDateRangeArgs(process.argv, {
  from: taxonomy.publicationGate?.enforceDailyFrom ?? '9999-99-99',
  to: '9999-99-99',
});
const failures = [];
const v2Pairs = new Map();

const files = (await readdir(radarDir))
  .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.md$/.test(file))
  .filter((file) => isDailyRadarFileInRange(file, range))
  .sort();

for (const file of files) {
  const body = await readFile(path.join(radarDir, file), 'utf8');
  const lang = file.endsWith('.ja.md') ? 'ja' : 'zh';
  if (isRadarV2(body)) {
    failures.push(...inspectRadarV2(body).map((failure) => `${file}: ${failure}`));
    const date = file.match(/radar-(\d{4}-\d{2}-\d{2})/)[1];
    const pair = v2Pairs.get(date) ?? {};
    pair[lang] = body;
    v2Pairs.set(date, pair);
    continue;
  }
  if (file.match(/radar-(\d{4}-\d{2}-\d{2})/)[1] >= V2_FROM) {
    failures.push(`${file}: new daily reports require radarFormat: 2`);
  }
  const expected = taxonomy.daily?.[lang] ?? [];
  const headings = extractPublicSectionHeadings(body);

  if (headings.length !== expected.length) {
    failures.push(
      `${file}: has ${headings.length} public sections, expected ${expected.length}: ${expected.join(' | ')}`,
    );
    continue;
  }

  for (let index = 0; index < expected.length; index += 1) {
    if (headings[index] !== expected[index]) {
      failures.push(
        `${file}: section ${index + 1} is "${headings[index]}", expected "${expected[index]}"`,
      );
    }
  }
}

for (const [date, pair] of v2Pairs) {
  if (!pair.zh || !pair.ja) failures.push(`${date}: missing bilingual V2 report`);
  else if (!compareRadarV2(pair.zh, pair.ja))
    failures.push(`${date}: bilingual story/topic/channel/evidence/date/link order differs`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Checked radar schema in ${files.length} daily radar files.`);

function extractPublicSectionHeadings(body) {
  return [...body.matchAll(/^##\s+(.+)$/gm)]
    .map((match) => match[1].trim())
    .filter((heading) => !['本期范围', '対象範囲', '封面图说明', '代表图说明'].includes(heading));
}
