import fs from 'node:fs';
import path from 'node:path';

const contentRoot = path.join(process.cwd(), 'src', 'content');
const shouldFix = process.argv.includes('--fix');

const tagTranslations = new Map(
  Object.entries({
    'Anthropic/Academy': 'Anthropic Academy',
    课程笔记: '講座ノート',
    学习路线: '学習ルート',
    'AI/Fluency/框架': 'AI Fluency/フレームワーク',
    'AI/Fluency/基础': 'AI Fluency/基礎',
    'AI/Fluency/教学': 'AI Fluency/教育',
    'AI/Fluency/教育者': 'AI Fluency/教育者',
    'AI/Fluency/非营利': 'AI Fluency/非営利',
    'AI/Fluency/学生': 'AI Fluency/学生',
    'Claude/入门': 'Claude/入門',
    产品: 'プロダクト',
    开发者: '開発者',
    编程: 'Coding',
    教育: 'Education',
    非营利组织: 'Nonprofits',
    代理: 'Agents',
    '代理/Skills': 'Agents/Skills',
    '代理/子代理': 'Agents/Subagents',
    'MCP/入门': 'MCP/Getting Started',
    'MCP/生态': 'MCP/Ecosystem',
    'MCP/进阶': 'MCP/Advanced',
    GCP: 'Google Cloud',
  }),
);

function listMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '_sources') {
        return [];
      }

      return listMarkdownFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function parseTags(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/^tags:\n((?:  - .*\n)+)/m);

  if (!match) {
    return [];
  }

  return match[1]
    .trimEnd()
    .split('\n')
    .map((line) => line.replace(/^  -\s*/, '').trim())
    .map((value) => value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'));
}

function replaceTags(filePath, tags) {
  const text = fs.readFileSync(filePath, 'utf8');
  const tagsPattern = /^tags:\n(?:  - .*\n)+/m;
  const nextBlock =
    tags.length > 0 ? `tags:\n${tags.map((tag) => `  - ${JSON.stringify(tag)}`).join('\n')}\n` : '';
  const nextText = tagsPattern.test(text)
    ? text.replace(tagsPattern, nextBlock)
    : text.replace(/^(category: .*\n)/m, `$1${nextBlock}`);

  if (nextText === text) {
    return false;
  }

  fs.writeFileSync(filePath, nextText);
  return true;
}

function toJapaneseTags(tags) {
  return tags.map((tag) => tagTranslations.get(tag) ?? tag);
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

const zhFiles = listMarkdownFiles(contentRoot).filter((filePath) => !filePath.endsWith('.ja.md'));
const mismatches = [];
const untranslated = new Set();

for (const zhFile of zhFiles) {
  const jaFile = zhFile.replace(/\.md$/, '.ja.md');

  if (!fs.existsSync(jaFile)) {
    mismatches.push({ file: jaFile, reason: 'missing-ja-file' });
    continue;
  }

  const zhTags = parseTags(zhFile);
  const expectedTags = toJapaneseTags(zhTags);
  const actualTags = parseTags(jaFile);

  for (const tag of zhTags) {
    if (/[\p{Script=Han}]/u.test(tag) && !tagTranslations.has(tag)) {
      untranslated.add(tag);
    }
  }

  if (!arraysEqual(actualTags, expectedTags)) {
    mismatches.push({
      file: path.relative(process.cwd(), jaFile),
      reason: 'tag-mismatch',
      expectedTags,
      actualTags,
    });

    if (shouldFix) {
      replaceTags(jaFile, expectedTags);
    }
  }
}

if (untranslated.size > 0) {
  console.error(`Untranslated Chinese tags:\n${[...untranslated].sort().join('\n')}`);
  process.exitCode = 1;
}

if (mismatches.length > 0 && !shouldFix) {
  console.error(JSON.stringify(mismatches, null, 2));
  process.exitCode = 1;
} else {
  const verb = shouldFix ? 'fixed' : 'checked';
  console.log(
    `Bilingual tag parity ${verb}: ${mismatches.length} mismatch${mismatches.length === 1 ? '' : 'es'}.`,
  );
}
