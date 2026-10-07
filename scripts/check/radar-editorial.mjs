#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { inspectRadarEditorial } from '../lib/radar-editorial-policy.mjs';

const policy = JSON.parse(await readFile('scripts/radar/editorial-policy.json', 'utf8'));
const taxonomy = JSON.parse(await readFile('scripts/radar/taxonomy.json', 'utf8'));
const files = (await readdir('src/content/radar')).filter((file) => file.endsWith('.md')).sort();
const failures = [];
for (const name of files) {
  const file = `src/content/radar/${name}`;
  try {
    failures.push(...inspectRadarEditorial(file, await readFile(file, 'utf8'), policy, taxonomy));
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked editorial privacy and daily section balance (enforced from ${policy.enforceFrom}); human evidence/source review is still required.`,
  );
}
