import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const radarDir = path.join(root, 'src/content/radar');
const enforceFromDate = parseFromDateArg() ?? '2026-05-23';
const sectionPattern = /^## 📬 Newsletter 精(?:选|選)\s*$/m;
const headingPattern = /^## /m;
const entryPattern = /^### /gm;
const linkPattern = /^-\s+(?:链接|リンク)：\s*(\S+)/gm;
const forbiddenPatterns = [
  /本期(?:贡献|采用|入选|检索到|主线)/,
  /本期は/,
  /採用(?:し|した|された|件)/,
  /homepage update/i,
  /来源分布|采集来源|其他入选条目|その他の items/,
  /mail\.google\.com|message id/i,
];

function extractNewsletterSection(body) {
  const match = sectionPattern.exec(body);
  if (!match) return null;

  const start = match.index;
  const rest = body.slice(start + match[0].length);
  const nextHeading = headingPattern.exec(rest);
  return nextHeading ? body.slice(start, start + match[0].length + nextHeading.index) : body.slice(start);
}

function normalize(value) {
  return value.trim().replace(/\/$/, '').toLowerCase();
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

function checkEntry(file, entry, index, failures) {
  const isJa = file.endsWith('.ja.md');
  const labels = isJa
    ? ['- 出典：', '- 日付：', '- リンク：', '- 要約：']
    : ['- 来源：', '- 日期：', '- 链接：', '- 摘要：'];

  for (const label of labels) {
    if (!entry.includes(label)) {
      failures.push(`${file}: newsletter entry ${index} missing ${label}`);
    }
  }
}

function checkSection(file, section, failures) {
  if ((section.match(sectionPattern) ?? []).length > 1) {
    failures.push(`${file}: multiple Newsletter section headings`);
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(section)) {
      failures.push(`${file}: forbidden newsletter wording matched ${pattern}`);
    }
  }

  const entryStarts = [...section.matchAll(entryPattern)].map((match) => match.index);
  if (entryStarts.length === 0) {
    failures.push(`${file}: Newsletter section has no ### entries`);
    return;
  }

  const beforeFirstEntry = section.slice(0, entryStarts[0]);
  if (/^-\s+/m.test(beforeFirstEntry)) {
    failures.push(`${file}: Newsletter section has source-summary bullets before entries`);
  }

  const titles = new Set();
  const links = new Map();
  for (let index = 0; index < entryStarts.length; index += 1) {
    const start = entryStarts[index];
    const end = entryStarts[index + 1] ?? section.length;
    const entry = section.slice(start, end);
    const firstLine = entry.split('\n')[0] ?? '';
    const title = normalize(firstLine.replace(/^###\s+/, ''));

    if (titles.has(title)) failures.push(`${file}: duplicate newsletter title "${firstLine}"`);
    titles.add(title);

    checkEntry(file, entry, index + 1, failures);
  }

  for (const match of section.matchAll(linkPattern)) {
    const link = normalize(match[1]);
    if (link === '暂无公开直链' || link === '公開版リンクなし') continue;
    links.set(link, (links.get(link) ?? 0) + 1);
  }
  for (const [link, count] of links.entries()) {
    if (count > 1) failures.push(`${file}: duplicate newsletter link "${link}"`);
  }
}

async function main() {
  const files = (await readdir(radarDir))
    .filter((file) => /^daily-ai-radar-\d{4}-\d{2}-\d{2}(\.ja)?\.md$/.test(file))
    .filter((file) => file.slice('daily-ai-radar-'.length, 'daily-ai-radar-'.length + 10) >= enforceFromDate)
    .sort();
  const failures = [];

  for (const file of files) {
    const fullPath = path.join(radarDir, file);
    const body = await readFile(fullPath, 'utf8');
    const section = extractNewsletterSection(body);
    if (!section) continue;
    checkSection(file, section, failures);
  }

  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }

  console.log(`Checked Newsletter sections in ${files.length} daily radar files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
