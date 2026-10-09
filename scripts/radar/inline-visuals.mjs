#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  insertVisuals,
  validateVisualManifest,
  visualFingerprint,
  visualBlock,
  reportEntries,
} from '../lib/radar-inline-visuals.mjs';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const check = args.includes('--check');
const dateAt = args.indexOf('--date');
const date = dateAt >= 0 ? args[dateAt + 1] : null;
if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Expected --date YYYY-MM-DD');
const manifestDir = 'scripts/radar/visuals';
const names = fs
  .readdirSync(manifestDir)
  .filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name) && (!date || name === `${date}.json`))
  .sort();
if (date && !names.length) throw new Error(`No reviewed manifest for ${date}`);
const plans = [],
  failures = [];
if (check && !date) {
  const policy = JSON.parse(fs.readFileSync('scripts/radar/visual-policy.json', 'utf8'));
  for (const name of fs.readdirSync('src/content/radar')) {
    const match = name.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})\.md$/);
    if (!match || match[1] < policy.requiredFromDate) continue;
    const source = fs.readFileSync(path.join('src/content/radar', name), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    if (!/^draft:\s*true\s*$/m.test(frontmatter) && !names.includes(`${match[1]}.json`))
      failures.push(`${name}: published daily report requires a reviewed inline visual manifest`);
  }
}
for (const name of names) {
  const manifest = JSON.parse(fs.readFileSync(path.join(manifestDir, name), 'utf8'));
  if (name !== `${manifest.date}.json`)
    failures.push(`${name}: manifest date does not match its filename`);
  failures.push(...validateVisualManifest(manifest).map((error) => `${name}: ${error}`));
  for (const visual of manifest.visuals ?? []) {
    const file = path.join('public', visual.asset ?? 'invalid');
    if (!fs.existsSync(file)) failures.push(`${name}: missing ${file}`);
    else if (visualFingerprint(fs.readFileSync(file)) !== visual.sha256)
      failures.push(`${name}: asset checksum mismatch ${file}`);
  }
  for (const locale of ['zh', 'ja']) {
    const file = `src/content/radar/daily-ai-radar-${manifest.date}${locale === 'ja' ? '.ja' : ''}.md`;
    if (!fs.existsSync(file)) {
      failures.push(`${name}: missing sibling ${file}`);
      continue;
    }
    const source = fs.readFileSync(file, 'utf8');
    try {
      if (check) {
        for (const visual of manifest.visuals) {
          const entries = reportEntries(source).filter(
            (entry) =>
              entry.heading === visual[locale].heading && entry.urls.includes(visual.sourceUrl),
          );
          if (entries.length !== 1 || !entries[0].block.includes(visualBlock(visual, locale)))
            failures.push(`${file}: missing/stale/misplaced ${visual.id}`);
        }
      } else plans.push({ file, source, output: insertVisuals(source, manifest, locale) });
    } catch (error) {
      failures.push(`${file}: ${error.message}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  for (const plan of plans)
    if (apply && plan.source !== plan.output) fs.writeFileSync(plan.file, plan.output);
  console.log(
    JSON.stringify({
      manifests: names.length,
      changedFiles: plans.filter((plan) => plan.source !== plan.output).length,
      mode: check ? 'check' : apply ? 'apply' : 'dry-run',
    }),
  );
}
