import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.join('src', 'content', 'academy', 'openai-academy');
const publicRoot = path.join('public', 'images', 'academy', 'openai-academy', 'covers');
const remoteCoverPattern = /^coverImage:\s*["']?https?:\/\/[^\n"']+["']?/m;
const openAiLocalCoverPattern = /^coverImage:\s*["']?\/images\/academy\/openai-academy\/covers\/[^\n"']+["']?/m;
const remoteBodyImagePattern = /(!\[[^\]]*\]\()https:\/\/images\.ctfassets\.net[^)\s]+(\))/g;
const openAiLocalBodyImagePattern = /(!\[[^\]]*\]\()\/images\/academy\/openai-academy\/covers\/[^)\s]+(\))/g;

const palettes = [
  ['#07111f', '#0f766e', '#facc15', '#38bdf8'],
  ['#111827', '#2563eb', '#f97316', '#a7f3d0'],
  ['#0f172a', '#7c3aed', '#22c55e', '#f8fafc'],
  ['#102a43', '#0891b2', '#eab308', '#f8fafc'],
  ['#18181b', '#be123c', '#06b6d4', '#fef3c7'],
  ['#0c1b2a', '#4f46e5', '#14b8a6', '#fde68a'],
  ['#101827', '#0ea5e9', '#84cc16', '#f8fafc'],
  ['#172554', '#16a34a', '#f59e0b', '#dbeafe'],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(current) : [current];
  });
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function frontmatterValue(markdown, key) {
  const match = markdown.match(new RegExp(`^${key}:\\s*["']?([^\\n"']+)["']?`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function academyField(markdown, key) {
  const academyBlock = markdown.match(/^academy:\n([\s\S]*?)(?:\n[A-Za-z][\w-]*:|\n---)/m)?.[1] ?? '';
  const match = academyBlock.match(new RegExp(`^\\s+${key}:\\s*["']?([^\\n"']+)["']?`, 'm'));
  return match?.[1]?.trim() ?? '';
}

function isJapanese(markdownPath) {
  return markdownPath.endsWith('.ja.md');
}

function canonicalRelative(markdownPath) {
  return path
    .relative(contentRoot, markdownPath)
    .replace(/\.ja\.md$/, '.ja.svg')
    .replace(/\.md$/, '.svg');
}

function stripTitlePrefix(title) {
  return title
    .replace(/^OpenAI Academy\s*(?:笔记|ノート)?[:：]\s*/i, '')
    .replace(/^OpenAI Academyノート[:：]\s*/i, '')
    .trim();
}

function stripModuleOrder(module) {
  return module.replace(/^\d+(?:\.\d+)*\s+/, '').trim();
}

function hash(input) {
  let value = 2166136261;
  for (const char of input) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function measure(char) {
  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(char)) return 1.05;
  if (/[A-Z0-9]/.test(char)) return 0.72;
  if (/[a-z]/.test(char)) return 0.56;
  if (/\s/.test(char)) return 0.32;
  return 0.5;
}

function wrapText(text, maxUnits, maxLines) {
  const words = String(text).split(/(\s+)/).filter(Boolean);
  const lines = [];
  let line = '';
  let width = 0;

  const pushLine = () => {
    if (line.trim()) lines.push(line.trim());
    line = '';
    width = 0;
  };

  for (const word of words) {
    const wordWidth = [...word].reduce((sum, char) => sum + measure(char), 0);
    if (width > 0 && width + wordWidth > maxUnits) {
      pushLine();
    }

    if (wordWidth > maxUnits) {
      for (const char of word) {
        const charWidth = measure(char);
        if (width + charWidth > maxUnits) pushLine();
        line += char;
        width += charWidth;
      }
      continue;
    }

    line += word;
    width += wordWidth;
  }
  pushLine();

  if (lines.length <= maxLines) return lines;
  const trimmed = lines.slice(0, maxLines);
  trimmed[maxLines - 1] = `${trimmed[maxLines - 1].replace(/[,.，。:：;；\s]+$/, '')}...`;
  return trimmed;
}

function textLines(lines, x, y, size, weight = 500, fill = '#ffffff', gap = 1.22) {
  return lines
    .map((line, index) => {
      const yy = y + index * size * gap;
      return `<text x="${x}" y="${yy}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Avenir Next, Segoe UI, Noto Sans SC, Noto Sans JP, sans-serif">${escapeXml(line)}</text>`;
    })
    .join('\n  ');
}

function moduleLabel(relativePath, locale = 'zh') {
  const [section = '00-overview'] = relativePath.split(path.sep);
  const japaneseLabels = new Map([
    ['00-overview', '概要'],
    ['01-ai-fundamentals', 'AI 基礎'],
    ['02-using-chatgpt', 'ChatGPT 活用'],
    ['03-chatgpt-for-work', '業務活用'],
    ['03-codex', 'Codex'],
    ['04-building-with-ai', 'AI 開発'],
    ['04-chatgpt-for-education', '教育活用'],
    ['05-chatgpt-for-work', 'ChatGPT for Work'],
    ['05-codex', 'Codex'],
    ['06-chatgpt-for-education', '教育活用'],
    ['06-codex-for-work', 'Codex for Work'],
    ['07-building-with-ai', 'AI 開発'],
  ]);

  if (locale === 'ja' && japaneseLabels.has(section)) {
    return japaneseLabels.get(section);
  }

  const label = section
    .replace(/^\d+-/, '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return label
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bChatgpt\b/g, 'ChatGPT')
    .replace(/\bCodex\b/g, 'Codex')
    .replace(/\bApi\b/g, 'API');
}

function difficultyLabel(difficulty, locale = 'zh') {
  if (locale !== 'ja') return difficulty ? difficulty.toUpperCase() : 'LEARNING NOTE';

  const normalized = String(difficulty).toLowerCase();
  if (normalized === 'beginner') return '初級';
  if (normalized === 'intermediate') return '中級';
  if (normalized === 'advanced') return '上級';
  return '学習ノート';
}

function makeSvg({ relativePath, title, module, description, difficulty, locale }) {
  const id = hash(relativePath);
  const palette = palettes[id % palettes.length];
  const [bg1, bg2, accent, cool] = palette;
  const displayTitle =
    locale === 'ja'
      ? stripTitlePrefix(title) || stripModuleOrder(module) || 'OpenAI Academy'
      : stripModuleOrder(module) || stripTitlePrefix(title) || 'OpenAI Academy';
  const subtitle = stripTitlePrefix(title);
  const topic = moduleLabel(relativePath, locale);
  const headline = wrapText(displayTitle, 12, 3);
  const headlineSize = headline.length > 2 ? 58 : 66;
  const subtitleY = 330 + headline.length * headlineSize * 1.16 + 42;
  const subtitleLines = wrapText(subtitle && subtitle !== displayTitle ? subtitle : description, 20, 2);
  const note = wrapText(description, 24, 2);
  const pill = difficultyLabel(difficulty, locale);
  const footer =
    locale === 'ja'
      ? 'Good Good Study, Day Day AI · オリジナルローカルカバー'
      : 'Good Good Study, Day Day AI · original local cover';
  const nodeShift = id % 120;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(displayTitle)}</title>
  <desc id="desc">Original local cover for ${escapeXml(topic)} in Good Good Study, Day Day AI.</desc>
  <defs>
    <linearGradient id="bg" x1="120" y1="80" x2="1480" y2="850" gradientUnits="userSpaceOnUse">
      <stop stop-color="${bg1}"/>
      <stop offset="0.55" stop-color="${bg2}"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="scan" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1230 220) rotate(132) scale(540 540)">
      <stop stop-color="${cool}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${cool}" stop-opacity="0"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="28" stdDeviation="28" flood-color="#020617" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="1600" height="900" rx="52" fill="url(#bg)"/>
  <rect x="52" y="50" width="1496" height="800" rx="42" fill="#ffffff" fill-opacity="0.055" stroke="#ffffff" stroke-opacity="0.18"/>
  <circle cx="1230" cy="220" r="430" fill="url(#scan)"/>
  <path d="M1032 ${128 + nodeShift * 0.15}C1198 214 1306 372 1376 610" stroke="${cool}" stroke-opacity="0.24" stroke-width="3" stroke-dasharray="12 18"/>
  <path d="M1014 ${196 + nodeShift * 0.1}C1164 276 1262 416 1326 620" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="8 16"/>
  <g opacity="0.18">
    <path d="M118 232H622M118 302H548M118 372H666M118 442H506" stroke="#ffffff" stroke-width="2"/>
    <path d="M1450 132V310M1392 132V256M1334 132V348" stroke="#ffffff" stroke-width="2"/>
  </g>
  <g filter="url(#softShadow)">
    <rect x="940" y="210" width="420" height="430" rx="34" fill="#020617" fill-opacity="0.42" stroke="#ffffff" stroke-opacity="0.18"/>
    <rect x="1004" y="282" width="292" height="42" rx="14" fill="${accent}" fill-opacity="0.88"/>
    <rect x="1004" y="360" width="236" height="28" rx="10" fill="#ffffff" fill-opacity="0.18"/>
    <rect x="1004" y="414" width="284" height="28" rx="10" fill="#ffffff" fill-opacity="0.18"/>
    <rect x="1004" y="468" width="200" height="28" rx="10" fill="#ffffff" fill-opacity="0.18"/>
    <path d="M1050 574C1120 498 1180 510 1242 438" stroke="${cool}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="1050" cy="574" r="16" fill="${accent}"/>
    <circle cx="1142" cy="506" r="16" fill="${cool}"/>
    <circle cx="1242" cy="438" r="16" fill="#ffffff"/>
  </g>
  <rect x="120" y="118" width="332" height="46" rx="23" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.15"/>
  <text x="148" y="149" fill="#f8fafc" font-size="22" font-weight="700" font-family="Avenir Next, Segoe UI, Noto Sans SC, Noto Sans JP, sans-serif" letter-spacing="4">OPENAI ACADEMY</text>
  <text x="120" y="228" fill="${cool}" font-size="29" font-weight="650" font-family="Avenir Next, Segoe UI, Noto Sans SC, Noto Sans JP, sans-serif">${escapeXml(topic)}</text>
  ${textLines(headline, 120, 330, headlineSize, 760, '#ffffff', 1.16)}
  ${textLines(subtitleLines, 124, subtitleY, 30, 540, '#dbeafe')}
  <rect x="120" y="690" width="690" height="86" rx="26" fill="#020617" fill-opacity="0.30" stroke="#ffffff" stroke-opacity="0.15"/>
  ${textLines(note, 154, 730, 24, 520, '#e2e8f0', 1.28)}
  <rect x="1002" y="700" width="250" height="58" rx="20" fill="${accent}" fill-opacity="0.90"/>
  <text x="1032" y="738" fill="#020617" font-size="24" font-weight="800" font-family="Avenir Next, Segoe UI, Noto Sans SC, Noto Sans JP, sans-serif">${escapeXml(pill)}</text>
  <text x="122" y="828" fill="#ffffff" fill-opacity="0.50" font-size="22" font-family="Avenir Next, Segoe UI, Noto Sans SC, Noto Sans JP, sans-serif">${escapeXml(footer)}</text>
</svg>
`;
}

function main() {
  const markdownFiles = walk(contentRoot)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
  const coverInputs = new Map();
  let updated = 0;

  for (const file of markdownFiles) {
    const markdown = fs.readFileSync(file, 'utf8');
    const relative = canonicalRelative(file);
    const coverPath = `/images/academy/openai-academy/covers/${relative.split(path.sep).join('/')}`;
    const frontmatterUpdated = remoteCoverPattern.test(markdown)
      ? markdown.replace(remoteCoverPattern, `coverImage: "${coverPath}"`)
      : markdown.replace(openAiLocalCoverPattern, `coverImage: "${coverPath}"`);
    const nextMarkdown = frontmatterUpdated
      .replace(remoteBodyImagePattern, `$1${coverPath}$2`)
      .replace(openAiLocalBodyImagePattern, `$1${coverPath}$2`);

    if (nextMarkdown !== markdown && nextMarkdown.includes(`coverImage: "${coverPath}"`)) {
      fs.writeFileSync(file, nextMarkdown);
      updated += 1;
    }

    if (!coverInputs.has(relative)) {
      coverInputs.set(relative, {
        relativePath: relative,
        title: frontmatterValue(markdown, 'title'),
        description: frontmatterValue(markdown, 'description'),
        difficulty: frontmatterValue(markdown, 'difficulty'),
        module: academyField(markdown, 'module'),
        locale: isJapanese(file) ? 'ja' : 'zh',
      });
    }
  }

  for (const [relative, input] of coverInputs) {
    const outPath = path.join(publicRoot, relative);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, makeSvg(input));
  }

  console.log(`Updated ${updated} Markdown files.`);
  console.log(`Generated ${coverInputs.size} local OpenAI Academy cover SVGs.`);
}

main();
