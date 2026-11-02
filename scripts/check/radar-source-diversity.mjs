#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDailyRadarFileInRange, parseDateRangeArgs } from './radar-date-range.mjs';
import { isRadarV2, parseRadarV2 } from '../lib/radar-format.mjs';

if (isCliEntry()) {
  await main();
}

async function main() {
  const root = process.cwd();
  const radarDir = path.join(root, 'src/content/radar');
  const sourcePoolPath = path.join(root, 'scripts/radar/source-pool.json');

  const sourcePool = JSON.parse(await readFile(sourcePoolPath, 'utf8'));
  const gate = sourcePool.publicationGate ?? {};
  const range = parseDateRangeArgs(process.argv, {
    from: gate.enforceDailyFrom ?? '9999-99-99',
    to: '9999-99-99',
  });
  const failures = [];
  const warnings = [];

  checkSourcePoolConfig(sourcePool, failures);

  const files = (await readdir(radarDir))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}(?:\.ja)?\.md$/.test(file))
    .filter((file) => isDailyRadarFileInRange(file, range))
    .sort();

  const byDate = new Map();

  for (const file of files) {
    const fullPath = path.join(radarDir, file);
    const body = await readFile(fullPath, 'utf8');
    const groups = extractSourceGroups(body, sourcePool);
    const date = extractDate(file);
    const isJa = file.endsWith('.ja.md');

    failures.push(...evaluateRadarSourceDiversity({ file, body, sourcePool, groups, warnings }));

    const pair = byDate.get(date) ?? {};
    pair[isJa ? 'ja' : 'zh'] = { file, groups };
    byDate.set(date, pair);
  }

  for (const [date, pair] of byDate.entries()) {
    if (!pair.zh || !pair.ja) continue;
    const zhSequence = pair.zh.groups.map((group) => group.name).join('|');
    const jaSequence = pair.ja.groups.map((group) => group.name).join('|');
    if (zhSequence !== jaSequence) {
      failures.push(`${date}: zh/ja source order differs`);
    }
  }

  for (const warning of warnings) console.warn(`EDITORIAL REMINDER (non-blocking): ${warning}`);

  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log(`Checked radar source diversity in ${files.length} daily radar files.`);
}

/**
 * @param {{file:string, body:string, sourcePool:any,
 *   groups?:Array<{name:string, kind:string, label?:string}>|null, warnings?:string[]}} options
 */
export function evaluateRadarSourceDiversity({ file, body, sourcePool, groups = null, warnings = [] }) {
  const failures = [];
  checkFile(file, body, groups ?? extractSourceGroups(body, sourcePool), sourcePool, failures, warnings);
  return failures;
}

export function extractSourceGroups(body, sourcePool) {
  const sourceAliases = buildSourceAliases(sourcePool);
  if (isRadarV2(body)) {
    return parseRadarV2(body).items.map((item) => originalPublisher(item, sourceAliases));
  }
  const labels = extractSourceLabels(body);
  return labels.map((label) => classifySource(label, sourceAliases));
}

function buildSourceAliases(config) {
  const buckets = [
    ['trendSources', 'trend'],
    ['activeCoreSources', 'core'],
    ['officialConfirmationSources', 'official-triad'],
    ['supplementalDiscoverySources', 'supplemental'],
    ['canonicalConfirmationSources', 'canonical'],
  ];
  const aliases = [];

  for (const [bucket, kind] of buckets) {
    for (const source of config[bucket] ?? []) {
      aliases.push({
        name: source.name,
        kind,
        urls: [
          source.access?.primary,
          ...(source.access?.additionalFeeds ?? []),
          ...(source.access?.fallbacks ?? []),
        ]
          .map((access) => access?.url)
          .filter((url) => url?.startsWith('https://')),
        pattern: new RegExp(
          [source.name, ...(source.aliases ?? [])].map(escapeRegExp).join('|'),
          'i',
        ),
      });
    }
  }

  return aliases;
}

function originalPublisher(item, aliases) {
  const url = new URL(item.link);
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'github.com') {
    const owner = url.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
    return {
      name:
        owner && !['trending', 'topics', 'search'].includes(owner)
          ? `GitHub owner: ${owner}`
          : 'GitHub (publisher unresolved)',
      kind: 'canonical',
      label: item.source,
    };
  }
  if (['x.com', 'twitter.com'].includes(host)) {
    const author = url.pathname.split('/').filter(Boolean)[0]?.toLowerCase();
    return {
      name:
        author && !['i', 'home', 'search', 'explore'].includes(author)
          ? `X author: ${author}`
          : 'X (publisher unresolved)',
      kind: 'canonical',
      label: item.source,
    };
  }
  if (host === 'huggingface.co') {
    const org = url.pathname.match(/^\/blog\/([^/]+)\/[^/]+/i)?.[1];
    // A root-level Hub article does not establish an organisation from a product name.
    return {
      name: org ? `HF project team: ${org.toLowerCase()}` : 'Hugging Face (publisher unresolved)',
      kind: 'canonical',
      label: item.source,
    };
  }
  const owner = aliases.find((source) =>
    source.urls.some((value) => {
      const access = new URL(value);
      return access.hostname.replace(/^www\./, '') === host;
    }),
  );
  return { name: owner?.name ?? host, kind: owner?.kind ?? 'unknown', label: item.source };
}

function extractDate(file) {
  return file.match(/^daily-ai-radar-(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}

function extractSourceLabels(body) {
  const labels = [];
  const pattern = /^-\s+(?:来源|出典)：\s*(.+)$/gm;
  for (const match of body.matchAll(pattern)) {
    labels.push(match[1].trim());
  }
  return labels;
}

function classifySource(label, aliases) {
  for (const source of aliases) {
    if (source.pattern.test(label)) return { ...source, label };
  }

  return { name: normalizeLabel(label), kind: 'unknown', label };
}

function normalizeLabel(label) {
  return label
    .split(/\s*[/／]\s*/)[0]
    .replace(/\s+/g, ' ')
    .trim();
}

function checkFile(file, body, groups, sourcePool, fileFailures, warnings) {
  const gate = isRadarV2(body)
    ? { ...sourcePool.publicationGate, ...sourcePool.dailyV2Gate }
    : (sourcePool.publicationGate ?? {});
  const exception = findHistoricalException(sourcePool, file);
  const minimumEntries = gate.minimumEntries ?? 0;
  const minimumSourceFamilies = isRadarV2(body)
    ? Math.min(gate.minimumSourceFamilies ?? 0, groups.length)
    : (gate.minimumSourceFamilies ?? 0);
  const minimumCoreEntries = gate.minimumCoreEntries ?? 0;
  const minimumActiveCoreEntries = gate.minimumActiveCoreEntries ?? 0;
  const minimumNewsletterEntries = gate.minimumNewsletterEntries ?? 0;
  const smallIssueFloor = isRadarV2(body) ? 1 / Math.max(1, groups.length) : 0;
  const maxSingleFamilyShare = Math.max(gate.maxSingleFamilyShare ?? 1, smallIssueFloor);
  const maxOfficialTriadShare = Math.max(gate.maxOfficialTriadShare ?? 1, smallIssueFloor);
  const maxTrendShare = Math.max(gate.maxTrendShare ?? 1, smallIssueFloor);

  if (groups.length < minimumEntries) {
    fileFailures.push(`${file}: has ${groups.length} entries, expected at least ${minimumEntries}`);
  }

  const counts = new Map();
  let coreEntries = 0;
  let activeCoreEntries = 0;
  let officialTriadEntries = 0;
  let trendEntries = 0;
  let newsletterEntries = 0;
  for (const group of groups) {
    counts.set(group.name, (counts.get(group.name) ?? 0) + 1);
    if (['core', 'trend', 'official-triad'].includes(group.kind)) coreEntries += 1;
    if (group.kind === 'core') activeCoreEntries += 1;
    if (group.kind === 'official-triad') officialTriadEntries += 1;
    if (group.kind === 'trend') trendEntries += 1;
  }

  const newsletterBlock = extractNewsletterBlock(body);
  if (newsletterBlock) {
    newsletterEntries = (newsletterBlock.match(/^###\s+/gm) ?? []).length;
  }

  if (counts.size < minimumSourceFamilies) {
    fileFailures.push(
      `${file}: has ${counts.size} source groups, expected at least ${minimumSourceFamilies}`,
    );
  }

  if (coreEntries < minimumCoreEntries) {
    fileFailures.push(
      `${file}: has ${coreEntries} core/trend/official-triad source entries, expected at least ${minimumCoreEntries}`,
    );
  }

  if (
    activeCoreEntries < minimumActiveCoreEntries &&
    !exception?.skipChecks?.includes('minimumActiveCoreEntries')
  ) {
    fileFailures.push(
      `${file}: has ${activeCoreEntries} active-core source entries, expected at least ${minimumActiveCoreEntries}`,
    );
  }

  if (newsletterEntries < minimumNewsletterEntries) {
    fileFailures.push(
      `${file}: has ${newsletterEntries} Newsletter entries, expected at least ${minimumNewsletterEntries}`,
    );
  }

  const largest = Math.max(0, ...counts.values());
  const largestShare = groups.length === 0 ? 0 : largest / groups.length;
  if (largestShare > maxSingleFamilyShare) {
    const largestNames = [...counts].filter(([, count]) => count === largest).map(([name]) => name);
    warnings.push(
      `${file}: largest source group ${largestNames.join(' / ')} ${largest}/${groups.length} (${(largestShare * 100).toFixed(1)}%) exceeds reminder threshold ${(maxSingleFamilyShare * 100).toFixed(1)}%. Check for overlooked important candidates and whether vendor effectiveness claims are presented as independent evidence.`,
    );
  }

  const officialTriadShare = groups.length === 0 ? 0 : officialTriadEntries / groups.length;
  if (officialTriadShare > maxOfficialTriadShare) {
    warnings.push(
      `${file}: official-triad sources combined ${officialTriadEntries}/${groups.length} (${(officialTriadShare * 100).toFixed(1)}%) exceed reminder threshold ${(maxOfficialTriadShare * 100).toFixed(1)}%. Check for overlooked important candidates and whether vendor effectiveness claims are presented as independent evidence.`,
    );
  }

  const trendShare = groups.length === 0 ? 0 : trendEntries / groups.length;
  if (trendShare > maxTrendShare) {
    fileFailures.push(
      `${file}: trend source share ${(trendShare * 100).toFixed(1)}% exceeds ${(
        maxTrendShare * 100
      ).toFixed(1)}%`,
    );
  }

  // excludedActiveSources controls proactive collection, not citation rights.
  // Discovery evidence is reviewed privately; a publisher label cannot prove or
  // disprove how an item was discovered. No label-based waiver or fake core tag.
}

function findHistoricalException(sourcePool, file) {
  const date = extractDate(file);
  const locale = file.endsWith('.ja.md') ? 'ja' : 'zh';
  return (sourcePool.historicalExceptions ?? []).find((entry) => {
    if (entry.date !== date) return false;
    if (entry.locales && !entry.locales.includes(locale)) return false;
    return true;
  });
}

function extractNewsletterBlock(body) {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => /^##\s+📬\s+Newsletter/.test(line));
  if (start === -1) return '';

  const block = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    block.push(line);
  }

  return block.join('\n');
}

function checkSourcePoolConfig(config, configFailures) {
  const sourceBuckets = [
    'activeCoreSources',
    'officialConfirmationSources',
    'trendSources',
    'canonicalConfirmationSources',
    'supplementalDiscoverySources',
  ];

  for (const bucket of sourceBuckets) {
    for (const source of config[bucket] ?? []) {
      if (!source.name) {
        configFailures.push(`${bucket}: source is missing name`);
      }

      if (!hasUsableAccess(source.access)) {
        configFailures.push(`${bucket}: ${source.name ?? '(unnamed)'} is missing access.url/query`);
      }
    }
  }

  const officialNames = new Set(
    (config.officialConfirmationSources ?? []).map((source) => source.name),
  );
  for (const required of ['OpenAI', 'Anthropic', 'Google / Gemini / DeepMind']) {
    if (!officialNames.has(required)) {
      configFailures.push(`officialConfirmationSources: missing required source ${required}`);
    }
  }
}

function hasUsableAccess(access) {
  if (!access) return false;
  const candidates = [access.primary, ...(access.fallbacks ?? [])].filter(Boolean);
  return candidates.some((item) => {
    const value = item.url ?? item.query;
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCliEntry() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}
